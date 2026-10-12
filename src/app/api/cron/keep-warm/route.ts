// GET /api/cron/keep-warm, every 5 minutes, production only with KEEP_WARM=1 (PLAN.md §7.6).
import { cronAuth, keepWarm } from '../../../../lib/generation/keepwarm';
import { supabaseDb } from '../../../../lib/generation/db-supabase';
import { getClient } from '../../../../lib/generation/model';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const denied = cronAuth(req);
  if (denied) return denied;
  if (process.env.KEEP_WARM !== '1') return Response.json({ skipped: 'KEEP_WARM is not 1' });
  const client = getClient();
  if (!client) return Response.json({ skipped: 'no model client' });
  return Response.json({ styles: await keepWarm(supabaseDb, client) });
}
