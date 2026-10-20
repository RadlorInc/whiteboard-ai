// University-level biology from NIH BioArt Source (bioart.niaid.nih.gov, NIAID): ~96% public domain, the rest CC BY;
// only those two are kept (no NC, SA or ND). Founder, 19 Oct 2026: the app is for 18+ biology majors too (immunology,
// microbiology, cells, proteins, lab work). House rules: no people, no pig or dog. Every drawing stays under MAX_BYTES.
// The site has no API: each entry page (bioart/<n>) carries its title, licence, category, keywords and a "filemapping"
// of file ids; the first representation's SVG is /api/bioarts/<n>/files/<svg id>.
//   python3 -I <crawler> meta.json 1000          (entry pages -> meta.json; see the crawler kept next to the scratch)
//   for each entry: curl -s https://bioart.niaid.nih.gov/api/bioarts/<id>/files/<svgs[0]> -o <scratch>/svg/<id>.svg
//   and its other colour versions (svgs[1..5]) -> <scratch>/var/<id>-<file id>.svg
//   node scripts/nih-bioart/build.mjs <scratch>
import fs from 'node:fs';
import path from 'node:path';
import { openFlattener, outline, replaceSource } from '../library/svg2sv.mjs';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/nih-bioart/build.mjs <dir with meta.json and svg/>'); process.exit(1); }
const here = path.dirname(new URL(import.meta.url).pathname);
export const OK_LICENCE = /^(public domain|cc[- ]?by( 4\.0)?)$/i;
// categories come as a list ("Anatomy, People"): any People is out, and so is an entry that is only shapes or charts
const skipCat = c => { const l = c.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return !l.length || l.includes('people') || l.every(x => ['shapes', 'data visualization'].includes(x)); };
const SKIP = /\b(pig|piglet|swine|porcine|hog|boar|dog|puppy|canine|alcohol|beer|wine|syringe drug use|gun|weapon)s?\b/i;   // scripts/library/README.md

// Each entry comes in colour versions (the SVG's <imageColor>); the first is often plain beige, so take the most colourful.
const RANK = ['Multicolor', 'Blue', 'Green', 'Orange', 'Pink', 'Purple', 'Red', 'Yellow', 'Brown', 'Grey', 'Beige', 'BlackWhite'];
const rank = t => { const c = (t.match(/<imageColor>([^<]*)/) || [])[1]; const i = RANK.indexOf(c); return i < 0 ? 1 : i; };
const best = id => { const vd = path.join(root, 'var'), files = [path.join(root, 'svg', `${id}.svg`),
    ...(fs.existsSync(vd) ? fs.readdirSync(vd).filter(f => f.startsWith(`${id}-`)).map(f => path.join(vd, f)) : [])].filter(f => fs.existsSync(f));
  return files.map(f => fs.readFileSync(f, 'utf8')).sort((a, b) => rank(a) - rank(b))[0]; };

const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta.json'), 'utf8'));
const items = [], missing = [], left = { licence: 0, category: 0, rules: 0 }, credit = [];
const { flatten, close } = await openFlattener();
for (const m of meta) {
  if (!OK_LICENCE.test(m.licence.trim())) { left.licence++; continue; }
  if (skipCat(m.category)) { left.category++; continue; }
  if (SKIP.test(`${m.title} ${m.keywords}`)) { left.rules++; continue; }
  const svg = best(m.id); if (!svg) { missing.push(m.id); continue; }
  // about half the files were re-saved with a ns0: prefix on every element, which the browser's SVG parser ignores
  const d = await flatten(svg.replace(/xmlns:ns0=/g, 'xmlns=').replace(/(<\/?)ns0:/g, '$1'));
  if (!d) { missing.push(m.id); continue; }
  // a one-colour blob (a cell or protein drawn as a flat shape) says nothing on the board; animal silhouettes are fine
  if (new Set(d.shapes.map(q => q[1]).filter(c => c !== 'none')).size === 1 && !/animal|arthropod|silhouette/i.test(`${m.category} ${m.title}`)) { left.blob = (left.blob || 0) + 1; continue; }
  outline(d);
  items.push({ id: m.title, name: m.title, kit: `NIHBioArt-${m.category.split(',')[0].trim().replace(/\W+/g, '_')}`, data: d, src: m.id,
    tags: [...new Set(`${m.title} ${m.category} ${m.keywords}`.toLowerCase().match(/[a-z0-9]{3,}/g))].slice(0, 30).sort() });
  if (!/public domain/i.test(m.licence)) credit.push({ id: m.id, creator: m.creator, licence: m.licence });
}
await close();
const { kept, mb, skipped } = replaceSource('NIHBioArt', items, 'biology');
fs.writeFileSync(path.join(here, 'credits.json'), JSON.stringify({ source: 'NIH BioArt Source (bioart.niaid.nih.gov), NIAID',
  licence: 'Public Domain, except the CC BY entries listed', ccBy: credit, drawings: Object.fromEntries(kept.map(k => [k.id, k.src])) }, null, 1) + '\n');
console.log(kept.length, 'NIH BioArt drawings,', mb, 'MB; left out', JSON.stringify(left), '; missing:', missing.length, '; over the size cap:', skipped.length, skipped.slice(0, 15).join(', '));
