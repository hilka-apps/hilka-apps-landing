import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllApps, getAllLegalDocs, getMoreContent } from "@/sanity/lib/queries";
import { pick, pickOr, type Lang } from "@/lib/i18n";
import { renderAccent } from "@/lib/accentText";
import "./more.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "more.meta" });
  return { title: t("title"), description: t("description") };
}

type SectionData = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

export default async function MorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("more");

  // Copy: t.raw() returns the shared messages object — never mutate it in place.
  const sections = { ...(t.raw("sections") as Record<string, SectionData>) };

  // Apps and legal docs are the single source of truth in Sanity — keep the
  // section titles from translations but build their links from the live data,
  // so adding an app or a new legal doc surfaces here with no code change.
  const [apps, legalDocs, more] = await Promise.all([
    getAllApps(),
    getAllLegalDocs(),
    getMoreContent(),
  ]);
  const lang = locale as Lang;
  const moreHeading = pick(more?.heroHeading, lang);
  if (sections.apps) {
    sections.apps = {
      ...sections.apps,
      links: apps.map((app) => ({
        label: pick(app.name, locale as Lang),
        href: `/apps/${app.slug}`,
      })),
    };
  }
  // Only real, filled-in site documents are linked — never a placeholder URL.
  if (sections.legal) {
    if (legalDocs.length > 0) {
      sections.legal = {
        ...sections.legal,
        links: legalDocs.map((doc) => ({
          label: pick(doc.title, locale as Lang),
          href: `/legal/${doc.slug}`,
        })),
      };
    } else {
      delete sections.legal;
    }
  }

  return (
    <div>
      {/* ── HEADER ── */}
      <section className="section white page-hero more-hero">
        <div className="wrap">
          <p className="eyebrow blue">{pickOr(more?.heroEyebrow, lang, t("eyebrow"))}</p>
          <h1 className="h1 page-h1">
            {moreHeading ? renderAccent(moreHeading) : t("h1")}
          </h1>
          <p className="lead more-intro">{pickOr(more?.heroIntro, lang, t("intro"))}</p>
        </div>
      </section>

      {/* ── LINK BLOCKS ── */}
      <section className="section surface">
        <div className="wrap">
          <div className="more-grid">
            {Object.values(sections).map((sec, i) => (
              <div key={i} className="more-block">
                <h2 className="more-block-title">{sec.title}</h2>
                <ul className="more-block-links">
                  {sec.links.map((link, j) => {
                    const external = /^https?:\/\//.test(link.href);
                    return (
                      <li key={j}>
                        {external ? (
                          <a
                            href={link.href}
                            className="more-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.label}
                            <span className="arr">→</span>
                          </a>
                        ) : (
                          <Link href={link.href} className="more-link">
                            {link.label}
                            <span className="arr">→</span>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
