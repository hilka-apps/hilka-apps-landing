import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/ContactForm";
import FaqAccordion from "@/components/FaqAccordion";
import { getContactStrings } from "@/components/contactStrings";
import { getAllApps, getApp, getBrand } from "@/sanity/lib/queries";
import { pick, type Lang } from "@/lib/i18n";
import { collectFaq } from "@/lib/faq";
import "./support.css";

// Per-app support page — the "Support URL" entered in App Store Connect,
// e.g. /uk/apps/<app>/support. FAQ comes from the app's FAQ sections in Studio.
type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const app = await getApp(slug);
  if (!app) return {};
  const t = await getTranslations({ locale, namespace: "support.meta" });
  const name = pick(app.name, locale as Lang);
  return {
    title: t("title", { app: name }),
    description: t("description", { app: name }),
    ...(app.hidden ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function SupportPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale as Lang;

  const [app, apps, brand] = await Promise.all([getApp(slug), getAllApps(), getBrand()]);
  if (!app) notFound();

  const t = await getTranslations("support");
  const appName = pick(app.name, lang);
  const faq = collectFaq(app.sections, lang);
  // Visible apps, plus this one when it is hidden (so the preselect still works in preview).
  const appOptions = [...new Set([...apps.map((a) => pick(a.name, lang)), appName])].filter(Boolean);
  const strings = await getContactStrings(brand.email);

  return (
    <div>
      <section className="section white page-hero">
        <div className="wrap">
          <p className="eyebrow blue">{appName}</p>
          <h1 className="h1 page-h1">{t("title")}</h1>
          <p className="lead support-intro">{t("intro")}</p>
        </div>
      </section>

      {faq.length > 0 && (
        <section className="section surface">
          <div className="wrap support-faq">
            <h2 className="h2">{t("faqHeading")}</h2>
            <FaqAccordion items={faq} />
          </div>
        </section>
      )}

      <section className={`section ${faq.length > 0 ? "white" : "surface"}`}>
        <div className="wrap">
          <h2 className="h2 support-contact-h">{t("contactHeading")}</h2>
          <ContactForm strings={strings} email={brand.email} appOptions={appOptions} defaultApp={appName} />
        </div>
      </section>
    </div>
  );
}
