import { PortableText } from "@portabletext/react";
import { Link } from "@/i18n/navigation";
import AppStoreBadge from "@/components/AppStoreBadge";
import FaqAccordion from "@/components/FaqAccordion";
import HeroMedia from "@/components/HeroMedia";
import type { AppSection } from "@/sanity/lib/queries";
import { pick } from "@/lib/i18n";
import { renderAccent } from "@/lib/accentText";
import { formatStat } from "@/lib/stat";

/** Caption in the margin + heading. Renders nothing for empty CMS fields. */
function SectionHead({ eyebrow, heading }: { eyebrow?: string; heading?: string }) {
  if (!eyebrow && !heading) return null;
  return (
    <div className="section-split">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : <span />}
      {heading ? <h2 className="h2 section-head">{renderAccent(heading)}</h2> : <span />}
    </div>
  );
}

// Emoji icons (features / articles) and star ratings in the CMS are intentionally
// not rendered — see docs/superpowers/specs/2026-11-21-visual-refresh-design.md.
export default function AppSections({
  sections,
  lang,
  appStoreUrl,
  downloadLabel,
  contactLabel,
  launchLabel,
}: {
  sections: AppSection[];
  lang: "en" | "uk";
  /** Undefined until the app is released: no store actions, launch CTA instead. */
  appStoreUrl?: string;
  downloadLabel: string;
  contactLabel: string;
  /** "Hear about the launch" — the closing CTA before release. */
  launchLabel: string;
}) {
  return (
    <>
      {sections.map((s) => {
        switch (s._type) {
          case "howItWorksSection":
            return (
              <section key={s._key} className="section surface" id="how-it-works">
                <div className="wrap">
                  <SectionHead eyebrow={pick(s.eyebrow, lang)} heading={pick(s.heading, lang)} />
                  <div className="indent">
                    <ol className="fp-steps">
                      {(s.steps ?? []).map((step, i) => (
                        <li key={i} className="fp-step">
                          <span className="fp-step-num" aria-hidden="true">
                            {i + 1}
                          </span>
                          <h3 className="fp-step-title">{pick(step.title, lang)}</h3>
                          <p className="fp-step-desc">{pick(step.desc, lang)}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>
            );

          case "statSection":
            return (
              <section key={s._key} className="section white">
                <div className="wrap">
                  <div className="indent">
                    <div className="fp-stat-band">
                      <div>
                        <div className="fp-stat-number">{formatStat(s.number ?? "", lang)}</div>
                        <p className="fp-stat-label">{pick(s.label, lang)}</p>
                      </div>
                      {appStoreUrl && (
                        <a
                          className="btn btn-primary"
                          href={appStoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {downloadLabel}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "featuresSection":
            return (
              <section key={s._key} className="section white">
                <div className="wrap">
                  <SectionHead eyebrow={pick(s.eyebrow, lang)} heading={pick(s.heading, lang)} />
                  <div className="indent">
                    <div className="grid grid-3 fp-grid">
                      {(s.items ?? []).map((f, i) => (
                        <div key={i} className="info-card">
                          <h3>{pick(f.title, lang)}</h3>
                          <p>{pick(f.desc, lang)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "articlesSection":
            return (
              <section key={s._key} className="section surface">
                <div className="wrap">
                  <SectionHead eyebrow={pick(s.eyebrow, lang)} heading={pick(s.heading, lang)} />
                  <div className="indent">
                    <div className="grid grid-3 fp-grid">
                      {(s.items ?? []).map((a, i) => (
                        <article key={i} className="fp-article-card">
                          <h3 className="fp-article-title">{pick(a.title, lang)}</h3>
                          <p className="fp-article-excerpt">{pick(a.excerpt, lang)}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );

          case "testimonialsSection": {
            // One large quote reads as a voice; a grid of three reads as filler.
            // Only the first CMS testimonial is shown (see the visual-refresh spec).
            const first = (s.items ?? [])[0];
            if (!first) return null;
            return (
              <section key={s._key} className="section white">
                <div className="wrap">
                  <SectionHead eyebrow={pick(s.eyebrow, lang)} heading={pick(s.heading, lang)} />
                  <div className="indent">
                    <figure className="fp-quote-big">
                      <blockquote className="fp-quote-big-text">
                        &ldquo;{pick(first.quote, lang)}&rdquo;
                      </blockquote>
                      {first.name ? <figcaption className="fp-quote-who">{first.name}</figcaption> : null}
                    </figure>
                  </div>
                </div>
              </section>
            );
          }

          case "faqSection":
            return (
              <section key={s._key} className="section surface">
                <div className="wrap">
                  <SectionHead eyebrow={pick(s.eyebrow, lang)} heading={pick(s.heading, lang)} />
                  <div className="indent">
                    <FaqAccordion
                      items={(s.items ?? []).map((f) => ({ q: pick(f.q, lang), a: pick(f.a, lang) }))}
                    />
                  </div>
                </div>
              </section>
            );

          case "ctaSection":
            return (
              <section key={s._key} className="section white">
                <div className="wrap">
                  <div className="cta-band">
                    <h2 className="h2">{renderAccent(pick(s.heading, lang))}</h2>
                    <div className="btn-row">
                      {appStoreUrl ? (
                        <>
                          <AppStoreBadge href={appStoreUrl} />
                          <Link className="btn btn-ghost" href="/contact">
                            {contactLabel}
                          </Link>
                        </>
                      ) : (
                        <Link className="btn btn-primary" href="/contact">
                          {launchLabel}
                        </Link>
                      )}
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
                <div className="wrap">
                  <SectionHead eyebrow={eyebrow} heading={heading} />
                  <div className="indent">
                    <div className="fp-free">
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
                        <div className="btn-row fp-free-cta">
                          <a className="btn btn-primary" href={s.ctaUrl}>
                            {ctaLabel}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
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
