import { defineField, defineType, type SlugValidationContext } from "sanity";
import { isReservedAppDocSlug } from "../../lib/legal";

// A slug only has to be unique within its owner: one "privacy" for the site and one
// per app. Drafts and the published version of the same doc don't count as clashes.
async function isUniquePerOwner(slug: string, context: SlugValidationContext) {
  const { document, getClient } = context;
  if (!document) return true;
  const id = document._id.replace(/^drafts\./, "");
  const app = (document as { app?: { _ref?: string } }).app?._ref ?? "";
  // Same rule as Sanity's default isUnique (ignore this doc's draft/release versions),
  // plus the owner condition.
  const count = await getClient({ apiVersion: "2025-02-19" }).fetch<number>(
    `count(*[_type == "legalDoc" && slug.current == $slug && !sanity::versionOf($id) && coalesce(app._ref, "") == $app])`,
    { slug, id, app },
    { perspective: "raw" }
  );
  return count === 0;
}

export const legalDoc = defineType({
  name: "legalDoc",
  title: "Legal Document",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "object",
      options: { columns: 2 },
      fields: [
        defineField({ name: "en", title: "English", type: "string" }),
        defineField({ name: "uk", title: "Ukrainian", type: "string" }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "app",
      title: "App",
      type: "reference",
      to: [{ type: "app" }],
      description:
        "Set by the folder you created the document in: Apps → <app> → Legal documents (shown at /apps/<app>/<slug>). Site documents (Site content → Legal documents, /legal/<slug>) have no app.",
      // The folder decides the owner; site documents don't show the empty field at all.
      readOnly: true,
      hidden: ({ document }) => !document?.app,
      // A published document can't strongly reference an unpublished app.
      validation: (r) =>
        r.custom(async (value: { _ref?: string } | undefined, context) => {
          if (!value?._ref) return true;
          const published = await context
            .getClient({ apiVersion: "2025-02-19" })
            .fetch<number>(`count(*[_id == $id])`, { id: value._ref }, { perspective: "raw" });
          return published > 0 ? true : "Publish the app first, then this document.";
        }),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL: /legal/<slug> or /apps/<app>/<slug>)",
      type: "slug",
      options: { source: "title.en", isUnique: isUniquePerOwner },
      description:
        "Use the same slug per app, e.g. \"privacy\" and \"terms\". The page only appears once English or Ukrainian content is filled in.",
      validation: (r) =>
        r.required().custom((slug, context) => {
          const hasApp = Boolean((context.document as { app?: { _ref?: string } } | undefined)?.app?._ref);
          return hasApp && slug?.current && isReservedAppDocSlug(slug.current)
            ? `"${slug.current}" is reserved: /apps/<app>/${slug.current} is a built-in page.`
            : true;
        }),
    }),
    defineField({
      name: "updatedAt",
      title: "Last updated",
      type: "date",
    }),
    defineField({
      name: "contentEn",
      title: "Content (English, Markdown)",
      type: "text",
      rows: 20,
    }),
    defineField({
      name: "contentUk",
      title: "Content (Ukrainian, Markdown)",
      type: "text",
      rows: 20,
    }),
  ],
  preview: {
    select: { title: "title.en", app: "app.name.en", slug: "slug.current" },
    prepare: ({ title, app, slug }) => ({ title, subtitle: `${app ?? "Site"} · /${slug ?? ""}` }),
  },
});
