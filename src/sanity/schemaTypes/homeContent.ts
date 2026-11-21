import { defineArrayMember, defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";
import { locString, locText, accentColorField, mediaField, ACCENT_HINT } from "./fields";

// One floating hero plate: a built-in animation (or your own image/GIF) + text.
const heroPlate = defineArrayMember({
  name: "plate",
  type: "object",
  fields: [
    defineField({
      name: "style",
      title: "Animation",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Timer", value: "timer" },
          { title: "Bar chart", value: "bars" },
          { title: "Audio wave", value: "wave" },
          { title: "Icon tile", value: "icon" },
        ],
      },
      initialValue: "timer",
    }),
    mediaField("media", "Image / GIF (optional)", "Shown instead of the animation for this plate."),
    locString("label", "Label"),
    locString("sub", "Sub line"),
    locString("value", "Big value (timer text or emoji)"),
    accentColorField(),
  ],
  preview: {
    select: { title: "label.en", subtitle: "style", media: "media" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Plate",
      subtitle: subtitle ? `${subtitle}` : undefined,
      media,
    }),
  },
});

export const homeContent = defineType({
  name: "homeContent",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "apps", title: "Apps section" },
    { name: "cta", title: "Closing CTA" },
    // Suppress Studio's auto "All fields" tab by claiming its reserved name.
    { name: "all-fields", title: "All fields", hidden: true },
  ],
  // Sub-group the teaser inside the Apps tab.
  fieldsets: [
    { name: "teaser", title: "\"What's next\" teaser card", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    // ── Hero ──
    { ...locString("heroEyebrow", "Eyebrow"), group: "hero" },
    { ...locString("heroHeading", "Headline", ACCENT_HINT), group: "hero" },
    { ...locText("heroSub", "Subtitle"), group: "hero" },
    {
      ...defineField({
        name: "heroPlates",
        title: "Floating plates",
        description:
          "Not displayed in the current design (the hero is text only). Kept so the content isn't lost.",
        type: "array",
        validation: (r) => r.max(4),
        of: [heroPlate],
      }),
      group: "hero",
    },

    // ── Apps section (heading + teaser) ──
    { ...locString("appsEyebrow", "Eyebrow"), group: "apps" },
    { ...locString("appsHeading", "Heading", ACCENT_HINT), group: "apps" },
    { ...locString("teaserKicker", "Kicker (e.g. In the works)"), group: "apps", fieldset: "teaser" },
    { ...locString("teaserName", "Title"), group: "apps", fieldset: "teaser" },
    { ...locText("teaserDesc", "Description"), group: "apps", fieldset: "teaser" },

    // ── Closing CTA band ──
    { ...locString("ctaHeading", "Heading", ACCENT_HINT), group: "cta" },
    { ...locText("ctaSub", "Subtitle"), group: "cta" },
  ],
  preview: {
    // Map a title key to an always-present field so the form header has a
    // value to show; prepare then forces the friendly label.
    select: { title: "_type" },
    prepare: () => ({ title: "Home page" }),
  },
});
