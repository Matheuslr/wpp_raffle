import { describe, expect, it } from "vitest";

import { parseDrawCommand } from "../../../src/presentation/parse-draw-command.js";

describe("parseDrawCommand", () => {
  it("parses participants and categories from the agreed WhatsApp command", () => {
    const result = parseDrawCommand(`!sortear

Lista
1 - Jogador A
2 - Jogador B
3 - Jogador C
4 - Jogador D
5 - Jogador E
6 - Jogador F

Sierra: 3
Automóvel: 3`);

    expect(result).toEqual({
      participants: ["Jogador A", "Jogador B", "Jogador C", "Jogador D", "Jogador E", "Jogador F"],
      categories: [
        { name: "Sierra", quantity: 3 },
        { name: "Automóvel", quantity: 3 }
      ]
    });
  });

  it("accepts unnumbered and differently numbered participant lines", () => {
    const result = parseDrawCommand(`   

!sortear

Lista
João
2 - Pedro
3- Ana
4. Bruno

Sierra: 2`);

    expect(result.participants).toEqual(["João", "Pedro", "Ana", "Bruno"]);
    expect(result.categories).toEqual([{ name: "Sierra", quantity: 2 }]);
  });

  it("normalizes surrounding whitespace while preserving display casing and accents", () => {
    const result = parseDrawCommand(`!sortear

Lista
  1 -   João da Silva  
    2. ÁNA Maria

  Sierra :  1
  Automóvel: 1  `);

    expect(result).toEqual({
      participants: ["João da Silva", "ÁNA Maria"],
      categories: [
        { name: "Sierra", quantity: 1 },
        { name: "Automóvel", quantity: 1 }
      ]
    });
  });

  it("does not parse category lines as participants", () => {
    const result = parseDrawCommand(`!sortear

Lista
João
Pedro
Sierra: 1
Automóvel: 1`);

    expect(result.participants).toEqual(["João", "Pedro"]);
    expect(result.categories).toEqual([
      { name: "Sierra", quantity: 1 },
      { name: "Automóvel", quantity: 1 }
    ]);
  });

  it("rejects a message whose first meaningful line is not the command", () => {
    expect(() =>
      parseDrawCommand(`Olá
!sortear

Lista
João

Sierra: 1`)
    ).toThrow("Missing draw command.");
  });

  it("rejects a message without a participant list", () => {
    expect(() =>
      parseDrawCommand(`!sortear

João

Sierra: 1`)
    ).toThrow("Missing participant list.");
  });

  it("rejects a message without participants", () => {
    expect(() =>
      parseDrawCommand(`!sortear

Lista

Sierra: 1`)
    ).toThrow("Missing participants.");
  });

  it("rejects a message without prize categories", () => {
    expect(() =>
      parseDrawCommand(`!sortear

Lista
João
Pedro`)
    ).toThrow("Missing prize categories.");
  });
});
