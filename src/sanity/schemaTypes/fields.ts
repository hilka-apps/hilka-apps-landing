import { defineField } from "sanity";

// Hint shown under any headline field that supports the *asterisk* accent marker.
export const ACCENT_HINT =
  "Wrap a word or two in *asterisks* to mark them with the lime highlighter (one per heading).";

// ── shared field builders (used by app + siteSettings) ────────────────

/** Localized single-line string (EN / UK side by side). */
export const locString = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
    type: "object",
    options: { columns: 2 },
    fields: [
      defineField({ name: "en", title: "English", type: "string" }),
      defineField({ name: "uk", title: "Ukrainian", type: "string" }),
    ],
  });

/** Localized multi-line text (EN / UK side by side). */
export const locText = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
    type: "object",
    options: { columns: 2 },
    fields: [
      defineField({ name: "en", title: "English", type: "text", rows: 3 }),
      defineField({ name: "uk", title: "Ukrainian", type: "text", rows: 3 }),
    ],
  });

/** Solid accent color (no alpha) — drives gradients/tints in code. */
export const accentColorField = (
  name = "accentColor",
  title = "Accent color",
  description?: string
) =>
  defineField({
    name,
    title,
    description,
    type: "color",
    options: { disableAlpha: true },
  });

/**
 * Still image or animated GIF. Uses the `image` type (not `file`) so Studio
 * shows a live thumbnail of what was uploaded. Served via the raw asset URL,
 * so GIFs keep animating.
 */
export const mediaField = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
    type: "image",
    options: { hotspot: true, accept: "image/*" },
  });
