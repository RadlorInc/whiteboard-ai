// GET /api/health: the app answers (§11.5). Booleans only: it tells an attacker nothing.
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
