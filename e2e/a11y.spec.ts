import { expect, test, type Page } from "@playwright/test";
import { cmsApps } from "./cms";

const INK = "rgb(35, 38, 26)";

// WCAG relative-luminance contrast of an "rgb(r, g, b)" colour against white.
function contrastOnWhite(rgb: string): number {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (l + 0.05);
}

const hasNoPageScrollX = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test("form inputs have a 3:1 boundary against white (WCAG 1.4.11)", async ({ page }) => {
  await page.goto("/en/contact");
  for (const id of ["#cf-name", "#cf-email", "#cf-message"]) {
    const border = await page.locator(id).evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(contrastOnWhite(border), `${id} border ${border}`).toBeGreaterThanOrEqual(3);
  }
});

test("the selected contact intent is marked by an ink outline, not colour alone", async ({ page }) => {
  await page.goto("/en/contact");
  const shadow = await page.locator(".cf-tab.sel").evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).toContain(INK);
});

test("the current page in the desktop nav is bold and underlined in ink", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop nav");
  await page.goto("/en/about");
  const current = page.locator('.nav a[aria-current="page"]');
  await expect(current).toHaveCount(1);
  const style = await current.evaluate((el) => ({
    weight: Number(getComputedStyle(el).fontWeight),
    bar: getComputedStyle(el, "::after").backgroundColor,
  }));
  expect(style.weight).toBeGreaterThanOrEqual(600);
  expect(style.bar).toBe(INK);
});

test("the current page in the drawer is underlined in ink", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "drawer is the mobile navigation");
  await page.goto("/en/about");
  await page.locator(".hamburger").click();
  const current = page.locator('.drawer nav a[aria-current="page"]');
  await expect(current).toHaveCSS("text-decoration-color", INK);
  await expect(current).toHaveCSS("text-decoration-line", "underline");
});

for (const locale of ["en", "uk"] as const) {
  test(`header nav and language toggle are labelled in ${locale}`, async ({ page }, testInfo) => {
    await page.goto(`/${locale}`);
    const label = await page.locator(".site-header nav").getAttribute("aria-label");
    expect(label).toBeTruthy();
    if (locale === "uk") expect(label).not.toBe("Primary");
    if (testInfo.project.name === "desktop") {
      // accessible names match the visible text
      const group = page.locator(".lang-switch");
      await expect(group.getByRole("button", { name: "EN", exact: true })).toBeVisible();
      await expect(group.getByRole("button", { name: "УКР", exact: true })).toBeVisible();
    }
  });
}

test.describe("320px wide screens", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("the header fits: language switch moves into the drawer", async ({ page }) => {
    await page.goto("/uk");
    await expect(page.locator(".site-header .lang-switch")).toBeHidden();
    await expect(page.locator(".hamburger")).toBeVisible();
    expect(await hasNoPageScrollX(page)).toBe(true);
  });

  test("long Ukrainian headings wrap instead of widening the page", async ({ page }) => {
    const app = (await cmsApps())[0];
    const paths = ["/uk", "/uk/about", "/uk/contact", "/uk/more", "/uk/legal/privacy"];
    if (app) paths.push(`/uk/apps/${app.slug}`, `/uk/apps/${app.slug}/support`);
    for (const path of paths) {
      const res = await page.goto(path);
      if (res?.status() === 404) continue; // site doc not published
      await expect(page.locator("h1").first()).toHaveCSS("overflow-wrap", "break-word");
      expect(await hasNoPageScrollX(page), path).toBe(true);
    }
  });
});

test("home app cards are read in full and show the store status once", async ({ page }) => {
  test.skip((await cmsApps()).every((a) => a.hidden), "no visible apps in the CMS");
  await page.goto("/en");
  const cards = page.locator("a.appcard:not(.teaser)");
  await expect(cards.first()).toBeVisible();
  for (const card of await cards.all()) {
    await expect(card).not.toHaveAttribute("aria-label");
    await expect(card.locator(".appstore")).toHaveCount(0);
  }
});
