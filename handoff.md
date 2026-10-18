# Handoff: askRadlor (repo and Vercel project still named whiteboard-ai)

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
- Not yet: Stripe keys (checkout answers 503),
  Vercel Cron for keep-warm (no `vercel.json` crons yet), Turnstile.

## Built and checked (12 Oct; details in git history and PLAN.md)

- M0–M7 core, `/admin` (TOTP), legal beta drafts, e2e and a probed security review (40 DB probes blocked, IDOR and a
  player XSS fixed: the player runs in `<iframe sandbox="allow-scripts">`, CSP names APP_URL, not 'self'). The Claude
  desktop browser pane does not run sandboxed iframes: test players in Chrome or Playwright.
- Tests: `npm run test:pgtap` (resets the DB first; 1,125 pass), `npx vitest run` (171), `npx playwright test`
  (mock model; idor needs user A to own a video, so rerun it after a fresh reset).

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
  by default: since #12 /ask has no tick, so every new video goes there; the maker removes it on the video page.
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
- Paper and match-cut do not stream (45 s for match-cut).
- The founder decides the first commit; accounts to create are PLAN.md §2 E1–E18.



## Local demo

- `GENERATION_MOCK=1 npm run dev` (no API spend; credits are the local seed users'). Sign in as `b@example.test`
  with the code from Mailpit (`127.0.0.1:55324`). Use Chrome.
- Parked: local branch `paper-stream` (paper plays as it streams; e2e watched red). On the local stack,
  `admin.spec.ts` fails past 50 users (it reads only the first `listUsers` page), and `tests/db` needs a fresh
  `supabase db reset`.

## UI redesign (18 Oct 2026, branch `ui-redesign` on top of #18, not committed)

- Founder: layout like Claude, always dark, monochrome like the logo (white on black), subject picked in the composer.
- `src/app/(app)/layout.tsx` + `AppFrame.tsx`: sidebar (New chat, Explore, Your videos, Recents, credits, account menu);
  phones get a top bar + drawer. Signed out, the same pages get `PublicHeader` + footer. Pages moved into `(app)/`.
- `globals.css` rewritten (no light theme; Settings lost Theme). `Icon.tsx` replaces emoji icons. Logo assets:
  `public/logo.png` (transparent white), `app/icon.png`, `apple-icon.png`, `favicon.ico`.
- Players (`public/player/*.html`, embed only): no board frame, light captions, body not 100vh (frame couldn't shrink).
- **Explore by chat**: a card per chat ("N videos") with a board still (player `poster`, lazy iframe), search
  (questions + narration), subject chips; `/v/[slug]` plays the chat in order + "More like this". Migration `20261018000200_explore_chats.sql` (DEFINER: explore_on_finish,
  explore_feed/series/related); the server now puts each finished video on Explore (`db.explore` after finish), the
  browser no longer does. pgTAP `56_explore_chats` (22).
- Signed out, `/v/[slug]` plays only the opened video; the chat's rest is blurred under "Sign up to watch the rest"
  (scripts not sent). Sign up / log in return there (`next` through invite → age → sign-in, `okNext`).
- Player: every step goes in at once (`voice: true` on els); the Player makes lines behind the board from the
  current/jumped step (`need`, `stepWav`; a jump cancels the line in progress: worker `{cancel}`). Controls: step segments, keys, full screen.
- No `(app)/loading.tsx`: it streams early, so `notFound()` answered 200 (IDOR and unshare e2e want 404).
- 18 Oct late: new glowing logo; Collection (`saved_items`, `save_item`/`my_saved`, /saved, bookmark on cards);
  "videos left" not credits in the app (`lib/videos.ts`, 4 credits a video: an estimate); Recents = 10; video page
  shows before/after in its chat. Pricing/Help/legal copy still says credits.
- Also: error screen, skip link, real titles + link previews, ⌘K chat search, ⌘⇧O new chat, toasts, chat header
  (Share, Delete chat = delete_my_video each), Share per answer, jump-to-latest, Your videos as a grid + search.
- Checked: tsc, eslint, vitest and screenshots at 1440 and 390 px. **e2e not run**: locally Playwright reuses
  the dev server on 3100, which was running the live model; two selectors updated for the sidebar.

## Subjects: own prompt + library per chat subject (18 Oct 2026, PR #17, on top of #16)

- `build-prompts.mjs` → `prompts.json` `subjects.*` = `{system, sha256, cats}`. The rules and examples are the plain
  prompt's; the categories are only the subject's (+ `diagrams`), plus a "- Teaching <subject>:" rule.
  - The plain prompt is unchanged (`332e6d…`) and is used outside a chat.
  - The subject shas are bound in `prompts.test.ts`.
- The chat's subject picks the `prompt_sha` (`promptSha(style, subject)`), `prefix(style, subject)` and the
  `find_drawing` categories.
- Keep-warm covers 6 prompts (`PROMPTS`). No migration: `prompt_cache_state` is keyed by `prompt_sha`.
- A subject prompt is ~10k tokens: a cold write ~$0.08 (est.); all three warm ~$0.17/day.
- Biology library `lib/wb/biology.*` (`WB_EXTRA` in `wb-load.js`; only the biology prompt lists it): 9 labelled,
  polished drawings (`lab=0` hides words).
- Proof: biology-chat tests in `run.test.ts` and `localdb.test.ts`.
- **Next:** physics, then chemistry, the same way.

## 18 Oct 2026 session: chats, realistic biology, follow-up cost (PRs #16 → #17 → #18, stacked, none merged)

- **Merge order is in LAUNCH.md** (migrate-prod for conversations first). Live already: #12–#15 (askRadlor name and
  logo, /ask cleanup, player pause + click-a-drawing-to-replay, chat-free composer).
- **#16 Chats:** `conversations` (owner + subject; title = first question). /ask = new chat with a Biology / Physics /
  Chemistry picker; /c/[id] reopens; list left on laptops, /chats on phones; a new question scrolls into view.
  A follow-up's model call gets the subject + last 6 answered questions with their narration (no drawings), one text
  block per turn, the last a 1-hour cache breakpoint (run.ts), so earlier turns are read at the cache price.
- **#18 Realistic library (Servier Medical Art, CC BY 4.0, credited on /legal/copyright):**
  - `scripts/servier/`: `pptx2svg.py` turns a kit's native vector slides into SVG (no tracing); `extract.py`,
    `curate.py` (drops diseases, treatments, copies), `build-sv.py` → 1,428 drawings, one file each in
    `public/player/lib/sv/<id>.js` (68 MB, loaded only when a lesson uses them: `SV.need` in anatomy.js/bridge.js).
    The 32 downloaded kits live outside the repo (scratch); re-download from smart.servier.com to rebuild.
  - Biology/chemistry prompts list them as search-only categories (`servier`, `servier-chem`); `sv id=<name> cx cy h`
    draws one; checks reject unknown ids.
  - **Pins:** `heartcut` (the hand-mapped heart) + 69 core drawings (`scripts/servier/core.json`) have named parts
    (`parts/<id>.json` → `apply-parts.mjs`; review with `grid.mjs`, `preview-parts.mjs`). `pin of=<el> part=<name>`
    traces the part (inside the drawing, so it beats with it) and writes its name with a haloed leader. `trace:false`
    marks a label-only part.
  - **Flows over a drawing** (founder chose B + C of a 4-style demo): an arrow/line over an anatomy drawing gets a
    white edge and a running shimmer; that step dims the drawing (spotlight); older flows fade. Player-only, so old
    videos get it too. Prompt: no tags/text over the drawing, one flow per step, pins for parts.
- **Measured (local, real Opus):** 5 linked heart follow-ups, all correct, $0.53; warm ≈ $0.064 a video, cold +$0.09.
- **Cost by prompt version:** `npm run cost` (local) or `sql/cost-by-version.sql` in the SQL editor; "sha-test" rows
  are unit tests.
- **Sequences 2 and 3 (after the follow-up cache):** 8 videos, all correct and linked; the deliberate wrong follow-up
  ("is urine made in the bladder?") was corrected ("No! … made in the kidneys"). $0.29 + $0.25; uncached input stays
  ~600–1,100 tokens per follow-up (was growing to 5,369), cache writes ~200–340. Warm ≈ $0.05 a video; a video that
  hand-draws its own diagram costs ~$0.10–0.12 (4,400–4,900 output tokens). All 13 test videos: $1.07.
- Fixed from them: c4b3780 (looping `travel`, jsonb element order → `script.order`, search ranking).
- Later fixes (#18): no dot along step-tag arrows over a realistic drawing; the biology prompt searches 2–3 words
  before hand-drawing. "Tiny air sacs" now picks the realistic alveoli with 4 pins.
- **Pricing decided in talk, not built** (founder, 18 Oct): credits stay per spoken length, not per token (tokens
  rise when the library lacks a drawing — our gap, and the price would be unknown beforehand). Leaning to
  "1 question = 1 video": Plus "40 videos/month", Pro "Unlimited, fair use 150", 3 bonus videos when the balance hits
  0, replays and Explore free, show "videos left". Full-use margins with keep-warm: Plus ~70%, Pro at 150 ~57%.
  Needs the money functions, Stripe prices and /pricing changed: decide before launch.
- **Next session:** UI work (founder's choice), then the LAUNCH.md list. Physics and Chemistry get the same
  treatment later (`servier-chem` exists; no pins yet).
- Local: `.env.local`'s Anthropic key was replaced 18 Oct (the one in `prototype/.env` is revoked). A 401 makes the app block generation ~10 min (`ops_state.provider_blocked_until`); delete that row locally.

