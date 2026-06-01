import { describe, expect, it } from "vitest";

import {
  DrawValidationError,
  validateDrawInput
} from "../../../../src/domain/draw/validate-draw-input.js";

describe("validateDrawInput", () => {
  it("rejects a blank participant", () => {
    expect(() =>
      validateDrawInput({
        participants: ["João", "   "],
        categories: [{ name: "Sierra", quantity: 1 }]
      })
    ).toThrow(new DrawValidationError("blank_participant"));
  });

  it("rejects a duplicate participant with casing and spacing variation", () => {
    expect(() =>
      validateDrawInput({
        participants: [" João ", "joão"],
        categories: [{ name: "Sierra", quantity: 1 }]
      })
    ).toThrow(new DrawValidationError("duplicate_participant", { participantName: "joão" }));
  });

  it("rejects a blank category", () => {
    expect(() =>
      validateDrawInput({
        participants: ["João"],
        categories: [{ name: " ", quantity: 1 }]
      })
    ).toThrow(new DrawValidationError("blank_category"));
  });

  it("rejects a non-positive quantity", () => {
    expect(() =>
      validateDrawInput({
        participants: ["João"],
        categories: [{ name: "Sierra", quantity: 0 }]
      })
    ).toThrow(new DrawValidationError("invalid_quantity", { categoryName: "Sierra" }));
  });

  it("rejects a non-integer quantity", () => {
    expect(() =>
      validateDrawInput({
        participants: ["João"],
        categories: [{ name: "Sierra", quantity: 1.5 }]
      })
    ).toThrow(new DrawValidationError("invalid_quantity", { categoryName: "Sierra" }));
  });

  it("rejects a duplicate category", () => {
    expect(() =>
      validateDrawInput({
        participants: ["João", "Pedro"],
        categories: [
          { name: " Sierra ", quantity: 1 },
          { name: "sierra", quantity: 1 }
        ]
      })
    ).toThrow(new DrawValidationError("duplicate_category", { categoryName: "sierra" }));
  });

  it("rejects total slots greater than participants", () => {
    expect(() =>
      validateDrawInput({
        participants: ["João", "Pedro"],
        categories: [
          { name: "Sierra", quantity: 2 },
          { name: "Automóvel", quantity: 1 }
        ]
      })
    ).toThrow(
      new DrawValidationError("too_many_slots", {
        participantCount: 2,
        slotCount: 3
      })
    );
  });

  it("returns normalized valid inputs while preserving display spelling", () => {
    const result = validateDrawInput({
      participants: [" João ", "Pedro"],
      categories: [
        { name: " Sierra ", quantity: 1 },
        { name: "Automóvel", quantity: 1 }
      ]
    });

    expect(result).toEqual({
      participants: ["João", "Pedro"],
      categories: [
        { name: "Sierra", quantity: 1 },
        { name: "Automóvel", quantity: 1 }
      ],
      totalSlots: 2
    });
  });
});
