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
  whiteboard: '332e6d7eca2617a485305ad53d82b9e27eeb51a87365106006e4e19626ebddca',
  paper: 'c480e603d8b77bf2f4e31faed61444d2b549877b8ef4295be46f22a6b9694a5d',
  matchcut: 'c5d86359b0c730adb73f93d11fe2e9e0d95aa4f346633d3d845686ca8d1d7b31',
} as const;

describe('prompt sha parity', () => {
  for (const style of ['whiteboard', 'paper', 'matchcut'] as const) {
    it(`${style}: the system text hashes to the prototype's sha`, () => {
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
    expect(JSON.parse(out)).toEqual(EXPECTED);
  });

  it('prompts.json is what build-prompts.mjs makes from player-src now (not stale)', () => {
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
    biology: '4c5cdcdb57d5ff76c36a76ae67ea9936ff7f16d0b5b9407840163375b4b4e64e',
    physics: '1f75c2088d47ff2f7f314b0a7309326a5862a7fb01bf30071f5119d8e83ac102',
    chemistry: '283c68b7407e04f098fa1d7e287a5fd7a559088d958e3abbe87a754bb1114d9d',
  } as const;
  for (const s of ['biology', 'physics', 'chemistry'] as const) it(`${s}: its own prompt, sha bound, only its categories listed`, () => {
    const t = P.subjects[s].system;
    expect(sha(t)).toBe(SUBJECT_EXPECTED[s]); expect(P.subjects[s].sha256).toBe(SUBJECT_EXPECTED[s]);
    const listed = [...t.split('More recipes, by subject')[1].split('Worked examples')[0].matchAll(/^  ([\w-]+): /gm)].map(m => m[1]);
    expect(listed).toEqual(P.subjects[s].cats);
    expect(t).toContain(`- Teaching ${s}:`);
    // the rules and worked examples are the plain prompt's, word for word
    expect(t.split('Worked examples')[1]).toBe(P.styles.whiteboard.system.split('Worked examples')[1]);
    expect(t.split('- Only these element types exist')[0]).toBe(P.styles.whiteboard.system.split('- Only these element types exist')[0]);
  });
  it('the biology library is only in the biology prompt; the plain prompt is unchanged', () => {
    expect(P.subjects.biology.system).toMatch(/^  biology: heartsection circulation breathing gut reflexarc dnaladder cellcycle leafsection plantparts$/m);
    expect(P.styles.whiteboard.system).not.toContain('heartsection');
    expect(P.subjects.physics.system).not.toContain('heartsection');
  });

  it('the prompt carries the numbered-steps and no-zoom rules', () => {
    expect(P.styles.whiteboard.system).toContain('every step\'s "say" begins "Step 1:", "Step 2:" and so on');
    expect(P.styles.whiteboard.system).toContain('there is no camera or zoom');
  });

  it.runIf(hasPrototype)('port proof (needs ../PROCESS.md): the recipe catalogue copy is the PROCESS.md section, byte for byte', () => {
    const src = path.resolve(app, '../PROCESS.md');
    expect(fs.readFileSync(path.join(app, 'src/lib/generation/recipe-catalogue.md'), 'utf8'))
      .toBe(fs.readFileSync(src, 'utf8').split('## Recipe catalogue')[1]);
  });
});
