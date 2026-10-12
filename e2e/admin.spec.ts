import { test, expect } from "@playwright/test";
import { admin, signIn, totp } from "./helpers";

// §11.3: /admin needs a row in public.admins AND an authenticator code this sign-in (aal2).
test("the admin enrols an authenticator, then sees today's numbers", async ({ page }, info) => {
  test.skip(info.project.name !== "chromium-desktop", "one enrolment per run");
  const { data: users } = await admin.auth.admin.listUsers();
  const ad = users.users.find(u => u.email === "admin@example.test")!;
  for (const f of (await admin.auth.admin.mfa.listFactors({ userId: ad.id })).data?.factors ?? [])
    await admin.auth.admin.mfa.deleteFactor({ userId: ad.id, id: f.id });              // start clean each run
  await signIn(page, "admin@example.test");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/mfa$/);                                          // aal1 is not enough
  await page.getByRole("button", { name: "Set up an authenticator app" }).click();
  const secret = (await page.locator("code").textContent())!.trim();
  await page.locator('input[inputmode="numeric"]').fill(totp(secret));
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Today (UTC)" })).toBeVisible();
  await expect(page.getByText("balances match the ledger")).toBeVisible();

  // An audited credit grant: the balance moves by exactly 5, and an admin_audit row records who and why.
  const B = "00000000-0000-4000-8000-00000000000b";   // user B: app.spec counts A's credits in parallel
  const before = (await admin.from("credit_balances").select("topup").eq("user_id", B).single()).data!.topup;
  const form = page.locator("form", { hasText: "Give or take credits" });
  await form.getByLabel("Email or user id").fill("b@example.test");
  await form.getByLabel(/Credits/).fill("5");
  await form.getByLabel("Reason").fill("e2e goodwill grant");
  await form.getByRole("button", { name: "Apply" }).click();
  await expect(form.getByText(`top-up balance now ${before + 5}`, { exact: false })).toBeVisible();
  const audit = await admin.from("admin_audit").select("admin_id, action, target_user_id, reason, delta").order("id", { ascending: false }).limit(1).single();
  expect(audit.data).toMatchObject({ admin_id: ad.id, target_user_id: B, reason: "e2e goodwill grant", delta: 5 });
});
