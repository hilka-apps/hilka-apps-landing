import { describe, expect, it } from "vitest";
import { deepMerge } from "./merge";

describe("deepMerge", () => {
  it("overrides nested keys while keeping base siblings (EN fallback)", () => {
    expect(deepMerge({ a: { x: 1, y: 2 }, b: 1 }, { a: { y: 3 } })).toEqual({
      a: { x: 1, y: 3 },
      b: 1,
    });
  });
  it("replaces arrays instead of merging them", () => {
    expect(deepMerge({ list: [1, 2, 3] }, { list: [9] })).toEqual({ list: [9] });
  });
  it("does not mutate the base object", () => {
    const base = { a: { x: 1 } };
    deepMerge(base, { a: { x: 2 } });
    expect(base).toEqual({ a: { x: 1 } });
  });
});
