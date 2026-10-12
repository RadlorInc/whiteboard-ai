import "server-only";
// Founder-only pages (PLAN.md §11.3). Admin = a row in public.admins (no client can write it) AND a session at aal2
// (an authenticator-app code this sign-in). The DB functions check both again; this only decides what to render.
import { notFound, redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/signin?next=/admin");
  const { data: row } = await createAdminClient().from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!row) notFound();                                   // not an admin: the page does not exist for you
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") redirect("/admin/mfa");
  return { sb, user };
}
