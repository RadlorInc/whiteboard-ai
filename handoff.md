# Handoff: Whiteboard AI app

**Current state and open items only. Under 15 KB.** Delete an item when it is done. The spec is
`../app-plan/PLAN.md` (build order §3); how to run things is in `README.md`.

**Before going live: [LAUNCH.md](LAUNCH.md)** — the checklist of what was left for launch (migration + merge order, keep-warm, Stripe, legal).

## Production (12 Oct 2026, end of day)

- **Live** on Vercel (project `whiteboard-ai`, Production env only) against its own Supabase project. The project ref
  is NOT in this public repo: it is the `PROD_PROJECT_REF` variable on the GitHub `production-db` environment.
- Migrations reach production only through `.github/workflows/migrate-prod.yml` (manual dispatch, typed confirmation,
  `production-db` approval — measured: the run waits for the founder). Never seeds. Never link the CLI locally.
- Auth settings live in the Supabase dashboard (config.toml is local only): Site URL, redirect `/auth/callback`,
  code templates (**both** Magic Link and Confirm signup = `supabase/templates/*.html`; 13 Oct production's Magic Link
  still had the default link, so returning users on a new device got a link), OTP expiry 600, **Email OTP Length must equal NEXT_PUBLIC_OTP_LENGTH (6)** — hosted defaults to 8.
- Production env names (values in Vercel): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, APP_URL,
  SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET, AGE_COOKIE_KEY, RATE_LIMIT_HMAC_KEY, ANTHROPIC_API_KEY.
- Bootstrapping an admin on a fresh project (the founder runs SQL in the dashboard; agents never query production):
  `insert into public.invites (code, max_uses, note) values ('<CODE>', 1, 'founder bootstrap');` → sign up with it →
  `insert into public.admins (user_id) select p.id from public.profiles p join auth.users u on u.id = p.id where
  u.email = '<email>' and p.deleted_at is null returning user_id;` (expect 1 row) → /admin enrols an authenticator.
- CI (`ci.yml`) is green on main. The repo is public while we build; it goes private at launch.
- Not yet: Stripe keys (checkout answers 503), Resend SMTP (Supabase's built-in mail sends few codes an hour),
  Vercel Cron for keep-warm (no `vercel.json` crons yet), Turnstile.

## Where things stand (12 Oct 2026, evening)

Everything runs locally too (project_id `whiteboard-ai`). Dev server: `npm run dev` (port 3100); `GENERATION_MOCK=1 npm run dev` = fake model, no spend.

- **M0 foundation, M1 database, M2 auth/shell, M3 generation server: built.** 11 migrations apply on `supabase db reset`;
  `supabase test db` 8 files / 1,054 pgTAP tests pass; `npx vitest run` 147 pass (4 skipped = opt-in local-DB files);
  `WB_LOCAL_DB=1 npx vitest run tests/billing tests/db tests/generation/localdb.test.ts` 23 pass. tsc and eslint clean.
- **M4 (core):** players reused from `public/player/` in `<iframe sandbox="allow-scripts">` fed by `bridge.js`
  (postMessage; whiteboard streams step by step; paper/match-cut play the finished script). Player CSP in
  `next.config.ts`: no network, framed only by our origin. A sandboxed frame has an opaque origin, so the CSP names the
  app origin (APP_URL) instead of 'self' — with 'self' nothing ran (measured in Chromium and WebKit). Players start
  blank. Pages: `/ask` (streams + transcript + "already own this" → watch free or make new), `/library`,
  `/videos/[id]` (replay free, share, unshare, delete). Seen in real Chromium at 1280×800 and 320×568, no sideways scroll.
  The Claude desktop browser pane does not run scripts in sandboxed iframes: test players in Chrome or Playwright.
- **M5 (core):** `/buy`, `/buy/success`, `POST /api/billing/checkout` (Checkout; links the Stripe customer; 403 for
  uninvited), `POST /api/billing/portal`, `POST /api/stripe/webhook` (signature-verified, one DEFINER function per
  event, DB error → 500 so Stripe retries). `tests/billing/webhook.test.ts` signs events with a local secret: pack
  granted once even when replayed, forged signature → 400 and no change, wrong amount → needs_review and no credits
  (watched red with verification removed). No Stripe keys exist: checkout answers 503 payments_not_configured.
- **M6 (core):** share page `/v/[slug]` (no login, noindex, no owner identity; revoke → 404, driven end to end),
  `/account` with credits, billing portal, data export (`GET /api/account/export`), delete account.
- **M7:** one live answer per style through the app (12 Oct): whiteboard vaccine 3 credits $0.160 (cold cache) 26 s;
  paper seed 4 credits $0.056 13 s; match-cut bicycles 3 credits $0.138 (cold) 45 s. All charged ceil(chars/150).

- **Also built (12 Oct, late):** `/admin` (admins row + authenticator code each sign-in: `/admin/mfa` enrols TOTP;
  today's spend vs cap, made/failed counts, ledger-drift check, top missing drawings; audited switches for making
  videos and purchases, credit grants, invite codes), `/api/health` and `/api/health/db` (booleans), legal beta drafts
  in `src/content/legal.ts` (banner: not yet reviewed by a lawyer), `/pricing`, `/help`, `/contact`
  (`NEXT_PUBLIC_SUPPORT_EMAIL`), web manifest, 6-digit code email templates + 10-minute codes, local TOTP on.
- **Committed e2e** (`npx playwright test`, mock model, global setup clears local OTP limits): the core loop (ask →
  4 credits → library → share → signed-out view → unshare → 404; watched red with unshare made a no-op), signed-out
  redirects, `/admin` 404 for a normal user, the admin TOTP enrolment + an audited 5-credit grant, no sideways scroll on
  public pages. 11 pass, 4 skipped by design (one-project tests), twice in a row. Run `npm run test:pgtap` (it resets
  the DB first: the pgTAP counts assume fresh seed data). `.github/workflows/ci.yml` runs everything once the repo exists.

- **Security review (12 Oct, late)** — probed, not assumed:
  - Database as anon and as user B (`supabase-js` against the local stack): 40 probes all blocked — reading A's rows,
    writing the ledger/balances/admins/profile access, admin, Stripe, money and deletion functions, the voice bucket.
    Positive twins: B reads its own balance, profile and ledger.
  - API routes: no session → 401, another origin → 403, forged or missing Stripe signature → 400, cron without the
    secret → 401, health answers booleans only. `e2e/idor.spec.ts`: B gets 404 on A's video page and poll (watched red
    with the owner filter removed).
  - **Fixed an XSS:** the player loaders wrote `?cat=` / `?gallery=` into `document.write` unescaped, so a crafted
    `/player/index.html?cat=…` link ran script on our origin, where the Supabase session cookies are readable
    (`e2e/player-xss.spec.ts` showed "PWNED:true"). Removed the parameters from the app copies, removed the developer
    gallery/shot/names files from `public/player`, and added CSP `sandbox allow-scripts` to every player page so even a
    future injection runs in an opaque origin with no cookies. The prototype keeps the gallery (this machine only).
  - `server-only` guards on every module holding a server key; npm audit (production deps): 0; headers: nonce CSP,
    HSTS, X-Frame-Options DENY, nosniff; `next=` accepts only same-site paths.

## Voice: Pocket TTS in the browser (live since 13 Oct 2026, #5, #7)

- Pocket TTS (Kyutai) on the CPU, one engine everywhere (Kokoro crashed iPhones). `src/lib/voice.ts` starts
  `public/tts/pocket-worker.js` (KevinAHM's Apache-2.0 worker, our changes marked "Radlor:"). First visit ~166 MB:
  7 model files pinned at `d0c0c79` + our `public/tts/pocket-voices.bin`, size- and SHA-256-checked
  (`public/tts/pocket-files.mjs`), kept in OPFS, or Cache Storage where OPFS is missing (#7), or memory. ONNX Runtime
  1.20.0, one thread, + sentencepiece.js in `public/tts/vendor` (`npm run vendor:tts`).
- **Voices:** 6 of the 8 — cosette (Expresso) and jean (EARS) are CC BY-NC, so `scripts/pocket-voices.mjs` builds
  our voices file without them; `tests/voice/pocket-files.test.ts` fails if a non-commercial voice is offered or
  shipped (watched red on the 8-voice file). Credits (CC BY) are on the Copyright page.
- **Security change:** `/tts/*` CSP gains `'unsafe-eval'` (the tokenizer's emscripten embind uses Function()); the
  worker's CSP only, no DOM. A tokenizer without eval would let us drop it.
- Not yet: the first iPhone run of the app itself (preview), iOS's 7-day storage eviction (a home-screen app is
  exempt), a second download source (R2), the attorney's look at CC BY credits (no espeak/GPL any more).

## Explore and reports (live since 13 Oct 2026, #1; migration applied by migrate-prod)

- Founder's decisions: a public feed at `/explore`, open without signing in (noindex for now); a video goes there
  only by its maker's choice — "Show in Explore" on /ask, **ticked by default**, plus Show/Remove on the video page;
  13–17 the same as adults.
- An Explore item is a share with `shares.explore_at` set (migration `20261013001200_explore.sql`). **Security
  change:** DEFINER `set_explore(uuid, boolean)` (authenticated; owner only, goes through `create_share`, so the
  contact-info refusal and 20-a-day limit apply) and `explore_list(timestamptz, integer)` (anon; slug, question,
  style, explore_at — never an owner or generation id). Stop sharing, delete, account deletion and the new admin
  form "Take a video off Explore" (`admin_unpublish_share`, audited) all remove it. Header and home page link it.
- **Report this video** under every /v page (signed in or not; `submit_report`, 5 a day per visitor by IP HMAC,
  `src/app/v/[slug]/actions.ts`). /admin lists open reports: "Take off Explore and resolve" or "Keep and resolve"
  (both audited). e2e checks the report row really exists (watched red with a thanks that stored nothing).
- Terms, Privacy and Acceptable use (`src/content/legal.ts`, still beta drafts) now describe Explore (default-on,
  public, 13–17 included, never the maker), reports (a scrambled IP is kept), and the voice (made on the device; the
  model comes from Hugging Face, which sees the IP). **The terms version was not bumped** — the re-acceptance flow
  (`/legal/accept`) is not built; the attorney review and the version bump go together.
- **Before production:** the attorney reviews those texts; no question screening exists yet (the decline policy),
  so reports + the admin form are the only brake.

## Invite credits (13 Oct 2026)

- Founder's ask: whoever gets access with an invite code gets **100 credits automatically**. `redeem_invite` writes
  one `invite_grant` ledger row (+100 top-up, no expiry) when it turns access on for the first time; a unique index
  keeps it to once per user; admin-granted access and a second code give nothing. Not retroactive. Invite credits do
  not count as "ever paid" (`src/lib/session.ts`). Migration `20261013001300_invite_credits.sql` (security change:
  redefines DEFINER `redeem_invite`); pgTAP `35_invite_credits` (watched red with the grant removed);
  `tests/db/invite.test.mjs` drives it as the user. `tests/db/stack.mjs newUser` now sets access directly unless
  `{ invite: true }`, so money tests still start at zero.
- Flaky, not new: e2e `signed-out pages …` on WebKit sometimes fails under the full suite ("navigation interrupted"
  by the previous redirect); alone it passed 6/6 on this branch and on main.


- **Not built yet:** emails beyond sign-in codes: digest, alerts, outbox (needs
  Resend), the decline policy in the prompt + red-team run (a new prompt sha; ~$3 live), OG images, parent email for
  13–17 payers (C13), Turnstile captcha (needs a site key), `/api/telemetry`, per-category library loading, streaming
  for paper and match-cut, `/legal/accept` re-acceptance.
- Admin "missing drawings" on the local stack lists primitives (arrow, circle, line, path, text ×17) from mock runs;
  production showed None. Check whether the mock (or the miss counter) records primitives as misses.
- Paper and match-cut do not stream (they play when the script is done); match-cut took 45 s.
- The founder decides the first commit; accounts to create are PLAN.md §2 E1–E18.


- The break-check self-test's schema case (a migration break, then `supabase db reset --local` from your tree) has
  never run: it wipes the local DB. Run `SELFTEST_DB_RESET=1 npm run break:selftest` once when nothing else uses the
  stack.
- `.env.local` still uses older names (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `NEXT_PUBLIC_SITE_URL`) where §14 says `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `APP_URL`.
  Nothing reads them yet; rename them (founder, or the first milestone that reads them) to match `.env.example`.
- gitleaks is not installed, so `scripts/secret-scan.mjs` stands in (Anthropic, Stripe secret/restricted/webhook,
  Supabase secret, any JWT). It does not know ElevenLabs or Resend key shapes. In CI (M8) run gitleaks too, and turn
  on GitHub secret scanning and push protection when the private repo exists (E2).
- `player-src/` still contains the prototype's HTML sinks (`innerHTML`, `document.write` in `lib/*-load.js`). M4's
  no-HTML-sinks gate must reach zero before anything there is served.
- `break-check.sh` clones `node_modules` with `cp -c` (APFS) for e2e copies, because Turbopack rejects a symlinked
  `node_modules` outside the project. Linux CI (M8) needs another way (`cp --reflink=auto`, or a real install).

## Local demo

- `GENERATION_MOCK=1 npm run dev` (no API spend; credits are the local seed users'). Sign in as `b@example.test`
  with the code from Mailpit (`127.0.0.1:55324`). Use Chrome.
- Parked: local branch `paper-stream` (paper plays as it streams; e2e watched red). On the local stack,
  `admin.spec.ts` fails past 50 users (it reads only the first `listUsers` page), and `tests/db` needs a fresh
  `supabase db reset`.

## Subjects: own prompt + library per chat subject (18 Oct 2026, PR #17, on top of #16)

- `build-prompts.mjs` → `prompts.json` `subjects.*` = `{system, sha256, cats}`. The rules and examples are the plain
  prompt's; the categories are only the subject's (+ `diagrams`), plus a "- Teaching <subject>:" rule.
  - The plain prompt is unchanged (`332e6d…`) and is used outside a chat.
  - The subject shas are bound in `prompts.test.ts`.
- The chat's subject picks:
  - the `prompt_sha` (`promptSha(style, subject)`), so reserve and cost rows carry it;
  - `prefix(style, subject)`;
  - the `find_drawing` categories.
- Keep-warm covers 6 prompts (`PROMPTS`). No migration: `prompt_cache_state` is keyed by `prompt_sha`.
- Each subject prompt is ~10k tokens, so a cold write is ~$0.08 (estimated). Keeping all three warm costs
  ~$0.17/day.
- Biology library: `lib/wb/biology.*`, listed as `WB_EXTRA` in `wb-load.js`. The player loads it; only the biology
  prompt lists it.
  - Drawings: heartsection, circulation, breathing, gut, reflexarc, dnaladder, cellcycle, leafsection, plantparts.
  - All labelled by default (`lab=0` hides the words), drawn polished (`.polished`: no wobble or watercolour).
- Proof: biology-chat tests in `run.test.ts` and `localdb.test.ts`, and the mock "How does blood travel around the
  body?" plays to the end.
- **Next:** physics, then chemistry, the same way.
