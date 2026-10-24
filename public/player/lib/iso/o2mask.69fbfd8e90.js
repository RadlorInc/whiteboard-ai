// "o2mask cx cy size k=mask|cannula flow=0-15 lab=1 lit=mask|strap|tubing|flowmeter|float|outlet" — oxygen therapy.
// A plain head form on its stand wears a simple face mask (or a nasal cannula) held by an elastic strap; the oxygen
// tubing runs to a flowmeter plugged into the wall oxygen outlet. Turning the green knob lifts the ball float in the
// clear tube: read the flow at the ball's middle against the 0–15 L/min scale. Gas moves along the tubing while it
// flows. Oxygen in each breath (approximate): mask 5–10 L/min gives about 35–60% (at least 5 L/min to clear the
// breath you let out); cannula 1–6 L/min gives about 21% + 4% per L/min. set({ flow }) turns the knob.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 cm. Head form at the origin on its stand; the wall behind at y = -18.
  const HZ = 16, FACE = [0.34, 0.94, 0], WALL = -16, FM = { x: 27, z0: 30, z1: 48, r: 1.5 }, FMY = WALL + 6;
  const HEAD = [[0, 4.5], [2, 6.8, 1], [5, 8.6, 1], [9, 9.4, 1], [14, 9.6, 1], [19, 9.0, 1], [23, 7.2, 1], [25.5, 4, 1], [26.4, 0]];
  const FORM = ISO.tint("#ece7df", ["#bdb4a8", "#cbc3b8", "#d8d1c7", "#e3ddd4"], "#5e554a");
  const MASK = ISO.tint("#e8f6ee", ["#a9d4bb", "#bcdcc9", "#cfe6d8", "#ddefe4"], "#2f6b4a");
  const WALLT = ISO.tint("#f1efe9", ["#cfcbc1", "#dad6cd", "#e4e1d9", "#ece9e2"], "#77736a");
  const STYLE = `<style>.ox-clear .iso-fill{fill-opacity:.35}.ox-clear .iso-shade{fill-opacity:.55}.ox-clear .iso-top{fill-opacity:.45}</style>`;
  const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const faceAt = (s, out = 0) => { const r = 9.4 + out; return [FACE[0] * r, FACE[1] * r, HZ + s]; };
  // tubing: clear green-tinted, with a flow line of dashes moved by stroke-dashoffset
  const tube = (P, pts) => { const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = 0.62 * G.scaleOf(P); return { d, svg: `<path d="${d}" fill="none" stroke="#3d7f5a" stroke-width="${(w + 1).toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#e6f5ec" stroke-width="${w.toFixed(2)}" stroke-linejoin="round"/>` }; };

  function roomSvg(P) {
    const out = [];
    out.push(ISO.tinted(WALLT, ISO.wbox(P, [-16, 44], [WALL - 2, WALL], [-3, 56], "mid")));
    out.push(ISO.tinted(ISO.T.wood, S(K.slabOf({ x: -16, y: WALL, w: 60, d: 36, r: 2 }, -3, 3, P, 4, 0.6), { tone: "lo" })));
    return out.join("");
  }
  // the wall outlet: a plate with its green oxygen ring and the socket
  function outletSvg(P) {
    const out = [];
    const O = yAx([FM.x, WALL, FM.z0 - 4]);
    out.push(ISO.tinted(WALLT, S(K.slabOf({ x: FM.x - 7, y: WALL, w: 14, d: 0.8, r: 0.6 }, FM.z0 - 13, 18, P, 3, 0.3), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.green, S(G.ringBand(0.8, 1.4, 2.6, 4, O, P), { tone: "hi" })), ISO.tinted(ISO.T.steel, S(G.disc(0.8, 1.6, 2.6, O, P), { tone: "hi" })));
    out.push(D([[-5.8, 6.6], [5.8, 6.6], [-5.8, -5.6], [5.8, -5.6]].map(([dx, dz]) => K.iso([FM.x + dx, WALL + 0.85, FM.z0 - 4 + dz], P)), { size: 0.6, tone: "mid" }));
    return out.join("");
  }
  function headSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -9, y: -9, w: 18, d: 18, r: 9 }, 0, 4, P)}"/>`];
    out.push(S(K.cylinder(0, 0, 8, 0, 2.4, P, 40, 0.5), { tone: "mid" }), S(K.cylinder(0, 0, 4.5, 2.4, HZ - 2.2, P, 28), { tone: "mid", crease: "none" }));
    out.push(ISO.tinted(FORM, S(G.lathe(HEAD, up(0, 0, HZ), P), { tone: "hi" })));
    return out.join("");
  }
  // The strap: a flat elastic round the head at the mask's height; only the side that faces you shows.
  const strapSvg = (P) => `<path d="${G.arcOf(up(0, 0, HZ + 11), 0, 9.75, P)}" fill="none" stroke="#5f6a73" stroke-width="2.4"/><path d="${G.arcOf(up(0, 0, HZ + 11), 0, 9.75, P)}" fill="none" stroke="#f4f6f7" stroke-width="1.4"/>`;
  function maskSvg(P) {
    const F = G.frameAlong(faceAt(10, -1.1), FACE), out = [];
    const prof = [[0, 0], [0, 5.6], [0.8, 5.5, 1], [2.2, 4.8, 1], [3.6, 3.4, 1], [4.6, 1.8, 1], [5, 1.2], [5, 0]];
    out.push(`<g class="ox-clear">${ISO.tinted(MASK, S(G.lathe(prof, F, P), { tone: "hi", inner: L(G.arcOf(F, 0.8, 5.5, P), { tone: "faint" }) }))}</g>`);
    out.push(D(G.dotsOf(F, 2.6, 4.45, 14, P, { slope: -0.75, fade: [0.04, 0.42] }), { size: 0.7, tone: "lo" }));
    // aluminium nose strip on the top of the rim
    out.push(`<path d="${G.arcOf(F, 0.5, 5.62, P, { from: Math.PI * 0.62, to: Math.PI * 1.02 })}" fill="none" stroke="#8d939a" stroke-width="2"/>`);
    // the swivel port at the front, pointing down-forward
    const port = G.frameAlong(G.pointOf(F, 4.6, 0, 0), FACE);
    out.push(ISO.tinted(MASK, S(G.disc(0, 2.4, 1.2, port, P), { tone: "hi" })), ISO.tinted(ISO.T.green, S(G.sphereOf(G.pointOf(port, 3.2, 0, 0), 1.1, P), { tone: "hi" })));
    return out.join("");
  }
  // Nasal cannula: two prongs under the middle of the face, tubes round both cheeks and down to the slider.
  function cannulaSvg(P) {
    const F = up(0, 0, HZ + 12), arc = G.arcOf(F, 0, 9.9, P);
    return `<path d="${arc}" fill="none" stroke="#3d7f5a" stroke-width="2.6"/><path d="${arc}" fill="none" stroke="#e6f5ec" stroke-width="1.6"/>` +
      ISO.tinted(ISO.T.green, S(G.disc(-1.4, 1.4, 0.9, G.frameAlong(faceAt(12, 0.4), [-FACE[1], FACE[0], 0]), P), { tone: "hi" }));
  }
  function flowmeterSvg(P) {
    const out = [], y = FMY, x = FM.x, steel = ISO.T.steel;
    // the probe into the outlet, the body block, the clear tube between two guard posts with its scale strip, the knob
    out.push(ISO.tinted(steel, S(G.disc(1.6, 4.6, 1.4, yAx([x, WALL, FM.z0 - 4]), P), { tone: "hi" })));
    out.push(ISO.tinted(steel, ISO.wbox(P, [x - 3, x + 3], [y - 2.4, y + 2.4], [FM.z0 - 8, FM.z0], "mid")));
    out.push(ISO.tinted(steel, ISO.wbox(P, [x - 3, x + 3], [y - 2.4, y + 2.4], [FM.z1, FM.z1 + 2.6], "mid")));
    out.push(ISO.tinted(WALLT, ISO.wbox(P, [x - 2.6, x + 2.6], [y - 2.4, y - 1.8], [FM.z0, FM.z1], "hi")));
    const minor = [], major = [], nums = [];
    for (let f = 0; f <= 15; f++) {
      const z = zOf(f), long = f % 5 === 0;
      (long ? major : minor).push(K.pathOf([K.iso([x + 2.6, y - 1.79, z], P), K.iso([x + (long ? 0.6 : 1.4), y - 1.79, z], P)]));
      if (f % 5 === 0) nums.push(K.faceTextSvg(ISO.faceMatrix(P, [x - 1.7, y - 1.78, z - 0.35], 1), String(f), { size: 1, tone: "mid", anchor: "middle" }));
    }
    out.push(`<path d="${minor.join("")}" stroke="#55575c" stroke-width="0.6" fill="none"/><path d="${major.join("")}" stroke="#1d1f22" stroke-width="1" fill="none"/><g style="--anatomy-mid:#1d1f22">${nums.join("")}</g>`);
    return out.join("");
  }
  const zOf = (f) => FM.z0 + 1.6 + (f / 15) * (FM.z1 - FM.z0 - 3.2);
  function flowmeterFrontSvg(P) {
    const x = FM.x, y = FMY, out = [];
    out.push(`<g class="ox-clear">${ISO.tinted(ISO.T.glass, S(G.disc(0, FM.z1 - FM.z0, FM.r, up(x, y, FM.z0), P), { tone: "hi" }))}</g>`);
    for (const dx of [-2.4, 2.4]) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x + dx, y + 1.4, 0.5, FM.z0, FM.z1 - FM.z0, P, 12), { tone: "mid", crease: "none" })));
    // knob on the front of the body, and the outlet nipple underneath
    const kf = yAx([x, y + 2.4, FM.z0 - 4]);
    out.push(ISO.tinted(ISO.T.green, S(G.disc(0, 3, 2.4, kf, P), { tone: "hi", inner: L(G.ribsOf(kf, 0, 3, 2.4, 16, P, { seams: true }), { tone: "lo" }) })));
    const nf = G.frameOf([x, y, FM.z0 - 8], [0, 0, -1], [1, 0, 0], [0, 1, 0]);
    out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 1.2], [1, 1.2], [1, 0.7], [1.6, 0.9], [2.2, 0.6], [2.8, 0.8], [3.4, 0.5]], nf, P), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "o2mask", title: "Oxygen mask and flowmeter", compare: "o2mask 480 280 300 k=mask",
    about: "A simple face mask (or nasal cannula) on a head form, its tubing to a wall flowmeter: turn the knob and the ball float rises to the flow in L/min.",
    line: "o2mask cx cy size k=mask|cannula flow=0-15 lab=1 lit=mask|strap|tubing|flowmeter|float|outlet",
    demo: { line: "o2mask 480 280 300 k=mask flow=0", script: [{ set: { flow: 6, lit: "float" }, hold: "settle" }, { set: { flow: 10, lit: "mask" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", mask = o.k !== "cannula", W = size * 2, H = size * 1.4;
      const pts = [[-16, WALL - 2, -3], [44, WALL - 2, 56], [-16, WALL + 36, -3], [44, WALL + 36, -3], [-16, WALL, 56], [0, 12, 42]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 58, elevation: 22 }, parent);
      const start = mask ? G.pointOf(G.frameAlong(G.pointOf(G.frameAlong(faceAt(10, -1.1), FACE), 4.6, 0, 0), FACE), 3.2, 0, 0) : faceAt(6, 2.4);
      const route = G.fillet([start, [start[0] + 1.5, start[1] + 4, 3.6], [FM.x - 10, start[1] + 2, 3.6], [FM.x, FMY + 6, 3.6], [FM.x, FMY, 12], [FM.x, FMY, FM.z0 - 11.4]], 5, 9);
      const tb = tube(P, route);
      g.innerHTML = STYLE + `<g>${roomSvg(P)}</g><g data-name="outlet">${outletSvg(P)}</g><g data-name="flowmeter">${flowmeterSvg(P)}</g><g data-name="float"><g data-part="ball"></g></g><g data-name="flowmeter-front">${flowmeterFrontSvg(P)}</g>` +
        `<g>${headSvg(P)}</g><g data-name="strap">${mask ? strapSvg(P) : ""}</g><g data-name="tubing">${tb.svg}<path data-part="gas" d="${tb.d}" fill="none" stroke="#2f9e5b" stroke-width="0.9" stroke-dasharray="2 5" stroke-linecap="round"/></g>` +
        `<g data-name="mask">${mask ? maskSvg(P) : cannulaSvg(P)}</g><g data-part="words"></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")], gas = q("gas");
      const s = { flow: ISO.clamp(ISO.num(o, "flow", mask ? 8 : 2), 0, 15), f: 0, off: 0, lit: o.lit || "" };
      s.f = s.flow;
      if (lab) {
        const word = (p, txt, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 14, dy }); };
        q("words").innerHTML = word(faceAt(4, 6), mask ? "Face mask" : "Nasal cannula", "end", 10, -8) + (mask ? word([-9.8, 0, HZ + 11], "Elastic strap", "end", 4, -6) : "") +
          word([FM.x + 3, FMY, FM.z1 + 2], "Flowmeter", "start", -4, 6) + word([FM.x + 6, WALL, FM.z0 - 6], "Wall oxygen outlet", "start", 4, 4) + word([FM.x - 8, 12, 0], "Oxygen tubing", "middle", 20);
      }
      const draw = () => {
        // the ball, read at its middle; built once per position
        w.rebuild(q("ball"), s.f.toFixed(2), () => ISO.tinted(ISO.T.plastic, S(G.sphereOf([FM.x, FMY, zOf(s.f)], FM.r - 0.3, P), { tone: "hi" })));
        w.attr(gas, "stroke-dashoffset", (-s.off).toFixed(1));
        w.attr(gas, "opacity", ISO.clamp(s.f / 2, 0, 1).toFixed(2));
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name.startsWith(s.lit)));
      };
      g.set = (p) => { if (p.flow !== undefined) s.flow = ISO.clamp(+p.flow, 0, 15); if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        s.f = ISO.follow(s.f, s.flow, dt, 0.5, ISO.still());
        s.off += dt * s.f * 3;
        draw();
        return Math.abs(s.f - s.flow) > 0.01;
      };
      g.readout = () => {
        const f = Math.round(s.f * 2) / 2;
        if (f < 0.5) return "knob shut · no oxygen flowing";
        if (mask) return f < 5 ? `${f} L/min · too low for a mask: below 5 L/min the breath you let out builds up in it` : `${f} L/min through a simple face mask · about ${Math.round(Math.min(60, 35 + (f - 5) * 5))}% oxygen in each breath (air is 21%)`;
        return f > 6 ? `${f} L/min · too high for a cannula (1–6 L/min); it dries the nose` : `${f} L/min through a nasal cannula · about ${Math.round(21 + 4 * f)}% oxygen in each breath (air is 21%)`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
