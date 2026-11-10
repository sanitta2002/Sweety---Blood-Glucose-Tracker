import { READING_MESSAGES, READING_SLOT_LABELS } from "../constants/messages.js";
import type { ReadingSlot } from "../types/reading.types.js";

export interface ReadingValidationResult {
  isValid: boolean;
  message?: string;
}

const ALLOWED_SLOTS: ReadingSlot[] = [
  "MORNING",
  "AFTER_BREAKFAST",
  "AFTER_LUNCH",
  "AFTER_DINNER",
];

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isDateInFuture(dateString: string): boolean {
  const inputDate = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return inputDate.getTime() > today.getTime();
}

export function validateCreateReadingInput(data: {
  readingDate?: unknown;
  slot?: unknown;
  value?: unknown;
}): ReadingValidationResult {
  const { readingDate, slot, value } = data;

  if (value === undefined || value === null || value === "") {
    return { isValid: false, message: READING_MESSAGES.VALUE_REQUIRED };
  }

  const numericValue = Number(value);
  if (
    !Number.isInteger(numericValue) ||
    numericValue < 40 ||
    numericValue > 600
  ) {
    return { isValid: false, message: READING_MESSAGES.VALUE_OUT_OF_RANGE };
  }

  if (
    typeof readingDate !== "string" ||
    readingDate.trim().length === 0
  ) {
    return { isValid: false, message: READING_MESSAGES.DATE_REQUIRED };
  }

  if (!DATE_REGEX.test(readingDate.trim()) || isNaN(Date.parse(readingDate.trim()))) {
    return { isValid: false, message: READING_MESSAGES.DATE_INVALID };
  }

  if (isDateInFuture(readingDate.trim())) {
    return { isValid: false, message: READING_MESSAGES.DATE_FUTURE };
  }

  if (typeof slot !== "string" || slot.trim().length === 0) {
    return { isValid: false, message: READING_MESSAGES.SLOT_REQUIRED };
  }

  if (!ALLOWED_SLOTS.includes(slot as ReadingSlot)) {
    return { isValid: false, message: READING_MESSAGES.SLOT_INVALID };
  }

  return { isValid: true };
}

export function validateUpdateReadingInput(data: {
  readingDate?: unknown;
  slot?: unknown;
  value?: unknown;
}): ReadingValidationResult {
  const { readingDate, slot, value } = data;

  if (value !== undefined) {
    if (value === null || value === "") {
      return { isValid: false, message: READING_MESSAGES.VALUE_REQUIRED };
    }
    const numericValue = Number(value);
    if (
      !Number.isInteger(numericValue) ||
      numericValue < 40 ||
      numericValue > 600
    ) {
      return { isValid: false, message: READING_MESSAGES.VALUE_OUT_OF_RANGE };
    }
  }

  if (readingDate !== undefined) {
    if (
      typeof readingDate !== "string" ||
      !DATE_REGEX.test(readingDate.trim()) ||
      isNaN(Date.parse(readingDate.trim()))
    ) {
      return { isValid: false, message: READING_MESSAGES.DATE_INVALID };
    }
    if (isDateInFuture(readingDate.trim())) {
      return { isValid: false, message: READING_MESSAGES.DATE_FUTURE };
    }
  }

  if (slot !== undefined) {
    if (typeof slot !== "string" || !ALLOWED_SLOTS.includes(slot as ReadingSlot)) {
      return { isValid: false, message: READING_MESSAGES.SLOT_INVALID };
    }
  }

  return { isValid: true };
}

export function getSlotLabel(slot: ReadingSlot): string {
  return READING_SLOT_LABELS[slot] || slot;
}
