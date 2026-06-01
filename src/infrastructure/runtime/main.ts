import type { SeedProvider } from "../../application/ports/seed-provider.js";
import { JsonDrawHistoryRepository } from "../persistence/json-draw-history-repository.js";
import { startBaileysMessageGateway } from "../whatsapp/baileys-message-gateway.js";

class SystemSeedProvider implements SeedProvider {
  public nextSeed(): number {
    return Date.now();
  }
}

if (process.env["RUN_WHATSAPP_GATEWAY"] !== "true") {
  console.info(
    "WhatsApp gateway not started. Set RUN_WHATSAPP_GATEWAY=true for manual local testing."
  );
} else {
  const authorizedGroupIds = parseAuthorizedGroupIds(process.env["AUTHORIZED_GROUP_IDS"]);
  const historyFilePath = process.env["DRAW_HISTORY_FILE"] ?? "storage/draw-history.json";
  const authDirectory = process.env["BAILEYS_AUTH_DIR"] ?? ".auth";
  const historyRepository = new JsonDrawHistoryRepository(historyFilePath);
  const seedProvider = new SystemSeedProvider();

  await startBaileysMessageGateway({
    authDirectory,
    authorizedGroupIds,
    executeDrawDependencies: {
      historyRepository,
      seedProvider
    }
  });

  console.info("WhatsApp gateway started for authorized groups.");
}

function parseAuthorizedGroupIds(value: string | undefined): ReadonlySet<string> {
  const groupIds =
    value
      ?.split(",")
      .map((groupId) => groupId.trim())
      .filter((groupId) => groupId.length > 0) ?? [];

  if (groupIds.length === 0) {
    throw new Error("AUTHORIZED_GROUP_IDS must contain at least one WhatsApp group ID.");
  }

  return new Set(groupIds);
}
