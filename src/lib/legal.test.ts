import { describe, expect, it } from "vitest";
import { hasContent, pickDocContent } from "./legal";

describe("pickDocContent", () => {
  it("returns the requested language", () => {
    expect(pickDocContent({ contentEn: "E", contentUk: "U" }, "uk")).toBe("U");
    expect(pickDocContent({ contentEn: "E", contentUk: "U" }, "en")).toBe("E");
  });
  it("falls back to the other language when the requested one is blank", () => {
    expect(pickDocContent({ contentEn: "E", contentUk: "  " }, "uk")).toBe("E");
    expect(pickDocContent({ contentUk: "U" }, "en")).toBe("U");
  });
  it("returns null when neither language has content", () => {
    expect(pickDocContent({}, "en")).toBeNull();
    expect(pickDocContent({ contentEn: "", contentUk: null }, "uk")).toBeNull();
    expect(pickDocContent(null, "en")).toBeNull();
  });
});

describe("hasContent", () => {
  it("is false for blank or missing content", () => {
    expect(hasContent({ contentEn: " " })).toBe(false);
    expect(hasContent(undefined)).toBe(false);
  });
  it("is true when either language is filled", () => {
    expect(hasContent({ contentUk: "x" })).toBe(true);
  });
});
