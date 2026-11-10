import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AuthService } from "../services/auth.service.js";
import { IUserRepository, User, UserWithPassword } from "../repositories/interfaces/IUserRepository.js";
import { AppError } from "../errors/AppError.js";
import { AUTH_MESSAGES } from "../constants/messages.js";

class MockUserRepository implements IUserRepository {
  private users: UserWithPassword[] = [];

  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const found = this.users.find((u) => u.email === email);
    return found ? { ...found } : null;
  }

  async findById(id: string): Promise<User | null> {
    const found = this.users.find((u) => u.id === id);
    if (!found) return null;
    const { password_hash, ...user } = found;
    return user;
  }

  async create(user: { name: string; email: string; passwordHash: string }): Promise<User> {
    const newUser: UserWithPassword = {
      id: "mock-uuid-" + (this.users.length + 1),
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      created_at: new Date(),
    };
    this.users.push(newUser);
    const { password_hash, ...returnedUser } = newUser;
    return returnedUser;
  }
}

describe("AuthService Unit Tests", () => {
  it("should successfully register a user and return token and user data without password", async () => {
    const mockRepo = new MockUserRepository();
    const service = new AuthService(mockRepo);

    const result = await service.register({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    assert.ok(result.token);
    assert.equal(result.user.name, "Jane Doe");
    assert.equal(result.user.email, "jane@example.com");
    assert.ok(result.user.id);
  });

  it("should reject registration if email is already registered", async () => {
    const mockRepo = new MockUserRepository();
    const service = new AuthService(mockRepo);

    await service.register({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    await assert.rejects(
      async () => {
        await service.register({
          name: "Jane Duplicate",
          email: "jane@example.com",
          password: "password456",
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.message, AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
        return true;
      }
    );
  });

  it("should successfully log in with valid credentials", async () => {
    const mockRepo = new MockUserRepository();
    const service = new AuthService(mockRepo);

    await service.register({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    const loginResult = await service.login({
      email: "jane@example.com",
      password: "password123",
    });

    assert.ok(loginResult.token);
    assert.equal(loginResult.user.email, "jane@example.com");
  });

  it("should reject login with wrong password", async () => {
    const mockRepo = new MockUserRepository();
    const service = new AuthService(mockRepo);

    await service.register({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    await assert.rejects(
      async () => {
        await service.login({
          email: "jane@example.com",
          password: "wrongPassword",
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof AppError);
        assert.equal(err.statusCode, 401);
        assert.equal(err.message, AUTH_MESSAGES.INVALID_CREDENTIALS);
        return true;
      }
    );
  });
});
