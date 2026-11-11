import type { PortableTextBlock } from "@portabletext/types";
import { getSanityClient, isSanityConfigured } from "./client";
import { urlFor } from "./image";
import { siteConfig } from "@/config/site";

export type Loc = { en?: string; uk?: string };
export type LocRichText = { en?: PortableTextBlock[]; uk?: PortableTextBlock[] };

// ── App page sections (polymorphic, ordered in Studio) ────────────────
export type AppSection =
  | { _type: "howItWorksSection"; _key: string; eyebrow?: Loc; heading?: Loc; steps?: { label?: Loc; title?: Loc; desc?: Loc }[] }
  | { _type: "statSection"; _key: string; number?: string; label?: Loc }
  | { _type: "featuresSection"; _key: string; eyebrow?: Loc; heading?: Loc; items?: { icon?: string; title?: Loc; desc?: Loc }[] }
  | { _type: "articlesSection"; _key: string; eyebrow?: Loc; heading?: Loc; items?: { icon?: string; title?: Loc; excerpt?: Loc }[] }
  | { _type: "testimonialsSection"; _key: string; eyebrow?: Loc; heading?: Loc; items?: { quote?: Loc; name?: string }[] }
  | { _type: "faqSection"; _key: string; eyebrow?: Loc; heading?: Loc; items?: { q?: Loc; a?: Loc }[] }
  | { _type: "ctaSection"; _key: string; heading?: Loc }
  | {
      _type: "freeSection";
      _key: string;
      eyebrow?: Loc;
      heading?: Loc;
      body?: LocRichText;
      mediaUrl?: string | null;
      mediaMime?: string | null;
      ctaLabel?: Loc;
      ctaUrl?: string;
    };

// A still image or short video resolved to a URL + mime (for <img> vs <video>).
export type MediaAsset = { url?: string | null; mime?: string | null };

// A floating chip / plate accent — text + optional color.
export type AccentChip = { label?: Loc; value?: Loc; accent?: string | null };

export type SanityApp = {
  slug: string;
  hidden?: boolean;
  name?: Loc;
  kicker?: Loc;
  heroH1?: Loc;
  heroSubtitle?: Loc;
  appStoreUrl?: string | null;
  iconUrl?: string | null;
  accent?: string | null;
  // Hero phone mockup: a screenshot/recording, or a text fallback + chips.
  screenMedia?: MediaAsset | null;
  screenLabel?: Loc;
  screenValue?: Loc;
  screenSub?: Loc;
  heroChips?: AccentChip[];
  cardDescription?: Loc;
  cardChips?: Loc[];
  sections?: AppSection[];
};

// Lightweight shape for the landing grid + static params
export type SanityAppCard = {
  slug: string;
  name?: Loc;
  kicker?: Loc;
  cardDescription?: Loc;
  cardChips?: Loc[];
  appStoreUrl?: string | null;
  iconUrl?: string | null;
  accent?: string | null;
};

export type SanityLegalDoc = {
  title?: Loc;
  updatedAt: string | null;
  contentEn: string;
  contentUk: string;
};

// Lightweight shape for nav links + static params
export type SanityLegalLink = {
  slug: string;
  title?: Loc;
};

export type SanitySiteSettings = {
  siteName: string | null;
  email: string | null;
  footerTagline: string | null;
  logo: { asset: { _ref: string } } | null;
  favicon: { asset: { _ref: string } } | null;
};

// In dev, fetch fresh every time so Studio edits show on localhost immediately
// (the Sanity webhook only purges the deployed site, not localhost).
// In prod: `tags` lets the webhook purge instantly via revalidateTag("sanity");
// `revalidate` is the hourly safety net if the webhook ever misses.
const REVALIDATE =
  process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600, tags: ["sanity"] } }
    : { next: { revalidate: 0, tags: ["sanity"] } };

const APP_FIELDS = `
  "slug": slug.current,
  hidden,
  name, kicker, heroH1, heroSubtitle, appStoreUrl,
  "iconUrl": icon.asset->url,
  "accent": accentColor.hex,
  "screenMedia": screenMedia{ "url": asset->url, "mime": asset->mimeType },
  screenLabel, screenValue, screenSub,
  heroChips[]{ label, value, "accent": accentColor.hex },
  cardDescription, cardChips,
  sections[]{
    ...,
    _type == "freeSection" => {
      "mediaUrl": media.asset->url,
      "mediaMime": media.asset->mimeType
    }
  }
`;

const CARD_FIELDS = `
  "slug": slug.current,
  name, kicker, cardDescription, cardChips, appStoreUrl,
  "iconUrl": icon.asset->url,
  "accent": accentColor.hex
`;

export async function getApp(slug: string): Promise<SanityApp | null> {
  if (!isSanityConfigured()) return null;
  return getSanityClient().fetch(
    `*[_type == "app" && slug.current == $slug][0]{${APP_FIELDS}}`,
    { slug },
    REVALIDATE
  );
}

export async function getAllApps(): Promise<SanityAppCard[]> {
  if (!isSanityConfigured()) return [];
  return getSanityClient().fetch(
    // Hidden apps drop out of the grid/footer/More page (still reachable by URL).
    // orderRank is set by the drag-to-reorder list in Studio; _createdAt is the
    // tiebreaker for any app that predates the ranking field.
    `*[_type == "app" && defined(slug.current) && hidden != true] | order(orderRank asc, _createdAt asc){${CARD_FIELDS}}`,
    {},
    REVALIDATE
  );
}

// A legal doc with neither language filled is treated as non-existent (404, no link).
const HAS_CONTENT = `(length(coalesce(contentEn, "")) > 0 || length(coalesce(contentUk, "")) > 0)`;
const LEGAL_DOC_FIELDS = `{title, updatedAt, contentEn, contentUk}`;
const LEGAL_LINK_FIELDS = `{ "slug": slug.current, title }`;

// Site-wide documents (no app) — /legal/<slug>, footer, More page.
export async function getLegalDoc(
  slug: string
): Promise<SanityLegalDoc | null> {
  if (!isSanityConfigured()) return null;
  return getSanityClient().fetch(
    `*[_type == "legalDoc" && !defined(app) && slug.current == $slug][0]${LEGAL_DOC_FIELDS}`,
    { slug },
    REVALIDATE
  );
}

export async function getAllLegalDocs(): Promise<SanityLegalLink[]> {
  if (!isSanityConfigured()) return [];
  return getSanityClient().fetch(
    `*[_type == "legalDoc" && !defined(app) && defined(slug.current) && ${HAS_CONTENT}] | order(title.en asc)${LEGAL_LINK_FIELDS}`,
    {},
    REVALIDATE
  );
}

// Documents of one app — /apps/<app>/<slug>, linked from that app's page and support page.
export async function getAppLegalDoc(
  appSlug: string,
  docSlug: string
): Promise<SanityLegalDoc | null> {
  if (!isSanityConfigured()) return null;
  return getSanityClient().fetch(
    `*[_type == "legalDoc" && app->slug.current == $appSlug && slug.current == $docSlug][0]${LEGAL_DOC_FIELDS}`,
    { appSlug, docSlug },
    REVALIDATE
  );
}

export async function getAppLegalDocs(appSlug: string): Promise<SanityLegalLink[]> {
  if (!isSanityConfigured()) return [];
  return getSanityClient().fetch(
    `*[_type == "legalDoc" && app->slug.current == $appSlug && defined(slug.current) && ${HAS_CONTENT}] | order(title.en asc)${LEGAL_LINK_FIELDS}`,
    { appSlug },
    REVALIDATE
  );
}

async function getSiteSettings(): Promise<SanitySiteSettings | null> {
  if (!isSanityConfigured()) return null;
  return getSanityClient().fetch(
    `*[_type == "siteSettings"][0]{siteName, email, footerTagline, logo, favicon}`,
    {},
    REVALIDATE
  );
}

// ── Homepage content (hero text, floating plates, teaser card) ────────
export type PlateStyle = "timer" | "bars" | "wave" | "icon";
export type HeroPlate = {
  style?: PlateStyle;
  media?: MediaAsset | null;
  label?: Loc;
  sub?: Loc;
  value?: Loc;
  accent?: string | null;
};

export type HomeContent = {
  heroEyebrow?: Loc;
  heroHeading?: Loc;
  heroSub?: Loc;
  heroPlates?: HeroPlate[];
  appsEyebrow?: Loc;
  appsHeading?: Loc;
  teaserKicker?: Loc;
  teaserName?: Loc;
  teaserDesc?: Loc;
  ctaHeading?: Loc;
  ctaSub?: Loc;
};

export async function getHomeContent(): Promise<HomeContent | null> {
  if (!isSanityConfigured()) return null;
  return getSanityClient().fetch(
    `*[_type == "homeContent"][0]{
      heroEyebrow, heroHeading, heroSub,
      heroPlates[]{
        style,
        "media": media{ "url": asset->url, "mime": asset->mimeType },
        label, sub, value, "accent": accentColor.hex
      },
      appsEyebrow, appsHeading,
      teaserKicker, teaserName, teaserDesc,
      ctaHeading, ctaSub
    }`,
    {},
    REVALIDATE
  );
}

// ── About page content ───────────────────────────────────────────────
export type AboutContent = {
  heroEyebrow?: Loc;
  heroHeading?: Loc;
  heroLead?: Loc;
  story?: Loc;
  valuesEyebrow?: Loc;
  valuesHeading?: Loc;
  valueItems?: { title?: Loc; desc?: Loc }[];
  ctaHeading?: Loc;
  ctaSub?: Loc;
  ctaLabel?: Loc;
};

export async function getAboutContent(): Promise<AboutContent | null> {
  if (!isSanityConfigured()) return null;
  return getSanityClient().fetch(
    `*[_type == "aboutPage"][0]{
      heroEyebrow, heroHeading, heroLead, story,
      valuesEyebrow, valuesHeading,
      valueItems[]{ title, desc },
      ctaHeading, ctaSub, ctaLabel
    }`,
    {},
    REVALIDATE
  );
}

// ── More / Contact page headers ───────────────────────────────────────
export type PageHeader = {
  heroEyebrow?: Loc;
  heroHeading?: Loc;
  heroIntro?: Loc;
};

async function getPageHeader(type: string): Promise<PageHeader | null> {
  if (!isSanityConfigured()) return null;
  return getSanityClient().fetch(
    `*[_type == $type][0]{ heroEyebrow, heroHeading, heroIntro }`,
    { type },
    REVALIDATE
  );
}

export const getMoreContent = () => getPageHeader("morePage");
export const getContactContent = () => getPageHeader("contactPage");

// Resolved brand values with defaults — single source of truth for name/email/logo.
export type Brand = {
  siteName: string;
  email: string;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
};

export async function getBrand(): Promise<Brand> {
  const s = await getSiteSettings();
  // The browser-tab icon: a dedicated favicon if set, otherwise the logo.
  const faviconSource = s?.favicon ?? s?.logo;
  return {
    siteName: s?.siteName || siteConfig.brand.name,
    email: s?.email || siteConfig.brand.email,
    tagline: s?.footerTagline || null,
    logoUrl: s?.logo
      ? urlFor(s.logo).width(64).height(64).fit("max").url()
      : null,
    faviconUrl: faviconSource
      ? urlFor(faviconSource).width(512).height(512).fit("max").url()
      : null,
  };
}
