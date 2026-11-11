import type { Lang } from "./i18n";

export type DocContent = { contentEn?: string | null; contentUk?: string | null };

const filled = (s?: string | null) => (s && s.trim() ? s : null);

/**
 * Markdown for a legal document in the requested language, falling back to the
 * other language. `null` means the document is empty and must not be shown —
 * we render a 404 rather than placeholder text (App Review opens these URLs).
 */
export function pickDocContent(doc: DocContent | null | undefined, lang: Lang): string | null {
  if (!doc) return null;
  const [first, second] = lang === "uk" ? [doc.contentUk, doc.contentEn] : [doc.contentEn, doc.contentUk];
  return filled(first) ?? filled(second);
}

export function hasContent(doc: DocContent | null | undefined): boolean {
  return pickDocContent(doc, "en") !== null;
}
