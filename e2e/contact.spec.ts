import { expect, test } from "@playwright/test";

test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/contact");
  });

  test("shows required errors on empty submit", async ({ page }) => {
    await page.locator(".cf-form button[type=submit]").click();
    await expect(page.locator(".cf-error")).toHaveCount(3);
  });

  test("flags a malformed email", async ({ page }) => {
    await page.fill("#cf-name", "Mila");
    await page.fill("#cf-email", "bad");
    await page.fill("#cf-message", "Hello");
    await page.locator(".cf-form button[type=submit]").click();
    await expect(page.locator(".cf-error")).toHaveCount(1);
    await expect(page.locator("#cf-email")).toHaveAttribute("aria-invalid", "true");
  });

  test("shows success after a valid submit (API mocked, no email sent)", async ({ page }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/contact", async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ json: { ok: true } });
    });
    await page.fill("#cf-name", "Mila");
    await page.fill("#cf-email", "mila@example.com");
    await page.fill("#cf-message", "Hello from e2e");
    await page.locator(".cf-form button[type=submit]").click();
    await expect(page.locator(".cf-success")).toBeVisible();
    expect(payload).toMatchObject({ name: "Mila", email: "mila@example.com", type: "suggestion" });
  });
});
