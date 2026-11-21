import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import uk from "../../messages/uk.json";
import AppTabs from "./AppTabs";

const docs = [
  { slug: "privacy", title: { en: "Privacy Policy", uk: "Політика конфіденційності" } },
  { slug: "terms", title: { en: "Terms of Use", uk: "Умови використання" } },
];

function renderTabs(
  current: string,
  { locale = "en", withDocs = true }: { locale?: "en" | "uk"; withDocs?: boolean } = {}
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "en" ? en : uk}>
      <AppTabs
        appName="Focusly"
        slug="focusly"
        docs={withDocs ? docs : []}
        current={current}
        lang={locale}
      />
    </NextIntlClientProvider>
  );
}

const tabLinks = () => within(screen.getByRole("navigation")).getAllByRole("link");

describe("AppTabs", () => {
  it("is a nav labelled in the page language and names the app", () => {
    renderTabs("overview");
    const nav = screen.getByRole("navigation", { name: en.appPage.linksLabel });
    expect(nav).toHaveTextContent("Focusly");
  });

  it("lists Overview, the app's filled-in docs in order, then Support", () => {
    renderTabs("overview");
    expect(tabLinks().map((a) => a.textContent)).toEqual([
      en.appPage.overview,
      "Privacy Policy",
      "Terms of Use",
      en.appPage.support,
    ]);
  });

  it("links every tab to its own page under the locale (URLs are fixed in App Store Connect)", () => {
    renderTabs("overview");
    expect(tabLinks().map((a) => a.getAttribute("href"))).toEqual([
      "/en/apps/focusly",
      "/en/apps/focusly/privacy",
      "/en/apps/focusly/terms",
      "/en/apps/focusly/support",
    ]);
  });

  it("marks only the current tab with aria-current=page", () => {
    renderTabs("terms");
    const current = tabLinks().filter((a) => a.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Terms of Use");
  });

  it("marks Support as current on the support page", () => {
    renderTabs("support");
    expect(screen.getByRole("link", { name: en.appPage.support })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: en.appPage.overview })).not.toHaveAttribute("aria-current");
  });

  it("shows only Overview and Support when the app has no filled-in docs", () => {
    renderTabs("overview", { withDocs: false });
    expect(tabLinks().map((a) => a.textContent)).toEqual([en.appPage.overview, en.appPage.support]);
  });

  it("uses Ukrainian labels and /uk hrefs in uk", () => {
    renderTabs("privacy", { locale: "uk" });
    expect(screen.getByRole("navigation", { name: uk.appPage.linksLabel })).toBeInTheDocument();
    expect(tabLinks().map((a) => a.textContent)).toEqual([
      uk.appPage.overview,
      "Політика конфіденційності",
      "Умови використання",
      uk.appPage.support,
    ]);
    expect(tabLinks()[1]).toHaveAttribute("href", "/uk/apps/focusly/privacy");
    expect(tabLinks()[1]).toHaveAttribute("aria-current", "page");
  });
});
