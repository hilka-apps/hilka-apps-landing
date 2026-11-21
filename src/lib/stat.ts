import type { Lang } from "./i18n";

// "12,000+" → "12 000+" in uk: an optional non-digit prefix, one number (with optional
// en-style thousands commas and a decimal part), an optional non-digit suffix.
const STAT = /^(\D*?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(\D*)$/;

/**
 * Re-format the number in a CMS stat value for the page locale. Anything that is not
 * a single plain number ("24/7", "1.2.3") is returned unchanged.
 */
export function formatStat(value: string, lang: Lang): string {
  const m = value.match(STAT);
  if (!m) return value;
  const [, prefix, int, frac = "", suffix] = m;
  const n = Number(int.replace(/,/g, "") + frac);
  if (!Number.isFinite(n)) return value;
  const digits = Math.max(frac.length - 1, 0);
  const formatted = new Intl.NumberFormat(lang, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
  return `${prefix}${formatted}${suffix}`;
}
