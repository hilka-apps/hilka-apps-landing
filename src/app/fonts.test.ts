import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// next/font loaders only run inside the Next compiler, so check the source:
// every web font must ship Cyrillic, or Ukrainian pages fall back to a system font.
const src = readFileSync(join(__dirname, "fonts.ts"), "utf8");

describe("web fonts", () => {
  it("loads at least one font", () => {
    expect(src.match(/next\/font\/google/)).not.toBeNull();
  });
  it("every font includes the cyrillic subset", () => {
    const subsets = [...src.matchAll(/subsets:\s*\[([^\]]*)\]/g)].map((m) => m[1]);
    expect(subsets.length).toBeGreaterThan(0);
    for (const list of subsets) expect(list).toContain('"cyrillic"');
  });
});
