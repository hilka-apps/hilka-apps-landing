import { expect, test } from "@playwright/test";

// Code-driven brand strings (copyright, tab title). CMS copy is renamed by
// scripts/rename-brand.mjs and is not asserted here.
for (const locale of ["en", "uk"] as const) {
  test(`brand reads Hilka Apps in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.locator(".footer-bottom")).toContainText("Hilka Apps");
    expect(await page.title()).not.toMatch(/hylka/i);
  });
}
