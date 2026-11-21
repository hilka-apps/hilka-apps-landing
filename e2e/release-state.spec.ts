import { expect, test } from "@playwright/test";
import { cmsApps } from "./cms";

// Before an app is released there is no App Store badge anywhere: a quiet "Coming soon"
// tag by the name, "How it works" as the main action, and a launch CTA at the end.
for (const locale of ["en", "uk"] as const) {
  test(`an unreleased app page uses the tag and launch CTA in ${locale}`, async ({ page }) => {
    const app = (await cmsApps()).find((a) => !a.released);
    test.skip(!app, "every app is released");
    await page.goto(`/${locale}/apps/${app!.slug}`);
    await expect(page.locator(".fp-eyebrow .status-tag")).toHaveText(locale === "en" ? "Coming soon" : "Незабаром");
    await expect(page.locator(".appstore, .appstore-soon")).toHaveCount(0);
    if (app!.hasHowItWorks) {
      await expect(page.locator(".fp-cta-row a.btn-primary[href='#how-it-works']")).toBeVisible();
    }
    const launch = page.locator(".cta-band a.btn-primary[href$='/contact']");
    if ((await page.locator(".cta-band").count()) > 0) {
      await expect(launch).toHaveText(locale === "en" ? "Hear about the launch" : "Дізнатися про запуск");
    }
  });
}

test("the home closing CTA asks to hear about the launch before release", async ({ page }) => {
  const first = (await cmsApps()).find((a) => !a.hidden);
  test.skip(!first || first.released, "the first visible app is released (or none)");
  await page.goto("/en");
  await expect(page.locator(".cta-band a.btn-primary[href='/en/contact']")).toHaveText("Hear about the launch");
  await expect(page.locator(".appstore, .appstore-soon")).toHaveCount(0);
});
