import path from "node:path";
import type { Page, TestInfo } from "@playwright/test";

/** Saved real session file (gitignored — contains tokens). */
export const STATE_FILE = path.join("e2e", ".auth", "state.json");

interface ShotMeta {
  device?: string;
  theme?: string;
}

/** Output path for a screenshot, split by theme and device. */
export function shotPath(testInfo: TestInfo, file: string): string {
  const meta = testInfo.project.metadata as ShotMeta;
  const theme = meta.theme ?? "light";
  const device = meta.device ?? "desktop";
  return path.join("docs", "screenshots", theme, device, file);
}

/** Wait for the page to "settle" (fonts + network idle) before capturing. */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  // Hide the Next.js dev overlay (the "N" / "N Issues" badge) — dev only.
  await page
    .addStyleTag({ content: "nextjs-portal { display: none !important; }" })
    .catch(() => {});
  await page.waitForTimeout(400);
}

/**
 * Anchors the floating buttons (AI assistant + WhatsApp) to the bottom of the
 * DOCUMENT. In `fullPage` screenshots, `position: fixed` elements detach and
 * float over the middle of the content. Switching to `position: absolute` at the
 * end of the document makes them appear in the bottom-right corner — as in the
 * app. In viewport screenshots the floaters already sit at the bottom, so this
 * is not needed there.
 */
export async function pinFloatersToBottom(page: Page): Promise<void> {
  await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Abrir assistente"]');
    let el = btn as HTMLElement | null;
    while (el && getComputedStyle(el).position !== "fixed") {
      el = el.parentElement;
    }
    if (!el) return;
    // Reparent to the body (an offset parent spanning the full document height)
    // so `bottom` anchors to the end of the document, not an inner container.
    document.body.style.position = "relative";
    document.body.appendChild(el);
    el.style.position = "absolute";
    el.style.top = "auto";
    el.style.left = "auto";
    el.style.bottom = "1.5rem";
    el.style.right = "1.5rem";
  });
}
