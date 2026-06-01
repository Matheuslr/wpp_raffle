import { DisconnectReason } from "@whiskeysockets/baileys";

const terminalDisconnectCodes = new Set<number>([
  DisconnectReason.badSession,
  DisconnectReason.forbidden,
  DisconnectReason.loggedOut,
  DisconnectReason.multideviceMismatch
]);

export function shouldReconnectAfterClose(error: unknown): boolean {
  const statusCode = getStatusCode(error);

  if (statusCode === undefined) {
    return true;
  }

  return !terminalDisconnectCodes.has(statusCode);
}

function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("output" in error)) {
    return undefined;
  }

  const output = error.output;

  if (!output || typeof output !== "object" || !("statusCode" in output)) {
    return undefined;
  }

  return typeof output.statusCode === "number" ? output.statusCode : undefined;
}
