export const AUTH_MESSAGES = {
  NAME_REQUIRED: "Name is required.",
  NAME_MIN_LENGTH: "Name must be at least 2 characters long.",
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Please enter a valid email address.",
  PASSWORD_REQUIRED: "Password is required.",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters long.",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  REGISTER_SUCCESS: "User registered successfully.",
  LOGIN_SUCCESS: "Logged in successfully.",
  USER_NOT_FOUND: "User not found.",
  USER_FETCHED_SUCCESS: "User profile fetched successfully.",
  UNAUTHORIZED: "Unauthorized.",
  NO_TOKEN_PROVIDED: "Access denied. No token provided.",
  INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token. Please log in again.",
} as const;

export const READING_SLOT_LABELS = {
  MORNING: "Morning (fasting)",
  AFTER_BREAKFAST: "After breakfast",
  AFTER_LUNCH: "After lunch",
  AFTER_DINNER: "After dinner",
} as const;

export const READING_MESSAGES = {
  VALUE_REQUIRED: "Please enter a glucose value.",
  VALUE_OUT_OF_RANGE: "Value must be between 40 and 600 mg/dl.",
  MAX_READINGS_PER_DAY: "You can add only 4 readings per day.",
  DATE_FUTURE: "Date cannot be in the future.",
  DATE_REQUIRED: "Reading date is required.",
  DATE_INVALID: "Please enter a valid date in YYYY-MM-DD format.",
  SLOT_REQUIRED: "Slot is required.",
  SLOT_INVALID: "Invalid slot. Allowed slots are Morning (fasting), After breakfast, After lunch, After dinner.",
  SLOT_ALREADY_EXISTS: (slotLabel: string): string => {
    return `You already have an ${slotLabel} reading for this date.`;
  },
  CREATED_SUCCESS: "Reading recorded successfully.",
  FETCHED_SUCCESS: "Reading fetched successfully.",
  LIST_FETCHED_SUCCESS: "Readings fetched successfully.",
  UPDATED_SUCCESS: "Reading updated successfully.",
  DELETED_SUCCESS: "Reading deleted successfully.",
  REPORTS_SUCCESS: "Reports generated successfully.",
  NOT_FOUND: "Reading not found.",
} as const;

export const SERVER_MESSAGES = {
  API_RUNNING: "Sweety API is running",
  DB_CONNECTED: "Database connected successfully",
  DB_FAILED: "Database connection failed",
  INTERNAL_ERROR: "An unexpected error occurred.",
  ROUTE_NOT_FOUND: (method: string, url: string): string =>
    `Route ${method} ${url} not found`,
} as const;
