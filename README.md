# Whiteboard AI (working name)

A paid web app: type a question, watch a voiced animation drawn live in the browser. Next 16 App Router, Supabase,
Stripe, Claude Opus 5.5. **The spec is `../app-plan/PLAN.md`**; its build order is §3. Where things stand:
[`handoff.md`](handoff.md). What to do when something breaks: [`RUNBOOK.md`](RUNBOOK.md).

## Rules that are not negotiable

- **Local only.** The Supabase CLI is for the local stack. Never `supabase link`, never `--linked`, `--project-ref`
  or a `--db-url` that is not the local stack. If `supabase/.temp/project-ref` exists, run `supabase unlink` and say
  so. The agent never queries a production database.
- **Keys live in `.env.local`** (git-ignored) and in Vercel. Never print one, never put one in another file:
  `npm run lint:secrets` and the pre-commit hook fail on anything that looks like a key.
- **No live model calls by default.** `GENERATION_MOCK=1` replays hand-made answers; `WB_LIVE=1` with a real key costs
  money and is manual (§12.6).
- **The prototype (`../prototype`) is frozen.** The drawing library now lives in [`player-src/`](player-src/README.md).

## Run it from a clean clone

Needs Node 26 (measured on v26.0.0), Docker (colima works), and the Supabase CLI (measured on 2.116.0).

```bash
npm ci                                  # .npmrc sets ignore-scripts=true: no package runs an install script
git config core.hooksPath .githooks     # once per clone: the pre-commit secret scan
supabase start                          # the local stack: API 55321, DB 55322, Studio 55323, Mailpit 55324
test ! -e supabase/.temp/project-ref || echo "LINKED: run 'supabase unlink' first"
cp .env.example .env.local              # then fill it in:
supabase status -o env                  #   API_URL → NEXT_PUBLIC_SUPABASE_URL, PUBLISHABLE_KEY →
                                        #   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SECRET_KEY → SUPABASE_SECRET_KEY;
                                        #   APP_URL=http://localhost:3100, GENERATION_MOCK=1
npm run dev                             # http://localhost:3100
```

For the e2e tests, once: `npx playwright install chromium webkit` (the browser builds Playwright 1.63.0 pins).

## Checks

| Command | What |
|---|---|
| `npm test` | Vitest unit tests (`src/`, `scripts/`, `tests/`; `vitest.config.mts`) |
| `npm run test:db` | pgTAP: `supabase test db --local` over `supabase/tests/` (needs `supabase start`) |
| `npm run test:e2e` | Playwright (`e2e/`): Chromium 1440×900, Chromium mobile 320×568, WebKit. Starts `npm run dev` itself, or reuses one already on 3100 |
| `npm run lint` | ESLint |
| `npm run lint:secrets` | `scripts/secret-scan.mjs` over every file git does not ignore. Exit 0 clean, 1 found, 2 could not look |
| `npm run break -- <check> '<break>'` | `scripts/break-check.sh`: runs one check against a broken copy of the tree and says whether it went red on its own assertion |
| `npm run break:selftest` | Checks the checker: one real break per verdict, for Vitest, pgTAP and Playwright |

**A check counts only once it has been watched failing for the right reason** (§12.1). Plant the defect with
`scripts/break-check.sh`, never by hand:

```bash
scripts/break-check.sh scripts/secret-scan.test.mjs \
  "perl -pi -e 's/sk-ant-\[A-Za-z0-9_-\]\{20,\}/sk-ant-[A-Z]{20,}/' scripts/secret-scan.mjs"
```

It copies every file git does not ignore (uncommitted work included) to `~/.cache/wb-break.*`, applies the break
there, runs the check, and exits 0 only if the named file failed on **its own assertion**: not a load error, not a
hook (a `beforeEach` that fails does not count), not a thrown error, not a timeout, not an SQL error. Exit codes and
the details are in the script's header. For an e2e check, stop your dev server first (port 3100 must be free).

## Layout

| Path | What |
|---|---|
| `src/app/` | Next 16 App Router pages and routes. Read `node_modules/next/dist/docs/` before writing one (AGENTS.md) |
| `src/product.ts` | `PRODUCT_NAME`, the one place the working name lives (A1) |
| `supabase/` | `config.toml` (local stack), `migrations/`, `seed.sql`, `tests/` (pgTAP) |
| `player-src/` | The drawing library and the three players' sources, copied from the prototype (M0). Not served until M4 |
| `e2e/` | Playwright specs |
| `scripts/` | `break-check.sh`, `break-verdict.mjs`, `break-reporter.mjs`, `break-selftest.sh`, `secret-scan.mjs` |
| `.githooks/pre-commit` | Runs the secret scan on what is being committed |
