// "gmtube cx cy k stand=0|1 dx=-200..200 dy=-200..200 dz=-200..200 to=<id>.<anchor> lab=0 lit=window|tube|stand|cable"
// — a PART (PARTS.md, batch 5): the Geiger–Müller tube of penetration.js, a probe, so its origin is the working tip:
// the middle of its thin mica window, which faces +x (toward a source on the +x side; radiation travels toward −x).
// An end-window tube 2.5 cm across and 15 cm long lying along −x: a plastic front ring guarding the window (amber
// mica behind a wire grille), the aluminium body with its print, a plastic back cap and a BNC socket with the cable's
// plug on it. stand=1 (default) holds it in a ring clamp on a small post and foot, its foot 7 cm below the window
// (the absorption set's beam height, B22.BEAM), so it stands on the same bench as a sourceholder. The cable runs from
// the back to its end: to=<id>.<anchor> (the player passes tox toy, with dz), or dx dy dz cm from the window; its BNC
// plug points −y into the end (a scalercounter's `input` on its +y face). Static. Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const R = 12.5, LEN = 150, ZF = -70;
  const unit = (v) => { const l = Math.hypot(...v); return l > 1e-9 ? v.map((x) => x / l) : [1, 0, 0]; };
  ISO.add({
    name: "gmtube", title: "Geiger–Müller tube (part)", compare: null,
    about: "An end-window Geiger–Müller tube 15 cm long lying along −x, its thin mica window facing +x toward the source, on a small stand (window 7 cm up) with its cable to the counter (to= or dx dy dz). anchors: end back",
    line: "gmtube cx cy k stand=0|1 dx=-200..200 dy=-200..200 dz=-200..200 to=<id>.<anchor> lab=0 lit=window|tube|stand|cable",
    demo: { line: "gmtube 620 230 26 stand=1 dx=-8 dy=12 dz=-6.4 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "window" }, hold: 1.2 }, { set: { lit: "cable", dy: 6 }, hold: 1.2 }, { set: { stand: 0, lit: "tube" }, hold: 1.2 }, { set: { stand: 1, lit: "stand" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const lim = (v) => ISO.clamp(v, -200, 200), fin = (v) => v !== undefined && v !== "" && Number.isFinite(+v);
      const st = { stand: o.stand !== "0", dx: lim(ISO.num(o, "dx", -8)), dy: lim(ISO.num(o, "dy", 12)), dz: lim(ISO.num(o, "dz", -6.4)), tox: o.tox, toy: o.toy };
      let lit = o.lit || "";
      const F = G.frameOf([0, 0, 0], [-1, 0, 0], [0, 1, 0], [0, 0, 1]);
      // print reads along +x: a +x frame for the side that faces us and its up
      const Fx = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]), face = G.angleToward(Fx, G.viewOf(Pm)), up = G.tangentOf(Fx, face);
      const steel = (svg) => ISO.tinted(ISO.T.steel, svg), plastic = (svg) => ISO.tinted(ISO.T.plastic, svg);
      const MICA = ISO.tint("#b8863a", ["#7a5622", "#8a6228", "#9a6e30", "#a97a36"], "#4a3210");
      const endOf = () => (fin(st.tox) && fin(st.toy) ? ISO.unproject(P, [+st.tox, +st.toy], st.dz) : [st.dx, st.dy, st.dz]).map(lim);
      function standSvg() {
        const out = [ISO.tinted(ISO.T.paint, S(K.cylinder(-67, 0, 24, ZF, 6, Pm, 36, 1), { tone: "mid" }))];
        out.push(steel(S(K.cylinder(-67, 0, 4.5, ZF + 6, -ZF - 6 - R - 3, Pm, 20), { tone: "mid", crease: "none" })));
        out.push(steel(ISO.wbox(Pm, [-73, -61], [-5, 5], [-R - 6, -R + 1], "mid")));
        return out.join("");
      }
      function tubeSvg() {
        const out = [];
        // back to front along the tube (far, −x, first): plug's strain relief, plug, socket, back cap, body, window, ring
        out.push(`<g data-name="cable">${ISO.tinted(ISO.T.rubber, S(G.solidOf([[148, 6], [152, 4.5], [162, 3.4]], F, Pm), { tone: "mid" }))}` +
          steel(S(G.disc(136, 148, 6.4, F, Pm), { tone: "hi", inner: L([139, 142, 145].map((s) => G.arcOf(F, s, 6.4, Pm)).join(""), { tone: "faint" }) })) + "</g>");
        out.push(`<g data-name="tube">${steel(S(G.disc(127, 136, 5.2, F, Pm), { tone: "mid" }))}`);
        out.push(plastic(S(G.solidOf([[106, R], [122, R - 0.8], [127, R - 3.5], [127.5, 6]], F, Pm), { tone: "mid", inner: L(G.arcOf(F, 112, R - 0.2, Pm), { tone: "faint" }) })));
        // the body in two pieces round the stand's ring clamp (s 60..74), far piece first, so each covers the one behind
        out.push(ISO.tinted(B22.ALU, S(G.disc(74, 106, R, F, Pm), { tone: "hi", crease: "none", inner: L(G.arcOf(F, 96, R, Pm) + G.arcOf(F, 99, R, Pm), { tone: "faint" }) })));
        if (st.stand) out.push(`<g data-name="stand">${clampSvg()}</g>`);
        out.push(ISO.tinted(B22.ALU, S(G.disc(4, st.stand ? 60 : 74, R, F, Pm), { tone: "hi", crease: "none" })));
        const at = (s) => G.pointOf(Fx, -s, R + 0.05, face);
        out.push(LAB.faceText(Pm, at(30), [1, 0, 0], "G–M TUBE", 5.5, "#2b2f35", up), LAB.faceText(Pm, at(90), [1, 0, 0], "400 V", 4, "#4a4e55", up), "</g>");
        // the window: amber mica, a fine wire grille across it, and the guard ring round it
        const wf = (y, z) => K.iso([0.06, y, z], Pm), grille = [];
        for (const c of [-5, 0, 5]) { const h = Math.sqrt(9 * 9 - c * c); grille.push(K.pathOf([wf(c, -h), wf(c, h)]), K.pathOf([wf(-h, c), wf(h, c)])); }
        out.push(`<g data-name="window">${plastic(S(G.disc(0, 4, R + 0.5, F, Pm), { tone: "mid" }))}${ISO.tinted(MICA, S(G.disc(-0.05, 0, 9, F, Pm), { tone: "hi", crease: "none" }))}<path d="${grille.join("")}" fill="none" stroke="#3c3f45" stroke-width="${Math.max(0.4, G.scaleOf(Pm) * 0.35).toFixed(2)}"/>`);
        out.push("</g>");
        return out.join("");
      }
      const clampSvg = () => steel(S(G.disc(60, 74, R + 1.6, F, Pm), { tone: "mid" })) + steel(S(G.disc(-2, 4, 2.6, G.frameOf([-67, 0, R + 1.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), Pm), { tone: "hi" }));
      function cableSvg(E) {
        // from the strain relief along −x, down to the bench, and into the end's plug from +y
        const p0 = [-162, 0, 0], p3 = E.map((v, i) => v + [0, 30, 0][i]), span = Math.hypot(...p3.map((v, i) => v - p0[i]));
        const p1 = [-162 - Math.min(60, span * 0.35), 0, 0], p2 = p3.map((v, i) => v + [0, Math.min(60, span * 0.35), 0][i]);
        // ponytail: the cable rests on the bench under the stand's foot (or 4 cm under its end without a stand); a floor= key if it must lie elsewhere
        const floor = (st.stand ? ZF : Math.min(E[2], 0) - 40) + 3.4, pts = [];
        for (let i = 0; i <= 40; i++) {
          const q = i / 40, m = 1 - q, b = [0, 1, 2].map((j) => m * m * m * p0[j] + 3 * m * m * q * p1[j] + 3 * m * q * q * p2[j] + q * q * q * p3[j]);
          const z = b[2] - (span * 0.25) * Math.sin(Math.PI * q) ** 2, e = 8;
          b[2] = (z + floor + Math.sqrt((z - floor) ** 2 + e * e)) / 2; pts.push(K.iso(b, Pm));
        }
        const Fp = G.frameOf(E, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
        const plug = steel(S(G.disc(0, 12, 6.4, Fp, Pm), { tone: "hi", inner: L([3, 6, 9].map((s) => G.arcOf(Fp, s, 6.4, Pm)).join(""), { tone: "faint" }) })) + ISO.tinted(ISO.T.rubber, S(G.solidOf([[12, 6], [20, 4], [30, 3.4]], Fp, Pm), { tone: "mid" }));
        return CIRC.tube(K.pathOf(pts), G.scaleOf(Pm) * 6.8, CIRC.LEAD.black) + plug;
      }
      const build = () => {
        const E = endOf(), Em = E.map((v) => v * 10), behind = Em[1] < 0;
        const cable = `<g data-name="cable">${cableSvg(Em)}</g>`;
        g.innerHTML = (st.stand ? `<path class="iso-halo" d="${K.haloOf({ x: -91, y: -24, w: 48, d: 48, r: 24 }, ZF, 6, Pm)}"/>` : "") +
          (behind ? cable : "") + (st.stand ? `<g data-name="stand">${standSvg()}</g>` : "") + tubeSvg() + (behind ? "" : cable) + `<g data-part="words"></g>`;
        if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [-60, 0, R + 22], "GM tube", "#445", { dy: -6 });
        g.anchors = { end: E, back: [-16.2, 0, 0] };
        B22.light(ISO.writer(), g, lit);
      };
      g.set = (p) => {
        if (p.lit !== undefined) lit = p.lit;
        if (p.stand !== undefined) st.stand = String(p.stand) !== "0";
        for (const key of ["dx", "dy", "dz"]) if (fin(p[key])) st[key] = lim(+p[key]);
        for (const key of ["tox", "toy"]) if (fin(p[key])) st[key] = +p[key];
        build();
      };
      g.update = () => false;
      g.readout = () => "Geiger–Müller tube · each alpha, beta or gamma that ionises the gas behind the thin mica window gives one click on the counter";
      build();
      return g;
    },
  });
})();
