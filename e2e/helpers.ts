// Sign in through the real form with a code issued by the LOCAL stack's admin API (PLAN.md §12.5). Refuses any
// database that is not 127.0.0.1, so a spec can never touch a hosted project.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";

const env = Object.fromEntries(readFileSync(`${process.cwd()}/.env.local`, "utf8").split("\n")
  .filter(l => l.includes("=")).map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
if (!/^http:\/\/127\.0\.0\.1:/.test(env.NEXT_PUBLIC_SUPABASE_URL)) throw new Error("e2e refuses: not the local stack");
export const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

export async function signIn(page: Page, email: string) {
  await page.goto("/signin");
  await page.fill('input[type="email"]', email);
  await page.getByRole("button", { name: "Continue with email" }).click();
  const box = page.locator('input[inputmode="numeric"]');
  await expect(box).toBeVisible();
  await expect(page.getByText(`We sent a 6-digit code to ${email}.`)).toBeVisible();   // the address shown is the one typed
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error) throw error;
  await box.fill(data.properties.email_otp);
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/(ask|start)/);
}

// The profile ring shows videos left; the credit balance behind it is on the avatar as data-credits.
export const credits = async (page: Page) => Number(await page.locator("[data-credits]").first().getAttribute("data-credits"));

// RFC 6238 TOTP (SHA-1, 30 s, 6 digits) from a base32 secret: what an authenticator app shows.
import { createHmac } from "node:crypto";
export function totp(secret: string, at = Date.now()) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = ""; for (const c of secret.replace(/=+$/, "").toUpperCase()) bits += A.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map(b => parseInt(b, 2)));
  const msg = Buffer.alloc(8); msg.writeBigUInt64BE(BigInt(Math.floor(at / 30000)));
  const h = createHmac("sha1", key).update(msg).digest(), o = h[19] & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}
