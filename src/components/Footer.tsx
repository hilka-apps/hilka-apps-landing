import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllApps, getAllLegalDocs } from "@/sanity/lib/queries";
import { pick } from "@/lib/i18n";

export default async function Footer({
  siteName,
  email,
  tagline,
  logoUrl,
}: {
  siteName: string;
  email: string;
  tagline: string | null;
  logoUrl: string | null;
}) {
  const t = await getTranslations("footer");
  const locale = (await getLocale()) as "en" | "uk";
  const [apps, legalDocs] = await Promise.all([getAllApps(), getAllLegalDocs()]);

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" href="/" aria-label={`${siteName} home`}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="logo-mark" src={logoUrl} alt="" width={28} height={28} />
              ) : (
                <span className="logo-mark">{siteName.charAt(0)}</span>
              )}
              <span>{siteName}</span>
            </Link>
            <p>{tagline ?? t("tagline")}</p>
          </div>

          {/* No visible apps yet (pre-launch) → no empty "Apps" heading. */}
          {apps.length > 0 && (
            <div className="footer-col">
              <h4>{t("cols.apps")}</h4>
              <ul>
                {apps.map((app) => (
                  <li key={app.slug}>
                    <Link href={`/apps/${app.slug}`}>{pick(app.name, locale)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="footer-col">
            <h4>{t("cols.company")}</h4>
            <ul>
              <li>
                <Link href="/about">{t("links.about")}</Link>
              </li>
              <li>
                <Link href="/more">{t("links.more")}</Link>
              </li>
              <li>
                <Link href="/contact">{t("links.contact")}</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t("cols.legal")}</h4>
            <ul>
              {legalDocs.map((doc) => (
                <li key={doc.slug}>
                  <Link href={`/legal/${doc.slug}`}>{pick(doc.title, locale)}</Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${email}`}>{email}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="wrap">
          <p>{t("copyright")}</p>
          <p>{t("legalnote")}</p>
        </div>
      </div>
    </footer>
  );
}
