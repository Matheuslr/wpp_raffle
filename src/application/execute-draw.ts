import { executeDraw } from "../domain/draw/draw.js";
import { DrawValidationError, validateDrawInput } from "../domain/draw/validate-draw-input.js";
import { formatDrawResult } from "../presentation/format-draw-result.js";
import { DrawCommandParseError, parseDrawCommand } from "../presentation/parse-draw-command.js";
import type { DrawHistoryRepository } from "./ports/draw-history-repository.js";
import type { SeedProvider } from "./ports/seed-provider.js";

export interface ExecuteDrawDependencies {
  readonly historyRepository: DrawHistoryRepository;
  readonly seedProvider: SeedProvider;
}

export async function executeDrawUseCase(
  rawMessage: string,
  dependencies: ExecuteDrawDependencies
): Promise<string> {
  try {
    const parsedCommand = parseDrawCommand(rawMessage);
    const input = validateDrawInput(parsedCommand);
    const result = executeDraw(input, dependencies.seedProvider.nextSeed());
    const savedDraw = await dependencies.historyRepository.save({ input, result });

    return formatDrawResult({
      ...savedDraw.result,
      id: savedDraw.id
    });
  } catch (error) {
    return formatDrawError(error);
  }
}

function formatDrawError(error: unknown): string {
  if (error instanceof DrawCommandParseError) {
    return formatParseError(error);
  }

  if (error instanceof DrawValidationError) {
    return formatValidationError(error);
  }

  throw error;
}

function formatParseError(error: DrawCommandParseError): string {
  if (error.message === "Missing draw command.") {
    return "❌ Não foi possível realizar o sorteio: envie uma mensagem começando com !sortear.";
  }

  if (error.message === "Missing participant list.") {
    return "❌ Não foi possível realizar o sorteio: informe a lista de participantes com o marcador Lista.";
  }

  if (error.message === "Missing participants.") {
    return "❌ Não foi possível realizar o sorteio: informe pelo menos um participante.";
  }

  return "❌ Não foi possível realizar o sorteio: informe pelo menos uma categoria de prêmio.";
}

function formatValidationError(error: DrawValidationError): string {
  switch (error.code) {
    case "blank_participant":
      return "❌ Não foi possível realizar o sorteio: há um participante sem nome.";
    case "duplicate_participant":
      return `❌ Não foi possível realizar o sorteio: o participante "${error.details.participantName ?? ""}" aparece mais de uma vez.`;
    case "blank_category":
      return "❌ Não foi possível realizar o sorteio: há uma categoria sem nome.";
    case "invalid_quantity":
      return `❌ Não foi possível realizar o sorteio: a quantidade da categoria "${error.details.categoryName ?? ""}" deve ser um número inteiro positivo.`;
    case "duplicate_category":
      return `❌ Não foi possível realizar o sorteio: a categoria "${error.details.categoryName ?? ""}" aparece mais de uma vez.`;
    case "too_many_slots":
      return `❌ Não foi possível realizar o sorteio: há ${error.details.slotCount ?? 0} vagas para apenas ${error.details.participantCount ?? 0} participantes.`;
  }
}
