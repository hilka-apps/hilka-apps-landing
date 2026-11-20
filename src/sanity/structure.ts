import { getPublishedId, type ConfigContext } from "sanity";
import type { ListItem, StructureBuilder, StructureResolver } from "sanity/structure";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { APP_LEGAL_DOC_TEMPLATE } from "./templates";
import {
  DocumentIcon,
  DocumentTextIcon,
  HomeIcon,
  TagIcon,
  UsersIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
} from "@sanity/icons";

// The single existing Brand document — pinned so it opens directly.
const BRAND_DOC_ID = "a056b365-4af3-4f0d-b613-fd8a375822a4";

const API_VERSION = "2025-02-19";

const APP_LEGAL_DOCS_FILTER = '_type == "legalDoc" && app._ref == $appId';
const SITE_LEGAL_DOCS_FILTER = '_type == "legalDoc" && !defined(app)';

type IntentParams = Record<string, unknown>;

// Studio sends "create" to the deepest open pane that accepts it. Custom document lists only
// accept intents up to the 2nd column by default, so each legal list claims its own template.
export const appLegalCanHandleIntent = (intent: string, params: IntentParams) =>
  intent === "create" && params.template === APP_LEGAL_DOC_TEMPLATE;
export const siteLegalCanHandleIntent = (intent: string, params: IntentParams) =>
  intent === "create" && params.template === "legalDoc";

/** The orderable list may hand over a draft id; references must point at the published id. */
export const appFolderId = (id: string) => getPublishedId(id);

// Apps → <app>: the app editor plus that app's legal documents. "Create" there pre-fills `app`.
async function appFolder(S: StructureBuilder, context: ConfigContext, rawId: string) {
  const appId = appFolderId(rawId);
  const name = await context
    .getClient({ apiVersion: API_VERSION })
    .fetch<string | null>(
      `coalesce(*[_id == "drafts." + $appId][0].name.en, *[_id == $appId][0].name.en)`,
      { appId }
    )
    .catch(() => null);
  return S.list()
    .id(`app-${appId}`)
    .title(name || "App")
    .items([
      S.listItem()
        .id("details")
        .title("App details")
        .icon(DocumentIcon)
        .child(S.document().schemaType("app").documentId(appId)),
      S.listItem()
        .id("legal")
        .title("Legal documents")
        .icon(DocumentTextIcon)
        .child(
          S.documentList()
            .id(`legal-${appId}`)
            .title("Legal documents")
            .schemaType("legalDoc")
            .apiVersion(API_VERSION)
            .filter(APP_LEGAL_DOCS_FILTER)
            .params({ appId })
            .canHandleIntent(appLegalCanHandleIntent)
            .initialValueTemplates([S.initialValueTemplateItem(APP_LEGAL_DOC_TEMPLATE, { appId })])
        ),
    ]);
}

// The orderable Apps list opens the app editor on click; swap that for the app's folder.
// Drag-to-reorder is untouched. The plugin's list also accepts *every* intent, which would
// route search results and other lists' "create" buttons into a bogus app folder — so it
// accepts none; those open in Studio's standalone editor instead.
export function withAppFolders(item: ListItem, S: StructureBuilder, context: ConfigContext): ListItem {
  const list = item.child as unknown as Record<string, unknown>;
  const child = { ...list, canHandleIntent: () => false, child: (id: string) => appFolder(S, context, id) };
  return { ...item, child: child as unknown as ListItem["child"] };
}

// Top level: Apps (drag-to-reorder), the "Site content" folder (the page
// singletons + Legal documents), a divider, then Brand.
export const structure: StructureResolver = (S, context) => {
  const page = (id: string, title: string, icon: typeof HomeIcon) =>
    S.listItem()
      .title(title)
      .id(id)
      .icon(icon)
      .child(S.document().schemaType(id).documentId(id).title(title));

  return S.list()
    .title("Content")
    .items([
      withAppFolders(
        orderableDocumentListDeskItem({ type: "app", title: "Apps", S, context }),
        S,
        context
      ),
      S.listItem()
        .title("Site content")
        .child(
          S.list()
            .title("Site content")
            .items([
              page("homeContent", "Home page", HomeIcon),
              page("morePage", "More page", EllipsisHorizontalIcon),
              page("aboutPage", "About page", UsersIcon),
              page("contactPage", "Contact page", EnvelopeIcon),
              // Site-wide documents only; each app's documents live in its own folder.
              S.listItem()
                .id("legalDoc")
                .title("Legal documents")
                .icon(DocumentTextIcon)
                .child(
                  S.documentList()
                    .id("site-legal")
                    .title("Site legal documents")
                    .schemaType("legalDoc")
                    .apiVersion(API_VERSION)
                    .filter(SITE_LEGAL_DOCS_FILTER)
                    .canHandleIntent(siteLegalCanHandleIntent)
                    .initialValueTemplates([S.initialValueTemplateItem("legalDoc")])
                ),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("Brand")
        .id("brand")
        .icon(TagIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId(BRAND_DOC_ID)
            .title("Brand")
        ),
    ]);
};
