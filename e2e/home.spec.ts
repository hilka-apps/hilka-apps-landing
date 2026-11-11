import { expect, test } from "@playwright/test";
import { cmsApps } from "./cms";

for (const locale of ["en", "uk"] as const) {
  test(`home renders in ${locale}`, async ({ page }) => {
    const visible = (await cmsApps()).filter((a) => !a.hidden);
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator(".lp-h1")).toBeVisible();
    await expect(page.locator("#apps")).toBeVisible();
    await expect(page.locator("a.appcard.teaser")).toBeVisible();
    // Every visible CMS app has a card; with none (pre-launch) only the teaser shows.
    await expect(page.locator("a.appcard:not(.teaser)")).toHaveCount(visible.length);
  });
}

test("root redirects to a locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|uk)$/);
});
