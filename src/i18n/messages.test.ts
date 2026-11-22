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

// Ukrainian copy conventions (see docs/superpowers/specs/2026-11-21-visual-refresh-design.md §8).
const ukStrings = Object.entries(ukFlat).filter((e): e is [string, string] => typeof e[1] === "string");
const enStrings = Object.entries(enFlat).filter((e): e is [string, string] => typeof e[1] === "string");
const offenders = (re: RegExp, list = ukStrings) => list.filter(([, v]) => re.test(v)).map(([k]) => k);

describe("Ukrainian copy", () => {
  it("uses the typographic apostrophe ’, not a straight ' or modifier ʼ", () => {
    expect(offenders(/['ʼ]/)).toEqual([]);
  });
  it("says “застосунок”, never “додаток” or “апка”", () => {
    // "додатковий" (additional) is fine; the noun "додаток" (app) is not
    expect(offenders(/(^|[^\p{L}])(додат(ок|ку|ком|ки|ків|кам|ках|ками)|апк\p{L}*)([^\p{L}]|$)/iu)).toEqual([]);
  });
  it("addresses the reader formally (ви), never ти", () => {
    expect(offenders(/(^|[^\p{L}])(ти|тебе|тобі|твій|твоя|твоє|твої|твоїм|твоєму|твоїх)([^\p{L}]|$)/iu)).toEqual([]);
    // imperatives in the ти form: Спробуй, Дізнайся, Подивись, Напиши…
    expect(offenders(/(^|[^\p{L}])(спробуй|дізнайся|подивись|напиши|зв’яжись|завантаж|обери)([^\p{L}]|$)/iu)).toEqual([]);
  });
  it("is gender-neutral to the reader", () => {
    expect(offenders(/першою|першим/i)).toEqual([]);
  });
});

describe("headings", () => {
  // Label headings (section names) take no full stop; sentence-style headlines may.
  const LABEL_HEADINGS = ["about.values.h2", "support.faqHeading"];
  it("label headings end without a full stop", () => {
    for (const key of LABEL_HEADINGS) {
      expect(String(enFlat[key]), key).not.toMatch(/\.$/);
      expect(String(ukFlat[key]), key).not.toMatch(/\.$/);
    }
  });
  it("EN UI labels use sentence case", () => {
    expect(offenders(/\b(Get the App|Learn More|Send Message)\b/, enStrings)).toEqual([]);
  });
});
