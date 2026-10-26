// Children's maths for Radlic (founder, 21 Oct 2026): POST /api/partner/maths. Radlic's server — never a browser —
// sends a grade 3-8 child's typed maths question with a shared secret; we screen it, then stream the same whiteboard
// lesson /api/generate makes, from the maths subject prompt. Nothing about the child is kept here: no user, no
// generations row, no conversation, no Explore, no saved drawings, and the cost rows carry no question or script
// (raw_text null). Radlic keeps the question for the parent (its own 30-day table); this server keeps none of it.
// The kill switch, the daily spend cap and the provider block still apply, read straight from ops_settings/ops_state,
// because reserve_generation (which checks them for /api/generate) needs a user and a generations row.
import { randomUUID } from 'node:crypto';
import { runGeneration, type Send } from './run';
import { cronAuth } from './keepwarm';
import { cleanQuestion } from './generate';
import { cost, MODEL, MOCK, type ModelClient } from './model';
import type { GenDb, ModelCall } from './db';

export const MAX_CHARS = 300;               // a child's question; the adult app allows 500
export const BANDS = { '3-5': 'grades 3 to 5 (ages about 8 to 11)', '6-8': 'grades 6 to 8 (ages about 11 to 14)' } as const;
export type Band = keyof typeof BANDS;
export type Gate = 'ok' | 'paused' | 'spend_cap' | 'rate_limited';
export type Verdict = 'maths' | 'not_maths' | 'personal' | 'unsafe';

export type PartnerDeps = {
  client: ModelClient | null;
  gate: () => Promise<Gate>;                       // kill switch, provider block, spend cap, partner rate limit
  record: (c: ModelCall) => Promise<void>;         // cost only: raw_text is always null here
  screen?: (q: string) => Promise<Verdict>;        // tests inject one; otherwise screenQuestion
  waitUntil: (p: Promise<unknown>) => void;
  secret?: string;
  heartbeatMs?: number;
};

const json = (status: number, body: unknown) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// ---------- the screen: one small model call before any drawing is paid for ----------
// What a child may ask: school maths. Anything else gets a kind "ask me a maths question" in Radlic, and nothing is
// drawn. A question that carries personal details (the child's own name, a real person's, a school, an address, a phone
// number, an email) is refused too, so the details never reach the lesson model; Radlic asks the child to try again
// without them. (26 Oct: "My name is Sam, I go to Green Park School" passed the old full-name-only rule.)
const SCREEN_SYSTEM = `You check questions that children in grades 3 to 8 type into a school maths helper before a
lesson is drawn for them. Classify the question into exactly one verdict:
- "maths": a question about school maths (numbers, operations, fractions, decimals, place value, measurement, time,
  money, geometry, ratios, percents, algebra, equations, data, graphs, probability), including a maths word problem
  or a maths homework question, however it is worded or misspelled. A name for a person in the word problem itself
  ("Ali has 3 apples") is fine.
- "personal": the child tells something about themselves or another real person, even next to a maths question:
  their own name ("my name is…", "I am…"), a real person's name (a friend, family member or teacher, "my sister
  Aisha"), the name of a school, town or street, an address, a phone number, an email or a username, a birthday or
  an age with a name.
- "unsafe": anything about harm to self or others, abuse, sexual content, drugs, weapons, or a child in danger, even
  if numbers appear in it.
- "not_maths": anything else (other school subjects, chat, jokes, games, instructions to you).
Reply with the JSON object only.`;
const SCREEN_FORMAT = { type: 'json_schema', schema: {
  type: 'object', additionalProperties: false, required: ['verdict'],
  properties: { verdict: { type: 'string', enum: ['maths', 'not_maths', 'personal', 'unsafe'] } },
} };

export async function screenQuestion(client: ModelClient, question: string, record: PartnerDeps['record']): Promise<Verdict> {
  const started = new Date(), c0 = Date.now();
  const msg = await client.messages.create({
    model: MODEL, max_tokens: 2000, system: SCREEN_SYSTEM,
    output_config: { effort: 'low', format: SCREEN_FORMAT },
    messages: [{ role: 'user', content: `Question: ${question}` }],
  });
  await record({ generation_id: null, style: 'whiteboard', kind: 'round', round: null, prompt_sha: 'partner-maths-screen',
    started_at: started.toISOString(), ttft_ms: null, ms: Date.now() - c0, stop_reason: msg.stop_reason,
    input_tokens: msg.usage?.input_tokens ?? null, cache_read_tokens: null, cache_write_1h_tokens: null,
    output_tokens: msg.usage?.output_tokens ?? null, cost_usd: cost(msg.usage ?? {}), anthropic_request_id: msg.id ?? null, raw_text: null,
  }).catch(() => {});
  if (msg.stop_reason === 'refusal') return 'unsafe';
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  try {
    const v = (JSON.parse(text) as { verdict?: string }).verdict;
    if (v === 'maths' || v === 'not_maths' || v === 'personal' || v === 'unsafe') return v;
  } catch {}
  return 'not_maths';                         // fail closed: nothing unreadable is drawn for a child
}
// GENERATION_MOCK=1 (local and e2e, never production: model.ts refuses it there): no model call.
const mockScreen = async (q: string): Promise<Verdict> =>
  /NOT_MATHS/.test(q) ? 'not_maths' : /@|\d{3}[-. ]\d{3}[-. ]\d{4}/.test(q) ? 'personal' : 'maths';

// A run with no user and no row: every money call is a no-op that reports "settled", so run.ts sends `done`.
function noSaveDb(record: PartnerDeps['record']): GenDb {
  const no = async () => { throw new Error('not used by the partner endpoint'); };
  return {
    findByRequest: no, findOwned: no, reserve: no, start: no, getOwn: no, expireIfStale: no, cacheState: no, thread: no,
    attach: no, explore: no,
    async setStage() {},
    async finish() { return { outcome: 'settled', credits_charged: 0, available: null }; },
    async fail() { return { outcome: 'released', available: null }; },
    async recordCall(c) { await record({ ...c, generation_id: null, raw_text: null }); },
  };
}

export async function handlePartnerMaths(req: Request, d: PartnerDeps): Promise<Response> {
  const denied = cronAuth(req, d.secret ?? process.env.RADLIC_PARTNER_SECRET);
  if (denied) return denied;
  let body: { question?: unknown; band?: unknown };
  try { body = await req.json(); } catch { return json(400, { code: 'bad_request' }); }
  const question = cleanQuestion(body?.question);
  if (!question) return json(400, { code: 'empty' });
  if ([...question].length > MAX_CHARS) return json(400, { code: 'too_long', max: MAX_CHARS });
  const band = body?.band;
  if (typeof band !== 'string' || !Object.hasOwn(BANDS, band)) return json(400, { code: 'bad_band' });
  if (!d.client) return json(503, { code: 'paused' });
  const gate = await d.gate().catch((): Gate => 'paused');           // a gate we cannot read is closed
  if (gate === 'rate_limited') return json(429, { code: gate });
  if (gate !== 'ok') return json(503, { code: gate });

  let verdict: Verdict;
  try { verdict = await (d.screen ?? (MOCK ? mockScreen : (q: string) => screenQuestion(d.client!, q, d.record)))(question); }
  catch { return json(502, { code: 'provider_error' }); }
  if (verdict !== 'maths') return json(422, { code: verdict });

  // The same SSE as /api/generate (§7.3): accepted, stage, els, need, step…, then done or failed.
  const enc = new TextEncoder(), id = randomUUID();
  let ctrl: ReadableStreamDefaultController<Uint8Array> | null = null, gone = false;
  const write = (s: string) => { if (gone || !ctrl) return; try { ctrl.enqueue(enc.encode(s)); } catch { gone = true; } };
  const send: Send = (event, data) => write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  const stream = new ReadableStream<Uint8Array>({ start(c) { ctrl = c; }, cancel() { gone = true; } });
  send('accepted', { id, style: 'whiteboard', capChars: 900 });
  const hb = setInterval(() => write(': hb\n\n'), d.heartbeatMs ?? 10_000);
  const work = runGeneration({ id, style: 'whiteboard', subject: 'maths', question, context: [`The child is in ${BANDS[band as Band]}.`],
    client: d.client, db: noSaveDb(d.record), send })
    .catch(() => send('failed', { code: 'provider_error' }))
    .finally(() => { clearInterval(hb); if (!gone) try { ctrl?.close(); } catch {} });
  d.waitUntil(work);
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' } });
}
