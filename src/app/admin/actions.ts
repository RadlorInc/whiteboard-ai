"use server";
// Every admin change runs as the founder's own session (auth.uid() goes into admin_audit) through an audited DEFINER
// function that checks admins + aal2 itself. A reason is required for each.
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

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

export async function createInvite(_: R, f: FormData): Promise<R> {
  const { sb } = await requireAdmin();
  const code = String(f.get("code") ?? "").trim().toUpperCase(), uses = Number(f.get("uses") ?? 1);
  const { error } = await sb.rpc("admin_create_invite", { p_code: code, p_max_uses: uses, p_note: null, p_reason: reasonOf(f), p_request_id: crypto.randomUUID() });
  return error ? { error: error.message.includes("reason") ? "Give a reason (5+ characters)." : error.message } : { ok: `Invite ${code} (${uses} uses) created.` };
}
