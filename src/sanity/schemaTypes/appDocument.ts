import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import {
  ThListIcon,
  BarChartIcon,
  StarIcon,
  DocumentIcon,
  CommentIcon,
  HelpCircleIcon,
  RocketIcon,
  BlockElementIcon,
  EyeClosedIcon,
} from "@sanity/icons";
import { locString, locText, accentColorField, mediaField, ACCENT_HINT } from "./fields";
import { EyeToggleInput } from "../components/EyeToggleInput";

const headingFields = [locString("eyebrow", "Eyebrow (small label)"), locString("heading", "Heading")];

// ── section blocks (reorderable in the page builder) ──────────────────
const howItWorksSection = defineArrayMember({
  name: "howItWorksSection",
  title: "How it works",
  icon: ThListIcon,
  type: "object",
  fields: [
    ...headingFields,
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            locString("label", "Label (e.g. Step 01)"),
            locString("title", "Title"),
            locText("desc", "Description"),
          ],
          preview: { select: { title: "title.en" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading.en" }, prepare: ({ title }) => ({ title: `How it works — ${title ?? ""}` }) },
});

const statSection = defineArrayMember({
  name: "statSection",
  title: "Stat band",
  icon: BarChartIcon,
  type: "object",
  fields: [
    defineField({ name: "number", title: "Big number (e.g. 12,000+)", type: "string" }),
    locString("label", "Label"),
  ],
  preview: { select: { title: "number" }, prepare: ({ title }) => ({ title: `Stat — ${title ?? ""}` }) },
});

const featuresSection = defineArrayMember({
  name: "featuresSection",
  title: "Features",
  icon: StarIcon,
  type: "object",
  fields: [
    ...headingFields,
    defineField({
      name: "items",
      title: "Features",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "icon", title: "Emoji icon", type: "string" }),
            locString("title", "Title"),
            locText("desc", "Description"),
          ],
          preview: { select: { title: "title.en", subtitle: "icon" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading.en" }, prepare: ({ title }) => ({ title: `Features — ${title ?? ""}` }) },
});

const articlesSection = defineArrayMember({
  name: "articlesSection",
  title: "Articles",
  icon: DocumentIcon,
  type: "object",
  fields: [
    ...headingFields,
    defineField({
      name: "items",
      title: "Articles",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "icon", title: "Emoji icon", type: "string" }),
            locString("title", "Title"),
            locText("excerpt", "Excerpt"),
          ],
          preview: { select: { title: "title.en", subtitle: "icon" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading.en" }, prepare: ({ title }) => ({ title: `Articles — ${title ?? ""}` }) },
});

const testimonialsSection = defineArrayMember({
  name: "testimonialsSection",
  title: "Testimonials",
  icon: CommentIcon,
  type: "object",
  fields: [
    ...headingFields,
    defineField({
      name: "items",
      title: "Testimonials",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            locText("quote", "Quote"),
            defineField({ name: "name", title: "Author name", type: "string" }),
            defineField({
              name: "rating",
              title: "Rating (1–5)",
              type: "number",
              description: "Stars shown on the card. Leave empty to show no stars — only use a real rating.",
              validation: (r) => r.integer().min(1).max(5),
            }),
          ],
          preview: { select: { title: "name" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading.en" }, prepare: ({ title }) => ({ title: `Testimonials — ${title ?? ""}` }) },
});

const faqSection = defineArrayMember({
  name: "faqSection",
  title: "FAQ",
  icon: HelpCircleIcon,
  type: "object",
  fields: [
    ...headingFields,
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [locString("q", "Question"), locText("a", "Answer")],
          preview: { select: { title: "q.en" } },
        }),
      ],
    }),
  ],
  preview: { select: { title: "heading.en" }, prepare: ({ title }) => ({ title: `FAQ — ${title ?? ""}` }) },
});

const ctaSection = defineArrayMember({
  name: "ctaSection",
  title: "Final call-to-action",
  icon: RocketIcon,
  type: "object",
  fields: [locString("heading", "Heading")],
  preview: { select: { title: "heading.en" }, prepare: ({ title }) => ({ title: `CTA — ${title ?? ""}` }) },
});

// Localized rich text (Portable Text) — EN / UK.
const locRichText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      defineField({ name: "en", title: "English", type: "array", of: [defineArrayMember({ type: "block" })] }),
      defineField({ name: "uk", title: "Ukrainian", type: "array", of: [defineArrayMember({ type: "block" })] }),
    ],
  });

// Escape-hatch section: free heading + rich text + optional media + optional CTA.
const freeSection = defineArrayMember({
  name: "freeSection",
  title: "Free section",
  icon: BlockElementIcon,
  type: "object",
  fields: [
    locString("eyebrow", "Eyebrow (small label)"),
    locString("heading", "Heading", ACCENT_HINT),
    locRichText("body", "Body (rich text)"),
    mediaField("media", "Image (optional)"),
    locString("ctaLabel", "Button label (optional)"),
    defineField({ name: "ctaUrl", title: "Button URL (optional)", type: "url" }),
  ],
  preview: {
    select: { title: "heading.en" },
    prepare: ({ title }) => ({ title: `Free section — ${title ?? ""}` }),
  },
});

// ── the App document ──────────────────────────────────────────────────
export const appDocument = defineType({
  name: "app",
  title: "App",
  type: "document",
  // Three tabs: who the app is · its landing card · its full page.
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "landing", title: "Landing card" },
    { name: "page", title: "App page" },
    // Suppress Studio's auto "All fields" tab by claiming its reserved name.
    { name: "all-fields", title: "All fields", hidden: true },
  ],
  // Fieldsets sub-group the longer "App page" tab.
  fieldsets: [
    { name: "hero", title: "Hero", options: { collapsible: true, collapsed: false } },
    { name: "mockup", title: "Phone mockup — screen + chips", options: { collapsible: true, collapsed: true } },
  ],
  orderings: [orderRankOrdering],
  fields: [
    // Drag-to-reorder rank — drives the order of cards on the landing page.
    // Managed from the "Apps" list in Studio; hidden here to avoid manual edits.
    // Grouped so no ungrouped field forces an extra "All fields" tab.
    { ...orderRankField({ type: "app" }), group: "identity" },

    // ════ Tab: Identity ════
    defineField({
      name: "slug",
      title: "Slug (URL: /apps/<slug>)",
      type: "slug",
      options: { source: "name.en" },
      validation: (r) => r.required(),
      group: "identity",
    }),
    { ...locString("name", "App name"), group: "identity" },
    { ...locString("kicker", "Kicker (eyebrow, e.g. iOS · Productivity)"), group: "identity" },
    {
      ...defineField({
        name: "icon",
        title: "App icon / logo",
        type: "image",
        options: { hotspot: true },
      }),
      group: "identity",
    },
    defineField({
      name: "appStoreUrl",
      title: "App Store URL",
      description:
        "Full App Store link. Empty (or the id000000000 placeholder) → the badge shows a non-clickable 'coming soon' state.",
      type: "url",
      group: "identity",
    }),
    defineField({
      name: "hidden",
      title: "Visibility",
      description:
        "Hidden apps drop out of the landing grid, footer and More page while you fill them in. The page stays reachable by direct URL for previewing.",
      type: "boolean",
      initialValue: false,
      components: { input: EyeToggleInput },
      group: "identity",
    }),

    // ════ Tab: Landing card ════
    { ...accentColorField("accentColor", "Accent color", "The app's brand color — drives the landing-card gradient (also tints the app-page phone screen + dots). Empty → default palette."), group: "landing" },
    { ...locText("cardDescription", "Card description"), group: "landing" },
    {
      ...defineField({
        name: "cardChips",
        title: "Card chips (short feature tags)",
        type: "array",
        of: [defineArrayMember(locString("label", "Label"))],
      }),
      group: "landing",
    },

    // ════ Tab: App page · Hero ════
    { ...locString("heroH1", "Headline", ACCENT_HINT), group: "page", fieldset: "hero" },
    { ...locText("heroSubtitle", "Subtitle"), group: "page", fieldset: "hero" },

    // ════ Tab: App page · Phone mockup ════
    { ...mediaField("screenMedia", "Phone screen — image / GIF", "A real screenshot or animated GIF, shown in a phone frame. Empty → the app icon on a tinted tile (the text mockup below is not displayed in the current design)."), group: "page", fieldset: "mockup" },
    { ...locString("screenLabel", "Text mockup — label (e.g. Deep work)"), group: "page", fieldset: "mockup" },
    { ...locString("screenValue", "Text mockup — big value (e.g. 24:00)"), group: "page", fieldset: "mockup" },
    { ...locString("screenSub", "Text mockup — subtitle (e.g. Session · in flow)"), group: "page", fieldset: "mockup" },
    {
      ...defineField({
        name: "heroChips",
        title: "Floating chips (max 2)",
        type: "array",
        validation: (r) => r.max(2),
        of: [
          defineArrayMember({
            name: "chip",
            type: "object",
            fields: [
              locString("label", "Label (e.g. 🔥 Streak)"),
              locString("value", "Value (e.g. 12 days)"),
              accentColorField(),
            ],
            preview: { select: { title: "label.en", subtitle: "value.en" } },
          }),
        ],
      }),
      group: "page",
      fieldset: "mockup",
    },

    // ════ Tab: App page · Sections (the page builder) ════
    defineField({
      name: "sections",
      title: "Page sections",
      description:
        "The app page body, top to bottom. Add a block, drag to reorder, remove to hide.",
      type: "array",
      group: "page",
      options: {
        // Icon-rich grid picker instead of a plain dropdown of type names.
        insertMenu: {
          showIcons: true,
          views: [{ name: "grid" }, { name: "list" }],
        },
      },
      of: [
        howItWorksSection,
        statSection,
        featuresSection,
        articlesSection,
        testimonialsSection,
        faqSection,
        ctaSection,
        freeSection,
      ],
    }),
  ],
  preview: {
    select: { title: "name.en", slug: "slug.current", hidden: "hidden", media: "icon" },
    prepare: ({ title, slug, hidden, media }) => ({
      title: title ?? slug,
      // Show a hidden marker only when hidden; visible apps keep their icon.
      subtitle: hidden ? `${slug} · hidden` : slug,
      media: hidden ? EyeClosedIcon : media,
    }),
  },
});
