/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// The generation run and its money paths (PLAN.md §7.3, §7.5, §6.6), driven by a fake model and an in-memory DB.
// Rule under test: every path ends in exactly one charge (finish) or one release (fail), never both, never neither.
import { describe, it, expect } from 'vitest';
import { APIError, APIConnectionError } from '@anthropic-ai/sdk';
import { runGeneration, providerCode } from '../../src/lib/generation/run';
import { handleGenerate } from '../../src/lib/generation/generate';
import { mockClient, prefix, promptSha, type ModelClient } from '../../src/lib/generation/model';
import P from '../../src/lib/generation/prompts.json' with { type: 'json' };
import MOCK from '../../src/lib/generation/mock-answers.json' with { type: 'json' };
import { fakeDb, fakeClient, readSse, type Round } from './fakes';

type Any = any;
const rainbow = (MOCK as Any).whiteboard[0];          // 7 steps, 515 spoken characters → ceil(ceil(515/15)/10) = 4 credits
const paperA = (MOCK as Any).paper[0];                // 289 characters → ceil(20/10)... ceil(289/15)=20 → 2 credits
const ID = '00000000-0000-4000-8000-000000000001';

async function run(style: 'whiteboard' | 'paper' | 'matchcut', rounds: Round[] | ModelClient, extra: Partial<Parameters<typeof runGeneration>[0]> = {}) {
  const { db, log } = fakeDb(), f = Array.isArray(rounds) ? fakeClient(rounds) : null;
  const client = f ? f.client : (rounds as ModelClient), events: { event: string; data: Any }[] = [];
  await runGeneration({ id: ID, style, question: 'How does a rainbow form?', client, db, send: (event, data) => events.push({ event, data }),
    retryWaitMs: () => 0, ...extra });
  const closes = log.finish.length + log.fail.length;
  return { log, events, seen: f?.seen ?? [], closes, names: events.map(e => e.event) };
}
const text = (a: unknown) => JSON.stringify(a);
const clone = <T>(x: T): T => structuredClone(x);

describe('money paths: exactly one settle or release', () => {
  it('success: one finish with the hand-computed charge, no release', async () => {
    const r = await run('whiteboard', [{ tool: { names: ['sun', 'unicornx'] } }, { text: text(rainbow) }]);
    expect(r.closes).toBe(1); expect(r.log.finish.length).toBe(1);
    expect(r.events.at(-1)).toEqual({ event: 'done', data: { id: ID, creditsCharged: 4, narrationChars: 515, available: 96 } });
    expect(r.log.finish[0].metrics).toMatchObject({ attempts: 1, repaired: false, misses: ['sun', 'unicornx'], steps_sent: 7 });
    expect(r.log.calls.map(c => c.kind)).toEqual(['round', 'round']);   // one cost row per model call
  });

  it('paper success: 2 credits', async () => {
    const r = await run('paper', [{ text: text(paperA) }]);
    expect(r.closes).toBe(1); expect(r.events.at(-1)!.data.creditsCharged).toBe(2);
  });

  it('refusal: released once, no repair round, the category kept', async () => {
    const r = await run('whiteboard', [{ stop: 'refusal', text: '', category: 'cyber' }]);
    expect(r.closes).toBe(1); expect(r.log.fail[0].code).toBe('refusal');
    expect(r.log.fail[0].metrics.refusal_category).toBe('cyber');
    expect(r.seen.length).toBe(1);
    expect(r.events.at(-1)).toEqual({ event: 'failed', data: { code: 'refusal', refunded: true, available: 100 } });
  });

  it('invalid JSON with nothing shown: the prototype repair, word for word, then charged once', async () => {
    const r = await run('whiteboard', [{ text: '{"q": "x", "els": {' }, { text: text(rainbow) }]);
    expect(r.closes).toBe(1); expect(r.log.finish.length).toBe(1);
    expect(r.log.finish[0].metrics).toMatchObject({ attempts: 2, repaired: true });
    const repair = (r.seen[1].messages as Any[]).at(-1);
    expect(repair.content).toMatch(/^Your script failed our check:\n- not valid JSON: .*\nReply with the whole corrected JSON object only\.$/);
    expect(r.names).toContain('stage'); expect(r.events.some(e => e.data?.stage === 'fixing')).toBe(true);
    expect(r.log.calls.map(c => c.kind)).toEqual(['round', 'repair']);
  });

  it('fails twice: released once with check_failed', async () => {
    const r = await run('whiteboard', [{ text: 'not json' }, { text: 'still not' }]);
    expect(r.closes).toBe(1); expect(r.log.fail[0].code).toBe('check_failed'); expect(r.seen.length).toBe(2);
  });

  it('a later step fails after steps were shown: pinned repair keeps steps 1..K and is charged once', async () => {
    const bad = clone(rainbow); bad.steps[3].do.push('cam 480 270 2 500');       // step 4 breaks the no-zoom policy
    const r = await run('whiteboard', [{ text: text(bad) }, { text: text(rainbow) }]);
    expect(r.closes).toBe(1); expect(r.log.finish.length).toBe(1);
    const repair = (r.seen[1].messages as Any[]).at(-1).content as string;
    expect(repair).toContain('Steps 1 to 3 are already playing for the viewer and cannot change.');
    expect(repair).toContain('keep every existing "els" entry exactly as it is');
    // steps 1–3 went out once, during the first attempt; 4–7 only after the repair passed
    expect(r.events.filter(e => e.event === 'step').map(e => e.data.i)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(r.events.filter(e => e.event === 'els').length).toBe(1);
  });

  it('a pinned repair that changes a shown step: released once, the partial video is not kept', async () => {
    const bad = clone(rainbow); bad.steps[3].do.push('cam 480 270 2 500');
    const changed = clone(rainbow); changed.steps[0].say = 'Step 1: Something else.';
    const r = await run('whiteboard', [{ text: text(bad) }, { text: text(changed) }]);
    expect(r.closes).toBe(1); expect(r.log.finish.length).toBe(0); expect(r.log.fail[0].code).toBe('check_failed');
    expect(r.log.fail[0].metrics.steps_sent).toBe(3);
  });

  it('paper pinned repair has no els clause', async () => {
    const bad = clone(paperA); bad.steps[2].bg = 'blue';
    const r = await run('paper', [{ text: text(bad) }, { text: text(paperA) }]);
    expect(r.closes).toBe(1); expect(r.log.finish.length).toBe(1);
    const repair = (r.seen[1].messages as Any[]).at(-1).content as string;
    expect(repair).toContain('Steps 1 to 2 are already playing'); expect(repair).not.toContain('"els"');
  });

  it('five find_drawing rounds without a script: tool_loop, released once', async () => {
    const r = await run('whiteboard', [{ tool: { names: ['sun'] } }]);
    expect(r.seen.length).toBe(5); expect(r.closes).toBe(1); expect(r.log.fail[0].code).toBe('tool_loop');
  });

  it('over 40,000 output tokens: output_budget, released once', async () => {
    const r = await run('whiteboard', [{ tool: { names: ['sun'] }, outputTokens: 30_000 }, { text: text(rainbow), outputTokens: 10_001 }]);
    expect(r.closes).toBe(1); expect(r.log.fail[0].code).toBe('output_budget');
  });

  it('the 240 s deadline (shortened here): timeout, released once', async () => {
    const r = await run('whiteboard', mockClient({ cps: 2000 }), { deadlineMs: 30 });
    expect(r.closes).toBe(1); expect(r.log.fail[0].code).toBe('timeout');
  });

  it('a stream that breaks before anything was shown is re-run once; then charged once', async () => {
    const r = await run('whiteboard', [{ text: text(rainbow), throwAfterChunks: { n: 2, err: new APIConnectionError({ message: 'reset' }) } }, { text: text(rainbow) }]);
    expect(r.seen.length).toBe(2); expect(r.closes).toBe(1); expect(r.log.finish.length).toBe(1);
  });

  it('a stream that breaks after steps were shown: provider_error, released once', async () => {
    const r = await run('whiteboard', [{ text: text(rainbow), chunk: 50, throwAfterChunks: { n: 50, err: new APIConnectionError({ message: 'reset' }) } }]);
    expect(r.events.some(e => e.event === 'step')).toBe(true);
    expect(r.closes).toBe(1); expect(r.log.fail[0].code).toBe('provider_error');
  });

  it('finish_generation fails twice then works: charged once, never released', async () => {
    const { db, log } = fakeDb({ finishThrows: 2 }), f = fakeClient([{ text: text(rainbow) }]), events: string[] = [];
    await runGeneration({ id: ID, style: 'whiteboard', question: 'q', client: f.client, db, send: e => events.push(e), retryWaitMs: () => 0 });
    expect(log.finish.length).toBe(1); expect(log.fail.length).toBe(0); expect(events.at(-1)).toBe('done');
  });
});

describe('provider errors map by SDK class, never by message text', () => {
  const gen = (status: number) => APIError.generate(status, { type: 'error', error: { type: 'x', message: 'm' } }, 'm', new Headers());
  for (const [status, code] of [[401, 'provider_config'], [402, 'provider_config'], [403, 'provider_config'], [404, 'provider_config'],
    [429, 'provider_error'], [500, 'provider_error'], [529, 'provider_error']] as const)
    it(`${status} → ${code}`, () => expect(providerCode(gen(status))).toBe(code));
  it('a 401 before the stream starts releases once with provider_config', async () => {
    const r = await run('whiteboard', [{ throwBefore: gen(401) }]);
    expect(r.closes).toBe(1); expect(r.log.fail[0].code).toBe('provider_config'); expect(r.seen.length).toBe(1);
  });
});

describe('check.mjs §2f: the find_drawing tool loop', () => {
  it('the catalogue line goes back as a tool_result; misses are recorded', async () => {
    const good = { q: 'Magnets', els: { m: 'magnet 480 270 300' }, steps: [{ say: 'Step 1: A magnet.', do: ['draw m 600'] }] };
    const r = await run('whiteboard', [{ tool: { names: ['magnet', 'unicornx'] } }, { text: text(good) }]);
    const result = (r.seen[1].messages as Any[]).at(-1).content[0];
    expect(result.type).toBe('tool_result'); expect(result.tool_use_id).toBe('t1'); expect(result.content).toMatch(/^magnet /);
    expect(r.log.finish[0].metrics.misses).toEqual(['unicornx']);
    expect(r.events.find(e => e.event === 'stage' && e.data.stage === 'drawings')!.data.names).toEqual(['magnet']);
    expect(r.events.find(e => e.event === 'need')!.data.cats).toEqual(['physics']);
  });
  it('every call sends the cached prefix byte for byte: model, system (1 h cache), tools, effort; max_tokens 16000', async () => {
    const r = await run('whiteboard', [{ tool: { names: ['sun'] } }, { text: text(rainbow) }]);
    const strip = ({ messages, max_tokens, ...rest }: Any) => rest;
    for (const req of r.seen) { expect(strip(req)).toEqual(prefix('whiteboard')); expect(req.max_tokens).toBe(16000); }
    expect((r.seen[0] as Any).system[0].cache_control).toEqual({ type: 'ephemeral', ttl: '1h' });
    expect((r.seen[0] as Any).tools[0].name).toBe('find_drawing');
  });
});

describe('streaming: steps reach the client before the model stream ends (GENERATION_MOCK)', () => {
  for (const style of ['whiteboard', 'paper'] as const) it(style, async () => {
    // Wrap the real mock so we know, at each moment, whether the model's text stream has finished.
    const inner = mockClient({ cps: 100_000 }); let ended = false;
    const client: ModelClient = { messages: { create: inner.messages.create, stream(body, opts) {
      const s = inner.messages.stream(body, opts);
      return { request_id: null, finalMessage: () => s.finalMessage(), async *[Symbol.asyncIterator]() { ended = false; yield* s; ended = true; } };
    } } };
    const { db, log } = fakeDb();
    const res = await handleGenerate(new Request('http://localhost:3100/api/generate', { method: 'POST',
      headers: { origin: 'http://localhost:3100', 'content-type': 'application/json' },
      body: JSON.stringify({ question: style === 'paper' ? 'How do plants make food?' : 'How does a rainbow form?', style, client_request_id: crypto.randomUUID() }) }),
      { db, client, userId: 'u1', appUrl: 'http://localhost:3100', buildId: 't', waitUntil: () => {} });
    expect(res.headers.get('content-type')).toBe('text/event-stream');
    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
    let buf = '', firstStepWhileStreaming: boolean | null = null; const names: string[] = [];
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      buf += value;
      for (let k; (k = buf.indexOf('\n\n')) >= 0; buf = buf.slice(k + 2)) {
        const ev = /^event: (.*)$/m.exec(buf.slice(0, k))?.[1]; if (!ev) continue;
        names.push(ev);
        if (ev === 'step' && firstStepWhileStreaming == null) firstStepWhileStreaming = !ended;
      }
    }
    expect(firstStepWhileStreaming).toBe(true);
    expect(names[0]).toBe('accepted'); expect(names.at(-1)).toBe('done');
    expect(names.filter(n => n === 'step').length).toBe(style === 'paper' ? paperA.steps.length : rainbow.steps.length);
    if (style === 'whiteboard') expect(names.indexOf('els')).toBeLessThan(names.indexOf('step'));
    expect(log.finish.length + log.fail.length).toBe(1);
  });
});

describe('POST /api/generate refusals reserve nothing', () => {
  const req = (body: Any, origin = 'http://localhost:3100') => new Request('http://localhost:3100/api/generate', { method: 'POST',
    headers: { origin, 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
  const ok = { question: 'How does a rainbow form?', style: 'whiteboard', client_request_id: '11111111-1111-4111-8111-111111111111' };
  const deps = (db: Any) => ({ db, client: fakeClient([{ text: text(rainbow) }]).client, userId: 'u1', appUrl: 'http://localhost:3100', buildId: 't', waitUntil: () => {} });
  it('another origin: 403; no session: 401; bad body: 400', async () => {
    const { db, log } = fakeDb();
    expect((await handleGenerate(req(ok, 'https://evil.example'), deps(db))).status).toBe(403);
    expect((await handleGenerate(req(ok), { ...deps(db), userId: null })).status).toBe(401);
    expect((await handleGenerate(req('{nope'), deps(db))).status).toBe(400);
    expect((await handleGenerate(req({ ...ok, question: '  \u0007 ' }), deps(db))).status).toBe(400);
    expect((await handleGenerate(req({ ...ok, question: 'x'.repeat(501) }), deps(db))).status).toBe(400);
    expect((await handleGenerate(req({ ...ok, style: 'video' }), deps(db))).status).toBe(400);
    expect(log.reserve).toBe(0);
  });
  for (const [outcome, status] of [['insufficient', 402], ['at_capacity', 503], ['busy', 409], ['rate_limited', 429], ['paused', 503], ['blocked', 403]] as const)
    it(`${outcome} → ${status}, nothing started or settled`, async () => {
      const { db, log } = fakeDb({ reserve: { outcome, generation_id: null, available: 4, retry_at: new Date(Date.now() + 60e3).toISOString() } });
      const res = await handleGenerate(req(ok), deps(db));
      expect(res.status).toBe(status);
      if (outcome === 'at_capacity') expect(res.headers.get('retry-after')).toBe('30');
      if (outcome === 'insufficient') expect(await res.json()).toEqual({ code: 'insufficient_credits', available: 4, needed: 6 });
      expect(log.start + log.finish.length + log.fail.length).toBe(0);
    });
  it('start_generation refused (lease gone): released once, 503', async () => {
    const { db, log } = fakeDb({ startOk: false });
    expect((await handleGenerate(req(ok), deps(db))).status).toBe(503);
    expect(log.fail.length + log.finish.length).toBe(1); expect(log.fail[0].code).toBe('stale');
  });
  it('the full SSE body of a good whiteboard answer', async () => {
    const { db } = fakeDb();
    const ev = await readSse(await handleGenerate(req(ok), deps(db)));
    expect(ev[0]).toEqual({ event: 'accepted', data: { id: ID, style: 'whiteboard', creditsHeld: 6, capChars: 900 } });
    expect(ev.map(e => e.event).filter(e => e !== 'stage' && e !== 'need')).toEqual(['accepted', 'els', ...rainbow.steps.map(() => 'step'), 'done']);
  });
});

// Conversations (founder, 18 Oct 2026): a follow-up is told the subject and the earlier questions and narration.
describe('POST /api/generate in a conversation', () => {
  const CONV = '22222222-2222-4222-8222-222222222222';
  const req = (body: Any) => new Request('http://localhost:3100/api/generate', { method: 'POST',
    headers: { origin: 'http://localhost:3100', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const ask = { question: 'Why is red on the outside?', style: 'whiteboard', client_request_id: crypto.randomUUID(), conversation_id: CONV };
  it('a bad id is 400 and a conversation that is not yours is 404; nothing reserved', async () => {
    const { db, log } = fakeDb();
    const client = fakeClient([{ text: text(rainbow) }]).client, d = { db, client, userId: 'u1', appUrl: 'http://localhost:3100', buildId: 't', waitUntil: () => {} };
    expect((await handleGenerate(req({ ...ask, conversation_id: 'nope' }), d)).status).toBe(400);
    expect((await handleGenerate(req(ask), d)).status).toBe(404);
    expect(log.reserve).toBe(0);
  });
  it('the model gets the subject and the earlier turn before the question, and the video is filed', async () => {
    const { db, log } = fakeDb({ thread: { subject: 'physics', turns: [{ question: 'How does a rainbow form?', says: ['Sunlight enters a drop.', 'It bends and splits.'] }] } });
    const f = fakeClient([{ tool: { names: ['sun'] } }, { text: text(rainbow) }]);
    await readSse(await handleGenerate(req(ask), { db, client: f.client, userId: 'u1', appUrl: 'http://localhost:3100', buildId: 't', waitUntil: () => {} }));
    const first = (f.seen[0] as Any).messages[0].content as { text: string }[];
    expect(first[0].text).toContain('Subject: Physics.');
    expect(first[0].text).toContain('1. Question: How does a rainbow form?\n   You explained: Sunlight enters a drop. It bends and splits.');
    expect(first.at(-1)!.text).toBe('New question: Why is red on the outside?');
    expect(log.attach).toEqual([{ id: expect.any(String), conversationId: CONV }]);
    expect(log.finish.length).toBe(1);
  });

  // Subjects (founder, 18 Oct 2026): the chat's subject picks the whiteboard prompt and the drawing library.
  it('a biology chat: the biology prompt on every call, its prompt_sha reserved and costed, the biology library (GENERATION_MOCK)', async () => {
    const { db, log } = fakeDb({ thread: { subject: 'biology', turns: [] } });
    const shas: string[] = [], reserve = db.reserve.bind(db);
    db.reserve = async a => { shas.push(a.promptSha); return reserve(a); };
    const inner = mockClient({ cps: 0 }), seen: Any[] = [];
    const client: ModelClient = { messages: { create: inner.messages.create, stream(body, opts) { seen.push(structuredClone(body)); return inner.messages.stream(body, opts); } } };
    const ev = await readSse(await handleGenerate(req({ ...ask, question: 'How does blood travel around the body?' }),
      { db, client, userId: 'u1', appUrl: 'http://localhost:3100', buildId: 't', waitUntil: () => {} }));
    const bio = P.subjects.biology;
    expect(shas).toEqual([bio.sha256]);
    expect(seen.length).toBe(2);                                   // find_drawing round, then the script
    for (const body of seen) { const { messages, max_tokens, ...rest } = body; expect(rest).toEqual(prefix('whiteboard', 'biology')); }
    expect(seen[0].system[0].text).toBe(bio.system);
    expect(bio.system).toContain('heartsection'); expect(bio.system).toContain('Teaching biology');
    expect(bio.system).not.toMatch(/\bmagnet\b/);                 // physics drawings are not on a biology board
    expect(log.calls.map(c => c.prompt_sha)).toEqual([bio.sha256, bio.sha256]);
    const tool = seen[1].messages[2].content[0].content as string;  // the tool_result: the biology catalogue lines
    expect(tool).toMatch(/^heartsection cx cy size lab=1 — heart cut open/m); expect(tool).toMatch(/^circulation /m);
    expect(ev.find(e => e.event === 'els')!.data.els.heart).toBe('heartsection 270 300 280');
    expect(ev.find(e => e.event === 'need' && e.data.cats.includes('biology'))).toBeTruthy();
    expect(ev.at(-1)!.event).toBe('done');
  });
  it("find_drawing only searches the subject's categories; outside a chat the plain prompt and its library", async () => {
    const good = { q: 'Magnets', els: { m: 'magnet 480 270 300' }, steps: [{ say: 'Step 1: A magnet.', do: ['draw m 600'] }] };
    const r = await run('whiteboard', [{ tool: { names: ['magnet', 'heartsection'] } }, { text: text(good) }], { subject: 'biology' });
    const out = (r.seen[1].messages as Any[]).at(-1).content[0].content as string;
    expect(out).toMatch(/^magnet: not in the library/m); expect(out).toMatch(/^heartsection /m);
    const plain = await run('whiteboard', [{ tool: { names: ['magnet', 'heartsection'] } }, { text: text(good) }]);
    const out2 = (plain.seen[1].messages as Any[]).at(-1).content[0].content as string;
    expect(out2).toMatch(/^magnet /m); expect(out2).toMatch(/^heartsection: not in the library/m);
    expect((plain.seen[0] as Any).system[0].text).toBe(P.styles.whiteboard.system);
    expect(plain.log.calls[0].prompt_sha).toBe(promptSha('whiteboard'));
  });
});
