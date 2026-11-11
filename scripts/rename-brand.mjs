/**
 * Rename the studio brand in published Sanity content: "Hylka" → "Hilka" and the old
 * contact address → hilka.apps@gmail.com.
 *
 * Dry run (default) — prints every document and top-level field it would change:
 *   node scripts/rename-brand.mjs
 * Apply (needs SANITY_WRITE_TOKEN with Editor rights, read from .env.local):
 *   node scripts/rename-brand.mjs --apply
 *
 * Only top-level fields that actually change are patched; system keys (_id, _type, …)
 * are never touched. Safe to re-run: a second run finds nothing to change.
 */
import { pathToFileURL } from "node:url";

const OLD_EMAIL = /hello@hylkaapps\.com/g;
const NEW_EMAIL = "hilka.apps@gmail.com";

const TYPES = ["siteSettings", "homeContent", "aboutPage", "morePage", "contactPage", "app", "legalDoc"];

export function rewriteBrand(value) {
  if (typeof value === "string") {
    return value.replace(OLD_EMAIL, NEW_EMAIL).replace(/Hylka/g, "Hilka").replace(/hylka/g, "hilka");
  }
  if (Array.isArray(value)) return value.map(rewriteBrand);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, k.startsWith("_") ? v : rewriteBrand(v)])
    );
  }
  return value;
}

function changedFields(doc) {
  const next = rewriteBrand(doc);
  return Object.keys(doc).filter(
    (k) => !k.startsWith("_") && JSON.stringify(doc[k]) !== JSON.stringify(next[k])
  ).map((k) => [k, next[k]]);
}

async function main() {
  const apply = process.argv.includes("--apply");
  const { loadEnvConfig } = (await import("@next/env")).default;
  loadEnvConfig(process.cwd());
  const { createClient } = await import("@sanity/client");

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = apply ? process.env.SANITY_WRITE_TOKEN : process.env.SANITY_API_TOKEN;
  if (!projectId) throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (apply && !token) throw new Error("Set SANITY_WRITE_TOKEN (Editor) to apply");

  const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false, perspective: "published" });
  const docs = await client.fetch(`*[_type in $types]`, { types: TYPES });

  let total = 0;
  const tx = client.transaction();
  for (const doc of docs) {
    const fields = changedFields(doc);
    if (fields.length === 0) continue;
    total += 1;
    console.log(`${doc._type} ${doc._id}: ${fields.map(([k]) => k).join(", ")}`);
    tx.patch(doc._id, (p) => p.set(Object.fromEntries(fields)));
  }

  if (total === 0) return console.log("Nothing to rename.");
  if (!apply) return console.log(`\nDry run: ${total} document(s) would change. Re-run with --apply to write.`);
  await tx.commit();
  console.log(`\nUpdated ${total} document(s).`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
