import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppStoreBadge from "@/components/AppStoreBadge";
import { getAllApps, getHomeContent } from "@/sanity/lib/queries";
import { preserveCase } from "@/lib/text";
import { pick, pickOr } from "@/lib/i18n";
import { accentGradient } from "@/lib/accent";
import { renderAccent } from "@/lib/accentText";
import HeroMedia from "@/components/HeroMedia";
import { resolveStoreUrl } from "@/config/site";
import "./landing.css";

const CARD_GRADIENTS = [
  "linear-gradient(150deg,#0A84FF 0%,#5AA9FF 55%,#8EC5FF 100%)",
  "linear-gradient(150deg,#9B4DEB 0%,#C77DFF 55%,#E0B8FF 100%)",
  "linear-gradient(150deg,#19B559 0%,#5FE08A 55%,#A8F0C2 100%)",
];

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

  // Floating hero plates — only render the ones configured in the CMS.
  // No plates filled in → none shown (no built-in decoration).
  const plates = home?.heroPlates ?? [];
  const PLATE_POS = ["p-timer", "p-stats", "p-sounds", "p-icon"] as const;

  const heroHeading = pick(home?.heroHeading, lang);

  return (
    <div className="landing-page">
      {/* ============ SHOWCASE / HERO ============ */}
      <section className="showcase">
        <div className="plates" aria-hidden="true">
          {plates.slice(0, PLATE_POS.length).map((p, i) => {
            const pos = PLATE_POS[i];
            const style = p.style ?? "timer";
            const bg = accentGradient(p.accent, pos === "p-icon" ? 155 : 160);
            const label = pick(p.label, lang);
            const sub = pick(p.sub, lang);
            const value = pick(p.value, lang);
            return (
              <div key={pos} className={`plate ${pos}`} style={bg ? { background: bg } : undefined}>
                <div className="plate-float">
                  {p.media?.url ? (
                    <HeroMedia url={p.media.url} mime={p.media.mime} className="plate-media" />
                  ) : style === "icon" ? (
                    <div className="pl-pad">
                      <div className="live-chip">LIVE</div>
                      <div className="app-tile-emoji">{value}</div>
                    </div>
                  ) : (
                    <div className="pl-pad">
                      <div className="pl-label">{label}</div>
                      <div className="pl-sub">{sub}</div>
                      {style === "timer" && <div className="big-time">{value}</div>}
                      {style === "bars" && (
                        <div className="bars">
                          {[42, 66, 50, 88, 72, 100].map((h, j) => (
                            <i key={j} style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      )}
                      {style === "wave" && (
                        <div className="wave">
                          {[0, 0.15, 0.3, 0.1, 0.4, 0.25, 0.5, 0.2].map((d, j) => (
                            <i key={j} style={{ animationDelay: `${d}s` }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="showcase-inner">
          <span className="lp-eyebrow">
            <span className="dot" />
            <span>{preserveCase(pickOr(home?.heroEyebrow, lang, t("eyebrow")))}</span>
          </span>
          <h1 className="lp-h1">
            {heroHeading
              ? renderAccent(heroHeading)
              : t.rich("h1", {
                  serif: (chunks) => <span className="serif">{chunks}</span>,
                })}
          </h1>
          <p className="lp-sub">{pickOr(home?.heroSub, lang, t("sub"))}</p>
          <div className="lp-cta-row">
            <a className="lp-btn lp-btn-primary" href="#apps">
              {t("cta1")}
            </a>
            <Link className="lp-btn lp-btn-ghost" href="/about">
              {t("cta2")} <span className="arr">→</span>
            </Link>
          </div>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span className="mouse" />
          <span>{t("scrollCue")}</span>
        </div>
      </section>

      {/* ============ APPS ============ */}
      <section className="apps-sec" id="apps">
        <div className="apps-head center">
          <span className="lp-eyebrow">
            <span
              className="dot"
              style={{
                background: "var(--acc-coral)",
                boxShadow: "0 0 0 4px rgba(229,84,75,.18)",
              }}
            />
            {pickOr(home?.appsEyebrow, lang, t("apps.eyebrow"))}
          </span>
          <h2 className="apps-h2">
            {renderAccent(pickOr(home?.appsHeading, lang, t("apps.h2")))}
          </h2>
        </div>

        <div className="apps-col">
          {/* Apps — rendered from CMS (add a new App in Studio → card appears) */}
          {apps.map((app, i) => (
            <Link
              key={app.slug}
              className="appcard"
              href={`/apps/${app.slug}`}
              aria-label={`${pick(app.name, lang)} — ${t("apps.learnMore")}`}
            >
              <div className="ac-media">
                <div
                  className="media-bg"
                  style={{
                    background:
                      accentGradient(app.accent) ??
                      CARD_GRADIENTS[i % CARD_GRADIENTS.length],
                  }}
                />
                {/* "Live" only once the app is actually in the store. */}
                {resolveStoreUrl(app.appStoreUrl) && <span className="ac-live">{t("apps.live")}</span>}
                {app.iconUrl ? (
                  <div className="ac-scene">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={app.iconUrl}
                      alt=""
                      width={128}
                      height={128}
                      style={{ borderRadius: 28, boxShadow: "0 24px 60px rgba(0,0,0,.28)" }}
                    />
                  </div>
                ) : null}
              </div>
              <div className="ac-body">
                <span className="ac-kicker">{preserveCase(pick(app.kicker, lang))}</span>
                <h3 className="ac-name">{pick(app.name, lang)}</h3>
                <p className="ac-desc">{pick(app.cardDescription, lang)}</p>
                {(app.cardChips ?? []).length > 0 && (
                  <div className="ac-chips">
                    {(app.cardChips ?? []).map((c, j) => (
                      <span key={j} className="ac-chip">
                        {pick(c, lang)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="ac-foot">
                  <AppStoreBadge inert={!!resolveStoreUrl(app.appStoreUrl)} />
                  <span className="ac-more">
                    {t("apps.learnMore")} <span className="arr">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* What's next — honest teaser plate */}
          <Link className="appcard teaser" href="/contact" aria-label={t("apps.teaser.more")}>
            <div className="ac-body">
              <span className="ac-kicker">
                {pickOr(home?.teaserKicker, lang, t("apps.teaser.kicker"))}
              </span>
              <h3 className="ac-name">
                {pickOr(home?.teaserName, lang, t("apps.teaser.name"))}
              </h3>
              <p className="ac-desc">
                {pickOr(home?.teaserDesc, lang, t("apps.teaser.desc"))}
              </p>
              <div className="teaser-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="ac-foot">
                <span className="ac-more">
                  {t("apps.teaser.more")} <span className="arr">→</span>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ============ CLOSING CTA BAND ============ */}
      <section className="section white">
        <div className="wrap">
          <div className="cta-band accent">
            <h2 className="h2" style={{ color: "#fff" }}>
              {renderAccent(pickOr(home?.ctaHeading, lang, t("cta.h2")))}
            </h2>
            <p className="lead" style={{ margin: "14px auto 30px", maxWidth: 480 }}>
              {pickOr(home?.ctaSub, lang, t("cta.sub"))}
            </p>
            <div className="btn-row" style={{ justifyContent: "center" }}>
              <AppStoreBadge href={APP_STORE_URL} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
