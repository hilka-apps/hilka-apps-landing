import { expect, test } from "@playwright/test";
import { cmsApps } from "./cms";

for (const locale of ["en", "uk"] as const) {
  test(`app page opens from the home grid in ${locale}`, async ({ page }) => {
    const app = (await cmsApps()).find((a) => !a.hidden);
    test.skip(!app, "every app is hidden in the CMS (pre-launch)");
    await page.goto(`/${locale}`);
    await page.locator(`a.appcard[href$='/apps/${app!.slug}']`).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/apps/${app!.slug}$`));
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator(".fp-h1")).toBeVisible();
    await expect(page.locator(".fp-h1")).not.toBeEmpty();
    await expect(page.locator(`.fp-links a[href$='/apps/${app!.slug}/support']`)).toBeVisible();
  });
}
