import type {
  Reading,
  ReadingSlot,
  ReadingStats,
} from "../../types/reading.types.js";
import type {
  CreateReadingDTO,
  UpdateReadingDTO,
} from "../../dto/reading.dto.js";

export interface IReadingRepository {
  create(data: CreateReadingDTO): Promise<Reading>;
  findById(id: string, userId: string): Promise<Reading | null>;
  findByUserAndDateAndSlot(
    userId: string,
    readingDate: string,
    slot: ReadingSlot
  ): Promise<Reading | null>;
  countByDate(userId: string, readingDate: string): Promise<number>;
  findByUser(
    userId: string,
    filters?: {
      date?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ readings: Reading[]; total: number }>;
  update(
    id: string,
    userId: string,
    data: UpdateReadingDTO
  ): Promise<Reading | null>;
  delete(id: string, userId: string): Promise<boolean>;
  getStats(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ReadingStats>;
}
