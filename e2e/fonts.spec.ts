import { expect, test } from "@playwright/test";

// Ukrainian headings must render in the web font, not a system fallback:
// the h1's first font-family is Literata and its Cyrillic face actually loaded.
test("/uk headings render in the Cyrillic web font", async ({ page }) => {
  await page.goto("/uk/about");
  const result = await page.evaluate(async () => {
    await document.fonts.ready;
    const h1 = document.querySelector("h1");
    if (!h1) return { family: "", cyrillicLoaded: false };
    const family = getComputedStyle(h1).fontFamily.split(",")[0].replace(/["']/g, "").trim();
    const cyrillicLoaded = [...document.fonts].some(
      (f) =>
        f.family.replace(/["']/g, "") === family &&
        f.status === "loaded" &&
        /U\+0?4[0-9A-F]{2}/i.test(f.unicodeRange)
    );
    return { family, cyrillicLoaded };
  });
  expect(result.family).toMatch(/Literata/);
  expect(result.cyrillicLoaded).toBe(true);
});
