export interface RuntimeConfig {
  readonly allowOwnMessages: boolean;
  readonly authDirectory: string;
  readonly authorizedGroupIds: ReadonlySet<string>;
  readonly drawHistoryFile: string;
  readonly shouldStartGateway: boolean;
}

export class RuntimeConfigError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "RuntimeConfigError";
  }
}

export function parseRuntimeConfig(env: NodeJS.ProcessEnv): RuntimeConfig {
  const shouldStartGateway = env["RUN_WHATSAPP_GATEWAY"] === "true";
  const authorizedGroupIds = parseAuthorizedGroupIds(env["AUTHORIZED_GROUP_IDS"]);
  const authDirectory = env["BAILEYS_AUTH_DIR"];
  const drawHistoryFile = env["DRAW_HISTORY_FILE"];

  if (shouldStartGateway && authorizedGroupIds.size === 0) {
    throw new RuntimeConfigError("AUTHORIZED_GROUP_IDS must contain at least one group ID.");
  }

  if (
    shouldStartGateway &&
    env["NODE_ENV"] === "production" &&
    (!authDirectory || !drawHistoryFile)
  ) {
    throw new RuntimeConfigError(
      "BAILEYS_AUTH_DIR and DRAW_HISTORY_FILE are required in production when the gateway is enabled."
    );
  }

  return {
    allowOwnMessages: env["ALLOW_OWN_MESSAGES_FOR_LOCAL_TESTING"] === "true",
    authDirectory: authDirectory ?? ".auth",
    authorizedGroupIds,
    drawHistoryFile: drawHistoryFile ?? "storage/draw-history.json",
    shouldStartGateway
  };
}

function parseAuthorizedGroupIds(value: string | undefined): ReadonlySet<string> {
  return new Set(
    value
      ?.split(",")
      .map((groupId) => groupId.trim())
      .filter((groupId) => groupId.length > 0) ?? []
  );
}
