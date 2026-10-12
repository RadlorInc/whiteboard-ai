import { test, expect } from "@playwright/test";
import { credits, signIn } from "./helpers";

// The core loop on the local stack with the fake model (no spend): ask -> charged -> library -> share -> signed-out
// viewer -> stop sharing -> 404. Seed user A (supabase/seed.sql). One open video per user, so desktop only.
test("ask, get charged, find it in the library, share it, unshare it", async ({ page, browser }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "one open video per user: run once");
  test.setTimeout(120_000);
  await signIn(page, "a@example.test");
  await page.goto("/ask");
  const before = await credits(page);
  const question = `How does a rainbow form? (e2e ${Date.now()})`;
  await page.locator("textarea").fill(question);
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByText(/credits? used/)).toBeVisible({ timeout: 90_000 });
  const used = Number((await page.getByText(/credits? used/).textContent())!.match(/(\d+) credits? used/)![1]);
  expect(used).toBe(4);                                  // the mock rainbow: 515 spoken characters -> ceil(515/150) = 4
  await page.goto("/library");
  expect(await credits(page)).toBe(before - 4);
  await page.getByRole("link", { name: question }).click();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  const url = (await page.locator("p.muted", { hasText: "/v/" }).textContent())!.trim();
  expect(url).toMatch(/\/v\/[A-Za-z0-9_-]{22}$/);

  const anon = await (await browser.newContext()).newPage();
  expect((await anon.goto(url))!.status()).toBe(200);
  await expect(anon.getByRole("heading", { level: 1 })).toHaveText(question);
  expect(await anon.content()).not.toContain("a@example.test");
  const frame = anon.frameLocator('iframe[title="Video player"]');
  await expect(frame.locator("#scene > *").first()).toBeAttached({ timeout: 15_000 });   // the replay draws

  await page.getByRole("button", { name: "Stop sharing" }).click();
  await expect(page.getByText("The link no longer works.")).toBeVisible();
  expect((await anon.goto(url))!.status()).toBe(404);
});

test("signed-out pages send you to sign in, and /admin does not exist for a normal user", async ({ page }, info) => {
  for (const p of ["/ask", "/library", "/account", "/buy"]) {
    await page.goto(p);
    await expect(page).toHaveURL(/\/signin\?next=/);
  }
  if (info.project.name !== "chromium-desktop") return;   // a new code for b@ cancels the last: sign in from one project only
  await signIn(page, "b@example.test");
  expect((await page.goto("/admin"))!.status()).toBe(404);
});

test("no sideways scrolling on the public pages", async ({ page }) => {
  for (const p of ["/", "/pricing", "/help", "/legal/terms", "/signin"]) {
    await page.goto(p);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), p).toBe(true);
  }
});
