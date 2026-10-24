// "irrigation cx cy width gate=0..1 lab=1" — furrow irrigation as a museum model of a field corner.
// The walnut plinth carries a block of farmland cut open along its front, so the ridges and furrows show in section
// over the topsoil and subsoil. A river runs down the left; a sluice gate in a concrete headwall (screw spindle and
// handwheel on a frame) lets water into the field canal along the back; a siphon tube over the bank feeds each
// furrow, and water runs down the furrows between the crop ridges, darkening the soil as it soaks in. Open the gate
// (gate=1): the canal fills, then the furrows wet one after another, nearest first. The readout gives the flow through
// the gate, Q = Cd b a √(2 g Δh), and how far the water has run. World units: 0.1 m (furrows 1.6 m apart).
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S;
  const Y0 = -72, CUT = 0, BANK = -56, X0 = -100, X1 = 68, PER = 16, NF = 10;
  const PLINTH = { x: -138, y: -80, w: 214, d: 102, r: 4 };
  const FC = Array.from({ length: NF }, (_, i) => X0 + 12 + i * PER);          // furrow centres
  // the ridge-and-furrow profile across x: ridge tops 0.8 m wide at z 0, furrow beds 0.4 m wide 0.3 m down
  const PROFILE = (() => {
    const pts = [[X0, 0]];
    for (const c of FC) pts.push([c - 4, 0], [c - 2, -3], [c + 2, -3], [c + 4, 0]);
    pts.push([X1, 0]);
    return pts;
  })();
  const face = (P, pts, fill, ink, w = 0.7, y = CUT + 0.08) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const [cdk, clt, cfc, cin] = M.MAT.topsoil;

  function groundSvg(P) {
    const out = [`<g transform="${K.translateAlong(P, [0, 0, -16])}">${M.plinth(P, PLINTH)}</g>`];   // the plinth's top meets the block's floor
    // the river zone on the left: banks, bed, all along y
    out.push(M.sec(P, [[-130, -16], [X0, -16], [X0, 0], [-104, 0], [-110, -8], [-124, -8], [-128, 0], [-130, 0]], Y0, CUT, "soil", M.grains(P, [[-130, -16], [X0, -16], [X0, -9], [-130, -9]], CUT, 18, "#8a6a45", 0.6, 2)));
    // the canal along the back: its banks and bed as one prism along x, cut end showing at the field's right edge
    out.push(ISO.prismX(P, [[Y0, -16], [BANK, -16], [BANK, 0], [-58, 0], [-60, -4], [-64, -4], [-66, 0], [Y0, 0]], X0, X1, [cdk, clt], cfc, cin));
    // the field: subsoil, then topsoil with the ridges and furrows
    out.push(M.sec(P, [[X0, -16], [X1, -16], [X1, -8], [X0, -8]], BANK, CUT, "clay", M.grains(P, [[X0, -16], [X1, -16], [X1, -8.5], [X0, -8.5]], CUT, 40, "#a8714a", 0.5, 5)));
    out.push(M.sec(P, [[X0, -8], [X1, -8], ...PROFILE.slice().reverse()], BANK, CUT, "topsoil", M.grains(P, [[X0, -8], [X1, -8], [X1, -3.5], [X0, -3.5]], CUT, 40, "#5a4028", 0.4, 7)));
    return out.join("");
  }
  // the headwall and sluice gate at the canal's mouth; the gate plate rises with g
  function headwallSvg(P) {
    const C = ISO.tinted(M.tintOf("concrete"), ISO.wbox(P, [-103, -100], [-70, -63.2], [-4, 1.5], "mid") + ISO.wbox(P, [-103, -100], [-60.8, BANK - 1], [-4, 1.5], "mid"));
    const frame = ISO.tinted(ISO.T.steel, ISO.wbox(P, [-102, -101], [-64.6, -63.6], [1.5, 9], "mid") + ISO.wbox(P, [-102, -101], [-60.4, -59.4], [1.5, 9], "mid") + ISO.wbox(P, [-102, -101], [-64.6, -59.4], [9, 10], "mid"));
    return C + frame;
  }
  const GATE = new Map();
  function gateSvg(P, gt) {
    const lift = gt * 3.5;
    return M.named("gate", ISO.tinted(ISO.T.paint, ISO.wbox(P, [-101.9, -101.1], [-63.2, -60.8], [-4 + lift, 1.5 + lift], "hi")) +
      ISO.tinted(ISO.T.steel, S(K.cylinder(-101.5, -62, 0.35, 1.5 + lift, 10.6 - lift, P, 10), { tone: "hi" })) +
      ISO.tinted(ISO.T.red, S(G.lathe([[0, 0], [0, 2.4], [0.5, 2.4], [0.5, 0]], M.Z([-101.5, -62, 10.6]), P, { steps: 24 }), { tone: "mid", inner: `<path d="${G.spokesOf(M.Z([-101.5, -62, 11.12]), 0, 0.4, 2.3, 4, P, { phase: gt * 6 })}" fill="none" stroke="#8f2a22" stroke-width=".7"/>` })));
  }
  // siphon tubes: one arc per furrow from the canal water over the bank into the furrow's head
  function siphonSvg(P) {
    const k = K.cameraOf(P).k;
    return FC.map((c) => {
      const pts = [[c, -61.5, -2.2], [c, -59.5, 1.2], [c, -57, 1.6], [c, -55, -1.2]];
      const d = K.pathOf(pts.map((p) => K.iso(p, P)));
      return `<path d="${d}" fill="none" stroke="#1a1a1a" stroke-width="${(1.2 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#e8a33a" stroke-width="${(0.7 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join("");
  }
  // crops on the ridges: a stalk and a leafy head every 0.8 m, sorted far to near
  function cropsSvg(P) {
    const list = [];
    for (let i = 0; i <= NF; i++) {
      const x = i < NF ? FC[i] - 8 : FC[NF - 1] + 8;
      if (x < X0 + 3 || x > X1 - 3) continue;
      for (let y = BANK + 5; y < CUT - 2; y += 8) list.push([x, y]);
    }
    list.sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
    return list.map(([x, y], j) => ISO.tinted(ISO.T.green, S(K.cylinder(x, y, 0.35, 0, 2.2, P, 8), { tone: "mid" }) + S(G.sphereOf([x, y, 3.2 + (j % 3) * 0.3], 1.9 + (j % 2) * 0.3, P, { steps: 14 }), { tone: "mid" }))).join("");
  }

  ISO.add({
    name: "irrigation", title: "Furrow irrigation", compare: "irrigation 480 270 480",
    about: "A model field corner: a sluice gate lets river water into the canal, siphon tubes feed the furrows, and water runs down between the crop ridges.",
    line: "irrigation cx cy width gate=0..1 lab=1 lit=river|gate|canal|furrows|crops",
    demo: { line: "irrigation 480 270 540 gate=0", script: [{ set: { gate: 1 }, hold: 9 }, { set: { gate: 0 }, hold: 3 }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0" && o.labels !== "0", W = size * 1.1, H = size * 0.7;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, -29, -16), [X0, Y0, 12], [X1, CUT, 6]], cx, cy, W, H, { azimuth: 60, elevation: 32 }, parent);
      g.innerHTML = `<g>${groundSvg(P)}</g><g data-part="water"></g><g>${headwallSvg(P)}</g><g data-part="gate"></g><g>${siphonSvg(P)}</g><g data-name="crops">${cropsSvg(P)}</g><g data-part="flow"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      GATE.clear();
      const s = { gate: ISO.clamp(ISO.num(o, "gate", 1), 0, 1), canal: 0, wet: 0, ph: 0 };
      let want = s.gate, lit = o.lit || "";
      if (s.gate > 0) { s.canal = 1; s.wet = NF * 0.35 + 1.2; }
      // each furrow starts once the one before has run a third of the way; water runs 0.8 of a furrow a second here
      const adv = (i) => ISO.clamp((s.wet - i * 0.35) / 1.2, 0, 1);
      const draw = () => {
        const wk = `${s.canal.toFixed(2)} ${s.wet.toFixed(2)}`;
        w.rebuild(el.water, wk, () => {
          const out = [M.named("river", M.sec(P, [[-110, -8], [-124, -8], [-127.3, -1], [-106.4, -1]], Y0, CUT, "water"))];
          if (s.canal > 0.01) { const z = -4 + 2.6 * s.canal; out.push(M.named("canal", ISO.prismX(P, [[-60, -4], [-64, -4], [-64 - (z + 4) * 0.5, z], [-60 + (z + 4) * 0.5, z]], -100, X1, ["#6fa3d3", "#bcdcf5"], "#a9cff0", "#2f6fae"))); }
          const fur = [];
          FC.forEach((c, i) => {
            const a = adv(i); if (a < 0.01) return;
            const yEnd = BANK + (CUT - BANK) * a;
            // wet soil: a dark band on both slopes, a little ahead of the water
            const wetEnd = Math.min(CUT, yEnd + 3), band = (x0, x1, z0, z1) => `<path d="${K.pathOf([[x0, BANK, z0], [x1, BANK, z1], [x1, wetEnd, z1], [x0, wetEnd, z0]].map((p) => K.iso(p, P)), true)}" fill="#4f3a22" opacity=".35"/>`;
            fur.push(band(c - 4.6, c - 2, 0, -3) + band(c + 2, c + 4.6, -3, 0));
            fur.push(ISO.prismY(P, [[c - 2, -3], [c + 2, -3], [c + 2.53, -2.2], [c - 2.53, -2.2]], BANK, yEnd, ["#6fa3d3", "#bcdcf5"], "#a9cff0", "#2f6fae"));
            if (a >= 0.999) fur.push(face(P, [[c - 2, -3], [c + 2, -3], [c + 2.53, -2.2], [c - 2.53, -2.2]], "#a9cff0", "#2f6fae", 0.5));
          });
          out.push(M.named("furrows", fur.join("")));
          return out.join("");
        });
        const gk = Math.round(s.gate * 30);
        w.rebuild(el.gate, gk, () => { if (!GATE.has(gk)) GATE.set(gk, gateSvg(P, gk / 30)); return GATE.get(gk); });
        const flowing = s.gate > 0.02, fk = flowing ? `${(Math.round(s.ph * 2) / 2 % 10).toFixed(1)} ${s.wet.toFixed(1)}` : "";
        w.rebuild(el.flow, fk, () => fk && (M.flow(P, [[-117, -40, -0.9], [-117, Y0 + 4, -0.9]], s.ph * 0.7, { color: "#1f4f8f", gap: 10, dash: 4, w: 1.2 }) +
          M.flow(P, [[-100, -62, -1.2], [X1 - 2, -62, -1.2]], s.ph, { color: "#1f4f8f", gap: 10, dash: 4, w: 1.2, amount: s.canal }) +
          FC.map((c, i) => { const a = adv(i); return a > 0.05 && a < 0.999 ? M.flow(P, [[c, BANK, -2.1], [c, BANK + (CUT - BANK) * a, -2.1]], s.ph, { color: "#1f4f8f", gap: 10, dash: 3.6, w: 1 }) : ""; }).join("")));
        w.rebuild(el.words, lab ? "w" : "", () => !lab ? "" : [
          M.label(P, [-117, CUT, 0], "river", "#1f4f8f", { dy: 14 }), M.label(P, [-101.5, -62, 13], "sluice gate", "#444", { dy: -6 }),
          M.label(P, [10, Y0, 1], "canal", "#1f4f8f", { dy: -6 }), M.label(P, [FC[5], CUT, -3], "furrows", "#444", { dy: 18 }), M.label(P, [X1 - 6, -26, 5], "crop ridges", "#2c6a22", { anchor: "start" })].join(""));
        M.light(g, w, lit);
      };
      g.set = (p) => { if (p.gate !== undefined) want = ISO.clamp(+p.gate, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), done = NF * 0.35 + 1.2;
        s.gate = calm ? want : s.gate + Math.sign(want - s.gate) * Math.min(Math.abs(want - s.gate), dt * 0.5);
        if (calm) { s.canal = s.gate > 0 ? 1 : s.canal; s.wet = s.gate > 0 ? done : s.wet; }
        else if (s.gate > 0.01) {
          s.canal = Math.min(1, s.canal + dt * 0.8 * s.gate);
          if (s.canal > 0.6) s.wet = Math.min(done, s.wet + dt * 0.75 * s.gate);
          s.ph += dt * 14 * s.gate;
        }
        draw();
        return s.gate !== want || (s.gate > 0.01 && (s.canal < 1 || s.wet < done));
      };
      g.readout = () => {
        const a = 0.3 * s.gate, Q = 0.61 * 0.5 * a * Math.sqrt(2 * 9.81 * 0.25), run = FC.reduce((sum, _, i) => sum + adv(i), 0) / NF;
        return `gate open ${(a * 100).toFixed(0)} cm · Q = Cd b a √(2gΔh) = 0.61 × 0.5 m × ${a.toFixed(2)} m × √(2 × 9.81 × 0.25 m) ≈ ${(Q * 1000).toFixed(0)} L/s · water has run ${(run * 100).toFixed(0)}% down the ${NF} furrows`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
