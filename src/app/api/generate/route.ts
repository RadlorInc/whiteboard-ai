// POST /api/generate → SSE (PLAN.md §7.1–7.3). The logic is in src/lib/generation/generate.ts.
import { after } from 'next/server';
import { handleGenerate } from '../../../lib/generation/generate';
import { supabaseDb } from '../../../lib/generation/db-supabase';
import { getClient } from '../../../lib/generation/model';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 300;     // §7.12: the run's own deadline is 240 s, leaving 60 s for the writes

export async function POST(req: Request) {
  const { data } = await (await createClient()).auth.getUser();
  return handleGenerate(req, {
    db: supabaseDb, client: getClient(), userId: data.user?.id ?? null, appUrl: process.env.APP_URL,
    buildId: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local', waitUntil: p => after(() => p),
  });
}
