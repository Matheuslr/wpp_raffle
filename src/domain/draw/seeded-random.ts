export interface SeededRandom {
  next(): number;
}

export function createSeededRandom(seed: number): SeededRandom {
  let state = seed >>> 0;

  return {
    next(): number {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    }
  };
}
