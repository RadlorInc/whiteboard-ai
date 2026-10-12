// Every drawing name already taken, per style (listed or not):  node lib/names.mjs [wb|paper|mc]
// Use it before naming a new drawing; a name must be unique within its style.
import fs from 'node:fs'; import path from 'node:path';
const lib = import.meta.dirname, root = path.join(lib, '..');
const txt = d => fs.readdirSync(path.join(lib, d)).filter(f => f.endsWith('.txt')).flatMap(f =>
  fs.readFileSync(path.join(lib, d, f), 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => [l.split(/\s+/)[0], f]));
const builtWb = [...fs.readFileSync(path.join(root, 'recipes.js'), 'utf8').matchAll(/^  (\w+): \(/gm)].map(m => [m[1], 'recipes.js']);
const page = fs.readFileSync(path.join(root, 'stopmotion-topics.html'), 'utf8');
const builtPaper = [...page.slice(page.indexOf('const LIB = {'), page.indexOf('const CMDS')).matchAll(/^  (\w+): /gm)].map(m => [m[1], 'stopmotion-topics.html']);
const mc = fs.readdirSync(path.join(lib, 'mc')).filter(f => f.endsWith('.json')).flatMap(f => Object.keys(JSON.parse(fs.readFileSync(path.join(lib, 'mc', f), 'utf8'))).map(n => [n, f]));
const all = { wb: [...builtWb, ...txt('wb')], paper: [...builtPaper, ...txt('paper')], mc };
let dup = 0;
for (const [style, list] of Object.entries(all)) {
  if (process.argv[2] && process.argv[2] !== style) continue;
  const seen = new Map(); for (const [n, f] of list) { if (seen.has(n) && seen.get(n) !== f) { console.log(`DUPLICATE ${style}: "${n}" in ${seen.get(n)} and ${f}`); dup++; } seen.set(n, f); }
  console.log(`${style} (${seen.size}): ${[...seen.keys()].sort().join(' ')}`);
}
process.exit(dup ? 1 : 0);
