// The age gate (PLAN.md §5.4, C24). The database's complete_signup() decides the stored band; this only decides,
// before any account exists, whether to show the under-13 page. Same rule as the SQL: the youngest possible birth
// date is the last day of the month, against today's date in Pago Pago (the earliest US calendar date).
import { createHmac, timingSafeEqual } from "node:crypto";

export const AGE_GATE_VERSION = "v1";
export const AGE_OK_COOKIE = "age_ok";
export const AGE_BLOCK_COOKIE = "age_block";
export const INVITE_COOKIE = "wb_invite";

export function todayInPagoPago(now = new Date()) {
  // en-CA formats as YYYY-MM-DD.
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Pago_Pago" }).format(now);
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

/** 'ok' | 'under_13' | 'invalid' for a birth month (1–12) and year. */
export function ageCheck(year: number, month: number, now = new Date()): "ok" | "under_13" | "invalid" {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return "invalid";
  const t = todayInPagoPago(now);
  const today = Date.UTC(t.y, t.m - 1, t.d);
  const youngest = Date.UTC(year, month, 0); // day 0 of the next month = last day of this month
  if (youngest > today || youngest < Date.UTC(t.y - 120, t.m - 1, t.d)) return "invalid";
  const lastDay = new Date(youngest).getUTCDate();
  // +13 years; Feb 29 + 13 years has no Feb 29, so clamp like Postgres' interval arithmetic does.
  const plus13 = Date.UTC(year + 13, month - 1, Math.min(lastDay, new Date(Date.UTC(year + 13, month, 0)).getUTCDate()));
  return plus13 > today ? "under_13" : "ok";
}

// ---- Signed cookies: base64url(JSON).hmac ----

function key() {
  const k = process.env.AGE_COOKIE_KEY;
  if (!k || k.length < 32) throw new Error("AGE_COOKIE_KEY is not set");
  return k;
}

const mac = (body: string) => createHmac("sha256", key()).update(body).digest("base64url");

export function sign(payload: Record<string, unknown>, ttlSeconds: number) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttlSeconds * 1000 })).toString("base64url");
  return `${body}.${mac(body)}`;
}

export function verify<T extends Record<string, unknown>>(value: string | undefined): T | null {
  if (!value) return null;
  const [body, sig] = value.split(".");
  if (!body || !sig) return null;
  const want = Buffer.from(mac(body));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp: number };
    return typeof data.exp === "number" && data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

// next: where a sign-up started from (a shared video, 18 Oct 2026); the new account lands there instead of /start.
export type AgeOk = { month: number; year: number; gate_version: string; source: string | null; invite: string | null; next?: string | null };

export const SIGNUP_SOURCES = ["tiktok", "instagram", "youtube", "reddit", "discord", "ref", "share", "direct"];

/** A same-site path only (`/x`, never `//host` or `/\\host`), else null. */
export const okNext = (n: unknown) => (typeof n === "string" && /^\/[^/\\]/.test(n) && n.length <= 200 ? n : null);
/** The sign-up steps pass the source and the return path along: `?src=…&next=…`, or "". */
export function signupQuery(src: unknown, next: unknown) {
  const q = new URLSearchParams();
  if (typeof src === "string" && SIGNUP_SOURCES.includes(src)) q.set("src", src);
  const n = okNext(next);
  if (n) q.set("next", n);
  return q.size ? `?${q}` : "";
}
