// "protractorplate cx cy k lab=0 lit=plate|scale|pivot" — a PART (PARTS.md, batch 5): the protractor behind the
// pendulum's pivot in pendulum.js, real size: a clear 2 mm acrylic half disc, 15 cm across, its straight edge on top,
// standing in the x–z plane (the swing plane) with its printed face toward +y. Ticks every 5° round the edge (longer
// every 10°), numbers every 10° from 0 at the bottom (straight down) to 90 at each side, a zero line, a brass pivot
// boss at the centre and two fixing holes in the top strip. The origin is the centre of the scale on its printed face
// (place it at a pendulumclamp's `pivot` with ay=-1, so the thread swings just in front of it). Static.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 7.5, T = 0.2, TOP = 0.7, RT = 7.2, INK = "#2b4d6e";
  const ACRYLIC = ["#b9d3e3", "#eef6fb"];

  function plateSvg(P) {
    const out = [], rad = (d) => (d * Math.PI) / 180, on = (r, d) => [Math.sin(rad(d)) * r, 0.01, -Math.cos(rad(d)) * r];
    const outline = [[R, TOP], [-R, TOP], ...ISO.arc(0, 0, R, Math.PI, 2 * Math.PI, 48)];
    out.push(`<g data-name="plate">${ISO.prismY(P, outline, -T, 0, ACRYLIC, "#f3f9fc", "#5d7f96")}`);
    // the two fixing holes in the top strip
    for (const x of [-R + 0.8, R - 0.8]) {
      const h = []; for (let i = 0; i < 16; i++) { const q = (i / 16) * Math.PI * 2; h.push(K.iso([x + Math.cos(q) * 0.18, 0.01, TOP / 2 + Math.sin(q) * 0.18], P)); }
      out.push(`<path d="${K.pathOf(h, true)}" fill="#fdfdfb" stroke="#5d7f96" stroke-width="0.6"/>`);
    }
    out.push(`</g>`);
    // the printed scale: the edge line, ticks hanging in from it, the numbers, the zero line and a centre line
    const arc = []; for (let d = -90; d <= 90; d += 2) arc.push(K.iso(on(RT, d), P));
    const minor = [], major = [];
    for (let d = -90; d <= 90; d += 5) (d % 10 ? minor : major).push(K.pathOf([K.iso(on(RT, d), P), K.iso(on(RT - (d % 10 ? 0.45 : 0.8), d), P)]));
    let scale = K.lineSvg(K.pathOf(arc), { tone: "lo" }) + K.lineSvg(minor.join(""), { tone: "lo", free: "end" }) + K.lineSvg(major.join(""), { tone: "mid", free: "end" });
    scale += K.lineSvg(K.pathOf([K.iso(on(0.45, 0), P), K.iso(on(RT - 0.8, 0), P)]), { tone: "lo", free: true });
    scale += K.lineSvg(K.pathOf([K.iso([-RT, 0.01, 0], P), K.iso([-0.45, 0.01, 0], P)]) + K.pathOf([K.iso([0.45, 0.01, 0], P), K.iso([RT, 0.01, 0], P)]), { tone: "lo", free: true });
    for (let d = -80; d <= 80; d += 10) scale += LAB.faceText(P, on(RT - 1.35, d).map((v, i) => v + (i === 2 ? -0.18 : 0)), [1, 0, 0], String(Math.abs(d)), 0.5, INK);
    scale += LAB.faceText(P, [0, 0.01, -RT + 2.3], [1, 0, 0], "degrees", 0.42, INK);
    out.push(`<g data-name="scale">${scale}</g>`);
    // the brass pivot boss at the centre, standing out of the face toward +y
    const Fb = G.frameOf([0, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    out.push(`<g data-name="pivot">${ISO.tinted(ISO.T.brass, S(G.ringBand(0, 0.25, 0.12, 0.35, Fb, P), { tone: "hi" }))}${ISO.tinted(ISO.T.rubber, S(G.disc(0.24, 0.25, 0.12, Fb, P), { tone: "lo", flat: true }))}</g>`);
    return out.join("");
  }

  ISO.add({
    name: "protractorplate", title: "Protractor plate (part)", compare: null,
    about: "A clear half-disc protractor 15 cm across, standing behind a pendulum's pivot in the swing plane, 0° straight down and 90° at each side, ticks every 5°; it reads the angle the pendulum is let go from. anchors: centre",
    line: "protractorplate cx cy k lab=0 lit=plate|scale|pivot",
    demo: { line: "protractorplate 480 200 36", script: [{ set: {}, hold: 1 }, { set: { lit: "scale" }, hold: 1.2 }, { set: { lit: "plate" }, hold: 1.2 }, { set: { lit: "pivot" }, hold: 1.2 }] },
    make([cx = 480, cy = 200, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer();
      let lit = o.lit || "";
      g.innerHTML = plateSvg(P) + LAB.word(P, lab, [R + 0.4, 0, TOP], "protractor", "#445", { anchor: "start" });
      g.anchors = { centre: [0, 0.25, 0] };
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; B21.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => "protractor 15 cm · 0° straight down, 90° at each side, ticks every 5° · keep a pendulum's swing under about 15° so its period stays the same";
      B21.light(w, g, lit);
      return g;
    },
  });
})();
