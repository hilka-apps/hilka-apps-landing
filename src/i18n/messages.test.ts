import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import uk from "../../messages/uk.json";

type Tree = { [key: string]: unknown } | unknown[];

// Flattens objects AND arrays (index keys) — deepMerge replaces arrays wholesale,
// so a UK array item missing a field gets no EN fallback and must be caught here.
function flatten(tree: Tree, prefix = ""): Record<string, unknown> {
  return Object.entries(tree).reduce<Record<string, unknown>>((acc, [k, v]) => {
    const key = prefix + k;
    if (v && typeof v === "object") Object.assign(acc, flatten(v as Tree, `${key}.`));
    else acc[key] = v;
    return acc;
  }, {});
}

const enFlat = flatten(en);
const ukFlat = flatten(uk);

describe("translations", () => {
  it("UK has every EN key", () => {
    expect(Object.keys(enFlat).filter((k) => !(k in ukFlat))).toEqual([]);
  });
  it("UK has no keys that EN lacks", () => {
    expect(Object.keys(ukFlat).filter((k) => !(k in enFlat))).toEqual([]);
  });
  it("no UK string is empty", () => {
    expect(Object.entries(ukFlat).filter(([, v]) => typeof v === "string" && !v.trim())).toEqual([]);
  });
});
