// "launchcontroller cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 fire=0|1 lab=0 lit=case|key|lamp|button|cable|clips"
// — a PART (PARTS.md, batch 5): the launch controller of rocket.js, a box 12 × 8 × 4 cm on the ground, origin the
// ground point under its middle. On its top the safety key in its brass lock (no key, no launch), the continuity lamp
// in a chrome bezel and the red LAUNCH button in its guard ring, their names printed under them; on its front the
// maker's line (6 V, four AA cells inside). Its cable leaves the −x end through a strain relief, lies along the ground
// and rises to a split sleeve, where a red and a black lead go up to two micro clips hanging from the igniter's leads:
// to=<id>.<anchor> (the player passes tox toy dz, as wirelead), i.e. a modelrocket's `igniter`, or dx dy dz (cm).
// set({ fire: 1 }) holds the button down (eased) and the lamp lights: 6 V through the igniter. World units: 1 = 1 cm.
// anchors: clips button
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 6, HY = 4, Z0 = 0.3, Z1 = 4.3, KEY = [-3.2, -0.4], LAMP = [0.2, -0.6], BTN = [3.3, -0.4], OUT = [-HX - 0.9, 0, 2.2];
  const RED = ISO.tint("#e5584a", ["#a8382a", "#b9412f", "#c94a38", "#d85443"], "#5e1a12");
  const Zf = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const top = (P, x, y, text, size = 0.38, c = "#3c3f45") => window.LAB.faceText(P, [x, y, Z1 + 0.01], [1, 0, 0], text, size, c, [0, -1, 0]);

  function caseSvg(P) {
    const LAB = window.LAB, plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: 0.7 }, out = [`<path class="iso-halo" d="${K.haloOf(plan, 0, 0.02, P)}"/>`];
    out.push(ISO.tinted(ISO.T.rubber, K.corners(plan, 1).map(([x, y]) => S(K.cylinder(x, y, 0.5, 0, Z0, P, 14), { tone: "lo" })).join("")));
    out.push(`<g data-name="case">${ISO.tinted(ISO.T.amber, S(K.slabOf(plan, Z0, Z1 - Z0, P, 4, 0.35), { tone: "mid", inner: K.lineSvg(K.sideSeam(plan, Z0 + 1.1, P, 4), { tone: "faint" }) }))}`);
    out.push(D(K.corners(plan, 0.6).map(([x, y]) => K.iso([x, y, Z1], P)), { size: 0.35, tone: "lo" }));
    out.push(top(P, KEY[0], 2.0, "SAFETY KEY"), top(P, LAMP[0], 2.0, "CONTINUITY"), top(P, BTN[0], 2.0, "LAUNCH", 0.42, "#8f2a22"));
    out.push(LAB.faceText(P, [0, HY + 0.02, 2.6], [1, 0, 0], "LAUNCH CONTROLLER · 6 V", 0.5, "#6b5114"), LAB.faceText(P, [0, HY + 0.02, 1.8], [1, 0, 0], "keep 5 m back · remove key to make safe", 0.3, "#6b5114"));
    // the strain relief out of the −x end, a rubber sleeve along −x
    out.push(ISO.tinted(ISO.T.rubber, S(G.solidOf([[0, 0.5], [0.9, 0.3]], G.frameOf([-HX, 0, OUT[2]], [-1, 0, 0], [0, 1, 0], [0, 0, 1]), P, { steps: 18 }), { tone: "mid" })), "</g>");
    // the safety key: its brass lock barrel, the key's shank and its flat head standing up out of it
    out.push(`<g data-name="key">${ISO.tinted(ISO.T.brass, S(K.cylinder(KEY[0], KEY[1], 0.9, Z1, 0.35, P, 24, 0.1), { tone: "mid" }) + S(K.cylinder(KEY[0], KEY[1], 0.25, Z1 + 0.35, 0.4, P, 12), { tone: "mid" }) +
      ISO.wbox(P, [KEY[0] - 0.8, KEY[0] + 0.8], [KEY[1] - 0.1, KEY[1] + 0.1], [Z1 + 0.75, Z1 + 2.0], "mid"))}${D([K.iso([KEY[0], KEY[1] + 0.11, Z1 + 1.6], P)], { size: 0.4, tone: "lo" })}</g>`);
    return out.join("");
  }
  // the cable from the strain relief, along the ground, up to the split sleeve; the two leads up to their clips
  function cableSvg(P, E) {
    const B27 = window.B27, sp = [E[0], E[1], E[2] - 3.4], out = [];
    out.push(`<g data-name="cable">${B27.cableSvg(P, B27.cable(OUT, [-1, 0, 0], [sp[0], sp[1], sp[2] - 0.6], [0, 0, -1], 0.5, 0.25), 0.42)}` +
      ISO.tinted(ISO.T.rubber, S(G.disc(-0.7, 0.3, 0.32, Zf(sp), P, { steps: 14 }), { tone: "mid" })));
    for (const [sx, col] of [[-0.35, window.CIRC.LEAD.red], [0.35, window.CIRC.LEAD.black]]) {
      const b = [E[0] + sx, E[1], E[2] - 1.9], pts = [];
      for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push([sp[0] + sx * 0.4 + (b[0] - sp[0] - sx * 0.4) * t, sp[1], sp[2] + 0.3 + (b[2] - sp[2] - 0.3) * t]); }
      out.push(B27.cableSvg(P, pts, 0.16, col));
    }
    out.push("</g>");
    // the micro clips: a coloured boot, two steel jaws biting at the lead's end (E ± 0.35 cm along x)
    out.push(`<g data-name="clips">`);
    for (const [sx, c] of [[-0.35, "red"], [0.35, "black"]]) {
      const x = E[0] + sx;
      out.push(ISO.tinted(window.CIRC.leadTint(c), S(G.solidOf([[-1.95, 0.12], [-1.7, 0.22, 1], [-0.95, 0.2]], Zf([x, E[1], E[2]]), P, { steps: 14 }), { tone: "mid" })));
      out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 0.1, x + 0.1], [E[1] - 0.16, E[1] - 0.04], [E[2] - 1.0, E[2] + 0.05], "mid") + ISO.wbox(P, [x - 0.1, x + 0.1], [E[1] + 0.04, E[1] + 0.16], [E[2] - 1.0, E[2] + 0.05], "mid")));
    }
    out.push("</g>");
    return out.join("");
  }

  ISO.add({
    name: "launchcontroller", title: "Rocket launch controller (part)", compare: null,
    about: "A model rocket launch controller: a box with a safety key, a continuity lamp and a red launch button, its cable running to two micro clips on the rocket's igniter (to=); fire=1 presses the button and lights the lamp. anchors: clips button",
    line: "launchcontroller cx cy k to=<id>.<anchor> dx=-200..200 dy=-200..200 dz=-200..200 fire=0|1 lab=0 lit=case|key|lamp|button|cable|clips",
    demo: { line: "launchcontroller 620 330 22 dx=-14 dy=-3 dz=9", script: [{ set: {}, hold: 1 }, { set: { lit: "key" }, hold: 1.2 }, { set: { fire: 1, lit: "button" }, hold: "settle" }, { set: { lit: "clips" }, hold: 1.2 }, { set: { fire: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, B27 = window.B27;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const E = B27.endOf(P, o, [-14, -3, 9]), st = { p: o.fire === "1" ? 1 : 0 }, want = { p: st.p };
      let lit = o.lit || "";
      // the cable and clips go first when they run behind the box (−y), else after it
      const cab = cableSvg(P, E), back = E[1] < -HY;
      g.innerHTML = (back ? cab : "") + caseSvg(P) + `<g data-name="lamp" data-part="lamp"></g><g data-name="button" data-part="button"></g>` + (back ? "" : cab) +
        (lab ? LAB.word(P, lab, [HX + 0.5, HY, Z1], "launch controller", "#556", { anchor: "start", dy: 14 }) : "");
      g.anchors = { clips: E, button: [BTN[0], BTN[1], Z1 + 1] };
      const el = LAB.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.p * 20) / 20;
        w.rebuild(el.lamp, String(q), () => {
          const c = K.iso([LAMP[0], LAMP[1], Z1 + 0.35], P), r = G.scaleOf(P);
          const lens = ISO.tint(LAB.mix("#7a3a1c", "#ffd34d", q), [LAB.mix("#5a2a14", "#e8902a", q), LAB.mix("#6a3018", "#f0a63a", q), LAB.mix("#7a3a1c", "#f6bd4e", q), LAB.mix("#86421f", "#fbd060", q)], "#3a1c0c");
          return ISO.tinted(ISO.T.steel, S(K.cylinder(LAMP[0], LAMP[1], 0.75, Z1, 0.3, P, 24, 0.1), { tone: "mid" })) + ISO.tinted(lens, S(G.sphereOf([LAMP[0], LAMP[1], Z1 + 0.3], 0.5, P, { steps: 24 }), { tone: "mid" })) +
            (q > 0.02 ? `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(r * 1.6).toFixed(1)}" fill="#ffd34d" opacity="${(0.35 * q).toFixed(2)}"/><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(r * 0.8).toFixed(1)}" fill="#fff6cc" opacity="${(0.5 * q).toFixed(2)}"/>` : "");
        });
        w.rebuild(el.button, String(q), () => ISO.tinted(ISO.T.steel, S(K.cylinder(BTN[0], BTN[1], 1.3, Z1, 0.35, P, 32, 0.1), { tone: "mid" })) +
          ISO.tinted(RED, S(K.cylinder(BTN[0], BTN[1], 0.95, Z1 + 0.35, 0.75 - 0.4 * q, P, 28, 0.15), { tone: "hi" })));
        B27.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fire !== undefined) want.p = String(p.fire) === "1" ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        st.p = ISO.follow(st.p, want.p, dt, 0.12, ISO.still());
        if (Math.abs(st.p - want.p) < 0.01) st.p = want.p;
        draw();
        return st.p !== want.p;
      };
      g.readout = () => (want.p ? "launch controller · key in, button held · 6 V through the igniter, lamp on · the igniter heats and lights the motor" : "launch controller · safety key in · press LAUNCH to fire: the lamp lights while current runs through the igniter");
      draw();
      return g;
    },
  });
})();
