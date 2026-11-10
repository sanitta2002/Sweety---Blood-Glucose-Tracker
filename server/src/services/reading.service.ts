import type { IReadingRepository } from "../repositories/interfaces/IReadingRepository.js";
import { AppError } from "../errors/AppError.js";
import { READING_MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";
import { getSlotLabel } from "../validators/reading.validator.js";
import type { ServiceResponse } from "../types/response.types.js";
import type {
  Reading,
  CreateReadingParams,
  UpdateReadingParams,
  ReportSummary,
  DailyReport,
  ComprehensiveReport,
} from "../types/reading.types.js";

export type {
  CreateReadingParams,
  UpdateReadingParams,
  ReportSummary,
  DailyReport,
  ComprehensiveReport,
};

export class ReadingService {
  constructor(private readonly readingRepository: IReadingRepository) {}

  async addReading(params: CreateReadingParams): Promise<ServiceResponse<Reading>> {
    const { userId, readingDate, slot, value } = params;

    const currentCount = await this.readingRepository.countByDate(userId, readingDate);
    if (currentCount >= 4) {
      throw new AppError(READING_MESSAGES.MAX_READINGS_PER_DAY, HTTP_STATUS.BAD_REQUEST);
    }

    const existingSlotReading = await this.readingRepository.findByUserAndDateAndSlot(
      userId,
      readingDate,
      slot
    );
    if (existingSlotReading) {
      const slotLabel = getSlotLabel(slot);
      throw new AppError(READING_MESSAGES.SLOT_ALREADY_EXISTS(slotLabel), HTTP_STATUS.CONFLICT);
    }

    const reading = await this.readingRepository.create({
      userId,
      readingDate,
      slot,
      value,
    });

    return {
      statusCode: HTTP_STATUS.CREATED,
      message: READING_MESSAGES.CREATED_SUCCESS,
      data: reading,
    };
  }

  async getReadings(
    userId: string,
    filters?: {
      date?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ServiceResponse<{ readings: Reading[]; total: number; page: number; limit: number }>> {
    const result = await this.readingRepository.findByUser(userId, filters);

    return {
      statusCode: HTTP_STATUS.OK,
      message: READING_MESSAGES.LIST_FETCHED_SUCCESS,
      data: {
        readings: result.readings,
        total: result.total,
        page: filters?.page || 1,
        limit: filters?.limit || result.total,
      },
    };
  }

  async getReadingById(id: string, userId: string): Promise<ServiceResponse<Reading>> {
    const reading = await this.readingRepository.findById(id, userId);
    if (!reading) {
      throw new AppError(READING_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      statusCode: HTTP_STATUS.OK,
      message: READING_MESSAGES.FETCHED_SUCCESS,
      data: reading,
    };
  }

  async updateReading(params: UpdateReadingParams): Promise<ServiceResponse<Reading>> {
    const { id, userId, readingDate, slot, value } = params;

    const existing = await this.readingRepository.findById(id, userId);
    if (!existing) {
      throw new AppError(READING_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const targetDate = readingDate || existing.reading_date;
    const targetSlot = slot || existing.slot;

    if (targetDate !== existing.reading_date || targetSlot !== existing.slot) {
      const slotConflict = await this.readingRepository.findByUserAndDateAndSlot(
        userId,
        targetDate,
        targetSlot
      );
      if (slotConflict && slotConflict.id !== id) {
        const slotLabel = getSlotLabel(targetSlot);
        throw new AppError(READING_MESSAGES.SLOT_ALREADY_EXISTS(slotLabel), HTTP_STATUS.CONFLICT);
      }
    }

    if (targetDate !== existing.reading_date) {
      const dateCount = await this.readingRepository.countByDate(userId, targetDate);
      if (dateCount >= 4) {
        throw new AppError(READING_MESSAGES.MAX_READINGS_PER_DAY, HTTP_STATUS.BAD_REQUEST);
      }
    }

    const updated = await this.readingRepository.update(id, userId, {
      readingDate,
      slot,
      value,
    });

    if (!updated) {
      throw new AppError(READING_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      statusCode: HTTP_STATUS.OK,
      message: READING_MESSAGES.UPDATED_SUCCESS,
      data: updated,
    };
  }

  async deleteReading(id: string, userId: string): Promise<ServiceResponse> {
    const deleted = await this.readingRepository.delete(id, userId);
    if (!deleted) {
      throw new AppError(READING_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      statusCode: HTTP_STATUS.OK,
      message: READING_MESSAGES.DELETED_SUCCESS,
    };
  }

  async getReports(userId: string, selectedDateStr: string): Promise<ServiceResponse<ComprehensiveReport>> {
    const [year, month, day] = selectedDateStr.split("-").map(Number);

    const dailyStats = await this.readingRepository.getStats(
      userId,
      selectedDateStr,
      selectedDateStr
    );
    const dailyReadings = await this.readingRepository.findByUser(userId, {
      date: selectedDateStr,
    });

    const daily: DailyReport = {
      ...dailyStats,
      date: selectedDateStr,
      startDate: selectedDateStr,
      endDate: selectedDateStr,
      readings: dailyReadings.readings,
    };

    const monthStartStr = `${year}-${String(month).padStart(2, "0")}-01`;
    const mtdStats = await this.readingRepository.getStats(
      userId,
      monthStartStr,
      selectedDateStr
    );

    const monthToDate: ReportSummary = {
      ...mtdStats,
      startDate: monthStartStr,
      endDate: selectedDateStr,
    };

    const prevMonthDate = new Date(year, month - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    const lastDayOfPrevMonth = new Date(year, month - 1, 0).getDate();

    const prevMonthStartStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
    const prevMonthEndStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(lastDayOfPrevMonth).padStart(2, "0")}`;

    const prevMonthStats = await this.readingRepository.getStats(
      userId,
      prevMonthStartStr,
      prevMonthEndStr
    );

    const monthly: ReportSummary = {
      ...prevMonthStats,
      startDate: prevMonthStartStr,
      endDate: prevMonthEndStr,
    };

    return {
      statusCode: HTTP_STATUS.OK,
      message: READING_MESSAGES.REPORTS_SUCCESS,
      data: {
        daily,
        monthToDate,
        monthly,
      },
    };
  }
}
