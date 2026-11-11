import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { deepMerge, type Messages } from "./merge";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const en = (await import("../../messages/en.json")).default as Messages;
  const messages =
    locale === routing.defaultLocale
      ? en
      : deepMerge(en, (await import(`../../messages/${locale}.json`)).default as Messages);

  return { locale, messages };
});
