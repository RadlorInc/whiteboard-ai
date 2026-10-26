// A long answer in parts (founder, 26 Oct 2026): Part 1 ends with a "Part 2: …" button; it asks Part 2 as a follow-up
// in the same chat, and then only the newest answer offers a next part. GENERATION_MOCK=1: the mock answers
// "A lesson in two parts (test)" with next = "Part 2: the second part of the test lesson" (no model call).
import { test, expect } from "@playwright/test";
import { ask, freshUser, signIn } from "./helpers";

test("Part 1 offers Part 2; the button asks it as a follow-up in the same chat", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desktop" && info.project.name !== "webkit", "one open video per user");
  test.setTimeout(240_000);
  await signIn(page, await freshUser(`parts-${info.project.name}`));
  await page.addInitScript(() => localStorage.setItem("wb.explore", "off"));
  await page.goto("/ask");
  const question = `A lesson in two parts (test) ${Date.now()}`;
  await ask(page, question);
  const part2 = page.getByRole("button", { name: "Part 2: the second part of the test lesson" });
  // it waits for the video to play to its end (the step counter says "End")
  await expect(page.locator("[data-charged]")).toBeVisible({ timeout: 120_000 });
  if (!(await page.locator(".pc-count").last().textContent())?.includes("End")) await expect(part2).toHaveCount(0);
  await expect(page.locator(".pc-count").last()).toHaveText("End", { timeout: 120_000 });
  await expect(part2).toBeVisible();
  await expect(page.getByText("Uses 1 video")).toBeVisible();
  await part2.scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath("part2-button.png") });
  await part2.click();
  // the follow-up: same chat (the question shows as the next turn), its own finished video, and no button any more
  await expect(page.locator(".chat-q").filter({ hasText: "Part 2: the second part of the test lesson" })).toBeVisible();
  await expect(page.locator("[data-charged]")).toHaveCount(2, { timeout: 120_000 });
  await expect(part2).toHaveCount(0);
  // opened again from the library: one chat with both answers, and still no Part 2 button (Part 2 is the newest, no next)
  // the chat refreshes itself after a video (router.refresh, a navigation in WebKit): go again until it lands
  await expect(async () => { await page.goto("/library"); }).toPass({ timeout: 30_000 });
  await page.getByRole("main").getByRole("link", { name: question }).click();
  await expect(page.getByText("Video 1 of 2 in")).toBeVisible();          // the video page: Part 1 of a two-video chat
  await expect(page.getByRole("link", { name: /After this Part 2: the second part of the test lesson/ })).toBeVisible();
  await page.getByRole("link", { name: "its chat" }).click();
  await expect(page.locator(".chat-q")).toHaveCount(2, { timeout: 30_000 });
  await expect(part2).toHaveCount(0);
});
