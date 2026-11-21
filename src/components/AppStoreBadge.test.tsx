import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "../../messages/en.json";
import AppStoreBadge from "./AppStoreBadge";

const renderBadge = (props: { href?: string }) =>
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

  it("renders nothing without a store link — never Apple's badge for an unreleased app", () => {
    const { container } = renderBadge({});
    expect(container).toBeEmptyDOMElement();
  });
});
