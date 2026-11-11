import { describe, expect, it } from "vitest";
import { EMAIL_RE, MESSAGE_MAX, validateContact } from "./contact";

const valid = { name: "Mila", email: "a@b.co", message: "Hello" };

describe("validateContact", () => {
  it("flags every required field on an empty payload", () => {
    expect(validateContact({})).toEqual({
      name: "required",
      email: "required",
      message: "required",
    });
  });
  it("treats whitespace-only values as missing", () => {
    expect(validateContact({ ...valid, name: "   ", message: "\n\t" })).toEqual({
      name: "required",
      message: "required",
    });
  });
  it("rejects a malformed email", () => {
    expect(validateContact({ ...valid, email: "nope" })).toEqual({ email: "invalidEmail" });
    expect(validateContact({ ...valid, email: "a@b" })).toEqual({ email: "invalidEmail" });
  });
  it("accepts an email with surrounding spaces (trimmed)", () => {
    expect(validateContact({ ...valid, email: "  a@b.co " })).toEqual({});
  });
  it("rejects a non-string email", () => {
    expect(validateContact({ ...valid, email: 42 })).toEqual({ email: "invalidEmail" });
  });
  it("passes a valid payload", () => {
    expect(validateContact(valid)).toEqual({});
  });
});

describe("contact constants", () => {
  it("caps messages at 500 characters", () => {
    expect(MESSAGE_MAX).toBe(500);
  });
  it("exposes the shared email pattern", () => {
    expect(EMAIL_RE.test("x@y.io")).toBe(true);
    expect(EMAIL_RE.test("x y@z.io")).toBe(false);
  });
});
