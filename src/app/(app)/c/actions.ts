"use server";
// Start or delete a conversation (founder, 18 Oct 2026). create_conversation runs as the signed-in user (it takes no
// user id); delete_my_video takes one, so it runs on the server key with the session user's id.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type Subject = "biology" | "physics" | "chemistry";
const SUBJECTS: Subject[] = ["biology", "physics", "chemistry"];

export async function startConversation(subject: Subject): Promise<{ id?: string; error?: string }> {
  if (!SUBJECTS.includes(subject)) return { error: "bad_request" };
  const { data, error } = await (await createClient()).rpc("create_conversation", { p_subject: subject });
  if (error || typeof data !== "string") return { error: "failed" };
  return { id: data };
}

// Delete a whole chat: each of its videos goes the way a single delete does (delete_my_video: question and script
// scrubbed, share link and Explore gone, credits not returned). A chat with no question left drops out of the list.
export async function deleteChat(conversationId: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(conversationId)) return;
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/signin");
  const { data: rows } = await sb.from("generations").select("id").eq("conversation_id", conversationId)
    .is("content_deleted_at", null);                                     // RLS: only the signed-in user's own
  const admin = createAdminClient();
  for (const r of rows ?? []) await admin.rpc("delete_my_video", { p_user_id: user.id, p_id: r.id });
  revalidatePath("/", "layout");
  redirect("/ask");
}
