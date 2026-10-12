// GET /api/health/db: the database answers (§11.5). 503 when it does not, so an uptime checker can alert a phone.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const { error } = await createAdminClient().rpc("health_ping");
  return NextResponse.json({ ok: !error }, { status: error ? 503 : 200, headers: { "cache-control": "no-store" } });
}
