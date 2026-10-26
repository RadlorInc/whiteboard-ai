// "watertray cx cy k w=30..100 water=0..1 lab=0 lit=tray|water" — a PART (PARTS.md, batch 24): a long shallow plastic
// tray, w (60) × 20 × 4 cm, lying along x on the floor or bench to catch water jets, origin the surface point under its
// middle. A 0.4 cm floor on two runners, walls with a rolled lip round the top, a moulded drain spout at the +x end,
// and water standing water × 3.6 cm deep (a flat surface with a highlight). Reused from pressure.js (the tray).
// Static. World units: 1 = 1 cm. anchors: inside rim.
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const D = 20, H = 4, T = 0.4, F = 0.6;
  const GREY = ISO.tint("#e8edf1", ["#a9b4bd", "#b9c3cb", "#c9d2d9", "#d8dfe5"], "#45525e");

  ISO.add({
    name: "watertray", title: "Water tray (part)", compare: null,
    about: "A long shallow plastic tray (60 × 20 × 4 cm) with a rolled lip and a drain spout, lying along x, holding a little water; catches the jets from a spouting can. anchors: inside rim",
    line: "watertray cx cy k w=30..100 water=0..1 lab=0 lit=tray|water",
    demo: { line: "watertray 480 300 9 w=60 water=0.3", script: [{ set: {}, hold: 1 }, { set: { lit: "water" }, hold: 1.2 }, { set: { lit: "tray" }, hold: 1.2 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const HL = ISO.clamp(ISO.num(o, "w", 60), 30, 100) / 2, HD = D / 2, wl = ISO.clamp(ISO.num(o, "water", 0.3), 0, 1);
      const B = (x, y, z, tone = "mid") => ISO.tinted(GREY, ISO.wbox(P, x, y, z, tone)), zf = F + T, zw = zf + wl * (H - T - 0.4);
      const lip = (x, y) => B(x, y, [F + H - 0.35, F + H], "hi");
      const back = B([-HL, HL], [-HD, -HD + T], [F, F + H]) + lip([-HL - 0.3, HL + 0.3], [-HD - 0.3, -HD + T]) + B([-HL, -HL + T], [-HD, HD], [F, F + H]) + lip([-HL - 0.3, -HL + T], [-HD - 0.3, HD + 0.3]);
      const pool = [[-HL + T, -HD + T], [HL - T, -HD + T], [HL - T, HD - T], [-HL + T, HD - T]];
      const water = wl > 0.01 ? `<path d="${K.pathOf(pool.map(([x, y]) => K.iso([x, y, zw], P)), true)}" fill="#bcdcf5" fill-opacity=".85" stroke="#4f8fc6" stroke-width="0.6"/>` +
        `<path d="${K.pathOf([K.iso([-HL * 0.5, -HD * 0.3, zw], P), K.iso([HL * 0.2, -HD * 0.3, zw], P)])}" stroke="#ffffff" stroke-width="${(K.screenRise(1, P) * 0.5 + 1).toFixed(2)}" stroke-linecap="round" opacity=".8"/>` : "";
      const spout = B([HL, HL + 1.6], [-1.2, 1.2], [F + H - 1.2, F + H - 0.35]) + B([HL + 1.2, HL + 1.6], [-1.2, 1.2], [F + H - 1.6, F + H - 0.35]);
      const front = B([HL - T, HL], [-HD, HD], [F, F + H]) + B([-HL, HL], [HD - T, HD], [F, F + H]) + lip([HL - T, HL + 0.3], [-HD - 0.3, HD + 0.3]) + lip([-HL - 0.3, HL + 0.3], [HD - T, HD + 0.3]) + spout;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HL, y: -HD, w: 2 * HL, d: D, r: 0.8 }, 0, 0.02, P)}"/>` +
        `<g data-name="tray">${[-HD + 2, HD - 3].map((y) => B([-HL + 1, HL - 1], [y, y + 1], [0, F], "lo")).join("")}${ISO.tinted(GREY, S(K.slabOf({ x: -HL, y: -HD, w: 2 * HL, d: D, r: 0.3 }, F, T, P, 3), { tone: "mid" }))}${back}</g>` +
        `<g data-name="water">${water}</g><g data-name="tray">${front}${L(K.pathOf([K.iso([-HL + 1, HD + 0.01, F + 1.2], P), K.iso([HL - 1, HD + 0.01, F + 1.2], P)]), { tone: "faint", free: true })}</g>` +
        (lab ? window.CIRC.word(P, [HL, HD, F + H], "tray") : "");
      g.anchors = { inside: [0, 0, zf], rim: [0, HD, F + H] };
      let lit = o.lit || "";
      const light = window.CIRC.lighter(g);
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; light(lit); } };
      g.update = () => false;
      g.readout = () => `plastic tray ${HL * 2} × ${D} × ${H} cm · ${((zw - zf) * 10).toFixed(0)} mm of water in it`;
      light(lit);
      return g;
    },
  });
})();
