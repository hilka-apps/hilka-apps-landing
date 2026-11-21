import { expect, test, type Page } from "@playwright/test";
import { cmsApps } from "./cms";

// The tab row on every per-app page. Uses the first app in the CMS (hidden apps are still
// reachable by URL). Doc tabs come from the CMS, so their checks only run when the app
// has filled-in legal docs.
const tabs = (page: Page) => page.locator("nav.app-tabs");
const hasNoPageScrollX = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

for (const locale of ["en", "uk"] as const) {
  test(`overview shows the app tabs with Overview current in ${locale}`, async ({ page }) => {
    const app = (await cmsApps())[0];
    test.skip(!app, "no apps in the CMS");
    await page.goto(`/${locale}/apps/${app.slug}`);
    await expect(tabs(page)).toBeVisible();
    const links = tabs(page).locator("a");
    await expect(links).toHaveCount(app.docs.length + 2);
    await expect(links.first()).toHaveAttribute("href", `/${locale}/apps/${app.slug}`);
    await expect(links.first()).toHaveAttribute("aria-current", "page");
    await expect(tabs(page).locator('a[aria-current="page"]')).toHaveCount(1);
    for (const [i, doc] of app.docs.entries()) {
      await expect(links.nth(i + 1)).toHaveAttribute("href", `/${locale}/apps/${app.slug}/${doc}`);
    }
    expect(await hasNoPageScrollX(page)).toBe(true);
  });

  test(`Support tab opens the support page and becomes current in ${locale}`, async ({ page }) => {
    const app = (await cmsApps())[0];
    test.skip(!app, "no apps in the CMS");
    await page.goto(`/${locale}/apps/${app.slug}`);
    await tabs(page).locator(`a[href$='/apps/${app.slug}/support']`).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/apps/${app.slug}/support$`));
    await expect(tabs(page)).toBeVisible();
    await expect(tabs(page).locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      `/${locale}/apps/${app.slug}/support`
    );
    expect(await hasNoPageScrollX(page)).toBe(true);
  });

  test(`a legal doc page has its own tab current in ${locale}`, async ({ page }) => {
    const app = (await cmsApps()).find((a) => a.docs.length > 0);
    test.skip(!app, "no app has filled-in legal docs in the CMS");
    const doc = app!.docs[0];
    await page.goto(`/${locale}/apps/${app!.slug}/${doc}`);
    await expect(tabs(page).locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      `/${locale}/apps/${app!.slug}/${doc}`
    );
    expect(await hasNoPageScrollX(page)).toBe(true);
  });
}

test("the tab row scrolls inside itself, not the page, at 320px", async ({ page }) => {
  const app = (await cmsApps())[0];
  test.skip(!app, "no apps in the CMS");
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(`/uk/apps/${app.slug}/support`);
  await expect(tabs(page)).toBeVisible();
  expect(await hasNoPageScrollX(page)).toBe(true);
  // one row: every tab sits on the same line
  const tops = await tabs(page)
    .locator("a")
    .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
});
