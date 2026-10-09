import { test } from "./fixtures";
import { settle, shotPath, pinFloatersToBottom, STATE_FILE } from "./helpers";

/**
 * AUTHENTICATED flows for the README. Reuses the real session captured by
 * auth.setup.ts (storageState with the HttpOnly cookies).
 * Run with:  npm run shots:auth
 */

test.use({ storageState: STATE_FILE });

test("favorites - logged in (with items)", async ({ page }, testInfo) => {
  await page.goto("/favorites");
  // give the session time to hydrate and the list to load via the proxy
  await settle(page);
  await page.waitForTimeout(600);

  await pinFloatersToBottom(page);
  await page.screenshot({
    path: shotPath(testInfo, "04-favorites-logged-in.png"),
    fullPage: true,
    animations: "disabled",
  });
});
