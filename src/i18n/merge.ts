export type Messages = Record<string, unknown>;

// Deep-merge so any key missing in a non-default locale falls back to English.
// Arrays and primitives in `override` replace the base value; `base` is not mutated.
export function deepMerge(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const key of Object.keys(override)) {
    const b = base[key];
    const o = override[key];
    out[key] =
      b && o && typeof b === "object" && typeof o === "object" && !Array.isArray(o)
        ? deepMerge(b as Messages, o as Messages)
        : o;
  }
  return out;
}
