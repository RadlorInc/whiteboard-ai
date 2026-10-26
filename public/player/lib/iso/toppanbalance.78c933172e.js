// "toppanbalance cx cy k load=0..600 tare=0|1 lab=0 lit=body|display|tare|pan|level" — a PART (PARTS.md, batch 5): a
// digital top-pan balance reading to 0.01 g, standing on the bench, origin the bench point under its middle. Cast body
// 14 × 15.6 cm on four levelling feet, a control panel sloping down to the front (+y) with a green LCD, ON/OFF, MODE
// and a blue TARE key, a spirit level on the deck, and a 10.6 cm stainless pan on its spider at the back (anchor
// `pan`, where a beaker goes). `load` is the true mass on the pan in g (the lesson passes it: a beaker's mass, then
// the water poured in); the display samples about 5 times a second and steps toward it, then shows the stable mark.
// tare=1 presses TARE: the display goes to 0.00 with the load still on (tare=0 clears it). Reused from labscale.js
// (k=digital), turned to face the part camera. Built in mm; anchors in cm. set({ load, tare }). anchors: pan
(() => {
  const K = window.K, G = window.G;
  // side outline in (y, z): the panel's front edge at y = 78, its ridge at y = 34, the back at y = −78
  const BODY = [[78, 0], [-78, 0], [-78, 24], [34, 24], [78, 12]], X0 = -70, X1 = 70;
  const PAN = [0, -24, 24], STEEL = ["#9ea4ab", "#e4e7ea"], MAX = 600;

  ISO.add({
    name: "toppanbalance", title: "Top-pan balance (part)", compare: null,
    about: "A digital top-pan balance (0.01 g, up to 600 g): the display steps to the mass on the pan and settles; TARE zeroes it with a beaker on, so then it reads only what is added. anchors: pan",
    line: "toppanbalance cx cy k load=0..600 tare=0|1 lab=0 lit=body|display|tare|pan|level",
    demo: { line: "toppanbalance 480 360 26 load=0 lab=1", script: [{ set: { lit: "pan" }, hold: 1 }, { set: { load: 48.62, lit: "display" }, hold: "settle" }, { set: { tare: 1, lit: "tare" }, hold: "settle" }, { set: { load: 73.62, lit: "display" }, hold: "settle" }, { set: { tare: 0, lit: "level" }, hold: "settle" }] },
    make([cx = 480, cy = 360, k = 3], o, t, parent) {
      const LAB = window.LAB, B18 = window.B18, S = LAB.S, L = LAB.L, D = LAB.D;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = ISO.mm(Pc), lab = o.lab === "1";
      const massOf = (v) => (Number.isFinite(+v) ? Math.round(ISO.clamp(+v, 0, MAX) * 100) / 100 : 0);
      const st = { load: massOf(ISO.num(o, "load", 0)), tare: 0, shown: 0, press: 0, pressT: 0, stable: true };
      if (o.tare === "1") st.tare = st.load;
      st.shown = st.load;
      let lit = o.lit || "";
      const up = G.unit3([0, -44, 12]);                                        // the panel rises from the front (y 78, z 12) to the ridge (y 34, z 24)
      const onPanel = (x, f, lift = 0.15) => [x, 78 - 44 * f, 12 + 12 * f + lift];
      const body = () => {
        const out = [`<path class="iso-halo" d="${K.haloOf({ x: X0, y: -78, w: X1 - X0, d: 156, r: 8 }, 0, 24, P)}"/>`];
        for (const [x, y] of [[X0 + 10, 70], [X1 - 10, 70], [X0 + 10, -70], [X1 - 10, -70]].sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P)))
          out.push(S(K.cylinder(x, y, 5, -4, 2, P, 20), { tone: "lo" }), S(K.cylinder(x, y, 2, -2, 2, P, 12), { tone: "mid" }));
        out.push(ISO.prismX(P, BODY, X0, X1, ["#c4c8cd", "#f1f2f4"], "#eceef0", "#4a5058"));
        // the display window and its LCD
        const q = (x, f) => K.iso(onPanel(x, f), P);
        out.push(`<path d="${K.pathOf([q(-34, 0.38), q(34, 0.38), q(34, 0.86), q(-34, 0.86)], true)}" fill="#2a3036" stroke="#1d2126" stroke-width="0.8"/>`);
        out.push(`<path d="${K.pathOf([q(-31, 0.43), q(31, 0.43), q(31, 0.81), q(-31, 0.81)], true)}" fill="#b9d3a6" stroke="#6d8a5c" stroke-width="0.5"/>`);
        // maker's plate screws on the deck, and the capacity printed on the panel's front strip
        out.push(D(K.corners({ x: X0, y: -78, w: X1 - X0, d: 112, r: 4 }, 5).map(([x, y]) => K.iso([x, y, 24], P)), { size: 0.5 }));
        out.push(LAB.faceText(P, onPanel(0, 0.17, 0.05), [1, 0, 0], "Max 600 g   d = 0.01 g", 3, "#6a7079", up));
        return out.join("");
      };
      // spirit level on the deck at the back left: its ring, the glass, the bubble and the circle it should sit in
      const level = () => L(K.ring(X0 + 14, -62, 5, 24, P, 24), { tone: "mid" }) + `<path d="${K.pathOf(K.circleRing(X0 + 14, -62, 4.2, 24).map(([a, b]) => K.iso([a, b, 24.05], P)), true)}" fill="#e9f3d6"/>` +
        D([K.iso([X0 + 14.6, -62.4, 24.1], P)], { size: 1.3, tone: "mid" }) + L(K.ring(X0 + 14, -62, 1.8, 24.1, P, 16), { tone: "lo" });
      const keys = (press) => {
        const out = [];
        [["ON/OFF", -54, 0], ["MODE", 44, 0], ["TARE", 58, 1]].forEach(([name, x, isTare]) => {
          const d = isTare ? press * 0.8 : 0, f0 = 0.4, f1 = 0.82;
          const key = ISO.box((u, w, v) => onPanel(u, v, w - d), P, [x - 7, x + 7], [0, 2.2], [f0, f1], "mid");
          out.push(`<g${isTare ? ' data-name="tare"' : ""}>${ISO.tinted(isTare ? ISO.T.blue : "", key)}${LAB.faceText(P, onPanel(x, (f0 + f1) / 2 - 0.05, 2.4 - d), [1, 0, 0], name, 3.2, isTare ? "#1f4f8f" : "#4a5058", up)}</g>`);
        });
        return out.join("");
      };
      const panSvg = () => {
        const out = [S(K.cylinder(PAN[0], PAN[1], 9, 24, 3, P, 24), { tone: "mid" })];
        out.push(LAB.turned(P, [PAN[0], PAN[1], 27.6], [[0, 52], [2, 52.5], [2.4, 53.4, 1], [3.2, 53.4]], STEEL, "#3e444b", { rims: [] }));
        out.push(`<path d="${K.pathOf(K.circleRing(PAN[0], PAN[1], 50, 64).map(([a, b]) => K.iso([a, b, 30.8], P)), true)}" fill="#eef0f2" stroke="#9aa1a8" stroke-width="0.6"/>`, L(K.ring(PAN[0], PAN[1], 36, 30.8, P, 48), { tone: "faint" }));
        return out.join("");
      };
      g.innerHTML = `<g data-name="body">${body()}</g><g data-name="level">${level()}</g><g data-part="keys"></g><g data-part="lcd" data-name="display"></g><g data-name="pan">${panSvg()}</g><g data-part="words"></g>`;
      g.anchors = { pan: [PAN[0] / 10, PAN[1] / 10, 3.08] };
      const el = LAB.parts(g), w = ISO.writer();
      const shownOf = () => st.shown - st.tare;
      const draw = () => {
        const shown = shownOf();
        w.rebuild(el.keys, st.press.toFixed(2), () => keys(st.press));
        w.rebuild(el.lcd, `${shown.toFixed(2)} ${st.stable}`, () => {
          const txt = Math.abs(shown) < 0.005 ? "0.00" : shown.toFixed(2);
          return LAB.faceText(P, onPanel(18, 0.5, 0.2), [1, 0, 0], txt, 11, "#1d2a14", up).replace('text-anchor="middle"', 'text-anchor="end"') +
            LAB.faceText(P, onPanel(26, 0.5, 0.2), [1, 0, 0], "g", 7, "#1d2a14", up) + (st.stable ? LAB.faceText(P, onPanel(-26, 0.68, 0.2), [1, 0, 0], "○", 4.5, "#1d2a14", up) : "");
        });
        if (lab) w.rebuild(el.words, "w", () => LAB.word(P, lab, [X1, 78, 0], "TARE zeroes the display", "#556", { anchor: "start", dy: 18 }) + LAB.word(P, lab, [PAN[0] + 56, PAN[1], 30], "pan", "#556", { anchor: "start" }));
        B18.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.load !== undefined) st.load = massOf(p.load);
        if (p.tare !== undefined) { if (+p.tare === 1) { st.tare = st.load; st.pressT = 0.5; } else if (+p.tare === 0) st.tare = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      let tick = 0;
      g.update = (dt) => {
        const calm = ISO.still();
        if (st.pressT > 0) { st.pressT -= dt; st.press = 1; } else st.press = ISO.follow(st.press, 0, dt, 0.08, calm);
        if (st.press < 0.01 || calm) st.press = 0;
        // the display samples about 5 times a second and steps toward the true mass, then shows the stable mark
        tick += dt;
        if (calm) st.shown = st.load;
        else if (tick > 0.2) { tick = 0; st.shown = Math.abs(st.load - st.shown) < 0.02 ? st.load : st.shown + (st.load - st.shown) * 0.6; }
        st.stable = Math.abs(st.load - st.shown) < 1e-6;
        draw();
        return !st.stable || st.press > 0;
      };
      g.readout = () => `display ${shownOf().toFixed(2)} g${st.stable ? " (stable)" : ""} · on the pan ${st.load.toFixed(2)} g${st.tare ? ` · tared at ${st.tare.toFixed(2)} g` : ""}`;
      draw();
      return g;
    },
  });
})();
