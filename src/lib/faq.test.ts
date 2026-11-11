import { describe, expect, it } from "vitest";
import type { AppSection } from "@/sanity/lib/queries";
import { collectFaq } from "./faq";

const sections: AppSection[] = [
  { _type: "faqSection", _key: "a", items: [{ q: { en: "Q1", uk: "П1" }, a: { en: "A1", uk: "В1" } }] },
  { _type: "ctaSection", _key: "b", heading: { en: "Get it" } },
  {
    _type: "faqSection",
    _key: "c",
    items: [
      { q: { en: "Q2" }, a: { en: "A2" } },
      { q: { en: "  " }, a: { en: "dropped" } },
    ],
  },
];

describe("collectFaq", () => {
  it("collects items from every FAQ section in order", () => {
    expect(collectFaq(sections, "en")).toEqual([
      { q: "Q1", a: "A1" },
      { q: "Q2", a: "A2" },
    ]);
  });
  it("localizes with English fallback", () => {
    expect(collectFaq(sections, "uk")).toEqual([
      { q: "П1", a: "В1" },
      { q: "Q2", a: "A2" },
    ]);
  });
  it("returns an empty list without sections", () => {
    expect(collectFaq(undefined, "en")).toEqual([]);
  });
});
