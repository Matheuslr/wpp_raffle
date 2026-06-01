import {
  extractMessageContent,
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState,
  type BaileysEventMap,
  type ConnectionState,
  type WAMessage,
  type WASocket
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import type { ExecuteDrawDependencies } from "../../application/execute-draw.js";
import { executeDrawUseCase } from "../../application/execute-draw.js";
import type {
  IncomingMessage,
  MessageGateway,
  OutboundMessage
} from "../../application/ports/message-gateway.js";
import { handleIncomingMessage } from "../../presentation/handle-incoming-message.js";
import { shouldReconnectAfterClose } from "./baileys-connection-policy.js";

export interface BaileysGatewayOptions {
  readonly authDirectory: string;
  readonly authorizedGroupIds: ReadonlySet<string>;
  readonly executeDrawDependencies: ExecuteDrawDependencies;
  readonly allowOwnMessages?: boolean;
  readonly onRecoverableDisconnect?: () => void;
}

export class BaileysMessageGateway implements MessageGateway {
  public constructor(private readonly socket: WASocket) {}

  public async sendTextMessage(message: OutboundMessage): Promise<void> {
    await this.socket.sendMessage(message.chatId, { text: message.text });
  }

  public close(): void {
    this.socket.end(new Error("Gateway shutdown requested."));
  }
}

export async function startBaileysMessageGateway(
  options: BaileysGatewayOptions
): Promise<BaileysMessageGateway> {
  const { state, saveCreds } = await useMultiFileAuthState(options.authDirectory);
  const { version } = await fetchLatestBaileysVersion();
  const socket = makeWASocket({
    auth: state,
    markOnlineOnConnect: false,
    shouldSyncHistoryMessage: () => false,
    version
  });
  const gateway = new BaileysMessageGateway(socket);

  socket.ev.on("creds.update", saveCreds);
  socket.ev.on("messages.upsert", async (event) => {
    await handleMessages(event, gateway, options);
  });
  socket.ev.on("connection.update", (update) => {
    handleConnectionUpdate(update, options);
  });

  return gateway;
}

function handleConnectionUpdate(
  update: Partial<ConnectionState>,
  options: BaileysGatewayOptions
): void {
  if (update.qr) {
    console.info("WhatsApp QR code received. Scan it from the container logs:");
    qrcode.generate(update.qr, { small: true });
  }

  if (update.connection !== "close") {
    return;
  }

  if (shouldReconnectAfterClose(update.lastDisconnect?.error)) {
    console.info("WhatsApp connection closed recoverably. Scheduling reconnect.");
    options.onRecoverableDisconnect?.();
    return;
  }

  console.error(
    "WhatsApp connection closed with a terminal session error. Re-authentication is required."
  );
}

async function handleMessages(
  event: BaileysEventMap["messages.upsert"],
  gateway: MessageGateway,
  options: BaileysGatewayOptions
): Promise<void> {
  for (const baileysMessage of event.messages) {
    const message = toIncomingMessage(baileysMessage);

    if (!message) {
      continue;
    }

    await handleIncomingMessage(message, {
      allowOwnMessages: options.allowOwnMessages,
      authorizedGroupIds: options.authorizedGroupIds,
      gateway,
      executeDraw: (rawMessage) => executeDrawUseCase(rawMessage, options.executeDrawDependencies)
    });
  }
}

function toIncomingMessage(message: WAMessage): IncomingMessage | null {
  const chatId = message.key.remoteJid;

  if (!chatId) {
    return null;
  }

  const text = extractText(message);

  if (!text) {
    return null;
  }

  return {
    chatId,
    text,
    fromMe: message.key.fromMe === true,
    isGroup: chatId.endsWith("@g.us")
  };
}

function extractText(message: WAMessage): string | null {
  const content = extractMessageContent(message.message);

  return content?.conversation ?? content?.extendedTextMessage?.text ?? null;
}
