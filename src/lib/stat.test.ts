import { describe, expect, it } from "vitest";
import { formatStat } from "./stat";

// Intl output uses no-break spaces (U+00A0 / U+202F) as Ukrainian group separators.
const norm = (s: string) => s.replace(/[  ]/g, " ");

describe("formatStat", () => {
  it("regroups a number for the locale and keeps the suffix", () => {
    expect(norm(formatStat("12,000+", "uk"))).toBe("12 000+");
    expect(formatStat("12,000+", "en")).toBe("12,000+");
    expect(formatStat("12000", "en")).toBe("12,000");
  });
  it("keeps a prefix and a decimal part", () => {
    expect(formatStat("4.8", "uk")).toBe("4,8");
    expect(formatStat("~1500 hours", "en")).toBe("~1,500 hours");
  });
  it("leaves values that are not a plain number alone", () => {
    expect(formatStat("24/7", "uk")).toBe("24/7");
    expect(formatStat("No. 1", "uk")).toBe("No. 1");
    expect(formatStat("1.2.3", "en")).toBe("1.2.3");
    expect(formatStat("", "en")).toBe("");
  });
});
