// Writes public/player/lib/wb-index.js: for each recipe name, the library category that defines it (if two do, the
// later one in lib/wb-load.js order, which wins when every category loads). The player's lazy mode
// (bridge.js needLib) loads only the categories a board names. Read from the category files themselves, run in a
// sandbox: a recipe missing from a .txt catalogue is still found.
//   node scripts/wb-index.mjs          writes it
//   node scripts/wb-index.mjs --check  exits 1 if it is stale (CI)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const player = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'player');
const load = fs.readFileSync(path.join(player, 'lib', 'wb-load.js'), 'utf8');
const list = v => JSON.parse(load.match(new RegExp(`window\\.${v} = (\\[[^\\]]*\\])`))[1]);
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : stub()), apply: () => stub(), construct: () => stub() });
const ctx = vm.createContext({ document: stub(), navigator: {}, location: { search: '' }, console, URLSearchParams, Math, JSON, Object, Array, Set, Map });
ctx.window = ctx; ctx.self = ctx;
vm.runInContext(fs.readFileSync(path.join(player, 'recipes.js'), 'utf8'), ctx);
const index = {};
for (const cat of [...list('WB_CATS'), ...list('WB_EXTRA')]) {
  const before = new Map(Object.entries(ctx.RECIPES));
  vm.runInContext(fs.readFileSync(path.join(player, 'lib', 'wb', `${cat}.js`), 'utf8'), ctx, { filename: `${cat}.js` });
  for (const [name, fn] of Object.entries(ctx.RECIPES)) if (before.get(name) !== fn) index[name] = cat;
}
// A category's recipes may draw another's (computing's server draws tech's laptop: RECIPES.laptop): those load first.
const deps = {};
for (const cat of new Set(Object.values(index))) {
  const src = fs.readFileSync(path.join(player, 'lib', 'wb', `${cat}.js`), 'utf8');
  const used = [...src.matchAll(/RECIPES(?:\.([A-Za-z0-9_]+)|\[['"]([A-Za-z0-9_]+)['"]\])/g)].map(m => index[m[1] ?? m[2]]).filter(c => c && c !== cat);
  if (used.length) deps[cat] = [...new Set(used)];
}
const out = `// Written by scripts/wb-index.mjs: recipe name → the library category that defines it, and the categories each one's
// recipes draw from (load those first).\nwindow.WB_INDEX = ${JSON.stringify(index)};\nwindow.WB_DEPS = ${JSON.stringify(deps)};\n`;
const file = path.join(player, 'lib', 'wb-index.js');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== out) { console.error('lib/wb-index.js is stale: run node scripts/wb-index.mjs'); process.exit(1); }
  console.log('lib/wb-index.js is up to date');
} else { fs.writeFileSync(file, out); console.log(`lib/wb-index.js · ${Object.keys(index).length} recipes`); }
