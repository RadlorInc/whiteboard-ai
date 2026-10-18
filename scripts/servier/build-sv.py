# Writes the on-demand drawing files and the catalogue the prompts read, from curate.py's kept.json.
#   python3 -I scripts/servier/build-sv.py <extract out dir>
#   -> public/player/lib/sv/<id>.js  (SV.add("<id>", {w, h, shapes}); coordinates rounded to whole units of a 1000-tall box)
#   -> scripts/servier/sv-catalogue.json  ([{id, name, subject, kit, w, tags}], read by build-prompts.mjs)
# Drawings over 1 MB are left out (they are textures, too heavy for a phone).
import sys, os, re, json
out = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__)); app = os.path.dirname(os.path.dirname(here))
dest = os.path.join(app, 'public', 'player', 'lib', 'sv'); os.makedirs(dest, exist_ok=True)
# Bioicons drawings (scripts/bioicons/build.mjs) share the folder and catalogue: keep them.
catf = os.path.join(here, 'sv-catalogue.json')
bio = [c for c in json.load(open(catf)) if c['kit'].startswith('Bioicons')] if os.path.exists(catf) else []
keep = {c['id'] + '.js' for c in bio}
for f in os.listdir(dest):
    if f not in keep: os.remove(os.path.join(dest, f))
cat, skipped, total = [], 0, 0
for k in json.load(open(os.path.join(out, 'kept.json'))):
    d = json.load(open(os.path.join(out, k['src'] + '.json')))
    for s in d['shapes']: s[0] = re.sub(r'-?\d+\.\d+', lambda m: str(round(float(m.group()))), s[0]); s[4] = round(s[4], 1)
    body = json.dumps({'w': d['w'], 'h': d['h'], 'shapes': d['shapes']}, separators=(',', ':'))
    if len(body) > 1_000_000: skipped += 1; continue
    open(os.path.join(dest, k['id'] + '.js'), 'w').write(f'SV.add({json.dumps(k["id"])},{body});\n'); total += len(body)
    cat.append({'id': k['id'], 'name': k['name'], 'subject': k['subject'], 'kit': k['kit'], 'w': d['w'], 'tags': k['tags']})
json.dump(cat + bio, open(catf, 'w'), separators=(',', ':'))
print(len(cat), 'drawings,', round(total / 1e6, 1), 'MB;', skipped, 'over 1 MB left out')
