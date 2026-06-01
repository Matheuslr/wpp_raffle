import { describe, expect, it } from "vitest";

import { executeDrawUseCase } from "../../../src/application/execute-draw.js";
import type {
  CompletedDrawRecord,
  DrawHistoryRepository
} from "../../../src/application/ports/draw-history-repository.js";
import type { SeedProvider } from "../../../src/application/ports/seed-provider.js";

class FakeDrawHistoryRepository implements DrawHistoryRepository {
  public readonly records: CompletedDrawRecord[] = [];

  public async save(record: Omit<CompletedDrawRecord, "id">): Promise<CompletedDrawRecord> {
    const completedRecord = {
      ...record,
      id: `draw-${this.records.length + 1}`
    };

    this.records.push(completedRecord);
    return completedRecord;
  }
}

class FixedSeedProvider implements SeedProvider {
  public constructor(private readonly seed: number) {}

  public nextSeed(): number {
    return this.seed;
  }
}

describe("executeDrawUseCase", () => {
  it("orchestrates parsing, validation, seeded draw, formatting and persistence", async () => {
    const repository = new FakeDrawHistoryRepository();

    const response = await executeDrawUseCase(
      `!sortear

Lista
1 - Jogador A
2 - Jogador B
3 - Jogador C
4 - Jogador D

Sierra: 2
Automóvel: 1`,
      {
        historyRepository: repository,
        seedProvider: new FixedSeedProvider(1748801234)
      }
    );

    expect(response).toContain("🎲 Sorteio realizado");
    expect(response).toContain("🏆 Sierra");
    expect(response).toContain("🏆 Automóvel");
    expect(response).toContain("Seed: 1748801234");
    expect(response).toContain("ID: draw-1");
    expect(repository.records).toHaveLength(1);
    expect(repository.records[0]).toMatchObject({
      id: "draw-1",
      input: {
        participants: ["Jogador A", "Jogador B", "Jogador C", "Jogador D"],
        categories: [
          { name: "Sierra", quantity: 2 },
          { name: "Automóvel", quantity: 1 }
        ],
        totalSlots: 3
      },
      result: {
        seed: 1748801234
      }
    });
  });

  it("returns a Portuguese validation response and does not persist invalid draws", async () => {
    const repository = new FakeDrawHistoryRepository();

    const response = await executeDrawUseCase(
      `!sortear

Lista
João
Pedro

Sierra: 2
Automóvel: 1`,
      {
        historyRepository: repository,
        seedProvider: new FixedSeedProvider(1)
      }
    );

    expect(response).toBe(
      "❌ Não foi possível realizar o sorteio: há 3 vagas para apenas 2 participantes."
    );
    expect(repository.records).toHaveLength(0);
  });

  it("returns a Portuguese parser response when the command is missing", async () => {
    const repository = new FakeDrawHistoryRepository();

    const response = await executeDrawUseCase("Olá", {
      historyRepository: repository,
      seedProvider: new FixedSeedProvider(1)
    });

    expect(response).toBe(
      "❌ Não foi possível realizar o sorteio: envie uma mensagem começando com !sortear."
    );
    expect(repository.records).toHaveLength(0);
  });
});
