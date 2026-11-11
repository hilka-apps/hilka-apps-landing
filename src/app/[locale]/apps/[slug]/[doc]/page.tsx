import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DocPage from "@/components/DocPage";
import { getApp, getAppLegalDoc } from "@/sanity/lib/queries";
import { pick, type Lang } from "@/lib/i18n";
import { pickDocContent } from "@/lib/legal";

// An app's own legal document (Privacy Policy, Terms of Use…), e.g. /uk/apps/<app>/privacy.
// These are the URLs entered in App Store Connect. Rendered on demand; Sanity fetches
// are tagged, so the revalidate webhook refreshes them.
type Params = Promise<{ locale: string; slug: string; doc: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug, doc: docSlug } = await params;
  const lang = locale as Lang;
  const [app, doc] = await Promise.all([getApp(slug), getAppLegalDoc(slug, docSlug)]);
  if (!app || !doc) return {};
  return {
    title: `${pick(doc.title, lang)} · ${pick(app.name, lang)}`,
    ...(app.hidden ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function AppLegalPage({ params }: { params: Params }) {
  const { locale, slug, doc: docSlug } = await params;
  setRequestLocale(locale);
  const lang = locale as Lang;

  const [app, doc] = await Promise.all([getApp(slug), getAppLegalDoc(slug, docSlug)]);
  const markdown = pickDocContent(doc, lang);
  if (!app || !doc || !markdown) notFound();

  const t = await getTranslations("legal");
  const updated = doc.updatedAt ? `${t("updated")} ${doc.updatedAt}` : "";
  return (
    <DocPage
      h1={`${pick(doc.title, lang)} — ${pick(app.name, lang)}`}
      updated={updated}
      markdown={markdown}
    />
  );
}
