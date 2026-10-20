// Realistic car and home drawings for the Everyday fixes subjects (founder, 20 Oct 2026), from Wikimedia Commons,
// only CC0, public domain or CC BY (no share-alike, no non-commercial) -> the realistic library (scripts/library/svg2sv.mjs).
// picks.json (this folder) lists each file picked by eye: Commons title, our name, subject (car|home), search words,
// licence and author as Commons gives them. Download the files first (any folder), named by their Commons title:
//   node scripts/fixes-art/build.mjs <folder of downloaded svgs>
import fs from 'node:fs';
import path from 'node:path';
import { openFlattener, outline, replaceSource } from '../library/svg2sv.mjs';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/fixes-art/build.mjs <folder of downloaded svgs>'); process.exit(1); }
const here = path.dirname(new URL(import.meta.url).pathname);
const picks = JSON.parse(fs.readFileSync(path.join(here, 'picks.json'), 'utf8'));
const OK = /^(cc0|public domain|pd\b|cc by \d|cc by$)/i;
const fileOf = title => title.replace(/^File:/, '').replace(/[^\w.-]+/g, '_');
// paper.js throws on a gradient that borrows its stops from another (xlink:href, Inkscape's usual way). The flattener keeps
// only a gradient's first stop anyway, so each url(#gradient) becomes that colour before import.
const solidGradients = svg => {
  const own = {}, link = {};
  for (const m of svg.matchAll(/<(?:linear|radial)Gradient\b([^>]*?)(\/>|>([\s\S]*?)<\/(?:linear|radial)Gradient>)/g)) {
    const id = m[1].match(/\bid="([^"]+)"/)?.[1]; if (!id) continue;
    const stop = m[3]?.match(/<stop\b[^>]*>/)?.[0], c = stop && (stop.match(/stop-color:\s*(#[0-9a-fA-F]{3,6})/) || stop.match(/stop-color="(#[0-9a-fA-F]{3,6})"/));
    if (c) own[id] = c[1]; const h = m[1].match(/href="#([^"]+)"/)?.[1]; if (h) link[id] = h;
  }
  const colour = (id, n = 0) => own[id] || (link[id] && n < 8 ? colour(link[id], n + 1) : null);
  return svg.replace(/url\(#([^)]+)\)/g, (u, id) => colour(id) || 'none')
    .replace(/<(linear|radial)Gradient\b[^>]*?\/>|<(linear|radial)Gradient\b[\s\S]*?<\/(linear|radial)Gradient>/g, '');
};

const items = { car: [], home: [] }, missing = [];
const { flatten, close } = await openFlattener();
for (const p of picks) {
  if (!OK.test(p.licence) || /\bSA\b|-SA\b|NC/i.test(p.licence)) throw new Error(`licence not allowed: ${p.title} (${p.licence})`);
  const f = path.join(root, fileOf(p.title));
  const d = fs.existsSync(f) && await flatten(solidGradients(fs.readFileSync(f, 'utf8')));
  if (!d) { missing.push(p.title); continue; }
  outline(d);
  items[p.subject].push({ name: p.name, kit: p.subject === 'car' ? 'Fixes-Car' : 'Fixes-Home', data: d, credit: p,
    tags: [...new Set(`${p.name} ${p.words} ${p.subject}`.toLowerCase().match(/[a-z]{3,}/g))].sort() });
}
await close();
const car = replaceSource('Fixes-Car', items.car, 'car'), home = replaceSource('Fixes-Home', items.home, 'home');
fs.writeFileSync(path.join(here, 'credits.json'), JSON.stringify([...car.kept, ...home.kept].map(k => ({ id: k.id, name: k.name,
  source: k.credit.page, author: k.credit.artist, licence: k.credit.licence })), null, 1) + '\n');
console.log(car.kept.length, 'car,', home.kept.length, 'home drawings;', car.mb, '+', home.mb, 'MB; too big:',
  [...car.skipped, ...home.skipped].join(', ') || 'none', '; missing:', missing.join(', ') || 'none');
