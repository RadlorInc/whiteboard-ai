// "wellring cx cy k lab=0 lit=stones|coping|inside" — a PART (PARTS.md, batch 5): wheelaxle.js's stone well ring,
// at real size: 60 cm across and 40 cm of stone above the ground, four courses of dressed stones laid in a running
// bond (each joint over the middle of a stone below), mortar lines between, and a 6 cm coping of ten flat slabs on top
// that overhangs a little. Through the 45 cm opening you see the far inside wall going down into the dark (the water
// is far below, out of sight). Origin: the ground point under its middle. anchors: rim (the middle of the opening,
// level with the coping's top: where a rope or a bucket goes down). Static. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const RO = 30, RC = 31.5, RI = 22.5, H = 40, CH = 6, COURSE = 10, PER = 10, SLABS = 10;
  const ZF = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const STONE = ISO.tint("#d6d2c8", ["#9e998d", "#aca79b", "#bab5a9", "#c7c2b6"], "#5c584e");
  const COPE = ISO.tint("#e4e0d6", ["#aeaa9f", "#bcb8ad", "#c9c5ba", "#d6d2c7"], "#5c584e");
  let uid = 0;
  const jit = (i) => (Math.sin(i * 12.9898) * 43758.5453) % 1;          // a fixed small jitter per stone
  function facing(P) { const d0 = K.depthOf([0, 0, 0], P); return Math.atan2(K.depthOf([0, 1, 0], P) - d0, K.depthOf([1, 0, 0], P) - d0); }
  const on = (r, a, z) => [Math.cos(a) * r, Math.sin(a) * r, z];
  const arc = (P, r, z, a0, a1, n = 40) => Array.from({ length: n + 1 }, (_, i) => K.iso(on(r, a0 + ((a1 - a0) * i) / n, z), P));

  // where a joint going up the wall at angle a meets the coping's lower front edge on screen (it overhangs)
  function underCoping(P, a) {
    const X = K.iso(on(RO, a, H), P)[0];
    let lo = a - 0.4, hi = a + 0.4;
    const sx = (b) => K.iso(on(RC, b, H), P)[0], up = sx(hi) > sx(lo);
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if ((sx(m) < X) === up) lo = m; else hi = m; }
    return K.iso(on(RC, (lo + hi) / 2, H), P);
  }
  // the stone wall: one cylinder, the mortar lines between courses, the joints of the stones that face us, and a light
  // or dark wash on alternate stones so each reads as its own block
  function wallSvg(P) {
    const f = facing(P), lines = [], wash = [];
    for (let c = 1; c < H / COURSE; c++) lines.push(K.sideArc(0, 0, RO, c * COURSE, P, 48));
    for (let c = 0; c < H / COURSE; c++) {
      const z0 = c * COURSE, z1 = z0 + COURSE, off = (c % 2) * (Math.PI / PER);
      const cut = Array.from({ length: PER + 1 }, (_, i) => off + ((i + (i % PER ? jit(c * 31 + i) * 0.3 - 0.15 : 0)) * 2 * Math.PI) / PER);
      for (let i = 0; i < PER; i++) {
        const a = cut[i], b = cut[i + 1];
        if (Math.cos(a - f) > 0.08) lines.push(K.pathOf([K.iso(on(RO, a, z0), P), (z1 === H ? underCoping(P, a) : K.iso(on(RO, a, z1), P))]));
        if (Math.cos(a - f) > 0.12 && Math.cos(b - f) > 0.12) {
          const tone = (i + c) % 3 === 0 ? "#ffffff" : (i + c) % 3 === 1 ? "#5c584e" : "";
          if (tone) wash.push(`<path d="${K.pathOf([...arc(P, RO, z0 + 0.6, a + 0.02, b - 0.02, 8), ...arc(P, RO, z1 - 0.6, b - 0.02, a + 0.02, 8)], true)}" fill="${tone}" fill-opacity="${tone === "#ffffff" ? 0.22 : 0.08}"/>`);
        }
      }
    }
    return ISO.tinted(STONE, S(K.cylinder(0, 0, RO, 0, H, P, 64), { tone: "mid", crease: "none", inner: wash.join("") + L(lines.join(""), { tone: "lo" }) }));
  }
  // the coping: an overhanging ring of ten slabs, their joints across the top and down the outer edge
  function copingSvg(P) {
    const f = facing(P), top = [], side = [];
    for (let i = 0; i < SLABS; i++) {
      const a = 0.2 + (i * 2 * Math.PI) / SLABS;
      top.push(K.pathOf([K.iso(on(RI, a, H + CH), P), K.iso(on(RC, a, H + CH), P)]));
      if (Math.cos(a - f) > 0.08) side.push(K.pathOf([K.iso(on(RC, a, H), P), K.iso(on(RC, a, H + CH), P)]));
    }
    return ISO.tinted(COPE, S(G.ringBand(H, H + CH, RI, RC, ZF, P), { tone: "hi", inner: L(side.join("") + top.join(""), { tone: "lo" }) }));
  }
  // the opening: dark, with the far inside wall lit near the top and fading into the dark, its mortar lines
  function insideSvg(P, id) {
    const f = facing(P), a0 = f + Math.PI / 2, a1 = f + 1.5 * Math.PI, zt = H + CH;
    const band = (z0, z1) => K.pathOf([...arc(P, RI, z0, a0, a1), ...arc(P, RI, z1, a1, a0)], true);
    const mortar = [H - 4].map((z) => K.pathOf(arc(P, RI, z, a0 + 0.05, a1 - 0.05))).join("");
    return `<clipPath id="${id}"><path d="${K.ring(0, 0, RI, zt, P, 48)}"/></clipPath><g clip-path="url(#${id})">` +
      `<path d="${K.ring(0, 0, RI, zt, P, 48)}" fill="#2b2d2f"/>` +
      `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6a296"/><stop offset=".3" stop-color="#7d796f"/><stop offset=".7" stop-color="#3a3b3c"/><stop offset="1" stop-color="#2b2d2f"/></linearGradient><path d="${band(zt, H - 16)}" fill="url(#${id}g)"/>` +
      ISO.tinted(STONE, L(mortar, { tone: "faint", free: true })) + `</g>` + L(K.ring(0, 0, RI, zt, P, 48), { tone: "lo" });
  }

  ISO.add({
    name: "wellring", title: "Stone well ring (part)", compare: null,
    about: "A stone well ring 60 cm across and 46 cm high: four courses of stones in a running bond, a coping of ten slabs, the dark opening with the inside wall going down. anchors: rim",
    line: "wellring cx cy k lab=0 lit=stones|coping|inside",
    demo: { line: "wellring 480 400 6", script: [{ set: {}, hold: 1 }, { set: { lit: "stones" }, hold: 1.2 }, { set: { lit: "coping" }, hold: 1.2 }, { set: { lit: "inside" }, hold: 1.2 }, { set: { lit: "" }, hold: 0.6 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const halo = { x: -RC - 1, y: -RC - 1, w: 2 * RC + 2, d: 2 * RC + 2, r: RC + 1 };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, 0, 0.1, P)}"/><g data-name="stones">${wallSvg(P)}</g><g data-name="coping">${copingSvg(P)}</g>` +
        `<g data-name="inside">${insideSvg(P, `wellring-in${++uid}`)}</g>` + (lab ? CIRC.word(P, [RC, 0, H / 2], "stone well") : "");
      g.anchors = { rim: [0, 0, H + CH] };
      const w = ISO.writer();
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B30.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "stone well ring · 60 cm across, 46 cm high with its coping · a 45 cm opening down to the water";
      B30.light(w, g, lit);
      return g;
    },
  });
})();
