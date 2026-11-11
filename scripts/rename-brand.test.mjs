import { describe, expect, it } from "vitest";
import { rewriteBrand } from "./rename-brand.mjs";

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
  it("leaves system keys untouched", () => {
    expect(rewriteBrand({ _id: "hylka-x", _type: "hylka", title: "Hylka" })).toEqual({
      _id: "hylka-x",
      _type: "hylka",
      title: "Hilka",
    });
  });
});
