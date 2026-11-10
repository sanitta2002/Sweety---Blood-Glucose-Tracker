import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import type { IUserRepository, User } from "../repositories/interfaces/IUserRepository.js";
import { AppError } from "../errors/AppError.js";
import { AUTH_MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";
import type { ServiceResponse } from "../types/response.types.js";
import type {
  AuthResponse,
  AuthUserResponse,
} from "../types/auth.types.js";
import type {
  RegisterDTO,
  LoginDTO,
} from "../dto/auth.dto.js";

export type { AuthResponse, AuthUserResponse, RegisterDTO, LoginDTO };

const JWT_SECRET: string = process.env.JWT_SECRET || "sweety_jwt_secret_key_change_in_production";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";
const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS) || 10;

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(data: RegisterDTO): Promise<ServiceResponse<AuthResponse>> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await this.userRepository.create({
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = this.generateToken(user.id, user.email);

    return {
      statusCode: HTTP_STATUS.CREATED,
      message: AUTH_MESSAGES.REGISTER_SUCCESS,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    };
  }

  async login(data: LoginDTO): Promise<ServiceResponse<AuthResponse>> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    const token = this.generateToken(user.id, user.email);

    return {
      statusCode: HTTP_STATUS.OK,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    };
  }

  async getUserById(userId: string): Promise<ServiceResponse<User>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      statusCode: HTTP_STATUS.OK,
      message: AUTH_MESSAGES.USER_FETCHED_SUCCESS,
      data: user,
    };
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }
}
