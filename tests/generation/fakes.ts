/* eslint-disable @typescript-eslint/no-explicit-any */
// Test doubles: an in-memory GenDb that counts every charge and release, and a scripted fake model.
// No test here touches a real database or the Anthropic API.
import type { GenDb, Metrics, FailCode, ModelCall, GenerationRow } from '../../src/lib/generation/db';
import type { ModelClient, FinalMessage, StreamEvent, Block } from '../../src/lib/generation/model';

export function fakeDb(opts: { reserve?: Partial<Awaited<ReturnType<GenDb['reserve']>>>; finishThrows?: number; startOk?: boolean; thread?: Awaited<ReturnType<GenDb['thread']>> } = {}) {
  const log = { finish: [] as { id: string; script: unknown; metrics: Metrics }[], fail: [] as { id: string; code: FailCode; metrics: Metrics }[],
    calls: [] as ModelCall[], stages: [] as string[], reserve: 0, start: 0, attach: [] as { id: string; conversationId: string }[], explore: [] as string[] };
  const rows = new Map<string, GenerationRow>();
  let finishThrows = opts.finishThrows ?? 0;
  const db: GenDb = {
    async findByRequest() { return null; },
    async findOwned() { return null; },
    async reserve(a) {
      log.reserve++;
      const id = '00000000-0000-4000-8000-00000000000' + log.reserve;
      rows.set(id, { id, user_id: a.userId, style: a.style, status: 'reserved', stage: null, script: null, error_code: null,
        credits_charged: 0, narration_chars: 0, created_at: new Date().toISOString(), question: a.question });
      return { outcome: 'reserved', generation_id: id, status: 'reserved', available: 94, retry_at: null, ...opts.reserve };
    },
    async start(id) { log.start++; const r = rows.get(id)!; r.status = 'running'; return opts.startOk ?? true; },
    async setStage(_id, s) { log.stages.push(s); },
    async finish(id, script, metrics) {
      if (finishThrows-- > 0) throw new Error('db down');
      log.finish.push({ id, script, metrics });
      const r = rows.get(id) ?? ({} as GenerationRow);
      // The same arithmetic as finish_generation (§6.6 step 3), written out: ceil(ceil(chars/15)/10).
      const chars = ((script as { steps?: { say: string }[]; objects?: { say: string }[] }).steps
        ?? (script as { objects: { say: string }[] }).objects).reduce((n, s) => n + [...s.say].length, 0);
      const c = Math.ceil(Math.ceil(chars / 15) / 10);
      if (c < 1 || c > 6) { r.status = 'failed'; return { outcome: 'rejected', credits_charged: 0, available: 100 }; }
      r.status = 'succeeded'; r.credits_charged = c; r.script = script;
      return { outcome: 'settled', credits_charged: c, available: 100 - c };
    },
    async fail(id, code, metrics) { log.fail.push({ id, code, metrics }); const r = rows.get(id); if (r) { r.status = 'failed'; r.error_code = code; } return { outcome: 'released', available: 100 }; },
    async recordCall(c) { log.calls.push(c); },
    async getOwn(id, userId) { const r = rows.get(id); return r && r.user_id === userId ? r : null; },
    async expireIfStale() { return 'not_stale'; },
    async cacheState() { return []; },
    async thread() { return opts.thread ?? null; },
    async attach(id, conversationId) { log.attach.push({ id, conversationId }); return true; },
    async explore(id) { log.explore.push(id); return 'shown'; },
  };
  return { db, log, rows };
}

export type Round = { stop?: string; text?: string; chunk?: number; tool?: { names: string[]; query?: string };
  throwBefore?: unknown; throwAfterChunks?: { n: number; err: unknown }; category?: string; outputTokens?: number };
// A fake model that plays the given rounds in order and records every request it received.
export function fakeClient(rounds: Round[]) {
  const seen: Record<string, unknown>[] = [], progress = { chunksYielded: 0, chunksTotal: 0 };
  let n = 0;
  const client: ModelClient = {
    messages: {
      stream(body) {
        seen.push(structuredClone(body));
        const r = rounds[Math.min(n++, rounds.length - 1)];
        const text = r.text ?? '', size = r.chunk ?? 13, chunks: string[] = [];
        for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
        progress.chunksTotal += chunks.length;
        const content: Block[] = r.tool ? [{ type: 'tool_use', id: `t${n}`, name: 'find_drawing', input: { names: r.tool.names, query: r.tool.query ?? '' } }]
          : [{ type: 'text', text }];
        const final: FinalMessage = { id: `m${n}`, model: 'claude-opus-5-5', stop_reason: r.stop ?? (r.tool ? 'tool_use' : 'end_turn'),
          stop_details: r.category ? { category: r.category } : null, content, usage: { input_tokens: 10, output_tokens: r.outputTokens ?? 20 } };
        return {
          async *[Symbol.asyncIterator](): AsyncIterator<StreamEvent> {
            if (r.throwBefore) throw r.throwBefore;
            for (let k = 0; k < chunks.length; k++) {
              if (r.throwAfterChunks && k === r.throwAfterChunks.n) throw r.throwAfterChunks.err;
              await new Promise(res => setImmediate(res));
              progress.chunksYielded++;
              yield { type: 'content_block_delta', delta: { type: 'text_delta', text: chunks[k] } };
            }
          },
          finalMessage: async () => final,
          request_id: null,
        };
      },
      async create(body) { seen.push(structuredClone(body)); return { stop_reason: 'max_tokens', content: [], usage: { input_tokens: 1, cache_read_input_tokens: 13367, cache_creation_input_tokens: 0 } }; },
    },
  };
  return { client, seen, progress };
}

// Reads an SSE body to the end: [{event, data}], in order.
export async function readSse(res: Response) {
  const text = await res.text(), out: { event: string; data: any }[] = [];
  for (const block of text.split('\n\n')) {
    const ev = /^event: (.*)$/m.exec(block)?.[1], data = /^data: (.*)$/m.exec(block)?.[1];
    if (ev) out.push({ event: ev, data: JSON.parse(data!) });
  }
  return out;
}
