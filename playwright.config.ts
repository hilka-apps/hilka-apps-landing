import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;
const PORT = 3001;
const baseURL = `http://localhost:${PORT}`;

// Smoke tests run against the production build (`next start`). Run `npm run build`
// first. A server already on :3001 is NOT reused: e2e always starts its own with
// RESEND_API_KEY blanked, so no test can ever send real email.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run start",
    url: `${baseURL}/en`,
    reuseExistingServer: false,
    timeout: 120_000,
    // Empty string wins over .env.local (Next only fills undefined vars).
    env: { RESEND_API_KEY: "" },
  },
});
