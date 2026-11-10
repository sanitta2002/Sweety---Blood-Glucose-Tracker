export type ReadingSlot =
  | "MORNING"
  | "AFTER_BREAKFAST"
  | "AFTER_LUNCH"
  | "AFTER_DINNER";

export interface Reading {
  id: string;
  user_id: string;
  reading_date: string;
  slot: ReadingSlot;
  value: number;
  created_at: Date;
  updated_at: Date;
}

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

export interface ReadingStats {
  count: number;
  highest: number | null;
  lowest: number | null;
  average: number | null;
}

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
