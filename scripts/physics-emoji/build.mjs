// Physics colour drawings from Microsoft's Fluent Emoji (MIT licence) -> the realistic library (scripts/library/svg2sv.mjs),
// subject physics. Founder, 19 Oct 2026: physics library from free images, like biology. No free Servier-like physics set
// exists (gwoptics' optics library is CC BY-NC: not for a paid app), so the everyday objects physics talks about come from
// here and the diagrams are recipes (lib/wb/phys.js). Same house rules as scripts/emoji: no faces, people, weapons,
// religious symbols. Every drawing stays under MAX_BYTES (svg2sv.mjs).
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/microsoft/fluentui-emoji <scratch>/fluent
//   (cd <scratch>/fluent && git sparse-checkout set --no-cone '/LICENSE' '/assets/*/Flat/*.svg')
//   node scripts/physics-emoji/build.mjs <scratch>/fluent
import fs from 'node:fs';
import path from 'node:path';
import { openFlattener, outline, replaceSource } from '../library/svg2sv.mjs';

const root = process.argv[2];
if (!root) { console.error('usage: node scripts/physics-emoji/build.mjs <fluentui-emoji checkout>'); process.exit(1); }
const here = path.dirname(new URL(import.meta.url).pathname);

// [emoji folder name, search words] by physics topic: picked by hand from the 1,285 (19 Oct 2026)
const ELEC = 'electricity circuit energy', MAG = 'magnetism magnet', LIGHT = 'light optics', SOUND = 'sound wave vibration',
  HEAT = 'heat thermal temperature', MOTION = 'motion force speed', MACH = 'machine force tool', SPACE = 'space astronomy',
  MEAS = 'measurement instrument', ENERGY = 'energy', MATTER = 'matter state';
const PICK = {
  Battery: ELEC + ' cell battery chemical', 'Low battery': ELEC + ' battery cell', 'Electric plug': ELEC + ' plug mains socket',
  'High voltage': ELEC + ' voltage danger lightning', 'Light bulb': ELEC + ' bulb lamp light filament', Flashlight: ELEC + ' torch light',
  'Cloud with lightning': ELEC + ' lightning static charge storm', Radio: ELEC + ' radio wave signal', Television: ELEC + ' screen',
  Laptop: ELEC + ' computer', 'Mobile phone': ELEC + ' phone signal wave', 'Satellite antenna': 'wave signal radio dish communication',
  Magnet: MAG + ' horseshoe attract', Compass: MAG + ' compass north needle earth field',
  'Magnifying glass tilted left': LIGHT + ' lens convex magnify', Mirror: LIGHT + ' mirror reflection', Glasses: LIGHT + ' lens spectacles eye vision',
  Telescope: LIGHT + ' telescope lens space', Microscope: LIGHT + ' microscope lens', Camera: LIGHT + ' camera lens image',
  'Film projector': LIGHT + ' projector lens image', Rainbow: LIGHT + ' rainbow dispersion spectrum colour refraction', Candle: LIGHT + ' flame source shadow',
  'Mirror ball': LIGHT + ' reflection', Sunglasses: LIGHT + ' polarised filter', Eye: LIGHT + ' eye vision',
  Loudspeaker: SOUND + ' loudspeaker', 'Speaker high volume': SOUND + ' loud amplitude', Bell: SOUND + ' bell ring', Drum: SOUND + ' drum vibrate',
  Guitar: SOUND + ' string vibrate pitch frequency', Violin: SOUND + ' string pitch', Trumpet: SOUND + ' wind air column', Microphone: SOUND + ' microphone',
  Headphone: SOUND + ' ear', 'Musical note': SOUND + ' music note pitch', Megaphone: SOUND + ' loud', 'Wind chime': SOUND + ' vibrate',
  Thermometer: HEAT + ' thermometer measure', Fire: HEAT + ' fire burning combustion convection', Ice: MATTER + ' ice solid melting freezing cold',
  Snowflake: MATTER + ' ice crystal freezing cold', Droplet: MATTER + ' water liquid drop', 'Hot springs': HEAT + ' steam evaporation boiling',
  'Fire extinguisher': HEAT + ' fire pressure', Sun: SPACE + ' sun star energy radiation light heat',
  Rocket: SPACE + ' rocket thrust newton third law action reaction', Satellite: SPACE + ' satellite orbit', 'Ringed planet': SPACE + ' planet saturn',
  'Globe showing asia-australia': SPACE + ' earth planet globe', 'Globe with meridians': SPACE + ' earth latitude longitude', Comet: SPACE + ' comet',
  'Shooting star': SPACE + ' meteor', Star: SPACE + ' star', 'Night with stars': SPACE + ' night sky stars', 'Full moon': SPACE + ' moon phase',
  'New moon': SPACE + ' moon phase', 'First quarter moon': SPACE + ' moon phase', 'Last quarter moon': SPACE + ' moon phase',
  'Waxing crescent moon': SPACE + ' moon phase', 'Waxing gibbous moon': SPACE + ' moon phase', 'Waning crescent moon': SPACE + ' moon phase',
  'Waning gibbous moon': SPACE + ' moon phase', 'Crescent moon': SPACE + ' moon', Sunrise: SPACE + ' sunrise earth rotation day',
  'Atom symbol': 'atom nucleus electron orbit', Radioactive: 'radioactive radiation nuclear decay hazard',
  'Balance scale': MEAS + ' balance mass weight equilibrium moment', Stopwatch: MEAS + ' stopwatch time', 'Alarm clock': MEAS + ' clock time',
  'Timer clock': MEAS + ' timer time', 'Hourglass not done': MEAS + ' time sand', 'Straight ruler': MEAS + ' ruler length distance',
  'Triangular ruler': MEAS + ' set square angle', Watch: MEAS + ' watch time',
  Gear: MACH + ' gear cog wheel', 'Nut and bolt': MACH + ' screw', Hammer: MACH + ' hammer impulse force', Wrench: MACH + ' spanner lever moment turning',
  Screwdriver: MACH + ' screw lever', Axe: MACH + ' wedge', Pick: MACH + ' lever', Ladder: MACH + ' ladder', Hook: MACH + ' hook',
  Chains: MACH + ' chain tension', Link: MACH + ' chain', Bucket: MACH + ' bucket pulley well', Wheel: MACH + ' wheel axle friction',
  Clamp: MACH + ' clamp pressure', Toolbox: MACH + ' tools', Anchor: MACH + ' anchor weight',
  Bicycle: MOTION + ' bicycle gear wheel', Automobile: MOTION + ' car vehicle', 'Racing car': MOTION + ' car speed acceleration',
  'Bullet train': MOTION + ' train speed', Train: MOTION + ' train steam engine', Airplane: MOTION + ' aeroplane lift drag flight',
  Helicopter: MOTION + ' helicopter lift', Sailboat: MOTION + ' boat wind float buoyancy', Ship: MOTION + ' ship float buoyancy archimedes',
  Speedboat: MOTION + ' boat speed', 'Roller coaster': MOTION + ' roller coaster potential kinetic energy', 'Ferris wheel': MOTION + ' circular motion centripetal',
  'Playground slide': MOTION + ' slide friction gravity incline', Skateboard: MOTION + ' skateboard friction', 'Roller skate': MOTION + ' friction wheels',
  'Ice skate': MOTION + ' ice friction', Sled: MOTION + ' sledge friction snow', Skis: MOTION + ' ski friction pressure',
  Kite: MOTION + ' kite wind lift', Balloon: MOTION + ' balloon air pressure gas static', 'Soccer ball': MOTION + ' ball kick projectile',
  Basketball: MOTION + ' ball projectile bounce', Tennis: MOTION + ' ball bounce', Bowling: MOTION + ' ball momentum collision',
  'Curling stone': MOTION + ' friction momentum', Tractor: MOTION + ' tractor', 'Motor boat': MOTION + ' boat', 'Fuel pump': ENERGY + ' fuel petrol',
  'Oil drum': ENERGY + ' oil fossil fuel', Wood: ENERGY + ' fuel wood', Tornado: 'wind air pressure vortex', 'Water wave': 'wave water ocean',
  'Leaf fluttering in wind': 'wind air', Fountain: 'water pressure fluid', Brick: MATTER + ' solid density', Rock: MATTER + ' solid density stone'
};

const items = [], missing = [];
const { flatten, close } = await openFlattener();
for (const [folder, words] of Object.entries(PICK)) {
  const dir = path.join(root, 'assets', folder, 'Flat'), file = fs.existsSync(dir) && fs.readdirSync(dir).find(f => f.endsWith('.svg'));
  if (!file) { missing.push(folder); continue; }
  const d = await flatten(fs.readFileSync(path.join(dir, file), 'utf8'));
  if (!d) { missing.push(folder); continue; }
  outline(d);
  const name = folder.replace(/ tilted left|-australia| not done/g, '');
  items.push({ id: `${name} physics`, name: `${name} (colour)`, kit: 'Physics-Fluent', data: d,
    tags: [...new Set(`${name} ${words} colour`.toLowerCase().match(/[a-z]{3,}/g))].sort() });
}
await close();
const { kept, mb, skipped } = replaceSource('Physics-Fluent', items, 'physics');
fs.writeFileSync(path.join(here, 'credits.json'), JSON.stringify({ source: 'Fluent Emoji (github.com/microsoft/fluentui-emoji)',
  licence: 'MIT License, Copyright (c) Microsoft Corporation', drawings: kept.map(k => k.id) }, null, 1) + '\n');
console.log(kept.length, 'physics Fluent drawings,', mb, 'MB; missing:', missing.join(', ') || 'none', '; over the size cap:', skipped.join(', ') || 'none');
