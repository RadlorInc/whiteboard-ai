// "steelblock cx cy k n=1..3 tilt=-40..40 x=0..200 v=0|1 lab=0 lit=block|stamp" — a PART (PARTS.md, batch 5): the
// 1 kg steel mass blocks stacked on a dynamics trolley (collision.js: each extra kilogram is a block on top). A
// 10 × 5 × 2.5 cm bright mild-steel bar (125 cm³ × 7.85 g/cm³ = 0.98 kg), its long edges chamfered, "1 kg" stamped on
// the near side, a tapped M8 hole and grinding marks on the top; n of them stacked. Its origin is
// the middle of the bottom block's underside, on the surface it stands on (a trolley's top). It rides on the trolley:
// give it the trolley's tilt, x and v and it moves with it (labtrolley's road). set({ n }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G;
  const HL = 5, HW = 2.5, H = 2.5, C = 0.18;
  const MILD = ISO.tint("#dcdee1", ["#8a8e94", "#9fa3a9", "#b3b6bb", "#c5c8cc"], "#34373c");

  function stackSvg(P, rd, n, lab) {
    const at = rd.at, out = [];
    const sec = [[-HW, C], [-HW + C, 0], [HW - C, 0], [HW, C], [HW, H - C], [HW - C, H], [-HW + C, H], [-HW, H - C]], m = sec.length;
    for (let i = 0; i < n; i++) {
      const z = i * H, V = [...sec.map(([y, w]) => at(-HL, z + w, y)), ...sec.map(([y, w]) => at(HL, z + w, y))];
      const F = [[...Array(m).keys()], [...Array(m).keys()].map((j) => j + m), ...sec.map((_, j) => [j, (j + 1) % m, ((j + 1) % m) + m, j + m])];
      out.push(`<g data-name="block">${ISO.tinted(MILD, ISO.poly(V, F, P, "mid"))}`);
      // the tapped hole in the top: a dark bore with a bright chamfer ring
      const ring = (r, w) => { const q = []; for (let j = 0; j < 20; j++) { const a = (j / 20) * Math.PI * 2; q.push(K.iso(at(Math.cos(a) * r, w, Math.sin(a) * r), P)); } return K.pathOf(q, true); };
      out.push(`<path d="${ring(0.55, z + H + 0.005)}" fill="#eef0f2" stroke="#6c7076" stroke-width="0.5"/><path d="${ring(0.4, z + H + 0.01)}" fill="#2b2d31"/>`);
      // grinding marks along the top, from chamfer to chamfer
      out.push(`<path d="${[-1.4, -0.6, 0.9, 1.7].map((y) => K.pathOf([K.iso(at(-HL + 0.05, z + H + 0.004, y), P), K.iso(at(HL - 0.05, z + H + 0.004, y), P)])).join("")}" stroke="#c3c6ca" stroke-width="0.5" data-free=""/>`);
      out.push("</g>");
      out.push(`<g data-name="stamp">${LAB.faceText(P, at(-1.6, z + H * 0.32, HW + 0.01), rd.d, "1 kg", 1.05, "#3a3d42", rd.n)}` +
        `${LAB.faceText(P, at(2.9, z + H * 0.36, HW + 0.01), rd.d, "STEEL", 0.5, "#5a5e64", rd.n)}</g>`);
    }
    if (lab) out.push(CIRC.word(P, at(HL, n * H + 0.8, 0), `${n} × 1 kg steel`));
    return { svg: out.join(""), anchors: { top: at(0, n * H, 0).map((v) => +v.toFixed(3)) } };
  }

  ISO.add({
    name: "steelblock", title: "Steel mass block (part)", compare: null,
    about: "1 kg steel mass blocks (10 × 5 × 2.5 cm, chamfered, stamped 1 kg) stacked n high on a dynamics trolley to change its mass; rides with the trolley (same tilt, x, v). anchors: top",
    line: "steelblock cx cy k n=1..3 tilt=-40..40 x=0..200 v=0|1 lab=0 lit=block|stamp",
    demo: { line: "steelblock 480 330 34 n=1", script: [{ set: {}, hold: 1 }, { set: { lit: "stamp" }, hold: 1.2 }, { set: { n: 3, lit: "block" }, hold: 1.2 }, { set: { x: 4, lit: "" }, hold: "settle" }, { set: { tilt: 15, v: 1, x: 8, n: 2 }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      let n = ISO.clamp(Math.round(ISO.num(o, "n", 1)), 1, 3);
      const s = B10.ride(g, P, o, (rd) => stackSvg(P, rd, n, lab), (p) => {
        if (p.n !== undefined && Number.isFinite(+p.n)) { const m = ISO.clamp(Math.round(+p.n), 1, 3); if (m !== n) { n = m; return true; } }
        return false;
      });
      g.readout = () => `${n} steel block${n > 1 ? "s" : ""} · ${n} kg (each 10 × 5 × 2.5 cm = 125 cm³ × 7.85 g/cm³ = 0.98 kg) · adds ${n} kg to the trolley's mass${s.where()}`;
      return g;
    },
  });
})();
