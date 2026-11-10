import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { IUserRepository, User } from "../repositories/interfaces/IUserRepository.js";
import { AppError } from "../errors/AppError.js";
import { AUTH_MESSAGES } from "../constants/messages.js";
import type {
  AuthResponse,
  AuthUserResponse,
  RegisterDTO,
  LoginDTO,
} from "../types/auth.types.js";

export type { AuthResponse, AuthUserResponse, RegisterDTO, LoginDTO };

const JWT_SECRET: string = process.env.JWT_SECRET || "sweety_jwt_secret_key_change_in_production";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";
const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS) || 10;

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await this.userRepository.create({
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
}
