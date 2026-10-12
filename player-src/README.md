# player-src: the drawing library and the three players' sources

Copied **byte for byte** from the prototype (`/Users/mrk/whiteboard-ai/prototype/`) on 12 Oct 2026 (M0, PLAN.md §7.1,
§7.8, D6). From now on **this folder is the source of truth**; the prototype is frozen and is never edited to change
a drawing.

| Here | Came from | What it is | M4 turns it into |
|---|---|---|---|
| `lib/wb/*.js`, `lib/wb/*.txt` | `prototype/lib/wb/` | Whiteboard library: 16 categories, code + catalogue lines | per-category `/player/*.<hash>.js` |
| `lib/paper/*.js`, `lib/paper/*.txt` | `prototype/lib/paper/` | Paper-motion library: 4 categories | per-category player files |
| `lib/mc/*.json` | `prototype/lib/mc/` | Match-cut objects (data). The server expands `use`, so the browser never loads these | read by `build-prompts.mjs` / the server only |
| `lib/wb-load.js`, `lib/paper-load.js` | `prototype/lib/` | Category lists. **Their `document.write` loader is the §9.1 DOM-XSS (`?cat=`)** | `loadCats()` from the build manifest through the `wb-loader` Trusted Types policy |
| `lib/names.mjs`, `lib/shot.mjs`, `lib/gallery.html`, `lib/README.md` | `prototype/lib/` | Dev tools: duplicate-name check, render screenshots, gallery, how the library works | a dev-only gallery page |
| `recipes.js` | `prototype/recipes.js` | The base whiteboard recipes (`window.RECIPES`). Its `<defs>` use `innerHTML` | `createElementNS` (§7.8) |
| `styles-lib.js` | `prototype/styles-lib.js` | Shared helpers for paper and match-cut (shape-morph engine) | shared player module |
| `answers.js`, `stopmotion-answers.js`, `matchcut-answers.js` | `prototype/` | The hand-made, approved answers (the corpus and the `GENERATION_MOCK` fixtures) | fixtures + `reveal-check` corpus |
| `index.html` | `prototype/index.html` | Whiteboard player (inline script: `build`, `play`, `write`, `draw`…) plus the prototype's ask bar | `whiteboard/player.js` |
| `stopmotion-topics.html` | `prototype/stopmotion-topics.html` | Paper player (`LIB`, `runRecipe`, `frame`, `fromRecipe`) plus a gallery | `paper/player.js` |
| `matchcut.html` | `prototype/matchcut.html` | Match-cut player (`prepare`, morphs) | `matchcut/player.js` |

**Not copied, on purpose:**
- `explain-stopmotion.html`: its terracotta box came from an Anthropic demo and must not ship (§7.8). `index.html`
  still links to it from the prototype's nav bar; M4 removes that nav.
- `lib/shots/` (42 MB of generated screenshots; `node lib/shot.mjs` makes them again).
- The prototype's server, checks, key-day files, saved answers and logs. Saved answers stay in the prototype; the app
  keeps answers in Postgres.

**These files are not served yet.** Nothing in the app imports or serves `player-src/` until M4 builds the sandboxed
iframe players. Until then they still contain the prototype's HTML sinks (`innerHTML`, `document.write`), which M4's
no-HTML-sinks gate (§12.5) must take to zero before anything here is served.

Check the copy is still byte-identical to the frozen prototype (prints nothing when it is):

```bash
cd player-src && for f in $(find . -type f ! -path ./README.md); do cmp -s "$f" "../../prototype/$f" || echo "differs: $f"; done
```
