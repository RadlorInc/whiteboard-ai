"use server";
// Every admin change runs as the founder's own session (auth.uid() goes into admin_audit) through an audited DEFINER
// function that checks admins + aal2 itself. A reason is required for each.
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { toDrawing } from "@/lib/generation/drawings.mjs";
import P from "@/lib/generation/prompts.json";

type R = { ok?: string; error?: string };
const reasonOf = (f: FormData) => String(f.get("reason") ?? "").trim();

export async function setSwitch(_: R, f: FormData): Promise<R> {
  const { sb } = await requireAdmin();
  const key = String(f.get("key")), on = f.get("value") === "on";
  if (!["generation_enabled", "purchases_enabled"].includes(key)) return { error: "Unknown switch." };
  const { error } = await sb.rpc("admin_set_settings", { p_changes: { [key]: on }, p_reason: reasonOf(f), p_request_id: crypto.randomUUID() });
  revalidatePath("/admin");
  return error ? { error: error.message.includes("reason") ? "Give a reason (5+ characters)." : error.message } : { ok: `${key} = ${on}` };
}

// The number settings: app-wide brakes and the per-user fair-use caps (20 Oct 2026). The database checks each range.
const LIMITS = ["daily_spend_cap_usd", "max_open_generations", "user_daily_cap", "user_monthly_cap",
  "slow_1_after", "slow_1_seconds", "slow_2_after", "slow_2_seconds"] as const;
export async function setLimits(_: R, f: FormData): Promise<R> {
  const { sb } = await requireAdmin();
  const changes = Object.fromEntries(LIMITS.map(k => [k, Number(f.get(k))]));
  if (Object.values(changes).some(v => !Number.isFinite(v) || v < 0)) return { error: "Every limit must be a number, 0 or more." };
  const { error } = await sb.rpc("admin_set_settings", { p_changes: changes, p_reason: reasonOf(f), p_request_id: crypto.randomUUID() });
  revalidatePath("/admin");
  if (!error) return { ok: "Limits saved." };
  return { error: error.message.includes("reason") ? "Give a reason (5+ characters)."
    : error.message.includes("check") ? "A value is out of range (waits are 0–60 s; the second step can't come before the first)." : error.message };
}

export async function adjustCredits(_: R, f: FormData): Promise<R> {
  const { sb } = await requireAdmin();
  const delta = Number(f.get("delta"));
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 1000) return { error: "Credits: a whole number, not 0, at most 1000." };
  const { data: hit } = await sb.rpc("admin_lookup_user", { p_query: String(f.get("who") ?? "").trim() });
  const user = Array.isArray(hit) ? hit[0]?.user_id : null;
  if (!user) return { error: "No account matches that email or id." };
  const { data, error } = await sb.rpc("admin_adjust_credits", { p_user: user, p_delta: delta, p_reason: reasonOf(f), p_request_id: crypto.randomUUID() });
  revalidatePath("/admin");
  return error ? { error: error.message.includes("reason") ? "Give a reason (5+ characters)." : error.message } : { ok: `Done. Top-up balance now ${data}.` };
}

// Takes a video off Explore and kills its share link (admin_unpublish_share deletes the share). Accepts the slug or
// the whole /v/<slug> link.
export async function unpublishShare(_: R, f: FormData): Promise<R> {
  const { sb } = await requireAdmin();
  const slug = String(f.get("slug") ?? "").trim().split("/").pop() ?? "";
  if (!/^[A-Za-z0-9_-]{22}$/.test(slug)) return { error: "Paste the video's /v/ link or its 22-character slug." };
  const { data, error } = await sb.rpc("admin_unpublish_share", { p_slug: slug, p_reason: reasonOf(f), p_request_id: crypto.randomUUID() });
  revalidatePath("/explore");
  return error ? { error: error.message.includes("reason") ? "Give a reason (5+ characters)." : error.message }
    : data ? { ok: "Removed from Explore; the link no longer works." } : { error: "No shared video has that slug." };
}

// A viewer's report on a shared/Explore video: take the video off (admin_unpublish_share kills the link and the
// Explore item) or keep it, then mark the report resolved. Both steps are audited.
export async function handleReport(_: R, f: FormData): Promise<R> {
  const { sb } = await requireAdmin();
  const id = String(f.get("id") ?? ""), slug = String(f.get("slug") ?? ""), remove = f.get("act") === "remove";
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[A-Za-z0-9_-]{22}$/.test(slug)) return { error: "Bad report." };
  const reason = reasonOf(f);
  if (remove) {
    const { error } = await sb.rpc("admin_unpublish_share", { p_slug: slug, p_reason: reason, p_request_id: crypto.randomUUID() });
    if (error) return { error: error.message.includes("reason") ? "Give a reason (5+ characters)." : error.message };
  }
  const { error } = await sb.rpc("admin_resolve_report", { p_kind: "report", p_id: id, p_resolution: remove ? "removed" : "kept", p_reason: reason, p_request_id: crypto.randomUUID() });
  revalidatePath("/admin"); revalidatePath("/explore");
  return error ? { error: error.message.includes("reason") ? "Give a reason (5+ characters)." : error.message } : { ok: remove ? "Taken off and resolved." : "Kept and resolved." };
}

export async function createInvite(_: R, f: FormData): Promise<R> {
  const { sb } = await requireAdmin();
  const code = String(f.get("code") ?? "").trim().toUpperCase(), uses = Number(f.get("uses") ?? 1);
  const { error } = await sb.rpc("admin_create_invite", { p_code: code, p_max_uses: uses, p_note: null, p_reason: reasonOf(f), p_request_id: crypto.randomUUID() });
  return error ? { error: error.message.includes("reason") ? "Give a reason (5+ characters)." : error.message } : { ok: `Invite ${code} (${uses} uses) created.` };
}

// A library drawing the model made (library_drawings): approve it under a slug (its stored lines are normalised here,
// never taken from the form) or reject it. Audited as review_drawing.
export async function reviewDrawing(_: R, f: FormData): Promise<R> {
  const { sb } = await requireAdmin();
  const id = String(f.get("id") ?? ""), approve = f.get("act") === "approve";
  const slug = String(f.get("slug") ?? "").trim().toLowerCase();
  const tags = String(f.get("tags") ?? "").toLowerCase().match(/[a-z]{3,}/g)?.slice(0, 12) ?? [];
  if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Bad drawing." };
  let data = null;
  if (approve) {
    if (!/^[a-z0-9-]{1,60}$/.test(slug)) return { error: "Name: lowercase letters, digits and dashes." };
    if ((P.svIds as string[]).includes(slug)) return { error: `"${slug}" is already a library drawing: pick another name.` };
    const { data: rows, error } = await sb.rpc("admin_list_drawings", { p_status: "pending", p_limit: 100 });
    const row = (rows as { id: string; lines: Record<string, string> }[] | null)?.find(r => r.id === id);
    if (error || !row) return { error: error?.message ?? "That drawing is no longer waiting." };
    try { data = toDrawing(row.lines); } catch (e) { return { error: `Cannot read this drawing: ${(e as Error).message}` }; }
  }
  const { data: ok, error } = await sb.rpc("admin_review_drawing", { p_id: id, p_approve: approve, p_slug: approve ? slug : null,
    p_tags: tags, p_data: data, p_reason: reasonOf(f), p_request_id: crypto.randomUUID() });
  revalidatePath("/admin");
  if (error) return { error: error.message.includes("reason") ? "Give a reason (5+ characters)." : error.message.includes("slug_taken") ? "That name is taken." : error.message };
  return ok ? { ok: approve ? `Approved: lessons can now use "sv id=${slug}".` : "Rejected." } : { error: "That drawing is no longer waiting." };
}
