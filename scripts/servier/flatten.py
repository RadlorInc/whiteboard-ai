# Flatten one top-level group of a converted slide (pptx2svg.py output) into absolute paths, normalised so the group's
# box is 0..1000 tall: [[d, fill, fillOpacity, stroke, strokeWidth], ...]. usage: python3 -I flatten.py in.svg groupIndex out.json
import sys, re, json, math, xml.etree.ElementTree as ET
N = '{http://www.w3.org/2000/svg}'
def mul(a, b): return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]]
def parse_tf(s):
    m = [1, 0, 0, 1, 0, 0]
    for fn, args in re.findall(r'(\w+)\(([^)]*)\)', s or ''):
        v = [float(x) for x in args.replace(',', ' ').split()]
        if fn == 'translate': t = [1, 0, 0, 1, v[0], v[1] if len(v) > 1 else 0]
        elif fn == 'scale': t = [v[0], 0, 0, v[1] if len(v) > 1 else v[0], 0, 0]
        elif fn == 'rotate': r = math.radians(v[0]); t = [math.cos(r), math.sin(r), -math.sin(r), math.cos(r), 0, 0]
        m = mul(m, t)
    return m
def walk(el, m, shapes):
    for c in el:
        tag = c.tag.replace(N, ''); mm = mul(m, parse_tf(c.get('transform')))
        if tag == 'g': walk(c, mm, shapes); continue
        if tag == 'path': d = c.get('d')
        elif tag == 'ellipse':
            cx, cy, rx, ry = (float(c.get(k)) for k in ('cx', 'cy', 'rx', 'ry')); k = .5523
            d = (f'M{cx-rx} {cy} C{cx-rx} {cy-k*ry} {cx-k*rx} {cy-ry} {cx} {cy-ry} C{cx+k*rx} {cy-ry} {cx+rx} {cy-k*ry} {cx+rx} {cy} '
                 f'C{cx+rx} {cy+k*ry} {cx+k*rx} {cy+ry} {cx} {cy+ry} C{cx-k*rx} {cy+ry} {cx-rx} {cy+k*ry} {cx-rx} {cy} Z')
        elif tag == 'rect':
            w, h = float(c.get('width')), float(c.get('height')); d = f'M0 0 L{w} 0 L{w} {h} L0 {h} Z'
        else: continue
        pts = []
        def tp(match):
            x, y = float(match.group(1)), float(match.group(2))
            pts.append((mm[0]*x+mm[2]*y+mm[4], mm[1]*x+mm[3]*y+mm[5])); return f'\0{len(pts)-1}\0'
        dd = re.sub(r'(-?[\d.]+)[ ,]+(-?[\d.]+)', tp, d)
        sc = math.sqrt(abs(mm[0]*mm[3]-mm[1]*mm[2]))
        shapes.append([dd, pts, c.get('fill', 'none'), float(c.get('fill-opacity', 1)), c.get('stroke'), float(c.get('stroke-width', 0)) * sc])
def flatten(el):
  """one svg element (a drawing) -> {'w', 'h': 1000, 'shapes': [[d, fill, alpha, stroke, width], ...]} or None if empty"""
  shapes = []
  walk([el], [1, 0, 0, 1, 0, 0], shapes)
  if not shapes: return None
  xs = [p[0] for s in shapes for p in s[1]]; ys = [p[1] for s in shapes for p in s[1]]
  x0, y0, H = min(xs), min(ys), max(ys) - min(ys)
  if H <= 0: return None
  k = 1000 / H
  res = []
  for dd, pts, f, fo, st, sw in shapes:
      d = re.sub('\0(\\d+)\0', lambda m: f'{(pts[int(m.group(1))][0]-x0)*k:.1f} {(pts[int(m.group(1))][1]-y0)*k:.1f}', dd)
      d = re.sub(r'\.0\b', '', d)
      res.append([d, f, round(fo, 2), st, round(sw * k, 2)])
  return {'w': round((max(xs) - x0) * k), 'h': 1000, 'shapes': res, 'box': [round(x0), round(y0), round(max(xs) - x0), round(H)]}   # box: where it sat on the slide (EMU)

if __name__ == '__main__':
    src, gi, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    d = flatten(list(ET.parse(src).getroot())[gi])
    json.dump(d, open(out, 'w'), separators=(',', ':'))
    print(len(d['shapes']), 'shapes, w =', d['w'])
