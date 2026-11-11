import type { Page } from "@playwright/test";

/** Slug of the first visible app card on the home page, or null when no app is visible. */
export async function firstAppSlug(page: Page, locale: string): Promise<string | null> {
  await page.goto(`/${locale}`);
  const href = await page.locator("a.appcard:not(.teaser)").first().getAttribute("href", { timeout: 2_000 }).catch(() => null);
  return href?.match(/\/apps\/([^/?#]+)/)?.[1] ?? null;
}
