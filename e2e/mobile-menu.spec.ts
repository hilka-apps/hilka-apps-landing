import { expect, test } from "@playwright/test";

test.describe("mobile menu", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "drawer is the mobile navigation");
  });

  test("opens, closes on Escape and releases scroll lock", async ({ page }) => {
    await page.goto("/en");
    await page.locator(".hamburger").click();
    await expect(page.locator(".drawer.open")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(page.locator(".drawer.open")).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("navigates from a drawer link", async ({ page }) => {
    await page.goto("/en");
    await page.locator(".hamburger").click();
    await page.locator(".drawer nav a[href$='/about']").click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator(".drawer.open")).toHaveCount(0);
  });

  test("switches language from the drawer", async ({ page }) => {
    await page.goto("/en/about");
    await page.locator(".hamburger").click();
    await page.locator(".drawer-langs button", { hasText: "UK" }).click();
    await expect(page).toHaveURL(/\/uk\/about$/);
  });
});
