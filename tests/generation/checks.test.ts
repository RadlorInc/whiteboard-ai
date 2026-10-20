/* eslint-disable @typescript-eslint/no-explicit-any */
// Ported prototype/check.mjs §1–2e (the script checks and the library), plus the per-step split, checkPolicy and
// the checkSafety corpus rule (PLAN.md §7.4). §2f/2g (tool loop, keep-warm) are in run.test.ts; §3 in prompts.test.ts.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  check, checkEls, checkStep, checkPaper, checkPaperStep, checkMatchcut, expandMatchcut, checkPolicy, checkSafety,
  findDrawing as findDrawingJs, guardFindInput, BUILT_IN, EXAMPLES, WB_LIB, PAPER_LIB, MC_LIB, STYLE_CHECK,
} from '../../src/lib/generation/checks.mjs';
import P from '../../src/lib/generation/prompts.json' with { type: 'json' };
import MOCK from '../../src/lib/generation/mock-answers.json' with { type: 'json' };

type Any = any;
const clone = <T>(x: T): T => structuredClone(x);
const wb = EXAMPLES.whiteboard as Any[], sm = EXAMPLES.paper as Any[], mc = EXAMPLES.matchcut as Any[];

describe('check.mjs §1–2c: approved answers pass, planted faults go red', () => {
  it('§1 every hand-made whiteboard answer passes', () => { for (const a of wb) expect(check(clone(a)), a.q).toEqual([]); });

  const planted: Record<string, (a: Any) => void> = {
    'unknown type': a => { a.els.x = 'dragon 10 10'; },
    'missing id': a => { a.steps[0].do.push('draw nobody 500'); },
    'unknown command': a => { a.steps[0].do.push('explode sun'); },
    'unknown loop': a => { const id = Object.keys(a.els)[0]; a.steps[0].do.push(`loop ${id} spin`); },
    'travel missing id': a => { a.steps[0].do.push('travel ghost1,ghost2 3000'); },
  };
  for (const [name, plant] of Object.entries(planted)) it(`§2 whiteboard catches: ${name}`, () => {
    const a = clone(wb[4]); plant(a); expect(check(a).length).toBeGreaterThan(0);
  });
  it('§2 not a script', () => expect(check({ q: 'x' })).toEqual(['not {q, els, steps}']));

  it('§2b every paper answer passes', () => { for (const a of sm) expect(checkPaper(clone(a)), a.q).toEqual([]); });
  const smPlanted: Record<string, (a: Any) => void> = {
    'unknown drawing': a => { a.steps[0].do.push('dragon 10 10'); },
    'unknown flow item': a => { a.steps[0].do.push('flow cat 1,1 2,2'); },
    'bad bg': a => { a.steps[0].bg = 'blue'; },
    'w= instead of lw=': a => { a.steps[0].do.push('line 1,1 2,2 w=8'); },
  };
  for (const [name, plant] of Object.entries(smPlanted)) it(`§2b paper catches: ${name}`, () => {
    const a = clone(sm[0]); plant(a); expect(checkPaper(a).length).toBeGreaterThan(0);
  });

  it('§2c the match-cut answer passes', () => { for (const a of mc) expect(checkMatchcut(clone(a)), a.q).toEqual([]); });
  const mcPlanted: Record<string, (a: Any) => void> = {
    'short profile': a => { a.objects[0].top = a.objects[0].top.slice(0, 9); },
    'negative half-height': a => { a.objects[1].bot[3] = -5; },
    'bad colour': a => { a.objects[2].fill = 'red'; },
    'unknown move': a => { a.move = 'swim'; },
    'bad part': a => { a.objects[0].parts = [[0.8, 0.2, '#000000']]; },
    'too few objects': a => { a.objects = a.objects.slice(0, 2); },
    'unknown library object': a => { a.objects[0] = { say: 'x', bg: '#000000', use: 'unicornx' }; },
  };
  for (const [name, plant] of Object.entries(mcPlanted)) it(`§2c match-cut catches: ${name}`, () => {
    const a = clone(mc[0]); plant(a); expect(checkMatchcut(a).length).toBeGreaterThan(0);
  });
});

describe('the per-step split is the same check', () => {
  it('check(a) = checkEls + every checkStep, also on broken answers', () => {
    const broken = clone(wb[2]); broken.els.x = 'dragon 1 1'; broken.steps[1].do.push('draw nobody'); broken.steps[2] = { say: 1 };
    for (const a of [...wb, broken]) expect(check(clone(a))).toEqual([...checkEls(a.els), ...a.steps.flatMap((s: Any, i: number) => checkStep(s, i, a.els))]);
  });
  it('checkPaper(a) = every checkPaperStep', () => {
    const broken = clone(sm[1]); broken.steps[0].bg = 'red';
    for (const a of [...sm, broken]) expect(checkPaper(clone(a))).toEqual(a.steps.flatMap((s: Any, i: number) => checkPaperStep(s, i)));
  });
});

describe('check.mjs §2d–2e: library and find_drawing', () => {
  it('§2d every catalogue line has its code, names are unique, the example calls its own name', () => {
    const seen: Record<string, Set<string>> = { wb: new Set<string>(P.types.filter(t => !WB_LIB.some((c: Any) => c.lines.some((l: Any) => l.name === t)))), paper: new Set<string>() };
    // the realistic (servier) categories have one file per drawing instead: checked in 'realistic library' below
    for (const [dir, lib] of [['wb', (WB_LIB as Any[]).filter(c => !c.cat.startsWith('servier'))], ['paper', PAPER_LIB]] as const) for (const { cat, lines } of lib as Any[]) {
      const src = fs.readFileSync(path.resolve(__dirname, `../../player-src/lib/${dir}/${cat}.js`), 'utf8');
      for (const l of lines) {
        expect(new RegExp(`^\\s+${l.name}: `, 'm').test(src), `lib/${dir}/${cat}: "${l.name}" not in the code`).toBe(true);
        expect(l.example?.trim().split(/\s+/)[0]).toBe(l.name);
        expect(l.desc?.trim()).toBeTruthy();
        expect(seen[dir].has(l.name), `duplicate "${l.name}"`).toBe(false); seen[dir].add(l.name);
      }
    }
    for (const [name, o] of Object.entries(MC_LIB) as [string, Any][]) {
      const a = expandMatchcut({ move: 'fly', objects: [0, 1, 2].map(() => ({ say: 'x', bg: '#000000', use: name })) });
      expect(checkMatchcut(a), name).toEqual([]); expect(o.desc).toBeTruthy();
    }
  });
  it('§2e find_drawing: by name, unknown names, by query; no full lines in the cached prompt', () => {
    const findDrawing = findDrawingJs as (lib: unknown, q: { names: string[]; query: string }, builtIn?: Set<string>) => string;
    const WB = (WB_LIB as Any[]).filter(c => !c.cat.startsWith('servier'));   // the plain prompt's library
    const l = WB.flatMap(c => c.lines).find(x => x.name === 'magnet');
    expect(findDrawing(WB, { names: ['magnet'], query: '' }).startsWith(l.sig)).toBe(true);
    expect(findDrawing(WB, { names: ['unicornx'], query: '' })).toMatch(/unicornx: not in the library/);
    for (const n of ['sun', 'tag', 'title', 'cloud']) expect(findDrawing(WB, { names: [n], query: '' }, BUILT_IN.whiteboard)).toMatch(new RegExp(`^${n}: built in`));
    expect(findDrawing(PAPER_LIB, { names: ['glow'], query: '' }, BUILT_IN.paper)).toMatch(/^glow: built in/);
    expect(findDrawing(WB, { names: [], query: 'blood vessel artery' })).toMatch(/^vessel /m);
    expect(P.styles.whiteboard.system.includes(l.desc)).toBe(false);
  });
  it('§7.6 the find_drawing input guard: ≤40 names of ≤40 characters, query ≤200', () => {
    const g = guardFindInput({ names: Array.from({ length: 50 }, () => 'x'.repeat(60)), query: 'q'.repeat(300) });
    expect(g.names.length).toBe(40); expect(g.names[0].length).toBe(40); expect(g.query.length).toBe(200);
    expect(guardFindInput({ names: 'magnet', query: 7 })).toEqual({ names: [], query: '7' });
  });
});

describe('checkPolicy (policy 1)', () => {
  const ok = clone((MOCK as Any).whiteboard[0]);
  it('the mock fixtures are policy-1 answers: every check passes', () => {
    for (const [style, xs] of Object.entries(MOCK) as [string, Any[]][]) for (const a of xs)
      expect([...(STYLE_CHECK as Any)[style](clone(a)), ...checkPolicy(a, style), ...checkSafety(a, style)], `${style}: ${a.q}`).toEqual([]);
  });
  const planted: Record<string, (a: Any) => void> = {
    'a cam command': a => { a.steps[1].do.push('cam 480 270 1.5 800'); },
    'a "&cam" command': a => { a.steps[1].do.push('&cam 480 270 1.5 800'); },
    'no "Step N:"': a => { a.steps[2].say = a.steps[2].say.replace(/^Step 3: /, ''); },
    'steps out of order': a => { a.steps[1].say = a.steps[1].say.replace(/^Step 2:/, 'Step 3:'); },
    'over 900 spoken characters': a => { a.steps[0].say += ' ' + 'a'.repeat(901); },
    'eight steps': a => { while (a.steps.length < 8) a.steps.push({ say: `Step ${a.steps.length + 1}: more.`, do: [] }); },
  };
  for (const [name, plant] of Object.entries(planted)) it(`catches: ${name}`, () => {
    const a = clone(ok); plant(a); expect(checkPolicy(a, 'whiteboard').length).toBeGreaterThan(0);
  });
  it('match-cut cap is 700 characters', () => {
    const a = clone(mc[0]); a.objects[0].say = 'a'.repeat(701);
    expect(checkPolicy(a, 'matchcut')).toEqual([expect.stringMatching(/at most 700/)]);
  });
});

describe('checkSafety', () => {
  // Corpus rule, pre-registered (§7.4): every hand-made answer, every saved answer and every key-day answer passes.
  it('passes the whole corpus (hand-made + saved-answers.jsonl + key day)', () => {
    const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/corpus.json'), 'utf8')).answers as Any[];
    expect(corpus.length).toBe(72);                       // 39 saved + 31 key-day rows + 2 engine answers, counted by hand
    const all = [...corpus, ...Object.entries(EXAMPLES).flatMap(([style, xs]) => (xs as Any[]).map(answer => ({ src: answer.q, style, answer })))];
    for (const { src, style, answer } of all) expect(checkSafety(clone(answer), style), src).toEqual([]);
  });
  const planted: Record<string, [string, (a: Any) => void]> = {
    'a URL in a label': ['whiteboard', a => { a.els.t1 = 'text 100 100 s=24 | see http://evil.example'; }],
    'a domain in a say': ['whiteboard', a => { a.steps[0].say += ' Visit freestuff.com now.'; }],
    'an @handle': ['paper', a => { a.steps[0].say += ' follow @someone'; }],
    'a control character': ['whiteboard', a => { a.steps[0].say += '\u0007'; }],
    '__proto__ key': ['whiteboard', a => { a.els = JSON.parse(`{"__proto__": "circle 1 1 1", ${JSON.stringify(a.els).slice(1)}`); }],
    'an on* option': ['whiteboard', a => { a.els.x = 'circle 100 100 20 onload=alert'; }],
    'a colour that is code': ['whiteboard', a => { a.els.x = 'circle 100 100 20 c=url(#x)'; }],
    'a path d with script': ['whiteboard', a => { a.els.x = 'path | M0 0 L10 10 <script>'; }],
    'a coordinate far off the board': ['whiteboard', a => { a.els.x = 'circle 99999 100 20'; }],
    'a bad id': ['whiteboard', a => { a.els['1bad id'] = 'circle 1 1 1'; }],
    'a label over 200 characters': ['whiteboard', a => { a.els.x = 'text 10 10 s=20 | ' + 'b'.repeat(201); }],
    '41 commands in a step': ['paper', a => { a.steps[0].do = Array.from({ length: 41 }, () => 'ground 560'); }],
    'over 120 elements': ['whiteboard', a => { for (let i = 0; i < 121; i++) a.els[`e${i}`] = 'circle 1 1 1'; }],
    'a 70 KB script': ['matchcut', a => { a.pad = 'x'.repeat(70000); }],
  };
  for (const [name, [style, plant]] of Object.entries(planted)) it(`catches: ${name}`, () => {
    const a = clone({ whiteboard: wb[0], paper: sm[0], matchcut: mc[0] }[style]); plant(a);
    expect(checkSafety(a, style).length).toBeGreaterThan(0);
  });
});

// Anatomy pins (18 Oct 2026): a pin must point at an anatomy drawing listed before it, and at one of its parts.
describe('anatomy pins', () => {
  it('a good pin passes; an unknown part, a missing or later drawing, or a non-anatomy drawing fails', () => {
    expect(checkEls({ h: 'heartcut 470 270 480', p: 'pin of=h part=ra' })).toEqual([]);
    expect(checkEls({ h: 'heartcut 470 270 480', p: 'pin of=h part=kidney' })[0]).toMatch(/no part "kidney"/);
    expect(checkEls({ p: 'pin of=h part=ra', h: 'heartcut 470 270 480' })[0]).toMatch(/listed before it/);
    expect(checkEls({ p: 'pin of=zz part=ra' })[0]).toMatch(/listed before it/);
    expect(checkEls({ s: 'sun 100 100', p: 'pin of=s part=ra' })[0]).toMatch(/listed before it/);
  });
});

// The realistic library (scripts/servier, 18 Oct 2026): every catalogue drawing has its on-demand file, biology search
// finds them, the prompt does not list them, and an sv element must name one of them.
describe('realistic library', () => {
  const sv = (WB_LIB as Any[]).find(c => c.cat === 'servier').lines as Any[];
  it('every drawing has its file in public/player/lib/sv, and the file registers that id', () => {
    expect(sv.length).toBeGreaterThan(1000);
    for (const l of sv) {
      const f = path.resolve(__dirname, `../../public/player/lib/sv/${l.name}.js`);
      expect(fs.existsSync(f), l.name).toBe(true);
      expect(fs.readFileSync(f, 'utf8').startsWith(`SV.add(${JSON.stringify(l.name)},`)).toBe(true);
    }
  });
  it('search finds realistic drawings; the biology prompt mentions them without listing names', () => {
    const findDrawing = findDrawingJs as (lib: unknown, q: { names: string[]; query: string }) => string;
    expect(findDrawing([{ cat: 'servier', lines: sv }], { names: [], query: 'mitochondria' })).toMatch(/^sv id=mitochondria/m);
    expect(P.subjects.biology.system).toMatch(/servier: \d+ realistic drawings, not listed/);
    expect(P.subjects.biology.system.includes(sv[0].desc)).toBe(false);
    expect(P.styles.whiteboard.system).not.toMatch(/servier/);
  });
  it('an sv element must name a catalogue drawing', () => {
    expect(checkEls({ a: `sv id=${sv[0].name} 480 270 460` })).toEqual([]);
    expect(checkEls({ a: 'sv id=unicornx 480 270 460' })[0]).toMatch(/sv needs id=/);
  });
});

// Founder, 19 Oct 2026: every library drawing stays under MAX_BYTES (scripts/library/svg2sv.mjs). The older biology and
// chemistry files over it were shrunk by scripts/library/shrink-sv.mjs (two that could not shrink unseen were dropped).
describe('library size cap', () => {
  const cat = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../scripts/servier/sv-catalogue.json'), 'utf8')) as { id: string; subject: string }[];
  const size = (id: string) => fs.statSync(path.resolve(__dirname, `../../public/player/lib/sv/${id}.js`)).size;
  it('no drawing is over 150 KB', () => {
    const phys = cat.filter(c => c.subject === 'physics');
    expect(phys.length).toBeGreaterThan(100);
    for (const c of phys) expect(size(c.id), c.id).toBeLessThanOrEqual(150_000);
    expect(cat.filter(c => size(c.id) > 150_000).map(c => c.id)).toEqual([]);
  });
  it('university biology (Reactome, NIH BioArt; 19 Oct 2026): under the cap, found by search, "B cell" survives the 3-letter cut', () => {
    const uni = cat.filter(c => /^(Reactome|NIHBioArt)/.test((c as unknown as { kit: string }).kit));
    expect(uni.length).toBeGreaterThan(1000);
    for (const c of uni) expect(size(c.id), c.id).toBeLessThanOrEqual(150_000);
    const sv = (WB_LIB as Any[]).find(c => c.cat === 'servier').lines;
    const find = (q: string) => (findDrawingJs as (lib: unknown, q: { names: string[]; query: string }) => string)([{ cat: 'servier', lines: sv }], { names: [], query: q });
    expect(find('T cell receptor MHC')).toMatch(/^sv id=tcr-mhc/m);
    expect(find('NADPH oxidase')).toMatch(/^sv id=nadph-oxidase/m);
    expect(find('B cell').split('\n').slice(0, 3).join('\n')).toMatch(/b-cell|bcell/);
    expect(P.subjects.biology.system).not.toMatch(/at school level/);
  });
  it('US coverage checklist (19 Oct 2026): every topic, school to graduate, has a drawing', async () => {
    const T = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../scripts/coverage/topics.json'), 'utf8'));
    for (const s of Object.keys(T).filter(k => k !== '_about')) {
      const cats = (P.subjects as Any)[s].cats as string[], lib = (WB_LIB as Any[]).filter(c => cats.includes(c.cat));
      const recipes = new Set(lib.filter(c => !c.cat.startsWith('servier')).flatMap(c => c.lines.map((l: Any) => l.name)));
      const sv = lib.filter(c => c.cat.startsWith('servier')).flatMap(c => c.lines.map((l: Any) => l.name as string));
      const miss = T[s].filter((x: Any) => !x.key.some((k: string) => recipes.has(k) || sv.some((id: string) => `-${id}-`.includes(`-${k}-`))));
      expect(miss.length, `${s}: ${miss.map((x: Any) => x.t).join('; ')}`).toEqual(0);
    }
  });
  it('physics search finds colour drawings', () => {
    const lines = (WB_LIB as Any[]).find(c => c.cat === 'servier-phys').lines;
    expect((findDrawingJs as (lib: unknown, q: { names: string[]; query: string }) => string)([{ cat: 'servier-phys', lines }], { names: [], query: 'magnet colour' })).toMatch(/^sv id=magnet-physics/m);
  });
});

// Labelled realistic drawings (18 Oct 2026): 69 core drawings carry named parts that pins can point at.
describe('realistic drawings with parts', () => {
  it('the core drawings have parts in the catalogue, the prompt and their files; pins to them are checked', () => {
    const core = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../scripts/servier/core.json'), 'utf8')) as string[];
    expect(core.length).toBe(69);
    for (const id of core) {
      expect((P.svParts as Record<string, string[]>)[id]?.length, id).toBeGreaterThan(0);
      expect(fs.readFileSync(path.resolve(__dirname, `../../public/player/lib/sv/${id}.js`), 'utf8')).toContain('"parts":');
    }
    expect(checkEls({ l: 'sv id=lungs 480 270 460', p: 'pin of=l part=trachea' })).toEqual([]);
    expect(checkEls({ l: 'sv id=lungs 480 270 460', p: 'pin of=l part=spleen' })[0]).toMatch(/lungs has no part "spleen"/);
  });
});
