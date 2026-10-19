// Silhouettes of the animals and plants school biology names, from PhyloPic (phylopic.org) -> the realistic library
// (scripts/library/svg2sv.mjs). Founder, 19 Oct 2026: classification, evolution trees, food webs and adaptation need
// many organisms the other kits lack. Only CC0, public domain and CC BY images (no NC, no SA); no pig, no dog.
//   node scripts/phylopic/build.mjs <scratch dir for the downloads>
// Each kept image's contributor and licence -> credits.json (CC BY needs the name: /legal/copyright).
import fs from 'node:fs';
import path from 'node:path';
import { openFlattener, outline, replaceSource } from '../library/svg2sv.mjs';

const cache = process.argv[2];
if (!cache) { console.error('usage: node scripts/phylopic/build.mjs <download dir>'); process.exit(1); }
fs.mkdirSync(cache, { recursive: true });
const here = path.dirname(new URL(import.meta.url).pathname), API = 'https://api.phylopic.org';

// [school name, scientific name (then fallbacks: genus or group, after |), group words]
const SPECIES = [
  ['lion', 'panthera leo', 'mammal carnivore big cat'], ['tiger', 'panthera tigris', 'mammal carnivore big cat'],
  ['cheetah', 'acinonyx jubatus', 'mammal carnivore big cat'], ['elephant', 'loxodonta africana', 'mammal herbivore'],
  ['giraffe', 'giraffa camelopardalis|giraffa', 'mammal herbivore'], ['zebra', 'equus quagga', 'mammal herbivore'],
  ['rhinoceros', 'ceratotherium simum', 'mammal herbivore'], ['hippopotamus', 'hippopotamus amphibius', 'mammal herbivore'],
  ['gorilla', 'gorilla gorilla', 'mammal primate ape'], ['chimpanzee', 'pan troglodytes', 'mammal primate ape'],
  ['wolf', 'canis lupus', 'mammal carnivore'], ['fox', 'vulpes vulpes', 'mammal carnivore'],
  ['brown bear', 'ursus arctos', 'mammal omnivore'], ['polar bear', 'ursus maritimus', 'mammal carnivore arctic adaptation'],
  ['deer', 'cervus elaphus', 'mammal herbivore'], ['camel', 'camelus dromedarius', 'mammal herbivore desert adaptation'],
  ['horse', 'equus caballus', 'mammal herbivore'], ['cow', 'bos taurus', 'mammal herbivore'],
  ['sheep', 'ovis aries', 'mammal herbivore'], ['goat', 'capra hircus|capra', 'mammal herbivore'],
  ['rabbit', 'oryctolagus cuniculus', 'mammal herbivore'], ['mouse', 'mus musculus', 'mammal rodent'],
  ['squirrel', 'sciurus vulgaris', 'mammal rodent'], ['hedgehog', 'erinaceus europaeus', 'mammal insectivore'],
  ['bat', 'pipistrellus pipistrellus', 'mammal flying'], ['kangaroo', 'macropus giganteus', 'mammal marsupial'],
  ['platypus', 'ornithorhynchus anatinus', 'mammal egg laying monotreme'], ['blue whale', 'balaenoptera musculus', 'mammal sea'],
  ['dolphin', 'tursiops truncatus', 'mammal sea'], ['seal', 'phoca vitulina', 'mammal sea'],
  ['eagle', 'haliaeetus leucocephalus', 'bird predator'], ['owl', 'tyto alba', 'bird predator'],
  ['penguin', 'aptenodytes forsteri', 'bird flightless'], ['ostrich', 'struthio camelus', 'bird flightless'],
  ['parrot', 'ara macao', 'bird'], ['hen', 'gallus gallus', 'bird farm chicken'], ['duck', 'anas platyrhynchos', 'bird'],
  ['sparrow', 'passer domesticus', 'bird'], ['hummingbird', 'archilochus colubris', 'bird'], ['flamingo', 'phoenicopterus roseus', 'bird'],
  ['peacock', 'pavo cristatus|pavo', 'bird'], ['darwin finch', 'geospiza fortis|geospiza|camarhynchus', 'bird evolution galapagos'],
  ['crocodile', 'crocodylus niloticus', 'reptile'], ['turtle', 'chelonia mydas', 'reptile sea'], ['tortoise', 'chelonoidis niger|chelonoidis|testudo', 'reptile galapagos'],
  ['cobra', 'naja naja|naja', 'reptile snake'], ['chameleon', 'chamaeleo calyptratus', 'reptile lizard camouflage adaptation'],
  ['tyrannosaurus', 'tyrannosaurus rex', 'dinosaur reptile fossil extinct evolution'], ['archaeopteryx', 'archaeopteryx lithographica', 'fossil bird dinosaur evolution'],
  ['frog', 'rana temporaria', 'amphibian'], ['salamander', 'salamandra salamandra', 'amphibian'],
  ['shark', 'carcharodon carcharias', 'fish cartilage'], ['salmon', 'salmo salar', 'fish bony'], ['seahorse', 'hippocampus kuda|hippocampus', 'fish'],
  ['coelacanth', 'latimeria chalumnae', 'fish living fossil evolution'],
  ['octopus', 'octopus vulgaris', 'invertebrate mollusc'], ['jellyfish', 'aurelia aurita', 'invertebrate cnidarian'],
  ['starfish', 'asterias rubens|asterias|asteroidea', 'invertebrate echinoderm'], ['crab', 'carcinus maenas', 'invertebrate crustacean arthropod'],
  ['lobster', 'homarus gammarus', 'invertebrate crustacean arthropod'], ['snail', 'cornu aspersum|helix pomatia|helix', 'invertebrate mollusc'],
  ['earthworm', 'lumbricus terrestris', 'invertebrate annelid worm decomposer'], ['spider', 'araneus diadematus', 'invertebrate arachnid arthropod'],
  ['scorpion', 'androctonus australis|scorpiones', 'invertebrate arachnid arthropod'], ['butterfly', 'danaus plexippus', 'insect arthropod'],
  ['honey bee', 'apis mellifera', 'insect arthropod pollinator'], ['ant', 'formica rufa', 'insect arthropod'],
  ['grasshopper', 'locusta migratoria|schistocerca gregaria|caelifera|orthoptera', 'insect arthropod'], ['dragonfly', 'anax imperator', 'insect arthropod'],
  ['mosquito', 'anopheles gambiae', 'insect arthropod'], ['ladybird', 'coccinella septempunctata|coccinellidae', 'insect arthropod beetle'],
  ['peppered moth', 'biston betularia', 'insect moth evolution natural selection'],
  ['oak tree', 'quercus robur', 'plant tree flowering'], ['pine tree', 'pinus sylvestris', 'plant tree conifer'],
  ['sunflower', 'helianthus annuus', 'plant flowering'], ['grass', 'poa pratensis', 'plant producer'],
  ['fern', 'pteridium aquilinum|polypodiopsida|polypodiales', 'plant spores'], ['moss', 'polytrichum commune|polytrichum|bryophyta', 'plant spores bryophyte'],
  ['mushroom', 'amanita muscaria', 'fungus decomposer'], ['amoeba', 'amoeba proteus', 'protist single celled'],
];
// Looked at by eye (19 Oct 2026): the image PhyloPic gives for these does not read as the school animal or plant (a blob,
// a twig, a top view). The hand-drawn recipes cover them (wild, seacreature, critter, tree).
const DROP = new Set(['seal', 'peacock', 'starfish', 'grasshopper', 'snail', 'oak tree', 'pine tree']);
const OK = /creativecommons\.org\/(publicdomain\/(zero|mark)\/|licenses\/by\/)/;              // CC0, PD mark, CC BY (not -nc, -sa)
const LIC = u => /zero/.test(u) ? 'CC0' : /mark/.test(u) ? 'Public domain' : `CC BY ${/by\/([\d.]+)/.exec(u)?.[1] ?? ''}`.trim();
const BANNED = /\b(sus|canis familiaris)\b/;                                                   // house rules: no pig, no dog

let build = (await (await fetch(`${API}/images?build=0`)).json()).build;                     // the API names its current build
const get = async u => { const r = await fetch(`${API}${u}${u.includes('?') ? '&' : '?'}build=${build}`); if (r.status === 404) return {}; if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json(); };   // 404: no such name

const { flatten, close } = await openFlattener();
const items = [], missing = [];
for (const [name, sci, words] of SPECIES) {
  if (BANNED.test(sci) || DROP.has(name)) continue;
  let pick = null;
  for (const alt of sci.split('|')) {                   // the species first, then its genus or group when it has no usable image
    const list = (await get(`/images?filter_name=${encodeURIComponent(alt)}&embed_items=true&page=0`))._embedded?.items ?? [];
    const exact = x => (x._links.specificNode?.title ?? '').toLowerCase().startsWith(alt);
    pick = [...list.filter(exact), ...list.filter(x => !exact(x))].find(x => OK.test(x._links.license?.href ?? '') && x._links.vectorFile && !BANNED.test((x._links.specificNode?.title ?? '').toLowerCase()));
    if (pick) break;
  }
  if (!pick) { missing.push(name); continue; }
  const file = path.join(cache, pick._links.vectorFile.href.split('/').at(-2) + '.svg');
  if (!fs.existsSync(file)) fs.writeFileSync(file, await (await fetch(pick._links.vectorFile.href)).text());
  const d = await flatten(fs.readFileSync(file, 'utf8'));
  if (!d) { missing.push(name); continue; }
  for (const s of d.shapes) if (s[1] !== 'none') s[1] = '#3b4a54';                              // one slate colour, like a cut-out
  outline(d);
  items.push({ id: `${name} silhouette`, name: `${name[0].toUpperCase()}${name.slice(1)} (silhouette)`, kit: 'PhyloPic',
    tags: [...new Set(`${name} ${sci.replace(/\|/g, ' ')} ${words} silhouette`.toLowerCase().match(/[a-z]{3,}/g))].sort(), data: d,
    author: pick._links.contributor?.title ?? 'PhyloPic contributor', licence: LIC(pick._links.license.href), species: pick._links.specificNode?.title ?? sci.split('|')[0] });
}
await close();
const { kept, mb } = replaceSource('PhyloPic', items);
fs.writeFileSync(path.join(here, 'credits.json'), JSON.stringify(kept.map(k => ({ id: k.id, name: k.name, species: k.species, author: k.author, licence: k.licence })), null, 1) + '\n');
console.log(kept.length, 'PhyloPic silhouettes,', mb, 'MB; none usable for:', missing.join(', ') || 'none');
