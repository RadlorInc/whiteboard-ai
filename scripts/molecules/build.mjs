// Molecule structures (scripts/molecules/molecules.json, drawn by render.py with RDKit) -> the realistic library
// (scripts/library/svg2sv.mjs), subject chemistry; biology search covers them too (glucose, amino acids, ATP, lipids).
// Founder, 19 Oct 2026: US chemistry from high school to college. No pen outline is added: bonds are already lines.
//   python3 -I scripts/molecules/render.py <scratch>/mol && node scripts/molecules/build.mjs <scratch>/mol
import fs from 'node:fs';
import path from 'node:path';
import { openFlattener, replaceSource } from '../library/svg2sv.mjs';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/molecules/build.mjs <dir with meta.json and svgs>'); process.exit(1); }
const meta = JSON.parse(fs.readFileSync(path.join(root, 'meta.json'), 'utf8'));
const items = [], missing = [];
const { flatten, close } = await openFlattener();
for (const m of meta) {
  const d = await flatten(fs.readFileSync(path.join(root, m.file + '.svg'), 'utf8'));
  if (!d) { missing.push(m.name); continue; }
  items.push({ id: `${m.name} molecule`, name: `${m.name} (structure, ${m.formula})`, kit: 'Molecules', data: d,
    tags: [...new Set(`${m.name} ${m.group} molecule structure formula ${m.formula} ${m.cip.length ? 'chiral stereo ' + m.cip.join(' ') : ''}`.toLowerCase().match(/[a-z0-9]{2,}/g))] });
}
await close();
const { kept, mb, skipped } = replaceSource('Molecules', items, 'chemistry');
console.log(kept.length, 'molecules,', mb, 'MB; missing:', missing.join(', ') || 'none', '; over the size cap:', skipped.join(', ') || 'none');
