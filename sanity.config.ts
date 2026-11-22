import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { newDocumentOptions, templates } from "./src/sanity/templates";

export default defineConfig({
  name: "hilka-apps",
  title: "Hilka Apps",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool(), colorInput()],
  schema: { types: schemaTypes, templates },
  document: { newDocumentOptions },
});
