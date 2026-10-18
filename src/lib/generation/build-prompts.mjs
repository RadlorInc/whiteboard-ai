// Builds src/lib/generation/prompts.json: each style's cached system prompt (+ sha256) and the library data the
// checks and find_drawing need, so nothing is read from disk during a request (PLAN.md §7.1, §7.6).
//   node src/lib/generation/build-prompts.mjs          writes prompts.json
//   node src/lib/generation/build-prompts.mjs --check  exits 1 if prompts.json is stale (tests run the same compare)
// The prompt half below is copied VERBATIM from prototype/server.mjs (lines 21-37, 39-111, 130-138, 148-174 on
// 12 Oct 2026). Only two lines differ: `here` is app/player-src (the library's home since D6), and the recipe
// catalogue is read from recipe-catalogue.md (the "## Recipe catalogue" section of PROCESS.md, copied byte for byte).
// tests/generation/prompts.test.ts proves each style's sha256 equals the prototype's. Any change here is a
// deliberate new prompt_sha. The subject prompts (SUBJECTS below, 18 Oct 2026) are new and have no prototype twin.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const genDir = path.dirname(fileURLToPath(import.meta.url));
const here = path.join(genDir, '..', '..', '..', 'player-src');
const MODEL = 'claude-opus-5-5';                                  // founder: the script model stays Opus 5.5

// ---------- What the model is taught: built once, byte-identical on every request (prompt cache) ----------
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(here, 'answers.js'), 'utf8'), ctx);
const EXAMPLES = ctx.window.ANSWERS;
const recipesSrc = fs.readFileSync(path.join(here, 'recipes.js'), 'utf8');
const RECIPE_NAMES = [...recipesSrc.slice(recipesSrc.indexOf('window.RECIPES')).matchAll(/^  (\w+): \(/gm)].map(m => m[1]);
// Library categories: lib/<style>-load.js lists them; each has a .txt catalogue ("signature | example | what it draws").
const cats = (loader, v) => JSON.parse(fs.readFileSync(path.join(here, 'lib', loader), 'utf8').match(new RegExp(`window\\.${v} = (\\[[^\\]]*\\])`))[1].replace(/'/g, '"'));
const catalogueOf = (dir, list) => list.map(c => ({ cat: c, lines: fs.readFileSync(path.join(here, 'lib', dir, `${c}.txt`), 'utf8').split('\n')
  .filter(l => l.trim() && !l.startsWith('#')).map(l => { const p = l.split(' | '), sig = p[0], desc = p.at(-1), example = p.slice(1, -1).join(' | ');   // the example may carry "| text"
    return { name: sig.split(/\s+/)[0], sig, example, desc }; }) }));
// WB_CATS = the plain whiteboard prompt's categories; WB_EXTRA = subject-only ones (the player loads both).
const WB_CATS = cats('wb-load.js', 'WB_CATS');
// Realistic drawings adapted from Servier Medical Art (18 Oct 2026; scripts/servier): loaded on demand by the player,
// found only through find_drawing (too many to list in a prompt). One search category per subject.
const SV = JSON.parse(fs.readFileSync(path.join(genDir, '..', '..', '..', 'scripts', 'servier', 'sv-catalogue.json'), 'utf8'));
const svCat = (cat, subject) => ({ cat, lines: SV.filter(d => d.subject === subject).map(d => ({ name: d.id, sig: `sv id=${d.id} cx cy height`,
  example: `sv id=${d.id} 480 270 460`, desc: `${d.name} (realistic; width ${(d.w / 1000).toFixed(2)} x its height): ${d.tags.join(' ')}${d.parts ? `; parts: ${d.parts.join(' ')}` : ''}` })) });
const SV_CATS = [svCat('servier', 'biology'), svCat('servier-chem', 'chemistry')];
const isSv = c => c.cat.startsWith('servier');
const WB_ALL = [...catalogueOf('wb', [...WB_CATS, ...cats('wb-load.js', 'WB_EXTRA')]), ...SV_CATS];
const WB_LIB = WB_ALL.filter(c => WB_CATS.includes(c.cat));
const libIndex = lib => lib.map(c => isSv(c)
  ? `  ${c.cat}: ${c.lines.length} realistic drawings, not listed: find them with find_drawing query words (e.g. "kidney nephron"), then draw with "sv id=<name> cx cy height"`
  : `  ${c.cat}: ${c.lines.map(l => l.name).join(' ')}`).join('\n');
const PRIMITIVES = ['circle', 'ellipse', 'rect', 'line', 'arrow', 'path', 'text', 'tag'];
const typesOf = lib => new Set([...PRIMITIVES, ...RECIPE_NAMES, ...lib.filter(c => !isSv(c)).flatMap(c => c.lines.map(l => l.name)), ...(lib.some(isSv) ? ['sv'] : [])]);
const TYPES = typesOf(WB_ALL);                                    // what the checks accept: every loaded drawing
const COMMANDS = new Set(['draw', 'write', 'fill', 'pop', 'fade', 'go', 'cam', 'wait', 'loop', 'travel']);
const LOOPS = new Set(['beat', 'flow', 'fall', 'rise', 'sway', 'swing']);
const catalogue = fs.readFileSync(path.join(genDir, 'recipe-catalogue.md'), 'utf8');

// lib = the categories this prompt lists; teach = a subject's teaching rules ('' for the plain prompt, which must stay
// byte-identical to the prototype's).
const wbRules = (lib, teach = '') => `You turn a question into a 30-60 second voiced whiteboard lesson, written as ONE JSON object that our
player draws live on a 960x540 board. Reply with the JSON object only: no prose, no code fences.

Shape: {"q": "<the question>", "els": {"<id>": "<element line>", ...}, "steps": [{"say": "<one spoken sentence>", "do": ["<command>", ...]}, ...]}
- 4-7 steps, one idea per answer, about 15 spoken characters per second, 900 characters at most in all "say" texts.
- "els" lists every object on the board (order = back to front). Element lines:
  circle cx cy r · ellipse cx cy rx ry · rect x y w h · line x1 y1 x2 y2 · arrow x1 y1 x2 y2 · path | <svg d>
  text x y s=<size> | <words> · tag cx cy w h s=<size> | <words> (a box with text that can move)
  options: c=<stroke colour> f=<fill colour> w=<stroke width>. Prefer a recipe below over raw paths.
- Commands in "do" (run in order; a leading & = do not wait):
  draw <id> [ms] · write <id> [ms] · fill <id> <id>... · pop <id> [scale] · fade <id> <opacity> [ms]
  go <tagId> <ms> x y [x y ...] · wait <ms> · loop <id> beat|flow|fall|rise|sway|swing
  travel <id1,id2,...> <ms> [loop]
- Every id used in "do" must exist in "els". Keep everything inside the board. Never let labels overlap drawings.
- Motion is the product: something pops when it appears, loops keep the scene alive, and at least one travel or go
  shows the idea moving. The whole board is always in view (there is no camera or zoom), so the viewer sees where
  things come from and go to: draw every part big enough to read at full size, and use the whole 960x540.
- Numbered steps with a visible flow: every step's "say" begins "Step 1:", "Step 2:" and so on, and every step adds
  one small numbered tag on the board (e.g. tag 150 60 170 44 s=20 | 1. Key turns: the number plus 2-4 words naming
  that step), placed in reading order (left to right, then the next row) and never over a drawing. From step 2 on,
  draw an arrow or flow from the previous step's part of the board to this step's, so the eye follows 1 → 2 → 3.
  The worked examples below were made before this rule: follow the rule, not them, on numbering.
- Only these element types exist: ${[...typesOf(lib)].join(', ')}.${teach}

Recipe catalogue (one line draws a full illustrated object):
${catalogue}
More recipes, by subject (names only). Before you write the script, call find_drawing with the names you want
(or a query like "blood pressure") to get each one's exact signature and options; use only signatures you fetched.
${libIndex(lib)}
Worked examples (hand-made, approved; match their quality):
${EXAMPLES.map(a => JSON.stringify(a)).join('\n')}`;
const RULES = wbRules(WB_LIB);

// ---------- Subjects (founder, 18 Oct 2026): a chat's subject picks its own whiteboard prompt and drawing library ----------
// Each subject prompt lists only its categories (plus the shared diagrams) and adds how to teach that subject.
// find_drawing searches the same categories. Each is its own prompt cache entry (its own prompt_sha).
const SUBJECTS = {
  biology: { cats: ['anatomy', 'servier', 'biology', 'cells', 'body', 'health', 'diagrams'], teach: `
- Teaching biology: name the real structures with their proper names (labelled drawings, lab=1), then show what they
  do: follow one thing (blood, air, food, a nerve signal, water, sugar) as it travels through them with travel or go.
  For these topics use the detailed diagrams: heartsection, circulation, breathing, gut, reflexarc, dnaladder,
  cellcycle, leafsection, plantparts. One big labelled diagram plus the step tags reads better than many small
  pictures. Keep the facts correct at school level; the body's right side is on the viewer's left.
- For the heart, prefer heartcut (a realistic drawing) over heartsection. Draw it in step 1 (draw, then fill), then
  in each step add one pin for each part that step talks about (draw the pin when its part is spoken about), so the
  names appear one by one as they are explained. Keep heartcut near the middle (x 440-500) so the pins' words fit on
  both sides; leave the left 200 and right 260 pixels free for them and put nothing else there.
- For any other organ, cell, tissue, microbe or molecule, first search the realistic library: find_drawing with a
  short query (e.g. "lungs alveoli", "neuron synapse", "mitochondria"); draw a match with "sv id=<name> cx cy height"
  (draw it, then fill it), one or two per lesson, big. When its search result lists "parts: ...", point at them with
  pins ("p1": "pin of=<its element id> part=<part>"), drawn one by one in the step that explains each part; centre the
  drawing and keep the left 200 and right 260 pixels free for the pins' words. Otherwise label it with your own text.` },
  physics: { cats: ['physics', 'engineering', 'tech', 'earth', 'math', 'diagrams'], teach: `
- Teaching physics: show the cause and the effect, with forces, energy and waves drawn as arrows. Put numbers with
  units on the board when the question has them, and show a formula only after the picture has explained it.` },
  chemistry: { cats: ['servier-chem', 'chemistry', 'earth', 'math', 'diagrams'], teach: `
- Teaching chemistry: show the particles (atoms, molecules, ions) and what changes and what stays the same. Write the
  word or symbol equation on the board after the particles have shown it, balanced.` },
};
const SUBJECT_RULES = Object.fromEntries(Object.entries(SUBJECTS).map(([s, { cats: cs, teach }]) =>
  [s, wbRules(cs.map(c => WB_ALL.find(x => x.cat === c)), teach)]));

// ---------- Paper motion (stop-motion / paper): scenes of library drawings on a 960x600 canvas ----------
const smCtx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(here, 'stopmotion-answers.js'), 'utf8'), smCtx);
const SM_EXAMPLES = smCtx.window.SM_ANSWERS;
const smSrc = fs.readFileSync(path.join(here, 'stopmotion-topics.html'), 'utf8');
const PAPER_LIB = catalogueOf('paper', cats('paper-load.js', 'PAPER_CATS'));
const LIB_NAMES = new Set([...[...smSrc.slice(smSrc.indexOf('const LIB = {'), smSrc.indexOf('const CMDS')).matchAll(/^  (\w+): /gm)].map(m => m[1]), ...PAPER_LIB.flatMap(c => c.lines.map(l => l.name))]);
const PAPER_LIB_INDEX = PAPER_LIB.map(c => `  ${c.cat}: ${c.lines.map(l => l.name).join(' ')}`).join('\n');
const FLOW_ITEMS = new Set(['dot', 'drop', 'co2', 'o2']);
const BLOOD_PATHS = new Set(['in', 'lungs', 'back', 'out']);

const PAPER_RULES = `You turn a question into a 30-60 second voiced lesson in our paper-motion style: flat cut-paper shapes on a
full-frame colour, smooth motion, NOTHING written inside the frame (no words, numbers or labels; the voice explains).
Reply with ONE JSON object only: no prose, no code fences.

Shape: {"key": "<short-id>", "q": "<the question>", "steps": [{"say": "<one spoken sentence>", "bg": "#rrggbb", "do": ["<drawing>", ...]}, ...]}
- 4-7 steps (scenes), one idea per answer, about 15 spoken characters per second, 900 characters at most in all "say" texts.
- Each scene is redrawn from scratch: list every drawing it shows, back to front. Give each scene its own deep, clear
  background colour ("bg") that contrasts with what is drawn on it.
- Canvas 960x600. Points are x,y with a comma (e.g. 480,300). Plain numbers are sizes. word=value sets an option.
  Any drawing takes at=<seconds> to appear late in its scene.
- Drawings:
  glow x y r #colour (soft light behind things) · ground y · zoom x y scale (put first: zooms the scene)
  disc x y r #fill [edge=#colour] [grow] · box x y w h #fill [r=corner] [edge=#colour] · shape x,y x,y x,y ... #fill [edge=#colour]
  line x,y x,y ... [c=#colour] [lw=width] [arrow] [dash] [draw] (draw = the line grows along its points)
  flow <dot|drop|co2|o2> x,y x,y ... [n=count] [c=#colour for dot] [size=] [speed=] [once gap= dur= spread=] [fade] [wobble=]
     (things travelling along a path: loop forever, or "once" set off one after another and vanish on arrival)
  flash x y (a bright burst) · sun x y r · cloud x y scale [grow] [darken] · rain x1 x2 y [snow=x] · vapour x y [n=] [gap=] [h=]
  plant [glow] · leaf x y scale [angle] · stem x,y x,y · soil y x · pores x,y ... · cells · sugar x y [n=]
  land [flow] (sea, hills, river) · cycle [grow] (the water-cycle loop) · beams x,y x,y [n=]
  heart x y scale · heart map (the heart diagram) · ring x y (a beat ring) · blood in|lungs|back|out [dim] (only with heart map)
- More drawings, by subject (names only). Before you write, call find_drawing with the names you want (or a query
  like "volcano") to get each one's exact signature and options; use only signatures you fetched:
${PAPER_LIB_INDEX}
- Motion is the product: every scene has something moving (flow, grow, draw, at=). Prefer the generic pieces (disc, box,
  shape, line, flow dot) for objects without a special drawing. Keep everything inside the canvas.
- Only these drawing names exist: ${[...LIB_NAMES].join(', ')}.

Worked examples (hand-made, approved; match their quality):
${SM_EXAMPLES.map(a => JSON.stringify(a)).join('\n')}`;

// ---------- Match-cut: one object keeps moving and flows into the next, on a 960x384 band ----------
const mcCtx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(here, 'matchcut-answers.js'), 'utf8'), mcCtx);
const MC_EXAMPLES = mcCtx.window.MC_ANSWERS;
const TEXTURES = new Set(['dots', 'streaks', 'lines', 'grid', 'none']);
// Object library: lib/mc/*.json, each { name: {L, top, bot, fill, edge, parts?, lines?, glow?, desc} }
const MC_LIB = Object.assign({}, ...fs.readdirSync(path.join(here, 'lib', 'mc')).filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(fs.readFileSync(path.join(here, 'lib', 'mc', f), 'utf8'))));
const MC_LIB_TEXT = Object.entries(MC_LIB).map(([n, o]) => `${n} (${o.desc})`).join(', ');

const MC_RULES = `You turn a question about change over time into a 20-40 second voiced match-cut lesson: ONE object keeps
moving across a wide band and, over one second at each change, its outline and colours flow into the next object
(like a stick turning into a quill turning into a pen). Flat shapes, one main colour each, dark outline. NOTHING is
written inside the frame; the voice explains. Reply with ONE JSON object only: no prose, no code fences.

Shape: {"q": "<the question>", "move": "fly" | "write", "objects": [<object>, ...]}
- 4-7 objects in time order, one spoken sentence each ("say"), about 15 characters per second, 700 characters at most
  in all "say" texts. "write" = the objects are writing tools that leave a trail ("mark" colour); "fly" = the object
  glides forward while the background streams past (vehicles, animals, machines, anything else).
- An object: {"say": "...", "L": <length 200-420>, "top": [11 numbers], "bot": [11 numbers], "fill": "#rrggbb",
  "edge": "#rrggbb", "parts": [[u0, u1, "#rrggbb"], ...], "lines": [[u0, v0, u1, v1, "#rrggbb", width], ...],
  "bg": "#rrggbb", "texture": "dots"|"streaks"|"lines"|"grid"|"none", "tex": "#rrggbb", "mark": "#rrggbb", "glow": "#rrggbb"}
  - The object lies along its length, tail (left) to nose (right), pointing right. "top" and "bot" are its half-heights
    above and below that axis at 11 evenly spaced points from tail to nose, 0-80 each. 0 at an end = a point.
    Draw a SIDE VIEW silhouette that is recognisable from its outline alone (a car: low long body with a raised cabin;
    a rocket: long body, pointed nose; a fish: fat middle, thin tail).
  - "parts" colour a slice of the body from u0 to u1 (0 = tail, 1 = nose): windows, bands, a tip. "lines" draw a line
    from (u0, v0) to (u1, v1) where v runs -1 (top edge) to 1 (bottom edge).
  - "bg" is the whole frame behind this object, with a "texture" in colour "tex". Change the background with the era.
  - "mark" (write only) = the colour of the trail; "glow" (optional) = a soft glow, for screens and light.
  - parts, lines, tex, mark and glow are optional.
- Contrast: the object must stand out clearly from its "bg".
- Ready-made objects: instead of L/top/bot/fill/edge/parts/lines you may write "use": "<name>" (you can still set
  fill, edge, glow, bg, texture, tex, mark on top). Prefer them when they fit. Library: ${MC_LIB_TEXT || '(empty)'}

Worked example (hand-made, approved; match its quality):
${MC_EXAMPLES.map(a => JSON.stringify(a)).join('\n')}`;

const sha = t => crypto.createHash('sha256').update(t).digest('hex');
export function buildPrompts() {
  return {
    model: MODEL,
    styles: {
      whiteboard: { system: RULES, sha256: sha(RULES) },
      paper: { system: PAPER_RULES, sha256: sha(PAPER_RULES) },
      matchcut: { system: MC_RULES, sha256: sha(MC_RULES) },
    },
    // whiteboard prompts per chat subject; cats = the library categories it lists and find_drawing searches
    subjects: Object.fromEntries(Object.entries(SUBJECT_RULES).map(([s, t]) => [s, { system: t, sha256: sha(t), cats: SUBJECTS[s].cats }])),
    wbCats: WB_CATS,
    // the named parts of each anatomy drawing (its catalogue line's "parts: ..."), so the checks can verify pins
    parts: Object.fromEntries(WB_ALL.flatMap(c => c.lines).filter(l => /parts: /.test(l.desc)).map(l => [l.name, l.desc.split('parts: ')[1].trim().split(/\s+/)])),
    svIds: SV.map(d => d.id),
    svParts: Object.fromEntries(SV.filter(d => d.parts).map(d => [d.id, d.parts])),
    types: [...TYPES], commands: [...COMMANDS], loops: [...LOOPS],
    libNames: [...LIB_NAMES], flowItems: [...FLOW_ITEMS], bloodPaths: [...BLOOD_PATHS], textures: [...TEXTURES],
    wbLib: WB_ALL, paperLib: PAPER_LIB, mcLib: MC_LIB,
    examples: { whiteboard: EXAMPLES, paper: SM_EXAMPLES, matchcut: MC_EXAMPLES },
  };
}
export const PROMPTS_FILE = path.join(genDir, 'prompts.json');
export const serialize = () => JSON.stringify(buildPrompts()) + '\n';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const next = serialize();
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(PROMPTS_FILE) ? fs.readFileSync(PROMPTS_FILE, 'utf8') : '';
    if (cur !== next) { console.error('prompts.json is stale: run node src/lib/generation/build-prompts.mjs'); process.exit(1); }
    console.log('prompts.json is up to date');
  } else {
    fs.writeFileSync(PROMPTS_FILE, next);
    const p = buildPrompts();
    for (const [s, v] of [...Object.entries(p.styles), ...Object.entries(p.subjects)]) console.log(s, v.sha256);
  }
}
