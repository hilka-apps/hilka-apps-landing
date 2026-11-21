import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppStoreBadge from "@/components/AppStoreBadge";
import { getAllApps, getHomeContent } from "@/sanity/lib/queries";
import { preserveCase } from "@/lib/text";
import { pick, pickOr } from "@/lib/i18n";
import { accentTint } from "@/lib/accent";
import { renderAccent } from "@/lib/accentText";
import { resolveStoreUrl } from "@/config/site";
import "./landing.css";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const lang = locale as "en" | "uk";

  const [apps, home] = await Promise.all([getAllApps(), getHomeContent()]);
  // No real URL → undefined → "Coming soon" instead of Apple's badge.
  const APP_STORE_URL = resolveStoreUrl(apps[0]?.appStoreUrl);

  // Hero plates (home.heroPlates) are intentionally not rendered: they were pure
  // decoration. See docs/superpowers/specs/2026-11-21-visual-refresh-design.md.
  const heroHeading = pick(home?.heroHeading, lang);

  return (
    <div className="landing-page">
      {/* ============ HERO ============ */}
      <section className="lp-hero">
        <div className="wrap">
          <p className="eyebrow">{preserveCase(pickOr(home?.heroEyebrow, lang, t("eyebrow")))}</p>
          <h1 className="lp-h1">
            {heroHeading
              ? renderAccent(heroHeading)
              : t.rich("h1", {
                  hl: (chunks) => <span className="hl">{chunks}</span>,
                })}
          </h1>
          <p className="lead lp-sub">{pickOr(home?.heroSub, lang, t("sub"))}</p>
          <div className="btn-row lp-cta-row">
            <a className="btn btn-primary" href="#apps">
              {t("cta1")}
            </a>
            <Link className="btn btn-ghost" href="/about">
              {t("cta2")}
            </Link>
          </div>
        </div>
      </section>

      {/* ============ APPS ============ */}
      <section className="section surface apps-sec" id="apps">
        <div className="wrap">
          <div className="section-split">
            <p className="eyebrow">{pickOr(home?.appsEyebrow, lang, t("apps.eyebrow"))}</p>
            <div>
              <h2 className="h2 apps-h2">
                {renderAccent(pickOr(home?.appsHeading, lang, t("apps.h2")))}
              </h2>

              <div className="apps-col">
                {/* Apps — rendered from CMS (add a new App in Studio → card appears) */}
                {apps.map((app) => {
                  const live = !!resolveStoreUrl(app.appStoreUrl);
                  const name = pick(app.name, lang);
                  const tint = accentTint(app.accent, 24);
                  return (
                    <Link
                      key={app.slug}
                      className="appcard"
                      href={`/apps/${app.slug}`}
                      aria-label={`${name} — ${t("apps.learnMore")}`}
                    >
                      <div
                        className="ac-media"
                        style={tint ? { background: tint } : undefined}
                      >
                        {app.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="ac-icon" src={app.iconUrl} alt="" width={112} height={112} />
                        ) : (
                          <span className="ac-icon ac-icon-letter" aria-hidden="true">
                            {name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="ac-body">
                        <div className="ac-top">
                          <h3 className="ac-name">{name}</h3>
                          <span className={`ac-status${live ? " live" : ""}`}>
                            {live ? t("apps.live") : t("apps.soon")}
                          </span>
                        </div>
                        <p className="ac-kicker">{preserveCase(pick(app.kicker, lang))}</p>
                        <p className="ac-desc">{pick(app.cardDescription, lang)}</p>
                        {(app.cardChips ?? []).length > 0 && (
                          <ul className="ac-chips">
                            {(app.cardChips ?? []).map((c, j) => (
                              <li key={j} className="ac-chip">
                                {pick(c, lang)}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="ac-foot">
                          {live && <AppStoreBadge inert />}
                          <span className="ac-more">{t("apps.learnMore")}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}

                {/* What's next — honest teaser */}
                <Link className="appcard teaser" href="/contact" aria-label={t("apps.teaser.more")}>
                  <div className="ac-body">
                    <p className="ac-kicker">
                      {pickOr(home?.teaserKicker, lang, t("apps.teaser.kicker"))}
                    </p>
                    <h3 className="ac-name">
                      {pickOr(home?.teaserName, lang, t("apps.teaser.name"))}
                    </h3>
                    <p className="ac-desc">
                      {pickOr(home?.teaserDesc, lang, t("apps.teaser.desc"))}
                    </p>
                    <div className="ac-foot">
                      <span className="ac-more">{t("apps.teaser.more")}</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="section white">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <h2 className="h2">{renderAccent(pickOr(home?.ctaHeading, lang, t("cta.h2")))}</h2>
              <p className="lead">{pickOr(home?.ctaSub, lang, t("cta.sub"))}</p>
            </div>
            <AppStoreBadge href={APP_STORE_URL} />
          </div>
        </div>
      </section>
    </div>
  );
}
