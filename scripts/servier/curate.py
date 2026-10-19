# Choose the school-useful drawings from extract.py's catalogue and give each a name and tags.
#   python3 -I scripts/servier/curate.py <unzipped kits dir> <extract out dir>
# Writes <out>/kept.json ([{id, name, kit, subject, tags, src, shapes, bytes, w, composite}]) and prints why the rest went.
# Rules (founder, 18 Oct 2026: school biology first, chemistry kits kept for later):
#   - diseases, treatments and medical acts go (a word list on the slide title and the words in the drawing);
#   - recoloured copies on one slide go (same number of shapes and the same width: keep the first);
#   - lone bits (fewer than 4 shapes) go;
#   - a slide whose drawings overlap one another is one picture split into pieces: it is kept whole, as one drawing.
import sys, os, re, json, collections, xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pptx2svg, flatten

kits_dir, out = sys.argv[1], sys.argv[2]
cat = json.load(open(os.path.join(out, 'catalogue.json')))

SICK = re.compile(r'\b(\w{4,}itis|embol\w*|cancer\w*|tumou?r\w*|carcinom\w*|o?edema|emphysema|fractur\w*|thromb\w*|atherom\w*|'
                  r'atheroscler\w*|pneumothorax|disease\w*|insufficien\w*|regurgita\w*|stenos\w*|aneurysm\w*|varic\w*|ulcer\w*|'
                  r'cirrhos\w*|fibros\w*|scleros\w*|osteoporos\w*|arthros\w*|necros\w*|psorias\w*|tuberculos\w*|infarct\w*|ischa?emi\w*|'
                  r'lesion\w*|syndrome\w*|polyp\w*|hernia\w*|glaucoma|cataract\w*|melanoma\w*|leuka?emi\w*|lymphoma\w*|diabet\w*|obes\w*|'
                  r'hypertens\w*|injur\w*|wound\w*|pain\w*|cough\w*|surg\w*|stent\w*|cathet\w*|prosthe\w*|transplant\w*|dialys\w*|'
                  r'implant\w*|treatment\w*|drug\w*|metasta\w*|dysplas\w*|hypertroph\w*|atroph\w*|failure|prolaps\w*|reflux|ha?emorrh\w*|'
                  r'patholog\w*|pathophysiolog\w*|acne|eczema|wart\w*|scar\w*|burn\w*|allerg\w*|asthma|anaemi\w*|anemi\w*|sickle|'
                  r'aneuploid\w*|mutation\w*|infection\w*|abscess\w*|gangren\w*|amputa\w*|cast|splint|bandage\w*|syringe\w*|tablet\w*|pill\w*)\b', re.I)
SUBJECT = {'Chemistry': 'chemistry', 'Lab-apparatus': 'chemistry'}
KIT_WORDS = {'Arteries-physiology': 'artery blood vessel circulation', 'Blood-immunology': 'blood immune cells immunity',
             'Bone-structure': 'bone skeleton', 'Bones': 'bone skeleton', 'Cell-membrane': 'cell membrane transport',
             'Digestive-system': 'digestion gut', 'Embryology': 'embryo development', 'Endocrinology': 'hormone gland',
             'ENT': 'ear nose throat', 'Genetics': 'genetics dna chromosome', 'Heart-physiology': 'heart circulation',
             'Infectiology': 'microbe virus bacteria', 'Intracellular-components': 'cell organelle', 'Lipids': 'lipid fat molecule',
             'Lymphatic-system': 'lymph immune', 'Microbiology-cell-culture': 'microbe bacteria cell culture lab', 'Muscles': 'muscle',
             'Nervous-system': 'nervous system brain', 'Neural-cells': 'neuron nerve cell', 'Nucleic-acids': 'dna rna nucleic acid',
             'Ophthalmology': 'eye vision', 'Parasitology': 'parasite', 'Receptors-channels': 'receptor channel membrane',
             'Reproduction': 'reproduction', 'Respiratory-system': 'breathing lungs', 'Tissues': 'tissue cells',
             'Urinary-system': 'kidney urine', 'Veins': 'vein blood vessel circulation', 'Dermatology': 'skin', 'Animals': 'animal',
             'Chemistry': 'chemistry molecule', 'Lab-apparatus': 'lab apparatus glassware'}

def area(b): return b[2] * b[3]
def overlap(a, b):
    w = min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0]); h = min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1])
    return max(0, w) * max(0, h)

why = collections.Counter(); kept = []; names = collections.Counter()
by_slide = collections.defaultdict(list)
for c in cat: by_slide[(c['kit'], c['slide'])].append(c)

def clean(t):
    t = re.sub(r'\s*\(\d+\)\s*$', '', t or '').strip()
    return re.sub(r'^Example:\s*', '', t).strip() or 'drawing'

def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:40] or 'drawing'

def add(c, name, words, composite=False):
    base = slug(name); names[base] += 1
    did = base if names[base] == 1 else f'{base}-{names[base]}'
    tags = sorted(set(re.findall(r'[a-z]{3,}', f'{name} {words} {KIT_WORDS.get(c["kit"], "")}'.lower())))
    kept.append({'id': did, 'name': name, 'kit': c['kit'], 'subject': SUBJECT.get(c['kit'], 'biology'), 'tags': tags,
                 'src': f'{c["kit"]}/s{c["slide"]}' + ('' if composite else f'-{c["i"]}'), 'shapes': c['shapes'], 'bytes': c['bytes'],
                 'w': c['w'], 'composite': composite})

composites = []
for (kit, n), items in sorted(by_slide.items()):
    title = items[0]['title']
    if SICK.search(title): why['disease or treatment (slide title)'] += len(items); continue
    # one picture in pieces: most pieces overlap another piece
    if len(items) >= 3:
        hits = sum(1 for a in items if any(b is not a and overlap(a['box'], b['box']) > .15 * min(area(a['box']), area(b['box'])) for b in items))
        if hits >= .6 * len(items):
            composites.append((kit, n, title, items)); continue
    seen = set()
    for c in items:
        if SICK.search(c['words']): why['disease or treatment (words in it)'] += 1; continue
        if c['shapes'] < 4: why['lone bit (under 4 shapes)'] += 1; continue
        key = (c['shapes'], round(c['w'] / 25))
        if key in seen: why['recoloured copy'] += 1; continue
        seen.add(key)
        add(c, clean(title), c['words'])

# composites: flatten the whole slide as one drawing
cache = {}
for kit, n, title, items in composites:
    root = os.path.join(kits_dir, kit)
    if cache.get('kit') != kit: pptx2svg.load_theme(root); cache['kit'] = kit
    svg, _, _ = pptx2svg.slide_svg(root, n)
    g = ET.fromstring(svg); g.tag = '{http://www.w3.org/2000/svg}g'   # the whole slide, read as one group
    d = flatten.flatten(g)
    if not d or len(d['shapes']) < 4: why['empty composite'] += 1; continue
    d.pop('box', None)
    body = json.dumps(d, separators=(',', ':'))
    open(os.path.join(out, kit, f's{n}.json'), 'w').write(body)
    c = {'kit': kit, 'slide': n, 'i': None, 'shapes': len(d['shapes']), 'bytes': len(body), 'w': d['w']}
    add(c, clean(title), ' '.join(i['words'] for i in items), composite=True)
    why[f'pieces joined into whole pictures ({len(composites)} slides)'] += len(items)

json.dump(kept, open(os.path.join(out, 'kept.json'), 'w'), indent=0)
print('KEPT', len(kept), 'drawings,', round(sum(k['bytes'] for k in kept) / 1e6, 1), 'MB;',
      sum(1 for k in kept if k['composite']), 'of them whole pictures;', sum(1 for k in kept if k['subject'] == 'chemistry'), 'chemistry')
for r, k in why.most_common(): print(f'  {k:5d}  {r}')
print('per kit:', ', '.join(f'{k}: {v}' for k, v in sorted(collections.Counter(x['kit'] for x in kept).items())))
