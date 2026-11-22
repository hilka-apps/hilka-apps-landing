import type { Lang } from "./i18n";

export type DocContent = { contentEn?: string | null; contentUk?: string | null };

const filled = (s?: string | null) => (s && s.trim() ? s : null);

/**
 * Markdown for a legal document in the requested language, falling back to the
 * other language, plus the language the body is actually in (so a fallback can be
 * marked with `lang` and a note). `null` means the document is empty and must not be
 * shown — we render a 404 rather than placeholder text (App Review opens these URLs).
 */
export function pickDocBody(
  doc: DocContent | null | undefined,
  lang: Lang
): { markdown: string; lang: Lang } | null {
  if (!doc) return null;
  const other: Lang = lang === "uk" ? "en" : "uk";
  const text = (l: Lang) => filled(l === "uk" ? doc.contentUk : doc.contentEn);
  const own = text(lang);
  if (own) return { markdown: own, lang };
  const fallback = text(other);
  return fallback ? { markdown: fallback, lang: other } : null;
}

/** Just the markdown of `pickDocBody`. */
export function pickDocContent(doc: DocContent | null | undefined, lang: Lang): string | null {
  return pickDocBody(doc, lang)?.markdown ?? null;
}

export function hasContent(doc: DocContent | null | undefined): boolean {
  return pickDocContent(doc, "en") !== null;
}

/** Keep only documents that would actually render — the single "has content" rule (GROQ can't trim). */
export function onlyFilled<T extends DocContent>(docs: T[]): T[] {
  return docs.filter(hasContent);
}

// Static routes under /apps/<app>/ win over the [doc] route, so these slugs could never be opened.
// "overview" would collide with the Overview tab in the app tab row.
const RESERVED_APP_DOC_SLUGS = new Set(["support", "overview"]);

export function isReservedAppDocSlug(slug: string): boolean {
  return RESERVED_APP_DOC_SLUGS.has(slug);
}
