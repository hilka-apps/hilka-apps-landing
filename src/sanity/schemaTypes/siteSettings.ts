import { defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

// Brand-level settings (name, contact, logo). Homepage content lives in the
// separate "Site content" (homeContent) document.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Brand",
  type: "document",
  icon: CogIcon,
  fields: [
    { name: "siteName", title: "Site name", type: "string", initialValue: "Hilka Apps" },
    { name: "email", title: "Contact email", type: "string", initialValue: "hilka.apps@gmail.com" },
    { name: "footerTagline", title: "Footer tagline", type: "string" },
    {
      name: "logo",
      title: "Logo (SVG / PNG)",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "favicon",
      title: "Favicon (browser tab icon)",
      description:
        "Square icon shown on the browser tab. Falls back to the logo if empty. PNG/SVG, ideally 512×512.",
      type: "image",
      options: { accept: "image/*" },
    },
  ],
  preview: {
    select: { title: "siteName" },
    prepare: ({ title }) => ({ title: title || "Brand" }),
  },
});
