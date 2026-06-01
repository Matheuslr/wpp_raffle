import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { JsonDrawHistoryRepository } from "../../../src/infrastructure/persistence/json-draw-history-repository.js";
import type { CompletedDrawRecord } from "../../../src/application/ports/draw-history-repository.js";

const drawRecord: Omit<CompletedDrawRecord, "id"> = {
  input: {
    participants: ["João", "Pedro"],
    categories: [{ name: "Sierra", quantity: 1 }],
    totalSlots: 1
  },
  result: {
    seed: 123,
    allocations: [{ categoryName: "Sierra", winners: ["Pedro"] }]
  }
};

describe("JsonDrawHistoryRepository", () => {
  it("persists completed draws to a local JSON file", async () => {
    const directory = await mkdtemp(join(tmpdir(), "wpp-raffle-history-"));
    const filePath = join(directory, "history.json");
    const repository = new JsonDrawHistoryRepository(filePath);

    const saved = await repository.save(drawRecord);

    expect(saved).toEqual({
      ...drawRecord,
      id: "draw-1"
    });
    await expect(readFile(filePath, "utf8")).resolves.toContain('"id": "draw-1"');
  });

  it("appends to existing local history", async () => {
    const directory = await mkdtemp(join(tmpdir(), "wpp-raffle-history-"));
    await mkdir(directory, { recursive: true });
    const repository = new JsonDrawHistoryRepository(join(directory, "history.json"));

    await repository.save(drawRecord);
    const second = await repository.save(drawRecord);

    expect(second.id).toBe("draw-2");
  });
});
