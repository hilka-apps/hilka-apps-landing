import { describe, expect, it } from "vitest";
import { resolveStoreUrl, siteConfig } from "./site";

describe("resolveStoreUrl", () => {
  const fallback = siteConfig.appStoreFallbackUrl ?? undefined;

  it("treats an empty value as not set", () => {
    expect(resolveStoreUrl(undefined)).toBe(fallback);
    expect(resolveStoreUrl(null)).toBe(fallback);
    expect(resolveStoreUrl("")).toBe(fallback);
  });
  it("treats the id000000000 placeholder as not set", () => {
    expect(resolveStoreUrl("https://apps.apple.com/app/id000000000")).toBe(fallback);
  });
  it("returns a real App Store URL unchanged", () => {
    const url = "https://apps.apple.com/app/arttick/id1234567890";
    expect(resolveStoreUrl(url)).toBe(url);
  });
});
