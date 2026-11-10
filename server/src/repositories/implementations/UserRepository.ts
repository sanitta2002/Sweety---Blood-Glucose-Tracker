import pool from "../../config/database.js";
import { IUserRepository, User, UserWithPassword } from "../interfaces/IUserRepository.js";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const result = await pool.query(
      `SELECT id, name, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );

    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE id = $1`,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async create(user: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [user.name, user.email, user.passwordHash],
    );

    return result.rows[0];
  }
}
