import { readFileSync } from "node:fs";

// Reads the public (published, no token) Sanity dataset so specs know what content
// exists — including hidden apps — instead of guessing from the rendered page.
// `docs`: slugs of the app's filled-in legal docs, in the order the site lists them.
export type CmsApp = { slug: string; hidden: boolean; hasFaq: boolean; docs: string[] };

function publicSanityEnv(): { projectId?: string; dataset: string } {
  let { NEXT_PUBLIC_SANITY_PROJECT_ID: projectId, NEXT_PUBLIC_SANITY_DATASET: dataset } = process.env;
  if (!projectId) {
    // Local runs: read just these two public keys from .env.local (nothing else).
    try {
      for (const line of readFileSync(".env.local", "utf8").split("\n")) {
        const [k, ...v] = line.split("=");
        if (k === "NEXT_PUBLIC_SANITY_PROJECT_ID") projectId = v.join("=").trim();
        if (k === "NEXT_PUBLIC_SANITY_DATASET") dataset = v.join("=").trim();
      }
    } catch {
      /* no .env.local — CI provides env vars */
    }
  }
  return { projectId, dataset: dataset || "production" };
}

async function query<T>(groq: string): Promise<T | undefined> {
  const { projectId, dataset } = publicSanityEnv();
  if (!projectId) return undefined;
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
  return (await res.json()).result as T;
}

// Site-wide legal docs (no app) and which languages have a body.
export type CmsSiteDoc = { slug: string; hasEn: boolean; hasUk: boolean };

export async function cmsSiteDocs(): Promise<CmsSiteDoc[]> {
  return (
    (await query<CmsSiteDoc[]>(`*[_type == "legalDoc" && !defined(app) && defined(slug.current)]{
      "slug": slug.current,
      "hasEn": length(coalesce(contentEn, "")) > 0,
      "hasUk": length(coalesce(contentUk, "")) > 0
    }`)) ?? []
  );
}

let cache: Promise<CmsApp[]> | undefined;

export function cmsApps(): Promise<CmsApp[]> {
  cache ??= (async () => {
    const { projectId, dataset } = publicSanityEnv();
    if (!projectId) return [];
    const query = `*[_type == "app" && defined(slug.current)] | order(hidden asc, orderRank asc){
      "slug": slug.current, "hidden": hidden == true,
      "hasFaq": count(sections[_type == "faqSection"].items[]) > 0,
      "docs": coalesce(*[_type == "legalDoc" && app._ref == ^._id && defined(slug.current)
        && (length(coalesce(contentEn, "")) > 0 || length(coalesce(contentUk, "")) > 0)
      ] | order(title.en asc).slug.current, [])
    }`;
    const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`);
    return (await res.json()).result as CmsApp[];
  })();
  return cache;
}
