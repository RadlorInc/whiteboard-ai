# Handoff: Ask Radlor (repo and Vercel project still named whiteboard-ai)

**Current state and open items only. Under 15 KB.** Delete an item when it is done. The spec is
`../app-plan/PLAN.md` (build order §3); how to run things is in `README.md`; the business plan is `../STRATEGY.md`.

**Before and after going live: [LAUNCH.md](LAUNCH.md)** (Stripe, legal, first-days checks, Greek fonts in Safari).

## Production (live; last deploy #52, 23 Oct 2026)

- Vercel project `whiteboard-ai` (Production env only) against its own Supabase project. The project ref is NOT in
  this public repo: it is `PROD_PROJECT_REF` on the GitHub `production-db` environment. Agents never query or write
  production: the founder pastes SQL into the dashboard (`sql/`, `../sql/usage-per-video.sql`).
- Migrations reach production only through `.github/workflows/migrate-prod.yml` (manual dispatch, typed project
  ref, `production-db` approval), **from `main` only**. Vercel deploys on merge, so a migration the live code needs
  ships first in its own PR, then migrate-prod, then the code (#46 → #45 did this). Never seeds.
- Auth settings live in the Supabase dashboard: Site URL, redirect `/auth/callback`, code templates
  (`supabase/templates/*.html`), OTP expiry 600, **Email OTP Length 6** (= NEXT_PUBLIC_OTP_LENGTH). **Sender name
  still "askRadlor": change to "Ask Radlor"** (SMTP settings).
- Env names (values in Vercel): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, APP_URL,
  SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET, AGE_COOKIE_KEY, RATE_LIMIT_HMAC_KEY, ANTHROPIC_API_KEY, KEEP_WARM,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY, NEXT_PUBLIC_SUPPORT_EMAIL (`support@radlor.com`), NEXT_PUBLIC_PLANS_ON (`1`),
  STRIPE_* (below). `APP_URL` = `https://www.askradlor.com` (apex 308s to www). A `NEXT_PUBLIC_*` change needs a
  redeploy.
- **Sign-up is open**; Turnstile on; alias and throwaway emails refused (`lib/email-check.ts`).
- **Keep-warm is live** (Vercel cron, 5 min); the first video of a quiet subject still pays a cold write (~$0.18).
- **/admin settings (founder, 23 Oct):** videos at once **40**, free videos 20, a user a day 30, a user a month
  110 → **set 300** (it caps paid users too: Pro 150 + a 100 pack + 40 free = 290), daily spend cap → **set ~$3,500**
  (1,000 users × 30 a day × $0.116; it is also the runaway guard, so lower it once real spend is known).
- A bad Anthropic key or empty balance fails videos as `provider_config` and pauses generation 10 min (2 on 21 Oct).
- Daily check: scheduled task `askradlor-daily-check` (09:03 local, Chrome, read-only).

## Anthropic capacity (org "Radlor")

- **Evaluation tier (22 Oct):** Opus 5.5 80K output tokens/min, 500K input, 1K requests. **Measured 23 Oct (34
  videos, 7 days):** a video takes 43 s (p90 60 s), 3,870 output + 2,087 new input + 29,215 cache-read tokens, so
  one slot ≈ 5.4K output/min. Safe at once = 0.7 × OTPM / 5,400 ≈ **10 on Evaluation**. **The /admin value 40
  needs ~216K OTPM (Start tier, 400K)**: until the tier is raised, more than ~14 at once gets 429s mid-video.
  Most ever seen at once: 2.
- Users → slots (43 s a video): 1,000 a day ≈ 30–40; 1,000 online at once ≈ 300 (1.6M OTPM); 1,000 pressing Ask in
  one minute ≈ 500 (2.7M). Tiers: Start 400K, Build 1M, Scale 2M. Contact Sales form (~2M OTPM) filled 22 Oct.
- **There is no queue:** past `max_open_generations` a user gets "We're very busy. Try again in a minute." (503).
  A real queue ("you're 12th, ~40 s") is a possible next build.

## Payments (Stripe live since 23 Oct; #42 #43 #52)

- **Plans, one price for every level:** Plus $13.99 = 70 videos/month, Pro $25.99 = 150 (keys `plus_all`,
  `pro_all`, level `grad` = never capped). **Packs:** 20 / 45 / 100 videos for $4.99 / $9.99 / $19.99 (`topup_20/
  45/100`). Old keys (`plus`, `pro`, per-level, `topup_60/132/282`) stay off sale for old webhooks and tests. The
  old packs lost money at 1 credit = 1 video. Cost $0.116/video → profit after Stripe: Plus $4.86, Pro $6.97,
  20-pack $2.12 if fully used.
- Switch: `PLANS_ON` = `NEXT_PUBLIC_PLANS_ON === "1"` (on in Production).
- **Stripe account:** shared with Radlic (Radlor Inc, `acct_1UDr3tBm2IHV2ZZY`), separated by `metadata.app =
  askradlor`. Founder considered a separate account inside a Stripe organization (keeps books, payouts and card
  statement name apart); not done. Live webhook `we_1UTJZZBm2IHV2ZZYo07NyFMN` → `https://www.askradlor.com/api/
  stripe/webhook` (www: Stripe does not follow the apex redirect), 11 events. Our checkouts carry `price_key` in
  metadata; anything without it (Radlic's) is recorded `ignored` (#43). Refunds/disputes are not filtered: a Radlic
  one would show in review, with no effect on credits.
- Vercel Production: STRIPE_SECRET_KEY (restricted: Customers, Checkout Sessions, Customer portal), STRIPE_WEBHOOK_
  SECRET, STRIPE_PRICE_PLUS / PRO / TOPUP_20 / TOPUP_45 / TOPUP_100. Sandbox prices exist too (unused).
- Customer portal saved in live (invoices, customer info, payment methods, cancel at period end). **Plan switching
  is off:** a mid-period switch makes a prorated invoice that `stripe_invoice_paid` sends to review.
- **Not yet confirmed:** the webhook's first live delivery = 200 (Stripe → Webhooks → Event deliveries), and the
  founder's own $4.99 pack test (pay, see 20 videos, refund).
- **Legal text is stale:** /legal/refunds says "Packs are no longer sold"; founder to give the wording.

## Free videos, sign-up, sharing

- **First 20 free once + invite a friend** (#38, live 22 Oct): a friend who signs up with `/?friend=<code>` and makes
  a video gives the inviter 10 more, at most 2 friends. Verified end to end locally 23 Oct (inviter 20 → 30).
  Terms version not bumped for the new text (founder/attorney).
- **Categories and level at sign-up** (#45/#46): under the birth date, "Choose your categories" (at least one); a
  study subject asks "Explanation level". Saved on `profiles.subjects` / `study_level` (service-role
  `set_interests`); a new chat offers only those subjects and uses that level; **the chat box has no level picker**
  now. /settings → Your categories changes both. Older accounts: every subject, high school.
- **Shared video, signed out** (#51): only the first half of the steps leaves the server; when it ends a sign-up
  popup opens. **Not yet seen end to end on prod** (the desktop browser pane can't play the player).
- Names: product is **"Ask Radlor"** (`PRODUCT_NAME`, #50); subjects **Home improvements / Auto repairs** (#44);
  picker group still "Everyday fixes". radlor.com still says "askRadlor" in 8 places (RadlorInc/website).

## Support (#52)

- /contact: form (topic + message; email asked only when signed out), 5 a day per visitor → `support_messages`;
  /admin → Contact messages (newest 30, mailto reply). No email alert on a new message yet.
- /help: plan/pack numbers, plus "paid but no videos" and "refund" answers.
- Not built: admin search by email / change email / delete account buttons (DB functions exist).

## Landing page

- Under the hero (plans on): animated SVG "Explainer videos for a fraction of the price." Monthly starter plans,
  **no company named**: other prompt-to-explainer tools from $39.99/month for 20 minutes vs Plus $13.99 for 70
  videos (23–70 min) → "⅓ the price"; perks: ready in under a minute, colour on every plan, follow-ups. Prices read
  from their pricing pages 23 Oct. **Per-minute claims do not hold** (their annual plans reach ~$0.62/min; our
  20 s videos cost 60¢/min): re-check before changing a number.

## Measured cost and usage (prod)

- 21 Oct (IST): 11 asked, 9 made, 2 `provider_config` failures ($0), 3 users (1 outside: Dutch questions, 6
  videos, "Wat doet DNA?" 3 times in 2 minutes, probably the example chip), $1.05 + $0.04 keep-warm; $0.116 a
  good video. Car videos run longer (41–60 s, $0.11–0.18).
- **Known drift:** `credit_drift()` reports one imported user (13 Oct); founder to decide.

## Subjects, levels and prompts

- **The level changes what is taught, never the length** (900 chars, 4-7 steps); `LEVEL_TEXT` in the user turn
  keeps the cached prompts unchanged. The model's subject label is still "Home fixes"/"Car fixes" on purpose
  (`generate.ts` SUBJECT): changing it changes prompts and the cache.
- `build-prompts.mjs` → `prompts.json`: per subject = rules + teach + REUSE + TEACHER + SHOW_AND_FINISH (#36) +
  DRAW_OWN; shas bound in `prompts.test.ts`. Beta feedback becomes general rules (3+ complaints, tried on ~10
  questions old vs new).

## Drawing library, player, voice

- Library in `public/player/lib` (~900 recipes, ~3,790 realistic drawings); coverage test requires zero gaps;
  credits on /legal/copyright (**add the 6 Wikimedia CC0 car/home files**). Waiting in /admin: `xfmr`.
- Player in `<iframe sandbox="allow-scripts">`; test in Chrome or Playwright. Safari fixes #35.
- Voice: Pocket TTS on the device; `/tts/*` CSP has `'unsafe-eval'`. In the desktop browser pane the voice step
  hangs, so a video never "ends" there.

## CI (#47 → #48, #52)

- One run per PR (`push` only on `main`). The e2e browser install: Ubuntu packages from `archive.ubuntu.com` (the
  runner's Azure mirror crawled at ~50 kB/s on 22–23 Oct), apt timeout + retries, 3 tries of 4 minutes, browsers
  cached. A run whose job finished but still shows "in progress" is GitHub's; close/reopen does not help.

## Dutch (founder, 21 Oct: Netherlands first) — branch `dutch-launch`, not merged

- UI strings in `src/content/nl/*.ts` keyed by the English text: **merge `main` and translate the new strings**
  (#32–#52: sign-up categories, settings, contact form, help, share popup, price section). Videos speak Dutch via
  `LANG_TEXT`. Not done: iDEAL, Dutch auth emails, GDPR consent age 16 vs 13+.

## Open items

- /admin: month cap 300, daily spend ~$3,500; Anthropic tier for 40 at once (or set ~10); credit auto-reload.
- Stripe: first webhook delivery 200, the $4.99 test; refunds legal text; separate Stripe account (decide).
- Check on prod: the share popup, a video's voice, Account page counts.
- Supabase sender name; radlor.com "askRadlor" → "Ask Radlor"; picker group name.
- Legal: attorney review; terms version bump with `/legal/accept` (not built); no question screening yet.
- Not built: queue, email alert for contact messages, admin user tools, OG images, Gmail-dot farm check.

## Local

- Demo: add `GENERATION_MOCK=1 NEXT_PUBLIC_PLANS_ON=1 APP_URL=http://localhost:<port>` (generate refuses another
  origin); sign up with any address, the code is in Mailpit (`127.0.0.1:55324`). Signups need
  `ops_settings.signup_mode = open` locally. Turbopack refuses a symlinked `node_modules`: `npm ci` per worktree.
- Tests: `npx vitest run` (`WB_LOCAL_DB=1` for the DB suites, after `supabase db reset`: leftover rows fail pgTAP);
  `supabase test db`; `npx playwright test` (CI judges e2e).
- Cost of real videos: `npm run cost` or `sql/cost-by-version.sql`.
