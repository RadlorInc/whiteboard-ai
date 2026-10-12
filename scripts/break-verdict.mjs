// Decides whether a broken-state run proved anything. Ported from Radlic's scripts/break-verdict.mjs (12 Oct 2026).
//
//   node scripts/break-verdict.mjs vitest|playwright <report.json from break-reporter.mjs> <check file>
//   node scripts/break-verdict.mjs tap <captured output of `supabase test db`> <check file>
//
// ⚠️ RED IS NOT EVIDENCE ON ITS OWN. A break that stops a file loading, throws before the assertion, fails a hook, or
// raises an SQL error turns the run red, and accepting that would certify a check that also goes red when you delete
// a semicolon. So the red must be attributable: the named file, failing on its OWN assertion.
//   Vitest, Playwright: break-reporter.mjs says, per test, whether it failed on its own assertion with no hook failing.
//     (Radlic's known hole, a beforeEach whose expect fails counted as the test's assertion, is closed here.)
//   pgTAP: pg_prove's summary. A "Failed test" is a pgTAP assertion; an SQL error or a bad plan is not.
//
// exit 0  the named file failed on its own assertion           → the check binds
// exit 1  the named file ran and passed                         → the check does not bind
// exit 4  the named file went red, but not on its own assertion → red for the wrong reason
// exit 5  the run never reached the named file, or every test in it was skipped → nothing was tested
// exit 2  usage
import { readFileSync } from 'node:fs';
import { relative, normalize } from 'node:path';

const [runner, reportPath, target] = process.argv.slice(2);
if (!['vitest', 'playwright', 'tap'].includes(runner) || !reportPath || !target) {
  console.error('usage: node scripts/break-verdict.mjs vitest|playwright|tap <report> <check file>');
  process.exit(2);
}
const want = normalize(target);

let raw;
try { raw = readFileSync(reportPath, 'utf8'); }
catch {
  console.error(`✗ no report: the ${runner} run died before it wrote one (a broken config or setup). Nothing was tested.`);
  process.exit(5);
}

/**
 * pg_prove's output (what `supabase test db` prints) → the reporter's shape. Measured on pg_prove 3.36 via Supabase CLI
 * 2.116.0, 12 Oct 2026:
 *   "<path> .. ok"                                         the file passed
 *   "# Failed test 2: "one is two""                        a failed assertion (inside the file's block)
 *   "psql:<path>:4: ERROR:  …"                             an SQL error (printed before the file's block)
 *   Test Summary Report: "<path>  (Wstat: 768 (exited 3) Tests: 1 Failed: 0)" then indented
 *   "Failed test:  2" / "Non-zero exit status: 3" / "Parse errors: Bad plan.  You planned 2 tests but ran 1."
 */
function fromTap(text) {
  const files = {}, file = (p) => (files[relative(process.cwd(), p)] ??= { errors: [], tests: [] });
  const names = {};
  let cur = null;
  for (const l of text.split('\n')) {
    let m;
    if ((m = l.match(/^psql:(\S+\.sql):\d+: (ERROR: .*)$/))) file(m[1]).errors.push(m[2].replace(/\s+/g, ' '));
    if ((m = l.match(/^(\S+\.sql) \.+ ?(ok\b.*)?$/))) {
      cur = m[1];
      if (m[2]) file(cur).tests.push({ name: '(every test in the file)', status: 'passed', hook: null, own: false, message: '' });
    } else if (cur && (m = l.match(/^# Failed test (\d+): "?(.*?)"?$/))) (names[cur] ??= {})[m[1]] = m[2];
  }
  const summary = text.split(/^Test Summary Report\n-+\n/m)[1] ?? '';
  let f = null;
  for (const l of summary.split('\n')) {
    const h = l.match(/^(\S+\.sql)\s+\(Wstat: \d+.*Tests: (\d+) Failed: (\d+)\)/);
    if (h) {
      f = file(h[1]);
      const ran = +h[2], failed = +h[3], named = names[h[1]] ?? {};
      const ids = Object.keys(named);
      for (let i = 0; i < failed; i++) {
        const id = ids[i];
        f.tests.push({ name: id ? `test ${id}: ${named[id]}` : `failed test ${i + 1}`, status: 'failed', hook: null, own: true, message: '' });
      }
      for (let i = failed; i < ran; i++) f.tests.push({ name: `test that passed`, status: 'passed', hook: null, own: false, message: '' });
      continue;
    }
    if (!/^\s/.test(l)) { f = null; continue; }
    if (f && /Non-zero exit status|Parse errors|Dubious/.test(l)) f.errors.push(l.trim());
  }
  return { runner: 'tap', errors: [], files };
}

let report;
try { report = runner === 'tap' ? fromTap(raw) : JSON.parse(raw); }
catch (e) { console.error(`✗ the report is not readable (${e.message}). Nothing can be concluded.`); process.exit(5); }

const seen = Object.keys(report.files);
const f = report.files[want];
for (const e of report.errors ?? []) console.error(`  note: the run reported an error outside any file: ${e.slice(0, 180)}`);
if (!f) {
  console.error(`✗ ${want} never ran: nothing was tested.`);
  console.error(`  the run reported ${seen.length} file(s): ${seen.join(', ') || '(none)'}`);
  process.exit(5);
}

const tests = f.tests, failed = tests.filter((t) => t.status === 'failed'), own = failed.filter((t) => t.own);
const skipped = tests.filter((t) => t.status === 'skipped');
const othersRed = seen.filter((p) => p !== want && report.files[p].tests.some((t) => t.status === 'failed'));

if (!tests.length && f.errors.length) {
  console.error(`✗ ${want} went red WITHOUT RUNNING A TEST: it did not load, or its setup failed:`);
  for (const e of f.errors) console.error(`    ${e.slice(0, 180)}`);
  console.error('  Red here says nothing about the check. Narrow the break.');
  process.exit(4);
}
if (!tests.length) { console.error(`✗ ${want} ran, but holds no tests. Nothing was tested.`); process.exit(5); }

if (own.length) {
  console.log(`✓ ${want} went red on its own assertion${own.length > 1 ? `s (${own.length})` : ''}:`);
  for (const t of own) console.log(`    ${t.name}${t.message ? `\n      ${t.message.slice(0, 160)}` : ''}`);
  const notOwn = failed.length - own.length;
  if (notOwn) console.error(`  note: ${notOwn} other failure(s) in it were not its own assertion (a hook, or a thrown error)`);
  if (f.errors.length) console.error(`  note: the file also reported: ${f.errors.join(' | ').slice(0, 200)}`);
  if (skipped.length) console.error(`  note: ${skipped.length} test(s) in it never ran`);
  if (othersRed.length) console.error(`  note: other file(s) also went red: ${othersRed.join(', ')} (the break may be broader than the defect)`);
  process.exit(0);
}

if (failed.length) {
  console.error(`✗ ${want} went red, but NOT on its own assertion: red for the wrong reason:`);
  for (const t of failed) console.error(`    ${t.name}: ${t.hook ? `the ${t.hook} failed, so the test body never counted` : 'not an assertion'}${t.message ? ` (${t.message.slice(0, 120)})` : ''}`);
  console.error('  A break that stops the code running, or fails a hook, proves nothing about the check. Narrow it.');
  process.exit(4);
}
if (f.errors.length) {
  console.error(`✗ ${want} went red, but NO TEST FAILED: a hook, fixture or statement outside every test failed:`);
  for (const e of f.errors) console.error(`    ${e.slice(0, 180)}`);
  console.error(`  ${skipped.length} of ${tests.length} test(s) never ran. This is not "passed on the broken state".`);
  process.exit(4);
}
if (skipped.length === tests.length) {
  console.error(`✗ ${want} ran, but all ${tests.length} of its test(s) were skipped: nothing looked.`);
  process.exit(5);
}
console.error(`✗ ${want} PASSED on the broken state. The check does not bind: you are measuring something else.`);
process.exit(1);
