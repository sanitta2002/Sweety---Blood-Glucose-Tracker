import { authService } from "./auth.service.js";
import { readingService, type UpdateReadingPayload } from "./reading.service.js";
import { tokenService } from "./token.service.js";
import type { ReadingSlot } from "../types/index.js";

export { authService } from "./auth.service.js";
export { readingService } from "./reading.service.js";
export { tokenService } from "./token.service.js";
export { apiClient } from "./apiClient.js";

export const api = {
  auth: authService,
  readings: {
    getAll: (params?: { date?: string; startDate?: string; endDate?: string }) =>
      readingService.getAll(params),
    getById: (id: string) => readingService.getById(id),
    create: (readingDate: string, slot: ReadingSlot, value: number) =>
      readingService.create({ readingDate, slot, value }),
    update: (id: string, data: UpdateReadingPayload) =>
      readingService.update(id, data),
    delete: (id: string) => readingService.delete(id),
    getReports: (date?: string) => readingService.getReports(date),
  },
};

export const getStoredToken = tokenService.getToken.bind(tokenService);
export const setStoredToken = tokenService.setToken.bind(tokenService);
export const clearStoredToken = tokenService.removeToken.bind(tokenService);
