import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// "Hylka" was a misspelling of the studio name — it must not come back in code or UI strings.
const ROOT = join(__dirname, "..");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

describe("brand", () => {
  it("never spells the studio as Hylka in src/ or messages/", () => {
    const candidates = [...files(join(ROOT, "src")), ...files(join(ROOT, "messages"))].filter(
      (p) => !/\.test\.[tj]sx?$/.test(p)
    );
    const offenders = candidates.filter((p) => /hylka/i.test(readFileSync(p, "utf8")));
    expect(offenders.map((p) => p.replace(ROOT + "/", ""))).toEqual([]);
  });
});
