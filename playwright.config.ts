import { defineConfig, devices, type Project } from "@playwright/test";

/**
 * Config focused on capturing documentation screenshots.
 * Boots Next in dev automatically and points baseURL at it.
 * Screenshots are captured for each theme (light/dark) x device (desktop/mobile).
 */

const desktop = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1440, height: 900 },
};
// iPhone 13 viewport, rendered on Chromium (so we don't download WebKit).
const mobile = { ...devices["iPhone 13"], browserName: "chromium" as const };

type Theme = "light" | "dark";
const themes: Theme[] = ["light", "dark"];

// Builds device x theme projects for a given spec file.
function matrix(
  prefix: string,
  testMatch: RegExp,
  extra: Partial<Project> = {},
): Project[] {
  const out: Project[] = [];
  for (const theme of themes) {
    out.push({
      name: `${prefix}desktop-${theme}`,
      testMatch,
      metadata: { device: "desktop", theme },
      use: { ...desktop, colorScheme: theme },
      ...extra,
    });
    out.push({
      name: `${prefix}mobile-${theme}`,
      testMatch,
      metadata: { device: "mobile", theme },
      use: { ...mobile, colorScheme: theme },
      ...extra,
    });
  }
  return out;
}

export default defineConfig({
  testDir: "./e2e",
  // consistent prints: no parallelism, no retries
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "off",
  },
  projects: [
    // --- real session capture (manual login, once) ---
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: {
        ...desktop,
        headless: false, // you must see the window to log into Google
        // Use the installed Chrome (not the bundled Chromium) and hide the
        // automation flag — reduces Google's "browser not secure" block.
        channel: "chrome",
        launchOptions: {
          args: ["--disable-blink-features=AutomationControlled"],
        },
      },
    },

    // --- public flows (no login) ---
    ...matrix("", /screenshots\.spec\.ts/),

    // --- authenticated flows (reuse the storageState from setup) ---
    ...matrix("auth-", /authenticated\.spec\.ts/, { dependencies: ["setup"] }),
  ],
  // boots `next dev` on its own and waits until it is ready
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
