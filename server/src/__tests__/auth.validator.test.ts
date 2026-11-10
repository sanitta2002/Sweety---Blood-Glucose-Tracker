import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateRegisterInput, validateLoginInput } from "../validators/auth.validator.js";

describe("Auth Validators", () => {
  describe("validateRegisterInput", () => {
    it("should fail when name is empty", () => {
      const result = validateRegisterInput({ name: "", email: "user@example.com", password: "password123" });
      assert.equal(result.isValid, false);
      assert.equal(result.message, "Name is required.");
    });

    it("should fail when name is too short", () => {
      const result = validateRegisterInput({ name: "A", email: "user@example.com", password: "password123" });
      assert.equal(result.isValid, false);
      assert.equal(result.message, "Name must be at least 2 characters long.");
    });

    it("should fail when email is invalid", () => {
      const result = validateRegisterInput({ name: "Alice", email: "not-an-email", password: "password123" });
      assert.equal(result.isValid, false);
      assert.equal(result.message, "Please enter a valid email address.");
    });

    it("should fail when password is less than 6 characters", () => {
      const result = validateRegisterInput({ name: "Alice", email: "alice@example.com", password: "123" });
      assert.equal(result.isValid, false);
      assert.equal(result.message, "Password must be at least 6 characters long.");
    });

    it("should pass when all inputs are valid", () => {
      const result = validateRegisterInput({ name: "Alice Doe", email: "alice@example.com", password: "password123" });
      assert.equal(result.isValid, true);
      assert.equal(result.message, undefined);
    });
  });

  describe("validateLoginInput", () => {
    it("should fail when email is missing", () => {
      const result = validateLoginInput({ email: "", password: "password123" });
      assert.equal(result.isValid, false);
      assert.equal(result.message, "Email is required.");
    });

    it("should fail when password is missing", () => {
      const result = validateLoginInput({ email: "user@example.com", password: "" });
      assert.equal(result.isValid, false);
      assert.equal(result.message, "Password is required.");
    });

    it("should pass when email and password are valid", () => {
      const result = validateLoginInput({ email: "user@example.com", password: "password123" });
      assert.equal(result.isValid, true);
    });
  });
});
