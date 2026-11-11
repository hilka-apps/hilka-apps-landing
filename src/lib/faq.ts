import type { AppSection } from "@/sanity/lib/queries";
import { pick, type Lang } from "./i18n";

export type FaqEntry = { q: string; a: string };

/** All FAQ items of an app (across every FAQ section), localized; items missing a question or answer dropped. */
export function collectFaq(sections: AppSection[] | undefined, lang: Lang): FaqEntry[] {
  return (sections ?? [])
    .flatMap((s) => (s._type === "faqSection" ? s.items ?? [] : []))
    .map((item) => ({ q: pick(item.q, lang).trim(), a: pick(item.a, lang).trim() }))
    .filter((item) => item.q && item.a);
}
