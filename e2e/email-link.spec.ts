// A sign-in link from an email (production's Magic Link email had one, 13 Oct 2026) lands on the Site URL with
// ?code=. It must sign a returning user in, not leave them on the landing page, whose big button walked a returning
// user on a new phone into sign-up (invite code, then birth date). The link is the real one GoTrue would send: a PKCE
// token made by the sign-in form in this browser, read from the LOCAL database, opened through /auth/v1/verify.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { admin } from "./helpers";

const env = Object.fromEntries(readFileSync(`${process.cwd()}/.env.local`, "utf8").split("\n")
  .filter(l => l.includes("=")).map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const AUTH = env.NEXT_PUBLIC_SUPABASE_URL;
if (!/^http:\/\/127\.0\.0\.1:/.test(AUTH)) throw new Error("e2e refuses: not the local stack");

const latestToken = (email: string) => execFileSync("docker", ["exec", "-i", "supabase_db_whiteboard-ai", "psql", "-U",
  "postgres", "-d", "postgres", "-qAt", "-c", `select t.token_hash from auth.one_time_tokens t join auth.users u
  on u.id = t.user_id where u.email = '${email}' order by t.created_at desc limit 1`]).toString().trim();

// A returning user of its own per run: one sign-in token per user, so two runs sharing a seed user (Chromium and WebKit
// in parallel) cancelled each other's links (e=browser, or no token at all). Age done, as a returning user's is.
async function returningUser(tag: string) {
  const email = `link-${tag}-${crypto.randomUUID().slice(0, 8)}@example.test`;
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (error) throw error;
  const { data: terms } = await admin.rpc("current_terms_version");
  const { data: done, error: e2 } = await admin.rpc("complete_signup", { p_user_id: data.user.id, p_birth_year: 1990,
    p_birth_month: 1, p_gate_version: "v1", p_terms_version: terms, p_source: null });
  if (e2 || done !== "ok") throw new Error(`complete_signup: ${e2?.message ?? done}`);
  return { email, id: data.user.id };
}

test("a returning user who opens the email's sign-in link lands in their account", async ({ page, baseURL }, info) => {
  const { email, id } = await returningUser(info.project.name);
  await page.goto("/signin");
  // On a cold dev server WebKit filled the field before React hydrated, which emptied it ("Enter your email address.",
  // CI 13 Oct): fill and send again until the code box shows.
  await expect(async () => {
    await page.fill('input[type="email"]', email);
    await page.getByRole("button", { name: "Continue with email" }).click();
    await expect(page.locator('input[inputmode="numeric"]')).toBeVisible({ timeout: 3_000 });
  }).toPass({ timeout: 30_000 });
  const token = latestToken(email);
  expect(token).toMatch(/^pkce_/);   // the PKCE link GoTrue puts in the email

  await page.goto(`${AUTH}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(baseURL!)}`);
  await expect(page).toHaveURL(/\/(ask|start)$/, { timeout: 15_000 });   // not the landing page with ?code=
  await expect(page.getByText("Private beta, invite only")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /\d+ videos? left/, includeHidden: true })).toBeAttached();   // the signed-in sidebar (a closed drawer on phones)
  await admin.auth.admin.deleteUser(id);
});
