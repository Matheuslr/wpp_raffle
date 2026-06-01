import { describe, expect, it } from "vitest";

import {
  parseRuntimeConfig,
  RuntimeConfigError
} from "../../../../src/infrastructure/runtime/runtime-config.js";

describe("parseRuntimeConfig", () => {
  it("requires authorized group IDs when the gateway is enabled", () => {
    expect(() =>
      parseRuntimeConfig({
        RUN_WHATSAPP_GATEWAY: "true",
        AUTHORIZED_GROUP_IDS: ""
      })
    ).toThrow(new RuntimeConfigError("AUTHORIZED_GROUP_IDS must contain at least one group ID."));
  });

  it("requires explicit storage paths in production when the gateway is enabled", () => {
    expect(() =>
      parseRuntimeConfig({
        NODE_ENV: "production",
        RUN_WHATSAPP_GATEWAY: "true",
        AUTHORIZED_GROUP_IDS: "120363000000000000@g.us"
      })
    ).toThrow(
      new RuntimeConfigError(
        "BAILEYS_AUTH_DIR and DRAW_HISTORY_FILE are required in production when the gateway is enabled."
      )
    );
  });

  it("uses deployment paths supplied by environment variables", () => {
    const config = parseRuntimeConfig({
      RUN_WHATSAPP_GATEWAY: "true",
      AUTHORIZED_GROUP_IDS: "120363000000000000@g.us",
      BAILEYS_AUTH_DIR: "/app/runtime/auth",
      DRAW_HISTORY_FILE: "/app/runtime/data/draw-history.json",
      ALLOW_OWN_MESSAGES_FOR_LOCAL_TESTING: "false"
    });

    expect(config).toEqual({
      allowOwnMessages: false,
      authDirectory: "/app/runtime/auth",
      authorizedGroupIds: new Set(["120363000000000000@g.us"]),
      drawHistoryFile: "/app/runtime/data/draw-history.json",
      shouldStartGateway: true
    });
  });

  it("keeps the gateway disabled unless explicitly enabled", () => {
    const config = parseRuntimeConfig({});

    expect(config.shouldStartGateway).toBe(false);
  });
});
