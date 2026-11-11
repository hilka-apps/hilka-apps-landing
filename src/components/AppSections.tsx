import { PortableText } from "@portabletext/react";
import { Link } from "@/i18n/navigation";
import AppStoreBadge from "@/components/AppStoreBadge";
import FaqAccordion from "@/components/FaqAccordion";
import HeroMedia from "@/components/HeroMedia";
import type { AppSection } from "@/sanity/lib/queries";
import { pick } from "@/lib/i18n";
import { renderAccent } from "@/lib/accentText";

const STEP_COLORS = [
  "linear-gradient(150deg,#0A84FF,#5AA9FF)",
  "linear-gradient(150deg,#9B4DEB,#C77DFF)",
  "linear-gradient(150deg,#19B559,#5FE08A)",
];

export default function AppSections({
  sections,
  lang,
  appStoreUrl,
  downloadLabel,
  contactLabel,
}: {
  sections: AppSection[];
  lang: "en" | "uk";
  appStoreUrl?: string;
  downloadLabel: string;
  contactLabel: string;
}) {
  return (
    <>
      {sections.map((s) => {
        switch (s._type) {
          case "howItWorksSection":
            return (
              <section key={s._key} className="section surface" id="how-it-works">
                <div className="wrap">
                  <div className="section-head center">
                    <p className="eyebrow blue">{pick(s.eyebrow, lang)}</p>
                    <h2 className="h2">{pick(s.heading, lang)}</h2>
                  </div>
                  <div className="fp-steps">
                    {(s.steps ?? []).map((step, i) => (
                      <div key={i} className="fp-step">
                        <div className="fp-step-num" style={{ background: STEP_COLORS[i % STEP_COLORS.length] }}>
                          {i + 1}
                        </div>
                        <h3 className="fp-step-title">{pick(step.title, lang)}</h3>
                        <p className="fp-step-desc">{pick(step.desc, lang)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "statSection":
            return (
              <section key={s._key} className="section white">
                <div className="wrap">
                  <div className="fp-stat-band">
                    <div className="fp-stat-number">{s.number}</div>
                    <p className="fp-stat-label">{pick(s.label, lang)}</p>
                    {appStoreUrl ? (
                      <a className="btn btn-primary" href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                        {downloadLabel}
                      </a>
                    ) : (
                      <AppStoreBadge />
                    )}
                  </div>
                </div>
              </section>
            );

          case "featuresSection":
            return (
              <section key={s._key} className="section surface">
                <div className="wrap">
                  <div className="section-head center">
                    <p className="eyebrow coral">{pick(s.eyebrow, lang)}</p>
                    <h2 className="h2">{pick(s.heading, lang)}</h2>
                  </div>
                  <div className="grid grid-3 mt-32">
                    {(s.items ?? []).map((f, i) => (
                      <div key={i} className="info-card">
                        <div className="ic" style={{ background: "var(--surface)" }}>
                          {f.icon}
                        </div>
                        <h3>{pick(f.title, lang)}</h3>
                        <p>{pick(f.desc, lang)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "articlesSection":
            return (
              <section key={s._key} className="section white">
                <div className="wrap">
                  <div className="section-head center">
                    <p className="eyebrow orange">{pick(s.eyebrow, lang)}</p>
                    <h2 className="h2">{pick(s.heading, lang)}</h2>
                  </div>
                  <div className="grid grid-3 mt-32">
                    {(s.items ?? []).map((a, i) => (
                      <div key={i} className="fp-article-card">
                        <div className="fp-article-icon">{a.icon}</div>
                        <h3 className="fp-article-title">{pick(a.title, lang)}</h3>
                        <p className="fp-article-excerpt">{pick(a.excerpt, lang)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          case "testimonialsSection":
            return (
              <section key={s._key} className="section surface">
                <div className="wrap">
                  <div className="section-head center">
                    <p className="eyebrow purple">{pick(s.eyebrow, lang)}</p>
                    <h2 className="h2">{pick(s.heading, lang)}</h2>
                  </div>
                  <div className="grid grid-3 mt-32">
                    {(s.items ?? []).map((item, i) => {
                      const name = item.name ?? "";
                      return (
                        <div key={i} className="fp-quote-card">
                          <div className="fp-quote-stars">★★★★★</div>
                          <p className="fp-quote-text">&ldquo;{pick(item.quote, lang)}&rdquo;</p>
                          <div className="fp-quote-who">
                            <div
                              className="fp-quote-av"
                              style={{ background: STEP_COLORS[i % STEP_COLORS.length] }}
                            >
                              {name.charAt(0)}
                            </div>
                            <strong>{name}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            );

          case "faqSection":
            return (
              <section key={s._key} className="section white">
                <div className="wrap">
                  <div className="fp-faq-layout">
                    <div>
                      <p className="eyebrow green">{pick(s.eyebrow, lang)}</p>
                      <h2 className="h2">{pick(s.heading, lang)}</h2>
                    </div>
                    <FaqAccordion
                      items={(s.items ?? []).map((f) => ({ q: pick(f.q, lang), a: pick(f.a, lang) }))}
                    />
                  </div>
                </div>
              </section>
            );

          case "ctaSection":
            return (
              <section key={s._key} className="section surface">
                <div className="wrap">
                  <div className="cta-band accent">
                    <h2 className="h2" style={{ color: "#fff" }}>
                      {pick(s.heading, lang)}
                    </h2>
                    <div className="btn-row center mt-32">
                      <AppStoreBadge href={appStoreUrl} />
                      <Link className="btn btn-ghost" href="/contact" style={{ color: "rgba(255,255,255,0.9)" }}>
                        {contactLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "freeSection": {
            const eyebrow = pick(s.eyebrow, lang);
            const heading = pick(s.heading, lang);
            const blocks = (lang === "uk" ? s.body?.uk : s.body?.en) ?? s.body?.en ?? [];
            const ctaLabel = pick(s.ctaLabel, lang);
            return (
              <section key={s._key} className="section white">
                <div className="wrap fp-free">
                  {(eyebrow || heading) && (
                    <div className="section-head center">
                      {eyebrow && <p className="eyebrow blue">{eyebrow}</p>}
                      {heading && <h2 className="h2">{renderAccent(heading)}</h2>}
                    </div>
                  )}
                  {s.mediaUrl && (
                    <div className="fp-free-media">
                      <HeroMedia url={s.mediaUrl} mime={s.mediaMime} />
                    </div>
                  )}
                  {blocks.length > 0 && (
                    <div className="fp-free-body">
                      <PortableText value={blocks} />
                    </div>
                  )}
                  {ctaLabel && s.ctaUrl && (
                    <div className="btn-row center mt-32">
                      <a className="btn btn-primary" href={s.ctaUrl}>
                        {ctaLabel}
                      </a>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </>
  );
}
