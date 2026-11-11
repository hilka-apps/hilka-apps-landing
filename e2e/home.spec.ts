import { expect, test } from "@playwright/test";

// The grid may legitimately be empty (all apps hidden before launch) — the teaser card
// is always there, so the home page never looks broken.
for (const locale of ["en", "uk"] as const) {
  test(`home renders in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator(".lp-h1")).toBeVisible();
    await expect(page.locator("#apps")).toBeVisible();
    await expect(page.locator("a.appcard.teaser")).toBeVisible();
  });
}

test("root redirects to a locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|uk)$/);
});
