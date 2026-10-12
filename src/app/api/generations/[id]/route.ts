// GET /api/generations/[id]: the polling fallback (PLAN.md §7.3). The owner only; an open row past its lease is
// failed `stale` first (expire_if_stale), so a dead function never leaves the page polling.
import { supabaseDb } from '../../../../lib/generation/db-supabase';
import { pollGeneration } from '../../../../lib/generation/poll';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: RouteContext<'/api/generations/[id]'>) {
  const { id } = await ctx.params;
  const { data } = await (await createClient()).auth.getUser();
  return pollGeneration(id, data.user?.id ?? null, supabaseDb);
}
