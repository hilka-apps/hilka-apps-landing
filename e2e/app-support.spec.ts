import { expect, test } from "@playwright/test";
import { cmsApps } from "./cms";

// Uses the first app in the CMS, hidden or not: hidden apps' pages must still work for
// preview and must be noindex. These are the URLs entered in App Store Connect.
for (const locale of ["en", "uk"] as const) {
  test(`support page works in ${locale}`, async ({ page }) => {
    const app = (await cmsApps())[0];
    test.skip(!app, "no apps in the CMS");
    const res = await page.goto(`/${locale}/apps/${app.slug}/support`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".cf-form")).toBeVisible();
    await expect(page.locator("#cf-app")).not.toHaveValue("");
    if (app.hasFaq) await expect(page.locator(".faq-accordion")).toBeVisible();
    const robots = page.locator('meta[name="robots"]');
    if (app.hidden) await expect(robots).toHaveAttribute("content", /noindex/);
    else await expect(robots).toHaveCount(0);
  });

  test(`unknown app document is a 404 in ${locale}`, async ({ page }) => {
    const app = (await cmsApps())[0];
    test.skip(!app, "no apps in the CMS");
    expect((await page.goto(`/${locale}/apps/${app.slug}/definitely-not-a-doc`))?.status()).toBe(404);
  });

  test(`unknown app and unknown site document are 404s in ${locale}`, async ({ page }) => {
    expect((await page.goto(`/${locale}/apps/no-such-app/support`))?.status()).toBe(404);
    expect((await page.goto(`/${locale}/apps/no-such-app/privacy`))?.status()).toBe(404);
    expect((await page.goto(`/${locale}/legal/definitely-not-a-doc`))?.status()).toBe(404);
  });
}
