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

export interface ReadingStats {
  count: number;
  highest: number | null;
  lowest: number | null;
  average: number | null;
}

export interface CreateReadingParams {
  userId: string;
  readingDate: string;
  slot: ReadingSlot;
  value: number;
}

export interface UpdateReadingParams {
  userId: string;
  id: string;
  readingDate?: string;
  slot?: ReadingSlot;
  value?: number;
}

export interface ReportSummary {
  highest: number | null;
  lowest: number | null;
  average: number | null;
  count: number;
  startDate: string;
  endDate: string;
}

export interface DailyReport extends ReportSummary {
  date: string;
  readings: Reading[];
}

export interface ComprehensiveReport {
  daily: DailyReport;
  monthToDate: ReportSummary;
  monthly: ReportSummary;
}
