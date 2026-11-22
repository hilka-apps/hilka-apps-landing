import { describe, expect, it } from "vitest";
import type { NewDocumentOptionsContext, TemplateItem } from "sanity";
import { APP_LEGAL_DOC_TEMPLATE, newDocumentOptions, templates } from "./templates";

const item = (templateId: string) => ({ templateId }) as TemplateItem;
const ctx = (type: string) => ({ creationContext: { type } }) as unknown as NewDocumentOptionsContext;

describe("templates", () => {
  it("adds a legalDoc template that pre-fills the app reference", () => {
    const all = templates([]);
    const tpl = all.find((t) => t.id === APP_LEGAL_DOC_TEMPLATE);
    expect(tpl?.schemaType).toBe("legalDoc");
    expect(tpl?.parameters?.map((p) => p.name)).toEqual(["appId"]);
    const value = (tpl!.value as (p: { appId: string }) => unknown)({ appId: "app-1" });
    // Weak until publish: a draft may point at an app that isn't published yet.
    expect(value).toEqual({
      app: { _type: "reference", _ref: "app-1", _weak: true, _strengthenOnPublish: { type: "app" } },
    });
  });

  it("keeps the existing templates", () => {
    const prev = [{ id: "app", title: "App", schemaType: "app", value: {} }];
    expect(templates(prev)[0]).toBe(prev[0]);
  });
});

describe("newDocumentOptions", () => {
  const prev = [item("app"), item("legalDoc"), item(APP_LEGAL_DOC_TEMPLATE)];

  it("hides every legal-document template from the global create menu", () => {
    expect(newDocumentOptions(prev, ctx("global")).map((i) => i.templateId)).toEqual(["app"]);
  });

  it("keeps them inside structure lists (the folders)", () => {
    expect(newDocumentOptions(prev, ctx("structure"))).toEqual(prev);
  });
});
