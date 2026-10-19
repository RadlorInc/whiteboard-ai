// Colour drawings of everyday living things and lab and environment objects from Microsoft's Fluent Emoji (MIT
// licence: free to use commercially, keep the copyright notice) -> the realistic library (scripts/library/svg2sv.mjs).
// Founder, 19 Oct 2026: finish biology with free images where they exist (food chains, fruit and seeds, fermentation,
// pollution, deforestation...). Only the "Flat" style; no pig, no dog, no alcohol, no faces or people.
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/microsoft/fluentui-emoji <scratch>/fluent
//   (cd <scratch>/fluent && git sparse-checkout set --no-cone '/LICENSE' '/assets/*/Flat/*.svg')
//   node scripts/emoji/build.mjs <scratch>/fluent
import fs from 'node:fs';
import path from 'node:path';
import { openFlattener, outline, replaceSource } from '../library/svg2sv.mjs';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/emoji/build.mjs <fluentui-emoji checkout>'); process.exit(1); }
const here = path.dirname(new URL(import.meta.url).pathname);

// [emoji folder name, search words]: picked by hand from the 1,285 (19 Oct 2026)
const ANIMAL = 'animal', BIRD = 'bird animal', INSECT = 'insect invertebrate animal', SEA = 'sea animal', FRUIT = 'fruit plant food seeds',
  VEG = 'vegetable plant food', PLANT = 'plant', LAB = 'lab science experiment', ENV = 'environment ecology';
const PICK = {
  Ant: INSECT, Badger: ANIMAL + ' mammal', Bat: ANIMAL + ' mammal flying', Bear: ANIMAL + ' mammal', Beaver: ANIMAL + ' mammal',
  Beetle: INSECT, Bird: BIRD, Bison: ANIMAL + ' mammal herbivore', Blowfish: SEA + ' fish', Bug: INSECT + ' caterpillar larva',
  Butterfly: INSECT, Camel: ANIMAL + ' mammal desert adaptation', Cat: ANIMAL + ' mammal', Chicken: BIRD + ' hen farm',
  Chipmunk: ANIMAL + ' mammal rodent', Cockroach: INSECT, Coral: SEA + ' reef', Cow: ANIMAL + ' mammal herbivore farm', Crab: SEA + ' crustacean',
  Cricket: INSECT + ' grasshopper', Crocodile: ANIMAL + ' reptile', Deer: ANIMAL + ' mammal herbivore', Dodo: BIRD + ' extinct',
  Dolphin: SEA + ' mammal', Dove: BIRD, Duck: BIRD, Eagle: BIRD + ' predator', Elephant: ANIMAL + ' mammal herbivore', Ewe: ANIMAL + ' sheep mammal farm',
  Fish: SEA + ' fish', Flamingo: BIRD, Fly: INSECT + ' housefly', Fox: ANIMAL + ' mammal predator carnivore', Frog: ANIMAL + ' amphibian',
  Giraffe: ANIMAL + ' mammal herbivore', Goat: ANIMAL + ' mammal farm', Gorilla: ANIMAL + ' mammal primate ape', Hamster: ANIMAL + ' mammal rodent',
  'Hatching chick': BIRD + ' egg life cycle', Hedgehog: ANIMAL + ' mammal', Hippopotamus: ANIMAL + ' mammal', Honeybee: INSECT + ' bee pollinator',
  Horse: ANIMAL + ' mammal', Jellyfish: SEA + ' cnidarian invertebrate', Kangaroo: ANIMAL + ' mammal marsupial', Koala: ANIMAL + ' mammal marsupial',
  'Lady beetle': INSECT + ' ladybird ladybug', Leopard: ANIMAL + ' mammal predator', Lion: ANIMAL + ' mammal predator carnivore', Lizard: ANIMAL + ' reptile',
  Llama: ANIMAL + ' mammal', Lobster: SEA + ' crustacean', Mammoth: ANIMAL + ' mammal extinct fossil', Monkey: ANIMAL + ' mammal primate',
  Mosquito: INSECT + ' malaria', Mouse: ANIMAL + ' mammal rodent', Octopus: SEA + ' mollusc invertebrate', Orangutan: ANIMAL + ' mammal primate ape',
  Otter: ANIMAL + ' mammal', Owl: BIRD + ' predator', Ox: ANIMAL + ' mammal cattle farm', Panda: ANIMAL + ' mammal bear herbivore', Parrot: BIRD,
  Peacock: BIRD, Penguin: BIRD + ' flightless', 'Polar bear': ANIMAL + ' mammal arctic adaptation', Rabbit: ANIMAL + ' mammal herbivore',
  Raccoon: ANIMAL + ' mammal', Ram: ANIMAL + ' sheep mammal', Rat: ANIMAL + ' mammal rodent', Rhinoceros: ANIMAL + ' mammal herbivore',
  Rooster: BIRD + ' farm', Sauropod: ANIMAL + ' dinosaur reptile extinct fossil', Scorpion: INSECT + ' arachnid', Seal: SEA + ' mammal',
  Shark: SEA + ' fish predator', Shrimp: SEA + ' crustacean', Skunk: ANIMAL + ' mammal', Sloth: ANIMAL + ' mammal', Snail: ANIMAL + ' mollusc invertebrate',
  Snake: ANIMAL + ' reptile', Spider: INSECT + ' arachnid', 'Spider web': INSECT + ' spider web', 'Spouting whale': SEA + ' whale mammal',
  Squid: SEA + ' mollusc invertebrate', Swan: BIRD, 'T-rex': ANIMAL + ' dinosaur reptile extinct fossil', Tiger: ANIMAL + ' mammal predator carnivore',
  'Tropical fish': SEA + ' fish', Turkey: BIRD + ' farm', Turtle: ANIMAL + ' reptile', 'Two-hump camel': ANIMAL + ' mammal desert',
  'Water buffalo': ANIMAL + ' mammal herbivore', Whale: SEA + ' mammal', Worm: ANIMAL + ' earthworm annelid decomposer invertebrate', Zebra: ANIMAL + ' mammal herbivore',
  Feather: BIRD + ' feather', Egg: BIRD + ' egg', 'Nest with eggs': BIRD + ' nest eggs', 'Empty nest': BIRD + ' nest', Footprints: 'footprints fossil',
  Blossom: PLANT + ' flower', Bouquet: PLANT + ' flowers', 'Cherry blossom': PLANT + ' flower tree', 'Four leaf clover': PLANT + ' leaf',
  Cactus: PLANT + ' desert adaptation', 'Deciduous tree': PLANT + ' tree producer', 'Evergreen tree': PLANT + ' tree conifer pine',
  'Fallen leaf': PLANT + ' leaf autumn decay', Herb: PLANT + ' leaves', Hibiscus: PLANT + ' flower', Hyacinth: PLANT + ' flower',
  'Leaf fluttering in wind': PLANT + ' leaf wind', 'Leafy green': VEG + ' lettuce leaves', Lotus: PLANT + ' flower water', 'Maple leaf': PLANT + ' leaf',
  Mushroom: 'fungus decomposer', 'Brown mushroom': 'fungus decomposer', 'Palm tree': PLANT + ' tree', 'Potted plant': PLANT + ' houseplant',
  Rose: PLANT + ' flower', Seedling: PLANT + ' germination sprout', 'Sheaf of rice': PLANT + ' rice grass cereal crop', Sunflower: PLANT + ' flower seeds',
  Tulip: PLANT + ' flower', 'Wilted flower': PLANT + ' flower wilting water', Wood: ENV + ' log deforestation timber tree',
  'Red apple': FRUIT, 'Green apple': FRUIT, Avocado: FRUIT + ' cut seed stone', Banana: FRUIT, Blueberries: FRUIT + ' berries',
  Cherries: FRUIT, Chestnut: FRUIT + ' nut seed', Coconut: FRUIT + ' cut seed dispersal water', Grapes: FRUIT, 'Kiwi fruit': FRUIT + ' cut seeds',
  Lemon: FRUIT + ' citrus', Mango: FRUIT, Melon: FRUIT, Olive: FRUIT, Peach: FRUIT + ' stone', Pear: FRUIT, 'Pea pod': VEG + ' seeds pod legume',
  Peanuts: VEG + ' seeds nuts legume', Pineapple: FRUIT, Strawberry: FRUIT + ' seeds', Tangerine: FRUIT + ' orange citrus', Tomato: FRUIT + ' vegetable',
  Watermelon: FRUIT + ' cut seeds', Beans: VEG + ' seeds legume', 'Bell pepper': VEG, Broccoli: VEG, Carrot: VEG + ' root', Cucumber: VEG,
  'Ear of corn': VEG + ' maize cereal seeds', Eggplant: VEG, Garlic: VEG + ' bulb', 'Ginger root': VEG + ' root', 'Hot pepper': VEG, Onion: VEG + ' bulb',
  Potato: VEG + ' tuber starch osmosis', Bread: 'food bread yeast fermentation', 'Glass of milk': 'food milk', 'Honey pot': 'food honey bee',
  'Test tube': LAB + ' tube', Alembic: LAB + ' flask distillation', 'Petri dish': LAB + ' bacteria culture', Microscope: LAB + ' microscope',
  Microbe: 'microbe bacteria germ virus', Dna: 'dna gene genetics', Droplet: 'water drop', Balloon: LAB + ' balloon gas carbon dioxide fermentation',
  Thermometer: LAB + ' temperature', 'Drop of blood': 'blood', Lungs: 'lungs breathing respiration', 'Anatomical heart': 'heart circulation', Brain: 'brain nervous',
  Bone: 'bone skeleton', Tooth: 'tooth teeth', Tongue: 'tongue taste', Eye: 'eye sight',
  Factory: ENV + ' pollution industry smoke', 'Oil drum': ENV + ' oil fossil fuel pollution', Wastebasket: ENV + ' waste rubbish', 'Recycling symbol': ENV + ' recycling',
  Automobile: ENV + ' car pollution exhaust', Bus: ENV + ' transport pollution', Fire: ENV + ' fire burning combustion', Fog: ENV + ' smog pollution',
  Sun: ENV + ' sunlight energy', Cloud: ENV + ' cloud weather', 'Cloud with rain': ENV + ' rain water cycle', 'Cloud with snow': ENV + ' snow',
  'Cloud with lightning': ENV + ' lightning storm nitrogen', Rainbow: ENV + ' light', Volcano: ENV + ' volcano', Desert: ENV + ' desert habitat',
  'Desert island': ENV + ' island habitat', Mountain: ENV + ' mountain habitat', 'Snow-capped mountain': ENV + ' mountain snow habitat',
};

const items = [], missing = [];
const { flatten, close } = await openFlattener();
for (const [folder, words] of Object.entries(PICK)) {
  const dir = path.join(root, 'assets', folder, 'Flat'), file = fs.existsSync(dir) && fs.readdirSync(dir).find(f => f.endsWith('.svg'));
  if (!file) { missing.push(folder); continue; }
  const d = await flatten(fs.readFileSync(path.join(dir, file), 'utf8'));
  if (!d) { missing.push(folder); continue; }
  outline(d);
  items.push({ id: `${folder} emoji`, name: `${folder} (colour)`, kit: 'Fluent', data: d,
    tags: [...new Set(`${folder} ${words} colour`.toLowerCase().match(/[a-z]{3,}/g))].sort() });
}
await close();
const { kept, mb } = replaceSource('Fluent', items);
fs.writeFileSync(path.join(here, 'credits.json'), JSON.stringify({ source: 'Fluent Emoji (github.com/microsoft/fluentui-emoji)',
  licence: 'MIT License, Copyright (c) Microsoft Corporation', drawings: kept.map(k => k.id) }, null, 1) + '\n');
console.log(kept.length, 'Fluent emoji drawings,', mb, 'MB; missing:', missing.join(', ') || 'none');
