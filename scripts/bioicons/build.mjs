// Plants, animals, microbes and viruses from Bioicons (bioicons.com, github.com/duerrsimon/bioicons) -> the same
// on-demand drawing files as the Servier library (public/player/lib/sv/<id>.js) + entries in sv-catalogue.json.
//   git clone --depth 1 https://github.com/duerrsimon/bioicons <scratch>/bioicons
//   node scripts/bioicons/build.mjs <scratch>/bioicons/static/icons
// Founder, 18 Oct 2026: biology beyond the human body (plants, animals, ecology, evolution, microbes).
// Only CC0, CC BY 3.0/4.0, MIT and BSD icons (no share-alike). Each kept icon's author and licence -> credits.json
// (CC BY needs the author named: /legal/copyright). Re-running replaces every Bioicons drawing; build-sv.py keeps them.
// SVGs are flattened by scripts/library/svg2sv.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { openFlattener, outline, replaceSource } from '../library/svg2sv.mjs';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/bioicons/build.mjs <bioicons>/static/icons'); process.exit(1); }
const here = path.dirname(new URL(import.meta.url).pathname);
const LICENCES = { 'cc-0': 'CC0', 'cc-by-3.0': 'CC BY 3.0', 'cc-by-4.0': 'CC BY 4.0', mit: 'MIT', bsd: 'BSD' };
const CATS = { Plants_Algae: 'plant', Animals: 'animal', Microbiology: 'microbe', Viruses: 'virus microbe', Cell_types: 'cell',
  Genetics: 'genetics cell division' };
// Lab gear in Microbiology, model-organism lab states in Animals, and anything sick: not school biology.
const SKIP = /tube|falcon|petri|plate|flask|bottle|pipette|microscope|chamber|raster|scraper|clamp|slide|burner|gel|erlenmeyer|centrifuge|sequencer|eppendorf|dilution|sorbitol|isolation|equipment|cultivation|incubation|hydroponics|titer|plaque|vial|injection|mutant|defective|eyeless|death|infection|gfp|expressing|marked|controlled|mosaic|radar|petri|_wp_|-wp-|sketch|idea|label|cultuure|quipment|^pet$|donating|temperature|pig|dog|beagle|guinea/i;   // pig, dog: house rules (scripts/library/README.md)
const KEEP_GENETICS = /^(meiosis|mitosis|CRISPR_plasmid|CRISPR_Cas9|Budding_yeast)$/i, KEEP_CELLS = /plant/i;
// 19 Oct 2026, finishing biology: a few lab and molecular pictures from other categories, picked by name (they pass
// SKIP: a U-tube is lab gear, but it is the osmosis apparatus).
const EXTRA = {
  Chemistry: [/^(u-tube|Beaker_water|particles-smoke)$/i, 'lab osmosis diffusion'],
  Cell_membrane: [/^(pink_transporter|membrane-2d-yellowblue)$/i, 'membrane transport diffusion osmosis'],
  Receptors_channels: [/^(channel-membrane-lightorange|channel-lid-membrane|sodium-potassium-pump-membrane-ions)$/i, 'membrane channel transport diffusion active'],
  Intracellular_components: [/^(mitochondria|simple_mitochondria_rod)$/i, 'cell organelle mitochondria respiration energy'],
  Nucleic_acids: [/^(atp|plasmid-s|plasmid-s-insert-dna|plasmid-l-insert-dna|restriction_enzyme|CRISPR-CAS9-pink)$/i, 'dna genetic engineering gene'],
};
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

// Pick the icons: <licence>/<category>/<author>/<name>.svg
const picks = [], seen = new Set();
for (const lic of Object.keys(LICENCES)) for (const cat of [...Object.keys(CATS), ...Object.keys(EXTRA)]) {
  const cdir = path.join(root, lic, cat); if (!fs.existsSync(cdir)) continue;
  for (const author of fs.readdirSync(cdir).sort()) for (const f of fs.readdirSync(path.join(cdir, author)).sort()) {
    if (!f.endsWith('.svg')) continue;
    const raw = f.slice(0, -4);
    if (EXTRA[cat] ? !EXTRA[cat][0].test(raw) : SKIP.test(raw) || (cat === 'Genetics' && !KEEP_GENETICS.test(raw)) || (cat === 'Cell_types' && !KEEP_CELLS.test(raw))) continue;
    let base = raw; while (COLOUR.test(base)) base = base.replace(COLOUR, '');      // pig-green, pig-pink -> one pig
    const key = `${cat}/${base.toLowerCase().replace(/[^a-z]/g, '')}`; if (seen.has(key)) continue; seen.add(key);
    picks.push({ file: path.join(cdir, author, f), name: words(base), cat, author: words(author), licence: LICENCES[lic] });
  }
}

const { flatten, close } = await openFlattener();
const items = [];
let skipped = 0;
for (const p of picks) {
  const d = await flatten(fs.readFileSync(p.file, 'utf8'));
  if (!d) { skipped++; continue; }
  outline(d);
  const own = p.name.toLowerCase().match(/[a-z]+/g) || [], tags = [...new Set(`${p.name} ${CATS[p.cat] ?? EXTRA[p.cat][1]} ${own.map(w => Object.hasOwn(SYN, w) ? SYN[w] : '').join(' ')}`.toLowerCase().match(/[a-z]{3,}/g))].sort();
  items.push({ name: p.name, kit: `Bioicons-${p.cat}`, tags, data: d, author: p.author, licence: p.licence });
}
await close();
const { kept, mb } = replaceSource('Bioicons', items);
fs.writeFileSync(path.join(here, 'credits.json'), JSON.stringify(kept.map(k => ({ id: k.id, name: k.name, author: k.author, licence: k.licence })), null, 1) + '\n');
console.log(kept.length, 'Bioicons drawings,', mb, 'MB;', skipped + items.length - kept.length, 'skipped (empty, unreadable or over 1 MB)');
