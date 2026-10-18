"use server";
// Start a conversation (founder, 18 Oct 2026). create_conversation runs as the signed-in user (it takes no user id).
import { createClient } from "@/lib/supabase/server";

export type Subject = "biology" | "physics" | "chemistry";
const SUBJECTS: Subject[] = ["biology", "physics", "chemistry"];

export async function startConversation(subject: Subject): Promise<{ id?: string; error?: string }> {
  if (!SUBJECTS.includes(subject)) return { error: "bad_request" };
  const { data, error } = await (await createClient()).rpc("create_conversation", { p_subject: subject });
  if (error || typeof data !== "string") return { error: "failed" };
  return { id: data };
}
