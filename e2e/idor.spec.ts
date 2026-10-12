import { test, expect } from "@playwright/test";
import { admin, signIn } from "./helpers";

// Signed in as B, nothing of A's is reachable: the video page, the poll route, or the export (PLAN.md §9).
test("user B cannot open, poll or export user A's video", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "one sign-in per run");
  const A = "00000000-0000-4000-8000-00000000000a";
  const { data } = await admin.from("generations").select("id, question").eq("user_id", A).not("question", "is", null).limit(1).single();
  await signIn(page, "b@example.test");
  expect((await page.goto(`/videos/${data!.id}`))!.status()).toBe(404);
  const poll = await page.request.get(`/api/generations/${data!.id}`);
  expect(poll.status()).toBe(404);
  const own = await page.request.get("/api/account/export");                     // positive twin: B's own export works
  expect(own.status()).toBe(200);
  expect(await own.text()).not.toContain(data!.question);
});
