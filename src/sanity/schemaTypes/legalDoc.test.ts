import { describe, expect, it } from "vitest";
import { legalDoc } from "./legalDoc";

type HiddenFn = (ctx: { document?: Record<string, unknown> }) => boolean;
const appField = legalDoc.fields.find((f) => f.name === "app") as unknown as {
  readOnly?: boolean;
  hidden?: HiddenFn;
};

describe("legalDoc.app", () => {
  it("cannot be edited in the form — the folder sets it", () => {
    expect(appField.readOnly).toBe(true);
  });

  it("blocks publishing while the app itself is unpublished", async () => {
    const validate = (appField as unknown as { validation: (r: unknown) => unknown }).validation;
    // Capture the custom rule the schema registers.
    let rule: ((value: unknown, ctx: unknown) => Promise<unknown>) | undefined;
    const r = { custom: (fn: typeof rule) => ((rule = fn), r) };
    validate(r);
    const ctx = (published: number) => ({
      getClient: () => ({ fetch: async () => published }),
    });
    expect(await rule!(undefined, ctx(0))).toBe(true);
    expect(await rule!({ _ref: "app-1" }, ctx(1))).toBe(true);
    expect(await rule!({ _ref: "app-1" }, ctx(0))).toMatch(/publish the app/i);
  });

  it("is hidden for site documents and shown for app documents", () => {
    expect(appField.hidden?.({ document: { _id: "x" } })).toBe(true);
    expect(appField.hidden?.({ document: { _id: "x", app: { _ref: "app-1" } } })).toBe(false);
  });
});
