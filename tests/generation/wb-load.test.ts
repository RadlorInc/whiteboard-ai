// The player loads only its chat subject's subject-only drawing files (lib/wb-load.js), and those match the
// categories the subject's prompt lists (build-prompts.mjs SUBJECTS → prompts.json), so no drawing it may name is missing.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import P from '../../src/lib/generation/prompts.json' with { type: 'json' };

const loader = fs.readFileSync(path.resolve(__dirname, '../../public/player/lib/wb-load.js'), 'utf8');
// Runs the loader for a page URL; returns the categories it writes a <script> for, and its window.
function load(search: string) {
  const written: string[] = [];
  const window: Record<string, string[] | Record<string, string[]>> = {};
  vm.runInNewContext(loader, {
    window, location: { search }, URLSearchParams,
    document: { currentScript: { src: 'https://x/player/lib/wb-load.js' }, write: (h: string) => written.push(h.match(/wb\/([^"]+)\.js/)![1]) },
  });
  return { cats: written, window: window as { WB_CATS: string[]; WB_EXTRA: string[]; WB_SUBJECT: Record<string, string[]> } };
}

describe('wb-load subject files', () => {
  const { window: W, cats: all } = load('');
  it('no subject (old videos, previews): every category', () => expect(all).toEqual([...W.WB_CATS, ...W.WB_EXTRA]));
  it('an unlisted subject loads every category and is never written out', () => {
    expect(load('?subject=%22%3E%3Cscript%3E').cats).toEqual(all);
    expect(load('?subject=constructor').cats).toEqual(all);
  });
  for (const [s, { cats }] of Object.entries(P.subjects)) {
    it(`${s}: the shared ones plus exactly its prompt's subject-only ones`, () => {
      const mine = W.WB_EXTRA.filter(c => cats.includes(c));
      expect(W.WB_SUBJECT[s]).toEqual(expect.arrayContaining(mine));
      expect(W.WB_SUBJECT[s]).toHaveLength(mine.length);
      expect(load(`?subject=${s}`).cats).toEqual([...W.WB_CATS, ...W.WB_SUBJECT[s]]);
    });
  }
  it('every subject loads anatomy.js, which holds the realistic drawings (sv) and pins: without it a chat cannot draw one (20 Oct 2026)', () => {
    // maths is the exception: children's maths in Radlic draws no realistic drawings (run.ts refuses sv/pin there)
    for (const s of Object.keys(P.subjects).filter(s => s !== 'maths')) expect(load(`?subject=${s}`).cats, s).toContain('anatomy');
    expect(load('?subject=maths').cats).not.toContain('anatomy');
  });
  it('biology fetches no physics or chemistry files', () => {
    const bio = load('?subject=biology').cats;
    for (const c of [...W.WB_SUBJECT.physics, ...W.WB_SUBJECT.chemistry].filter(c => c !== 'objects' && c !== 'anatomy')) expect(bio).not.toContain(c);   // objects and anatomy (sv): shared by all (20 Oct 2026)
  });
});
