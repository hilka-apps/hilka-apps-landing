import { describe, expect, it } from "vitest";
import { hasContent, isReservedAppDocSlug, onlyFilled, pickDocBody, pickDocContent } from "./legal";

describe("pickDocContent", () => {
  it("returns the requested language", () => {
    expect(pickDocContent({ contentEn: "E", contentUk: "U" }, "uk")).toBe("U");
    expect(pickDocContent({ contentEn: "E", contentUk: "U" }, "en")).toBe("E");
  });
  it("falls back to the other language when the requested one is blank", () => {
    expect(pickDocContent({ contentEn: "E", contentUk: "  " }, "uk")).toBe("E");
    expect(pickDocContent({ contentUk: "U" }, "en")).toBe("U");
  });
  it("returns null when neither language has content", () => {
    expect(pickDocContent({}, "en")).toBeNull();
    expect(pickDocContent({ contentEn: "", contentUk: null }, "uk")).toBeNull();
    expect(pickDocContent(null, "en")).toBeNull();
  });
});

describe("hasContent", () => {
  it("is false for blank or missing content", () => {
    expect(hasContent({ contentEn: " " })).toBe(false);
    expect(hasContent(undefined)).toBe(false);
  });
  it("is true when either language is filled", () => {
    expect(hasContent({ contentUk: "x" })).toBe(true);
  });
});

describe("onlyFilled", () => {
  it("drops docs whose content is blank or whitespace (they would link to a 404)", () => {
    const docs = [
      { slug: "privacy", contentEn: "Text" },
      { slug: "terms", contentEn: "\n  ", contentUk: "" },
      { slug: "eula", contentUk: "Текст" },
    ];
    expect(onlyFilled(docs).map((d) => d.slug)).toEqual(["privacy", "eula"]);
  });
});

describe("isReservedAppDocSlug", () => {
  it("reserves 'support' — /apps/<app>/support is the support page", () => {
    expect(isReservedAppDocSlug("support")).toBe(true);
    expect(isReservedAppDocSlug("privacy")).toBe(false);
  });
});

describe("pickDocBody", () => {
  it("says which language the body is in", () => {
    expect(pickDocBody({ contentEn: "E", contentUk: "U" }, "uk")).toEqual({ markdown: "U", lang: "uk" });
  });
  it("reports the fallback language when the requested one is blank", () => {
    expect(pickDocBody({ contentEn: "E", contentUk: " " }, "uk")).toEqual({ markdown: "E", lang: "en" });
    expect(pickDocBody({ contentUk: "U" }, "en")).toEqual({ markdown: "U", lang: "uk" });
  });
  it("is null for an empty document", () => {
    expect(pickDocBody({}, "uk")).toBeNull();
  });
});
