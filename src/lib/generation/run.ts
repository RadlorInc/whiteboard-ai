// One generation, from `accepted` to `done` or `failed` (PLAN.md §7.2–7.6, §7.12). Ported from the prototype's
// ask() + answer(), plus streaming, per-step emission, the pinned repair, budgets and cost rows.
// Money rule: every path ends in exactly one db.finish (charge) or db.fail (release) — settle() is the only caller.
import { AuthenticationError, PermissionDeniedError, NotFoundError, APIError, APIUserAbortError } from '@anthropic-ai/sdk';
import { STYLE_CHECK, checkEls, checkStep, checkPaperStep, checkPolicy, checkSafety, findDrawing, guardFindInput, parse, WB_LIB, PAPER_LIB } from './checks.mjs';
import { createScanner } from './scan.mjs';
import { prefix, cost, PROMPT_SHA, type ModelClient, type FinalMessage, type Style, type Block } from './model';
import type { GenDb, FailCode, Metrics } from './db';

export const LIMITS = { deadlineMs: 240_000, maxTokens: 16_000, toolRounds: 5, outputBudget: 40_000 };
export type Send = (event: string, data: unknown) => void;
type Json = Record<string, unknown>;
type Step = { say: string; do: string[]; [k: string]: unknown };
type Lib = { cat: string; lines: { name: string; sig: string; desc: string }[] }[];

const REPAIR = (errs: string[]) => `Your script failed our check:\n- ${errs.join('\n- ')}\nReply with the whole corrected JSON object only.`;
const PINNED = (errs: string[], k: number, style: Style) => `Your script failed our check:\n- ${errs.join('\n- ')}\nSteps 1 to ${k} are already playing for the viewer and cannot change. Reply with the whole corrected JSON object only: ${style === 'whiteboard' ? 'keep every existing "els" entry exactly as it is (you may add new ones), ' : ''}keep steps 1 to ${k} exactly as they are, and fix the rest.`;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);   // both come from JSON.parse
const textOf = (m: FinalMessage) => m.content.filter(b => b.type === 'text').map(b => b.text).join('');
const codePoints = (s: unknown) => (typeof s === 'string' ? [...s].length : 0);
const catsOf = (lib: Lib, names: string[]) => [...new Set(lib.filter(c => c.lines.some(l => names.includes(l.name))).map(c => c.cat))];

class Stop extends Error { constructor(public code: FailCode, detail: string, public extra: Partial<Metrics> = {}) { super(detail); } }

export function providerCode(e: unknown): FailCode {
  if (e instanceof AuthenticationError || e instanceof PermissionDeniedError || e instanceof NotFoundError) return 'provider_config';
  if (e instanceof APIError && e.status === 402) return 'provider_config';    // billing_error: prepaid credits used up
  return 'provider_error';
}

export async function runGeneration(o: {
  id: string; style: Style; question: string; context?: string; client: ModelClient; db: GenDb; send: Send;
  deadlineMs?: number; retryWaitMs?: (n: number) => number;
}) {
  const { id, style, question, client, db, send } = o;
  const t0 = Date.now(), at = () => Date.now() - t0;
  const timings: Record<string, number> = { accept: 0 };
  const misses: string[] = [], lib = (style === 'whiteboard' ? WB_LIB : PAPER_LIB) as Lib;
  // A conversation's context (subject, earlier questions) goes first in the same user turn; the question stays last.
  const messages: Json[] = [{ role: 'user', content: o.context
    ? [{ type: 'text', text: o.context }, { type: 'text', text: `New question: ${question}` }] : question }];
  let sentEls: Json | null = null; const sent: Step[] = [];
  let attempts = 1, outputTokens = 0, settled = false;
  const abort = new AbortController(), timer = setTimeout(() => abort.abort(), o.deadlineMs ?? LIMITS.deadlineMs);
  const stage = (s: 'reading' | 'drawings' | 'writing' | 'fixing', names?: string[]) => {
    send('stage', names ? { stage: s, names } : { stage: s });
    db.setStage(id, s).catch(() => {});                                   // a progress hint; never fails the run
  };
  const metrics = (extra: Partial<Metrics> = {}): Metrics => ({ attempts, repaired: attempts > 1, misses: misses.slice(0, 40), timings, steps_sent: sent.length, voice: 'browser', ...extra });   // no clips key until ElevenLabs: the DB rejects a JSON null

  // A step reaches the player only after it passes: the prototype rule, then policy and safety on the script so far.
  const stepErrs = (step: Step, i: number) => {
    const so = style === 'whiteboard' ? { els: sentEls, steps: [...sent, step] } : { steps: [...sent, step] };
    return [...(style === 'whiteboard' ? checkStep(step, i, sentEls as Json) : checkPaperStep(step, i)),
      ...checkPolicy(so, style), ...checkSafety(so, style)];
  };
  let halted = false;                    // a step failed its check: nothing more is sent this attempt
  let pinned = 0;                        // steps 1..pinned must come back unchanged (pinned repair)
  const onEmit = (ev: { type: string; els?: Json; i?: number; step?: Step }) => {
    if (ev.type === 'els') {
      const els = ev.els as Json;
      if (sentEls && pinned > 0) {       // pinned repair: every sent entry unchanged; new ids go out as els_add
        if (Object.keys(sentEls).some(k => !same(els[k], (sentEls as Json)[k]))) { halted = true; return; }
        const add = Object.fromEntries(Object.entries(els).filter(([k]) => !(k in (sentEls as Json))));
        if (Object.keys(add).length) {
          if (checkEls(add).length || checkSafety({ els: { ...sentEls, ...add }, steps: [] }, style).length) { halted = true; return; }
          sentEls = { ...sentEls, ...add }; send('els_add', { els: add });
        }
        return;
      }
      if (checkEls(els).length || checkSafety({ els, steps: [] }, style).length) { halted = true; return; }
      sentEls = els; timings.els ??= at();
      send('els', { els });
      send('need', { cats: catsOf(lib, Object.values(els).map(s => String(s).split('|')[0].trim().split(/\s+/)[0])) });
      return;
    }
    const i = ev.i as number, step = ev.step as Step;
    if (i < pinned) { if (!same(step, sent[i])) halted = true; return; }
    if (halted || i !== sent.length || (style === 'whiteboard' && !sentEls)) return;
    if (stepErrs(step, i).length) { halted = true; return; }
    sent.push(step); send('step', { i, step });
    if (i === 0) timings.step1Sent ??= at();
    timings.lastStep = at();
  };

  // One model call, streamed: text deltas go through the scanner as they arrive; thinking is never forwarded.
  async function call(kind: 'round' | 'repair', round: number): Promise<FinalMessage> {
    const startedAt = new Date(), c0 = Date.now(), scan = createScanner(style);
    let ttft: number | null = null;
    const stream = client.messages.stream({ ...prefix(style), max_tokens: LIMITS.maxTokens, messages },
      { signal: abort.signal, timeout: Math.max(1000, (o.deadlineMs ?? LIMITS.deadlineMs) - at()) });
    for await (const ev of stream) {
      if (ttft == null) ttft = Date.now() - c0;
      if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
        if (timings.firstText == null) { timings.firstText = at(); stage('writing'); }
        let evs;
        try { evs = scan.push(ev.delta.text); } catch (e) { throw new Stop('output_budget', (e as Error).message); }
        for (const e of evs) onEmit(e);
      }
    }
    const msg = await stream.finalMessage();
    const u = msg.usage ?? {};
    outputTokens += u.output_tokens || 0;
    if (timings.ttft1 == null) timings.ttft1 = ttft ?? 0; else timings.ttft2 ??= ttft ?? 0;
    await db.recordCall({
      generation_id: id, style, kind, round, prompt_sha: PROMPT_SHA[style], started_at: startedAt.toISOString(),
      ttft_ms: ttft, ms: Date.now() - c0, stop_reason: msg.stop_reason, input_tokens: u.input_tokens ?? null,
      cache_read_tokens: u.cache_read_input_tokens ?? null, cache_write_1h_tokens: u.cache_creation_input_tokens ?? null,
      output_tokens: u.output_tokens ?? null, cost_usd: cost(u), anthropic_request_id: stream.request_id ?? null, raw_text: textOf(msg),
    }).catch(() => {});                                                   // a lost cost row never fails the user's video
    if (msg.stop_reason === 'refusal')
      throw new Stop('refusal', 'stop_reason refusal', { refusal_category: msg.stop_details?.category ?? null, response_model: msg.model ?? null });
    if (outputTokens > LIMITS.outputBudget) throw new Stop('output_budget', `${outputTokens} output tokens`);
    return msg;
  }

  // The prototype's ask(): answer find_drawing calls until the model writes its script (≤5 tool rounds per attempt).
  async function ask(kind: 'round' | 'repair'): Promise<FinalMessage> {
    for (let round = 0; round < LIMITS.toolRounds; round++) {
      let msg: FinalMessage;
      try { msg = await call(kind, round); }
      catch (e) {
        if (e instanceof Stop || abort.signal.aborted || providerCode(e) === 'provider_config' || sent.length > 0 || sentEls) throw e;
        msg = await call(kind, round);   // the stream broke before anything was shown: re-run that round once
      }
      messages.push({ role: 'assistant', content: msg.content });           // append-only: thinking blocks kept
      if (msg.stop_reason !== 'tool_use') return msg;
      const uses = msg.content.filter(b => b.type === 'tool_use') as Required<Pick<Block, 'id' | 'name' | 'input'>>[];
      const names: string[] = [];
      messages.push({ role: 'user', content: uses.map(b => {
        if (b.name !== 'find_drawing') return { type: 'tool_result', tool_use_id: b.id, content: `Unknown tool ${b.name}`, is_error: true };
        const input = guardFindInput(b.input), r = findDrawing(lib, input);
        names.push(...(input.names as string[]).filter(n => lib.some(c => c.lines.some(l => l.name === n))));
        misses.push(...r.split('\n').filter(l => /not in the library|^Nothing found/.test(l)).map(l => l.startsWith('Nothing') ? `query: ${input.query}` : l.split(':')[0]));
        return { type: 'tool_result', tool_use_id: b.id, content: r };
      }) });
      timings.toolCall ??= at();
      stage('drawings', names.slice(0, 5));
      send('need', { cats: catsOf(lib, names) });
    }
    throw new Stop('tool_loop', `more than ${LIMITS.toolRounds} find_drawing rounds`);
  }

  async function settle(fn: () => Promise<void>) {
    if (settled) throw new Error('settled twice');     // a structural guard: no path may charge and release
    settled = true; clearTimeout(timer);
    await fn();
  }
  async function fail(code: FailCode, detail: string, extra: Partial<Metrics> = {}) {
    await settle(async () => {
      const m = metrics({ error_detail: detail.slice(0, 4000), ...extra });
      let r: { available: number | null } = { available: null };
      for (let n = 0; ; n++) {
        try { r = await db.fail(id, code, m); break; }
        catch (e) { if (n === 3) throw e; await new Promise(res => setTimeout(res, o.retryWaitMs?.(n) ?? 1000 * 2 ** n)); }
      }
      send('failed', { code, refunded: true, available: r.available });
    });
  }

  try {
    stage('reading');
    for (;;) {
      const msg = await ask(attempts === 1 ? 'round' : 'repair');
      let a: Json | null = null, errs: string[];
      try {
        a = parse(textOf(msg)) as Json;
        errs = [...STYLE_CHECK[style](a), ...checkPolicy(a, style), ...checkSafety(a, style)];
        if (pinned > 0) {
          const steps = (a.steps ?? []) as Step[];
          if (!sent.every((s, i) => same(steps[i], s))) errs.push(`steps 1 to ${pinned} changed after they were shown`);
          if (style === 'whiteboard' && sentEls && Object.keys(sentEls).some(k => !same((a!.els as Json)?.[k], (sentEls as Json)[k]))) errs.push('an "els" entry that was shown changed');
        }
      } catch (e) { errs = [`not valid JSON: ${(e as Error).message}`]; }
      timings.fullCheck = at();
      if (!errs.length && a) { await succeed(a); return; }
      if (attempts === 2) { await fail('check_failed', errs.slice(0, 20).join('; ')); return; }
      attempts = 2; pinned = sent.length; halted = false;
      if (pinned === 0) sentEls = null;           // nothing played yet: the repaired script's els replace the sent ones
      messages.push({ role: 'user', content: pinned > 0 ? PINNED(errs, pinned, style) : REPAIR(errs) });
      stage('fixing');
    }
  } catch (e) {
    if (settled) throw e;
    if (e instanceof Stop) await fail(e.code, e.message, e.extra);
    else if (abort.signal.aborted || e instanceof APIUserAbortError) await fail('timeout', `deadline ${o.deadlineMs ?? LIMITS.deadlineMs} ms`);
    else await fail(providerCode(e), String((e as Error)?.message ?? e));
  }

  async function succeed(a: Json) {
    a.q = question;                                       // the model never chooses a share-page title
    if (style === 'whiteboard') {                         // anything the stream did not already show
      const els = a.els as Json;
      if (!sentEls) send('els', { els });
      else { const add = Object.fromEntries(Object.entries(els).filter(([k]) => !(k in (sentEls as Json)))); if (Object.keys(add).length) send('els_add', { els: add }); }
    }
    if (style === 'matchcut') send('script', { script: a });
    else (a.steps as Step[]).forEach((s, i) => { if (i >= sent.length) { sent.push(s); send('step', { i, step: s }); } });
    await settle(async () => {
      let r;
      for (let n = 0; ; n++) {                            // §6.6 step 7: idempotent through already_final
        try { r = await db.finish(id, a, metrics()); break; }
        catch (e) { if (n === 3) throw e; await new Promise(res => setTimeout(res, o.retryWaitMs?.(n) ?? 1000 * 2 ** n)); }
      }
      timings.done = at();
      const chars = ((style === 'matchcut' ? a.objects : a.steps) as Step[]).reduce((n, s) => n + codePoints(s.say), 0);
      if (r.outcome === 'settled' || r.outcome === 'already_final')
        send('done', { id, creditsCharged: r.credits_charged, narrationChars: chars, available: r.available });
      else send('failed', { code: r.outcome === 'too_late' ? 'timeout' : chars < 1 ? 'empty' : r.outcome === 'rejected' ? 'too_long' : 'stale', refunded: true, available: r.available });
    });
  }
}
