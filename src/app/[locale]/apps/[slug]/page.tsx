import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AppStoreBadge from "@/components/AppStoreBadge";
import AppSections from "@/components/AppSections";
import AnchorLink from "@/components/AnchorLink";
import { getApp, getAllApps, getAppLegalDocs, getBrand } from "@/sanity/lib/queries";
import AppTabs from "@/components/AppTabs";
import { preserveCase } from "@/lib/text";
import { pick } from "@/lib/i18n";
import { accentTint } from "@/lib/accent";
import { renderAccent } from "@/lib/accentText";
import HeroMedia from "@/components/HeroMedia";
import { resolveStoreUrl } from "@/config/site";
import "./app.css";

export async function generateStaticParams() {
  const apps = await getAllApps();
  return apps.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const lang = locale as "en" | "uk";
  const [app, brand] = await Promise.all([getApp(slug), getBrand()]);
  if (!app) return {};
  const name = pick(app.name, lang) || brand.siteName;
  return {
    title: `${name} · ${brand.siteName}`,
    description: pick(app.heroSubtitle, lang) || undefined,
    // Hidden apps stay previewable by direct URL but must never be indexed.
    ...(app.hidden ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale as "en" | "uk";

  const [app, legalDocs] = await Promise.all([getApp(slug), getAppLegalDocs(slug)]);
  if (!app) notFound();

  const t = await getTranslations("appPage");
  const tHeader = await getTranslations("header");

  // No real URL → undefined → a "Coming soon" tag and launch CTAs, never Apple's badge.
  const appStoreUrl = resolveStoreUrl(app.appStoreUrl);
  const heroH1 = pick(app.heroH1, lang);

  // Hero visual: the phone only frames a real screenshot/video (screenMedia). Without
  // one, the app icon sits on an accent-tinted tile, like the home card. The floating
  // heroChips and the screen text fields are not rendered (see the visual-refresh spec).
  const tint = accentTint(app.accent, 30);
  const appName = pick(app.name, lang);
  const hasHowItWorks = (app.sections ?? []).some((s) => s._type === "howItWorksSection");

  return (
    <div className="fp-page">
      <AppTabs slug={slug} docs={legalDocs} current="overview" lang={lang} />
      {/* Hidden apps aren't linked anywhere — this direct URL is the preview. */}
      {app.hidden ? (
        <div className="fp-preview-flag" role="status">
          {t("hiddenPreview")}
        </div>
      ) : null}
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="fp-hero">
        <div className="fp-hero-grid wrap">
          <div className="fp-copy">
            <p className="eyebrow fp-eyebrow">
              {app.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="fp-icon" src={app.iconUrl} alt="" width={40} height={40} />
              ) : null}
              <span>
                <span className="fp-name">{appName}</span>
                <span className="fp-kicker">{preserveCase(pick(app.kicker, lang))}</span>
              </span>
              {!appStoreUrl && <span className="status-tag">{t("comingSoon")}</span>}
            </p>
            <h1 className="fp-h1">{renderAccent(heroH1)}</h1>
            <p className="fp-sub">{pick(app.heroSubtitle, lang)}</p>
            {(appStoreUrl || hasHowItWorks) && (
              <div className="fp-cta-row">
                <AppStoreBadge href={appStoreUrl} />
                {/* only when the target exists, or the link would go nowhere; it is the
                    main action until the app is in the store */}
                {hasHowItWorks && (
                  <AnchorLink
                    className={`btn ${appStoreUrl ? "btn-secondary" : "btn-primary"}`}
                    href="#how-it-works"
                  >
                    {t("howItWorks")}
                  </AnchorLink>
                )}
              </div>
            )}
          </div>

          <div className="fp-stage">
            {app.screenMedia?.url ? (
              <div className="fp-phone">
                <div className="fp-screen" style={tint ? { background: tint } : undefined}>
                  <div className="fp-notch" />
                  <HeroMedia
                    url={app.screenMedia.url}
                    mime={app.screenMedia.mime}
                    className="fp-screen-media"
                  />
                </div>
              </div>
            ) : (
              <div className="fp-tile" style={tint ? { background: tint } : undefined}>
                {app.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="fp-tile-icon" src={app.iconUrl} alt="" width={160} height={160} />
                ) : (
                  <span className="fp-tile-icon fp-tile-letter" aria-hidden="true">
                    {appName.charAt(0)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── REORDERABLE SECTIONS (from CMS) ──────────────── */}
      <AppSections
        sections={app.sections ?? []}
        lang={lang}
        appStoreUrl={appStoreUrl}
        downloadLabel={tHeader("cta")}
        contactLabel={t("contact")}
        launchLabel={t("launch")}
      />
    </div>
  );
}
