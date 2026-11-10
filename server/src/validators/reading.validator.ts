import { z } from "zod";
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

export const createReadingZodSchema = z.object({
  value: z
    .unknown()
    .superRefine((val, ctx) => {
      if (val === undefined || val === null || val === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.VALUE_REQUIRED,
        });
        return;
      }
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 40 || num > 600) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.VALUE_OUT_OF_RANGE,
        });
      }
    }),
  readingDate: z
    .unknown()
    .superRefine((val, ctx) => {
      if (typeof val !== "string" || val.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.DATE_REQUIRED,
        });
        return;
      }
      const trimmed = val.trim();
      if (!DATE_REGEX.test(trimmed) || isNaN(Date.parse(trimmed))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.DATE_INVALID,
        });
        return;
      }
      if (isDateInFuture(trimmed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.DATE_FUTURE,
        });
      }
    }),
  slot: z
    .unknown()
    .superRefine((val, ctx) => {
      if (typeof val !== "string" || val.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.SLOT_REQUIRED,
        });
        return;
      }
      if (!ALLOWED_SLOTS.includes(val.trim() as ReadingSlot)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.SLOT_INVALID,
        });
      }
    }),
});

export const updateReadingZodSchema = z.object({
  value: z
    .unknown()
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined) return;
      if (val === null || val === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.VALUE_REQUIRED,
        });
        return;
      }
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 40 || num > 600) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.VALUE_OUT_OF_RANGE,
        });
      }
    }),
  readingDate: z
    .unknown()
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined) return;
      if (typeof val !== "string" || !DATE_REGEX.test(val.trim()) || isNaN(Date.parse(val.trim()))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.DATE_INVALID,
        });
        return;
      }
      if (isDateInFuture(val.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.DATE_FUTURE,
        });
      }
    }),
  slot: z
    .unknown()
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined) return;
      if (typeof val !== "string" || !ALLOWED_SLOTS.includes(val.trim() as ReadingSlot)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: READING_MESSAGES.SLOT_INVALID,
        });
      }
    }),
});

export function validateCreateReadingInput(data: unknown): ReadingValidationResult {
  const result = createReadingZodSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      message: result.error.issues[0]?.message || READING_MESSAGES.VALUE_REQUIRED,
    };
  }
  return { isValid: true };
}

export function validateUpdateReadingInput(data: unknown): ReadingValidationResult {
  const result = updateReadingZodSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      message: result.error.issues[0]?.message || READING_MESSAGES.VALUE_REQUIRED,
    };
  }
  return { isValid: true };
}

export function getSlotLabel(slot: ReadingSlot): string {
  return READING_SLOT_LABELS[slot] || slot;
}
