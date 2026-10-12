"use server";
// Share, unshare and delete one of your own videos (§5.9, §5.10, C7). create_share / revoke_share run as the
// signed-in user (RLS + the functions check ownership); delete_my_video takes a user id, so it runs on the server key
// with the id of the session user, never one from the browser.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const isId = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

export async function shareVideo(id: string): Promise<{ slug?: string; error?: string }> {
  if (!isId(id)) return { error: "bad_request" };
  const { data, error } = await (await createClient()).rpc("create_share", { p_generation_id: id });
  const r = Array.isArray(data) ? data[0] : data;
  if (error || !r?.slug) return { error: r?.outcome ?? "failed" };
  revalidatePath(`/videos/${id}`);
  return { slug: r.slug };
}

export async function unshareVideo(id: string) {
  if (!isId(id)) return;
  await (await createClient()).rpc("revoke_share", { p_generation_id: id });
  revalidatePath(`/videos/${id}`);
}

export async function deleteVideo(id: string) {
  if (!isId(id)) return;
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) redirect("/signin");
  await createAdminClient().rpc("delete_my_video", { p_user_id: user.id, p_id: id });
  revalidatePath("/library");
  redirect("/library");
}
