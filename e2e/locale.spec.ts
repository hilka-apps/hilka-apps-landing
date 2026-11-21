import { expect, test } from "@playwright/test";

// The EN / УКР toggle sits in the header on every screen size.
test("language switch keeps the current path", async ({ page }) => {
  await page.goto("/en/contact");
  await page.locator(".lang-switch button", { hasText: "УКР" }).click();
  await expect(page).toHaveURL(/\/uk\/contact$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator(".lang-switch button[aria-pressed='true']")).toHaveText("УКР");
});

test("language switch keeps the #hash", async ({ page }) => {
  await page.goto("/en#apps");
  await page.locator(".lang-switch button", { hasText: "УКР" }).click();
  await expect(page).toHaveURL(/\/uk#apps$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});

test("More is not in the header nav but the page and its footer link stay", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator(".site-header a[href$='/more'], .drawer a[href$='/more']")).toHaveCount(0);
  await expect(page.locator(".site-footer a[href='/en/more']")).toHaveCount(1);
  expect((await page.goto("/en/more"))?.status()).toBe(200);
});
