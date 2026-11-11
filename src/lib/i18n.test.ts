import { describe, expect, it } from "vitest";
import { pick, pickOr } from "./i18n";

describe("pick", () => {
  it("returns the requested locale", () => {
    expect(pick({ en: "Hi", uk: "Привіт" }, "uk")).toBe("Привіт");
  });
  it("falls back to English when the locale is missing", () => {
    expect(pick({ en: "Hi" }, "uk")).toBe("Hi");
  });
  it("returns an empty string for an undefined field", () => {
    expect(pick(undefined, "en")).toBe("");
  });
});

describe("pickOr", () => {
  it("uses the fallback when the value is blank", () => {
    expect(pickOr({ en: "  " }, "en", "fb")).toBe("fb");
  });
  it("uses the fallback when the field is missing", () => {
    expect(pickOr(undefined, "uk", "fb")).toBe("fb");
  });
  it("keeps a filled localized value", () => {
    expect(pickOr({ uk: "X" }, "uk", "fb")).toBe("X");
  });
});
