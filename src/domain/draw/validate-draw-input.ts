import type { DrawInput, ValidatedDrawInput } from "./types.js";

export type DrawValidationErrorCode =
  | "blank_participant"
  | "duplicate_participant"
  | "blank_category"
  | "invalid_quantity"
  | "duplicate_category"
  | "too_many_slots";

export interface DrawValidationDetails {
  readonly participantName?: string;
  readonly categoryName?: string;
  readonly participantCount?: number;
  readonly slotCount?: number;
}

export class DrawValidationError extends Error {
  public constructor(
    public readonly code: DrawValidationErrorCode,
    public readonly details: DrawValidationDetails = {}
  ) {
    super(code);
    this.name = "DrawValidationError";
  }
}

export function validateDrawInput(input: DrawInput): ValidatedDrawInput {
  const participants = input.participants.map((participant) => participant.trim());
  const categories = input.categories.map((category) => ({
    name: category.name.trim(),
    quantity: category.quantity
  }));

  validateParticipants(participants);
  validateCategories(categories);

  const totalSlots = categories.reduce((sum, category) => sum + category.quantity, 0);

  if (totalSlots > participants.length) {
    throw new DrawValidationError("too_many_slots", {
      participantCount: participants.length,
      slotCount: totalSlots
    });
  }

  return {
    participants,
    categories,
    totalSlots
  };
}

function validateParticipants(participants: readonly string[]): void {
  const seen = new Set<string>();

  for (const participant of participants) {
    if (participant.length === 0) {
      throw new DrawValidationError("blank_participant");
    }

    const key = normalizeKey(participant);

    if (seen.has(key)) {
      throw new DrawValidationError("duplicate_participant", { participantName: participant });
    }

    seen.add(key);
  }
}

function validateCategories(categories: ValidatedDrawInput["categories"]): void {
  const seen = new Set<string>();

  for (const category of categories) {
    if (category.name.length === 0) {
      throw new DrawValidationError("blank_category");
    }

    if (!Number.isInteger(category.quantity) || category.quantity <= 0) {
      throw new DrawValidationError("invalid_quantity", { categoryName: category.name });
    }

    const key = normalizeKey(category.name);

    if (seen.has(key)) {
      throw new DrawValidationError("duplicate_category", { categoryName: category.name });
    }

    seen.add(key);
  }
}

function normalizeKey(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}
