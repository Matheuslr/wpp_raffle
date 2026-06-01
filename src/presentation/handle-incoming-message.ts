import type { IncomingMessage, MessageGateway } from "../application/ports/message-gateway.js";

export interface HandleIncomingMessageDependencies {
  readonly authorizedGroupIds: ReadonlySet<string>;
  readonly gateway: MessageGateway;
  readonly executeDraw: (rawMessage: string) => Promise<string>;
}

export async function handleIncomingMessage(
  message: IncomingMessage,
  dependencies: HandleIncomingMessageDependencies
): Promise<void> {
  if (message.fromMe || !message.isGroup || !dependencies.authorizedGroupIds.has(message.chatId)) {
    return;
  }

  if (!startsWithDrawCommand(message.text)) {
    return;
  }

  const response = await dependencies.executeDraw(message.text);
  await dependencies.gateway.sendTextMessage({
    chatId: message.chatId,
    text: response
  });
}

function startsWithDrawCommand(text: string): boolean {
  const firstMeaningfulLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  return firstMeaningfulLine === "!sortear";
}
