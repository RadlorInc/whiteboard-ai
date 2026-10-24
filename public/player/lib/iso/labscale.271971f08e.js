// "labscale cx cy size k=digital|pan tilt=deg lab=1 lit=pan|display|tare|beaker | 25.0 g" — a lab balance.
// digital: a top-pan balance reading to 0.01 g: cast body on levelling feet, a sloped control panel with a green LCD,
// ON/OFF, MODE and TARE keys, a spirit level, and a round stainless pan on its spider. The demo puts an empty 100 mL
// beaker on (48.62 g), presses TARE (the display goes to 0.00 g: the beaker's mass is taken away), then pours in water
// until it reads 25.00 g (25 mL of water). The reading settles in steps like a real balance and shows a stable mark.
// The line's text (e.g. 25.0 g) sets a mass already on the pan. pan: a two-pan beam balance that tilts by tilt degrees.
// set({ beaker: 0|1, tare: 1, add: g }).
(() => {
  const K = window.K, G = window.G;
  const BODY = [[-84, 0], [72, 0], [72, 24], [-40, 24], [-84, 12]], X0 = -70, X1 = 70;   // side outline in (y, z): front at y = −84
  const PAN = [0, 18, 24], BEAKER_G = 48.62, BR = 25, BH = 68;
  const STEEL = ["#9ea4ab", "#e4e7ea"];

  ISO.add({
    name: "labscale", title: "Lab balance", compare: "labscale 480 280 300 k=digital | 25.0 g",
    about: "A top-pan balance: put the beaker on, press TARE to zero it, then add water and read just the water's mass.",
    line: "labscale cx cy size k=digital|pan tilt=deg beaker=0|1 add=g lab=1 lit=pan|display|tare|beaker | 25.0 g",
    demo: { line: "labscale 480 280 300 k=digital", script: [{ set: { beaker: 1, lit: "beaker" }, hold: "settle" }, { set: { tare: 1, lit: "tare" }, hold: "settle" }, { set: { add: 25, lit: "display" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
      const lab = o.lab !== "0", W = size * 1.45, H2 = size * 1.05;
      if (o.k === "pan") return beamBalance([cx, cy, size], o, t, parent);
      const { P, g } = ISO.frame([[X0 - 4, -88, 0], [X1 + 4, 76, 0], [X0, 76, 30], [-BR, PAN[1] - BR, 30 + BH + 30], [BR, PAN[1] + BR, 30 + BH]], cx, cy, W, H2, { azimuth: -62, elevation: 24 }, parent);
      const pre = parseFloat(String(t || "")) || 0;
      const st = { on: !!+o.beaker || pre > 0, drop: +o.beaker ? 0 : 1, water: ISO.clamp(ISO.num(o, "add", 0), 0, 60), wantWater: ISO.clamp(ISO.num(o, "add", 0), 0, 60), tare: 0, shown: 0, press: 0, stable: true };
      let lit = o.lit || "";
      const slope = [0, 44, 12], up = G.unit3(slope);                       // the panel rises from the front edge (y −84, z 12) to (y −40, z 24)
      const onPanel = (x, f, lift = 0.15) => [x, -84 + 44 * f - up[2] * -lift * 0, 12 + 12 * f + lift];
      const body = () => {
        const out = [`<path class="iso-halo" d="${K.haloOf({ x: X0, y: -84, w: X1 - X0, d: 156, r: 8 }, 0, 24, P)}"/>`];
        for (const [x, y] of [[X0 + 10, -76], [X1 - 10, -76], [X0 + 10, 64], [X1 - 10, 64]].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P)))
          out.push(S(K.cylinder(x, y, 5, -4, 2, P, 20), { tone: "lo" }), S(K.cylinder(x, y, 2, -2, 2, P, 12), { tone: "mid" }));
        out.push(ISO.prismX(P, BODY, X0, X1, ["#c4c8cd", "#f1f2f4"], "#eceef0", "#4a5058"));
        // the display window and its LCD
        const q = (x, f) => K.iso(onPanel(x, f), P);
        out.push(`<path d="${K.pathOf([q(-34, 0.38), q(34, 0.38), q(34, 0.86), q(-34, 0.86)], true)}" fill="#2a3036" stroke="#1d2126" stroke-width="0.8"/>`);
        out.push(`<path d="${K.pathOf([q(-31, 0.43), q(31, 0.43), q(31, 0.81), q(-31, 0.81)], true)}" fill="#b9d3a6" stroke="#6d8a5c" stroke-width="0.5"/>`);
        // spirit level on the top deck at the back left
        out.push(L(K.ring(X0 + 14, 56, 5, 24, P, 24), { tone: "mid" }), `<path d="${K.pathOf(K.circleRing(X0 + 14, 56, 4.2, 24).map(([a, b]) => K.iso([a, b, 24.05], P)), true)}" fill="#e9f3d6"/>`, D([K.iso([X0 + 14.6, 56.4, 24.1], P)], { size: 1.3, tone: "mid" }), L(K.ring(X0 + 14, 56, 1.8, 24.1, P, 16), { tone: "lo" }));
        // maker's plate and screws
        out.push(D(K.corners({ x: X0, y: -40, w: X1 - X0, d: 112, r: 4 }, 5).map(([x, y]) => K.iso([x, y, 24], P)), { size: 0.5 }));
        return out.join("");
      };
      const keys = (press) => {
        const out = [];
        [["ON/OFF", 54, 0], ["MODE", -44, 0], ["TARE", -58, 1]].forEach(([name, x, isTare]) => {
          const d = isTare ? press * 0.8 : 0, f0 = 0.4, f1 = 0.82;
          const at = (u, w, v) => onPanel(u, v, w - d);
          const key = ISO.box((u, w, v) => at(u, w, v), P, [x - 7, x + 7], [0, 2.2], [f0, f1], "mid");
          out.push(`<g${isTare ? ' data-name="tare"' : ""}>${ISO.tinted(isTare ? ISO.T.blue : "", key)}${LAB.faceText(P, onPanel(x, (f0 + f1) / 2 - 0.05, 2.4 - d), [-1, 0, 0], name, 3.2, isTare ? "#1f4f8f" : "#4a5058", up)}</g>`);
        });
        return out.join("");
      };
      const panSvg = () => {
        const out = [S(K.cylinder(PAN[0], PAN[1], 9, 24, 3, P, 24), { tone: "mid" })];
        out.push(LAB.turned(P, [PAN[0], PAN[1], 27.6], [[0, 52], [2, 52.5], [2.4, 53.4, 1], [3.2, 53.4]], STEEL, "#3e444b", { rims: [] }));
        out.push(`<path d="${K.pathOf(K.circleRing(PAN[0], PAN[1], 50, 64).map(([a, b]) => K.iso([a, b, 30.8], P)), true)}" fill="#eef0f2" stroke="#9aa1a8" stroke-width="0.6"/>`, L(K.ring(PAN[0], PAN[1], 36, 30.8, P, 48), { tone: "faint" }));
        return out.join("");
      };
      g.innerHTML = `<g data-name="balance">${body()}</g><g data-part="keys"></g><g data-part="lcd" data-name="display"></g><g data-name="pan">${panSvg()}</g><g data-part="beaker" data-name="beaker"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer();
      const mass = () => (st.on ? (1 - ISO.ease(st.drop) > 0.98 ? BEAKER_G + st.water : 0) : 0) + (st.on ? 0 : pre);
      const draw = () => {
        const shown = (st.shown - st.tare);
        w.rebuild(el.keys, st.press.toFixed(2), () => keys(st.press));
        w.rebuild(el.lcd, `${shown.toFixed(2)} ${st.stable}`, () => {
          const txt = `${Math.abs(shown) < 0.005 ? "0.00" : shown.toFixed(2)}`;
          return LAB.faceText(P, onPanel(-18, 0.5, 0.2), [-1, 0, 0], txt, 11, "#1d2a14", up).replace('text-anchor="middle"', 'text-anchor="end"') +
            LAB.faceText(P, onPanel(-26, 0.5, 0.2), [-1, 0, 0], "g", 7, "#1d2a14", up) + (st.stable ? LAB.faceText(P, onPanel(26, 0.68, 0.2), [-1, 0, 0], "○", 4.5, "#1d2a14", up) : "");
        });
        const lift = ISO.ease(st.drop) * 60;
        w.rebuild(el.beaker, `${lift.toFixed(1)} ${st.water.toFixed(2)}`, () => {
          if (lift > 59.9) return "";
          const V = LAB.vessel(P, [PAN[0], PAN[1], 31 + lift], [[0, BR - 2.4], [0.7, BR - 1, 1], [2, BR - 0.2, 1], [3, BR], [BH, BR]], { spout: true });
          return V.back() + V.liquid(V.levelFor(st.water), "clear", { opacity: 0.7 }) + V.front() + V.scale(V.levelFor(20), V.levelFor(20) + 8 * (V.levelFor(20) - V.levelFor(10)) + 0.01, V.levelFor(20) - V.levelFor(10), 5, { side: 0.5 });
        });
        if (lab) w.rebuild(el.words, `${st.tare ? 1 : 0}`, () => LAB.word(P, lab, [X1, -84, 0], "TARE zeroes the display", "#556", { anchor: "start", dy: 18 }) + LAB.word(P, lab, [PAN[0] - 56, PAN[1], 30], "pan", "#556", { anchor: "start" }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.beaker !== undefined) { st.on = !!+p.beaker; if (!st.on) { st.tare = 0; st.wantWater = 0; } }
        if (p.tare) { st.tare = mass(); st.pressT = 0.5; }
        if (p.add !== undefined) st.wantWater = ISO.clamp(+p.add, 0, 60);
        if (p.lit !== undefined) lit = p.lit;
      };
      let tick = 0;
      g.update = (dt) => {
        const calm = ISO.still();
        st.drop = ISO.follow(st.drop, st.on ? 0 : 1, dt, 0.3, calm);
        if (Math.abs(st.drop - (st.on ? 0 : 1)) < 0.002) st.drop = st.on ? 0 : 1;
        st.water = calm || st.wantWater < st.water ? st.wantWater : Math.min(st.wantWater, st.water + dt * 6);
        if (st.pressT > 0) { st.pressT -= dt; st.press = 1; } else st.press = ISO.follow(st.press, 0, dt, 0.08, calm);
        if (st.press < 0.01) st.press = 0;
        // the display samples about 5 times a second and steps toward the true mass, then shows the stable mark
        tick += dt;
        const m = mass();
        if (calm) st.shown = m;
        else if (tick > 0.2) { tick = 0; st.shown = Math.abs(m - st.shown) < 0.02 ? m : st.shown + (m - st.shown) * 0.6; }
        st.stable = Math.abs(m - st.shown) < 1e-6;
        draw();
        return !st.stable || st.drop % 1 !== 0 || st.water !== st.wantWater || st.press > 0;
      };
      g.readout = () => {
        const shown = st.shown - st.tare;
        return `display ${shown.toFixed(2)} g${st.stable ? " (stable)" : ""} · on the pan ${mass().toFixed(2)} g${st.tare ? ` · tared at ${st.tare.toFixed(2)} g (the beaker)` : ""}${st.water ? ` · water ${st.water.toFixed(2)} g = ${st.water.toFixed(1)} mL` : ""}`;
      };
      draw();
      return g;
    },
  });

  // ── a two-pan beam balance: base, pillar, beam on a knife edge, pans on stirrups, a pointer over a scale
  function beamBalance([cx, cy, size], o, t, parent) {
    const LAB = window.LAB, S = LAB.S, L = LAB.L, D = LAB.D;
    const lab = o.lab !== "0", W = size * 1.5, H2 = size * 1.1;
    const BASEP = { x: -110, y: -26, w: 220, d: 52, r: 5 }, ARM = 92, TOPZ = 150;
    const { P, g } = ISO.frame([...K.boxCorners(BASEP, 0, 12), [-ARM - 40, 0, TOPZ + 14], [ARM + 40, 0, TOPZ + 14], [-ARM - 40, 0, 40]], cx, cy, W, H2, { azimuth: 70, elevation: 18 }, parent);
    const st = { a: 0, want: ISO.clamp(ISO.num(o, "tilt", 0), -20, 20) };
    g.innerHTML = `<g style="${ISO.T.wood}">${LAB.mat(P, BASEP, 12, "mid", ISO.T.wood)}</g><g>${S(K.cylinder(0, 0, 8, 12, TOPZ - 12, P, 24), { tone: "mid", crease: "none" })}${ISO.wbox(P, [-10, 10], [-4, 4], [TOPZ - 30, TOPZ - 6], "mid")}</g><g data-part="beam"></g>`;
    const el = LAB.parts(g), w = ISO.writer();
    const draw = () => w.rebuild(el.beam, st.a.toFixed(3), () => {
      const a = (st.a * Math.PI) / 180, end = (s) => [s * ARM * Math.cos(a), 0, TOPZ - s * ARM * Math.sin(a)], out = [];
      out.push(ISO.tinted(ISO.T.brass, ISO.box((u, w2, y) => [u * Math.cos(a) - w2 * Math.sin(a), y, TOPZ + u * -Math.sin(a) + w2 * -Math.cos(a) * -1], P, [-ARM - 4, ARM + 4], [-2.5, 2.5], [-2.5, 2.5], "hi")));
      out.push(`<path d="${K.pathOf([K.iso([0, 3, TOPZ], P), K.iso([Math.sin(a) * -60, 3, TOPZ - Math.cos(a) * 60], P)])}" stroke="#26262a" stroke-width="1.4"/>`);
      for (const s of [-1, 1]) {
        const e = end(s), pz = e[2] - 70;
        out.push(`<path d="${K.pathOf([K.iso(e, P), K.iso([e[0] - 22, -14, pz], P)])} ${K.pathOf([K.iso(e, P), K.iso([e[0] + 22, 14, pz], P)])} ${K.pathOf([K.iso(e, P), K.iso([e[0] - 22, 14, pz], P)])}" stroke="#55606b" stroke-width="0.8" fill="none"/>`);
        out.push(ISO.tinted(ISO.T.brass, S(G.solidOf([[0, 24], [3, 30, 1], [5, 32]], LAB.Z([e[0], 0, pz - 5]), P), { tone: "hi" })));
        out.push(S(G.sphereOf(e, 3.4, P), { tone: "mid" }));
      }
      return out.join("") + (lab ? LAB.word(P, lab, [0, 0, TOPZ + 18], st.a > 0.5 ? "right side heavier" : st.a < -0.5 ? "left side heavier" : "balanced", "#556") : "");
    });
    g.set = (p) => { if (p.tilt !== undefined) st.want = ISO.clamp(+p.tilt, -20, 20); };
    g.update = (dt) => { st.a = ISO.follow(st.a, st.want, dt, 0.5, ISO.still()); draw(); return st.a !== st.want; };
    g.readout = () => (Math.abs(st.want) < 0.5 ? "beam level: both pans hold the same mass" : `beam tilted ${st.want}°: the lower pan is heavier`);
    draw();
    LAB.title(parent, cx, cy - H2 / 2 - 8, t);
    return g;
  }
})();
