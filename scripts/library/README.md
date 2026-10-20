# Drawing library

The library is what makes "type anything, see it" work. Claude never draws detail: it writes one short line per
object (`magnet 480 270 300`), and the code here draws the finished, styled picture in the viewer's browser. More
and better drawings = better answers at the same token cost.

## How it is stored and used

| Style | Code | Catalogue (what Claude reads) | Render check |
|---|---|---|---|
| Whiteboard | `wb/<category>.js` adds to `window.RECIPES` | `wb/<category>.txt` | `node lib/shot.mjs wb <category>` |
| Paper motion | `paper/<category>.js` adds to `LIB` | `paper/<category>.txt` | `node lib/shot.mjs paper <category>` |
| Match-cut | `mc/<category>.json` (data: profiles) | the json's `desc` fields | `node lib/shot.mjs mc <category>` |

- A category is live once it is listed in `wb-load.js` (`WB_CATS`) or `paper-load.js` (`PAPER_CATS`); match-cut
  reads every `mc/*.json`. `server.mjs` puts every catalogue line into that style's cached prompt.
- Catalogue line format (`.txt`, one per drawing): `signature | example | what it draws`
  e.g. `magnet cx cy length rot=deg | magnet 480 270 300 | bar magnet, red N and blue S halves`.
  An example may carry a label (`beaker 300 300 160 | Acid`): the first ` | ` ends the signature, the last starts
  the description, everything between is the example.
  Only the signature and the description go into the prompt (about 20 tokens a line, read from the prompt cache).
  The example must be a working call; the gallery renders it.
- `node check.mjs` checks every catalogue line has code, names are unique, examples call their own name, and
  every match-cut object is valid.
- **find_drawing (11 Oct, founder's pick):** the cached prompt carries only the drawing *names*, one line per
  category. Before writing, Claude calls the `find_drawing` tool with names (or a query such as "blood pressure");
  `server.mjs` answers with those catalogue lines, then Claude writes the script. Small prompt (whiteboard ~6,500
  tokens instead of ~13,500 at 468 drawings), at the price of one extra round trip per answer (a few hundred
  uncached input tokens and a second or two). Match-cut keeps its short name list in the prompt (`"use": "car"`).
- Drawings a viewer asks for that are missing: the model draws them once, a check renders them, a person approves,
  and they are saved here. Model-made drawings are saved as data (paths, colours), never as code.

## House rules for every drawing (all styles)

- **Parametric**: position and size from the call (`cx cy size`, `rot=`), so one drawing serves every answer.
  Sensible defaults so short calls work. A family that shares a placement can be one drawing with `k=variant`
  (list the variants in the description).
- **Recognisable at a glance** at the default size, clean, nothing clipped, nothing outside its own box.
- **Halal and child-safe content**: no pig, ham, dog, puppy, alcohol, gambling, weapons, blood-and-gore, or
  dating; no religious symbols; no real brands or logos; no real people.
- **Unique names**, lower case, short (`magnet`, `beaker`, `lungs`). Never reuse a name from another file.
- Unique ids: any `id` you create (gradients, clip paths) must be built from the drawing's name plus a counter
  (`'magG' + clipN++`), so two drawings never share an id.
- Descriptions: ≤ 12 words, say what is drawn and the variants. They are what the model reads.

## Whiteboard specifics (`wb/*.js`)

```js
Object.assign(window.RECIPES, {
  // "magnet cx cy length rot=deg"
  magnet: ([cx, cy, L = 260], o, t, parent) => {
    const g = mk('g', { transform: `translate(${cx} ${cy}) rotate(${o.rot || 0}) scale(${L / 260})` }, parent);
    mk('path', { d: '...', fill: '#e04b3a', filter: 'url(#wc)', class: 'fillable' }, g);   // watercolour fill, fades in
    line(g, 'M...', '#333', 3.2);                                                         // outline: drawn stroke by stroke
    label(g, x, y, 'N', '#fff', 30, 'middle');                                            // handwritten label (optional)
    return g;
  },
});
```
- Helpers from `recipes.js`: `mk`, `line(g, d, colour, width)`, `label(g, x, y, text, colour, size, anchor)`,
  `head(x, y, ax, ay)` (arrowhead path), palettes `INK`, `TXT`, `FILL`, filters `url(#wc)` (watercolour fill) and
  `url(#rough)` (applied by `line`), counter `clipN`.
- Layers in order: fills (`class: 'fillable'`, `filter: 'url(#wc)'`) → outlines and details (`line`, which gets class
  `ink`) → labels (`label`, class `lbl`). The player draws every `.ink` line in order, then writes the labels, and
  `fill` fades the fills in. Every drawing needs at least one `line`.
- If it should move, the player's loops work on it: `beat`, `flow` (marching dashes on its ink lines), `fall`,
  `rise`, `sway`, `swing` (rotates `g.swing` about its own 0,0, else the drawing about its top centre). A drawing with a moving part should say so in its description.
- Use the `| text` content for a label where it makes sense (`beaker 300 300 160 | Acid`).
- Draw at the 960×540 board's scale: a default size of about 150–300 px.

## Paper-motion specifics (`paper/*.js`)

```js
Object.assign(LIB, {
  // "magnetp x y scale"
  magnetp: (a, t, f) => { const [x, y, s = 1] = a.v; cx.save(); cx.translate(x + jig(f, 1), y + jig(f, 2)); cx.scale(s, s);
    rrect(-120, -28, 120, 56, 6, '#e05a4f', '#5a2a24', 3); cx.restore(); },
});
```
- `a.v` = plain numbers, `a.pts` = `x,y` points, `a.<key>` = `key=value`, `a.w` = bare words (also `a.<word> = true`).
  `t` = seconds since the scene (or `at=`) started, `f` = frame number for the boil. Animate with `t`.
- Helpers in `stopmotion-topics.html`: `cx` (the canvas), `poly(pts, fill, edge, lw)`, `circ(x, y, r, fill, edge, lw)`,
  `rrect(x, y, w, h, r, fill, edge, lw)`, `path(pts, colour, width, {dash, alpha})`, `arrowHead(pts, colour)`,
  `soft([[x, y, r, colour]])` (glow), `blob(...)`, `jig(f, i)` (the boil wobble, 0 in paper mode), `ease`, `clamp`,
  `lerp`, `mix(c1, c2, k)`, `along(pts, u)`, `upto(pts, k)`, `TAU`.
- The look: flat cut-paper shapes, one or two colours each, darker outline about 3 px, deep clear colours,
  **nothing written inside the frame** (no letters, numbers or labels). Canvas 960×600.
- Every drawing should have some life in `t` (a gentle bob, spin, pulse, growth) unless it is scenery.

## Match-cut specifics (`mc/*.json`)

`{ "car": { "desc": "a family car, side view", "L": 360, "top": [11 numbers], "bot": [11 numbers], "fill": "#d64545",
"edge": "#3d1212", "parts": [[0.35, 0.65, "#9fc4e6"]], "lines": [[u0, v0, u1, v1, "#hex", width]] } }`
- The object lies along its length, tail (left) to nose (right), pointing right; `top`/`bot` = half-heights above
  and below the axis at 11 even points tail → nose, 0–80 (0 at an end = a point). Side-view silhouette that reads
  from its outline alone. `parts` colour slices (windows, bands, tips); `lines` draw details; v runs −1 (top) to 1 (bottom).
- Objects in one family should be the same rough length so the flow between them looks smooth.
