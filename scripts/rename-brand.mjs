/**
 * Rename the studio brand in published Sanity content: "Hylka" → "Hilka" and the old
 * contact address → hilka.apps@gmail.com.
 *
 * Dry run (default) — prints every document (published AND open drafts, so a later
 * Publish can't bring the old name back) and each field's before → after:
 *   node scripts/rename-brand.mjs
 * Apply (needs SANITY_WRITE_TOKEN with Editor rights, read from .env.local):
 *   node scripts/rename-brand.mjs --apply
 *
 * Only top-level fields that actually change are patched. Never touched: system keys
 * (_id, _type, _key, _ref…), slugs and URL fields (they may point at domains we don't own).
 * Safe to re-run: a second run finds nothing to change.
 */
import { pathToFileURL } from "node:url";

const OLD_EMAIL = /hello@hylkaapps\.com/g;
const NEW_EMAIL = "hilka.apps@gmail.com";

const TYPES = ["siteSettings", "homeContent", "aboutPage", "morePage", "contactPage", "app", "legalDoc"];

// Keys whose values are identifiers or addresses, not copy.
const SKIP_KEY = (k) => k.startsWith("_") || k === "slug" || k === "href" || /url$/i.test(k);

// "Hylka" → "Hilka" in any letter case ("HYLKA" → "HILKA").
const renameWord = (m) => m.replace("y", "i").replace("Y", "I");

export function rewriteBrand(value) {
  if (typeof value === "string") {
    return value.replace(OLD_EMAIL, NEW_EMAIL).replace(/hylka/gi, renameWord);
  }
  if (Array.isArray(value)) return value.map(rewriteBrand);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, SKIP_KEY(k) ? v : rewriteBrand(v)])
    );
  }
  return value;
}

/** Documents that would change, with each changed top-level field's before/after value. */
export function planChanges(docs) {
  return docs.flatMap((doc) => {
    const next = rewriteBrand(doc);
    const fields = Object.keys(doc)
      .filter((k) => !SKIP_KEY(k) && JSON.stringify(doc[k]) !== JSON.stringify(next[k]))
      .map((key) => ({ key, before: doc[key], after: next[key] }));
    return fields.length ? [{ id: doc._id, type: doc._type, fields }] : [];
  });
}

// Short "…context…" around each change, so long Markdown bodies stay readable.
function preview(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const i = text.search(/hylka|hilka/i);
  const start = Math.max(0, i - 40);
  return (start > 0 ? "…" : "") + text.slice(start, start + 120).replace(/\n/g, " ") + (text.length > start + 120 ? "…" : "");
}

async function main() {
  const apply = process.argv.includes("--apply");
  const { loadEnvConfig } = (await import("@next/env")).default;
  loadEnvConfig(process.cwd());
  const { createClient } = await import("@sanity/client");

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  // Drafts are only readable with a token; the dry run uses the read token.
  const token = apply ? process.env.SANITY_WRITE_TOKEN : process.env.SANITY_API_TOKEN;
  if (!projectId) throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID");
  if (apply && !token) throw new Error("Set SANITY_WRITE_TOKEN (Editor) to apply");

  // "raw" = published docs + drafts (but not release versions).
  const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false, perspective: "raw" });
  const docs = await client.fetch(`*[_type in $types && !(_id in path("versions.**"))]`, { types: TYPES });

  const plan = planChanges(docs);
  if (plan.length === 0) return console.log("Nothing to rename.");
  for (const { id, type, fields } of plan) {
    console.log(`\n${type} ${id}`);
    for (const { key, before, after } of fields) {
      console.log(`  ${key}:\n    - ${preview(before)}\n    + ${preview(after)}`);
    }
  }
  if (!apply) return console.log(`\nDry run: ${plan.length} document(s) would change. Re-run with --apply to write.`);

  const tx = client.transaction();
  for (const { id, fields } of plan) {
    tx.patch(id, (p) => p.set(Object.fromEntries(fields.map((f) => [f.key, f.after]))));
  }
  await tx.commit();
  console.log(`\nUpdated ${plan.length} document(s).`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
