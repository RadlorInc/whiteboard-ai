// /api/cron/keep-warm without the wiring (PLAN.md §7.6). The prototype kept lastUsed in memory; serverless has none,
// so the window is read from prompt_cache_state (record_model_call keeps it).
import { timingSafeEqual } from 'node:crypto';
import { BadRequestError } from '@anthropic-ai/sdk';
import { prefix, cost, PROMPT_SHA, STYLES, type ModelClient, type Style } from './model';
import type { GenDb, CacheState } from './db';

export const WARM_HORIZON_MS = 24 * 60 * 60e3;     // D3
const MIN = 60e3;

// Ping only inside [45, 58) minutes since the last touch — two chances on a 5-minute schedule, and never at ≥58,
// where a dead cache would bill a $0.107 write — and only for a style a real user asked within the horizon.
export function shouldPing(row: Pick<CacheState, 'last_touch_at' | 'last_real_at'> | undefined, now: number) {
  if (!row?.last_touch_at || !row.last_real_at) return false;
  const idle = now - Date.parse(row.last_touch_at);
  return idle >= 45 * MIN && idle < 58 * MIN && now - Date.parse(row.last_real_at) < WARM_HORIZON_MS;
}

// Bearer CRON_SECRET: 500 when the secret is unset (fail closed), 401 on any mismatch.
export function cronAuth(req: Request, secret = process.env.CRON_SECRET): Response | null {
  if (!secret) return Response.json({ code: 'cron_secret_unset' }, { status: 500 });
  const got = Buffer.from(req.headers.get('authorization') ?? ''), want = Buffer.from(`Bearer ${secret}`);
  if (got.length !== want.length || !timingSafeEqual(got, want)) return Response.json({ code: 'unauthorized' }, { status: 401 });
  return null;
}

export async function keepWarm(db: GenDb, client: ModelClient, now = Date.now()) {
  const rows = await db.cacheState(), done: { style: Style; pinged: boolean; wrote?: number; cost?: number; error?: string }[] = [];
  for (const style of STYLES) {
    const row = rows.find(r => r.style === style && r.prompt_sha === PROMPT_SHA[style]);
    if (!shouldPing(row, now)) { done.push({ style, pinged: false }); continue; }
    const started = new Date();
    try {
      const body = { ...prefix(style), messages: [{ role: 'user', content: 'ping' }] };
      // ASSUMPTION (§7.6): max_tokens 0 is accepted with tools and adaptive thinking; on a 400, 1 (measured live).
      const msg = await client.messages.create({ ...body, max_tokens: 0 }).catch(e => {
        if (e instanceof BadRequestError) return client.messages.create({ ...body, max_tokens: 1 });
        throw e;
      });
      const u = msg.usage ?? {};
      await db.recordCall({ generation_id: null, style, kind: 'ping', round: null, prompt_sha: PROMPT_SHA[style],
        started_at: started.toISOString(), ttft_ms: null, ms: Date.now() - started.getTime(), stop_reason: msg.stop_reason,
        input_tokens: u.input_tokens ?? null, cache_read_tokens: u.cache_read_input_tokens ?? null,
        cache_write_1h_tokens: u.cache_creation_input_tokens ?? null, output_tokens: u.output_tokens ?? null,
        cost_usd: cost(u), anthropic_request_id: null, raw_text: null });
      const wrote = u.cache_creation_input_tokens ?? 0;
      if (wrote) console.warn(JSON.stringify({ event: 'ping_wrote', style, tokens: wrote }));   // §7.11: >0 a day = wrong window
      done.push({ style, pinged: true, wrote, cost: cost(u) });
    } catch (e) { done.push({ style, pinged: true, error: (e as Error).message }); }
  }
  return done;
}
