import { expect, test } from "@playwright/test";
import { firstAppSlug } from "./helpers";

for (const locale of ["en", "uk"] as const) {
  test(`app page opens from the home grid in ${locale}`, async ({ page }) => {
    const slug = await firstAppSlug(page, locale);
    test.skip(!slug, "no visible apps in the CMS");
    await page.locator("a.appcard:not(.teaser)").first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/apps/${slug}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator(".fp-h1")).toBeVisible();
    await expect(page.locator(".fp-h1")).not.toBeEmpty();
    // Support is always linked from the bottom of the app page.
    await expect(page.locator(`.fp-links a[href$='/apps/${slug}/support']`)).toBeVisible();
  });
}
