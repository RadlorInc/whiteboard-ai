/* eslint-disable @typescript-eslint/no-explicit-any */
// Library drawings the model made (19 Oct 2026): kept after a video, normalised on approval, then usable as sv ids
// with their data carried to the sandboxed player.
import { describe, it, expect } from 'vitest';
import { absolute, candidateGroups, toDrawing, validDrawing, savedCat } from '../../src/lib/generation/drawings.mjs';
import { check, findDrawing } from '../../src/lib/generation/checks.mjs';
import { runGeneration } from '../../src/lib/generation/run';
import { fakeDb, fakeClient } from './fakes';

const HEDGEHOG = {
  new_hedgehog_body: 'path f=#8a6a4a c=#3a2a1a w=3 | M100 300 C100 200 300 200 300 300 Z',
  new_hedgehog_eye: 'circle 280 270 6 f=#111 c=none',
  new_hedgehog_shine: 'line 150 220 250 220 c=#ffffff w=3',
  new_hedgehog_name: 'text 150 340 s=20 | Hedgehog',       // words are never kept
};

describe('candidateGroups', () => {
  it('keeps the new_<name>_<part> shapes of each drawing, never words or lone parts', () => {
    const g = candidateGroups({ ...HEDGEHOG, new_owl_body: 'circle 10 10 5', t1: 'tag 100 50 160 44 | 1. Hedgehog' });
    expect(g).toEqual([{ name: 'hedgehog', lines: { new_hedgehog_body: HEDGEHOG.new_hedgehog_body,
      new_hedgehog_eye: HEDGEHOG.new_hedgehog_eye, new_hedgehog_shine: HEDGEHOG.new_hedgehog_shine } }]);
  });
  it('nothing new: nothing kept', () => expect(candidateGroups({ a: 'circle 1 1 1', b: 'path | M0 0 L1 1' })).toEqual([]));
});

describe('absolute', () => {
  it('relative commands, H/V and the line-tos after m become absolute', () => {
    expect(absolute('m10 10 5 0 v5 h-5 z L20 20')).toEqual([['M', 10, 10], ['L', 15, 10], ['L', 15, 15], ['L', 10, 15], ['Z'], ['L', 20, 20]]);
  });
  it('arcs keep radii and flags; curves add the pen position', () => {
    expect(absolute('M0 0 a5 5 0 0 1 10 0 c1 1 2 2 3 3')).toEqual([['M', 0, 0], ['A', 5, 5, 0, 0, 1, 10, 0], ['C', 11, 1, 12, 2, 13, 3]]);
  });
  it('rejects junk', () => expect(() => absolute('M0 0 Lx')).toThrow());
});

describe('toDrawing', () => {
  it('normalises to a 1000-tall box with the player defaults', () => {
    const d = toDrawing({ a: 'rect 10 20 100 50 f=#ff0000', b: 'circle 60 45 10 f=#00ff00 c=none', c: 'line 10 20 110 70 c=#0000ff w=2' });
    expect(d.h).toBe(1000); expect(d.w).toBe(2000);                       // 100 x 50 -> 2000 x 1000
    expect(d.shapes[0]).toEqual(['M0 0 L2000 0 L2000 1000 L0 1000 Z', '#ff0000', 1, '#222', 100]);   // default ink, w 5 x 20
    expect(d.shapes[1][3]).toBeNull();                                     // c=none: no edge
    expect(d.shapes[2]).toEqual(['M0 0 L2000 1000', 'none', 1, '#0000ff', 40]);
    expect(validDrawing(d)).toBe(true);
  });
  it('a drawing with no height is refused', () => expect(() => toDrawing({ a: 'line 0 5 10 5' })).toThrow());
});

describe('approved drawings in a lesson', () => {
  const data = toDrawing(HEDGEHOG);
  const approved = [{ slug: 'hedgehog', name: 'hedgehog', subject: 'biology' as const, tags: ['spiny'], data }];
  const script = { q: 'q', els: { h: 'sv id=hedgehog 480 270 300', t1: 'tag 150 60 170 44 | 1. Spines' },
    steps: [{ say: 'Step 1: A hedgehog has spines.', do: ['draw h', 'fill h', 'draw t1'] }] };

  it('check accepts an approved slug only when told about it', () => {
    expect(check(script).join()).toMatch(/sv needs id/);
    expect(check(script, new Set(['hedgehog']))).toEqual([]);
  });
  it('find_drawing finds it by its words', () => {
    expect(findDrawing([savedCat(approved)], { names: [], query: 'spiny' })).toMatch(/^sv id=hedgehog cx cy height/);
  });
  it('the run lets the script use it, carries its data, and saves new drawings for review', async () => {
    const { db, log } = fakeDb(), saved: unknown[] = [];
    Object.assign(db, { approvedDrawings: async () => approved, saveDrawings: async (...a: unknown[]) => { saved.push(a); return 1; } });
    const withNew = { ...script, els: { ...script.els, ...HEDGEHOG } };
    const events: { event: string; data: any }[] = [];
    await runGeneration({ id: '00000000-0000-4000-8000-000000000001', style: 'whiteboard', subject: 'biology', question: 'q',
      client: fakeClient([{ tool: { names: [], query: 'spiny' } }, { text: JSON.stringify(withNew) }]).client, db,
      send: (event, d) => events.push({ event, data: d }), retryWaitMs: () => 0 });
    expect(log.finish.length).toBe(1);
    expect(events.find(e => e.event === 'els')?.data.drawings).toEqual({ hedgehog: data });
    expect((log.finish[0].script as any).drawings).toEqual({ hedgehog: data });
    expect(saved).toEqual([['00000000-0000-4000-8000-000000000001', 'biology', candidateGroups(HEDGEHOG)]]);
    expect(events.at(-1)?.event).toBe('done');
  });
  it('a database without the drawing functions still makes the video', async () => {
    const { db, log } = fakeDb();
    await runGeneration({ id: '00000000-0000-4000-8000-000000000001', style: 'whiteboard', subject: 'biology', question: 'q',
      client: fakeClient([{ text: JSON.stringify({ ...script, els: { a: 'circle 100 100 40', t1: script.els.t1 }, steps: [{ ...script.steps[0], do: ['draw a', 'draw t1'] }] }) }]).client,
      db, send: () => {}, retryWaitMs: () => 0 });
    expect(log.finish.length).toBe(1);
  });
});
