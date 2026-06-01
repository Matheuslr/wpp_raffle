export interface PrizeCategory {
  readonly name: string;
  readonly quantity: number;
}

export interface DrawInput {
  readonly participants: readonly string[];
  readonly categories: readonly PrizeCategory[];
}

export interface ValidatedDrawInput extends DrawInput {
  readonly totalSlots: number;
}
