export interface IncomingMessage {
  readonly chatId: string;
  readonly text: string;
  readonly fromMe: boolean;
  readonly isGroup: boolean;
}

export interface OutboundMessage {
  readonly chatId: string;
  readonly text: string;
}

export interface MessageGateway {
  sendTextMessage(message: OutboundMessage): Promise<void>;
}
