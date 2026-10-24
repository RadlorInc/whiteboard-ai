// "medcup cx cy size k=liquid|pills ml=0-30 lab=1 lit=cup|liquid|bottle|marks" — a graduated medicine cup.
// A 30 mL clear cup (a tapered tumbler) with printed marks every 5 mL and its numbers, standing on the table beside a
// bottle of syrup with its cap off. set({ ml }) tips the bottle over the cup and pours (about 3 mL a second) until the
// liquid reaches that mark, then stands it back up. The level is solved from the cup's true taper:
// V = πh(r₀² + r₀r + r²)/3. Read it at eye level at the bottom of the curved surface; 5 mL = 1 teaspoon.
// k=pills shows two tablets and a capsule in the cup instead.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm. Cup inside: radius 15.5 at the floor (z = 2) to 20 at 40 mm up.
  const C = { x: 0, y: 0 }, R0 = 15.5, R1 = 20.5, HC = 40, FL = 2, CAP = 30;
  const BX = 62, BY = -26, BH = 92, BR = 20, TIP = 1.95, RATE = 3;
  const up = (x, y, z) => G.frameOf([x, y, z], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const open = (svg) => svg.replace(/<path class="iso-fill"[^>]*>/, "").replace(/<path class="iso-top"[^>]*>/, "");
  const rAt = (h) => R0 + ((R1 - R0) * h) / HC;
  const volOf = (h) => (Math.PI * h * (R0 * R0 + R0 * rAt(h) + rAt(h) ** 2)) / 3 / 1000;
  const hOf = (ml) => { let lo = 0, hi = HC; for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; volOf(m) < ml ? (lo = m) : (hi = m); } return (lo + hi) / 2; };
  const STYLE = `<style>.mc-clear .iso-fill{fill-opacity:.06}.mc-clear .iso-shade{fill-opacity:.4}.mc-clear .iso-top{fill-opacity:.3}</style>`;
  const SYRUP = ISO.tint("#fbe3d6", ["#e9a382", "#eeb497", "#f2c5ad", "#f6d4c2"], "#8a3a17");
  const AMBER = ISO.tint("#e9b979", ["#9a5a14", "#ad6b20", "#bf7d30", "#d19445"], "#4a2a06");

  const liquidSvg = (P, ml) => { if (ml < 0.05) return ""; const h = hOf(ml), F = up(C.x, C.y, FL); return ISO.tinted(SYRUP, S(G.solidOf([[0, R0 - 0.3], [h, rAt(h) - 0.3]], F, P), { tone: "hi" })); };
  function cupSvg(P) {
    const F = up(C.x, C.y, 0), slope = (R1 - R0) / HC, out = [];
    out.push(`<g class="mc-clear">${ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, R0 + 0.4], [FL + HC, R1 + 1], [FL + HC + 1.4, R1 + 1.4]], F, P, { rims: "last" }), { tone: "hi", inner: L(G.arcOf(F, FL + HC - 1, R1 + 0.9, P, { slope }), { tone: "faint" }) }))}</g>`);
    // rolled lip, open mouth
    out.push(ISO.tinted(ISO.T.glass, open(S(G.ringBand(FL + HC, FL + HC + 1.4, R1, R1 + 1.8, F, P), { tone: "hi" }))));
    return out.join("");
  }
  // The printed marks: an arc for every 5 mL on the side facing you, long ones with their number.
  function marksSvg(P) {
    const F = up(C.x, C.y, 0), a = G.angleToward(F, G.viewOf(P)) - 0.35, out = [], nums = [];
    for (let ml = 5; ml <= CAP; ml += 5) {
      const z = FL + hOf(ml), r = rAt(z - FL) + 0.5, n = ml % 10 ? 0.22 : 0.36, arc = Array.from({ length: 9 }, (_, k) => K.iso(G.pointOf(F, z, r, a - n + (k / 8) * 2 * n), P));
      out.push(K.pathOf(arc));
      const q = K.iso(G.pointOf(F, z, r, a + n + 0.12), P);
      nums.push(`<text x="${q[0].toFixed(1)}" y="${(q[1] + 2.4).toFixed(1)}" fill="#1f3550" style="font:700 6.4px 'Helvetica Neue',Arial,sans-serif">${ml}</text>`);
    }
    const q = K.iso(G.pointOf(F, FL + HC - 4, R1, a + 0.4), P);
    return `<path d="${out.join("")}" stroke="#1f3550" stroke-width="0.9" fill="none"/>${nums.join("")}<text x="${q[0].toFixed(1)}" y="${q[1].toFixed(1)}" fill="#1f3550" style="font:600 5px 'Helvetica Neue',Arial,sans-serif">mL</text>`;
  }
  function pillsSvg(P) {
    return ISO.tinted(ISO.tint("#fbfbfa", ["#d9dbdd", "#e3e5e6", "#ecedee", "#f4f4f5"], "#6b7480"), S(K.cylinder(-5, -3, 5, FL, 3, P, 28, 0.5), { tone: "hi" }) + S(K.cylinder(5, 4, 5, FL, 3, P, 28, 0.5), { tone: "hi" })) +
      ISO.tinted(ISO.T.red, S(G.disc(-7, 0, 3.2, G.frameAlong([2, -4, FL + 6.2], [0.8, 0.6, 0]), P), { tone: "hi" })) + ISO.tinted(ISO.T.blue, S(G.disc(0, 7, 3.2, G.frameAlong([2, -4, FL + 6.2], [0.8, 0.6, 0]), P), { tone: "hi" }));
  }
  // The bottle tipped by k (0 standing, 1 pouring): it lifts over the cup and leans with its mouth over the middle.
  const bottleMemo = new WeakMap();
  function bottleSvg(P, k) {
    const key = k.toFixed(2), memo = bottleMemo.get(P) || bottleMemo.set(P, {}).get(P);
    if (memo[key]) return memo[key];
    const e = ISO.ease(k), th = TIP * e;
    // pouring pose: lean about y; the mouth (at s = BH + 10) ends above the cup's middle
    const ax = [-Math.sin(th), 0, Math.cos(th)], mouth = BH + 10;
    const restBase = [BX, BY, 0], pourBase = [C.x + 4 - ax[0] * mouth, C.y, FL + HC + 16 - ax[2] * mouth];
    const base = restBase.map((v, i) => v + (pourBase[i] - v) * e + (i === 2 ? Math.sin(Math.PI * e) * 14 : 0));
    const F = G.frameOf(base, ax, [Math.cos(th), 0, Math.sin(th)], [0, 1, 0]);
    const out = [ISO.tinted(AMBER, S(G.solidOf([[0, BR - 1.5], [1.5, BR, 1], [BH - 22, BR, 1], [BH - 12, 11, 1], [BH - 6, 9.6], [BH + 10, 9.6]], F, P), { tone: "hi", inner: L(G.arcOf(F, BH - 4, 9.6, P) + G.arcOf(F, BH, 9.6, P), { tone: "lo" }) }))];
    out.push(ISO.tinted(ISO.tint("#fbfbfa", ["#d9dbdd", "#e3e5e6", "#ecedee", "#f4f4f5"], "#6b7480"), open(S(G.ringBand(18, 58, BR - 0.5, BR + 0.2, F, P), { tone: "hi", inner: L(G.arcOf(F, 50, BR + 0.2, P), { tone: "faint" }) }))));
    return (memo[key] = out.join(""));
  }

  ISO.add({
    name: "medcup", title: "Medicine cup", compare: "medcup 480 270 260 k=liquid",
    about: "A 30 mL graduated medicine cup: the bottle pours until the liquid reaches the mark; read it at eye level at the bottom of the curve (5 mL = 1 teaspoon).",
    line: "medcup cx cy size k=liquid|pills ml=0-30 lab=1 lit=cup|liquid|bottle|marks",
    demo: { line: "medcup 480 270 260 k=liquid ml=0", script: [{ set: { ml: 5, lit: "bottle" }, hold: "settle" }, { set: { ml: 10, lit: "liquid" }, hold: "settle" }] },
    make([cx, cy, size = 260], o, t, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", pills = o.k === "pills", W = size * 2.1, H = size * 1.42;
      const pts = [[-34, -50, -3], [BX + 34, 34, -3], [-34, 34, -3], [BX + 34, -50, -3], [0, 0, FL + HC + 2], [BX, BY, BH + 12], [-40, 0, FL + HC + 40], [10, 0, FL + HC + 40]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 64, elevation: 22 }, parent);
      const T = { x: -34, y: -50, w: BX + 68, d: 84, r: 6 };
      g.innerHTML = STYLE + `<g>${ISO.tinted(ISO.T.wood, S(K.slabOf(T, -3, 3, P, 4, 0.6), { tone: "lo", inner: L(K.sideSeam(T, -1.5, P, 4), { tone: "faint" }) }))}` +
        `<path class="iso-halo" d="${K.haloOf({ x: -R1, y: -R1, w: 2 * R1, d: 2 * R1, r: R1 }, 0, 4, P)}"/>${ISO.tinted(ISO.T.plastic, S(K.cylinder(BX - 8, BY + 46, 11, 0, 14, P, 32, 0.4), { tone: "hi", inner: L(K.knurl(BX - 8, BY + 46, 11, 0, 14, 30, P, 0), { tone: "lo" }) }))}</g>` +
        `<defs><linearGradient id="mc-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3d3df"/><stop offset=".5" stop-color="#e3ecf2"/><stop offset="1" stop-color="#d5e2ea"/></linearGradient></defs><path d="${K.pathOf(ISO.hullOf([...K.circleRing(C.x, C.y, R1 + 1.2, 48).map(([x, y]) => K.iso([x, y, FL + HC + 1.4], P)), ...K.circleRing(C.x, C.y, R0, 48).map(([x, y]) => K.iso([x, y, FL], P))]), true)}" fill="url(#mc-in)"/><path d="${G.arcOf(up(C.x, C.y, 0), FL + 1, R0, P, { inward: true, least: -1 })}" fill="none" stroke="#b9cbd8" stroke-width="0.6"/><g data-name="liquid">${pills ? pillsSvg(P) : ""}</g><g data-name="cup">${cupSvg(P)}</g><g data-name="marks">${marksSvg(P)}</g><g data-part="stream"></g><g data-name="bottle"></g><g data-part="words"></g>`;
      const nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")], stream = g.querySelector('[data-part="stream"]');
      const s = { ml: pills ? 0 : ISO.clamp(ISO.num(o, "ml", 10), 0, CAP), want: 0, k: 0, flow: 0, lit: o.lit || "" };
      s.want = s.ml;
      if (lab) {
        const word = (p, t2, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], t2, "#444", { anchor, size: 14, dy }); };
        g.querySelector('[data-part="words"]').innerHTML = word([-R1, R1, 0], "Medicine cup, 30 mL", "middle", 30) + word([BX + BR, BY, 30], "Syrup bottle", "start", 4, 6) + word([BX - 8, BY + 46, 0], "Cap", "middle", 22);
      }
      const draw = () => {
        if (!pills) w.rebuild(nm("liquid"), s.ml.toFixed(2), () => liquidSvg(P, Math.round(s.ml * 4) / 4));
        const kq = Math.round(s.k * 30) / 30;
        w.rebuild(nm("bottle"), kq.toFixed(3), () => bottleSvg(P, kq));
        w.rebuild(stream, s.flow > 0.02 ? s.flow.toFixed(2) + s.ml.toFixed(1) : "", () => {
          if (s.flow <= 0.02) return "";
          const top = FL + HC + 16, bot = FL + hOf(s.ml) + 0.5;
          return `<g opacity="${Math.min(1, s.flow * 1.4).toFixed(2)}">${ISO.tinted(SYRUP, S(K.cylinder(C.x + 4, C.y, 1.3 * s.flow, bot, top - bot, P, 12), { tone: "hi", crease: "none" }))}</g>`;
        });
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name.startsWith(s.lit)));
      };
      g.set = (p) => { if (p.ml !== undefined && !pills) s.want = ISO.clamp(+p.ml, 0, CAP); if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        if (calm) { s.ml = Math.max(s.ml, s.want); s.k = 0; s.flow = 0; draw(); return false; }
        const pouring = s.ml < s.want - 1e-3;
        // tip over (1.2 s), pour once the mouth is over the cup, stand back up when the mark is reached
        s.k = ISO.clamp(s.k + (pouring ? 1 : -1) * (dt / 1.2), 0, 1);
        const flowing = pouring && s.k > 0.97;
        if (flowing) s.ml = Math.min(s.want, s.ml + RATE * dt * ISO.clamp((s.want - s.ml) * 1.5 + 0.15, 0, 1));
        s.flow = ISO.follow(s.flow, flowing ? 1 : 0, dt, 0.12);
        if (!flowing && s.flow < 0.01) s.flow = 0;
        draw();
        return pouring || s.k > 0 || s.flow > 0;
      };
      g.readout = () => {
        if (pills) return "two tablets and a capsule in the cup · count them against the chart before giving";
        const ml = Math.round(s.ml * 10) / 10;
        if (s.flow > 0.02) return `pouring · ${ml.toFixed(1)} mL in the cup`;
        return ml > 0 ? `${ml} mL = ${(ml / 5).toFixed(1)} teaspoons · liquid ${hOf(ml).toFixed(1)} mm deep · read it at eye level at the bottom of the curve` : "empty 30 mL cup · marks every 5 mL";
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
