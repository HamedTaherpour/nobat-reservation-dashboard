import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec next dev --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
