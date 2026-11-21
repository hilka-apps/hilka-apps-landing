import { expect, test, type Page } from "@playwright/test";
import { cmsApps, cmsSiteDocs } from "./cms";

// Pages share one left edge: the content column starts where the header logo starts.
const left = async (page: Page, selector: string) => (await page.locator(selector).first().boundingBox())!.x;

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "alignment is checked on the desktop grid");
});

test("a legal document starts at the same left edge as the header", async ({ page }) => {
  const doc = (await cmsSiteDocs()).find((d) => d.hasEn);
  test.skip(!doc, "no site document in the CMS");
  await page.goto(`/en/legal/${doc!.slug}`);
  const brand = await left(page, ".site-header .brand");
  expect(Math.abs((await left(page, "h1")) - brand)).toBeLessThanOrEqual(1);
  expect(Math.abs((await left(page, ".doc-wrap p")) - brand)).toBeLessThanOrEqual(1);
});

test("the app page FAQ spans the same column as the grids above it", async ({ page }) => {
  const app = (await cmsApps()).find((a) => a.hasFaq);
  test.skip(!app, "no app with an FAQ in the CMS");
  await page.goto(`/en/apps/${app!.slug}`);
  const indent = page.locator(".faq-accordion").locator("xpath=ancestor::div[contains(@class,'indent')][1]");
  const col = (await indent.boundingBox())!;
  const faq = (await page.locator(".faq-accordion").boundingBox())!;
  expect(Math.abs(faq.x - col.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(faq.width - col.width)).toBeLessThanOrEqual(1);
});

test("the app hero uses the section spacing", async ({ page }) => {
  const app = (await cmsApps())[0];
  test.skip(!app, "no apps in the CMS");
  await page.goto(`/en/apps/${app.slug}`);
  const pad = (sel: string) =>
    page.locator(sel).first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return [cs.paddingTop, cs.paddingBottom];
    });
  expect(await pad(".fp-hero")).toEqual(await pad("section.section"));
});
