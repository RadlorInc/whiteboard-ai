// POST /api/generate, minus the wiring (PLAN.md §7.2, §7.3, §5.7, §7.12): checks, reserve, start, then SSE.
// route.ts passes the real database, model, user and after(); tests pass fakes.
import { runGeneration } from './run';
import { POLICY_VERSION } from './checks.mjs';
import { taughtLevel } from '../videos';

export const HOLD_CREDITS = 1;          // 1 video from a plan (a free or admin video holds 0: reserve_generation)
import { promptSha, STYLES, ANATOMY, type ModelClient, type Style } from './model';
import type { GenDb, Level, ReserveOutcome, Thread } from './db';

const HEARTBEAT_MS = 10_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: unknown): s is string => typeof s === 'string' && UUID.test(s);

// §7.12: NFC, control characters removed (newline kept), runs of spaces collapsed, trimmed; 1–500 code points.
function cleanQuestion(q: unknown): string | null {
  if (typeof q !== 'string') return null;
  const s = q.normalize('NFC').replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, '').replace(/[^\S\n]+/g, ' ')
    .replace(/ *\n */g, '\n').trim();
  const n = [...s].length;
  return n >= 1 && n <= 500 ? s : null;
}
// = generations.question_norm: lower(regexp_replace(btrim(question), '\s+', ' ', 'g'))
export const questionNorm = (q: string) => q.trim().replace(/\s+/g, ' ').toLowerCase();

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const retryAfter = (at: string | null) => String(Math.max(1, Math.ceil(((at ? Date.parse(at) : Date.now() + 60e3) - Date.now()) / 1000)));

// Refusals from reserve_generation, as §5.7 shows them. Nothing was reserved in any of these.
function refused(outcome: ReserveOutcome, r: { generation_id: string | null; available: number | null; retry_at: string | null }) {
  switch (outcome) {
    case 'no_account': case 'deleted': return json(401, { code: 'unauthenticated' });
    case 'age_unconfirmed': return json(403, { code: 'age_required' });
    case 'terms_required': return json(403, { code: 'terms_required' });
    case 'access_required': return json(403, { code: 'access_required' });
    case 'blocked': return json(403, { code: 'blocked' });
    case 'busy': return json(409, { code: 'busy', id: r.generation_id });
    case 'rate_limited': return json(429, { code: 'rate_limited', retry_at: r.retry_at }, { 'Retry-After': retryAfter(r.retry_at) });
    case 'slow_down': return json(429, { code: 'slow_down', retry_at: r.retry_at }, { 'Retry-After': retryAfter(r.retry_at) });
    case 'at_capacity': return json(503, { code: 'at_capacity' }, { 'Retry-After': '30' });
    case 'paused': return json(503, { code: 'paused' });
    case 'spend_cap': return json(503, { code: 'spend_cap' });
    case 'insufficient': return json(402, { code: 'insufficient_credits', available: r.available, needed: HOLD_CREDITS, retry_at: r.retry_at });
    default: return json(500, { code: 'server_error' });
  }
}
const existing = (g: { id: string; status: string }) =>
  g.status === 'succeeded' ? json(200, { id: g.id, status: 'succeeded' }) : json(409, { id: g.id, status: g.status === 'failed' ? 'failed' : 'running' });

// What a follow-up's model call is told before the question: the subject and the conversation so far (questions and
// their spoken lines; no drawings). It goes in the user turn, so the cached system prompt stays byte-identical.
const SUBJECT = { biology: 'Biology', physics: 'Physics', chemistry: 'Chemistry', home: 'Home fixes', car: 'Car fixes' } as const;
// One text block per earlier turn, each byte-identical on every later follow-up, so the conversation so far is a
// cached prefix (run.ts marks the last block): a follow-up pays full price only for its newest turn (18 Oct 2026).
// The level (founder, 20 Oct 2026) changes what is taught, never how long: every video keeps the prompt's length rule.
// Each says what a course at that level teaches about the topic, so the model picks the right idea, not more of them.
const LEVEL_TEXT: Record<Level, string> = {
  school: '\nLevel: high school. Teach what a high-school course teaches about this: the picture and the idea, in everyday words, at most one simple formula.',
  undergrad: '\nLevel: college (an undergraduate major). Teach what an undergraduate course teaches about this: the real model with its proper terms and its key equation, symbols defined on the board. Same length as any lesson: choose that core idea, do not add more.',
  grad: '\nLevel: graduate school. The asker knows the undergraduate picture: teach what a graduate course teaches about this: the more complete model, or where the simple picture breaks down, with its key result on the board. Same length as any lesson: choose the one idea a graduate course stresses, do not cover more.',
};
function threadContext(t: Thread): string[] {
  const head = `Subject: ${SUBJECT[t.subject]}.${LEVEL_TEXT[t.level ?? 'school']}`;
  if (t.turns.length === 0) return [head];
  return [`${head}\nThis question is a follow-up in a conversation. Earlier questions and the lessons you gave:`,
    ...t.turns.map((x, i) => `${i + 1}. Question: ${x.question}\n   You explained: ${x.says.join(' ')}`)];
}

type GenerateDeps = {
  db: GenDb; client: ModelClient | null; userId: string | null; appUrl: string | undefined;
  buildId: string; waitUntil: (p: Promise<unknown>) => void; heartbeatMs?: number;
};

export async function handleGenerate(req: Request, d: GenerateDeps): Promise<Response> {
  // Same-origin only: a cross-site page must not spend someone's credits (§9.5). Fails closed without APP_URL.
  let appOrigin = '';
  try { appOrigin = new URL(d.appUrl ?? '').origin; } catch {}
  if (!appOrigin || req.headers.get('origin') !== appOrigin) return json(403, { code: 'bad_origin' });
  if (!d.userId) return json(401, { code: 'unauthenticated' });
  let body: Record<string, unknown>;
  try { body = await req.json(); if (!body || typeof body !== 'object') throw 0; } catch { return json(400, { code: 'bad_request' }); }
  const question = cleanQuestion(body.question);
  if (!question) return json(400, { code: 'bad_question' });
  const style = body.style as Style;
  if (!STYLES.includes(style) || !isUuid(body.client_request_id)) return json(400, { code: 'bad_request' });
  const requestId = body.client_request_id;
  // A question inside a conversation (founder, 18 Oct 2026): the conversation must be the asker's own.
  const conversationId = body.conversation_id ?? null;
  if (conversationId !== null && !isUuid(conversationId)) return json(400, { code: 'bad_request' });
  // Every new video goes on Explore (founder, 15 Oct 2026); explore: false keeps it off (tests that share by hand).
  // Not while the Anatomy switch is on (model.ts ANATOMY): preview shares production's database, and the live player
  // cannot draw a "<name>Iso" element until the Anatomy release reaches production, so such a video stays off Explore.
  const explore = body.explore !== false && !ANATOMY;

  // A retry of an accepted ask gets its id back before any other check (§6.6 step 1).
  const prior = await d.db.findByRequest(d.userId, requestId);
  if (prior) return existing(prior);
  let thread: Thread | null = null;
  if (conversationId) {
    thread = await d.db.thread(d.userId, conversationId);
    if (!thread) return json(404, { code: 'conversation_not_found' });
  }
  // In a conversation every question gets its own video (a follow-up builds on the ones before), so no reuse offer.
  if (body.confirm_new !== true && !conversationId) {
    const owned = await d.db.findOwned(d.userId, style, questionNorm(question));
    if (owned) return json(409, { code: 'already_owned', id: owned.id, created_at: owned.created_at });
  }
  if (!d.client) return json(503, { code: 'paused' });         // no model configured: nothing is reserved

  const r = await d.db.reserve({ userId: d.userId, clientRequestId: requestId, style, question, buildId: d.buildId,
    promptSha: promptSha(style, thread?.subject), policyVersion: POLICY_VERSION });
  if (r.outcome === 'duplicate') return existing({ id: r.generation_id!, status: r.status ?? 'running' });
  if (r.outcome !== 'reserved' || !r.generation_id) return refused(r.outcome, r);
  const id = r.generation_id;
  if (conversationId) await d.db.attach(id, conversationId, d.userId).catch(() => false);   // unfiled still plays
  // A plan's videos are taught at the plan's level (founder, 20 Oct 2026): a grad chat on a high-school plan gets a
  // high-school lesson. Free and admin videos keep the chat's level (the free ones are for trying every level).
  let capped = false;
  if (thread && style === 'whiteboard' && d.db.billing) {
    const b = await d.db.billing(id, d.userId).catch(() => null);
    const level = b?.paidWith === 'credit' ? taughtLevel(thread.level, b.planLevel) : thread.level;
    if (level !== thread.level) { thread = { ...thread, level }; capped = true; }
  }
  if (!(await d.db.start(id))) {
    const f = await d.db.fail(id, 'stale', { steps_sent: 0 });
    return json(503, { code: 'stale', refunded: true, available: f.available });
  }

  // SSE (§7.3). The work outlives the connection: a closed stream sets clientGone and the video still saves.
  const enc = new TextEncoder();
  let ctrl: ReadableStreamDefaultController<Uint8Array> | null = null, clientGone = false;
  const write = (s: string) => { if (clientGone || !ctrl) return; try { ctrl.enqueue(enc.encode(s)); } catch { clientGone = true; } };
  const send = (event: string, data: unknown) => write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  const stream = new ReadableStream<Uint8Array>({
    start(c) { ctrl = c; },
    cancel() { clientGone = true; },
  });
  send('accepted', { id, style, creditsHeld: HOLD_CREDITS, capChars: style === 'matchcut' ? 700 : 900,
    ...(capped && { level: thread!.level, levelCapped: true }) });
  const hb = setInterval(() => write(': hb\n\n'), d.heartbeatMs ?? HEARTBEAT_MS);
  const client = d.client;
  const userId = d.userId;
  const work = runGeneration({ id, style, question, context: thread ? threadContext(thread) : undefined, subject: thread?.subject, client, db: d.db, send,
    explore: explore ? () => d.db.explore(id, userId) : undefined })
    .catch(() => send('failed', { code: 'provider_error', refunded: false }))   // finish/fail itself failed: the sweep releases
    .finally(() => { clearInterval(hb); if (!clientGone) try { ctrl?.close(); } catch {} });
  d.waitUntil(work);
  return new Response(stream, { headers: {
    'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no',
  } });
}
