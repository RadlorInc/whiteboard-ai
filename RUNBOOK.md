# RUNBOOK: Whiteboard AI

One file for everything an operator does by hand (PLAN.md §13). **M0 skeleton:** each section names what the plan
says it must hold and the milestone that fills it in. A section marked _(empty)_ has nothing that works yet; do not
follow it until it is filled. The founder does everything in a provider's console; the agent never touches production.

## Incidents (§13)

### Bad answers or a cost spike
Flip the kill switch in `/admin/settings` (`ops_settings`): asking stops, nothing is charged. _(empty: M6)_

### Bad code
Vercel Instant Rollback, done by the founder. Then fix forward on `main`.

### Leaked key
**Rotate first, investigate after** (§9.7). Revoke it in the provider's console, set the new key in Vercel, redeploy.
Keys are never printed in chat, logs or test output. If it was ever committed or pushed, treat it as leaked.
`RADLIC_PARTNER_SECRET` (children's maths for Radlic) is one value in two projects: set the new one in both Vercel
projects (here `RADLIC_PARTNER_SECRET`, Radlic `WHITEBOARD_PARTNER_SECRET`) and redeploy both; until both match, Radlic's
Ask maths answers "not available" and nothing else breaks.

### Webhook gap
The daily digest's reconciliation fixes it; or call `/api/cron/digest` by hand with `CRON_SECRET`. _(empty: M5, M6)_

### Data loss
Restore Supabase's daily backup (up to 24 h lost) or the nightly logical dump (D15). Then run
`scripts/stripe-reconcile.mjs --since <the backup's timestamp>` to re-apply every Stripe event after it. Voice clips
are in Storage, outside DB backups: a replay whose clip is gone uses the browser voice. Charges in the lost window
are written off and the gap is noted here. _(empty: M5, M8)_

### Restore rehearsal before public launch
The founder restores once into a new throwaway Supabase project and writes the date and result here. _(empty)_

### A provider account problem (`provider_config` / `voice_config` alert)
Asking pauses itself 10 minutes at a time while the key, billing or limit is fixed in the provider's console.
_(empty: M3, M6)_

### Personal data breach
Contain it (rotate keys, kill switch); list the affected users with a query the founder runs; the attorney sets the
notice deadlines; then queue `breach_notice` outbox mails. _(empty: M6)_

### A broken service worker
Deploy the ready `sw-kill.js` at `/sw.js` in one commit (it unregisters itself, clears caches, reloads clients;
§5.12). _(empty: the PWA work; the file is kept in this runbook when it exists)_

## Admins (§11.3)

No function adds an admin. The founder inserts the row with one SQL line in the production SQL editor and records
here why, one line each: date · who (role, not name) · why. Locally, `seed.sql` adds `admin@example.test`.

| Date | Who | Why |
|---|---|---|

**A lost admin TOTP device:** the founder deletes the factor in the production SQL editor (`delete from
auth.mfa_factors where user_id = …`) and enrols again at `/admin/mfa`.

## Stripe (§8.6)

- **Refunding a plan's current charge cancels it** (B18): a full refund of the current cycle's invoice cancels the
  subscription at once, so it does not renew. A partial refund never cancels.
- **Disputes:** what to paste where in Stripe's dispute form, from `/admin/users/[id]` → "Dispute evidence".
  _(empty: M5, M6)_
- A refund whose status turns `failed`: put the credits back with `admin_adjust_credits` (audited). _(empty: M6)_

## Vercel Firewall rules (§11.10)

The founder sets them; check once after setup with a burst test against staging.
- `/v/*` and `/og/*`: 60 requests a minute per IP.
- `/api/*`: 120 a minute per IP.
- `/api/stripe/webhook` and `/api/cron/*`: exempt from rate limits and bot challenges (Stripe and Vercel Cron must pass).
- `/api/partner/maths`: exempt from bot challenges (Radlic's server calls it, from Vercel's IPs); it has its own
  limit (60 a minute, `hit_rate_limit('partner:radlic')`) behind the secret.

## Support rules (§11.10)

- Account or billing state changes only for a request from the signed-in Contact form (email locked) or from the
  account's own address. The signed-out form accepts any address, so it proves nothing.
- A third party (a parent) gets a refund only with proof from Stripe (card last 4 digits, amount, date) and never
  sees the account's content.
- An email change for a lost inbox (`admin_change_email`) needs the same Stripe proof, and is never done on a request
  sent from the address being replaced.

## School web filters (E18)

Before reels marketing, submit the domain for an "Education" category to: GoGuardian, Securly, Lightspeed, Cisco
Talos, Fortinet, Zscaler. Record date and result per vendor here.

| Vendor | Submitted | Result |
|---|---|---|

## Local development

- The local stack only (`supabase start`); never link a remote project (README). `scripts/break-check.sh` may run
  `supabase db reset --local` for a pgTAP schema break, which wipes the local data; never run two at once.
- The pre-commit hook needs `git config core.hooksPath .githooks` once per clone.
- The prototype is frozen (`../prototype/README.md`); change drawings in `public/player/` only.
