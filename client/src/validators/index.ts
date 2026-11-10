import { z } from "zod";
import { VALIDATION_MESSAGES } from "../constants/messages.js";

const todayStr = new Date().toISOString().split("T")[0];

export const loginZodSchema = z.object({
  email: z
    .string({ message: VALIDATION_MESSAGES.EMAIL_REQUIRED })
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.EMAIL_REQUIRED })
    .email({ message: VALIDATION_MESSAGES.EMAIL_INVALID }),
  password: z
    .string({ message: VALIDATION_MESSAGES.PASSWORD_REQUIRED })
    .min(1, { message: VALIDATION_MESSAGES.PASSWORD_REQUIRED }),
});

export const registerZodSchema = z.object({
  name: z
    .string({ message: VALIDATION_MESSAGES.NAME_REQUIRED })
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.NAME_REQUIRED }),
  email: z
    .string({ message: VALIDATION_MESSAGES.EMAIL_REQUIRED })
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.EMAIL_REQUIRED })
    .email({ message: VALIDATION_MESSAGES.EMAIL_INVALID }),
  password: z
    .string({ message: VALIDATION_MESSAGES.PASSWORD_REQUIRED })
    .min(1, { message: VALIDATION_MESSAGES.PASSWORD_REQUIRED })
    .min(6, { message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH }),
});

export const readingZodSchema = z.object({
  readingDate: z
    .string({ message: VALIDATION_MESSAGES.DATE_REQUIRED })
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.DATE_REQUIRED })
    .refine((d) => d <= todayStr, {
      message: VALIDATION_MESSAGES.DATE_FUTURE,
    }),
  slot: z
    .string({ message: VALIDATION_MESSAGES.SLOT_REQUIRED })
    .trim()
    .min(1, { message: VALIDATION_MESSAGES.SLOT_REQUIRED }),
  value: z
    .unknown()
    .superRefine((val, ctx) => {
      if (val === undefined || val === null || val === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_MESSAGES.VALUE_REQUIRED,
        });
        return;
      }
      const num = Number(val);
      if (isNaN(num) || !Number.isInteger(num) || num < 40 || num > 600) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: VALIDATION_MESSAGES.VALUE_OUT_OF_RANGE,
        });
      }
    }),
});
