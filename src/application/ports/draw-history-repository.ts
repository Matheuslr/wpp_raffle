import type { DrawResult } from "../../domain/draw/draw.js";
import type { ValidatedDrawInput } from "../../domain/draw/types.js";

export interface CompletedDrawRecord {
  readonly id: string;
  readonly input: ValidatedDrawInput;
  readonly result: DrawResult;
}

export interface DrawHistoryRepository {
  save(record: Omit<CompletedDrawRecord, "id">): Promise<CompletedDrawRecord>;
}
