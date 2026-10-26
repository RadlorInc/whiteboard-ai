// The study subjects (founder, 26 Oct 2026): Biology, Physics, Chemistry, Computer science and Finance; the everyday
// fixes (Home, Auto) are no longer offered. A new user picks Computer science and gets a chat in it (mock answer).
import { test, expect } from "@playwright/test";
import { ask, freshUser, signIn } from "./helpers";

test("the picker offers the five study subjects, and a Computer science chat starts", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "one open video per user");
  test.setTimeout(180_000);
  await signIn(page, await freshUser(`subjects-${info.project.name}`));
  await page.addInitScript(() => localStorage.setItem("wb.explore", "off"));
  await page.goto("/ask");
  const pick = page.getByLabel("Subject");
  await expect(pick.locator("option")).toHaveText(["Biology", "Physics", "Chemistry", "Computer science", "Finance"]);
  await pick.selectOption("cs");
  await ask(page, `How does the internet send a message? (subjects ${Date.now()})`);
  await expect(page.locator("[data-charged]")).toBeVisible({ timeout: 120_000 });
  await expect(page.locator(".chat-subject")).toHaveText(/Computer science/);
  await page.goto("/explore");
  await expect(page.getByRole("main")).not.toContainText("Home improvements");
  await expect(page.getByRole("main")).not.toContainText("Auto repairs");
});
