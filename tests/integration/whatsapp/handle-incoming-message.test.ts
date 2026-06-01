import { describe, expect, it } from "vitest";

import { handleIncomingMessage } from "../../../src/presentation/handle-incoming-message.js";
import type {
  IncomingMessage,
  MessageGateway,
  OutboundMessage
} from "../../../src/application/ports/message-gateway.js";

class FakeGateway implements MessageGateway {
  public readonly sentMessages: OutboundMessage[] = [];

  public async sendTextMessage(message: OutboundMessage): Promise<void> {
    this.sentMessages.push(message);
  }
}

describe("handleIncomingMessage", () => {
  it("routes authorized group draw commands to the use case", async () => {
    const gateway = new FakeGateway();
    const calls: string[] = [];

    await handleIncomingMessage(createMessage({ text: "!sortear\n\nLista\nJoão\n\nSierra: 1" }), {
      authorizedGroupIds: new Set(["authorized-group"]),
      gateway,
      executeDraw: async (rawMessage) => {
        calls.push(rawMessage);
        return "draw response";
      }
    });

    expect(calls).toEqual(["!sortear\n\nLista\nJoão\n\nSierra: 1"]);
    expect(gateway.sentMessages).toEqual([{ chatId: "authorized-group", text: "draw response" }]);
  });

  it("ignores messages from unauthorized groups", async () => {
    const gateway = new FakeGateway();
    let called = false;

    await handleIncomingMessage(createMessage({ chatId: "other-group" }), {
      authorizedGroupIds: new Set(["authorized-group"]),
      gateway,
      executeDraw: async () => {
        called = true;
        return "draw response";
      }
    });

    expect(called).toBe(false);
    expect(gateway.sentMessages).toEqual([]);
  });

  it("ignores messages sent by the bot itself", async () => {
    const gateway = new FakeGateway();
    let called = false;

    await handleIncomingMessage(createMessage({ fromMe: true }), {
      authorizedGroupIds: new Set(["authorized-group"]),
      gateway,
      executeDraw: async () => {
        called = true;
        return "draw response";
      }
    });

    expect(called).toBe(false);
    expect(gateway.sentMessages).toEqual([]);
  });

  it("ignores messages without the draw command", async () => {
    const gateway = new FakeGateway();
    let called = false;

    await handleIncomingMessage(createMessage({ text: "Olá grupo" }), {
      authorizedGroupIds: new Set(["authorized-group"]),
      gateway,
      executeDraw: async () => {
        called = true;
        return "draw response";
      }
    });

    expect(called).toBe(false);
    expect(gateway.sentMessages).toEqual([]);
  });
});

function createMessage(overrides: Partial<IncomingMessage> = {}): IncomingMessage {
  return {
    chatId: "authorized-group",
    text: "!sortear",
    fromMe: false,
    isGroup: true,
    ...overrides
  };
}
