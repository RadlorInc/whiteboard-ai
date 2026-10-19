"use server";
// Report a shared or Explore video (13 Oct 2026: Explore is public and questions are not screened yet, so viewers
// can flag one). Anyone may report, signed in or not; submit_report keeps 5 a day per visitor (by IP hash).
import { createAdminClient } from "@/lib/supabase/server";
import { ipHash64 } from "@/lib/ip-hash";

const REASONS = ["wrong", "offensive", "personal_info", "spam", "other"];
export type ReportState = { ok?: boolean; error?: string } | undefined;

export async function reportVideo(_: ReportState, f: FormData): Promise<ReportState> {
  const slug = String(f.get("slug") ?? ""), reason = String(f.get("reason") ?? "");
  const note = String(f.get("note") ?? "").trim().slice(0, 500) || null;
  if (!/^[A-Za-z0-9_-]{22}$/.test(slug) || !REASONS.includes(reason)) return { error: "Pick a reason." };
  const { data, error } = await createAdminClient().rpc("submit_report", { p_slug: slug, p_reason: reason, p_note: note, p_ip_hash: await ipHash64() });
  if (error) return { error: "Couldn't send the report. Try again." };
  if (data === "rate_limited") return { error: "You've sent a lot of reports today. Try again tomorrow." };
  return data === "ok" ? { ok: true } : { error: "Couldn't send the report. Try again." };
}
