import { describe, expect, it } from "vitest";
import { accentGradient, accentTint } from "./accent";

describe("accentGradient", () => {
  it("returns undefined without a color so callers use their default", () => {
    expect(accentGradient(null)).toBeUndefined();
    expect(accentGradient(undefined)).toBeUndefined();
    expect(accentGradient("")).toBeUndefined();
  });
  it("builds a two-stop gradient with a derived lighter stop", () => {
    const g = accentGradient("#112233");
    expect(g).toContain("150deg");
    expect(g).toContain("#112233 0%");
    expect(g).toContain("color-mix(in srgb, #112233 52%, #fff) 100%");
  });
  it("honours a custom angle", () => {
    expect(accentGradient("#000", 90)).toMatch(/^linear-gradient\(90deg/);
  });
});

describe("accentTint", () => {
  it("returns undefined without a color so callers use their default", () => {
    expect(accentTint(null)).toBeUndefined();
    expect(accentTint("")).toBeUndefined();
  });
  it("mixes the accent with white as a solid color", () => {
    expect(accentTint("#112233")).toBe("color-mix(in srgb, #112233 22%, #fff)");
    expect(accentTint("#112233", 100)).toBe("color-mix(in srgb, #112233 100%, #fff)");
  });
});
