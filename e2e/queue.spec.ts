// At capacity (a launch, 26 Oct 2026): the video waits in line behind the making cover and starts by itself when a
// place frees up, instead of an error. The first ask is answered 503 at_capacity here; the next one goes through.
import { test, expect } from "@playwright/test";
import { ask, freshUser, signIn } from "./helpers";

test("at capacity the video waits in line, then is made", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "one open video per user");
  test.setTimeout(180_000);
  await signIn(page, await freshUser(`queue-${info.project.name}`));
  await page.addInitScript(() => localStorage.setItem("wb.explore", "off"));
  let asks = 0;
  await page.route("**/api/generate", route => (++asks === 1
    ? route.fulfill({ status: 503, contentType: "application/json", headers: { "retry-after": "30" }, body: JSON.stringify({ code: "at_capacity" }) })
    : route.continue()));
  await page.goto("/ask");
  await ask(page, `How does a rainbow form? (queue ${Date.now()})`);
  await expect(page.locator(".making li.now")).toHaveText(/Lots of people are asking right now/);
  await expect(page.locator(".turn-live .error")).toHaveCount(0);
  await expect(page.locator("[data-charged]")).toBeVisible({ timeout: 120_000 });
  expect(asks).toBe(2);
});
