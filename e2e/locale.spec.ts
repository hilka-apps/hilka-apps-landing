import { expect, test } from "@playwright/test";

// The EN / УКР toggle sits in the header on every screen size.
test("language switch keeps the current path", async ({ page }) => {
  await page.goto("/en/contact");
  await page.locator(".lang-switch button", { hasText: "УКР" }).click();
  await expect(page).toHaveURL(/\/uk\/contact$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator(".lang-switch button[aria-pressed='true']")).toHaveText("УКР");
});
