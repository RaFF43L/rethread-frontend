import { test as base, expect } from "@playwright/test";

type Theme = "light" | "dark";

/**
 * Extends the base test to apply the project's theme deterministically before
 * any app script runs. The app reads `localStorage['segunda-aura-theme']` first
 * (falling back to prefers-color-scheme), so setting it here forces the theme
 * regardless of any value carried over in storageState. `colorScheme` is also
 * emulated at the project level in the config.
 */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const theme = (testInfo.project.metadata as { theme?: Theme }).theme ?? "light";
    await page.addInitScript((t) => {
      try {
        window.localStorage.setItem("segunda-aura-theme", t);
      } catch {
        // ignore storage access errors
      }
    }, theme);
    await use(page);
  },
});

export { expect };
