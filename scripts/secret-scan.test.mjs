import { describe, test, expect } from 'vitest';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scan } from './secret-scan.mjs';

// Fake keys are assembled at run time, so this file never contains one (the scan would rightly flag it).
const x = (n) => 'x'.repeat(n);
const FAKE = {
  anthropic: 'sk-ant-' + 'api03-' + x(40),
  stripeLive: 'sk_' + 'live_' + x(24),
  stripeTest: 'sk_' + 'test_' + x(24),
  stripeRestricted: 'rk_' + 'live_' + x(24),
  webhook: 'whsec' + '_' + x(32),
  supabase: 'sb_' + 'secret_' + x(24),
  jwt: ['eyJhbGciOiJIUzI1NiJ9', 'eyJyb2xlIjoic2VydmljZV9yb2xlIn0', x(20)].join('.'),
};

describe('scan', () => {
  test.each([
    ['anthropic', 'Anthropic API key'],
    ['stripeLive', 'Stripe secret or restricted key'],
    ['stripeTest', 'Stripe secret or restricted key'],
    ['stripeRestricted', 'Stripe secret or restricted key'],
    ['webhook', 'Stripe webhook secret'],
    ['supabase', 'Supabase secret key'],
    ['jwt', 'JWT'],
  ])('finds a planted %s key on its line', (name, kind) => {
    const found = scan(`first line\nconst k = "${FAKE[name]}";\n`);
    expect(found.map(({ line, kind }) => ({ line, kind }))).toEqual([{ line: 2, kind }]);
    expect(found[0].hint).toHaveLength(8); // 7 characters and an ellipsis: never the value
  });

  test('look-alikes that are not secrets pass', () => {
    const benign = [
      'STRIPE_WEBHOOK_SECRET=whsec_local_only',
      'pk_' + 'live_' + x(24), // a publishable key is public
      'sb_' + 'publishable_' + x(24),
      'NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA',
      'grep for sk_live_, sk_test_, rk_, whsec_, sk-ant-, sb_secret_ in the build',
      '"integrity": "sha512-' + 'A'.repeat(86) + '=="',
      'eyJ alone is not a token',
    ];
    expect(scan(benign.join('\n'))).toEqual([]);
  });
});

describe('the command', () => {
  const run = (cwd, ...args) => spawnSync(process.execPath, [join(import.meta.dirname, 'secret-scan.mjs'), ...args], { cwd, encoding: 'utf8' });
  const repo = () => { const d = mkdtempSync(join(tmpdir(), 'scan-')); execFileSync('git', ['init', '-q'], { cwd: d }); return d; };

  test('exit 1 on a planted key, naming the file and line but never printing the key', () => {
    const d = repo();
    writeFileSync(join(d, 'clean.txt'), 'nothing here\n');
    writeFileSync(join(d, 'leak.ts'), `// note\nexport const key = '${FAKE.anthropic}';\n`);
    const r = run(d);
    rmSync(d, { recursive: true });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('leak.ts:2  Anthropic API key');
    expect(r.stdout + r.stderr).not.toContain(FAKE.anthropic.slice(8));
  });

  test('exit 0 on a clean tree; .env.local is skipped but .env.example is scanned', () => {
    const d = repo();
    writeFileSync(join(d, 'clean.txt'), 'nothing here\n');
    writeFileSync(join(d, '.env.local'), `ANTHROPIC_API_KEY=${FAKE.anthropic}\n`);
    const clean = run(d);
    writeFileSync(join(d, '.env.example'), `ANTHROPIC_API_KEY=${FAKE.anthropic}\n`);
    const example = run(d);
    rmSync(d, { recursive: true });
    expect(clean.status).toBe(0);
    expect(clean.stdout).toContain('clean (1 file(s) in the working tree scanned)');
    expect(example.status).toBe(1);
    expect(example.stderr).toContain('.env.example:1');
  });

  test('--staged reads what will be committed, not the working tree', () => {
    const d = repo();
    writeFileSync(join(d, 'a.txt'), `${FAKE.stripeLive}\n`);
    execFileSync('git', ['add', 'a.txt'], { cwd: d });
    writeFileSync(join(d, 'a.txt'), 'cleaned in the tree but not re-staged\n');
    const staged = run(d, '--staged');
    const tree = run(d);
    rmSync(d, { recursive: true });
    expect(staged.status).toBe(1);
    expect(staged.stderr).toContain('a.txt:1  Stripe secret or restricted key');
    expect(tree.status).toBe(0);
  });

  test('exit 2 outside a git repository: could not look is not clean', () => {
    const d = mkdtempSync(join(tmpdir(), 'scan-nogit-'));
    const r = run(d);
    rmSync(d, { recursive: true });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('Nothing was scanned');
  });
});
