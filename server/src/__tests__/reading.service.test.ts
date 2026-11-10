import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ReadingService } from "../services/reading.service.js";
import type { IReadingRepository } from "../repositories/interfaces/IReadingRepository.js";
import type {
  Reading,
  ReadingSlot,
  ReadingStats,
} from "../types/reading.types.js";
import type {
  CreateReadingDTO,
  UpdateReadingDTO,
} from "../dto/reading.dto.js";
import { AppError } from "../errors/AppError.js";
import { READING_MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

class MockReadingRepository implements IReadingRepository {
  private readings: Reading[] = [];

  async create(data: CreateReadingDTO): Promise<Reading> {
    const newReading: Reading = {
      id: "reading-uuid-" + (this.readings.length + 1),
      user_id: data.userId,
      reading_date: data.readingDate,
      slot: data.slot,
      value: data.value,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.readings.push(newReading);
    return newReading;
  }

  async findById(id: string, userId: string): Promise<Reading | null> {
    const reading = this.readings.find((r) => r.id === id && r.user_id === userId);
    return reading ? { ...reading } : null;
  }

  async findByUserAndDateAndSlot(
    userId: string,
    readingDate: string,
    slot: ReadingSlot
  ): Promise<Reading | null> {
    const reading = this.readings.find(
      (r) => r.user_id === userId && r.reading_date === readingDate && r.slot === slot
    );
    return reading ? { ...reading } : null;
  }

  async countByDate(userId: string, readingDate: string): Promise<number> {
    return this.readings.filter(
      (r) => r.user_id === userId && r.reading_date === readingDate
    ).length;
  }

  async findByUser(
    userId: string,
    filters?: {
      date?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ readings: Reading[]; total: number }> {
    let list = this.readings.filter((r) => r.user_id === userId);

    if (filters?.date) {
      list = list.filter((r) => r.reading_date === filters.date);
    }
    if (filters?.startDate) {
      list = list.filter((r) => r.reading_date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((r) => r.reading_date <= filters.endDate!);
    }

    return { readings: list, total: list.length };
  }

  async update(
    id: string,
    userId: string,
    data: UpdateReadingDTO
  ): Promise<Reading | null> {
    const index = this.readings.findIndex((r) => r.id === id && r.user_id === userId);
    if (index === -1) return null;

    const existing = this.readings[index];
    const updated: Reading = {
      ...existing,
      reading_date: data.readingDate ?? existing.reading_date,
      slot: data.slot ?? existing.slot,
      value: data.value ?? existing.value,
      updated_at: new Date(),
    };
    this.readings[index] = updated;
    return updated;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const initialLen = this.readings.length;
    this.readings = this.readings.filter((r) => !(r.id === id && r.user_id === userId));
    return this.readings.length < initialLen;
  }

  async getStats(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ReadingStats> {
    const filtered = this.readings.filter(
      (r) => r.user_id === userId && r.reading_date >= startDate && r.reading_date <= endDate
    );

    if (filtered.length === 0) {
      return { count: 0, highest: null, lowest: null, average: null };
    }

    const values = filtered.map((r) => r.value);
    const count = values.length;
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = Math.round((sum / count) * 10) / 10;

    return { count, highest, lowest, average };
  }
}

describe("ReadingService Unit Tests", () => {
  const userId = "test-user-123";

  it("should successfully record a reading and return status code, message and data", async () => {
    const repo = new MockReadingRepository();
    const service = new ReadingService(repo);

    const res = await service.addReading({
      userId,
      readingDate: "2026-10-15",
      slot: "MORNING",
      value: 105,
    });

    assert.equal(res.statusCode, HTTP_STATUS.CREATED);
    assert.equal(res.message, READING_MESSAGES.CREATED_SUCCESS);
    assert.equal(res.data?.value, 105);
    assert.equal(res.data?.slot, "MORNING");
    assert.equal(res.data?.reading_date, "2026-10-15");
  });

  it("should enforce 'Only one reading per slot per day' with CONFLICT status", async () => {
    const repo = new MockReadingRepository();
    const service = new ReadingService(repo);

    await service.addReading({
      userId,
      readingDate: "2026-10-15",
      slot: "AFTER_LUNCH",
      value: 140,
    });

    await assert.rejects(
      async () => {
        await service.addReading({
          userId,
          readingDate: "2026-10-15",
          slot: "AFTER_LUNCH",
          value: 155,
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, HTTP_STATUS.CONFLICT);
        assert.equal(
          err.message,
          READING_MESSAGES.SLOT_ALREADY_EXISTS("After lunch")
        );
        return true;
      }
    );
  });

  it("should enforce 'Maximum 4 readings per day' with BAD_REQUEST status", async () => {
    const repo = new MockReadingRepository();
    const service = new ReadingService(repo);
    const date = "2026-10-15";

    await service.addReading({ userId, readingDate: date, slot: "MORNING", value: 100 });
    await service.addReading({ userId, readingDate: date, slot: "AFTER_BREAKFAST", value: 140 });
    await service.addReading({ userId, readingDate: date, slot: "AFTER_LUNCH", value: 130 });
    await service.addReading({ userId, readingDate: date, slot: "AFTER_DINNER", value: 125 });

    await assert.rejects(
      async () => {
        await service.addReading({
          userId,
          readingDate: date,
          slot: "MORNING",
          value: 110,
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, HTTP_STATUS.BAD_REQUEST);
        assert.equal(err.message, READING_MESSAGES.MAX_READINGS_PER_DAY);
        return true;
      }
    );
  });

  it("should generate reports with highest, lowest and average rounded to 1 decimal", async () => {
    const repo = new MockReadingRepository();
    const service = new ReadingService(repo);

    await service.addReading({ userId, readingDate: "2026-10-15", slot: "MORNING", value: 95 });
    await service.addReading({ userId, readingDate: "2026-10-15", slot: "AFTER_BREAKFAST", value: 142 });
    await service.addReading({ userId, readingDate: "2026-10-15", slot: "AFTER_LUNCH", value: 131 });

    const res = await service.getReports(userId, "2026-10-15");

    assert.equal(res.statusCode, HTTP_STATUS.OK);
    assert.equal(res.message, READING_MESSAGES.REPORTS_SUCCESS);
    assert.equal(res.data?.daily.count, 3);
    assert.equal(res.data?.daily.highest, 142);
    assert.equal(res.data?.daily.lowest, 95);
    assert.equal(res.data?.daily.average, 122.7);
    assert.equal(res.data?.daily.readings.length, 3);

    assert.equal(res.data?.monthToDate.count, 3);
    assert.equal(res.data?.monthToDate.average, 122.7);

    assert.equal(res.data?.monthly.count, 0);
    assert.equal(res.data?.monthly.highest, null);
    assert.equal(res.data?.monthly.lowest, null);
    assert.equal(res.data?.monthly.average, null);
  });
});
