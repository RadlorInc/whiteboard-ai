/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// Keep-warm (PLAN.md §7.6), cron auth, the GENERATION_MOCK production guard, and the polling route.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { shouldPing, keepWarm, cronAuth } from '../../src/lib/generation/keepwarm';
import { PROMPT_SHA, prefix, promptSha } from '../../src/lib/generation/model';
import { runGeneration } from '../../src/lib/generation/run';
import { pollGeneration } from '../../src/lib/generation/poll';
import MOCK from '../../src/lib/generation/mock-answers.json' with { type: 'json' };
import { fakeDb, fakeClient } from './fakes';

vi.mock('../../src/lib/generation/db-supabase', () => ({ supabaseDb: { cacheState: async () => [] } }));
const NOW = Date.parse('2026-10-12T12:00:00Z');
const ago = (min: number) => new Date(NOW - min * 60e3).toISOString();

describe('keep-warm window: 45 ≤ idle < 58 minutes, and a real ask within 24 h', () => {
  const cases: [string, number | null, number | null, boolean][] = [
    ['44:59 idle', 44 + 59 / 60, 60, false],
    ['45:00 idle', 45, 60, true],
    ['57:59 idle', 57 + 59 / 60, 60, true],
    ['58:00 idle (a dead cache would bill a write)', 58, 60, false],
    ['real ask 23 h 59 ago', 50, 23 * 60 + 59, true],
    ['real ask 24 h ago', 50, 24 * 60, false],
    ['never touched', null, null, false],
    ['touched by pings only, never a real ask', 50, null, false],
  ];
  for (const [name, touch, real, want] of cases) it(`${name} → ${want ? 'ping' : 'no ping'}`, () => {
    expect(shouldPing({ last_touch_at: touch == null ? null : ago(touch), last_real_at: real == null ? null : ago(real) }, NOW)).toBe(want);
  });

  it('KEEP_WARM_ALWAYS: no real ask needed, and a cold prompt (new sha after a deploy, or a dead cache) is written', () => {
    const at = (touch: number | null) => ({ last_touch_at: touch == null ? null : ago(touch), last_real_at: null });
    expect(shouldPing(undefined, NOW, true)).toBe(true);          // a new prompt_sha: no row yet
    expect(shouldPing(at(null), NOW, true)).toBe(true);
    expect(shouldPing(at(44), NOW, true)).toBe(false);
    expect(shouldPing(at(50), NOW, true)).toBe(true);
    expect(shouldPing(at(90), NOW, true)).toBe(true);             // died: write it again
  });

  it('pings only whiteboard prompts in the window, for the deployed prompt sha, and records each ping (check.mjs §2g)', async () => {
    const { db, log } = fakeDb();
    db.cacheState = async () => [
      { style: 'whiteboard', prompt_sha: PROMPT_SHA.whiteboard, last_touch_at: ago(50), last_real_at: ago(50) },
      { style: 'paper', prompt_sha: PROMPT_SHA.paper, last_touch_at: ago(10), last_real_at: ago(10) },
      { style: 'matchcut', prompt_sha: 'an-older-sha', last_touch_at: ago(50), last_real_at: ago(50) },
      { style: 'whiteboard', prompt_sha: promptSha('whiteboard', 'biology'), last_touch_at: ago(50), last_real_at: ago(50) },
    ];
    const ping = fakeClient([]);
    const out = await keepWarm(db, ping.client, NOW);
    expect(out.map(o => [o.style, o.subject, o.pinged])).toEqual([['whiteboard', null, true],
      ['whiteboard', 'biology', true], ['whiteboard', 'physics', false], ['whiteboard', 'chemistry', false],
      ['whiteboard', 'cs', false], ['whiteboard', 'finance', false], ['whiteboard', 'car', false], ['whiteboard', 'home', false]]);
    expect(ping.seen.length).toBe(2);
    expect(log.calls.map(c => [c.kind, c.style, c.generation_id, c.prompt_sha])).toEqual([['ping', 'whiteboard', null, PROMPT_SHA.whiteboard],
      ['ping', 'whiteboard', null, promptSha('whiteboard', 'biology')]]);
    const { messages: _m, max_tokens: _t, ...bio } = ping.seen[1] as any;   // a subject's ping warms the subject's own prompt
    expect(bio).toEqual(prefix('whiteboard', 'biology'));

    // The ping must send exactly what a real round sent before its messages, or it writes a new cache instead.
    const round = fakeClient([{ text: JSON.stringify((MOCK as any).whiteboard[0]) }]);
    await runGeneration({ id: 'g', style: 'whiteboard', question: 'q', client: round.client, db: fakeDb().db, send: () => {} });
    const strip = ({ messages, max_tokens, ...rest }: any) => rest;
    expect(strip(ping.seen[0])).toEqual(strip(round.seen[0]));
    expect(ping.seen[0].max_tokens).toBe(0);
    expect(ping.seen[0].messages).toEqual([{ role: 'user', content: 'ping' }]);
  });
});

describe('cron auth', () => {
  const req = (auth?: string) => new Request('http://localhost/api/cron/keep-warm', { headers: auth ? { authorization: auth } : {} });
  afterEach(() => vi.unstubAllEnvs());
  it('500 when CRON_SECRET is unset (fails closed), 401 without or with a wrong secret, through the route', async () => {
    const { GET } = await import('../../src/app/api/cron/keep-warm/route');
    vi.stubEnv('CRON_SECRET', '');
    expect((await GET(req('Bearer '))).status).toBe(500);
    vi.stubEnv('CRON_SECRET', 's3cret-for-tests');
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req('Bearer wrong'))).status).toBe(401);
    expect((await GET(req('s3cret-for-tests'))).status).toBe(401);
  });
  it('the right secret gets through (the positive twin): 200, skipped without KEEP_WARM=1', async () => {
    const { GET } = await import('../../src/app/api/cron/keep-warm/route');
    vi.stubEnv('CRON_SECRET', 's3cret-for-tests'); vi.stubEnv('KEEP_WARM', '');
    const res = await GET(req('Bearer s3cret-for-tests'));
    expect(res.status).toBe(200); expect(await res.json()).toEqual({ skipped: 'KEEP_WARM is not 1' });
    expect(cronAuth(req('Bearer s3cret-for-tests'), 's3cret-for-tests')).toBeNull();
  });
});

describe('GENERATION_MOCK guard', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
  it('refuses to load the model module in production', async () => {
    vi.stubEnv('GENERATION_MOCK', '1'); vi.stubEnv('NODE_ENV', 'production'); vi.resetModules();
    await expect(import('../../src/lib/generation/model')).rejects.toThrow(/GENERATION_MOCK=1 is set in production/);
  });
  it('refuses on a Vercel production deployment too', async () => {
    vi.stubEnv('GENERATION_MOCK', '1'); vi.stubEnv('NODE_ENV', 'development'); vi.stubEnv('VERCEL_ENV', 'production'); vi.resetModules();
    await expect(import('../../src/lib/generation/model')).rejects.toThrow(/refusing/);
  });
  it('loads, and serves the fake model, outside production', async () => {
    vi.stubEnv('GENERATION_MOCK', '1'); vi.stubEnv('NODE_ENV', 'development'); vi.stubEnv('VERCEL_ENV', 'preview'); vi.stubEnv('GENERATION_MOCK_CPS', '0'); vi.resetModules();
    const m = await import('../../src/lib/generation/model');
    const s = m.getClient()!.messages.stream({ ...m.prefix('matchcut'), messages: [{ role: 'user', content: 'How did writing tools change?' }] });
    let text = ''; for await (const ev of s) text += ev.delta?.text ?? '';
    expect(JSON.parse(text).q).toBe('How did writing tools change?');
  });
});

describe('GET /api/generations/[id]', () => {
  it('owner only; an open row past its lease is expired first; a succeeded row returns its script', async () => {
    const { db, rows } = fakeDb();
    const r = await db.reserve({ userId: 'u1', clientRequestId: 'c', style: 'whiteboard', question: 'q', buildId: 'b', promptSha: 's', policyVersion: 1 });
    const id = r.generation_id!;
    expect((await pollGeneration(id, null, db)).status).toBe(401);
    expect((await pollGeneration(id, 'u2', db)).status).toBe(404);
    expect((await pollGeneration('not-a-uuid', 'u1', db)).status).toBe(404);
    let expired = 0;
    db.expireIfStale = async () => { expired++; const g = rows.get(id)!; g.status = 'failed'; g.error_code = 'stale'; return 'expired'; };
    const body = await (await pollGeneration(id, 'u1', db)).json();
    expect(expired).toBe(1); expect(body).toMatchObject({ id, status: 'failed', code: 'stale', refunded: true });
    expect(body.script).toBeUndefined();
    Object.assign(rows.get(id)!, { status: 'succeeded', script: { q: 'q' }, credits_charged: 3, narration_chars: 400 });
    expect(await (await pollGeneration(id, 'u1', db)).json()).toMatchObject({ status: 'succeeded', script: { q: 'q' }, creditsCharged: 3 });
    expect(expired).toBe(1);                              // a final row is never expired again
  });
});
