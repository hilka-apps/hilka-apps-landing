import { defineConfig, devices } from "@playwright/test";

const CI = !!process.env.CI;
const PORT = 3001;
const baseURL = `http://localhost:${PORT}`;

// Smoke tests run against the production build (`next start`).
// Locally: `npm run build` first, or keep a server running on :3001 and it is reused.
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
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
