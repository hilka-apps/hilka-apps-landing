import type { NewDocumentOptionsResolver, Template } from "sanity";

/** "New legal document" inside an app's folder — the app reference comes pre-filled. */
export const APP_LEGAL_DOC_TEMPLATE = "legalDoc-for-app";

export const templates = (prev: Template[]): Template[] => [
  ...prev,
  {
    id: APP_LEGAL_DOC_TEMPLATE,
    title: "Legal document for this app",
    schemaType: "legalDoc",
    parameters: [{ name: "appId", type: "string" }],
    // Weak until publish (same shape Studio's reference input writes): a draft may point at an
    // app that isn't published yet; Studio makes it a strong reference when the doc is published.
    value: ({ appId }: { appId: string }) => ({
      app: { _type: "reference", _ref: appId, _weak: true, _strengthenOnPublish: { type: "app" } },
    }),
  },
];

// Legal documents are created only from their folders (Apps → <app> → Legal documents, or
// Site content → Legal documents), so the owner is always right. The top-bar "+" has no
// folder context and would silently make a site-wide document.
export const newDocumentOptions: NewDocumentOptionsResolver = (prev, { creationContext }) =>
  creationContext.type === "global"
    ? prev.filter((i) => i.templateId !== "legalDoc" && i.templateId !== APP_LEGAL_DOC_TEMPLATE)
    : prev;
