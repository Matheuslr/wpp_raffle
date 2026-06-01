import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { executeDraw } from "../../../../src/domain/draw/draw.js";
import type { ValidatedDrawInput } from "../../../../src/domain/draw/types.js";

const input: ValidatedDrawInput = {
  participants: ["Jogador A", "Jogador B", "Jogador C", "Jogador D", "Jogador E", "Jogador F"],
  categories: [
    { name: "Sierra", quantity: 3 },
    { name: "Automóvel", quantity: 2 }
  ],
  totalSlots: 5
};

describe("executeDraw", () => {
  it("selects exactly the total required number of winners", () => {
    const result = executeDraw(input, 1748801234);

    expect(result.allocations.flatMap((allocation) => allocation.winners)).toHaveLength(5);
  });

  it("never selects the same participant twice", () => {
    const result = executeDraw(input, 1748801234);
    const winners = result.allocations.flatMap((allocation) => allocation.winners);

    expect(new Set(winners).size).toBe(winners.length);
  });

  it("assigns selected winners across categories according to each quantity", () => {
    const result = executeDraw(input, 1748801234);

    expect(result.allocations).toEqual([
      {
        categoryName: "Sierra",
        winners: expect.arrayContaining([
          expect.any(String),
          expect.any(String),
          expect.any(String)
        ])
      },
      {
        categoryName: "Automóvel",
        winners: expect.arrayContaining([expect.any(String), expect.any(String)])
      }
    ]);
    expect(result.allocations[0]?.winners).toHaveLength(3);
    expect(result.allocations[1]?.winners).toHaveLength(2);
  });

  it("produces identical output with identical seed and identical input", () => {
    expect(executeDraw(input, 12345)).toEqual(executeDraw(input, 12345));
  });

  it("produces valid output for different seeds", () => {
    const first = executeDraw(input, 1);
    const second = executeDraw(input, 2);

    expect(first.allocations.flatMap((allocation) => allocation.winners)).toHaveLength(
      input.totalSlots
    );
    expect(second.allocations.flatMap((allocation) => allocation.winners)).toHaveLength(
      input.totalSlots
    );
    expect(first).not.toEqual(second);
  });

  it("does not use Math.random directly in tested domain draw logic", () => {
    const drawPath = fileURLToPath(new URL("../../../../src/domain/draw/draw.ts", import.meta.url));
    const randomPath = fileURLToPath(
      new URL("../../../../src/domain/draw/seeded-random.ts", import.meta.url)
    );

    expect(readFileSync(drawPath, "utf8")).not.toContain("Math.random");
    expect(readFileSync(randomPath, "utf8")).not.toContain("Math.random");
  });
});
