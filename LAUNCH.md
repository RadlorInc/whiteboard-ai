# Before launch

Things decided but deliberately left for launch (founder, 18 Oct 2026). Tick an item when it is done; delete the file
when every item is ticked. Agents never touch production: each step names who does it.

## Shipped 19 Oct 2026 (all four migrations applied by migrate-prod; #16 to #21 merged; see handoff.md)
- [ ] Watch the deploy size: `public/player/lib/sv` now holds ~2,100 drawings (~125 MB). Vercel took it on 19 Oct;
      if a later deploy is refused or slow, move them to Supabase Storage or R2 and point `SV.need` at that URL.

## Keep the prompt cache warm (saves ~$0.09 on every cold video)
- [ ] Vercel Pro plan (Hobby runs cron only once a day) — founder.
- [ ] Add the cron to `vercel.json`: `/api/cron/keep-warm` every 5 minutes (code is ready: `src/lib/generation/keepwarm.ts`).
- [ ] Set `KEEP_WARM=1` in Vercel production env (`CRON_SECRET` is already set) — founder.
- [ ] Code: `KEEP_WARM_ALWAYS=1` env switch, so prompts stay warm even with no user in 24 h
      (`WARM_HORIZON_MS = process.env.KEEP_WARM_ALWAYS === '1' ? Infinity : 24 h`). 4 prompts ≈ $9/month.
- [ ] Code: after each deploy, write each subject prompt's cache once (a new prompt_sha is never pinged until a real
      user uses it, so today the first video after a deploy pays ~$0.09 per prompt).
- [ ] First day after: `generation_calls` rows with `kind = 'ping'` show `cache_write_1h_tokens = 0`
      (the `max_tokens: 0` ping is still an assumption; the code falls back to 1).

## Money and accounts
- [ ] Stripe live keys in Vercel; checkout answers 503 until then — founder.
- [ ] Anthropic: a production key on the paid tier; read the org limits and set `ops_settings.max_open_generations`
      (PLAN.md D14). `prototype/.env` still holds the old revoked key.

## Words and legal
- [ ] `src/content/legal.ts` still says "Show in Explore" can be unticked on /ask; the tick is gone since #12.
- [ ] Attorney review of Terms/Privacy (Explore, reports, voice, Servier credit); then bump the terms version.

## Check after it is live
- [ ] One biology chat of 4–5 follow-ups on production; `sql/cost-by-version.sql` in the SQL editor: warm videos
      ≈ $0.06, follow-ups show cache reads growing.
