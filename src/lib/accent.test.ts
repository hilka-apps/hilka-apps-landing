import { describe, expect, it } from "vitest";
import { accentTint } from "./accent";

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
