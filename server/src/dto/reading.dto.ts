import type { ReadingSlot } from "../types/reading.types.js";

export interface CreateReadingDTO {
  userId: string;
  readingDate: string;
  slot: ReadingSlot;
  value: number;
}

export interface UpdateReadingDTO {
  readingDate?: string;
  slot?: ReadingSlot;
  value?: number;
}
