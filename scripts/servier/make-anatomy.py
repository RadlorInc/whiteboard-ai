# Writes player-src/lib/wb/anatomy.js (+ the public copy) from flattened Servier drawings and their part maps.
#   python3 -I scripts/servier/pptx2svg.py <unzipped pptx> <slide> slide.svg     (vector shapes of one slide)
#   python3 -I scripts/servier/flatten.py slide.svg <group index> heartcut.json  (one drawing, absolute paths, 0..1000 tall)
#   python3 -I scripts/servier/make-anatomy.py heartcut.json scripts/servier/parts-heartcut.json [...pairs]
import sys, json
pairs = list(zip(sys.argv[1::2], sys.argv[2::2])); data = {}
for flat, parts in pairs:
    f, p = json.load(open(flat)), json.load(open(parts))
    data[p['name']] = {'w': f['w'], 'h': f['h'], 'src': p['source'], 'shapes': f['shapes'], 'parts': p['parts']}
js = '''// Whiteboard library — anatomy: realistic drawings adapted from Servier Medical Art (smart.servier.com, CC BY 4.0;
// credited on /legal/copyright). Made by scripts/servier/make-anatomy.py: do not edit the data by hand.
// A drawing is pen-traced (outlines), then `fill` colours it; each named part can be pointed at with a pin element:
//   "h": "heartcut 480 270 480",  "p1": "pin of=h part=ra"   →  draw p1: the pen traces the right atrium and writes its name.
(() => {
  const A = ''' + json.dumps(data, separators=(',', ':')) + ''';
  const COL = { low: '#1f4f8f', high: '#8a1d16', valve: '#6a4e38' };
  // Realistic drawings that load when a lesson needs them (lib/sv/<id>.js calls SV.add): the player asks for every
  // "sv id=..." element before it draws (bridge.js, SV.need), so a phone downloads only that lesson's drawings.
  const SV = window.SV = { data: {}, wait: {}, add(id, d) { this.data[id] = d; (this.wait[id] || []).forEach(f => f()); },
    need(ids) { return Promise.all(ids.filter(id => /^[a-z0-9-]{1,60}$/.test(id) && !this.data[id]).map(id => new Promise(done => {
      if (!this.wait[id]) { this.wait[id] = []; const s = document.createElement('script'); s.src = `lib/sv/${id}.js`; s.onerror = () => done(); document.head.append(s); }
      this.wait[id].push(done); }))); } };
  const drawing = key => ([cx, cy, H = 460], o, t, parent) => {
    const a = key === 'sv' ? SV.data[o.id] : A[key];
    if (!a) throw new Error(`sv: no drawing "${o.id}"`);
    const s = H / a.h, ox = cx - a.w * s / 2, oy = cy - H / 2;
    const g = mk('g', { class: 'polished anat anat-draw', transform: `translate(${ox} ${oy}) scale(${s})` }, parent);
    for (const [d, fill, alpha, stroke, w] of a.shapes) {
      if (fill !== 'none') mk('path', { d, fill, class: 'fillable', ...(alpha < 1 && { opacity: alpha }) }, g);
      if (stroke) mk('path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-linejoin': 'round', class: 'ink' }, g);
    }
    g.parts = a.parts; g.place = { data: a, ox, oy, s, w: a.w, h: a.h };
    return g;
  };
  Object.assign(window.RECIPES, {
    heartcut: drawing('heartcut'),
    // "sv id=<name> cx cy height" — any realistic drawing from the on-demand library (find_drawing lists them)
    sv: drawing('sv'),
    // "pin of=<drawing id> part=<name> [| words]" — a labelled pointer to one part of an anatomy drawing listed earlier
    pin: (n, o, t, parent) => {
      const h = els[o.of], part = h?.parts?.[o.part];
      if (!part) throw new Error(`pin: no part "${o.part}" on "${o.of}"`);
      const { ox, oy, s, w } = h.place, P = (x, y) => [ox + x * s, oy + y * s], col = COL[part.kind] || '#444';
      const g = mk('g', { class: 'polished anat' }, parent);
      // The part's outline and the ring on it live inside the drawing (its moving layer), so they beat, sway or pop
      // with it; they are this pin's ink all the same (g.linked: draw draws them, the drawing's own draw skips .linked).
      const inside = h.anim || h, tw = (part.kind === 'valve' ? 2 : 3.2) / s;   // valves are lacy: a thinner trace
      g.linked = part.shapes.map(i => mk('path', { d: h.place.data.shapes[i][0], fill: 'none', stroke: col, 'stroke-width': tw, 'stroke-linejoin': 'round', class: 'ink linked', opacity: .9 }, inside));
      const [px, py] = part.at, r = 3.5 / s;
      g.linked.push(mk('path', { d: `M${px - r} ${py} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`, fill: 'none', stroke: '#333', 'stroke-width': 1.5 / s, class: 'ink linked' }, inside));
      const [ax, ay] = P(...part.at), left = part.label[0] === 'L';
      let [lx, ly] = P(left ? -50 : w + 50, part.label[1]);
      // on the board: words stay inside it, and two pins' words on one side keep 20 px apart (a wide drawing is small)
      lx = left ? Math.max(lx, 180) : Math.min(lx, 700);
      const used = (h.usedY ||= { L: [], R: [] })[left ? 'L' : 'R'];
      while (used.some(y => Math.abs(y - ly) < 20)) ly += 20;
      used.push(ly);
      // the leader, over a white halo so it reads across the drawing; the words get a halo too
      const lead = `M${ax} ${ay} L${lx + (left ? 6 : -6)} ${ly - 5}`;
      line(g, lead, '#fff', 4, { opacity: .85 }); line(g, lead, '#4b5158', 1.3);
      const tx = label(g, lx, ly, t || part.name, col, 16, left ? 'end' : 'start');
      Object.assign(tx.style, { paintOrder: 'stroke', stroke: '#fff', strokeWidth: '4px', strokeLinejoin: 'round' });
      return g;
    },
  });
})();
'''
for out in ('player-src/lib/wb/anatomy.js', 'public/player/lib/wb/anatomy.js'): open(out, 'w').write(js)
print('anatomy.js', len(js), 'bytes;', ', '.join(f'{k}: {len(v["shapes"])} shapes, {len(v["parts"])} parts' for k, v in data.items()))
