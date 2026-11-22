import { describe, expect, it } from "vitest";
import { formatStat } from "./stat";

describe("formatStat leaves 4-digit numbers ungrouped", () => {
  it.each([
    ["Since 2019", "en", "Since 2019"],
    ["2019", "uk", "2019"],
    ["12,000+", "uk", "12 000+"],
  ] as const)("%s (%s) → %s", (value, lang, expected) => {
    expect(formatStat(value, lang).replace(/ | /g, " ")).toBe(expected);
  });
});
