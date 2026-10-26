// Inside Instagram (or Facebook, LinkedIn, Snapchat) a thin bar suggests the real browser (founder, 26 Oct 2026); in a
// normal browser there is none. Android gets an "Open in Chrome" button; an iPhone gets the steps.
import { test, expect } from "@playwright/test";

const ANDROID_IG = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36 Instagram 350.0.0.0.0 Android";
const IPHONE_IG = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0.0";

test("Instagram on Android: open in Chrome, or dismiss for this visit", async ({ browser }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "user agents are set here, one browser is enough");
  const page = await (await browser.newContext({ userAgent: ANDROID_IG })).newPage();
  await page.goto("/");
  const tip = page.getByRole("note");
  await expect(tip).toContainText("open this page in Chrome");
  await expect(tip.getByRole("button", { name: "Open in Chrome" })).toBeVisible();
  await tip.getByRole("button", { name: "Close this tip" }).click();
  await expect(tip).toHaveCount(0);
  await page.goto("/explore");                                  // stays closed for the rest of the visit
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("Instagram on an iPhone: how to open Safari, no Chrome button", async ({ browser }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "user agents are set here, one browser is enough");
  const page = await (await browser.newContext({ userAgent: IPHONE_IG })).newPage();
  await page.goto("/");
  await expect(page.getByRole("note")).toContainText("Open in browser");
  await expect(page.getByRole("button", { name: "Open in Chrome" })).toHaveCount(0);
});

test("a normal browser shows no tip", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading").first()).toBeVisible();
  await expect(page.locator(".in-app-tip")).toHaveCount(0);
});
