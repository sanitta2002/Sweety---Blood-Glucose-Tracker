import "dotenv/config";
import bcrypt from "bcrypt";
import pool from "../config/database.js";

async function seedDatabase(): Promise<void> {
  console.log("Starting Sweety database seed...");

  try {
    const demoEmail = "demo@sweety.com";
    const demoPassword = "password123";
    const demoName = "Demo Patient";

    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [demoEmail]
    );

    let userId: string;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log(`Demo user already exists: ${userId}`);
    } else {
      const passwordHash = await bcrypt.hash(demoPassword, 10);
      const userResult = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [demoName, demoEmail, passwordHash]
      );
      userId = userResult.rows[0].id;
      console.log(`Demo user created: ${demoEmail} / ${demoPassword}`);
    }

    const today = new Date();
    const formatDate = (date: Date): string =>
      date.toISOString().split("T")[0];

    const sampleDates: Date[] = [
      new Date(today),
      new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
      new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      new Date(today.getFullYear(), today.getMonth() - 1, 15),
      new Date(today.getFullYear(), today.getMonth() - 1, 20),
    ];

    const sampleSlots = [
      { slot: "MORNING", baseValue: 95 },
      { slot: "AFTER_BREAKFAST", baseValue: 140 },
      { slot: "AFTER_LUNCH", baseValue: 130 },
      { slot: "AFTER_DINNER", baseValue: 125 },
    ];

    let insertedCount = 0;

    for (const d of sampleDates) {
      const dateStr = formatDate(d);

      for (const { slot, baseValue } of sampleSlots) {
        const variance = Math.floor(Math.random() * 21) - 10;
        const value = baseValue + variance;

        const res = await pool.query(
          `INSERT INTO readings (user_id, reading_date, slot, value)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, reading_date, slot) DO NOTHING
           RETURNING id`,
          [userId, dateStr, slot, value]
        );

        if (res.rowCount && res.rowCount > 0) {
          insertedCount++;
        }
      }
    }

    console.log(`Seed complete! Inserted ${insertedCount} new readings.`);
    console.log(`Email: ${demoEmail}`);
    console.log(`Password: ${demoPassword}`);
  } catch (error: unknown) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
