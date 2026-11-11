import type { AppSection } from "@/sanity/lib/queries";
import { pick, type Lang } from "./i18n";

export type FaqEntry = { q: string; a: string };

/** All FAQ items of an app (across every FAQ section), localized; blank questions dropped. */
export function collectFaq(sections: AppSection[] | undefined, lang: Lang): FaqEntry[] {
  return (sections ?? [])
    .flatMap((s) => (s._type === "faqSection" ? s.items ?? [] : []))
    .map((item) => ({ q: pick(item.q, lang).trim(), a: pick(item.a, lang) }))
    .filter((item) => item.q);
}
