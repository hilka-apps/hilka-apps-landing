import { expect, test } from "@playwright/test";

// The slug comes from the first card on the home page, so the test follows CMS content.
for (const locale of ["en", "uk"] as const) {
  test(`app page opens from the home grid in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await page.locator("a.appcard:not(.teaser)").first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/apps/[^/]+$`));
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator(".fp-h1")).toBeVisible();
    await expect(page.locator(".fp-h1")).not.toBeEmpty();
  });
}
