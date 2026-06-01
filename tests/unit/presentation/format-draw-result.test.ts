import { describe, expect, it } from "vitest";

import { formatDrawResult } from "../../../src/presentation/format-draw-result.js";

describe("formatDrawResult", () => {
  it("formats a Brazilian Portuguese WhatsApp result with categories, winners and seed", () => {
    const message = formatDrawResult({
      seed: 1748801234,
      allocations: [
        {
          categoryName: "Sierra",
          winners: ["Jogador B", "Jogador D", "Jogador F"]
        },
        {
          categoryName: "Automóvel",
          winners: ["Jogador A", "Jogador E", "Jogador C"]
        }
      ]
    });

    expect(message).toBe(`🎲 Sorteio realizado

🏆 Sierra
• Jogador B
• Jogador D
• Jogador F

🏆 Automóvel
• Jogador A
• Jogador E
• Jogador C

Seed: 1748801234`);
  });

  it("includes an optional draw identifier when provided", () => {
    const message = formatDrawResult({
      id: "draw-1",
      seed: 1,
      allocations: [
        {
          categoryName: "Sierra",
          winners: ["João"]
        }
      ]
    });

    expect(message).toContain("ID: draw-1");
  });
});
