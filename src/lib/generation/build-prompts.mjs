// Builds src/lib/generation/prompts.json: each style's cached system prompt (+ sha256) and the library data the
// checks and find_drawing need, so nothing is read from disk during a request (PLAN.md §7.1, §7.6).
//   node src/lib/generation/build-prompts.mjs          writes prompts.json
//   node src/lib/generation/build-prompts.mjs --check  exits 1 if prompts.json is stale (tests run the same compare)
// The prompt half below is copied VERBATIM from prototype/server.mjs (lines 21-37, 39-111, 130-138, 148-174 on
// 12 Oct 2026). Only two lines differ: `here` is app/public/player (the library's only copy since 20 Oct 2026), and the recipe
// catalogue is read from recipe-catalogue.md (the "## Recipe catalogue" section of PROCESS.md, copied byte for byte).
// tests/generation/prompts.test.ts proves each style's sha256 equals the prototype's. Any change here is a
// deliberate new prompt_sha. The subject prompts (SUBJECTS below, 18 Oct 2026) are new and have no prototype twin.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const genDir = path.dirname(fileURLToPath(import.meta.url));
const here = path.join(genDir, '..', '..', '..', 'public', 'player');
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
// servier-phys: physics colour drawings (Fluent Emoji, scripts/physics-emoji; 19 Oct 2026), searched the same way.
// servier-car, servier-home: realistic car and home drawings (scripts/fixes-art; 20 Oct 2026).
const SV_CATS = [svCat('servier', 'biology'), svCat('servier-chem', 'chemistry'), svCat('servier-phys', 'physics'),
  svCat('servier-car', 'car'), svCat('servier-home', 'home')];
const isSv = c => c.cat.startsWith('servier');
const WB_ALL = [...catalogueOf('wb', [...WB_CATS, ...cats('wb-load.js', 'WB_EXTRA')]), ...SV_CATS];
const WB_LIB = WB_ALL.filter(c => WB_CATS.includes(c.cat));
const libIndex = lib => lib.map(c => isSv(c)
  ? `  ${c.cat}: ${c.lines.length} realistic drawings, not listed: find them with find_drawing query words (e.g. "kidney nephron"), then draw with "sv id=<name> cx cy height"`
  : `  ${c.cat}: ${c.lines.map(l => l.name).join(' ')}`).join('\n');
const PRIMITIVES = ['circle', 'ellipse', 'rect', 'line', 'arrow', 'path', 'text', 'tag'];
const typesOf = lib => new Set([...PRIMITIVES, ...RECIPE_NAMES, ...lib.filter(c => !isSv(c)).flatMap(c => c.lines.map(l => l.name)), ...(lib.some(isSv) ? ['sv'] : [])]);
const TYPES = typesOf(WB_ALL);                                    // what the checks accept: every loaded drawing
const COMMANDS = new Set(['draw', 'write', 'fill', 'pop', 'fade', 'go', 'cam', 'wait', 'loop', 'travel', 'mark', 'set', 'zoom']);   // set, zoom: Anatomy prompts only
const LOOPS = new Set(['beat', 'flow', 'fall', 'rise', 'sway', 'swing']);
const catalogue = fs.readFileSync(path.join(genDir, 'recipe-catalogue.md'), 'utf8');

// lib = the categories this prompt lists; teach = a subject's teaching rules ('' for the plain prompt, which must stay
// byte-identical to the prototype's).
// cam: the Anatomy prompts' camera and notes column (founder, 26 Oct 2026); without it the text is the production prompt
const wbRules = (lib, teach = '', cam = false) => `You turn a question into a 30-60 second voiced whiteboard lesson, written as ONE JSON object that our
player draws live on a 960x540 board. Reply with the JSON object only: no prose, no code fences.

Shape: {"q": "<the question>", "els": {"<id>": "<element line>", ...}, "steps": [{"say": "<one spoken sentence>", "do": ["<command>", ...]}, ...]}
- 4-7 steps, one idea per answer, about 15 spoken characters per second, 900 characters at most in all "say" texts.
- "els" lists every object on the board (order = back to front). Element lines:
  circle cx cy r · ellipse cx cy rx ry · rect x y w h · line x1 y1 x2 y2 · arrow x1 y1 x2 y2 · path | <svg d>
  text x y s=<size> | <words> · tag cx cy w h s=<size> | <words> (a box with text that can move)
  options: c=<stroke colour> f=<fill colour> w=<stroke width>. Prefer a recipe below over raw paths.${cam ? `
  note | <words> (one line in the notes column)` : ''}
- Commands in "do" (run in order; a leading & = do not wait):
  draw <id> [ms] · write <id> [ms] · fill <id> <id>... · pop <id> [scale] · fade <id> <opacity> [ms]
  go <tagId> <ms> x y [x y ...] · wait <ms> · loop <id> beat|flow|fall|rise|sway|swing
  travel <id1,id2,...> <ms> [loop]${cam ? ' · zoom <id>[.<part>] [scale 1-3] · zoom out' : ''}
- Every id used in "do" must exist in "els". Keep everything inside the board. Never let labels overlap drawings.
${cam ? CAM_RULES : `- Motion is the product: something pops when it appears, loops keep the scene alive, and at least one travel or go
  shows the idea moving. The whole board is always in view (there is no camera or zoom), so the viewer sees where
  things come from and go to: draw every part big enough to read at full size, and use the whole 960x540.
- Numbered steps with a visible flow: every step's "say" begins "Step 1:", "Step 2:" and so on, and every step adds
  one small numbered tag on the board (e.g. tag 150 60 170 44 s=20 | 1. Key turns: the number plus 2-4 words naming
  that step), placed in reading order (left to right, then the next row) and never over a drawing. From step 2 on,
  draw an arrow or flow from the previous step's part of the board to this step's, so the eye follows 1 → 2 → 3.
  The worked examples below were made before this rule: follow the rule, not them, on numbering.
`}- Only these element types exist: ${[...typesOf(lib), ...(cam ? ['note'] : [])].join(', ')}.${teach}

Recipe catalogue (one line draws a full illustrated object):
${catalogue}
More recipes, by subject (names only). Before you write the script, call find_drawing with the names you want
(or a query like "blood pressure") to get each one's exact signature and options; use only signatures you fetched.
${libIndex(lib)}
Worked examples (hand-made, approved; match their quality):
${EXAMPLES.map(a => JSON.stringify(a)).join('\n')}`;
// The Anatomy prompts' version of the two rules above: a camera that moves in on what is named, and notes that stay
const CAM_RULES = `- Motion is the product: something pops when it appears, loops keep the scene alive, and at least one travel or go
  shows the idea moving.
- Camera, like a teacher stepping close to the board: the board starts and ends whole. On the word that names a thing,
  zoom moves in on it: "@burette zoom b", or one named part of a detailed 3D drawing: "@tap zoom b.tap" (the parts
  are its lit= names). zoom out shows the whole diagram again: use it before a step that names things far apart. The
  player zooms out by itself for a travel or a go (a movement shows where it comes from and goes to) and at the end.
  Zoom on the one or two things each step is about; draw a thing before you zoom on it.
- Notes the viewer can copy: the right of the board, x 660-950, is the notes column, and the camera never moves it.
  Keep every drawing, label and tag in x 0-640. Each step adds one note, "n1": "note | 1. Alkali + indicator in
  flask" (notes stack top to bottom in the order listed), written on its word: "@indicator write n1". A note is the
  step's key fact, formula or number in at most 32 characters, numbered like the step. Notes stay to the end, so the
  last board is the summary; they replace the numbered step tags (no step tags on the diagram).
- Numbered steps: every step's "say" begins "Step 1:", "Step 2:" and so on.
  The worked examples below were made before these rules: follow the rules, not them, on the camera and notes.
`;
const RULES = wbRules(WB_LIB);

// ---------- Subjects (founder, 18 Oct 2026): a chat's subject picks its own whiteboard prompt and drawing library ----------
// Each subject prompt lists only its categories (plus the shared diagrams) and adds how to teach that subject.
// find_drawing searches the same categories. Each is its own prompt cache entry (its own prompt_sha).
const SUBJECTS = {
  biology: { cats: ['anatomy', 'servier', 'servier-chem', 'servier-phys', 'servier-car', 'servier-home', 'objects', 'biology', 'biouni', 'biogr', 'life', 'cells', 'body', 'health', 'world', 'earth', 'diagrams'], teach: `
- Teaching biology: name the real structures with their proper names (labelled drawings, lab=1), then show what they
  do: follow one thing (blood, air, food, a nerve signal, water, sugar) as it travels through them with travel or go.
  For these topics use the detailed diagrams: heartsection, circulation, breathing, gut, reflexarc, dnaladder,
  cellcycle, leafsection, plantparts. One big labelled diagram plus the step tags reads better than many small
  pictures. Match the depth to the asker (the app serves school students and university biology majors): a school
  question gets the school picture; a university one gets the mechanism with its proper terms (named molecules,
  receptors, pathways, cell types). Keep the facts correct; the body's right side is on the viewer's left.
  University diagrams are recipes (biouni): michaelis, lightreactions, calvin, glycolysis, krebs, atpsynthase, codon,
  operon, pedigree, hardyweinberg, pcrcycle, speciation, popgrowth, actionpotential, o2curve, proteinlevels, elisa.
  Graduate (biogr): aminoacid, foldfunnel, ramachandran, cryoem, alignment, phylotree, genenetwork, mapk, wnt, rtk,
  cyclins, methylation, splicing, rnai, ngsflow, flowcytometry, vdj, nernst, channelgating, ltp, morphogen, allosteric,
  metabolicmap, geneticdrift, lotkavolterra, quorum, qpcrcurve.
  Molecules (glucose, amino acids, ATP, lipids, bases) are structures: search "<name> structure".
- For the heart, prefer heartcut (a realistic drawing) over heartsection. Draw it in step 1 (draw, then fill), then
  in each step add one pin for each part that step talks about (draw the pin when its part is spoken about), so the
  names appear one by one as they are explained. Keep heartcut near the middle (x 440-500) so the pins' words fit on
  both sides; leave the left 200 and right 260 pixels free for them and put nothing else there.
- For any other organ, cell, tissue, plant, animal, microbe or molecule, first search the realistic library:
  find_drawing with a short query (e.g. "lungs alveoli", "neuron synapse", "seedling root", "honey bee"; at university
  level also cells, organelles, receptors and complexes: "T cell receptor MHC", "NADPH oxidase", "nucleosome",
  "B cell", "antibody", "aquaporin"); draw a match with "sv id=<name> cx cy height"
  (draw it, then fill it), one or two per lesson, big. When its search result lists "parts: ...", point at them with
  pins ("p1": "pin of=<its element id> part=<part>"), drawn one by one in the step that explains each part; centre the
  drawing and keep the left 200 and right 260 pixels free for the pins' words. Otherwise label it with your own text.
- Over a realistic drawing (heartcut or sv) put no tags, text or shapes: they hide the picture and cross the pins'
  lines. Name and explain its parts only with pins (a pin's "| words" can say what the part does, at most 4 words).
  To show something moving through it (blood, air, food, a signal), use at most one arrow or one travel per step,
  following the real path inside the drawing, in a colour that differs from the part under it (blue or dark on red);
  it gets a white edge so it stands out. Put the numbered step tags in one row above or below it, clear of it.
  Never travel along the arrows between the step tags: a moving dot means something flows there.
- Whole plants and animals are whiteboard drawings, not realistic ones: use the world recipes first (critter, animal,
  wild, bird, seacreature, tree, flower, grass, mushroom; critter has life-cycle stages: eggs, caterpillar, chrysalis,
  larva, pupa, spawn, tadpole) and the biology ones (seedling, plantparts, flowerparts). Use an sv drawing of a whole
  organism only when no recipe has it.
- Food chains and webs, life cycles, classification and evolution: draw each organism (height 120-200) in a row, a
  circle or a tree, each labelled with your own text below it, joined by arrows (in a food chain the arrow points to
  the eater: the way energy flows). Draw only what the library lacks yourself.
- Ecology and evolution have their own recipes (life): nitrogencycle, carboncycle, habitat (draw it first as the
  scene, animals on top), cactus and polar bear for adaptation, fungus for decomposers, finch for Darwin's beaks,
  pepperedmoth for natural selection, cladogram for an evolution tree, homolog for homologous limbs, fossil; the other kingdoms: protist, fungus,
  lowerplant (moss, fern), dispersal for seeds. And for the rest of the syllabus: osmosis, diffusion, respiration
  (aerobic, anaerobic, yeast), fermentation, transpiration, energypyramid, quadrat, geneticengineering, cloning,
  kingdoms. Everyday things (fruit cut open, seeds, bread, a test tube, a balloon, a factory, a car, smog, a log, the
  sun, rain) are colour drawings: search "<thing> colour".
- For one particular animal or plant, take the first that exists (founder, 19 Oct 2026): a whiteboard recipe, then a
  realistic coloured drawing, then its silhouette (search "<animal> silhouette": one dark cut-out shape), and only
  then draw it yourself. Silhouettes also suit classification and evolution trees: all alike, a row of them reads
  cleanly.
- Before you draw any organ, cell, tissue, plant, animal, microbe or molecule yourself, search for it: call find_drawing with two or
  three different words for it (e.g. "alveolus", "air sac", "gas exchange"), and use a realistic drawing or a recipe
  when one fits. Only when none fits, draw it yourself the way a textbook would (the layers below): never a plain
  circle or box standing in for a body part (an alveolus is a cluster of round sacs on a branching tube; a cell is a
  soft blob with a nucleus and organelles).` },
  physics: { cats: ['anatomy', 'physics', 'phys', 'physuni', 'physadv', 'physgr', 'servier-phys', 'servier', 'servier-chem', 'servier-car', 'servier-home', 'objects', 'engineering', 'tech', 'earth', 'math', 'diagrams'], teach: `
- Teaching physics: show the cause and the effect, with forces, energy and waves drawn as arrows. Put numbers with
  units on the board when the question has them, and show a formula only after the picture has explained it.
- Match the depth to the asker (the app serves school students and university physics majors): a school question gets
  the school picture; a university one gets the real model and its equations (fields, wavefunctions, frames, cycles),
  with the symbols defined on the board. University diagrams are recipes (physuni): wave optics (doubleslit,
  diffraction, thinfilm, polarisation, michelson), Maxwell (emwave, gauss, capacitorfield, maxwelleqs), quantum
  (wellbox, tunnelling, energylevels, compton, orbitals, sterngerlach, wavepacket), relativity (lightclock, spacetime,
  contraction), thermodynamics (pvcycle, heatengine, speeddist), solid state (bands, crystal, pnjunction).
  More (physadv): kepler, rotation, resonance, bernoulli, standingwave, doppler, efield, rccircuit, phasor, righthand,
  qho, curvedspace, standardmodel, feynman, transistor, laser, halleffect, hrdiagram, blackbody.
  Graduate (physgr): doublependulum, phasespace, normalmodes, gyroscope, laminar, fourier, multipole, waveguide,
  dipoleradiation, boltzmann, quantumstats, ising, bec, blochsphere, radialwave, zeeman, crosssection, belltest,
  qcircuit, detector, phonons, bandstructure, superconductor, hubble, gravwave, bindingenergy.
- Diagrams are recipes (physics, phys): circuits with symbols, ray diagrams, field lines, forces, waves, the atom.
  Everyday objects the lesson talks about (a bulb, a magnet, a rocket, a bicycle, a guitar, a planet, a moon phase, a
  stopwatch) are colour drawings: search "<thing> colour" and draw with "sv id=<name> cx cy height", one or two per
  lesson, beside the diagram, never instead of it.` },
  chemistry: { cats: ['anatomy', 'servier-chem', 'servier', 'servier-phys', 'servier-car', 'servier-home', 'objects', 'chemistry', 'chemuni', 'chemgr', 'earth', 'math', 'diagrams'], teach: `
- Teaching chemistry: show the particles (atoms, molecules, ions) and what changes and what stays the same. Write the
  word or symbol equation on the board after the particles have shown it, balanced.
- Match the depth to the asker (the app serves high-school, AP and college chemistry students): a school question gets
  the particle picture; a college one gets the model and its equations. Diagrams are recipes (chemuni): econfig,
  trends, lewis, vsepr, hybrid, modiagram, hbond, phasediagram, heatingcurve, gaslaw, mole, energyprofile,
  collisiontheory, equilibrium, titration, buffer, electrolysis, calorimeter, bornhaber, irspectrum, nmrspectrum,
  massspec, beerlambert, functionalgroups, sn2, crystalfield, rateorder. Graduate (chemgr): pointgroup, huckel, pes, marcus,
  dielsalder, fmo, aldol, grignard, wittig, eas, retrosynthesis, catcycle, complexgeom, bragg, cosy, jcoupling,
  jablonski, cyclicvolt, chromatogram, arrhenius, gibbs, langmuir, polymerization, bandofstability, binaryphase,
  colligative, raoult. A named molecule (benzene, glucose, aspirin,
  an amino acid) is a drawn structure: search "<name> structure" and draw it with sv.` },
  // Everyday fixes (founder, 20 Oct 2026): any real-life "how to", not only school. Two subjects, so a home question
  // never loads car drawings and the other way round.
  car: { cats: ['anatomy', 'carfix', 'servier-car', 'servier-home', 'servier-phys', 'servier', 'servier-chem', 'objects', 'engineering', 'tech', 'daily', 'diagrams'], teach: `
- Teaching car: (car care and fixes, for any driver, not mechanics) show the job as the steps a person really does,
  in order: what you need first (tools and parts, drawn), where it is on the car, then each action on the part it
  touches. Everyday names first, the proper name beside them (the lug nuts, the oil drain plug).
- Safety, said and shown in the step where it matters: flat ground, parking brake on, hazard lights and the warning
  triangle on a road, the engine off and cool before oil or coolant, never under a car held only by a jack. When a job
  needs a mechanic (brakes feel wrong, a red warning light stays on, airbags, a fuel smell), say so plainly.
- Numbers go on the board with units (tire pressure in psi, oil in quarts, torque in ft-lb), but never invent one
  car's values: say where to read them (the owner's manual, the sticker in the driver's door jamb).
- Car how-to diagrams (carfix): car (k=side|jacked), lugwrench, lugorder (the star order for tightening lug nuts),
  warntriangle, enginebay, dipstick (level=), oildrain (flow=1), oilfilter, oilbottle, jumpstart (the clamp order),
  treaddepth, wiper, dashlight (k=engine|oil|battery|temp|brake|tpms), airfilter, fusebox, gearstick, muffler.
  Shared objects (objects): tire, jack, carbattery, tiregauge, brakes, radiator, belt, headlight, handtool, toolbox.
  Other real parts and tools (a battery, jumper cables, a spark plug, a brake disc, a tire gauge, a wiper) are
  realistic drawings: search find_drawing "<thing> car" and draw with "sv id=<name> cx cy height", one or two big.` },
  home: { cats: ['anatomy', 'homefix', 'servier-home', 'servier-car', 'servier-phys', 'servier', 'servier-chem', 'objects', 'daily', 'tech', 'diagrams'], teach: `
- Teaching home: (home fixes and everyday how-to) show the job as the steps a person really does, in order: what
  you need first (tools and parts, drawn), where it is in the home, then each action on the part it touches.
  Everyday names first, the proper name beside them (the flapper, the shutoff valve).
- Safety, said and shown in the step where it matters: power off at the breaker before touching wiring (and check it
  is off), water off at the shutoff valve before opening a pipe, a steady ladder, never mix cleaning chemicals
  (bleach with ammonia or acids). A gas smell: leave and call the gas company. Wiring past a switch, outlet or
  breaker reset, gas lines and anything structural: say a licensed pro should do it.
- Home how-to diagrams (homefix): tieknot (k=1|2|3|4, the four steps of tying a tie), breaker (trip=N), ptrap
  (leak=1), toilettank (k=ok|running), studfinder, furnacefilter, caulkgun, drywall (k=hole|patch), paintroller.
  Shared objects (objects): handtool (k=hammer|screwdriver|wrench|pliers), toolbox, tapemeasure, spiritlevel, ladder,
  outlet (k=standard|gfci), lightswitch, thermostat, smokealarm, waterheater, iron, plunger, shutoff, extinguisher
  (k=plain|1|2|3|4, PASS), wallstuds; rooms and appliances are in daily (sink, washer, door, lamp, stove). Other real fixtures and tools (a toilet tank, a faucet, an outlet, a plunger, a stud
  finder, a paint roller) are realistic drawings: search find_drawing "<thing> home" and draw with
  "sv id=<name> cx cy height", one or two big.` },
};
// Drawing what the library lacks (founder, 19 Oct 2026): the layers our own recipes use (lib/wb/world.js frogx), and
// names that let the server keep the drawing for a person to approve (drawings.ts, /admin). Per subject since the
// first real off-library videos (19 Oct): the animal layers suit biology, but a physics device came out as loose boxes
// and a chemistry cage with bent rings, so physics and chemistry get their own way of drawing.
const OWN_NAMES = `
  Name every element of it new_<name>_<part>, where <name> is one lowercase word for the object (new_hedgehog_body,
  new_hedgehog_eye), and keep its parts together in one place on the board: a person checks it and it becomes a
  library drawing for later lessons. Draw it in one step: draw its parts, then fill them.
- Keep every word in free space: never write over a drawing's own labels or formula (recipes carry their own), over
  another label or across a line; leave about 10 px around each.`;
const DRAW_OWN = {
  biology: `
- Drawing what the library lacks: when find_drawing has nothing that fits an object, draw it yourself with "path"
  elements in layers, back to front, the way our library drawings are made:
  1. the far parts (the far legs, the far wing) in a darker shade of the body colour;
  2. the main shape: its real outline in curves (C and Q), its real colour (f=) and a dark edge (c=, w=3);
  3. a shadow on its lower side: the same colour, darker, no edge (c=none);
  4. a lighter shape for the belly or underside;
  5. the details that make it recognisable: spots, stripes, veins, joints, toes, petals;
  6. an eye: a coloured iris, a dark pupil and a small white shine;
  7. one thin white highlight line along its top edge (c=#ffffff w=3).
  A cell, organelle or tissue: a soft irregular outline (never a perfect circle) with a double-line membrane, its
  contents in their real places and proportions (nucleus, organelles), each part its textbook colour.` + OWN_NAMES,
  physics: `
- Drawing what the library lacks: when find_drawing has nothing that fits a device or set-up, draw it yourself as a
  textbook cutaway, with "path", "rect" and "circle" elements, back to front:
  1. the frame or housing: light grey fill, dark edge (c=#455a64 w=3);
  2. each moving part in its own colour, joined the way it really is: a piston inside its cylinder, a rod from the
     piston to a crank pin on the wheel's rim, a shaft through the wheel's centre; compute the coordinates so parts
     meet (no gaps, no part floating);
  3. what works inside it (gas, liquid, current, light) as a coloured fill, dots or a ray, in the space it fills;
  4. motion as short arrows on the moving parts; heat or energy as thick arrows, red for hot, blue for cold;
  5. every part named with text beside it and a thin leader line, as a textbook figure is.
  Use real geometry: circles for wheels, straight walls, parts in proportion. Put formulas below the drawing.` + OWN_NAMES,
  chemistry: `
- Drawing what the library lacks: a named molecule is first searched as "<name> structure". When nothing fits, draw
  it yourself with real geometry, computed, not guessed:
  1. bonds as straight lines of one length (about 40 px): rings are regular (hexagon corners every 60 degrees,
     pentagons every 72), a double bond is two parallel lines, a triple bond three;
  2. atoms as small circles in CPK colours: C #333333, H #ffffff with a grey edge, O #e53935, N #1e88e5, S #fdd835,
     Cl #43a047, metals #b0bec5; label them with their symbol;
  3. a 3D shape (a cage, a crystal, a tetrahedron) as a projection: work out the corner points, draw the back edges
     dashed and lighter, the front ones solid; a sphere-like cage gets regular faces, not bent ones;
  4. a reaction step: curly arrows as curved paths from the electron pair to where it goes, charges and lone pairs
     shown;
  5. labels beside the structure with thin leader lines.` + OWN_NAMES,
};
const FIX_OWN = `
- Drawing what the library lacks: when find_drawing has nothing that fits a part, tool or fixture, draw it yourself
  as a clean product drawing with "path", "rect" and "circle" elements, back to front:
  1. the main body in its real colour with a dark edge (c=#2f3a45 w=3);
  2. the parts a person touches (handles, caps, valves, nuts, switches) in a contrasting colour, joined where they
     really join, in real proportions (round wheels, straight pipes);
  3. what moves or flows (water, oil, current, air) as a coloured fill or a flow arrow;
  4. the action as one bold arrow on the part being worked (turn, push, pull, unscrew);
  5. every part named with text beside it and a thin leader line.` + OWN_NAMES;
DRAW_OWN.car = FIX_OWN; DRAW_OWN.home = FIX_OWN;
// Reuse (founder, 20 Oct 2026): every drawing is an object any lesson may use; the model names its parts itself.
const REUSE = `
- Drawings are reusable: any library or realistic drawing can serve any lesson where that thing appears (a car
  battery in a circuit lesson, a ladder in a forces one, a heart in a sports one). The shared objects category (tools,
  fixtures, appliances, car parts) and every realistic drawing are searchable from every subject. Many drawings write
  their own part names or captions: when you reuse one for something else, or want your own words, add lab=0 to hide
  them and name the parts yourself (pins on realistic drawings, text with a thin leader line on the others).`;
// Like a teacher at the board (founder, 20 Oct 2026): the pen moves on the spoken word, and points back at what is
// already drawn. Subject prompts only: the plain prompt stays the prototype's.
const TEACHER = `
- Draw on the word, like a teacher at the board: start a command with @<word> and it runs the moment the voice says
  that word of this step's "say", e.g. say "Step 2: The nucleus holds the DNA." with do ["@nucleus draw nuc",
  "@DNA write dnaText"]. The word is written as it is in the say; cues follow the order their words are spoken. Cue the
  main drawing and naming commands of every step on the word that names the thing; a command with no cue runs as soon
  as the one before it ends.
- Point back, like a teacher: mark <id> circle|underline|point circles, underlines or points an arrow at something
  already on the board, from this step or an earlier one, in red chalk that fades after a moment. Cue it on the word
  that names it (e.g. "@valve mark v1 circle") when the voice comes back to that part or stresses a term or number.`;
// Show what you say, finish the story (founder, 22 Oct 2026, from beta feedback on "How does medicine know where to go":
// brain and muscles were only words at the end of a line, and the lesson stopped before the body cleared the drug).
const SHOW_AND_FINISH = `
- Show what you say: every concrete thing the voice names (an organ or body part, a place, a device, a molecule) is
  drawn on the board in the step that names it, cued on that word. Search find_drawing for it first: realistic
  drawings cover the organs (brain, heart, lungs, kidney, liver, muscle, stomach) and many devices. A word at the end
  of a line is not enough when a drawing exists. If a step names more things than the board can show, name fewer.
- Finish the story: when the question asks how something goes, travels, works or happens, the last step shows how it
  ends: where it arrives, or how it stops, wears off or leaves (a medicine is broken down by the liver and removed by
  the kidneys; food leaves the gut). Share the 900 characters across the whole journey; do not stop at its most
  interesting middle part.`;
const SUBJECT_RULES = Object.fromEntries(Object.entries(SUBJECTS).map(([s, { cats: cs, teach }]) =>
  [s, wbRules(cs.map(c => WB_ALL.find(x => x.cat === c)), teach + REUSE + TEACHER + SHOW_AND_FINISH + DRAW_OWN[s])]));

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

// ---------- Anatomy recipes (behind the ANATOMY_RECIPES switch; workshop ARCHITECTURE.md §E) ----------
// iso-catalogue.txt is written by the workshop's export.mjs, with the player's lib/iso files. While the switch is on,
// every prompt has an iso twin: an Anatomy line replaces the old line of the same name (find_drawing returns it), the
// rest are listed as their own "iso" category, and the rules below say how to place and drive them. The server then
// writes each Anatomy element's type as "<name>Iso" (run.ts), so the player draws the new recipe; old videos keep
// the old one.
const ISO_LINES = fs.readFileSync(path.join(genDir, 'iso-catalogue.txt'), 'utf8').split('\n').filter(l => l.trim()).map(l => {
  const p = l.split(' | '); return { name: p[0].split(/\s+/)[0], sig: p[0], example: p.slice(1, -1).join(' | '), desc: p.at(-1) }; });
const ISO_NAMES = new Set(ISO_LINES.map(l => l.name));
const ISO_CAT = { cat: 'iso', lines: ISO_LINES };
const isoLib = lib => [...lib.map(c => isSv(c) ? c : { ...c, lines: c.lines.filter(l => !ISO_NAMES.has(l.name)) }), ISO_CAT];
const ISO_RULES = `
- Detailed 3D drawings (the iso category, and any drawing whose signature find_drawing returns with box=): real
  objects that move. Place one with only its name, box=x,y,w,h and options: the player fits the drawing into that box
  (e.g. "b": "bunsen box=540,90,380,420 k=yellow"). Boxes never overlap each other, the step tags or your text; one
  big drawing (about half the board) or two side by side read best. draw <id> builds it up part by part.
- Drive it with set <id> key=value ... using only the keys its signature lists, cued on the word, e.g. "@air set b
  air=1"; lit=<part> (or "set b lit=<part>") makes one named part glow, and mark <id>.<part> circle|underline points
  at one part (the parts are the names after lit=). How-to drawings with step= show each step of the job: set the
  step in the lesson step that explains it. The drawing writes its own labels (lab=0 hides them).
- Parts (signature "<name> cx cy k ..."): small real objects drawn with one camera and one scale, to build your
  own scene from them (a wall, a shelf, a drill, a screw, a chair). cx cy is where the part stands on the floor, sits
  on the wall, or, for a tool, where its tip works; k is board px per cm, the SAME for every part of one scene (2-6 for a
  room, 6-12 for a lab bench, up to 30 for small things like a compass; bigger k = closer). Put one on another with at=<id>.<anchor> and ax= ay= az= offsets in cm (anchors are listed in
  its find_drawing line; x along the wall, y out of the wall, z up), and then leave out cx cy k:
  "sd": "screwdriver at=ch.joint aim=up", "b1": "shelfbracket at=wall ax=-30 az=140". List parts back to front:
  the wall and floor first, then furniture, then what sits on it, tools last. A lead joins two parts with at= and
  to=: "w1": "wirelead at=cell.plus to=bulb.a c=red". A big drawing shows only some of its parts with only=<part>,<part>
  (its lit= names), e.g. "bu": "distill box=60,200,260,300 only=burner,flask".`;
const ISO_SUBJECT_RULES = Object.fromEntries(Object.entries(SUBJECTS).map(([s, { cats: cs, teach }]) =>
  [s, wbRules(isoLib(cs.map(c => WB_ALL.find(x => x.cat === c))), teach + REUSE + TEACHER + SHOW_AND_FINISH + ISO_RULES + DRAW_OWN[s], true)]));
const ISO_RULES_PLAIN = wbRules(isoLib(WB_LIB), ISO_RULES, true);

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
    // drawings written out in each style's own prompt: find_drawing says "built in", never "not in the library"
    // (19 Oct 2026 A/B: told sun/title/cloud don't exist, the model drew plain circles instead)
    builtIn: { whiteboard: [...PRIMITIVES, ...RECIPE_NAMES],
      paper: 'glow ground zoom disc box shape line flow flash sun cloud rain vapour plant leaf stem soil pores cells sugar land cycle beams heart ring blood'.split(' ') },
    // the Anatomy twins (ANATOMY_RECIPES): each style/subject prompt's iso version, the catalogue lines, and the
    // element types the checks accept once run.ts has renamed them
    iso: { whiteboard: { system: ISO_RULES_PLAIN, sha256: sha(ISO_RULES_PLAIN) },
      subjects: Object.fromEntries(Object.entries(ISO_SUBJECT_RULES).map(([s, t]) => [s, { system: t, sha256: sha(t) }])),
      lib: ISO_CAT },
    types: [...TYPES, 'note', ...[...ISO_NAMES].map(n => `${n}Iso`)], commands: [...COMMANDS], loops: [...LOOPS],
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
