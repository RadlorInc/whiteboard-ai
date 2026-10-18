# Every drawing (top-level group) on every slide of the unzipped Servier kits -> one JSON each + a catalogue.
#   python3 -I scripts/servier/extract.py <dir with one unzipped kit per folder> <out dir>
# The catalogue (catalogue.json) lists: id, kit, slide, slide title, the words inside the drawing, shapes, bytes, w.
import sys, os, json, xml.etree.ElementTree as ET
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pptx2svg, flatten

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
cat, skipped = [], 0
for kit in sorted(os.listdir(src)):
    root = os.path.join(src, kit)
    if not os.path.isdir(os.path.join(root, 'ppt', 'slides')): continue
    pptx2svg.load_theme(root)
    slides = sorted(int(f[5:-4]) for f in os.listdir(os.path.join(root, 'ppt', 'slides')) if f.startswith('slide') and f.endswith('.xml'))
    os.makedirs(os.path.join(out, kit), exist_ok=True)
    for n in slides:
        try: svg, texts, title = pptx2svg.slide_svg(root, n)
        except Exception as e: print('skip', kit, n, e); skipped += 1; continue
        gs = [c for c in ET.fromstring(svg) if c.tag.endswith('}g')]
        for i, g in enumerate(gs):
            d = flatten.flatten(g)
            if not d or len(d['shapes']) < 3: continue           # a lone arrow or box is not a drawing
            did = f'{kit}-s{n}-{i}'
            box = d.pop('box')
            body = json.dumps(d, separators=(',', ':'))
            open(os.path.join(out, kit, f's{n}-{i}.json'), 'w').write(body)
            cat.append({'id': did, 'kit': kit, 'slide': n, 'i': i, 'title': title, 'words': (texts[i] if i < len(texts) else '')[:200],
                        'shapes': len(d['shapes']), 'bytes': len(body), 'w': d['w'], 'box': box})
    print(kit, sum(1 for c in cat if c['kit'] == kit), 'drawings', flush=True)
json.dump(cat, open(os.path.join(out, 'catalogue.json'), 'w'), indent=0)
print('TOTAL', len(cat), 'drawings,', round(sum(c['bytes'] for c in cat) / 1e6, 1), 'MB;', skipped, 'slides failed')
