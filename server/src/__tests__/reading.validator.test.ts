import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateCreateReadingInput,
  validateUpdateReadingInput,
  isDateInFuture,
} from "../validators/reading.validator.js";
import { READING_MESSAGES } from "../constants/messages.js";

describe("Reading Validators", () => {
  describe("validateCreateReadingInput", () => {
    it("should fail when value is missing", () => {
      const result = validateCreateReadingInput({
        readingDate: "2026-10-15",
        slot: "MORNING",
      });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.VALUE_REQUIRED);
    });

    it("should fail when value is below 40", () => {
      const result = validateCreateReadingInput({
        readingDate: "2026-10-15",
        slot: "MORNING",
        value: 39,
      });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.VALUE_OUT_OF_RANGE);
    });

    it("should fail when value is above 600", () => {
      const result = validateCreateReadingInput({
        readingDate: "2026-10-15",
        slot: "MORNING",
        value: 601,
      });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.VALUE_OUT_OF_RANGE);
    });

    it("should fail when value is not a whole number", () => {
      const result = validateCreateReadingInput({
        readingDate: "2026-10-15",
        slot: "MORNING",
        value: 120.5,
      });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.VALUE_OUT_OF_RANGE);
    });

    it("should fail when date is missing", () => {
      const result = validateCreateReadingInput({
        slot: "MORNING",
        value: 120,
      });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.DATE_REQUIRED);
    });

    it("should fail when date is in the future", () => {
      const futureDate = "2099-01-01";
      const result = validateCreateReadingInput({
        readingDate: futureDate,
        slot: "MORNING",
        value: 120,
      });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.DATE_FUTURE);
    });

    it("should fail when slot is missing", () => {
      const result = validateCreateReadingInput({
        readingDate: "2026-10-15",
        value: 120,
      });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.SLOT_REQUIRED);
    });

    it("should fail when slot is invalid", () => {
      const result = validateCreateReadingInput({
        readingDate: "2026-10-15",
        slot: "INVALID_SLOT",
        value: 120,
      });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.SLOT_INVALID);
    });

    it("should pass when all inputs meet requirements", () => {
      const result = validateCreateReadingInput({
        readingDate: "2026-10-15",
        slot: "AFTER_LUNCH",
        value: 145,
      });
      assert.equal(result.isValid, true);
      assert.equal(result.message, undefined);
    });
  });

  describe("isDateInFuture helper", () => {
    it("should identify past dates correctly", () => {
      assert.equal(isDateInFuture("2020-01-01"), false);
    });

    it("should identify future dates correctly", () => {
      assert.equal(isDateInFuture("2099-12-31"), true);
    });
  });

  describe("validateUpdateReadingInput", () => {
    it("should allow partial valid updates", () => {
      const result = validateUpdateReadingInput({ value: 130 });
      assert.equal(result.isValid, true);
    });

    it("should reject invalid value on update", () => {
      const result = validateUpdateReadingInput({ value: 20 });
      assert.equal(result.isValid, false);
      assert.equal(result.message, READING_MESSAGES.VALUE_OUT_OF_RANGE);
    });
  });
});
