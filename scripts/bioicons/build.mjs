// Plants, animals, microbes and viruses from Bioicons (bioicons.com, github.com/duerrsimon/bioicons) -> the same
// on-demand drawing files as the Servier library (public/player/lib/sv/<id>.js) + entries in sv-catalogue.json.
//   git clone --depth 1 https://github.com/duerrsimon/bioicons <scratch>/bioicons
//   node scripts/bioicons/build.mjs <scratch>/bioicons/static/icons
// Founder, 18 Oct 2026: biology beyond the human body (plants, animals, ecology, evolution, microbes).
// Only CC0, CC BY 3.0/4.0, MIT and BSD icons (no share-alike). Each kept icon's author and licence -> credits.json
// (CC BY needs the author named: /legal/copyright). Re-running replaces every Bioicons drawing; build-sv.py keeps them.
// SVGs are flattened in headless Chromium with paper.js (transforms, CSS, shapes, arcs -> absolute paths).
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/bioicons/build.mjs <bioicons>/static/icons'); process.exit(1); }
const here = path.dirname(new URL(import.meta.url).pathname), app = path.resolve(here, '..', '..');
const dest = path.join(app, 'public', 'player', 'lib', 'sv'), catFile = path.join(app, 'scripts', 'servier', 'sv-catalogue.json');

const LICENCES = { 'cc-0': 'CC0', 'cc-by-3.0': 'CC BY 3.0', 'cc-by-4.0': 'CC BY 4.0', mit: 'MIT', bsd: 'BSD' };
const CATS = { Plants_Algae: 'plant', Animals: 'animal', Microbiology: 'microbe', Viruses: 'virus microbe', Cell_types: 'cell',
  Genetics: 'genetics cell division' };
// Lab gear in Microbiology, model-organism lab states in Animals, and anything sick: not school biology.
const SKIP = /tube|falcon|petri|plate|flask|bottle|pipette|microscope|chamber|raster|scraper|clamp|slide|burner|gel|erlenmeyer|centrifuge|sequencer|eppendorf|dilution|sorbitol|isolation|equipment|cultivation|incubation|hydroponics|titer|plaque|vial|injection|mutant|defective|eyeless|death|infection|gfp|expressing|marked|controlled|mosaic|radar|petri|_wp_|-wp-|sketch|idea|label|cultuure|quipment|^pet$|donating|temperature/i;
const KEEP_GENETICS = /^(meiosis|mitosis)$/i, KEEP_CELLS = /plant/i;
const COLOUR = /[-_ ](green|pink|purple|blue|yellow|orange|red|white|gray|grey|darkgray|cyan|brown|black|lightgray|lightyellow|colour|color|monochrome|v\d|\d)$/i;

// School words the file names lack (a student says "butterfly", not "swallowtail").
const SYN = { swallowtail: 'butterfly insect', moth: 'insect', larva: 'caterpillar', larvae: 'caterpillar', catapillar: 'caterpillar',
  wheat: 'grass cereal crop', rice: 'grass cereal crop', oat: 'grass cereal crop', rye: 'grass cereal crop', maize: 'grass cereal crop corn',
  zea: 'grass cereal crop corn maize', brachypodium: 'grass', oropetium: 'grass', crow: 'bird', avocet: 'bird', arabidopsis: 'plant flower',
  seedling: 'plant root shoot germination', moss: 'plant bryophyte', fern: 'plant', ginkgo: 'plant tree gymnosperm', shark: 'fish',
  carp: 'fish', zebrafish: 'fish', xenopus: 'frog amphibian', frog: 'amphibian', lizard: 'reptile', snake: 'reptile', octopus: 'mollusc',
  snail: 'mollusc', clam: 'mollusc', spider: 'arachnid', bee: 'insect pollinator', fly: 'insect', drosophila: 'insect fly', beetle: 'insect',
  cricket: 'insect', ant: 'insect', aphid: 'insect', mosquito: 'insect', earthworm: 'worm annelid', cow: 'mammal', ox: 'cow mammal',
  monkey: 'primate mammal', macaque: 'monkey primate mammal', chimpanzee: 'primate mammal', mouse: 'mammal rodent', rat: 'mammal rodent',
  rabbit: 'mammal', sheep: 'mammal', pig: 'mammal', horse: 'mammal', dog: 'mammal', cat: 'mammal', jellyfish: 'cnidarian', anemone: 'cnidarian',
  yeast: 'fungus', mycelium: 'fungus', conidia: 'fungus spore', cyanobacteria: 'bacteria', volvox: 'alga', chlamydomonas: 'alga', phage: 'virus' };
const words = s => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'drawing';

// Pick the icons: <licence>/<category>/<author>/<name>.svg
const picks = [], seen = new Set();
for (const lic of Object.keys(LICENCES)) for (const cat of Object.keys(CATS)) {
  const cdir = path.join(root, lic, cat); if (!fs.existsSync(cdir)) continue;
  for (const author of fs.readdirSync(cdir).sort()) for (const f of fs.readdirSync(path.join(cdir, author)).sort()) {
    if (!f.endsWith('.svg')) continue;
    const raw = f.slice(0, -4);
    if (SKIP.test(raw) || (cat === 'Genetics' && !KEEP_GENETICS.test(raw)) || (cat === 'Cell_types' && !KEEP_CELLS.test(raw))) continue;
    let base = raw; while (COLOUR.test(base)) base = base.replace(COLOUR, '');      // pig-green, pig-pink -> one pig
    const key = `${cat}/${base.toLowerCase().replace(/[^a-z]/g, '')}`; if (seen.has(key)) continue; seen.add(key);
    picks.push({ file: path.join(cdir, author, f), name: words(base), cat, author: words(author), licence: LICENCES[lic] });
  }
}

const browser = await chromium.launch(), page = await browser.newPage();
await page.setContent('<html><body></body></html>');
await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js' });
await page.evaluate(() => { paper.setup(new paper.Size(1000, 1000)); });

// One SVG -> {w, h, shapes: [[d, fill, fillOpacity, stroke, strokeWidth]]} in a 1000-tall box, or null.
const flatten = svg => page.evaluate(svg => {
  paper.project.clear();
  let item; try { item = paper.project.importSVG(svg, { expandShapes: true, insert: true }); } catch { return null; }
  if (!item) return null;
  const hex = c => { if (!c) return null; if (c.type === 'gradient' || c.gradient) { const s = c.gradient.stops[0]; c = s && s.color; if (!c) return null; }
    return c.alpha === 0 ? null : '#' + c.toCSS(true).slice(1, 7); };
  const alpha = (p, c) => { let a = c && c.alpha != null ? c.alpha : 1; for (let q = p; q; q = q.parent) a *= q.opacity; return a; };
  const hidden = p => { for (let q = p; q; q = q.parent) if (!q.visible) return true; return false; };
  // Every subpath as absolute points in page coordinates: [[x, y] start, then [c1, c2, end] or [end] per segment].
  const subs = s => { const M = s.globalMatrix, g = s.segments, P = q => { q = M.transform(q); return [q.x, q.y]; };
    if (!g.length) return null;
    const segs = [], seg = (a, z) => segs.push(a.handleOut.isZero() && z.handleIn.isZero() ? [P(z.point)]
      : [P(a.point.add(a.handleOut)), P(z.point.add(z.handleIn)), P(z.point)]);
    for (let i = 1; i < g.length; i++) seg(g[i - 1], g[i]);
    if (s.closed) seg(g[g.length - 1], g[0]);
    return { start: P(g[0].point), segs, closed: s.closed }; };
  const pts = sp => [sp.start, ...sp.segs.flat()];
  const out = [];
  for (const p of item.getItems({ class: paper.PathItem })) {
    if (p.clipMask || hidden(p) || (p instanceof paper.Path && p.parent instanceof paper.CompoundPath)) continue;
    const fill = hex(p.fillColor), stroke = p.strokeWidth > 0 ? hex(p.strokeColor) : null;
    if (!fill && !stroke) continue;
    const sp = (p.children || [p]).map(subs).filter(Boolean); if (!sp.length) continue;
    out.push({ sp, fill: fill || 'none', fo: fill ? alpha(p, p.fillColor) : 1, stroke, w: stroke ? p.strokeWidth * p.globalMatrix.scaling.x : 0 });
  }
  const box = list => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const o of list) for (const s of o.sp) for (const [x, y] of pts(s)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };
  // A page frame or background (a plain rectangle about as big as everything) is not part of the drawing.
  let b = box(out);
  for (const o of out) o.sp = o.sp.filter(s => { const q = pts(s), xs = new Set(q.map(v => Math.round(v[0]))), ys = new Set(q.map(v => Math.round(v[1])));
    const rect = s.segs.every(g => g.length === 1) && xs.size <= 2 && ys.size <= 2, bb = box([{ sp: [s] }]);
    return !(rect && bb.w * bb.h >= 0.8 * b.w * b.h); });
  const kept = out.filter(o => o.sp.length); if (!kept.length) return null;
  b = box(kept); if (!b.h || !b.w) return null;
  const k = 1000 / b.h, T = ([x, y]) => `${Math.round((x - b.x) * k)} ${Math.round((y - b.y) * k)}`;
  const d = sp => sp.map(s => `M${T(s.start)}` + s.segs.map(g => g.length === 1 ? ` L${T(g[0])}` : ` C${g.map(T).join(' ')}`).join('') + (s.closed ? ' Z' : '')).join(' ');
  return { w: Math.round(b.w * k), h: 1000, shapes: kept.map(o => [d(o.sp), o.fill, Math.round(o.fo * 10) / 10, o.stroke, Math.round(o.w * k * 10) / 10]) };
}, svg);

// Drop the previous Bioicons build, keep Servier's ids so names never collide.
const old = JSON.parse(fs.readFileSync(catFile, 'utf8'));
for (const c of old) if (c.kit.startsWith('Bioicons')) fs.rmSync(path.join(dest, c.id + '.js'), { force: true });
const cat = old.filter(c => !c.kit.startsWith('Bioicons')), taken = new Set(cat.map(c => c.id));
const credits = [];
let skipped = 0, bytes = 0;
for (const p of picks) {
  const d = await flatten(fs.readFileSync(p.file, 'utf8'));
  const body = d && JSON.stringify(d);
  if (!body || body.length > 1_000_000) { skipped++; continue; }
  let id = slug(p.name), n = 1; while (taken.has(id)) id = `${slug(p.name)}-${++n}`; taken.add(id);
  fs.writeFileSync(path.join(dest, id + '.js'), `SV.add(${JSON.stringify(id)},${body});\n`); bytes += body.length;
  const own = p.name.toLowerCase().match(/[a-z]+/g) || [], tags = [...new Set(`${p.name} ${CATS[p.cat]} ${own.map(w => Object.hasOwn(SYN, w) ? SYN[w] : '').join(' ')}`.toLowerCase().match(/[a-z]{3,}/g))].sort();
  cat.push({ id, name: p.name, subject: 'biology', kit: `Bioicons-${p.cat}`, w: d.w, tags });
  credits.push({ id, name: p.name, author: p.author, licence: p.licence });
}
await browser.close();
fs.writeFileSync(catFile, JSON.stringify(cat));
fs.writeFileSync(path.join(here, 'credits.json'), JSON.stringify(credits, null, 1) + '\n');
console.log(credits.length, 'Bioicons drawings,', (bytes / 1e6).toFixed(1), 'MB;', skipped, 'skipped (empty, unreadable or over 1 MB)');
