# Handoff: askRadlor (repo and Vercel project still named whiteboard-ai)

**Current state and open items only. Under 15 KB.** Delete an item when it is done. The spec is
`../app-plan/PLAN.md` (build order §3); how to run things is in `README.md`; the business plan is `../STRATEGY.md`.

**Before and after going live: [LAUNCH.md](LAUNCH.md)** (Stripe, legal, first-days checks, Greek fonts in Safari).

## Production (beta live; last deploy #36, 22 Oct 2026)

- Vercel project `whiteboard-ai` (Production env only) against its own Supabase project. The project ref is NOT in
  this public repo: it is `PROD_PROJECT_REF` on the GitHub `production-db` environment. Agents never query or write
  production: the founder pastes SQL into the dashboard (`sql/`, `../sql/usage-per-video.sql`).
- Migrations reach production only through `.github/workflows/migrate-prod.yml` (manual dispatch, typed project
  ref, `production-db` approval), **from `main` only**. Never seeds. Never link the CLI locally.
- Auth settings live in the Supabase dashboard: Site URL, redirect `/auth/callback`, code templates (Magic Link and
  Confirm signup = `supabase/templates/*.html`), OTP expiry 600, **Email OTP Length 6** (= NEXT_PUBLIC_OTP_LENGTH).
- Env names (values in Vercel): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, APP_URL,
  SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET, AGE_COOKIE_KEY, RATE_LIMIT_HMAC_KEY, ANTHROPIC_API_KEY, KEEP_WARM,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY. `APP_URL` = `https://www.askradlor.com` (apex 308s to www).
- **Sign-up is open** (`ops_settings.signup_mode = open`; invite/closed still work from /admin). Turnstile on
  (Cloudflare widget "askRadlor sign-in", `interaction-only`: most people see no box; Supabase captcha holds the
  secret). Sign-up refuses `name+tag@` aliases and ~60 throwaway domains (`lib/email-check.ts`, browser and
  `completeSignup`; #32). Not caught: Gmail dot variants (needs a stored normalised address).
- **Keep-warm is live:** Vercel cron every 5 min, 200s in the logs (22 Oct). It warms only prompts used in the last
  24 h, so the first video of a quiet subject pays a cold write (seen: transformer $0.22, benzene $0.18).
- /admin (22 Oct): daily cap $50, videos at once 4, free videos 10 (**founder to set 40**), fair use 100/day 110/month.
- A bad Anthropic key or empty balance fails videos as `provider_config` and pauses generation 10 min
  (`provider_blocked_until`); 2 such failures on 22 Oct when the balance was ~$3.86.
- Daily check: scheduled task `askradlor-daily-check` (09:03 local, Chrome, read-only) summarises /admin, Anthropic
  limits and credits, and keep-warm.

## Anthropic capacity (org "Radlor", renamed from "Mohammed's Individual Org", 22 Oct)

- **Evaluation tier:** Opus 5.5 80K output tokens/min, 500K input, 1K requests. One video ≈ 8K output/min →
  safe `max_open_generations` = 0.7 × OTPM / 8,000 = **7**. More at once → 429s mid-video.
- Higher tiers: Start 400K (35 at once, $500/month cap), Build 1M (80, $1,000), Scale 2M (150). The Console's
  "Request tier increase" appears only after peak use passes 50% of the tier; the Contact Sales form (custom limits:
  asked ~2M OTPM, ~$5,000/month) was filled 22 Oct, reply unknown. Turn on credit auto-reload.
- To serve 100 at once: Scale tier, then `max_open_generations` ~120 and daily cap ~$200. Vercel and Supabase DB are
  not the limit; Resend free (100 emails/day) and Supabase Auth emails/hour are, for sign-up codes.

## Plans and free videos

- **Plans are off** (`PLANS_ON = false` in `product.ts`, #32): no plan, price or buy button anywhere; `/pricing`,
  `/buy`, `/start` redirect to `/ask`. Free count comes from /admin (`free_videos_monthly`). The plan machinery from
  #27 (price_catalog per level, `reserve_generation` free → plan, Stripe prices) is intact for when they return;
  legal text still talks about plans/credits.
- Founder's numbers (22 Oct, chat only, not in code): high school Plus $9.99 = 70 videos, Pro $19.99 = 150; free
  videos are a separate marketing budget. Stripe 5.1% + $0.30 assumed.
- **Measured cost (prod):** high school $0.08 warm. College + grad, 10 videos 22 Oct: avg $0.115 (college $0.127,
  grad $0.103; warm-only $0.093). **New prompt (#36), one medicine video:** $0.255 = $0.124 one-off cache write +
  ~$0.131 per video vs $0.082 before (3 calls not 2, output +46%, 521 vs 384 chars). One sample: run the "average
  cost per prompt" SQL after a day; at $0.13 a $9.99/70 plan barely breaks even.
- **Known drift:** `credit_drift()` reports 38 accounts: one user's 38 videos imported on 13 Oct with
  credits_charged and no ledger rows. Founder to decide: leave, or zero their charge by a migration.

## Subjects, levels and prompts

- Picker: Study (Biology, Physics, Chemistry) and Everyday fixes (Home, Car). A study chat also picks High school /
  College / Grad school (locked once started). **The level changes what is taught, never the length** (900 chars,
  4-7 steps); `LEVEL_TEXT` in the user turn keeps the cached prompts unchanged. Founder: no splitting a lesson into
  smaller parts to save cost.
- `build-prompts.mjs` → `prompts.json`: plain prompt (`332e6d…`, the prototype's, outside a chat) + one per subject
  = rules + `teach` + `REUSE` (`lab=0`) + `TEACHER` (`@word` cues, `mark`) + **`SHOW_AND_FINISH`** (#36: draw every
  concrete thing the voice names, find_drawing first; a journey/process lesson ends on how it ends) + `DRAW_OWN`.
  Subject shas bound in `prompts.test.ts` (biology `5589b3d9…`). Each prompt is its own cache entry.
- Live check of #36 (22 Oct, medicine, high school): stomach, liver, kidney drawn as realistic drawings; ends
  "Kidneys remove". Slips: the stomach drawing shows two stomachs; an arrow crossed the "blood" label.
- Beta feedback becomes general rules, never one video's fix: watch /admin → Video feedback weekly; a complaint
  seen 3+ times becomes a prompt rule, tried on ~10 questions old vs new (quality and cost) before merging.

## Drawing library (`public/player/lib`, the only copy; notes in `scripts/library/README.md`)

- Recipes (`lib/wb/<cat>.js` + `.txt`; ~900; `WB_CATS` shared, `WB_EXTRA` per subject via `?subject=`), `objects`
  loaded by every subject. Realistic drawings (`lib/sv/<id>.js`, ~3,790, found via `find_drawing`, `sv id=<name>`;
  organs: brain, heart, lungs, kidney, liver, muscle, stomach). Licences: no SA, no NC; credits on /legal/copyright
  (**add the 6 Wikimedia CC0 car/home files**). `heartcut` + 69 drawings have named parts for `pin`.
- Coverage: `scripts/coverage/check.mjs` → `report.md`; a test requires zero gaps.
- Model-made drawings (`new_<name>_*`) become /admin candidates; waiting: `xfmr` (transformer, 22 Oct).

## Player, voice, UI

- Player in `<iframe sandbox="allow-scripts">`; test in Chrome or Playwright (the desktop browser pane can't).
  **Safari (#35):** the hand-drawn filters (`#rough`, `#wc`) now cover each shape's box + 20% (a fixed 6000-unit
  region passed WebKit's ~4096² px filter limit and full-size drawings vanished); straight lines lose the filter in
  `build()`; finished text has no clip-path (Safari cut H₂O to H₂C). `e2e/player-safari.spec.ts` guards it.
  7 real boards: WebKit now within 0.2–1.8% of Chrome; the rest is Greek-letter fallback fonts (LAUNCH.md).
- Teacher at the board: `@word` cues (`bridge.js` `untilWord`), `mark` chalk; subject prompts only.
- Voice: Pocket TTS on the device (~166 MB first visit + 40 MB voices); `/tts/*` CSP has `'unsafe-eval'`.
- UI: always dark; new chat "What would you like to know?" / "askRadlor draws and explains the answer, step by
  step." / "Go ahead and ask your question…" (#32). **Video feedback (#34):** 👍 👎 beside Share/Open (and on
  `/videos/[id]` after Delete), thumbs-down asks reasons + note (`submit_feedback`, one row per video); /admin →
  Video feedback (7 days, latest 20 thumbs-down with a watch link). /admin drawing preview fixed (#33).
- Explore is public (noindex); every new production video goes there (previews never do).

## Dutch (founder, 21 Oct: Netherlands first) — branch `dutch-launch`, not merged

- In review on its preview URL. UI strings in `src/content/nl/*.ts` keyed by the English text: **merge `main`
  into it and translate the new strings** (#32 new-chat lines and email error, #34 feedback, #35 nothing).
  Videos speak Dutch via `LANG_TEXT`; Piper voice (espeak-ng is GPL-3.0). Vercel Authentication is OFF on previews
  (turn on after the review). Not done: iDEAL, Dutch auth emails, GDPR consent age 16 vs 13+.

## Open items

- Set free videos 40 and videos-at-once 7 in /admin; Anthropic auto-reload + tier increase (above).
- Cost of #36 over a day of real videos; decide plans/free budget from it.
- Legal: attorney review (Explore, reports, voice, credits); terms version bump with `/legal/accept` (not built);
  legal text still describes plans; no question screening yet.
- Not built: emails beyond sign-in codes, OG images, `/api/telemetry`, Gmail-dot farm check, a second voice source.
- To check: first iPhone runs (Safari fix live since #35), Greek fonts in Safari, model layout overlaps.

## Local

- Demo: `GENERATION_MOCK=1 npm run dev`; sign in as `a@example.test`/`b@example.test` with the code from Mailpit
  (`127.0.0.1:55324`). `.env.local` holds a live Anthropic key; a 401 blocks generation ~10 min.
- Tests: `npx vitest run`; `npm run test:pgtap` **wipes local videos**; `npx playwright test` (CI judges e2e).
- The player alone: serve `public/` (`python3 -m http.server`) and post `{type: "poster", script}` to
  `player/index.html` from the page itself; compare WebKit and Chromium with Playwright.
- Cost of real videos: `npm run cost` or `sql/cost-by-version.sql`.
