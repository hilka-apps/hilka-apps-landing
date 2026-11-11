import { expect, test } from "@playwright/test";

test("language switch keeps the current path", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "header dropdown is a desktop control");
  await page.goto("/en/contact");
  await page.locator(".lang-btn").click();
  await page.locator(".lang-menu button", { hasText: "Українська" }).click();
  await expect(page).toHaveURL(/\/uk\/contact$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
});
