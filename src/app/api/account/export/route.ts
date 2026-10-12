// GET /api/account/export: everything we hold about the signed-in person, as one JSON file (§10.3). RLS limits every
// read to their own rows.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ code: "signed_out" }, { status: 401 });
  const [profile, balance, videos, ledger, shares] = await Promise.all([
    sb.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    sb.from("credit_balances").select("*").eq("user_id", user.id).maybeSingle(),
    sb.from("generations").select("id, created_at, style, question, status, script, narration_chars, credits_charged, error_code").order("created_at"),
    sb.from("credit_ledger").select("*").order("id"),
    sb.from("shares").select("slug, generation_id, created_at"),
  ]);
  const body = JSON.stringify({ exported_at: new Date().toISOString(), email: user.email, profile: profile.data,
    credits: balance.data, videos: videos.data, credit_history: ledger.data, shares: shares.data }, null, 1);
  return new NextResponse(body, { headers: {
    "content-type": "application/json", "content-disposition": 'attachment; filename="my-whiteboard-ai-data.json"',
    "cache-control": "no-store" } });
}
