"use server";
// Save or unsave an Explore lesson (founder, 18 Oct 2026). save_item runs as the signed-in user (it takes no user id).
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveItem(slug: string, on: boolean): Promise<string> {
  if (!/^[A-Za-z0-9_-]{22}$/.test(slug)) return "not_found";
  const { data, error } = await (await createClient()).rpc("save_item", { p_slug: slug, p_on: on === true });
  revalidatePath("/saved");
  return error ? "failed" : String(data);
}
