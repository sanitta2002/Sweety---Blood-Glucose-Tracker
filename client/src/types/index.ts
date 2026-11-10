export type ReadingSlot =
  | "MORNING"
  | "AFTER_BREAKFAST"
  | "AFTER_LUNCH"
  | "AFTER_DINNER";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Reading {
  id: string;
  user_id: string;
  reading_date: string;
  slot: ReadingSlot;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface ReadingStats {
  count: number;
  highest: number | null;
  lowest: number | null;
  average: number | null;
}

export interface ReportSummary extends ReadingStats {
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

export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
