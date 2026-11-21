import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAboutContent, getAllApps } from "@/sanity/lib/queries";
import { pick, pickOr } from "@/lib/i18n";
import { renderAccent } from "@/lib/accentText";
import "./about.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale as "en" | "uk";
  const t = await getTranslations("about");
  const [about, apps] = await Promise.all([getAboutContent(), getAllApps()]);
  // CTA points at the first live app; falls back to the apps list if none.
  const ctaHref = apps[0] ? `/apps/${apps[0].slug}` : "/#apps";

  // Fallback to the translation file when a CMS field is empty.
  const tValues = t.raw("values.items") as Array<{ title: string; desc: string }>;
  const cmsValues = about?.valueItems ?? [];
  const values =
    cmsValues.length > 0
      ? cmsValues.map((v) => ({ title: pick(v.title, lang), desc: pick(v.desc, lang) }))
      : tValues;

  const heroHeading = pick(about?.heroHeading, lang);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="section white page-hero about-hero">
        <div className="wrap">
          <p className="eyebrow">{pickOr(about?.heroEyebrow, lang, t("eyebrow"))}</p>
          <h1 className="h1 page-h1">
            {heroHeading
              ? renderAccent(heroHeading)
              : t.rich("h1", {
                  hl: (chunks) => <span className="hl">{chunks}</span>,
                })}
          </h1>
          <p className="lead">{pickOr(about?.heroLead, lang, t("lead"))}</p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="section surface">
        <div className="wrap">
          <p className="about-story">{pickOr(about?.story, lang, t("story"))}</p>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="section white">
        <div className="wrap">
          <div className="section-split">
            <p className="eyebrow">{pickOr(about?.valuesEyebrow, lang, t("values.eyebrow"))}</p>
            <h2 className="h2 section-head">
              {renderAccent(pickOr(about?.valuesHeading, lang, t("values.h2")))}
            </h2>
          </div>
          <div className="indent grid grid-3">
            {values.map((v, i) => (
              <div key={i} className="info-card">
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section white">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <h2 className="h2">{renderAccent(pickOr(about?.ctaHeading, lang, t("cta.h2")))}</h2>
              <p className="lead">{pickOr(about?.ctaSub, lang, t("cta.sub"))}</p>
            </div>
            <Link className="btn btn-primary" href={ctaHref}>
              {pickOr(about?.ctaLabel, lang, t("cta.cta"))}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
