"use server";
// The contact form (founder, 23 Oct 2026): a message lands in support_messages and on /admin; we reply by email.
// Anyone may write, signed in or not; 5 a day per visitor (by IP hash).
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { ipHash64 } from "@/lib/ip-hash";

const TOPICS = ["billing", "video", "account", "other"];
export type ContactState = { ok?: boolean; error?: string } | undefined;

export async function sendSupport(_: ContactState, f: FormData): Promise<ContactState> {
  const { data: { user } } = await (await createClient()).auth.getUser();
  const email = (user?.email ?? String(f.get("email") ?? "")).trim().slice(0, 320);
  const topic = String(f.get("topic") ?? ""), message = String(f.get("message") ?? "").trim().slice(0, 2000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter the email we should reply to." };
  if (!TOPICS.includes(topic) || !message) return { error: "Pick a topic and write your message." };
  const db = createAdminClient();
  const { data: ok } = await db.rpc("hit_rate_limit", { p_key: `support:${await ipHash64()}`, p_window_seconds: 86400, p_max: 5 });
  if (ok !== true) return { error: "You've sent a lot of messages today. Email us instead." };
  const { error } = await db.rpc("submit_support_message", { p_user_id: user?.id ?? null, p_email: email, p_topic: topic,
    p_message: message, p_generation_id: null });
  return error ? { error: "Couldn't send. Try again, or email us." } : { ok: true };
}
