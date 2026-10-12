// GET /api/generations/[id] without the wiring. Signed voice-clip URLs arrive with voice (§7.7).
import type { GenDb } from './db';
import { isUuid } from './generate';

const json = (status: number, body: unknown) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function pollGeneration(id: string, userId: string | null, db: GenDb): Promise<Response> {
  if (!userId) return json(401, { code: 'unauthenticated' });
  if (!isUuid(id)) return json(404, { code: 'not_found' });
  let g = await db.getOwn(id, userId);
  if (!g) return json(404, { code: 'not_found' });        // another user's id looks exactly like a missing one
  if (g.status === 'reserved' || g.status === 'running') {
    if ((await db.expireIfStale(id)) === 'expired') g = await db.getOwn(id, userId);
    if (!g) return json(404, { code: 'not_found' });
  }
  const done = g.status === 'succeeded' || g.status === 'refunded';
  return json(200, {
    id: g.id, style: g.style, status: g.status, stage: g.stage, created_at: g.created_at,
    ...(done ? { script: g.script, creditsCharged: g.credits_charged, narrationChars: g.narration_chars } : {}),
    ...(g.status === 'failed' ? { code: g.error_code, refunded: true } : {}),
  });
}
