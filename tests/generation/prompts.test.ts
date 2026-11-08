// Port parity (PLAN.md §7.1): each style's cached prompt is byte-identical to the frozen prototype's, so the key-day
// numbers (cache hits, costs, 0/30 check failures) still describe this app. Ported check.mjs §3 too.
import { describe, it, expect } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import P from '../../src/lib/generation/prompts.json' with { type: 'json' };

const app = path.resolve(__dirname, '../..');
const prototype = path.resolve(app, '../prototype');
// The two port proofs below read the frozen prototype next to the app. In a checkout without it they are reported as
// skipped (by name), and the hand-written EXPECTED shas below still bind every run.
const hasPrototype = fs.existsSync(path.join(prototype, 'server.mjs'));
const sha = (t: string) => crypto.createHash('sha256').update(t).digest('hex');

// Written out by hand from the prototype on 12 Oct 2026 (RULES / PAPER_RULES / MC_RULES of prototype/server.mjs).
// A deliberate prompt change (the M7 decline policy) changes these on purpose, in the same commit.
const EXPECTED = {
  whiteboard: 'a4d36210459a9eedd1207dc54b7ac94e22011f39aa982fe400b3ce4256f80dc1',   // 8 Nov 2026: connected narration (no "Step 1:")
  paper: 'c480e603d8b77bf2f4e31faed61444d2b549877b8ef4295be46f22a6b9694a5d',
  matchcut: 'c5d86359b0c730adb73f93d11fe2e9e0d95aa4f346633d3d845686ca8d1d7b31',
} as const;
// The frozen prototype keeps "Step 1:" narration; the app dropped it on 8 Nov 2026, so only paper/matchcut still match it.
const PROTOTYPE_WHITEBOARD = '332e6d7eca2617a485305ad53d82b9e27eeb51a87365106006e4e19626ebddca';

describe('prompt sha parity', () => {
  for (const style of ['whiteboard', 'paper', 'matchcut'] as const) {
    it(`${style}: the system text hashes to its bound sha`, () => {
      expect(sha(P.styles[style].system)).toBe(EXPECTED[style]);
      expect(P.styles[style].sha256).toBe(EXPECTED[style]);
    });
  }

  it.runIf(hasPrototype)('port proof (needs ../prototype): the frozen prototype, built in its own process, still produces the same three shas', () => {
    // A child process: importing server.mjs loads prototype/.env, which must never reach this test's environment.
    // It prints hashes only.
    const out = execFileSync(process.execPath, ['-e',
      "import('./server.mjs').then(m => { const h = t => require('crypto').createHash('sha256').update(t).digest('hex'); console.log(JSON.stringify({ whiteboard: h(m.RULES), paper: h(m.PAPER_RULES), matchcut: h(m.MC_RULES) })); })"],
      { cwd: prototype, env: { PATH: process.env.PATH, MOCK: '1', ANTHROPIC_API_KEY: '' } as unknown as NodeJS.ProcessEnv }).toString().trim();
    expect(JSON.parse(out)).toEqual({ ...EXPECTED, whiteboard: PROTOTYPE_WHITEBOARD });
  });

  it('prompts.json is what build-prompts.mjs makes from public/player now (not stale)', () => {
    const r = spawnSync(process.execPath, ['src/lib/generation/build-prompts.mjs', '--check'], { cwd: app, encoding: 'utf8' });
    expect(r.stderr).toBe(''); expect(r.status).toBe(0);
  });

  it('two builds in separate processes are byte-identical, with no timestamp in any prompt (check.mjs §3)', () => {
    const build = () => execFileSync(process.execPath, ['--input-type=module', '-e',
      "const m = await import('./src/lib/generation/build-prompts.mjs'); const { createHash } = await import('node:crypto'); process.stdout.write(createHash('sha256').update(m.serialize()).digest('hex'))"],
      { cwd: app }).toString();
    expect(build()).toBe(build());
    const all = Object.values(P.styles).map(s => s.system).join('');
    expect(all).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  // Subject prompts (founder, 18 Oct 2026): new prompts, so no prototype twin; these shas bind them the same way.
  const SUBJECT_EXPECTED = {
    biology: 'ffa3c3f8c0135e7c59716be46fadaa33a1c4e5891a9dde6268aecfae97f10d53',
    physics: '61ef895b6112940dfe7f597aaf7ec91e79923632a8ecff0f4a25309d2df01575',
    chemistry: '2aa963d5a17d33d37d3d557d15c7c5513e2e958315824e28b1b29d1094ad5a59',
    car: 'b236d1e21f1caf33331d93d951f9f012e3f18c55975358e2ed836373481a5d71',
    home: 'c22cd8162c1e0dc75dc02304419c230203302fbdbfaa6331cec475cf013365d0',
  } as const;
  for (const s of ['biology', 'physics', 'chemistry', 'car', 'home'] as const) it(`${s}: its own prompt, sha bound, only its categories listed`, () => {
    const t = P.subjects[s].system;
    expect(sha(t)).toBe(SUBJECT_EXPECTED[s]); expect(P.subjects[s].sha256).toBe(SUBJECT_EXPECTED[s]);
    const listed = [...t.split('More recipes, by subject')[1].split('Worked examples')[0].matchAll(/^  ([\w-]+): /gm)].map(m => m[1]);
    expect(listed).toEqual(P.subjects[s].cats);
    expect(t).toContain(`- Teaching ${s}:`);
    // beta feedback, 22 Oct 2026: draw what the voice names; end the story where it ends
    expect(t).toContain('- Show what you say:'); expect(t).toContain('- Finish the story:');
    // the rules and worked examples are the plain prompt's, word for word
    expect(t.split('Worked examples')[1]).toBe(P.styles.whiteboard.system.split('Worked examples')[1]);
    expect(t.split('- Only these element types exist')[0]).toBe(P.styles.whiteboard.system.split('- Only these element types exist')[0]);
  });
  it('the biology library is only in the biology prompt; the plain prompt is unchanged', () => {
    expect(P.subjects.biology.system).toMatch(/^  biology: heartsection circulation breathing gut reflexarc dnaladder cellcycle leafsection plantparts$/m);
    expect(P.styles.whiteboard.system).not.toContain('heartsection');
    expect(P.subjects.physics.system).not.toContain('heartsection');
  });
  it('the physics library (phys + colour drawings, 19 Oct 2026) is only in the physics prompt', () => {
    expect(P.subjects.physics.system).toMatch(/^  phys: seriespar symbols /m);
    expect(P.subjects.physics.system).toMatch(/servier-phys: \d+ realistic drawings, not listed/);
    for (const s of [P.styles.whiteboard.system, P.subjects.biology.system, P.subjects.chemistry.system]) expect(s).not.toMatch(/seriespar/);
    // university layer (19 Oct 2026): physuni recipes, physics prompt only
    expect(P.subjects.physics.system).toMatch(/^  physuni: doubleslit diffraction /m);
    expect(P.subjects.physics.system).toContain('university physics majors');
    for (const s of [P.styles.whiteboard.system, P.subjects.biology.system, P.subjects.chemistry.system]) expect(s).not.toMatch(/doubleslit|pvcycle/);
  });

  it('Everyday fixes (20 Oct 2026): the car and home libraries are each only in their own prompt', () => {
    expect(P.subjects.car.system).toMatch(/^  carfix: car lugwrench lugorder /m);
    expect(P.subjects.home.system).toMatch(/^  homefix: tieknot breaker /m);
    for (const s of [P.styles.whiteboard.system, P.subjects.biology.system, P.subjects.home.system]) expect(s).not.toMatch(/carfix|lugorder/);
    for (const s of [P.styles.whiteboard.system, P.subjects.biology.system, P.subjects.car.system]) expect(s).not.toMatch(/homefix|tieknot/);
    expect(P.subjects.car.system).toContain('never under a car held only by a jack');
    expect(P.subjects.home.system).toContain('power off at the breaker');
  });

  it('Reuse (20 Oct 2026): shared objects and every realistic library in every subject, the plain prompt untouched', () => {
    const SV = ['servier', 'servier-chem', 'servier-phys', 'servier-car', 'servier-home'];
    for (const s of ['biology', 'physics', 'chemistry', 'car', 'home'] as const) {
      for (const c of [...SV, 'objects']) expect(P.subjects[s].cats, `${s} lacks ${c}`).toContain(c);
      expect(P.subjects[s].system).toContain('add lab=0 to hide');
      expect(P.subjects[s].system).toMatch(/^  objects: tire jack /m);
    }
    expect(P.styles.whiteboard.system).not.toMatch(/objects: |lab=0 to hide/);
  });

  it('the prompt carries the connected-narration and no-zoom rules', () => {
    // founder, 8 Nov 2026: the board keeps its numbered tags/notes, the voice never says "Step 1:"
    const all = [P.styles.whiteboard, ...Object.values(P.subjects), P.iso.whiteboard, ...Object.values(P.iso.subjects)].map(x => x.system);
    for (const t of all) {
      expect(t).toContain('the voice never numbers the steps');
      expect(t).not.toMatch(/"say" begins "Step|say "Step \d/);
    }
    expect(P.styles.whiteboard.system).toContain('there is no camera or zoom');
  });

  it.runIf(hasPrototype)('port proof (needs ../PROCESS.md): the recipe catalogue copy is the PROCESS.md section, byte for byte', () => {
    const src = path.resolve(app, '../PROCESS.md');
    expect(fs.readFileSync(path.join(app, 'src/lib/generation/recipe-catalogue.md'), 'utf8'))
      .toBe(fs.readFileSync(src, 'utf8').split('## Recipe catalogue')[1]);
  });
});
