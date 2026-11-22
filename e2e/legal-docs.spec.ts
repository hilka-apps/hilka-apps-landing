import { expect, test } from "@playwright/test";
import { cmsSiteDocs } from "./cms";

test("a Ukrainian page with an English-only body says so and marks the body lang=en", async ({ page }) => {
  const doc = (await cmsSiteDocs()).find((d) => d.hasEn && !d.hasUk);
  test.skip(!doc, "no English-only site document in the CMS");
  await page.goto(`/uk/legal/${doc!.slug}`);
  await expect(page.locator(".doc-lang-note")).toHaveText("Цей документ поки доступний лише англійською.");
  await expect(page.locator('.doc-wrap [lang="en"]')).not.toBeEmpty();
});

test("a document in the page language has no fallback note", async ({ page }) => {
  const doc = (await cmsSiteDocs()).find((d) => d.hasEn);
  test.skip(!doc, "no English site document in the CMS");
  await page.goto(`/en/legal/${doc!.slug}`);
  await expect(page.locator(".doc-lang-note")).toHaveCount(0);
  await expect(page.locator('.doc-wrap [lang]')).toHaveCount(0);
});
