import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import AppSections from "./AppSections";
import type { AppSection } from "@/sanity/lib/queries";

const stat: AppSection = { _type: "statSection", _key: "s", number: "12,000+", label: { en: "hours" } };
const cta: AppSection = { _type: "ctaSection", _key: "c", heading: { en: "Try it" } } as AppSection;
const quotes: AppSection = {
  _type: "testimonialsSection",
  _key: "t",
  heading: { en: "What people say" },
  items: [
    { quote: { en: "First quote." }, name: "Ann" },
    { quote: { en: "Second quote." }, name: "Bo" },
  ],
} as AppSection;

function renderSections(sections: AppSection[], appStoreUrl?: string) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <AppSections
        sections={sections}
        lang="en"
        appStoreUrl={appStoreUrl}
        downloadLabel="Get the app"
        contactLabel="Contact us"
        launchLabel="Hear about the launch"
      />
    </NextIntlClientProvider>
  );
}

describe("AppSections before release (no App Store URL)", () => {
  it("shows the stat without any store action", () => {
    const { container } = renderSections([stat]);
    expect(screen.getByText("12,000+")).toBeInTheDocument();
    expect(container.querySelector("a, .appstore, .appstore-soon")).toBeNull();
  });

  it("closes with a primary link to the contact page to hear about the launch", () => {
    const { container } = renderSections([cta]);
    const link = screen.getByRole("link", { name: "Hear about the launch" });
    expect(link).toHaveAttribute("href", "/en/contact");
    expect(link).toHaveClass("btn-primary");
    expect(container.querySelector(".appstore, .appstore-soon")).toBeNull();
  });
});

describe("AppSections after release", () => {
  it("keeps the App Store badge in the closing CTA", () => {
    const { container } = renderSections([cta], "https://apps.apple.com/app/id1");
    expect(container.querySelector("a.appstore")).toHaveAttribute("href", "https://apps.apple.com/app/id1");
    expect(screen.queryByRole("link", { name: "Hear about the launch" })).toBeNull();
  });

  it("keeps the download button in the stat band", () => {
    renderSections([stat], "https://apps.apple.com/app/id1");
    expect(screen.getByRole("link", { name: "Get the app" })).toHaveAttribute("href", "https://apps.apple.com/app/id1");
  });
});

describe("testimonials", () => {
  it("shows the first quote large, with its author", () => {
    const { container } = renderSections([quotes]);
    expect(container.querySelectorAll("blockquote")).toHaveLength(1);
    expect(screen.getByText(/First quote\./)).toBeInTheDocument();
    expect(screen.getByText("Ann")).toBeInTheDocument();
    expect(screen.queryByText(/Second quote\./)).toBeNull();
    expect(container.querySelector(".fp-quote-big")).not.toBeNull();
  });
});
