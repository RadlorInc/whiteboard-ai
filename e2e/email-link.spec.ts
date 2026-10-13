// A sign-in link from an email (production's Magic Link email had one, 13 Oct 2026) lands on the Site URL with
// ?code=. It must sign a returning user in, not leave them on the landing page, whose big button walked a returning
// user on a new phone into sign-up (invite code, then birth date). The link is the real one GoTrue would send: a PKCE
// token made by the sign-in form in this browser, read from the LOCAL database, opened through /auth/v1/verify.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const env = Object.fromEntries(readFileSync(`${process.cwd()}/.env.local`, "utf8").split("\n")
  .filter(l => l.includes("=")).map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
const AUTH = env.NEXT_PUBLIC_SUPABASE_URL;
if (!/^http:\/\/127\.0\.0\.1:/.test(AUTH)) throw new Error("e2e refuses: not the local stack");

const latestToken = (email: string) => execFileSync("docker", ["exec", "-i", "supabase_db_whiteboard-ai", "psql", "-U",
  "postgres", "-d", "postgres", "-qAt", "-c", `select t.token_hash from auth.one_time_tokens t join auth.users u
  on u.id = t.user_id where u.email = '${email}' order by t.created_at desc limit 1`]).toString().trim();

test("a returning user who opens the email's sign-in link lands in their account", async ({ page, baseURL }) => {
  const email = "a@example.test";   // a seed user with age and access done
  await page.goto("/signin");
  await page.fill('input[type="email"]', email);
  await page.getByRole("button", { name: "Continue with email" }).click();
  await expect(page.locator('input[inputmode="numeric"]')).toBeVisible();
  const token = latestToken(email);
  expect(token).toMatch(/^pkce_/);   // the PKCE link GoTrue puts in the email

  await page.goto(`${AUTH}/auth/v1/verify?token=${token}&type=magiclink&redirect_to=${encodeURIComponent(baseURL!)}`);
  await expect(page).toHaveURL(/\/(ask|start)$/, { timeout: 15_000 });   // not the landing page with ?code=
  await expect(page.getByText("Private beta, invite only")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /\d+ credits/ })).toBeVisible();   // the signed-in header
});
