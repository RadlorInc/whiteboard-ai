import { test, expect } from "@playwright/test";
import { admin, credits, signIn } from "./helpers";

// One file, one at a time: these tests sign in the same seed users, and a new code for an address cancels the last.
test.describe.configure({ mode: "serial" });

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
  await page.getByLabel(/Show in Explore/).uncheck();                // this loop shares by hand (Explore: below)
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

// Paper plays while it is being written (13 Oct 2026): its first scene is on screen before the script is finished.
// Seed user A, after the core loop (one open video per user).
test("paper shows its first scene before the video is done", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "one open video per user: run once");
  test.setTimeout(120_000);
  await signIn(page, "a@example.test");
  await page.goto("/ask");
  await page.locator("textarea").fill(`How does a rainbow form? (paper stream e2e ${Date.now()})`);
  await page.getByRole("radio", { name: "Paper" }).check();
  await page.getByLabel(/Show in Explore/).uncheck();
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  const caption = page.frameLocator('iframe[title="Video player"]').locator("#caption");
  // The caption shows a line of THIS answer (one the page's transcript got from the stream), while the video is
  // still being made. (The bare player shows a demo line for a moment while it loads, so "not empty" is not enough.)
  await expect.poll(async () => {
    const cap = (await caption.textContent())?.trim();
    return !!cap && (await page.locator("details li").allTextContents()).includes(cap);
  }, { timeout: 60_000 }).toBe(true);
  expect(await page.getByText(/credits? used/).count()).toBe(0);      // the first scene came before the end
  await expect(page.getByText(/credits? used/)).toBeVisible({ timeout: 90_000 });
});

// Explore (founder, 13 Oct 2026), on the local stack with the fake model: a video asked with "Show in Explore"
// ticked appears on /explore for a signed-out visitor, opens and draws there, and leaves when its maker removes it;
// a question with contact details never gets there. Seed user B (A runs the core loop in app.spec.ts).
test("ask with Show in Explore, see it signed out, remove it", async ({ page, browser }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "one open video per user: run once");
  test.setTimeout(150_000);
  await signIn(page, "b@example.test");
  await page.goto("/ask");
  await expect(page.getByLabel(/Show in Explore/)).toBeChecked();          // ticked by default
  const question = `How does a rainbow form? (explore e2e ${Date.now()})`;
  await page.locator("textarea").fill(question);
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByText("Shown in Explore.")).toBeVisible({ timeout: 90_000 });

  const anon = await (await browser.newContext()).newPage();
  await anon.goto("/explore");
  await anon.getByRole("link", { name: question }).click();
  await expect(anon).toHaveURL(/\/v\/[A-Za-z0-9_-]{22}$/);
  await expect(anon.getByRole("heading", { level: 1 })).toHaveText(question);
  expect(await anon.content()).not.toContain("b@example.test");
  await expect(anon.frameLocator('iframe[title="Video player"]').locator("#scene > *").first()).toBeAttached({ timeout: 15_000 });

  // The visitor reports it: the thanks shows, and the report row really exists (5 a day per visitor).
  const slug = anon.url().split("/").pop()!;
  await anon.getByText("Report this video").click();
  await anon.getByLabel("Shows someone's personal information").check();
  await anon.getByRole("button", { name: "Send report" }).click();
  await expect(anon.getByText("Thanks. We'll look at this video.")).toBeVisible();
  const { data: rep } = await admin.from("reports").select("reason").eq("slug", slug);
  expect(rep).toEqual([{ reason: "personal_info" }]);

  await page.getByRole("link", { name: "Open this video" }).click();
  await page.getByRole("button", { name: "Remove from Explore" }).click();
  await expect(page.getByText("Off Explore. The share link still works.")).toBeVisible();
  await anon.goto("/explore");
  await expect(anon.getByRole("link", { name: question })).toHaveCount(0);

  // A question with contact details is made, but Explore refuses it and says why.
  await page.goto("/ask");
  await page.locator("textarea").fill(`DM @robux_king: how do volcanoes erupt? (${Date.now()})`);
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByText("This question has contact details in it, so it can't go on Explore.")).toBeVisible({ timeout: 90_000 });
});

test("Explore is open without signing in", async ({ page }) => {
  expect((await page.goto("/explore"))!.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
