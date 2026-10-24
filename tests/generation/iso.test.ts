/* eslint-disable @typescript-eslint/no-explicit-any */
// Anatomy recipes behind the ANATOMY_RECIPES switch (workshop ARCHITECTURE.md §E): the iso prompts, the renaming to
// "<name>Iso", the server's cleaner (the same rules as the player's ISO.cleaner), the placement checks, and a run.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import P from '../../src/lib/generation/prompts.json' with { type: 'json' };
import { check, checkSafety, findDrawing, isoCleaner, isoEls, isoLibOf, isoStep, ISO_NAMES, WB_LIB } from '../../src/lib/generation/checks.mjs';
import { runGeneration } from '../../src/lib/generation/run';
import { fakeDb, fakeClient } from './fakes';

type Any = any;
const ISO_DIR = path.resolve(__dirname, '../../public/player/lib/iso');
const manifest = () => { const window: Any = {}; vm.runInNewContext(fs.readFileSync(path.join(ISO_DIR, 'manifest.js'), 'utf8'), { window }); return window.ISO_MANIFEST; };

describe('iso prompts and library', () => {
  it('every subject has an iso twin that teaches box= and set, and lists the new recipes', () => {
    for (const s of Object.keys(P.subjects) as (keyof typeof P.subjects)[]) {
      const t = (P as Any).iso.subjects[s].system as string;
      expect(t).toContain('box=x,y,w,h'); expect(t).toContain('set <id> key=value');
      expect(t).toContain('  iso: '); expect(t).toContain('tyrechange');
      expect((P as Any).iso.subjects[s].sha256).not.toBe(P.subjects[s].sha256);
    }
  });
  it('the old prompts are untouched (their sha is what production caches)', () => {
    expect(P.subjects.physics.system).not.toContain('box=x,y,w,h');
    expect(P.styles.whiteboard.system).not.toContain('iso:');
  });
  it('find_drawing returns the Anatomy line for a name both libraries have, and keeps sv drawings', () => {
    const lib = isoLibOf(WB_LIB as Any);
    const got = findDrawing(lib, { names: ['lever', 'tyrechange'], query: '' });
    expect(got).toContain(P.iso.lib.lines.find((l: Any) => l.name === 'lever')!.sig);
    expect(got).toContain('tyrechange cx cy');
    expect(lib.filter((c: Any) => c.cat !== 'iso').flatMap((c: Any) => c.lines).some((l: Any) => l.name === 'lever' && !l.sig.startsWith('sv '))).toBe(false);
    expect(lib.find((c: Any) => c.cat === 'servier')!.lines.length).toBe((WB_LIB as Any).find((c: Any) => c.cat === 'servier').lines.length);
  });
  it('the catalogue, the manifest and the player files agree: every recipe has its files on disk', () => {
    const M = manifest();
    expect(Object.keys(M.recipes).sort()).toEqual([...ISO_NAMES].sort());
    for (const f of [...M.base, ...Object.values(M.recipes).flatMap((r: Any) => r.files)]) expect(fs.existsSync(path.join(ISO_DIR, f as string)), f as string).toBe(true);
    for (const r of Object.values(M.recipes) as Any[]) expect(r.box).toHaveLength(8);
  });
});

describe('renaming and cleaning', () => {
  it('an Anatomy element becomes <name>Iso with its options cleaned; others are left as they are', () => {
    const els = isoEls({ b: 'bunsen box=540,90,380,420 k=purple air=7 zz=1 lit=collar', t: 'tag 150 60 200 44 s=20 | 1. Light', l: 'lever 480 270 300 e=abc', x: 'circle 1 2 3' });
    expect(els).toEqual({ b: 'bunsenIso box=540,90,380,420 air=1 lit=collar', t: 'tag 150 60 200 44 s=20 | 1. Light', l: 'leverIso 480 270 300', x: 'circle 1 2 3' });
    expect(isoEls(els)).toEqual(els);                       // twice is the same (a pinned repair compares them)
  });
  it('a value with markup or quotes is dropped, in an element and in set', () => {
    const els = isoEls({ b: 'bunsen box=540,90,380,420 lit="><img/src=x> k=<b>blue</b>' });
    expect(els.b).toBe('bunsenIso box=540,90,380,420');
    expect(isoStep({ say: 'Step 1: x', do: ['set b lit=collar"/onload=x'] }, els).do).toEqual(['set b']);
  });
  it('set is cleaned by its element recipe, its cue and & kept; set on a plain drawing is untouched', () => {
    const els = isoEls({ b: 'bunsen box=540,90,380,420', c: 'circle 1 2 3' });
    expect(isoStep({ say: 'Step 1: air on', do: ['@air &set b air=9 foo=2', 'set c x=1', 'draw b'] }, els).do).toEqual(['@air &set b air=1', 'set c x=1', 'draw b']);
  });
  // the player cleans every value too (workshop shared.js ISO.cleaner): both must agree, or a saved script could draw
  // differently from what the server checked
  it('the server cleaner gives what the player ISO.cleaner gives, on every recipe line', () => {
    const shared = fs.readdirSync(ISO_DIR).find(f => /^shared\.[0-9a-f]{10}\.js$/.test(f))!;
    const window: Any = { RECIPES: {} }, ctx = vm.createContext({ window, document: {}, matchMedia: () => ({ matches: false }), performance: { now: () => 0 } });
    vm.runInContext(fs.readFileSync(path.join(ISO_DIR, shared), 'utf8'), ctx);
    const ISO = window.ISO ?? (ctx as Any).ISO;
    const junk = ['', 'abc', '-1', '0', '1', '999999', 'NaN', '1e9', '0.5', 'open', 'yellow', '3'];
    for (const l of P.iso.lib.lines as Any[]) {
      const keys = [...l.sig.matchAll(/\b([a-z][a-z0-9]*)=/g)].map((m: Any) => m[1]);
      const a = ISO.cleaner(l.sig), b = isoCleaner(l.sig);
      for (const k of keys) for (const v of junk) expect(b({ [k]: v }), `${l.name} ${k}=${v}`).toEqual(a({ [k]: v }));
    }
  });
});

describe('label translations (ISO.say)', () => {
  it('a reviewed key with "#" takes the numbers back in order; Dutch gets a decimal comma; an unknown label stays English', () => {
    const shared = fs.readdirSync(ISO_DIR).find(f => /^shared\.[0-9a-f]{10}\.js$/.test(f))!;
    const window: Any = { RECIPES: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ISO_DIR, shared), 'utf8'), { window, document: {}, matchMedia: () => ({ matches: false }) });
    const ISO = window.ISO;
    ISO.T9N.nl = { 'wire # °C · sags # m': 'draad # °C · zakt # m', 'gas tap': 'gaskraan' };
    expect(ISO.say('wire 79 °C · sags 5.8 m')).toBe('wire 79 °C · sags 5.8 m');       // English video
    ISO.LANG = 'nl';
    expect(ISO.say('wire 79 °C · sags 5.8 m')).toBe('draad 79 °C · zakt 5,8 m');
    expect(ISO.say('gas tap')).toBe('gaskraan');
    expect(ISO.say('steel pylon')).toBe('steel pylon');
  });
  it('the player gets only reviewed labels: none are reviewed yet, so no language file ships', () => {
    expect(manifest().t9n).toEqual({});
  });
});

describe('parts compose (workshop PARTS.md)', () => {
  const room = (more: Record<string, string> = {}) => isoEls({ w: 'wallpanel 440 505 2.6 w=250 h=165', b1: 'shelfbracket at=w ax=-40.6 az=140', ...more });
  it('at= on an earlier part and one of its anchors passes; placement options survive the cleaner', () => {
    const els = room({ s1: 'woodscrew at=b1.hole1 aim=wall in=0' });
    expect(els.s1).toBe('woodscrewIso at=b1.hole1 aim=wall in=0');
    expect(check({ els, steps: [] })).toEqual([]);
  });
  it('a missing anchor, a later part or a plain drawing as the target is an error', () => {
    expect(check({ els: room({ s1: 'woodscrew at=b1.nope aim=wall' }), steps: [] }).join()).toMatch(/has no anchor "nope" \(anchors: top hole1 hole2\)/);
    expect(check({ els: isoEls({ s1: 'woodscrew at=b1.hole1', b1: 'shelfbracket 400 300 3' }), steps: [] }).join()).toMatch(/needs a part listed before it/);
    expect(check({ els: isoEls({ c: 'circle 1 2 3', s1: 'woodscrew at=c' }), steps: [] }).join()).toMatch(/needs a part listed before it/);
  });
  it('a part off the board or at an unreal scale is an error; a scene of parts may hold up to 16', () => {
    expect(check({ els: isoEls({ w: 'wallpanel 1400 505 2.6' }), steps: [] }).join()).toMatch(/off the 960x540 board/);
    expect(check({ els: isoEls({ w: 'wallpanel 440 505 40' }), steps: [] }).join()).toMatch(/not a real scale/);
    const many = Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`s${i}`, `woodscrew ${100 + i * 60} 300 3`]));
    expect(check({ els: isoEls(many), steps: [] })).toEqual([]);
  });
  it('a plain on= option is allowed (a switch, a lamp), an on… handler name is not', () => {
    expect(checkSafety({ els: isoEls({ sw: 'wallswitch 300 200 3 on=1' }), steps: [] }, 'whiteboard')).toEqual([]);
    expect(checkSafety({ els: { x: 'circle 1 2 3 onload=1' }, steps: [] }, 'whiteboard').join()).toMatch(/option "onload" not allowed/);
  });
});

describe('placement and parts', () => {
  const els = (more: Record<string, string> = {}) => isoEls({ t: 'tag 150 60 200 44 s=20 | 1. Light', b: 'bunsen box=40,100,400,420', k: 'kettle box=500,100,420,420', ...more });
  const steps = (cmds: string[]) => [{ say: 'Step 1: light it', do: cmds }];
  it('a clean board passes', () => expect(check({ els: els(), steps: steps(['draw t', 'draw b', 'mark b.collar circle', 'set k on=1']) })).toEqual([]));
  it('boxes on top of each other, off the board, or under a tag are errors', () => {
    expect(check({ els: els({ k: 'kettle box=300,100,420,420' }), steps: [] }).join()).toMatch(/boxes overlap/);
    expect(check({ els: els({ k: 'kettle box=700,100,420,420' }), steps: [] }).join()).toMatch(/runs off/);
    expect(check({ els: els({ t: 'tag 200 300 200 44 s=20 | 1. Light' }), steps: [] }).join()).toMatch(/tag sits on drawing b/);
  });
  it('at most 4 detailed 3D drawings on one board (a phone builds and moves each)', () => {
    const many = Object.fromEntries(Array.from({ length: 5 }, (_, i) => [`l${i}`, `lever 100 ${60 + i * 90} 80`]));
    expect(check({ els: isoEls(many), steps: [] }).join()).toMatch(/5 detailed 3D drawings, at most 4/);
  });
  it('mark id.part needs a part the recipe names; set needs an Anatomy drawing', () => {
    const e = { ...els(), c: 'circle 10 10 5' };
    expect(check({ els: e, steps: steps(['mark b.nope circle']) }).join()).toMatch(/bunsen has no part "nope" \(parts: /);
    expect(check({ els: e, steps: steps(['mark c.rim circle']) }).join()).toMatch(/only a detailed 3D drawing has named parts/);
    expect(check({ els: e, steps: steps(['set c r=3']) }).join()).toMatch(/only a detailed 3D drawing/);
    expect(check({ els: e, steps: steps(['mark zz circle']) }).join()).toMatch(/missing id "zz"/);
  });
});

describe('a run with the switch on', () => {
  const script = { q: 'q', els: { t: 'tag 150 60 200 44 s=20 | 1. Light it', b: 'bunsen box=500,100,420,420 k=yellow air=5' },
    steps: [{ say: 'Step 1: Open the air hole and the flame turns blue.', do: ['draw t', 'fill t', '@air draw b', '@blue set b air=1 k=blue'] }] };
  async function go(iso: boolean) {
    const { db, log } = fakeDb(), f = fakeClient([{ text: JSON.stringify(script) }]), events: Any[] = [];
    await runGeneration({ id: '00000000-0000-4000-8000-000000000009', style: 'whiteboard', question: 'q', client: f.client, db, send: (event, data) => events.push({ event, data }), retryWaitMs: () => 0, iso });
    return { log, events };
  }
  it('streams and saves the renamed, cleaned script', async () => {
    const { log, events } = await go(true);
    expect(events.find(e => e.event === 'els').data.els.b).toBe('bunsenIso box=500,100,420,420 k=yellow air=1');
    expect(events.find(e => e.event === 'step').data.step.do[3]).toBe('@blue set b air=1 k=blue');
    expect((log.finish[0].script as Any).els.b).toBe('bunsenIso box=500,100,420,420 k=yellow air=1');
    expect(events.at(-1).event).toBe('done');
  });
  it('with the switch off nothing is renamed', async () => {
    const { events } = await go(false);
    expect(events.find(e => e.event === 'els').data.els.b).toBe(script.els.b);
  });
});
