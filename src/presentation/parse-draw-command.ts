export interface ParsedPrizeCategory {
  readonly name: string;
  readonly quantity: number;
}

export interface ParsedDrawCommand {
  readonly participants: readonly string[];
  readonly categories: readonly ParsedPrizeCategory[];
}

export class DrawCommandParseError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "DrawCommandParseError";
  }
}

const command = "!sortear";
const participantListMarker = "lista";
const categoryPattern = /^([^:]*):\s*(\S+)\s*$/;
const numberedParticipantPattern = /^\d+\s*(?:[-.]|-\s*)\s*(.+)$/;

export function parseDrawCommand(text: string): ParsedDrawCommand {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines[0] !== command) {
    throw new DrawCommandParseError("Missing draw command.");
  }

  const listStartIndex = lines.findIndex(
    (line) => line.toLocaleLowerCase("pt-BR") === participantListMarker
  );

  if (listStartIndex === -1) {
    throw new DrawCommandParseError("Missing participant list.");
  }

  const participants: string[] = [];
  const categories: ParsedPrizeCategory[] = [];

  for (const line of lines.slice(listStartIndex + 1)) {
    const category = parseCategory(line);

    if (category) {
      categories.push(category);
      continue;
    }

    if (categories.length === 0) {
      participants.push(parseParticipant(line));
    }
  }

  if (participants.length === 0) {
    throw new DrawCommandParseError("Missing participants.");
  }

  if (categories.length === 0) {
    throw new DrawCommandParseError("Missing prize categories.");
  }

  return {
    participants,
    categories
  };
}

function parseCategory(line: string): ParsedPrizeCategory | null {
  const match = categoryPattern.exec(line);

  if (!match) {
    return null;
  }

  const rawName = match[1];
  const rawQuantity = match[2];

  if (rawName === undefined || rawQuantity === undefined) {
    return null;
  }

  return {
    name: rawName.trim(),
    quantity: Number(rawQuantity)
  };
}

function parseParticipant(line: string): string {
  const match = numberedParticipantPattern.exec(line);
  return (match?.[1] ?? line).trim();
}
