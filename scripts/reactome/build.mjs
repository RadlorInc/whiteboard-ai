// University-level biology from the Reactome Icon Library (reactome.org/icon-lib, CC BY 4.0: credit Reactome and each
// icon's designer) -> the realistic library (scripts/library/svg2sv.mjs). Founder, 19 Oct 2026: the app is for 18+
// biology majors too, so cell types, organelles, tissues, receptors, transporters and shaped proteins.
// Arrows, backgrounds, drugs (therapeutic) and metabolites (compound: the same hexagon token in many colours) are left
// out, and so are plain proteins drawn as a one- or two-colour capsule (about 1,200 of 1,420: a pathway symbol, not a
// picture); proteins with a real shape (antibody, laminin, dynamin, receptors) stay. Every drawing stays under MAX_BYTES (svg2sv.mjs).
//   curl -s 'https://reactome.org/ContentService/search/query?query=*&types=Icon&cluster=true&rows=3000' > <scratch>/all.json
//   python3 -c "import json;d=json.load(open('<scratch>/all.json'));json.dump([x for r in d['results'] for x in r['entries']],open('<scratch>/icons.json','w'))"
//   for each stId in icons.json: curl -s https://reactome.org/icon/<stId>.svg -o <scratch>/svg/<stId>.svg
//   node scripts/reactome/build.mjs <scratch>
import fs from 'node:fs';
import path from 'node:path';
import { openFlattener, outline, replaceSource } from '../library/svg2sv.mjs';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/reactome/build.mjs <dir with icons.json and svg/>'); process.exit(1); }
const here = path.dirname(new URL(import.meta.url).pathname);
const SKIP = new Set(['arrow', 'background', 'therapeutic', 'compound']);
const WORDS = { protein: 'protein molecule', compound: 'molecule metabolite biochemistry', cell_element: 'cell organelle molecular',
  receptor: 'receptor protein membrane signalling', cell_type: 'cell', transporter: 'transporter channel membrane protein', human_tissue: 'tissue organ' };
const strip = s => (s || '').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, ' ');
// "PYRUVATE" -> "Pyruvate"; gene symbols (CDK2, TLR5) stay as they are
const nice = n => /^[A-Z][A-Z0-9 -]+$/.test(n) && n.length > 6 && /[AEIOU]{1}.*[AEIOU]/.test(n) && !/\d/.test(n) ? n[0] + n.slice(1).toLowerCase() : n;

const icons = JSON.parse(fs.readFileSync(path.join(root, 'icons.json'), 'utf8'));
const items = [], missing = [], credit = {};
const { flatten, close } = await openFlattener();
for (const ic of icons) {
  const cats = ic.iconCategories || []; if (!cats.length || cats.some(c => SKIP.has(c))) continue;
  const f = path.join(root, 'svg', `${ic.stId}.svg`); if (!fs.existsSync(f)) { missing.push(ic.stId); continue; }
  const d = await flatten(fs.readFileSync(f, 'utf8'));
  if (!d) { missing.push(ic.stId); continue; }
  if (cats.length === 1 && cats[0] === 'protein' && d.shapes.length <= 3) continue;   // a plain capsule
  if (/^MT-/i.test(ic.name)) continue;   // 37 mitochondrial genes, all the same gene-on-DNA symbol
  outline(d);
  const name = nice(ic.name.trim()), sum = strip(ic.summation).slice(0, 200);
  items.push({ id: name, name, kit: `Reactome-${cats[0]}`, data: d, src: ic.stId,
    tags: [...new Set(`${name} ${cats.map(c => WORDS[c] || c).join(' ')} ${sum}`.toLowerCase().match(/[a-z0-9]{3,}/g))].slice(0, 30).sort() });   // name words first, then a capped few from the summary
  const who = ic.iconDesignerName || 'Reactome'; (credit[who] ||= []).push(ic.stId);
}
await close();
const { kept, mb, skipped } = replaceSource('Reactome', items, 'biology');
fs.writeFileSync(path.join(here, 'credits.json'), JSON.stringify({ source: 'Reactome Icon Library (reactome.org/icon-lib)',
  licence: 'CC BY 4.0', designers: Object.keys(credit).sort(), drawings: Object.fromEntries(kept.map(k => [k.id, k.src])) }, null, 1) + '\n');
console.log(kept.length, 'Reactome drawings,', mb, 'MB; missing:', missing.length, '; over the size cap:', skipped.length, skipped.slice(0, 20).join(', '));
