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

// Owner decision: soft hairline borders at rest (not 3:1); the field is clearly
// marked when focused — ink border plus a lime ring.
test("form inputs have a soft 1px border and an ink border when focused", async ({ page }) => {
  await page.goto("/en/contact");
  for (const id of ["#cf-name", "#cf-email", "#cf-message"]) {
    const field = page.locator(id);
    const rest = await field.evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(contrastOnWhite(rest), `${id} border ${rest}`).toBeLessThan(2.5);
    expect(await field.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("1px");
    await field.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(field).toBeFocused();
    // toHaveCSS retries, so the 0.15s border transition can finish
    await expect(field).toHaveCSS("border-top-color", INK);
  }
});

test("the selected contact intent is bolder than the other, not marked by colour alone", async ({ page }) => {
  await page.goto("/en/contact");
  const weight = (sel: string) => page.locator(sel).first().evaluate((el) => Number(getComputedStyle(el).fontWeight));
  expect(await weight(".cf-tab.sel")).toBeGreaterThan(await weight(".cf-tab:not(.sel)"));
  const shadow = await page.locator(".cf-tab.sel").evaluate((el) => getComputedStyle(el).boxShadow);
  expect(shadow).not.toContain(INK);
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
      const h1 = page.locator("h1").first();
      await expect(h1).toHaveCSS("overflow-wrap", "break-word");
      // no automatic hyphenation: Ukrainian auto-hyphens break words in odd places
      await expect(h1).toHaveCSS("hyphens", "manual");
      expect(await hasNoPageScrollX(page), path).toBe(true);
    }
  });

  test("the /uk contact heading has no hyphenated line breaks", async ({ page }) => {
    await page.goto("/uk/contact");
    // each rendered line of the h1 ends with a whole word, never an inserted "-"
    const lineEnds = await page.locator("h1").first().evaluate((h1) => {
      const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
      const chars: { ch: string; top: number }[] = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent ?? "";
        for (let i = 0; i < text.length; i++) {
          const r = document.createRange();
          r.setStart(n, i);
          r.setEnd(n, i + 1);
          const rect = r.getClientRects()[0];
          if (rect) chars.push({ ch: text[i], top: Math.round(rect.top) });
        }
      }
      const ends: string[] = [];
      chars.forEach((c, i) => {
        const next = chars[i + 1];
        if (next && next.top > c.top + 4 && c.ch.trim()) ends.push(c.ch + next.ch);
      });
      return ends;
    });
    // a word broken across lines would show as letter→letter with no space between
    for (const pair of lineEnds) expect(pair, `mid-word break at "${pair}"`).not.toMatch(/^\p{L}\p{L}$/u);
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

for (const [locale, skip, home] of [
  ["en", "Skip to content", "Hilka Apps home"],
  ["uk", "Перейти до змісту", "Hilka Apps — головна"],
] as const) {
  test(`skip link is the first stop and the logo is labelled in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}/about`);
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText(skip);
    await expect(focused).toHaveAttribute("href", "#main");
    await expect(focused).toBeVisible();
    await expect(page.locator("main#main")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator(".site-header a.brand")).toHaveAttribute("aria-label", home);
  });
}

for (const width of [320, 390, 1280]) {
  test(`footer email sits in the Company column on one line at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/uk");
    const email = page.locator(".site-footer a[href^='mailto:']");
    await expect(email).toHaveCount(1);
    // same column as the About link
    const col = page.locator(".footer-col", { has: page.locator("a[href$='/about']") });
    await expect(col.locator("a[href^='mailto:']")).toHaveCount(1);
    const lines = await email.evaluate((el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size;
    });
    expect(lines).toBe(1);
    expect(await hasNoPageScrollX(page)).toBe(true);
  });
}
