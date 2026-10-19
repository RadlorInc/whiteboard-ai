# Handoff: askRadlor (repo and Vercel project still named whiteboard-ai)

**Current state and open items only. Under 15 KB.** Delete an item when it is done. The spec is
`../app-plan/PLAN.md` (build order §3); how to run things is in `README.md`.

**Before going live: [LAUNCH.md](LAUNCH.md)** — the checklist of what was left for launch (migration + merge order, keep-warm, Stripe, legal).

## Production (12 Oct 2026, end of day)

- **Live** on Vercel (project `whiteboard-ai`, Production env only) against its own Supabase project. The project ref
  is NOT in this public repo: it is the `PROD_PROJECT_REF` variable on the GitHub `production-db` environment.
- Migrations reach production only through `.github/workflows/migrate-prod.yml` (manual dispatch, typed confirmation,
  `production-db` approval). It runs **from `main` only** (environment branch rule), so land a migration on `main`
  before the code that needs it (as #21 did on 19 Oct). Never seeds. Never link the CLI locally.
- Auth settings live in the Supabase dashboard (config.toml is local only): Site URL, redirect `/auth/callback`,
  code templates (**both** Magic Link and Confirm signup = `supabase/templates/*.html`; 13 Oct production's Magic Link
  still had the default link, so returning users on a new device got a link), OTP expiry 600, **Email OTP Length must equal NEXT_PUBLIC_OTP_LENGTH (6)** — hosted defaults to 8.
- Production env names (values in Vercel): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, APP_URL,
  SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET, AGE_COOKIE_KEY, RATE_LIMIT_HMAC_KEY, ANTHROPIC_API_KEY.
- Bootstrapping an admin on a fresh project (the founder runs SQL in the dashboard; agents never query production):
  `insert into public.invites (code, max_uses, note) values ('<CODE>', 1, 'founder bootstrap');` → sign up with it →
  `insert into public.admins (user_id) select p.id from public.profiles p join auth.users u on u.id = p.id where
  u.email = '<email>' and p.deleted_at is null returning user_id;` (expect 1 row) → /admin enrols an authenticator.
- The repo is public while we build; it goes private at launch. Not yet: Stripe keys (checkout answers 503),
  keep-warm cron, Turnstile.

## Built and checked (12 Oct; details in git history and PLAN.md)

- M0–M7 core, `/admin` (TOTP), legal beta drafts, e2e and a probed security review. The player runs in
  `<iframe sandbox="allow-scripts">`; the Claude desktop browser pane does not run sandboxed iframes, so test players
  in Chrome or Playwright.
- Tests: `npm run test:pgtap` (resets the DB first), `npx vitest run`, `npx playwright test` (mock model; e2e is
  judged in CI).

## Voice: Pocket TTS in the browser (live since 13 Oct 2026, #5, #7)

- Pocket TTS (Kyutai) on the CPU via `public/tts/pocket-worker.js`; first visit ~166 MB, files pinned and SHA-checked
  (`public/tts/pocket-files.mjs`), kept in OPFS / Cache Storage. 6 of 8 voices: the two CC BY-NC ones are left out
  (`tests/voice/pocket-files.test.ts` guards it). **Security change:** `/tts/*` CSP has `'unsafe-eval'` (tokenizer).
- Not yet: the first iPhone run of the app, iOS's 7-day storage eviction, a second download source (R2), the
  attorney's look at the CC BY credits.

## Explore and reports (live since 13 Oct 2026, #1)

- `/explore` is public (noindex); every new video goes there (no tick since #12), the maker removes it on the video
  page. An item is a share with `explore_at`; DEFINER `set_explore` and the Explore readers never expose owner ids.
  **Report this video** on every /v page (5 a day per visitor, IP HMAC); /admin resolves reports (audited).
- Legal drafts describe Explore, reports and the voice; **the terms version was not bumped** (`/legal/accept` is not
  built), the attorney review and the bump go together.
- **Before production:** the attorney review; no question screening yet (decline policy), so reports + the admin
  form are the only brake.

## Invite credits (13 Oct 2026)

- First access by an invite code gives +100 top-up credits once (`redeem_invite` writes one `invite_grant`); not
  retroactive; invite credits do not count as "ever paid". Flaky, not new: WebKit e2e `signed-out pages …` under the
  full suite.
- **Not built yet:** emails beyond sign-in codes (digest, alerts, outbox), the decline policy + red-team run, OG
  images, parent email for 13–17 payers, Turnstile, `/api/telemetry`, `/legal/accept` re-acceptance.
- Admin "missing drawings" locally lists primitives from mock runs (production: none); check the miss counter.
- The founder decides the first commit; accounts to create are PLAN.md §2 E1–E18.

## UI round, rename and /ask cleanup (live since 15 Oct 2026, #10, #12, #13)

- Public name **askRadlor** (`PRODUCT_NAME`, `src/product.ts`; logo `public/logo.png`); repo and Vercel project are
  still `whiteboard-ai`. /ask is whiteboard only (old paper/match-cut videos still replay; Paper streaming PR #11 was
  closed). Step controls (`seek`, `FAST`), the making cover with the stream's real stages.
- **To fix:** `src/content/legal.ts` still says "Show in Explore" can be unticked when asking; the tick is gone
  (#12). Fix the Privacy/Terms wording with the attorney review.
- Local stack: `admin.spec.ts` fails past 50 users (first `listUsers` page); `tests/db` needs `supabase db reset`.

## Local demo

- `GENERATION_MOCK=1 npm run dev` (no API spend; credits are the local seed users'). Sign in as `b@example.test`
  with the code from Mailpit (`127.0.0.1:55324`). Use Chrome.
- Parked: local branch `paper-stream` (paper plays as it streams; e2e watched red). On the local stack,
  `admin.spec.ts` fails past 50 users (it reads only the first `listUsers` page), and `tests/db` needs a fresh
  `supabase db reset`.

## Biology library complete + model-made drawings (19 Oct 2026; live since 19 Oct, #20, #21)

- **Merged and live, in order:** #21 (only `supabase/`: the four migrations below, so `migrate-prod` could run from
  `main`; `production-db` deploys from `main` only), then #16 → #17 → #18 → #19 → #20. `migrate-prod` applied
  `conversations`, `explore_chats`, `saved_items`, `library_drawings` (19 Oct 06:39 UTC). #4 and #8 (old 13 Oct
  handoff drafts) closed. Production deploy `4c46131` checked: home, /explore, /legal/copyright, library files 200.
- **Library sources** (all credited on /legal/copyright; one shared converter `scripts/library/svg2sv.mjs`: SVG →
  `public/player/lib/sv/<id>.js` + `scripts/servier/sv-catalogue.json`; `build-sv.py` keeps the other sources):
  - Bioicons 416 (CC0 / CC BY, no SA; no pig or dog), `scripts/bioicons/build.mjs`, clone the repo to rebuild.
  - PhyloPic 73 silhouettes (CC0 / PD / CC BY), `scripts/phylopic/build.mjs` (fetches by scientific name).
  - Fluent Emoji 201 colour drawings (MIT, Microsoft), `scripts/emoji/build.mjs`; MIT text at
    `public/licenses/fluent-emoji-MIT.txt`.
  - Tried and dropped: Wikimedia (founder: not useful; most school diagrams are CC BY-SA), Openclipart (search
    broken), NIH BioArt (no school topics), PublicDomainVectors (bot check).
- **Drawn, not dropped in:** sources without pen lines get thin Servier-like outlines (#333, 40 biggest parts);
  the player gives a whole drawing a fixed pen budget (realistic ~1 s; was 50 ms a line, a crow took 56 s).
- **New recipes:** `lib/wb/life.*` (biology only): nitrogen cycle, habitats, cactus, fungi, finch, peppered moth,
  cladogram, homolog (homologous limbs), protists, moss/fern, dispersal, osmosis, diffusion, respiration,
  fermentation, transpiration, energy pyramid, quadrat, genetic engineering, cloning, kingdoms. `world.js`: fox,
  polar bear, deer, 4 invertebrates, 11 critters/life-cycle stages, and a `DETAIL` pass (shadow, highlight, iris,
  ground shadow, own details) on every older animal; the detailed frog and grasshopper replaced the simple ones.
- **Prompts:** biology lists `life` and `earth`; order of choice: recipe → colour (Fluent/Bioicons) → silhouette →
  draw it yourself. All subject prompts gained `DRAW_OWN`: the 7-layer way to draw what the library lacks, with
  parts named `new_<name>_<part>`. `find_drawing`: a drawing whose name is a query word ranks first.
- **Model-made drawings** (`library_drawings`): after a video, `new_<name>_*` shapes are kept as a candidate (3 a
  video, 3 waiting per name); /admin → *Drawings to review* previews each on the player; approve = `sv id=<slug>`
  (data sent with the script, `bridge.js` checks it; 5-minute cache per server), audited `review_drawing`.
- Demo clips (hand-written lessons, no API): `../reports/bio-demos/`.
- **Not done:** no real-model video with the new library (check that it picks recipes/colour/silhouettes and that
  `new_*` drawings arrive in /admin); the drawings are school-level, not yet reviewed by a teacher.

## UI redesign + Explore + Collection (18 Oct 2026, #19; live since 19 Oct)

- **Look (founder):** like Claude, always dark, monochrome + the glowing robot logo (`public/logo.png`, app icons
  RGBA: an RGB favicon 500s every page). `globals.css` rewritten, no light theme. `Icon.tsx`, no emoji icons.
- **Frame:** `src/app/(app)/layout.tsx` + `AppFrame.tsx`. Sidebar: New chat, Explore, Collection, Your videos,
  subject chips, Recents (latest 10, "All chats"). **No chat search in any form** (founder: not a chat app).
  Profile top right: avatar with a videos-left ring (green / amber / red, full at 25), menu with videos left.
  Phones: top bar + drawer. Signed out: `PublicHeader` + footer. No `(app)/loading.tsx` (made `notFound()` a 200).
- **Videos left, not credits** (`lib/videos.ts`: 4 credits a video, an estimate); Your videos show no credits.
  Pricing/Help/legal copy still says credits. e2e reads balances from `data-credits` / `data-charged`.
- **Chat:** composer with the subject picker inside; header with Share and Delete chat; Share per answer;
  jump-to-latest; AI note at the bottom of a new chat.
- **Player:** every step goes in at once and the Player makes the voice behind it from the current step; a jump
  draws at once (only step 1 waits for its line), cancels the line in progress (worker `{cancel}`), its line joins
  when made (~4–7 s). Controls: step segments, play/pause, keys, full screen. Embedded players: no frame, light
  captions, no 100vh, `place-items: normal`.
- **Explore** (migration `20261018000200_explore_chats.sql`): one card per chat with a board still (player
  `poster`), search over questions + narration, subject chips; the server puts each finished video on Explore.
  `/v/[slug]` plays the chat in order + "More like this". Signed out: only the opened video plays, the rest is
  blurred behind sign-up (scripts not sent); sign up / log in return there (`next` + `okNext`).
- **Collection** (migration `20261018000300_saved_items.sql`): bookmark on cards and lessons, `/saved`.
- Locally, 20_writes and 60_deletion fail a few fixture checks (seed users hold dev data; fresh CI is the judge).
  **e2e only runs in CI**: locally Playwright would reuse the dev server on the live model.
- **Open:** the founder's look at the whole UI on a phone.

## Subjects: own prompt + library per chat subject (18 Oct 2026, #17; live since 19 Oct)

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
- **Next:** physics, then chemistry, the way biology was done (19 Oct section).

## 18 Oct 2026 session: chats, realistic biology, follow-up cost (#16, #18; live since 19 Oct)

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
- **Cost by prompt version:** `npm run cost` (local) or `sql/cost-by-version.sql`.
- 13 test videos (heart follow-ups and more), all correct: $1.07; warm ≈ $0.05 a video, a hand-drawn diagram
  ~$0.10–0.12.
- **Pricing decided in talk, not built** (founder, 18 Oct): charge per spoken length, not per token. Leaning to
  "1 question = 1 video": Plus 40 videos/month, Pro "unlimited, fair use 150", 3 bonus videos at 0, replays and
  Explore free (margins with keep-warm: Plus ~70%, Pro ~57%). Needs money functions, Stripe prices and /pricing.
- **Next:** the LAUNCH.md list. Physics and Chemistry later (`servier-chem`, no pins).
- Local: `.env.local`'s Anthropic key was replaced 18 Oct (the one in `prototype/.env` is revoked). A 401 makes the app block generation ~10 min (`ops_state.provider_blocked_until`); delete that row locally.

