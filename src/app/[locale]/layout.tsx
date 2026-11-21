import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBrand } from "@/sanity/lib/queries";
import { sans, serif } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });
  const { faviconUrl } = await getBrand();
  return {
    title: t("title"),
    description: t("description"),
    // CMS-controlled tab icon (Brand → Favicon, falls back to logo). When unset,
    // the static src/app/favicon.ico is used.
    ...(faviconUrl ? { icons: { icon: faviconUrl } } : {}),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const brand = await getBrand();

  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <Header siteName={brand.siteName} logoUrl={brand.logoUrl} />
          <main>{children}</main>
          <Footer
            siteName={brand.siteName}
            email={brand.email}
            tagline={brand.tagline}
            logoUrl={brand.logoUrl}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
