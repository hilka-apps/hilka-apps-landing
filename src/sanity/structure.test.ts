import { describe, expect, it } from "vitest";
import type { ListItem } from "sanity/structure";
import { APP_LEGAL_DOC_TEMPLATE } from "./templates";
import { appFolderId, appLegalCanHandleIntent, siteLegalCanHandleIntent, withAppFolders } from "./structure";

describe("appFolderId", () => {
  it("uses the published app id, even when the list hands over a draft id", () => {
    expect(appFolderId("drafts.abc")).toBe("abc");
    expect(appFolderId("abc")).toBe("abc");
  });
});

describe("legal lists take only their own 'create' (Studio routes 'create' to the deepest pane that accepts it)", () => {
  it("app folder list: the app template only", () => {
    expect(appLegalCanHandleIntent("create", { type: "legalDoc", template: APP_LEGAL_DOC_TEMPLATE })).toBe(true);
    expect(appLegalCanHandleIntent("create", { type: "legalDoc", template: "legalDoc" })).toBe(false);
    expect(appLegalCanHandleIntent("edit", { type: "legalDoc", id: "x" })).toBe(false);
  });

  it("site list: the plain template only", () => {
    expect(siteLegalCanHandleIntent("create", { type: "legalDoc", template: "legalDoc" })).toBe(true);
    expect(siteLegalCanHandleIntent("create", { type: "legalDoc", template: APP_LEGAL_DOC_TEMPLATE })).toBe(false);
    expect(siteLegalCanHandleIntent("edit", { type: "legalDoc", id: "x" })).toBe(false);
  });
});

describe("withAppFolders", () => {
  // Shape of the orderable plugin's serialized item: its pane accepts every intent.
  const orderable = {
    id: "orderable-app",
    type: "listItem",
    child: { id: "orderable-app", type: "component", canHandleIntent: () => true, options: { type: "app" } },
  } as unknown as ListItem;

  const pane = (item: ListItem) =>
    item.child as unknown as { canHandleIntent: (...a: unknown[]) => boolean; child: unknown; options: unknown };

  it("stops the Apps list from hijacking intents (search results, 'create' buttons elsewhere)", () => {
    const wrapped = pane(withAppFolders(orderable, {} as never, {} as never));
    expect(wrapped.canHandleIntent("create", { type: "legalDoc", template: "legalDoc" })).toBe(false);
    expect(wrapped.canHandleIntent("edit", { type: "siteSettings", id: "brand" })).toBe(false);
    expect(wrapped.canHandleIntent("edit", { type: "app", id: "a" })).toBe(false);
  });

  it("opens a folder per app and keeps the plugin's list (drag-to-reorder) intact", () => {
    const wrapped = pane(withAppFolders(orderable, {} as never, {} as never));
    expect(typeof wrapped.child).toBe("function");
    expect(wrapped.options).toEqual({ type: "app" });
  });
});
