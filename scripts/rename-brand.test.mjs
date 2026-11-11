import { describe, expect, it } from "vitest";
import { planChanges, rewriteBrand } from "./rename-brand.mjs";

describe("rewriteBrand", () => {
  it("renames the brand in plain strings", () => {
    expect(rewriteBrand("Hylka Apps")).toBe("Hilka Apps");
    expect(rewriteBrand("Every Hylka app; hylka-apps")).toBe("Every Hilka app; hilka-apps");
  });
  it("replaces the old contact email", () => {
    expect(rewriteBrand("Email hello@hylkaapps.com now")).toBe("Email hilka.apps@gmail.com now");
  });
  it("walks nested objects and arrays", () => {
    expect(rewriteBrand({ a: { en: "Hylka", uk: "Hylka" }, list: ["Hylka", 1, null] })).toEqual({
      a: { en: "Hilka", uk: "Hilka" },
      list: ["Hilka", 1, null],
    });
  });
  it("catches any letter case", () => {
    expect(rewriteBrand("HYLKA APPS")).toBe("HILKA APPS");
  });
  it("never rewrites slugs or URLs (they may point at domains we do not own)", () => {
    const doc = {
      slug: { _type: "slug", current: "hylka" },
      appStoreUrl: "https://hylka.example/app",
      ctaUrl: "https://hylkaapps.com",
      href: "https://hylkaapps.com/x",
      title: "Hylka",
    };
    expect(rewriteBrand(doc)).toEqual({ ...doc, title: "Hilka" });
  });
  it("leaves system keys untouched", () => {
    expect(rewriteBrand({ _id: "hylka-x", _type: "hylka", title: "Hylka" })).toEqual({
      _id: "hylka-x",
      _type: "hylka",
      title: "Hilka",
    });
  });
});

describe("planChanges", () => {
  it("lists drafts alongside published docs, with before/after values", () => {
    const plan = planChanges([
      { _id: "homeContent", _type: "homeContent", heroSub: "Hylka builds apps" },
      { _id: "drafts.homeContent", _type: "homeContent", heroSub: "Hylka draft" },
      { _id: "aboutPage", _type: "aboutPage", story: "Nothing to change" },
    ]);
    expect(plan).toEqual([
      { id: "homeContent", type: "homeContent", fields: [{ key: "heroSub", before: "Hylka builds apps", after: "Hilka builds apps" }] },
      { id: "drafts.homeContent", type: "homeContent", fields: [{ key: "heroSub", before: "Hylka draft", after: "Hilka draft" }] },
    ]);
  });
});
