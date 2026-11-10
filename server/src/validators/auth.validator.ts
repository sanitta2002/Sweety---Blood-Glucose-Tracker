import { z } from "zod";
import { AUTH_MESSAGES } from "../constants/messages.js";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const registerSchema = z.object({
  name: z
    .string({ message: AUTH_MESSAGES.NAME_REQUIRED })
    .trim()
    .min(1, { message: AUTH_MESSAGES.NAME_REQUIRED })
    .min(2, { message: AUTH_MESSAGES.NAME_MIN_LENGTH }),
  email: z
    .string({ message: AUTH_MESSAGES.EMAIL_REQUIRED })
    .trim()
    .min(1, { message: AUTH_MESSAGES.EMAIL_REQUIRED })
    .email({ message: AUTH_MESSAGES.EMAIL_INVALID }),
  password: z
    .string({ message: AUTH_MESSAGES.PASSWORD_REQUIRED })
    .min(1, { message: AUTH_MESSAGES.PASSWORD_REQUIRED })
    .min(6, { message: AUTH_MESSAGES.PASSWORD_MIN_LENGTH }),
});

export const loginSchema = z.object({
  email: z
    .string({ message: AUTH_MESSAGES.EMAIL_REQUIRED })
    .trim()
    .min(1, { message: AUTH_MESSAGES.EMAIL_REQUIRED })
    .email({ message: AUTH_MESSAGES.EMAIL_INVALID }),
  password: z
    .string({ message: AUTH_MESSAGES.PASSWORD_REQUIRED })
    .min(1, { message: AUTH_MESSAGES.PASSWORD_REQUIRED }),
});

export function validateRegisterInput(data: unknown): ValidationResult {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      message: result.error.issues[0]?.message || AUTH_MESSAGES.NAME_REQUIRED,
    };
  }
  return { isValid: true };
}

export function validateLoginInput(data: unknown): ValidationResult {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      message: result.error.issues[0]?.message || AUTH_MESSAGES.EMAIL_REQUIRED,
    };
  }
  return { isValid: true };
}
