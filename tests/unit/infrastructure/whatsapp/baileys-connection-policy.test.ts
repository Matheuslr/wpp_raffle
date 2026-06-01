import { DisconnectReason } from "@whiskeysockets/baileys";
import { describe, expect, it } from "vitest";

import { shouldReconnectAfterClose } from "../../../../src/infrastructure/whatsapp/baileys-connection-policy.js";

describe("shouldReconnectAfterClose", () => {
  it("reconnects after a recoverable close", () => {
    expect(shouldReconnectAfterClose(disconnectError(DisconnectReason.connectionLost))).toBe(true);
  });

  it("does not reconnect after logout", () => {
    expect(shouldReconnectAfterClose(disconnectError(DisconnectReason.loggedOut))).toBe(false);
  });

  it("does not reconnect after a bad session", () => {
    expect(shouldReconnectAfterClose(disconnectError(DisconnectReason.badSession))).toBe(false);
  });
});

function disconnectError(statusCode: DisconnectReason): unknown {
  return {
    output: {
      statusCode
    }
  };
}
