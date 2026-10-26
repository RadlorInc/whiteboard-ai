// "velcropad cx cy k aim=left|right tilt=-40..40 x=0..200 v=0|1 lab=0 lit=pad|plate|screws" — a PART (PARTS.md,
// batch 5): the Velcro pad on a dynamics trolley's front (collision.js, k=stick), so two trolleys stick together and
// move on as one (an inelastic collision). Its origin is the middle of its back, on the face it is screwed to; it faces
// −x (aim=left: a labtrolley's front) or +x (aim=right). A 5 × 3 cm grey nylon backing plate with a screw in each
// tab, the 4 × 3 cm hook pad on it (stitched border, rows of hooks), 0.5 cm thick in all. It rides on the trolley:
// give it the trolley's tilt, x and v and it moves with it (labtrolley's road). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, D = (p, s) => K.dotsSvg(p, s);
  const HOOK = ISO.tint("#5f6268", ["#33353a", "#3d3f45", "#484a50", "#53565c"], "#17181b");
  const NYLON = ISO.tint("#e9eaec", ["#a9acb1", "#b8bbbf", "#c7c9cc", "#d6d8da"], "#4a4d52");
  const T0 = 0.12, T1 = 0.5, HY = 2, HZ = 1.5, TAB = 2.5;

  function padSvg(P, rd, sg, lab) {
    const at = rd.at, U = B10.span(sg), pt = (u, w, y) => K.iso(at(u, w, y), P), out = [];
    // the backing plate with its two screw tabs, then the screws
    const plate = `<g data-name="plate">${ISO.tinted(NYLON, ISO.box(at, P, U(0, T0), [-HZ, HZ], [-TAB, TAB], "mid"))}</g>`;
    const screw = (s) => `<g data-name="screws">${B10.screw(P, rd, sg * T0, 0, s * (TAB - 0.25), sg, 0.17)}</g>`;
    // the hook pad: its body, the stitched border on the outer face (when that face is toward us) and on the top
    const uo = sg * T1 + sg * 0.01, outer = sg > 0;
    const pad = [ISO.tinted(HOOK, ISO.box(at, P, U(T0, T1), [-HZ, HZ], [-HY, HY], "mid"))];
    const ring = (u, e) => [[-HY + e, -HZ + e], [HY - e, -HZ + e], [HY - e, HZ - e], [-HY + e, HZ - e]].map(([y, w]) => pt(u, w, y));
    if (outer) {
      pad.push(`<path d="${K.pathOf(ring(uo, 0.22), true)}" fill="none" stroke="#9a9da3" stroke-width="0.8" stroke-dasharray="1.6 1.2" data-free=""/>`);
      const hooks = [];
      for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) hooks.push(pt(uo, -HZ + 0.45 + j * 0.3 + (i % 2) * 0.15, -HY + 0.35 + i * 0.3));
      pad.push(`<path d="${hooks.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0.01`).join("")}" stroke="#8e9197" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.07).toFixed(2)}" stroke-linecap="round" data-free=""/>`);
    }
    // the top edge: the hook layer's cut nap, a row of loops along it
    const top = []; for (let y = -HY + 0.2; y <= HY - 0.19; y += 0.25) top.push(pt(sg * (T0 + T1) / 2, HZ + 0.01, y));
    pad.push(`<path d="${top.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0.01`).join("")}" stroke="#8e9197" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.06).toFixed(2)}" stroke-linecap="round" data-free=""/>`);
    const padG = `<g data-name="pad">${pad.join("")}</g>`;
    // the camera looks from +x: facing +x the pad is nearest, facing −x the plate is (and its screws are behind it)
    out.push(...(sg > 0 ? [plate, screw(-1), padG, screw(1)] : [padG, screw(-1), screw(1), plate]));
    if (lab) out.push(CIRC.word(P, at(sg * T1, HZ + 1, 0), "Velcro pad"));
    return { svg: out.join(""), anchors: { face: at(sg * T1, 0, 0).map((v) => +v.toFixed(3)) } };
  }

  ISO.add({
    name: "velcropad", title: "Velcro pad (part)", compare: null,
    about: "A Velcro hook pad on a backing plate, screwed to a dynamics trolley's front so two trolleys stick together when they collide; rides with the trolley (same tilt, x, v). anchors: face",
    line: "velcropad cx cy k aim=left|right tilt=-40..40 x=0..200 v=0|1 lab=0 lit=pad|plate|screws",
    demo: { line: "velcropad 480 300 60 aim=right", script: [{ set: {}, hold: 1 }, { set: { lit: "pad" }, hold: 1.2 }, { set: { x: 1.5, lit: "screws" }, hold: "settle" }, { set: { aim: "left", x: 0, lit: "plate" }, hold: "settle" }, { set: { tilt: 20, v: 1, x: 2, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      let sg = B10.side(o);
      const s = B10.ride(g, P, o, (rd) => padSvg(P, rd, sg, lab), (p) => { if (p.aim === "left" || p.aim === "right") { const n = p.aim === "right" ? 1 : -1; if (n !== sg) { sg = n; return true; } } return false; });
      g.readout = () => `Velcro pad 4 × 3 cm facing ${sg > 0 ? "+x" : "−x"} · hooks catch loops: the trolleys stick and move on together (inelastic, v = m₁u/(m₁+m₂))${s.where()}`;
      return g;
    },
  });
})();
