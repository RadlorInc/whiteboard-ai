#!/usr/bin/env bash
#
# CHECK THE CHECKER (PLAN.md §3 M0, "break-check self-test"). Runs one REAL break per verdict break-check.sh claims to
# tell apart, for each runner, and asserts the exit code it comes back with, the line the verdict must print, and
# that the working tree came back byte-identical. Ported from Radlic's scripts/break-live.sh, 12 Oct 2026.
#
#   scripts/break-selftest.sh            (npm run break:selftest; a few minutes; port 3100 must be free)
#   SELFTEST_DB_RESET=1 scripts/break-selftest.sh   also the schema-break case, which RESETS THE LOCAL DATABASE
#
# Live breaks, not crafted report fixtures: a fixture encodes a runner's report shape on the day it was written and
# keeps passing after an upgrade changes it. Re-run this after upgrading Vitest, Playwright or the Supabase CLI.
#
# The two cases the plan names: a planted always-red test is reported red (exit 0), and a test that fails in
# beforeEach is NOT counted as the named assertion (exit 4), for Vitest and for Playwright.

set -uo pipefail
cd "$(dirname "$0")/.."
PASS=0; FAIL=0; SKIP=0
OUT="$(mktemp -t break-selftest)"
trap 'rm -f "$OUT"' EXIT

fingerprint() { git ls-files -z --cached --others --exclude-standard | xargs -0 shasum 2>&1 | shasum | cut -d' ' -f1; }
BEFORE="$(fingerprint)"

# run <want exit> <what> <check file> <break> <text the verdict must print> [runner args…]
run() {
  local want="$1" what="$2" target="$3" brk="$4" says="$5"; shift 5
  printf '── want %s: %s\n' "$want" "$what"
  scripts/break-check.sh "$target" "$brk" "$@" >"$OUT" 2>&1
  local got=$? ok=1
  [ "$got" = "$want" ] || { echo "   ✗ exit $got, wanted $want"; sed -nE '/^(✗|✓)/p' "$OUT" | head -3 | sed 's/^/     /'; ok=0; }
  # Only the verdict's own lines (from its ✗/✓ on), so text the runner printed cannot satisfy it.
  [ -z "$says" ] || sed -nE '/^(✗|✓)/,$p' "$OUT" | grep -qF -- "$says" || { echo "   ✗ the verdict never said: $says"; ok=0; }
  grep -q 'your tree is byte-identical' "$OUT" || { echo "   ✗ break-check did not report the tree byte-identical"; ok=0; }
  [ "$(fingerprint)" = "$BEFORE" ] || { echo "   ✗ THE TREE CHANGED"; ok=0; }
  ls -d "$HOME"/.cache/wb-break.* >/dev/null 2>&1 && { echo "   ✗ a break-check copy was left in ~/.cache"; ok=0; }
  if [ "$ok" = 1 ]; then echo "   ✓ exit $got"; PASS=$((PASS + 1)); else FAIL=$((FAIL + 1)); echo "   (full output: re-run the case by hand)"; fi
}

# ---------- Vitest: scripts/secret-scan.test.mjs, which tests scripts/secret-scan.mjs ----------
T=scripts/secret-scan.test.mjs; E=scripts/secret-scan.mjs

run 0 "vitest: the check binds (the Anthropic pattern narrowed)" $T \
  "perl -pi -e 's/sk-ant-\[A-Za-z0-9_-\]\{20,\}/sk-ant-[A-Z]{20,}/' $E" \
  "finds a planted anthropic key on its line"

run 0 "vitest: a planted always-red test is reported red" $T \
  "printf '%s\n' \"test('PLANTED_ALWAYS_RED', () => { expect(1).toBe(2); });\" >> $T" \
  "PLANTED_ALWAYS_RED"

run 4 "vitest: a test that fails in beforeEach is NOT its own assertion" $T \
  "perl -0pi -e \"s/^import \\{ describe, test, expect \\} from 'vitest';/import { describe, test, expect, beforeEach } from 'vitest';\\nbeforeEach(() => { expect('PLANTED_BEFORE_EACH').toBe('ok'); });/m\" $T" \
  "the beforeEach failed"

run 1 "vitest: the check does not bind (a change it cannot see)" $T \
  "perl -pi -e 's/^\/\/ Secret scan\. /\/\/ Secret scan (edited). /' $E" \
  "PASSED on the broken state"

run 3 "vitest: the break edited nothing (its pattern drifted)" $T \
  "perl -pi -e 's/PATTERN_THAT_MOVED_LONG_AGO/x/' $E" ""

run 4 "vitest: red for the wrong reason (the code under test stops parsing)" $T \
  "printf 'this is not javascript(((\n' >> $E" \
  "WITHOUT RUNNING A TEST"

run 4 "vitest: red for the wrong reason (a thrown error, not an assertion)" $T \
  "printf '%s\n' \"test('PLANTED_THROW', () => { throw new TypeError('boom'); });\" >> $T" \
  "PLANTED_THROW: not an assertion"

run 4 "vitest: red because a file-level beforeAll threw (every test skipped)" $T \
  "perl -0pi -e \"s/^import \\{ describe, test, expect \\} from 'vitest';/import { describe, test, expect, beforeAll } from 'vitest';\\nbeforeAll(() => { throw new Error('PLANTED_BEFORE_ALL'); });/m\" $T" \
  "PLANTED_BEFORE_ALL"

run 5 "vitest: every test skipped (nothing looked)" $T \
  "perl -0pi -e 's/^describe\(/describe.skip(/mg' $T" \
  "were skipped"

run 5 "vitest: no report at all (the config is broken)" $T \
  "printf 'this is not typescript(((\n' >> vitest.config.mts" \
  "no report"

# ---------- pgTAP: fixture files the break creates (there are no pgTAP tests in M0) ----------
P=supabase/tests/zz_break_selftest.test.sql
tap() { printf "mkdir -p supabase/tests && printf '%%s\\\\n' %s > $P" "$1"; }

run 0 "pgTAP: a planted always-red assertion is reported red" $P \
  "$(tap "'begin;' 'select plan(2);' \"select ok(true, 'fine');\" \"select is(1, 2, 'PLANTED_TAP_RED');\" 'select * from finish();' 'rollback;'")" \
  "PLANTED_TAP_RED"

run 1 "pgTAP: a green file is reported as not binding" $P \
  "$(tap "'begin;' 'select plan(1);' \"select ok(true, 'fine');\" 'select * from finish();' 'rollback;'")" \
  "PASSED on the broken state"

run 4 "pgTAP: an SQL error before the assertion is not an assertion" $P \
  "$(tap "'begin;' 'select plan(2);' \"select ok(true, 'fine');\" 'insert into planted_no_such_table values (1);' \"select is(1, 2, 'never reached');\" 'select * from finish();' 'rollback;'")" \
  "NO TEST FAILED"

if [ "${SELFTEST_DB_RESET:-0}" = 1 ]; then
  run 0 "pgTAP: a schema break is applied to the local DB, then the DB is reset from your tree" $P \
    "printf 'create table public.planted_selftest (id int);\n' > supabase/migrations/29991231000000_planted_selftest.sql && $(tap "'begin;' 'select plan(1);' \"select hasnt_table('public', 'planted_selftest', 'PLANTED_TABLE_ABSENT');\" 'select * from finish();' 'rollback;'")" \
    "PLANTED_TABLE_ABSENT"
  left="$(docker exec supabase_db_whiteboard-ai psql -U postgres -d postgres -tAc "select to_regclass('public.planted_selftest')" 2>&1)"
  if [ -z "$left" ]; then echo "   ✓ the planted table is gone from the local DB"; PASS=$((PASS + 1)); else echo "   ✗ the local DB was not restored: $left"; FAIL=$((FAIL + 1)); fi
else
  echo "── skipped: the schema-break case resets the local database (SELFTEST_DB_RESET=1 runs it)"; SKIP=$((SKIP + 1))
fi

# ---------- Playwright: e2e/home.spec.ts, one project to keep it short ----------
W=e2e/home.spec.ts
run 0 "playwright: the check binds (the page shows another name)" $W \
  "perl -pi -e 's/PRODUCT_NAME = \"Whiteboard AI\"/PRODUCT_NAME = \"Planted Name\"/' src/product.ts" \
  "went red on its own assertion" --project=chromium-desktop

run 4 "playwright: a test that fails in beforeEach is NOT its own assertion" $W \
  "perl -0pi -e 's/^(import \{ test, expect \} from \"\@playwright\/test\";)/\$1\ntest.beforeEach(async () => { expect(\"PLANTED_BEFORE_EACH\").toBe(\"ok\"); });/m' $W" \
  "the beforeEach hook failed" --project=chromium-desktop

run 1 "playwright: the check does not bind (a change it cannot see)" $W \
  "perl -pi -e 's/^\/\/ Placeholder home page/\/\/ Placeholder (edited) home page/' src/app/page.tsx" \
  "PASSED on the broken state" --project=chromium-desktop

echo
echo "── $PASS passed, $FAIL failed, $SKIP skipped"
[ "$FAIL" = 0 ] || exit 1
