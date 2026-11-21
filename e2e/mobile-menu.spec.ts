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
    await page.locator(".drawer-langs button", { hasText: "Українська" }).click();
    await expect(page).toHaveURL(/\/uk\/about$/);
  });
});

test.describe("mobile menu focus", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "drawer is the mobile navigation");
  });

  test("the menu button exposes its state and the drawer it controls", async ({ page }) => {
    await page.goto("/en");
    const button = page.locator(".hamburger");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    const controls = await button.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toHaveClass(/drawer/);
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
  });

  for (const how of ["Escape", "close button", "link"] as const) {
    test(`focus returns to the menu button after closing with ${how}`, async ({ page }) => {
      await page.goto("/en");
      await page.locator(".hamburger").click();
      await expect(page.locator(".drawer.open")).toBeVisible();
      if (how === "Escape") await page.keyboard.press("Escape");
      if (how === "close button") await page.locator(".drawer-close").click();
      if (how === "link") await page.locator(".drawer nav a[href$='/about']").click();
      await expect(page.locator(".drawer.open")).toHaveCount(0);
      await expect(page.locator(".hamburger")).toBeFocused();
    });
  }
});
