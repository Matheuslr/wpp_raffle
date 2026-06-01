import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type {
  CompletedDrawRecord,
  DrawHistoryRepository
} from "../../application/ports/draw-history-repository.js";

export class JsonDrawHistoryRepository implements DrawHistoryRepository {
  public constructor(private readonly filePath: string) {}

  public async save(record: Omit<CompletedDrawRecord, "id">): Promise<CompletedDrawRecord> {
    const records = await this.readRecords();
    const completedRecord = {
      ...record,
      id: `draw-${records.length + 1}`
    };

    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(
      this.filePath,
      `${JSON.stringify([...records, completedRecord], null, 2)}\n`,
      "utf8"
    );

    return completedRecord;
  }

  private async readRecords(): Promise<CompletedDrawRecord[]> {
    try {
      const contents = await readFile(this.filePath, "utf8");
      const parsedContents: unknown = JSON.parse(contents);

      return Array.isArray(parsedContents) ? (parsedContents as CompletedDrawRecord[]) : [];
    } catch (error) {
      if (isFileNotFoundError(error)) {
        return [];
      }

      throw error;
    }
  }
}

function isFileNotFoundError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
