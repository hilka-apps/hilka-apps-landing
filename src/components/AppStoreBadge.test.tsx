import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import AppStoreBadge from "./AppStoreBadge";

const renderBadge = (props: { href?: string; inert?: boolean }) =>
  render(
    <NextIntlClientProvider locale="en" messages={en}>
      <AppStoreBadge {...props} />
    </NextIntlClientProvider>
  );

describe("AppStoreBadge", () => {
  it("links to the store when an href is given", () => {
    const { container } = renderBadge({ href: "https://apps.apple.com/app/id1" });
    const a = container.querySelector("a.appstore");
    expect(a).toHaveAttribute("href", "https://apps.apple.com/app/id1");
    expect(a).toHaveAttribute("target", "_blank");
  });

  it("renders a non-link badge when inert (inside a card link)", () => {
    const { container } = renderBadge({ inert: true });
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("span.appstore")).toHaveAttribute("aria-label");
  });

  it("shows a coming-soon pill — never Apple's badge — without a store link", () => {
    const { container } = renderBadge({});
    const soon = container.querySelector(".appstore-soon");
    expect(soon).toHaveTextContent("Coming soon to the App Store");
    expect(container.querySelector(".appstore")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });
});
