import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getAllApps, getBrand } from "@/sanity/lib/queries";
import { pick, type Lang } from "@/lib/i18n";

// Without this the server HTML (what crawlers read) carries the layout's home title.
// Language-neutral on purpose: reading the locale here (headers) would turn the
// statically generated app/legal pages dynamic and make their 404s fail with a 500.
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return { title: `404 · ${brand.siteName}`, robots: { index: false, follow: false } };
}

// Localised 404 for unknown paths (via [...rest]) and notFound() in any [locale] page.
export default async function NotFound() {
  const lang = (await getLocale()) as Lang;
  const t = await getTranslations("notFound");
  const [apps, brand] = await Promise.all([getAllApps(), getBrand()]);

  return (
    <div>
      {/* Same title again for the browser: after hydration the client applies the
          layout's metadata, and React hoists this <title> back over it. */}
      <title>{`404 · ${brand.siteName}`}</title>
      <section className="section white page-hero">
        <div className="wrap">
          <h1 className="h1 page-h1">{t("h1")}</h1>
          <p className="lead">{t("lead")}</p>
          <div className="btn-row nf-actions">
            <Link className="btn btn-primary" href="/">
              {t("home")}
            </Link>
          </div>
          {apps.length > 0 && (
            <>
              <p className="nf-apps-label">{t("apps")}</p>
              <ul className="nf-apps">
                {apps.map((app) => (
                  <li key={app.slug}>
                    <Link className="textlink" href={`/apps/${app.slug}`}>
                      {pick(app.name, lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
