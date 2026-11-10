import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AuthService } from "../services/auth.service.js";
import type { IUserRepository, User, UserWithPassword } from "../repositories/interfaces/IUserRepository.js";
import type { CreateUserDTO } from "../dto/auth.dto.js";
import { AppError } from "../errors/AppError.js";
import { AUTH_MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

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

  async create(user: CreateUserDTO): Promise<User> {
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
  it("should successfully register a user and return status code, message and user data without password", async () => {
    const mockRepo = new MockUserRepository();
    const service = new AuthService(mockRepo);

    const result = await service.register({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
    });

    assert.equal(result.statusCode, HTTP_STATUS.CREATED);
    assert.equal(result.message, AUTH_MESSAGES.REGISTER_SUCCESS);
    assert.ok(result.data?.token);
    assert.equal(result.data?.user.name, "Jane Doe");
    assert.equal(result.data?.user.email, "jane@example.com");
    assert.ok(result.data?.user.id);
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
        assert.equal(err.statusCode, HTTP_STATUS.CONFLICT);
        assert.equal(err.message, AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
        return true;
      }
    );
  });

  it("should successfully log in with valid credentials and return status code, message, and token", async () => {
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

    assert.equal(loginResult.statusCode, HTTP_STATUS.OK);
    assert.equal(loginResult.message, AUTH_MESSAGES.LOGIN_SUCCESS);
    assert.ok(loginResult.data?.token);
    assert.equal(loginResult.data?.user.email, "jane@example.com");
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
        assert.equal(err.statusCode, HTTP_STATUS.UNAUTHORIZED);
        assert.equal(err.message, AUTH_MESSAGES.INVALID_CREDENTIALS);
        return true;
      }
    );
  });
});
