import { describe, expect, it } from "vitest";
import { EMAIL_RE, validateContact } from "./contact";

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
  it("treats non-string values as missing", () => {
    expect(validateContact({ ...valid, name: false, message: 0 })).toEqual({
      name: "required",
      message: "required",
    });
  });
  it("treats a non-string email as missing", () => {
    expect(validateContact({ ...valid, email: 42 })).toEqual({ email: "required" });
  });
  it("passes a valid payload", () => {
    expect(validateContact(valid)).toEqual({});
  });
});

describe("contact constants", () => {
  it("exposes the shared email pattern", () => {
    expect(EMAIL_RE.test("x@y.io")).toBe(true);
    expect(EMAIL_RE.test("x y@z.io")).toBe(false);
  });
});
