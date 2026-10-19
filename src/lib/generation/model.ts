import "server-only";
// The model: the real Anthropic client, or GENERATION_MOCK=1's fake that streams hand-made answers (PLAN.md §7.1).
import Anthropic, { APIUserAbortError } from '@anthropic-ai/sdk';
import P from './prompts.json' with { type: 'json' };
import MOCK_ANSWERS from './mock-answers.json' with { type: 'json' };
import { FIND_TOOL } from './checks.mjs';

export type Style = 'whiteboard' | 'paper' | 'matchcut';
export const STYLES: Style[] = ['whiteboard', 'paper', 'matchcut'];
export const MODEL = P.model;
export const PROMPT_SHA: Record<Style, string> = {
  whiteboard: P.styles.whiteboard.sha256, paper: P.styles.paper.sha256, matchcut: P.styles.matchcut.sha256,
};
export type Subject = keyof typeof P.subjects;
export const SUBJECTS = Object.keys(P.subjects) as Subject[];
// A chat's subject picks its own whiteboard prompt; other styles, and asks outside a chat, use the style's prompt.
const system = (style: Style, subject?: Subject | null) => (style === 'whiteboard' && subject ? P.subjects[subject] : P.styles[style]);
export const promptSha = (style: Style, subject?: Subject | null) => system(style, subject).sha256;
// Every cached prompt keep-warm looks after: one per style, plus one per subject (each its own prompt_sha).
export const PROMPTS: { style: Style; subject: Subject | null }[] = [...STYLES.map(style => ({ style, subject: null })),
  ...SUBJECTS.map(subject => ({ style: 'whiteboard' as Style, subject }))];
// Opus 5.5 list prices, $ per 1M tokens (from the prototype; Anthropic pricing, 6-11 Oct 2026)
const PRICE = { in: 4, out: 20, cacheRead: 0.2, cacheWrite1h: 8 };

export const MOCK = process.env.GENERATION_MOCK === '1';
// Refuse at import: a fake model in production would hand out free, unchecked-by-a-model videos.
if (MOCK && (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'))
  throw new Error('GENERATION_MOCK=1 is set in production: refusing to start the fake model.');

const SYSTEM = (style: Style, subject?: Subject | null) => [{ type: 'text' as const, text: system(style, subject).system, cache_control: { type: 'ephemeral' as const, ttl: '1h' as const } }];
// Everything the cache keys on (model, tools, system, settings). A round, a repair and a ping all send exactly this.
export const prefix = (style: Style, subject?: Subject | null) => ({
  model: MODEL, system: SYSTEM(style, subject), ...(style !== 'matchcut' ? { tools: [FIND_TOOL] } : {}),
  output_config: { effort: 'medium' },
});

export type Usage = { input_tokens?: number | null; output_tokens?: number | null; cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null };
export const cost = (u: Usage) => ((u.input_tokens || 0) * PRICE.in + (u.output_tokens || 0) * PRICE.out
  + (u.cache_read_input_tokens || 0) * PRICE.cacheRead + (u.cache_creation_input_tokens || 0) * PRICE.cacheWrite1h) / 1e6;

export type Block = { type: string; text?: string; id?: string; name?: string; input?: unknown; [k: string]: unknown };
export type FinalMessage = { id?: string; model?: string; stop_reason: string | null; stop_details?: { category?: string | null } | null; content: Block[]; usage: Usage };
export type StreamEvent = { type: string; delta?: { type: string; text?: string } };
export interface ModelStream extends AsyncIterable<StreamEvent> { finalMessage(): Promise<FinalMessage>; request_id?: string | null }
export interface ModelClient {
  messages: {
    stream(body: Record<string, unknown>, opts?: { signal?: AbortSignal; timeout?: number }): ModelStream;
    create(body: Record<string, unknown>, opts?: { signal?: AbortSignal; timeout?: number }): Promise<FinalMessage>;
  };
}

let real: ModelClient | null = null;
export function getClient(): ModelClient | null {
  if (MOCK) return mockClient();
  if (!process.env.ANTHROPIC_API_KEY) return null;
  real ??= new Anthropic({ maxRetries: 2 }) as unknown as ModelClient;
  return real;
}

// ---------- GENERATION_MOCK=1 ----------
// Round 1 asks find_drawing for the answer's library drawings (as the real model does); round 2 streams the
// policy-1 copy of a hand-made answer in uneven chunks at ~cps characters a second (300 ≈ the measured ~85 tokens/s).
type MockOpts = { cps?: number; answers?: Record<Style, unknown[]> };
export function mockClient({ cps = Number(process.env.GENERATION_MOCK_CPS ?? 300), answers = MOCK_ANSWERS as Record<Style, unknown[]> }: MockOpts = {}): ModelClient {
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const styleOf = (body: Record<string, unknown>): Style =>
    STYLES.find(s => (body.system as { text: string }[])[0].text === P.styles[s].system) ?? 'whiteboard';   // a subject prompt is whiteboard
  const reply = (stop: string, content: Block[], chunks: string[] = [], signal?: AbortSignal): ModelStream => ({
    async *[Symbol.asyncIterator]() {
      for (const text of chunks) {
        if (cps > 0) await sleep(text.length * 1000 / cps);
        if (signal?.aborted) throw new APIUserAbortError();
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text } };
      }
    },
    finalMessage: async () => ({ id: 'mock', model: MODEL, stop_reason: stop, content, usage: { input_tokens: 0, output_tokens: 0 } }),
    request_id: null,
  });
  return {
    messages: {
      stream(body, opts) {
        const style = styleOf(body), msgs = body.messages as { role: string; content: unknown }[];
        const c0 = msgs[0].content as string | { text: string }[];   // a follow-up's question is its last block
        const question = (typeof c0 === 'string' ? c0 : c0.at(-1)!.text.replace(/^New question: /, '')).toLowerCase();
        const list = answers[style] as { q: string; els?: Record<string, string> }[];
        const a = list.find(e => e.q.toLowerCase().includes(question) || question.includes(e.q.toLowerCase())) ?? list[0];
        if (style !== 'matchcut' && msgs.length === 1) {
          const names = [...new Set(Object.values(a.els ?? {}).map(s => String(s).split('|')[0].trim().split(/\s+/)[0]))].slice(0, 8);
          return reply('tool_use', [{ type: 'tool_use', id: 'mock_t1', name: 'find_drawing', input: { names, query: '' } }]);
        }
        const text = JSON.stringify(a), chunks: string[] = [];
        for (let i = 0, n = 0; i < text.length; n++) { const k = 5 + (n * 37) % 41; chunks.push(text.slice(i, i + k)); i += k; }
        return reply('end_turn', [{ type: 'text', text }], chunks, opts?.signal);
      },
      async create() {
        return { id: 'mock', model: MODEL, stop_reason: 'max_tokens', content: [], usage: { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 } };
      },
    },
  };
}
