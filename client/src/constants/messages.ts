import type { ReadingSlot } from "../types/index.js";

export const READING_SLOT_LABELS: Record<ReadingSlot, string> = {
  MORNING: "Morning (fasting)",
  AFTER_BREAKFAST: "After breakfast",
  AFTER_LUNCH: "After lunch",
  AFTER_DINNER: "After dinner",
};

export const VALIDATION_MESSAGES = {
  VALUE_REQUIRED: "Please enter a glucose value.",
  VALUE_OUT_OF_RANGE: "Value must be between 40 and 600 mg/dl.",
  MAX_READINGS_PER_DAY: "You can add only 4 readings per day.",
  DATE_FUTURE: "Date cannot be in the future.",
  DATE_REQUIRED: "Please select a date.",
  SLOT_REQUIRED: "Please select a time slot.",
  SLOT_ALREADY_EXISTS: (slotLabel: string): string =>
    `You already have an ${slotLabel} reading for this date.`,
  NAME_REQUIRED: "Please enter your name.",
  EMAIL_REQUIRED: "Please enter your email.",
  EMAIL_INVALID: "Please enter a valid email address.",
  PASSWORD_REQUIRED: "Please enter your password.",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters long.",
};
