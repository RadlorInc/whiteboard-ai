/* eslint-disable @typescript-eslint/no-explicit-any */
// Radlic's children's maths endpoint (partner.ts): the secret, the gate and the screen come before any lesson is
// paid for, and nothing about the child is kept — every cost row has no generation and no text.
import { describe, it, expect } from 'vitest';
import { handlePartnerMaths, screenQuestion, type PartnerDeps, type Gate, type Verdict } from '../../src/lib/generation/partner';
import P from '../../src/lib/generation/prompts.json' with { type: 'json' };
import MOCK from '../../src/lib/generation/mock-answers.json' with { type: 'json' };
import type { ModelCall } from '../../src/lib/generation/db';
import { fakeClient, readSse, type Round } from './fakes';

const SECRET = 'test-partner-secret';
const rainbow = (MOCK as any).whiteboard[0];
const req = (body: unknown, auth = `Bearer ${SECRET}`) => new Request('http://localhost:3100/api/partner/maths', {
  method: 'POST', headers: { authorization: auth, 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const ok = { question: 'How do I add 347 and 285?', band: '3-5' };

function deps(o: { rounds?: Round[]; gate?: Gate; verdict?: Verdict; secret?: string | null } = {}) {
  const f = fakeClient(o.rounds ?? [{ text: JSON.stringify(rainbow) }]), calls: ModelCall[] = [], work: Promise<unknown>[] = [];
  let screened = 0;
  const d: PartnerDeps = {
    client: f.client, gate: async () => o.gate ?? 'ok', record: async c => { calls.push(c); },
    screen: async () => { screened++; return o.verdict ?? 'maths'; },
    waitUntil: p => { work.push(p); }, secret: o.secret === null ? undefined : (o.secret ?? SECRET), heartbeatMs: 60_000,
  };
  return { d, f, calls, work, screened: () => screened };
}

describe('POST /api/partner/maths: refusals start nothing', () => {
  it('no secret configured: 500 (fail closed); a wrong or missing bearer: 401', async () => {
    const saved = process.env.RADLIC_PARTNER_SECRET; delete process.env.RADLIC_PARTNER_SECRET;
    try { expect((await handlePartnerMaths(req(ok), deps({ secret: null }).d)).status).toBe(500); }
    finally { if (saved !== undefined) process.env.RADLIC_PARTNER_SECRET = saved; }
    expect((await handlePartnerMaths(req(ok, 'Bearer nope'), deps().d)).status).toBe(401);
    expect((await handlePartnerMaths(req(ok, ''), deps().d)).status).toBe(401);
  });
  it('bad bodies: 400, and the model is never called', async () => {
    const t = deps();
    for (const b of ['{nope', { ...ok, question: '' }, { ...ok, question: 'x'.repeat(301) }, { ...ok, band: '9-12' }, { question: ok.question }])
      expect((await handlePartnerMaths(req(b), t.d)).status).toBe(400);
    expect(t.f.seen.length + t.screened()).toBe(0);
  });
  for (const [gate, status] of [['paused', 503], ['spend_cap', 503], ['rate_limited', 429]] as const)
    it(`gate ${gate} → ${status}, no screen and no lesson`, async () => {
      const t = deps({ gate });
      const res = await handlePartnerMaths(req(ok), t.d);
      expect(res.status).toBe(status); expect(await res.json()).toEqual({ code: gate });
      expect(t.f.seen.length + t.screened()).toBe(0);
    });
  it('a gate that cannot be read is closed', async () => {
    const t = deps(); t.d.gate = async () => { throw new Error('db down'); };
    expect((await handlePartnerMaths(req(ok), t.d)).status).toBe(503);
  });
  for (const verdict of ['not_maths', 'personal', 'unsafe'] as const)
    it(`screen says ${verdict}: 422 with that code, no lesson drawn`, async () => {
      const t = deps({ verdict });
      const res = await handlePartnerMaths(req(ok), t.d);
      expect(res.status).toBe(422); expect(await res.json()).toEqual({ code: verdict });
      expect(t.f.seen.length).toBe(0);
    });
});

describe('POST /api/partner/maths: a lesson, kept nowhere', () => {
  it('streams the whiteboard lesson from the maths prompt, with the grade band, and records cost rows only', async () => {
    const t = deps();
    const res = await handlePartnerMaths(req(ok), t.d);
    expect(res.headers.get('content-type')).toBe('text/event-stream');
    const events = await readSse(res); await Promise.all(t.work);
    const names = events.map(e => e.event);
    expect(names[0]).toBe('accepted'); expect(names).toContain('els'); expect(names.at(-1)).toBe('done');
    expect(names.filter(n => n === 'step').length).toBe(rainbow.steps.length);
    const body = t.f.seen[0] as any;
    expect(body.system[0].text).toBe(P.subjects.maths.system);
    expect(JSON.stringify(body.messages)).toContain('grades 3 to 5');
    expect(JSON.stringify(body.messages)).toContain(ok.question);
    expect(t.calls.length).toBeGreaterThan(0);
    for (const c of t.calls) { expect(c.generation_id).toBeNull(); expect(c.raw_text).toBeNull(); }
  });
  it('a realistic drawing (sv) is refused for maths and repaired: the copy in Radlic has none', async () => {
    const bad = structuredClone(rainbow); bad.els.realistic = `sv id=${(P as any).svIds[0]} 480 270 300`;
    const t = deps({ rounds: [{ text: JSON.stringify(bad) }, { text: JSON.stringify(rainbow) }] });
    const events = await readSse(await handlePartnerMaths(req(ok), t.d)); await Promise.all(t.work);
    expect(t.f.seen.length).toBe(2);                                      // the script, then its repair
    expect(JSON.stringify((t.f.seen[1] as any).messages)).toContain('no realistic drawings');
    expect(events.at(-1)!.event).toBe('done');
    expect(events.some(e => e.event === 'els' && JSON.stringify(e.data).includes('sv id='))).toBe(false);
  });
});

describe('screenQuestion', () => {
  const client = (text: string, stop = 'end_turn') => ({ messages: { stream: () => { throw new Error('unused'); },
    create: async () => ({ stop_reason: stop, content: [{ type: 'text', text }], usage: { input_tokens: 100, output_tokens: 8 } }) } }) as any;
  it('reads the verdict; anything unreadable or a refusal is not drawn', async () => {
    const rec = async () => {};
    expect(await screenQuestion(client('{"verdict":"maths"}'), 'q', rec)).toBe('maths');
    expect(await screenQuestion(client('{"verdict":"personal"}'), 'q', rec)).toBe('personal');
    expect(await screenQuestion(client('maths!'), 'q', rec)).toBe('not_maths');
    expect(await screenQuestion(client('{"verdict":"sure"}'), 'q', rec)).toBe('not_maths');
    expect(await screenQuestion(client('', 'refusal'), 'q', rec)).toBe('unsafe');
  });
  it('its cost row carries no text', async () => {
    const calls: ModelCall[] = [];
    await screenQuestion(client('{"verdict":"maths"}'), 'my question', async c => { calls.push(c); });
    expect(calls).toHaveLength(1); expect(calls[0].raw_text).toBeNull(); expect(calls[0].generation_id).toBeNull();
    expect(calls[0].cost_usd).toBeGreaterThan(0);
  });
});
