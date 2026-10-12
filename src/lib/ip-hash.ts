import "server-only";
// The visitor's IP as an HMAC (never stored raw), for rate limits keyed per visitor. 64 hex characters.
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

export async function ipHash64() {
  const k = process.env.RATE_LIMIT_HMAC_KEY;
  if (!k) throw new Error("RATE_LIMIT_HMAC_KEY is not set");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return createHmac("sha256", k).update(ip).digest("hex");
}
