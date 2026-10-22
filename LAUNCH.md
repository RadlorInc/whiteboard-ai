# Before launch

Full public launch, no beta (founder, 20 Oct 2026). Do the steps in order; tick each one; delete the file when every
item is ticked. Agents never touch production: each step names who does it.

## 1. Code (before the last deploy)
- [x] Keep-warm cron in `vercel.json` (every 5 min) and the `KEEP_WARM_ALWAYS` switch — Claude (branch `launch-keep-warm`).
- [x] `src/content/legal.ts`: the "Show in Explore" tick lines (the tick is gone since #12) — Claude.
- [ ] Merge the `launch-keep-warm` PR into `main` — founder.

## 2. Keys and settings (dashboards) — founder
- [ ] **Anthropic:** a production key on the paid tier in Vercel `ANTHROPIC_API_KEY`; read the org rate limits.
      `prototype/.env` still holds the old revoked key.
- [ ] **Turnstile** (the code is in `SignInMethods.tsx`, idle until the key is set): Cloudflare → Turnstile → add a
      widget for the production domain → site key + secret.
      - Vercel production env `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = site key (build-time: needs a redeploy).
      - Supabase → Authentication → Attack Protection → CAPTCHA on, provider Turnstile, secret key.
      Set both together: the key without the Supabase setting is harmless; the Supabase setting without the key
      blocks every email sign-in.
- [ ] **Vercel env** `KEEP_WARM=1` (`CRON_SECRET` is already set). Leave `KEEP_WARM_ALWAYS` unset (see 6).
- [ ] **/admin → Limits:** `daily_spend_cap_usd` from $25 to what launch day may cost (at $0.08 a warm video,
      $100 ≈ 1,200 videos); `max_open_generations` from 4 to what the Anthropic limits allow.
- [ ] **Stripe:** live keys in Vercel, or launch free-only (checkout answers 503 and /pricing still shows plans).
      Decide which.

## 3. Deploy — founder
- [ ] Redeploy production from `main` (picks up the cron, the env above and the Turnstile key). Watch the deploy
      size: `public/player/lib/sv` is ~125 MB; if Vercel refuses, move it to Supabase Storage or R2 and point
      `SV.need` at that URL.
- [ ] Vercel → Settings → Cron Jobs lists `/api/cron/keep-warm`.

## 4. Smoke test on production (15 min) — founder
- [ ] Sign up with a fresh email: the Turnstile box shows, the 6-digit code arrives, sign-in works. Google sign-in works.
- [ ] One biology chat of 4–5 follow-ups; one Home question; play a video; share link opens signed out; Explore shows it.
- [ ] Supabase SQL editor, `sql/cost-by-version.sql`: warm videos ≈ $0.06–0.08, follow-ups show cache reads growing.
- [ ] Turn the GitHub repo private.

## 5. Known risk at launch (not doable tonight)
- [ ] Attorney review of Terms/Privacy (Explore, reports, voice, Servier credit); then bump the terms version. Until
      then the legal pages show the "Beta draft" banner. Biggest open point: every new video goes on public Explore,
      13–17 included, and questions are not screened (contact details are refused; anyone can report a video).

## 6. First days after
- [ ] Day 1: `generation_calls` rows with `kind = 'ping'` show `cache_write_1h_tokens = 0` (the `max_tokens: 0`
      ping is still an assumption; the code falls back to 1).
- [ ] Daily: spend against the cap, failed generations, reports on Explore videos, sign-ups per IP.
- [ ] Optional: `KEEP_WARM_ALWAYS=1` keeps all 6 prompts warm with no user (≈ $13/month fixed). Worth it only when
      `generation_calls` show more than ~4 cold videos a day that `KEEP_WARM=1` alone does not prevent.
- [ ] Greek letters in Safari (22 Oct 2026, found while checking the Safari drawing fix, #35): the hand font has no
      Greek (τ, ω, μ, σ), so each browser picks its own fallback font. Safari's makes τ look like a bold "T". Nothing
      is missing (Safari and Chrome boards differ by 0.2–1.8% after #35, all of it these letters). Fix: give the
      player's hand text one fixed fallback font for Greek, then compare a physics and a chemistry board in Safari and
      Chrome.
