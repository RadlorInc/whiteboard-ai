/* eslint-disable @typescript-eslint/no-explicit-any */
// The incremental scanner (PLAN.md §7.3): each step comes out at the chunk that closes it, not at the end.
import { describe, it, expect } from 'vitest';
import { createScanner, SCAN_LIMIT } from '../../src/lib/generation/scan.mjs';
import MOCK from '../../src/lib/generation/mock-answers.json' with { type: 'json' };

type Ev = { type: string; i?: number; els?: unknown; step?: unknown };
// Feed `text` in `size`-character chunks; return every emission with the index of the chunk that produced it.
function feed(style: string, text: string, size: number) {
  const s = createScanner(style), out: (Ev & { at: number })[] = [];
  let n = 0;
  for (let i = 0; i < text.length; i += size, n++) for (const e of s.push(text.slice(i, i + size))) out.push({ ...e, at: n });
  return { out, chunks: n };
}

describe('scanner', () => {
  const a = (MOCK as any).whiteboard[0];                 // rainbow: 7 steps
  const text = '```json\n' + JSON.stringify(a) + '\n```';

  it('whiteboard: els first, then each step, each at the chunk where it closes', () => {
    const { out, chunks } = feed('whiteboard', text, 7);
    expect(out.map(e => e.type)).toEqual(['els', 'step', 'step', 'step', 'step', 'step', 'step', 'step']);
    expect(out[0].els).toEqual(a.els);
    out.slice(1).forEach((e, k) => {
      expect(e.i).toBe(k); expect(e.step).toEqual(a.steps[k]);
      // the chunk that holds this step's closing brace, located in the text independently of the scanner
      const end = text.indexOf(JSON.stringify(a.steps[k])) + JSON.stringify(a.steps[k]).length - 1;
      expect(e.at).toBe(Math.floor(end / 7));
    });
    expect(out[1].at).toBeLessThan(out.at(-1)!.at);       // step 1 is out while later steps are still streaming
    expect(out.at(-1)!.at).toBeLessThan(chunks - 1);      // and the last step before the text ends
  });

  it('whiteboard: steps that close before els are held until els arrives (no key order assumed)', () => {
    const swapped = JSON.stringify({ q: a.q, steps: a.steps, els: a.els });
    const { out } = feed('whiteboard', swapped, 5);
    expect(out.map(e => e.type)).toEqual(['els', ...a.steps.map(() => 'step')]);
    expect(new Set(out.map(e => e.at)).size).toBe(1);   // all at the chunk that closes els
  });

  it('paper: each step as it closes; match-cut: nothing early', () => {
    const p = (MOCK as any).paper[0];
    const { out, chunks } = feed('paper', JSON.stringify(p), 11);
    expect(out.map(e => e.i)).toEqual(p.steps.map((_: unknown, i: number) => i));
    expect(out[0].at).toBeLessThan(chunks - 1);
    expect(feed('matchcut', JSON.stringify((MOCK as any).matchcut[0]), 9).out).toEqual([]);
  });

  it('strings with braces, brackets, quotes and escapes do not confuse it', () => {
    const tricky = { q: 'x', els: { t: 'text 1 1 | a } ] { [ "q" \\ end' }, steps: [{ say: 'He said "}{" and ] [', do: [] }, { say: 'ok', do: ['draw t'] }] };
    const { out } = feed('whiteboard', JSON.stringify(tricky), 3);
    expect(out.map(e => e.type)).toEqual(['els', 'step', 'step']);
    expect(out[1].step).toEqual(tricky.steps[0]);
  });

  it('fails past 200 KB of text', () => {
    const s = createScanner('whiteboard');
    expect(() => s.push('{"q": "' + 'x'.repeat(SCAN_LIMIT))).toThrow(/bytes of script text/);
  });
});
