import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { STATE_FILE } from "./helpers";

/**
 * Captures a real authenticated session ONCE and saves it to e2e/.auth/state.json
 * (includes the HttpOnly accessToken/refreshToken cookies — that is what lets the
 * /api/backend proxy fetch the real favorites/admin data).
 *
 * How it works:
 *   1. Opens the browser (headed) and triggers the Google login.
 *   2. You log in manually in the window that opens.
 *   3. Once the session is detected (profile cookie), it saves the storageState.
 *
 * Re-authenticate (token expires in ~24h): delete e2e/.auth/state.json,
 * or run with FORCE_AUTH=1.
 */

const USER_COOKIE = `${
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || "segunda_aura_session"
}_user`;

setup("authenticate (manual login)", async ({ page, context }) => {
  if (fs.existsSync(STATE_FILE) && !process.env.FORCE_AUTH) {
    setup.skip(
      true,
      "Session already saved. Delete e2e/.auth/state.json (or use FORCE_AUTH=1) to re-authenticate.",
    );
  }

  // manual login: allow time to type email/password/2FA
  setup.setTimeout(180_000);

  // hide the automation signal Google checks most often
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /entrar com google/i }).click();

  console.log(
    "\n>>> Log in with Google in the window that opened. Waiting up to 3 min...\n",
  );

  // login done = profile cookie present (the callback already wrote the cookies)
  await expect(async () => {
    const cookies = await context.cookies();
    expect(cookies.some((c) => c.name === USER_COOKIE)).toBeTruthy();
  }).toPass({ timeout: 170_000, intervals: [1000] });

  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  await context.storageState({ path: STATE_FILE });

  console.log(`\n>>> Session saved to ${STATE_FILE}\n`);
});
