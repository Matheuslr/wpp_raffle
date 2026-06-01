import type { DrawResult } from "../domain/draw/draw.js";

export interface FormattableDrawResult extends DrawResult {
  readonly id?: string;
}

export function formatDrawResult(result: FormattableDrawResult): string {
  const sections = result.allocations.map((allocation) =>
    [`🏆 ${allocation.categoryName}`, ...allocation.winners.map((winner) => `• ${winner}`)].join(
      "\n"
    )
  );

  const footer = result.id
    ? [`ID: ${result.id}`, `Seed: ${result.seed}`]
    : [`Seed: ${result.seed}`];

  return ["🎲 Sorteio realizado", ...sections, ...footer].join("\n\n");
}
