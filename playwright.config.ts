import { defineConfig, devices } from "@playwright/test";

// End-to-end (PLAN.md §12.5). Playwright starts the dev server itself; locally it reuses one already on 3100.
// CI=1 never reuses one (break-check.sh relies on that, so a spec always drives the tree it was started in).
export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  webServer: {
    // e2e never calls the real model (no spend), and keeps the browser voice so CI never downloads Kokoro's 325 MB
    command: "GENERATION_MOCK=1 NEXT_PUBLIC_VOICE=browser npm run dev",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "chromium-mobile", use: { ...devices["Pixel 5"], viewport: { width: 320, height: 568 } } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
