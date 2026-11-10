import { AUTH_MESSAGES } from "../constants/messages.js";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInput(data: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}): ValidationResult {
  const { name, email, password } = data;

  if (typeof name !== "string" || name.trim().length === 0) {
    return { isValid: false, message: AUTH_MESSAGES.NAME_REQUIRED };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: AUTH_MESSAGES.NAME_MIN_LENGTH };
  }

  if (typeof email !== "string" || email.trim().length === 0) {
    return { isValid: false, message: AUTH_MESSAGES.EMAIL_REQUIRED };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: AUTH_MESSAGES.EMAIL_INVALID };
  }

  if (typeof password !== "string" || password.length === 0) {
    return { isValid: false, message: AUTH_MESSAGES.PASSWORD_REQUIRED };
  }

  if (password.length < 6) {
    return { isValid: false, message: AUTH_MESSAGES.PASSWORD_MIN_LENGTH };
  }

  return { isValid: true };
}

export function validateLoginInput(data: {
  email?: unknown;
  password?: unknown;
}): ValidationResult {
  const { email, password } = data;

  if (typeof email !== "string" || email.trim().length === 0) {
    return { isValid: false, message: AUTH_MESSAGES.EMAIL_REQUIRED };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: AUTH_MESSAGES.EMAIL_INVALID };
  }

  if (typeof password !== "string" || password.length === 0) {
    return { isValid: false, message: AUTH_MESSAGES.PASSWORD_REQUIRED };
  }

  return { isValid: true };
}
