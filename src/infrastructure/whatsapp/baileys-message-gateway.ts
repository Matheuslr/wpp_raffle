import {
  extractMessageContent,
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState,
  type BaileysEventMap,
  type WAMessage,
  type WASocket
} from "@whiskeysockets/baileys";
import type { ExecuteDrawDependencies } from "../../application/execute-draw.js";
import { executeDrawUseCase } from "../../application/execute-draw.js";
import type {
  IncomingMessage,
  MessageGateway,
  OutboundMessage
} from "../../application/ports/message-gateway.js";
import { handleIncomingMessage } from "../../presentation/handle-incoming-message.js";

export interface BaileysGatewayOptions {
  readonly authDirectory: string;
  readonly authorizedGroupIds: ReadonlySet<string>;
  readonly executeDrawDependencies: ExecuteDrawDependencies;
  readonly allowOwnMessages?: boolean;
}

export class BaileysMessageGateway implements MessageGateway {
  public constructor(private readonly socket: WASocket) {}

  public async sendTextMessage(message: OutboundMessage): Promise<void> {
    await this.socket.sendMessage(message.chatId, { text: message.text });
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

  return gateway;
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
