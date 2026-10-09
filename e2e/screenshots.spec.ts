import { test, expect } from "./fixtures";
import { settle, shotPath, pinFloatersToBottom } from "./helpers";

/**
 * Captures screenshots of the PUBLIC flows (no login) for the README.
 * Run with:  npm run shots
 *
 * Images go to docs/screenshots/<theme>/<device>/.
 */

test("home - catalog", async ({ page }, testInfo) => {
  await page.goto("/");
  await settle(page);

  await page.screenshot({
    path: shotPath(testInfo, "01-home.png"),
    animations: "disabled",
  });

  await pinFloatersToBottom(page);
  await page.screenshot({
    path: shotPath(testInfo, "01-home-full.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("product detail", async ({ page }, testInfo) => {
  await page.goto("/");
  await settle(page);

  const firstCard = page.locator('a[aria-label^="Ver detalhes"]').first();

  // only continue if products are loaded (backend online)
  if ((await firstCard.count()) === 0) {
    test.skip(true, "No products in the catalog (backend offline?)");
  }

  // navigate straight to the card's href (more stable than relying on RSC nav)
  const href = await firstCard.getAttribute("href");
  await page.goto(href!);
  await expect(page).toHaveURL(/\/product\//);
  await settle(page);

  await pinFloatersToBottom(page);
  await page.screenshot({
    path: shotPath(testInfo, "02-product-full.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("favorites - logged out", async ({ page }, testInfo) => {
  await page.goto("/favorites");
  await settle(page);

  await page.screenshot({
    path: shotPath(testInfo, "03-favorites.png"),
    animations: "disabled",
  });
});
