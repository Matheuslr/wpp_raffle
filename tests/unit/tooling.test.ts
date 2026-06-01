import { describe, expect, it } from "vitest";

import { projectName } from "../../src/tooling.js";

describe("tooling bootstrap", () => {
  it("loads TypeScript test files through Vitest", () => {
    expect(projectName).toBe("wpp-raffle-automation");
  });
});
