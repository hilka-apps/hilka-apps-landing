import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/ContactForm";
import { getContactStrings } from "@/components/contactStrings";
import { getBrand, getAllApps, getContactContent } from "@/sanity/lib/queries";
import { pick, pickOr } from "@/lib/i18n";
import { renderAccent } from "@/lib/accentText";
import "./contact.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const { email } = await getBrand();
  const lang = locale as "en" | "uk";
  const [apps, contact] = await Promise.all([getAllApps(), getContactContent()]);
  const appOptions = apps.map((a) => pick(a.name, lang));
  const contactHeading = pick(contact?.heroHeading, lang);

  const strings = await getContactStrings(email);

  return (
    <div>
      {/* ── HEADER ── */}
      <section className="section white page-hero">
        <div className="wrap">
          <p className="eyebrow green">{pickOr(contact?.heroEyebrow, lang, t("eyebrow"))}</p>
          <h1 className="h1 page-h1">
            {contactHeading
              ? renderAccent(contactHeading, "contact-serif")
              : t.rich("h1", {
                  serif: (chunks) => <span className="contact-serif">{chunks}</span>,
                })}
          </h1>
          <p className="lead contact-intro">{pickOr(contact?.heroIntro, lang, t("intro"))}</p>
        </div>
      </section>

      {/* ── FORM ── */}
      <section className="section surface">
        <div className="wrap">
          <ContactForm strings={strings} email={email} appOptions={appOptions} />
        </div>
      </section>
    </div>
  );
}
