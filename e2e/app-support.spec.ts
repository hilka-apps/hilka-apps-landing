import { expect, test } from "@playwright/test";
import { firstAppSlug } from "./helpers";

for (const locale of ["en", "uk"] as const) {
  test(`support page preselects the app in ${locale}`, async ({ page }) => {
    const slug = await firstAppSlug(page, locale);
    test.skip(!slug, "no visible apps in the CMS");
    const res = await page.goto(`/${locale}/apps/${slug}/support`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".cf-form")).toBeVisible();
    await expect(page.locator("#cf-app")).not.toHaveValue("");
  });

  test(`unknown app document is a 404 in ${locale}`, async ({ page }) => {
    const slug = await firstAppSlug(page, locale);
    test.skip(!slug, "no visible apps in the CMS");
    const res = await page.goto(`/${locale}/apps/${slug}/definitely-not-a-doc`);
    expect(res?.status()).toBe(404);
  });

  test(`unknown app and unknown site document are 404s in ${locale}`, async ({ page }) => {
    expect((await page.goto(`/${locale}/apps/no-such-app/support`))?.status()).toBe(404);
    expect((await page.goto(`/${locale}/apps/no-such-app/privacy`))?.status()).toBe(404);
    expect((await page.goto(`/${locale}/legal/definitely-not-a-doc`))?.status()).toBe(404);
  });
}
