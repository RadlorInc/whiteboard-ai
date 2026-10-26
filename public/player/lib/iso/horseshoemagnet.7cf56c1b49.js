// "horseshoemagnet cx cy k deg=0..360 lab=0 lit=magnet|north|south" — a PART (PARTS.md, batch 5): a steel horseshoe
// (U) magnet 8 × 6 × 1 cm lying on the bench or a field card, its origin the surface point under its middle. A polished
// steel U, its two arm tips painted red (north, the −y arm at deg 0) and blue (south), N and S stamped on the tips, a
// paint seam at each tip. deg turns it on the card about its middle (0 = the arms point +x, 90 = +y); set({ deg })
// eases it round. Anchors n and s (the middle of each tip's end face) are where it was built. Shape from magnet.js
// (scaled 1:10). World units: 1 = 1 cm.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const RED = ISO.tint("#f9dcd7", ["#e07a6c", "#e88e82", "#efa398", "#f4b8ae"], "#8a1d16"), BLUE = ISO.tint("#dde8f6", ["#7d9fcf", "#91afd8", "#a6bfe0", "#bacde8"], "#1f4f8f");
  const RO = 3, RI = 1.2, CX = -0.9, TIP = 3.9, PAINT = 1.2, H = 1;
  const arc = (r, a0, a1) => Array.from({ length: 25 }, (_, i) => { const t = a0 + ((a1 - a0) * i) / 24; return [CX + Math.cos(t) * r, Math.sin(t) * r]; });

  function magnetSvg(P, a, lab) {
    const c = Math.cos(a), s = Math.sin(a), rot = ([x, y]) => [x * c - y * s, x * s + y * c];
    const xs = TIP - PAINT;
    const body = [...arc(RO, Math.PI / 2, 1.5 * Math.PI), [xs, -RO], [xs, -RI], ...arc(RI, 1.5 * Math.PI, Math.PI / 2), [xs, RI], [xs, RO]].map(rot);
    const tip = (y0, y1) => [[xs, y0], [TIP, y0], [TIP, y1], [xs, y1]].map(rot);
    const tips = [{ name: "north", tint: RED, y: [-RO, -RI], ch: "N", ink: "#7a1a12" }, { name: "south", tint: BLUE, y: [RI, RO], ch: "S", ink: "#173f78" }]
      .map((t) => ({ ...t, k: K.depthOf([...rot([TIP - PAINT / 2, (t.y[0] + t.y[1]) / 2]), 0], P) }));
    const tipSvg = (t) => { const mid = rot([TIP - PAINT / 2, (t.y[0] + t.y[1]) / 2]);
      return `<g data-name="${t.name}">${ISO.tinted(t.tint, S(K.extrude(tip(t.y[0], t.y[1]), 0, H, P), { tone: "mid" }) + LAB.faceText(P, [mid[0] - s * 0.32, mid[1] + c * 0.32, H + 0.005], [c, s, 0], t.ch, 0.95, t.ink, [s, -c, 0]))}</g>`; };
    const bodySvg = `<g data-name="magnet">${ISO.tinted(ISO.T.steel, S(K.extrude(body, 0, H, P, { convex: false }), { tone: "mid" }))}</g>`;
    // the U's bend is far from the tips: draw what is further from the camera first (the tips beyond the bend, or not)
    const bendK = K.depthOf([...rot([CX - RO, 0]), 0], P), sorted = tips.sort((p, q) => p.k - q.k);
    const before = sorted.filter((t) => t.k < bendK).map(tipSvg).join(""), after = sorted.filter((t) => t.k >= bendK).map(tipSvg).join("");
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: CX - RO, y: -RO, w: TIP - CX + RO, d: 2 * RO, r: RO }, 0, H, P)}"/>`, before, bodySvg, after];
    if (lab) { const n = rot([TIP, -2.1]), sx = rot([TIP, 2.1]); out.push(CIRC.word(P, [n[0], n[1], H], "N"), CIRC.word(P, [sx[0], sx[1], H], "S")); }
    const fix = (p) => [...p.map((v) => +v.toFixed(3)), H / 2];
    return { svg: out.join(""), anchors: { n: fix(rot([TIP, -(RO + RI) / 2])), s: fix(rot([TIP, (RO + RI) / 2])) } };
  }

  ISO.add({
    name: "horseshoemagnet", title: "Horseshoe magnet (part)", compare: null,
    about: "A steel horseshoe magnet 8 × 6 × 1 cm with a red N arm tip and a blue S arm tip, lying on the bench or a card; deg turns it about its middle. anchors: n s",
    line: "horseshoemagnet cx cy k deg=0..360 lab=0 lit=magnet|north|south",
    demo: { line: "horseshoemagnet 480 300 44 deg=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { deg: 90, lit: "north" }, hold: "settle" }, { set: { deg: 200, lit: "south" }, hold: "settle" }, { set: { deg: 0, lit: "magnet" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const rad = (d) => (d * Math.PI) / 180, st = { a: rad(ISO.num(o, "deg", 0) % 360) }, want = { a: st.a };
      let lit = o.lit || "";
      const w = ISO.writer();
      g.innerHTML = `<g data-part="magnet"></g>`;
      const el = g.firstChild;
      g.anchors = magnetSvg(P, st.a, false).anchors;
      const draw = () => { const a = Math.round(st.a * 200) / 200; w.rebuild(el, String(a), () => magnetSvg(P, a, lab).svg); window.B19.light(w, g, lit); };
      g.set = (p) => {
        if (p.deg !== undefined && Number.isFinite(+p.deg)) { let to = rad(+p.deg); to += Math.round((st.a - to) / (2 * Math.PI)) * 2 * Math.PI; want.a = to; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => { st.a = ISO.follow(st.a, want.a, dt, 0.5, ISO.still()); draw(); return st.a !== want.a; };
      g.readout = () => `horseshoe magnet turned ${Math.round((((st.a * 180) / Math.PI) % 360 + 360) % 360)}° · the field is strongest in the gap between N and S`;
      draw();
      return g;
    },
  });
})();
