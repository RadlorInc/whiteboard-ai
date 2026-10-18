# Convert the vector drawings on one PPTX slide (DrawingML custGeom / prstGeom ellipse+rect, groups) to SVG.
# usage: python3 -I pptx2svg.py <unzipped pptx dir> <slide number> <out.svg>
import sys, re, colorsys, xml.etree.ElementTree as ET

NS = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      'p': 'http://schemas.openxmlformats.org/presentationml/2006/main'}
A = '{%s}' % NS['a']; P = '{%s}' % NS['p']
theme = {}
def load_theme(root_dir):
  theme.clear()
  t = ET.parse(f'{root_dir}/ppt/theme/theme1.xml').getroot()
  for el in t.find('.//a:clrScheme', NS):
    tag = el.tag.split('}')[1]; c = el[0]
    theme[tag] = c.get('val') if c.tag == A + 'srgbClr' else c.get('lastClr', '000000')
alias = {'tx1': 'dk1', 'bg1': 'lt1', 'tx2': 'dk2', 'bg2': 'lt2'}

def color(el):
    """el: a fill element's colour child (srgbClr / schemeClr / prstClr) -> (hex, alpha)"""
    if el is None: return None
    if el.tag == A + 'srgbClr': v = el.get('val')
    elif el.tag == A + 'schemeClr': v = theme.get(alias.get(el.get('val'), el.get('val')), '000000')
    elif el.tag == A + 'prstClr': v = {'black': '000000', 'white': 'FFFFFF'}.get(el.get('val'), '000000')
    elif el.tag == A + 'sysClr': v = el.get('lastClr', '000000')
    else: return None
    r, g, b = (int(v[i:i + 2], 16) / 255 for i in (0, 2, 4)); alpha = 1.0
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    for m in el:
        k, val = m.tag.split('}')[1], int(m.get('val', '0')) / 100000
        if k == 'lumMod': l *= val
        elif k == 'lumOff': l += val
        elif k == 'alpha': alpha = val
        elif k == 'shade': l *= val
        elif k == 'tint': l = l + (1 - l) * (1 - val)
    r, g, b = colorsys.hls_to_rgb(h, max(0, min(1, l)), s)
    return '#%02x%02x%02x' % (round(r * 255), round(g * 255), round(b * 255)), alpha

def fill_of(spPr, style):
    for k in ('noFill', 'solidFill', 'gradFill'):
        f = spPr.find('a:' + k, NS)
        if f is not None:
            if k == 'noFill': return None
            if k == 'solidFill': return color(f[0])
            stops = f.findall('.//a:gs', NS)          # gradient: use its middle stop (flat look)
            return color(stops[len(stops) // 2][0]) if stops else None
    if style is not None:
        r = style.find('a:fillRef', NS)
        if r is not None and r.get('idx') != '0' and len(r): return color(r[0])
    return None

def line_of(spPr, style):
    ln = spPr.find('a:ln', NS)
    w = int(ln.get('w', '9525')) if ln is not None else 9525
    if ln is not None:
        if ln.find('a:noFill', NS) is not None: return None
        f = ln.find('a:solidFill', NS)
        if f is not None: return color(f[0]), w
    if style is not None:
        r = style.find('a:lnRef', NS)
        if r is not None and r.get('idx') != '0' and len(r): return color(r[0]), w
    return None

def guides(geom, w, h):
    v = {'w': w, 'h': h, 'l': 0, 't': 0, 'r': w, 'b': h}
    def val(x):
        try: return float(x)
        except ValueError: return v[x]
    for gd in geom.findall('a:gdLst/a:gd', NS):
        op, *args = gd.get('fmla').split(); a = [val(x) for x in args]
        v[gd.get('name')] = {'*/': lambda: a[0] * a[1] / a[2], '+-': lambda: a[0] + a[1] - a[2], '+/': lambda: (a[0] + a[1]) / a[2],
                             'val': lambda: a[0], '?:': lambda: a[1] if a[0] > 0 else a[2]}.get(op, lambda: 0)()
    return v, val

def cust_path(geom, cx, cy):
    v, val = guides(geom, cx, cy); d = []
    for path in geom.findall('a:pathLst/a:path', NS):
        pw, ph = float(path.get('w', cx) or cx), float(path.get('h', cy) or cy)
        sx, sy = cx / pw if pw else 1, cy / ph if ph else 1
        pt = lambda p: f"{val(p.get('x')) * sx:.0f} {val(p.get('y')) * sy:.0f}"
        for c in path:
            k = c.tag.split('}')[1]; pts = c.findall('a:pt', NS)
            if k == 'moveTo': d.append('M' + pt(pts[0]))
            elif k == 'lnTo': d.append('L' + pt(pts[0]))
            elif k == 'cubicBezTo': d.append('C' + ' '.join(pt(p) for p in pts))
            elif k == 'quadBezTo': d.append('Q' + ' '.join(pt(p) for p in pts))
            elif k == 'close': d.append('Z')
    return ' '.join(d)

def xfrm_tf(x):
    off, ext = x.find('a:off', NS), x.find('a:ext', NS)
    ox, oy, cx, cy = (float(off.get('x')), float(off.get('y')), float(ext.get('cx')), float(ext.get('cy')))
    return ox, oy, cx, cy, float(x.get('rot', 0)) / 60000, x.get('flipH') == '1', x.get('flipV') == '1'

out_parts, count = [], 0
def walk(node, depth=0, k=1.0):          # k: how much the groups above scale this level (stroke widths are absolute)
    global count
    for ch in node:
        tag = ch.tag.split('}')[1]
        if tag == 'grpSp':
            x = ch.find('p:grpSpPr/a:xfrm', NS)
            ox, oy, cx, cy, rot, fh, fv = xfrm_tf(x)
            co, ce = x.find('a:chOff', NS), x.find('a:chExt', NS)
            cox, coy, cex, cey = float(co.get('x')), float(co.get('y')), float(ce.get('cx')) or 1, float(ce.get('cy')) or 1
            tf = f'translate({ox:.1f} {oy:.1f})'
            if rot or fh or fv: tf += f' translate({cx / 2:.1f} {cy / 2:.1f}) rotate({rot:.2f}) scale({-1 if fh else 1} {-1 if fv else 1}) translate({-cx / 2:.1f} {-cy / 2:.1f})'
            tf += f' scale({cx / cex:.6f} {cy / cey:.6f}) translate({-cox:.1f} {-coy:.1f})'
            out_parts.append(f'<g transform="{tf}">'); walk(ch, depth + 1, k * ((cx / cex + cy / cey) / 2)); out_parts.append('</g>')
        elif tag == 'sp':
            spPr = ch.find('p:spPr', NS); x = spPr.find('a:xfrm', NS) if spPr is not None else None
            if x is None or ch.find('p:txBody/a:p/a:r', NS) is not None and spPr.find('a:custGeom', NS) is None: continue
            ox, oy, cx, cy, rot, fh, fv = xfrm_tf(x)
            style = ch.find('p:style', NS)
            f, l = fill_of(spPr, style), line_of(spPr, style)
            cg, pg = spPr.find('a:custGeom', NS), spPr.find('a:prstGeom', NS)
            if cg is not None: shape = f'<path d="{cust_path(cg, cx, cy)}"'
            elif pg is not None and pg.get('prst') == 'ellipse': shape = f'<ellipse cx="{cx / 2:.0f}" cy="{cy / 2:.0f}" rx="{cx / 2:.0f}" ry="{cy / 2:.0f}"'
            elif pg is not None and pg.get('prst') == 'rect': shape = f'<rect width="{cx:.0f}" height="{cy:.0f}"'
            else: continue
            attrs = f' fill="{f[0]}"' + (f' fill-opacity="{f[1]:.2f}"' if f[1] < 1 else '') if f else ' fill="none"'
            attrs += (f' stroke="{l[0][0]}" stroke-width="{l[1] / k:.2f}" stroke-linejoin="round"' + (f' stroke-opacity="{l[0][1]:.2f}"' if l[0][1] < 1 else '')) if l and l[0] else ''
            tf = f'translate({ox:.1f} {oy:.1f})'
            if rot or fh or fv: tf += f' translate({cx / 2:.1f} {cy / 2:.1f}) rotate({rot:.2f}) scale({-1 if fh else 1} {-1 if fv else 1}) translate({-cx / 2:.1f} {-cy / 2:.1f})'
            out_parts.append(f'{shape} transform="{tf}"{attrs} data-name="{ch.find("p:nvSpPr/p:cNvPr", NS).get("name")}"/>'); count += 1

def slide_svg(root_dir, n):
    """(svg text, [texts inside each top-level group], slide title) for one slide; theme must be loaded"""
    global count
    out_parts.clear(); count = 0
    sld = ET.parse(f'{root_dir}/ppt/slides/slide{n}.xml').getroot()
    tree = sld.find('p:cSld/p:spTree', NS)
    walk(tree)
    texts = [' '.join(t.text or '' for t in g.iter(A + 't')).strip() for g in tree if g.tag == P + 'grpSp']   # = the svg's <g> children, in order
    title = ' '.join(t.text or '' for sp in tree.findall('p:sp', NS) if sp.find('.//p:ph', NS) is not None for t in sp.iter(A + 't')).strip()
    pres = ET.parse(f'{root_dir}/ppt/presentation.xml').getroot().find('p:sldSz', NS)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {pres.get("cx")} {pres.get("cy")}">' + ''.join(out_parts) + '</svg>', texts, title

if __name__ == '__main__':
    root_dir, n, out = sys.argv[1], sys.argv[2], sys.argv[3]
    load_theme(root_dir)
    svg, _, _ = slide_svg(root_dir, n)
    open(out, 'w').write(svg)
    print(f'{count} shapes -> {out}')
