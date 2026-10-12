"use server";
// Delete my account (§10.4). The user id comes from the session only. delete_account_data keeps the accounting
// tombstone the law needs and removes everything else; then the auth user goes.
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function deleteAccount(_: unknown, form: FormData): Promise<{ error?: string }> {
  if (String(form.get("confirm") ?? "").trim() !== "DELETE") return { error: "Type DELETE to confirm." };
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/signin");
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("delete_account_data", { p_user_id: user.id });
  if (error) return { error: "Couldn't delete right now. Try again." };
  if (data === "busy") return { error: "A video is being made. Try again when it finishes." };
  await admin.auth.admin.deleteUser(user.id);
  await sb.auth.signOut();
  redirect("/?deleted=1");
}
