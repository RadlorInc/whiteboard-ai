#!/usr/bin/env node
// Secret scan. Stands in for gitleaks (PLAN.md §9.7), which is not installed: no new software, only git and node.
//
//   node scripts/secret-scan.mjs            every tracked and untracked file that git does not ignore (npm run lint:secrets)
//   node scripts/secret-scan.mjs --staged   the staged contents, as they will be committed (.githooks/pre-commit)
//
// exit 0 = looked and found nothing, 1 = found something, 2 = could not look.
// A finding prints the file, the line and the kind of key, never the value.
// `.env*` files are skipped (they hold local keys and git ignores them), except `.env.example`, which is committed.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

export const PATTERNS = {
  'Anthropic API key': /sk-ant-[A-Za-z0-9_-]{20,}/,
  'Stripe secret or restricted key': /\b[sr]k_(?:live|test)_[A-Za-z0-9]{16,}/,
  'Stripe webhook secret': /\bwhsec_[A-Za-z0-9]{24,}/,
  'Supabase secret key': /\bsb_secret_[A-Za-z0-9_-]{16,}/,
  // Supabase's legacy service_role and anon keys are JWTs; so is any session token pasted into a file.
  JWT: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/,
};

/** Every line of `text` that looks like it holds a key: [{ line, kind, hint }], hint = the first 7 characters only. */
export function scan(text) {
  const found = [];
  text.split('\n').forEach((l, i) => {
    for (const [kind, re] of Object.entries(PATTERNS)) {
      const m = l.match(re);
      if (m) found.push({ line: i + 1, kind, hint: `${m[0].slice(0, 7)}…` });
    }
  });
  return found;
}

const skipped = (path) => /^\.env/.test(basename(path)) && basename(path) !== '.env.example';

function main() {
  const staged = process.argv.includes('--staged');
  const git = (...args) => execFileSync('git', args, { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'] });
  let paths;
  try {
    paths = (staged ? git('diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR') : git('ls-files', '-z', '--cached', '--others', '--exclude-standard'))
      .toString().split('\0').filter(Boolean);
  } catch (e) {
    console.error(`secret scan: could not list files with git (${e.message.split('\n')[0]}). Nothing was scanned.`);
    return 2;
  }
  if (!staged && !paths.length) { console.error('secret scan: git listed no files at all. Nothing was scanned.'); return 2; }

  const findings = [], unreadable = [];
  let scanned = 0;
  for (const p of paths) {
    if (skipped(p)) continue;
    let buf;
    try { buf = staged ? git('show', `:${p}`) : readFileSync(p); }
    catch (e) {
      if (!staged && (e.code === 'ENOENT' || e.code === 'EISDIR')) continue;   // deleted in the tree, or a symlinked folder
      unreadable.push(`${p} (${e.code || e.message.split('\n')[0]})`); continue;
    }
    if (buf.includes(0)) continue;                                              // binary
    scanned++;
    for (const f of scan(buf.toString('utf8'))) findings.push(`${p}:${f.line}  ${f.kind} (${f.hint})`);
  }

  const where = staged ? 'staged file(s)' : 'file(s) in the working tree';
  if (findings.length) {
    console.error(`secret scan: ${findings.length} possible key(s) in ${scanned} ${where}:`);
    for (const f of findings) console.error(`  ${f}`);
    console.error('Remove it (keys live in .env.local and in Vercel, never in a file git sees). If a real key was ever committed or pushed, rotate it first.');
    return 1;
  }
  if (unreadable.length) {
    console.error(`secret scan: could not read ${unreadable.length} file(s), so the scan is not clean:`);
    for (const u of unreadable) console.error(`  ${u}`);
    return 2;
  }
  console.log(`secret scan: clean (${scanned} ${where} scanned)`);
  return 0;
}

if (import.meta.main) process.exit(main());
