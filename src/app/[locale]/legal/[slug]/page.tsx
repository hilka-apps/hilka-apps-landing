import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import DocPage from "@/components/DocPage";
import { getLegalDoc, getAllLegalDocs, getBrand } from "@/sanity/lib/queries";
import { pick, type Lang } from "@/lib/i18n";
import { pickDocContent } from "@/lib/legal";

// Site-wide documents only (no app). App documents live at /apps/<app>/<slug>.
export async function generateStaticParams() {
  const docs = await getAllLegalDocs();
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lang = locale as Lang;
  const [doc, brand] = await Promise.all([getLegalDoc(slug), getBrand()]);
  const title = pick(doc?.title, lang);
  if (!title) return {};
  return { title: `${title} · ${brand.siteName}` };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale as Lang;
  const t = await getTranslations("legal");

  const doc = await getLegalDoc(slug);
  // Empty (or missing) document → 404. Never placeholder text.
  const markdown = pickDocContent(doc, lang);
  if (!doc || !markdown) notFound();

  const updated = doc.updatedAt ? `${t("updated")} ${doc.updatedAt}` : "";
  return <DocPage h1={pick(doc.title, lang)} updated={updated} markdown={markdown} />;
}
