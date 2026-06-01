import { createSeededRandom } from "./seeded-random.js";
import type { ValidatedDrawInput } from "./types.js";

export interface DrawAllocation {
  readonly categoryName: string;
  readonly winners: readonly string[];
}

export interface DrawResult {
  readonly seed: number;
  readonly allocations: readonly DrawAllocation[];
}

export function executeDraw(input: ValidatedDrawInput, seed: number): DrawResult {
  const random = createSeededRandom(seed);
  const candidates = [...input.participants];

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const selectedIndex = Math.floor(random.next() * (index + 1));
    const currentCandidate = candidates[index];
    const selectedCandidate = candidates[selectedIndex];

    if (currentCandidate === undefined || selectedCandidate === undefined) {
      continue;
    }

    candidates[index] = selectedCandidate;
    candidates[selectedIndex] = currentCandidate;
  }

  let winnerStartIndex = 0;
  const allocations = input.categories.map((category) => {
    const winners = candidates.slice(winnerStartIndex, winnerStartIndex + category.quantity);
    winnerStartIndex += category.quantity;

    return {
      categoryName: category.name,
      winners
    };
  });

  return {
    seed,
    allocations
  };
}
