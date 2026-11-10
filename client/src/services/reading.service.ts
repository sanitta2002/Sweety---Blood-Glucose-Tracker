import { apiClient } from "./apiClient.js";
import { API_ENDPOINTS } from "../constants/api.js";
import type {
  ApiResponse,
  Reading,
  ReadingSlot,
  ComprehensiveReport,
} from "../types/index.js";

export interface ReadingFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateReadingPayload {
  readingDate: string;
  slot: ReadingSlot;
  value: number;
}

export interface UpdateReadingPayload {
  readingDate?: string;
  slot?: ReadingSlot;
  value?: number;
}

export const readingService = {
  async getAll(params?: ReadingFilterParams): Promise<ApiResponse<Reading[]>> {
    return apiClient<Reading[]>(API_ENDPOINTS.READINGS.BASE, {
      method: "GET",
      params: params as Record<string, string | number | undefined>,
    });
  },

  async getById(id: string): Promise<ApiResponse<Reading>> {
    return apiClient<Reading>(API_ENDPOINTS.READINGS.BY_ID(id), {
      method: "GET",
    });
  },

  async create(payload: CreateReadingPayload): Promise<ApiResponse<Reading>> {
    return apiClient<Reading>(API_ENDPOINTS.READINGS.BASE, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(
    id: string,
    payload: UpdateReadingPayload
  ): Promise<ApiResponse<Reading>> {
    return apiClient<Reading>(API_ENDPOINTS.READINGS.BY_ID(id), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient<void>(API_ENDPOINTS.READINGS.BY_ID(id), {
      method: "DELETE",
    });
  },

  async getReports(date?: string): Promise<ApiResponse<ComprehensiveReport>> {
    return apiClient<ComprehensiveReport>(API_ENDPOINTS.READINGS.REPORTS, {
      method: "GET",
      params: date ? { date } : undefined,
    });
  },
};
