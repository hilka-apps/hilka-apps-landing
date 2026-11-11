import { describe, expect, it } from "vitest";
import { resolveStoreUrl } from "./site";

describe("resolveStoreUrl", () => {
  it("treats an empty value as not set", () => {
    expect(resolveStoreUrl(undefined)).toBeUndefined();
    expect(resolveStoreUrl(null)).toBeUndefined();
    expect(resolveStoreUrl("")).toBeUndefined();
  });
  it("treats the id000000000 placeholder as not set", () => {
    expect(resolveStoreUrl("https://apps.apple.com/app/id000000000")).toBeUndefined();
  });
  it("returns a real App Store URL unchanged", () => {
    const url = "https://apps.apple.com/app/arttick/id1234567890";
    expect(resolveStoreUrl(url)).toBe(url);
  });
});
