import "dotenv/config";

import type { SeedProvider } from "../../application/ports/seed-provider.js";
import { JsonDrawHistoryRepository } from "../persistence/json-draw-history-repository.js";
import {
  BaileysMessageGateway,
  startBaileysMessageGateway
} from "../whatsapp/baileys-message-gateway.js";
import { parseRuntimeConfig } from "./runtime-config.js";

class SystemSeedProvider implements SeedProvider {
  public nextSeed(): number {
    return Date.now();
  }
}

const reconnectDelayMs = 5_000;
const config = parseRuntimeConfig(process.env);
let gateway: BaileysMessageGateway | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let shuttingDown = false;

if (!config.shouldStartGateway) {
  console.info(
    "WhatsApp gateway not started. Set RUN_WHATSAPP_GATEWAY=true for manual local testing."
  );
} else {
  await startGateway();
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

async function startGateway(): Promise<void> {
  const historyRepository = new JsonDrawHistoryRepository(config.drawHistoryFile);
  const seedProvider = new SystemSeedProvider();

  gateway = await startBaileysMessageGateway({
    allowOwnMessages: config.allowOwnMessages,
    authDirectory: config.authDirectory,
    authorizedGroupIds: config.authorizedGroupIds,
    onRecoverableDisconnect: scheduleReconnect,
    executeDrawDependencies: {
      historyRepository,
      seedProvider
    }
  });

  console.info("WhatsApp gateway started for authorized groups.");
}

function scheduleReconnect(): void {
  if (shuttingDown || reconnectTimer) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    void startGateway().catch((error: unknown) => {
      console.error("Failed to reconnect WhatsApp gateway.", error);
      scheduleReconnect();
    });
  }, reconnectDelayMs);
}

function shutdown(): void {
  shuttingDown = true;

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  gateway?.close();
  console.info("WhatsApp gateway stopped.");
  process.exit(0);
}
