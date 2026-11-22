import { expect, test } from "@playwright/test";
import { cmsApps } from "./cms";

const cases = [
  { path: "/uk/nope", lang: "uk", h1: "Тут нічого немає.", title: /^404 · / },
  { path: "/en/nope/deeper", lang: "en", h1: "Nothing here.", title: /^404 · / },
  { path: "/en/apps/does-not-exist", lang: "en", h1: "Nothing here.", title: /^404 · / },
  { path: "/uk/apps/does-not-exist", lang: "uk", h1: "Тут нічого немає.", title: /^404 · / },
] as const;

for (const c of cases) {
  test(`${c.path} is a localised 404 inside the site chrome`, async ({ page }) => {
    const res = await page.goto(c.path);
    expect(res?.status()).toBe(404);
    await expect(page.locator("html")).toHaveAttribute("lang", c.lang);
    await expect(page.locator("h1")).toHaveText(c.h1);
    await expect(page).toHaveTitle(c.title);
    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
    const home = page.locator("main a.btn-primary");
    await expect(home).toHaveAttribute("href", `/${c.lang}`);
  });
}

test("the 404 page links to the visible apps", async ({ page }) => {
  const visible = (await cmsApps()).filter((a) => !a.hidden);
  test.skip(visible.length === 0, "no visible apps in the CMS");
  await page.goto("/uk/nope");
  for (const app of visible) {
    await expect(page.locator(`main a[href='/uk/apps/${app.slug}']`)).toBeVisible();
  }
});

// The server HTML (what crawlers read) must carry the 404 title, once — not the home title.
for (const [, path] of [
  ["uk", "/uk/nope"],
  ["en", "/en/apps/no-such-app"],
  ["uk", "/uk/apps/no-such-app/support"],
  ["en", "/en/legal/no-such-doc"],
] as const) {
  test(`server HTML of ${path} has only the 404 <title>`, async ({ request }) => {
    const res = await request.get(path, { headers: { "user-agent": "Googlebot/2.1" } });
    expect(res.status()).toBe(404);
    const titles = (await res.text()).match(/<title>[^<]*<\/title>/g) ?? [];
    expect(titles.length).toBeGreaterThan(0);
    for (const t of titles) expect(t).toMatch(/<title>404 · /);
  });
}
