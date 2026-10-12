import { test, expect } from "@playwright/test";

// A player page opened directly (not in our iframe) with a crafted ?cat= must not run injected script with access to
// our origin (the session cookies are readable by JavaScript). PLAN.md §9.4.
test("a crafted player URL cannot run script on our origin", async ({ page }) => {
  const payload = encodeURIComponent('x"></script><script>document.title="PWNED:"+String(document.cookie !== undefined)</script><script src="x');
  for (const p of [`/player/index.html?cat=${payload}`, `/player/stopmotion-topics.html?mode=paper&gallery=${payload}`,
    `/player/matchcut.html?gallery=${payload}`]) {
    await page.goto(p);
    await page.waitForTimeout(800);
    expect(await page.title(), p).not.toContain("PWNED");
  }
  expect((await page.goto("/player/lib/gallery.html"))!.status()).toBe(404);     // developer pages are not shipped
});
