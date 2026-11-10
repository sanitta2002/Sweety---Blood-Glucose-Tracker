import pool from "../../config/database.js";
import type { IReadingRepository } from "../interfaces/IReadingRepository.js";
import type {
  Reading,
  ReadingSlot,
  ReadingStats,
} from "../../types/reading.types.js";
import type {
  CreateReadingDTO,
  UpdateReadingDTO,
} from "../../dto/reading.dto.js";

export class ReadingRepository implements IReadingRepository {
  async create(data: CreateReadingDTO): Promise<Reading> {
    const query = `
      INSERT INTO readings (user_id, reading_date, slot, value)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, slot, value, created_at, updated_at
    `;
    const result = await pool.query<Reading>(query, [
      data.userId,
      data.readingDate,
      data.slot,
      data.value,
    ]);

    return result.rows[0];
  }

  async findById(id: string, userId: string): Promise<Reading | null> {
    const query = `
      SELECT id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, slot, value, created_at, updated_at
      FROM readings
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query<Reading>(query, [id, userId]);
    return result.rows[0] ?? null;
  }

  async findByUserAndDateAndSlot(
    userId: string,
    readingDate: string,
    slot: ReadingSlot
  ): Promise<Reading | null> {
    const query = `
      SELECT id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, slot, value, created_at, updated_at
      FROM readings
      WHERE user_id = $1 AND reading_date = $2 AND slot = $3
    `;
    const result = await pool.query<Reading>(query, [userId, readingDate, slot]);
    return result.rows[0] ?? null;
  }

  async countByDate(userId: string, readingDate: string): Promise<number> {
    const query = `
      SELECT COUNT(*)::int AS count
      FROM readings
      WHERE user_id = $1 AND reading_date = $2
    `;
    const result = await pool.query<{ count: number }>(query, [userId, readingDate]);
    return result.rows[0]?.count ?? 0;
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
    const conditions: string[] = ["user_id = $1"];
    const params: (string | number)[] = [userId];

    if (filters?.date) {
      params.push(filters.date);
      conditions.push(`reading_date = $${params.length}`);
    } else {
      if (filters?.startDate) {
        params.push(filters.startDate);
        conditions.push(`reading_date >= $${params.length}`);
      }
      if (filters?.endDate) {
        params.push(filters.endDate);
        conditions.push(`reading_date <= $${params.length}`);
      }
    }

    const whereClause = conditions.join(" AND ");

    const countResult = await pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM readings WHERE ${whereClause}`,
      params
    );
    const total = countResult.rows[0]?.total ?? 0;

    let query = `
      SELECT id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, slot, value, created_at, updated_at
      FROM readings
      WHERE ${whereClause}
      ORDER BY reading_date DESC,
        CASE slot
          WHEN 'MORNING' THEN 1
          WHEN 'AFTER_BREAKFAST' THEN 2
          WHEN 'AFTER_LUNCH' THEN 3
          WHEN 'AFTER_DINNER' THEN 4
          ELSE 5
        END ASC
    `;

    if (filters?.limit && filters.limit > 0) {
      const page = filters.page && filters.page > 0 ? filters.page : 1;
      const offset = (page - 1) * filters.limit;
      params.push(filters.limit);
      query += ` LIMIT $${params.length}`;
      params.push(offset);
      query += ` OFFSET $${params.length}`;
    }

    const result = await pool.query<Reading>(query, params);
    return {
      readings: result.rows,
      total,
    };
  }

  async update(
    id: string,
    userId: string,
    data: UpdateReadingDTO
  ): Promise<Reading | null> {
    const updates: string[] = [];
    const params: (string | number)[] = [id, userId];

    if (data.readingDate !== undefined) {
      params.push(data.readingDate);
      updates.push(`reading_date = $${params.length}`);
    }

    if (data.slot !== undefined) {
      params.push(data.slot);
      updates.push(`slot = $${params.length}`);
    }

    if (data.value !== undefined) {
      params.push(data.value);
      updates.push(`value = $${params.length}`);
    }

    if (updates.length === 0) {
      return this.findById(id, userId);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    const query = `
      UPDATE readings
      SET ${updates.join(", ")}
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date, slot, value, created_at, updated_at
    `;

    const result = await pool.query<Reading>(query, params);
    return result.rows[0] ?? null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM readings
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [id, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  async getStats(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ReadingStats> {
    const query = `
      SELECT
        COUNT(*)::int AS count,
        MAX(value)::int AS highest,
        MIN(value)::int AS lowest,
        ROUND(AVG(value)::numeric, 1)::float AS average
      FROM readings
      WHERE user_id = $1 AND reading_date >= $2 AND reading_date <= $3
    `;
    const result = await pool.query<{
      count: number;
      highest: number | null;
      lowest: number | null;
      average: number | null;
    }>(query, [userId, startDate, endDate]);

    const row = result.rows[0];

    return {
      count: row?.count ?? 0,
      highest: row?.highest ?? null,
      lowest: row?.lowest ?? null,
      average: row?.average ?? null,
    };
  }
}
