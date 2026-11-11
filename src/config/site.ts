// Non-secret site configuration. Secrets (API keys, tokens) live in env.
export const siteConfig = {
  // Where contact-form messages land. Add addresses to fan out to more inboxes.
  notifyEmails: ["milagalko1@gmail.com"],

  // Resend sender — must be a verified address/domain in Resend.
  // TODO: switch to a branded sender once a domain is verified in Resend.
  emailFrom: "Hilka Apps <onboarding@resend.dev>",

  // Brand fallbacks — used only when Sanity siteSettings is empty.
  brand: {
    name: "Hilka Apps",
    email: "hilka.apps@gmail.com",
  },

  // Shared App Store link for apps with no `appStoreUrl` in Sanity.
  // null → the badge renders inert instead of pointing at a dead link.
  appStoreFallbackUrl: null as string | null,
};

/**
 * Resolves an App Store URL from Sanity. The `id000000000` placeholder and any
 * empty value count as "not set" → the badge renders inert.
 */
export function resolveStoreUrl(url?: string | null): string | undefined {
  if (!url || url.includes("id000000000")) {
    return siteConfig.appStoreFallbackUrl ?? undefined;
  }
  return url;
}
