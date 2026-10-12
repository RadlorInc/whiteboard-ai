#!/usr/bin/env bash
#
# Run one check against a DELIBERATELY BROKEN COPY of the tree, prove the red comes from that check's own assertion,
# and throw the copy away. Your working tree is never edited, stashed, checked out or restored: it is only read.
#
#   scripts/break-check.sh <check file expected to go red> '<shell command that applies the break>' [runner args…]
#
# The break runs with the copy as its working directory, so write paths from the app root:
#   scripts/break-check.sh scripts/secret-scan.test.mjs \
#     "perl -pi -e 's/sk-ant-\[/sk-anthropic-[/' scripts/secret-scan.mjs"
#
# Which runner: *.sql → pgTAP (`supabase test db`); e2e/* → Playwright; anything else → Vitest.
#
# Ported from Radlic's scripts/break-check.sh on 12 Oct 2026. What changed, and why:
#   - A COPY, NOT A GIT WORKTREE OR A STASH. This repo has no commits yet, and Radlic lost uncommitted work four
#     times to the stash version. The copy holds every file git does not ignore, uncommitted ones included, so the
#     check under test is the one you are looking at. .env.local is symlinked in, never copied; node_modules is symlinked (an APFS clone for e2e).
#   - THE COPY LIVES UNDER $HOME/.cache, not /tmp: colima (the Docker here) only mounts $HOME, and `supabase test db`
#     runs pg_prove in a container that must see the test files (measured 12 Oct: under /tmp it found 0 files).
#   - PLAYWRIGHT IS VERIFIED TOO. Radlic's e2e path was blind because its dev server served the unbroken tree; here
#     Playwright's webServer starts `npm run dev` INSIDE the copy. Port 3100 must be free (so the spec cannot reach
#     your own dev server), and CI=1 stops Playwright reusing one.
#   - pgTAP: if the break touches supabase/migrations, seed.sql or config.toml, the copy's schema is applied with
#     `supabase db reset --local` before the test, and the trap resets the local DB from YOUR tree afterwards.
#     That wipes the local stack's data (it is throwaway). Never run two DB break-checks at once.
#   - A TEST THAT FAILS IN beforeEach DOES NOT COUNT (Radlic's known hole). See break-reporter.mjs.
#
# Exit codes are about THE CHECK, not the runner (0 means "your check binds"):
#   0  the named file went red on its own assertion
#   1  the named file passed on the broken copy          → the check is decorative
#   2  usage, or the copy could not be set up
#   3  the break changed nothing                         → nothing was tested (the pattern drifted?)
#   4  the named file went red, not on its own assertion → red for the wrong reason (did not load, a hook or
#      fixture failed, a thrown error, a timeout, an SQL error)
#   5  the run never reached the named file, or skipped every test in it → nothing was tested
#
# ⚠️ `npm run break -- <file> '<break>'` can mangle quotes inside the break; call this script directly if it does.
# ⚠️ After upgrading Vitest, Playwright or the Supabase CLI, run `npm run break:selftest` before trusting a verdict.

set -uo pipefail
cd "$(dirname "$0")/.."
REPO="$(pwd)"

[ $# -ge 2 ] || { echo "usage: $0 <check file expected to go red> '<break command>' [runner args…]" >&2; exit 2; }
TARGET="$1"; shift
BREAK="$1"; shift
case "$TARGET" in
  *.sql) KIND=tap ;;
  e2e/*) KIND=playwright ;;
  *) KIND=vitest ;;
esac

# Every file git does not ignore, as bytes: the tree before and after must be identical.
listed() { git ls-files -z --cached --others --exclude-standard; }
fingerprint() { listed | xargs -0 shasum 2>&1; }
git rev-parse --git-dir >/dev/null 2>&1 || { echo "✗ $REPO is not a git repository: cannot tell which files make up the tree" >&2; exit 2; }

if [ "$KIND" = playwright ] && lsof -nP -iTCP:3100 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "✗ port 3100 is in use. Stop your dev server first: the spec would test YOUR tree, not the broken copy." >&2
  exit 2
fi

BEFORE="$(fingerprint)"
mkdir -p "$HOME/.cache"
WORK="$(mktemp -d "$HOME/.cache/wb-break.XXXXXX")" || { echo "could not make a temp dir" >&2; exit 2; }
TREE="$WORK/tree"
DB_RESET=0

cleanup() {
  local rc=$?
  cd "$REPO" || return
  if [ "$DB_RESET" = 1 ]; then
    echo "· restoring the local database from your tree: supabase db reset --local"
    supabase db reset --local >"$WORK/restore.log" 2>&1 \
      || { echo "⚠️⚠️  THE LOCAL DB RESET FAILED. Run 'supabase db reset --local' here yourself. Log:" >&2; tail -20 "$WORK/restore.log" >&2; }
  fi
  rm -rf "$WORK"
  echo
  local after; after="$(fingerprint)"
  if [ "$after" = "$BEFORE" ]; then
    echo "--- your tree is byte-identical to when this started (the break ran in a copy) ---"
  else
    echo "⚠️⚠️  YOUR TREE CHANGED while this ran. The break ran in a copy, so something else wrote to it. Check 'git status'." >&2
    diff <(echo "$BEFORE") <(echo "$after") | sed -n "s/^\([<>]\) [0-9a-f]*  /  \1 /p" >&2
  fi
  exit $rc
}
trap cleanup EXIT INT TERM

mkdir -p "$TREE"
# Copy the tree: every listed file that exists (a deleted tracked file is listed but not there).
listed | while IFS= read -r -d '' f; do [ -e "$f" ] && printf '%s\0' "$f"; done \
  | tar --null -T - -cf - | tar -xpf - -C "$TREE" || { echo "✗ could not copy the tree" >&2; exit 2; }
if [ "$KIND" = playwright ]; then
  # Turbopack refuses a node_modules symlink that points outside the project ("Symlink [project]/node_modules is
  # invalid, it points out of the filesystem root", measured 12 Oct), so the e2e copy gets an APFS clone (cp -c:
  # copy-on-write, about 5 s, no extra disk).
  cp -cR "$REPO/node_modules" "$TREE/node_modules" || { echo "✗ could not clone node_modules (cp -c needs APFS)" >&2; exit 2; }
else
  ln -s "$REPO/node_modules" "$TREE/node_modules"
fi
[ -e "$REPO/.env.local" ] && ln -s "$REPO/.env.local" "$TREE/.env.local"
# The verdict and the reporter run from outside the copy, so a break in scripts/ cannot break them.
cp scripts/break-verdict.mjs "$WORK/verdict.mjs"
cp scripts/break-reporter.mjs "$WORK/reporter.mjs"
cd "$TREE"

copyprint() { find . -path ./node_modules -prune -o -path ./.next -prune -o -path ./.env.local -prune -o -type f -print0 | sort -z | xargs -0 shasum | shasum; }
dbprint() { cat supabase/config.toml supabase/seed.sql supabase/migrations/* 2>/dev/null | shasum; }
COPY_BEFORE="$(copyprint)"; DB_BEFORE="$(dbprint)"

echo "· copy of your tree: $TREE (your tree is not touched)"
echo "· applying break: $BREAK"
eval "$BREAK"

if [ "$(copyprint)" = "$COPY_BEFORE" ]; then
  echo "✗ the break changed nothing (its pattern no longer matches?). Nothing was tested." >&2
  exit 3
fi
[ -f "$TARGET" ] || { echo "✗ no such check file in the broken copy: $TARGET" >&2; exit 2; }

REPORT="$WORK/report"
case "$KIND" in
  vitest)
    echo "· running: npx vitest run $TARGET $*"
    BREAK_REPORT="$REPORT" npx vitest run "$TARGET" "$@" --reporter=default --reporter="$WORK/reporter.mjs"
    ;;
  playwright)
    echo "· running: npx playwright test $TARGET $* (its dev server runs in the copy)"
    CI=1 BREAK_REPORT="$REPORT" npx playwright test "$TARGET" "$@" --reporter="list,$WORK/reporter.mjs"
    ;;
  tap)
    if [ "$(dbprint)" != "$DB_BEFORE" ]; then
      DB_RESET=1
      echo "· the break changed the schema: supabase db reset --local from the copy (the trap resets it from your tree)"
      supabase db reset --local >"$WORK/reset.log" 2>&1 || { echo "✗ the broken schema did not apply; nothing was tested:" >&2; tail -20 "$WORK/reset.log" >&2; exit 4; }
    fi
    echo "· running: supabase test db --local $TARGET $*"
    supabase test db --local "$TARGET" "$@" 2>&1 | tee "$REPORT"
    ;;
esac
echo
node "$WORK/verdict.mjs" "$KIND" "$REPORT" "$TARGET"
