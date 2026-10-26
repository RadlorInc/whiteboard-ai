// "pushswitch cx cy k on=0|1 lab=0 lit=base|button|terminals" — a PART (PARTS.md, batch 5): a school push-button
// switch on a small base 4 × 4 cm, origin the bench point under the base's middle. A moulded black base 1 cm thick
// with a screwed brass strip from each terminal post to the switch; the switch is a chrome bezel nut on a short
// body and a red push cap. on=1: the cap is held down 3.5 mm and the contacts inside close (a press-to-make switch);
// on=0 its spring pushes it back up. set({ on }) presses or lets go (eased). Anchors a (left post) and b (right post):
// the caps' tops, where a lead clips on. Built from the electromagnet scene's switch. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const BASE = { x: -2, y: -2, w: 4, d: 4, r: 0.35 }, BH = 1, PX = 1.25, PY = -1.05, SY = 0.55, TRAVEL = 0.35;
  const BLACK = ISO.tint("#5a5d63", ["#26282c", "#2f3236", "#393c41", "#45484d"], "#111214");

  ISO.add({
    name: "pushswitch", title: "Push-button switch (part)", compare: null,
    about: "A press-to-make push-button switch on a small black base 4 × 4 cm with two terminal posts: on=1 the red cap is pressed down and the circuit is closed, on=0 it springs back up and the circuit is open. anchors: a b",
    line: "pushswitch cx cy k on=0|1 lab=0 lit=base|button|terminals",
    demo: { line: "pushswitch 480 360 60 on=0", script: [{ set: {}, hold: 1 }, { set: { on: 1, lit: "button" }, hold: "settle" }, { set: { lit: "terminals" }, hold: 1 }, { set: { on: 0, lit: "base" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const a = CIRC.post(P, [-PX, PY, BH], {}), b = CIRC.post(P, [PX, PY, BH], {});
      const out = [`<path class="iso-halo" d="${K.haloOf(BASE, 0, BH, P)}"/>`];
      out.push(`<g data-name="base">${ISO.tinted(BLACK, S(K.slabOf(BASE, 0, BH, P, 4, 0.12), { tone: "mid", inner: L(K.sideSeam(BASE, 0.25, P, 4), { tone: "faint" }) }))}`);
      // "PUSH" moulded into the top, in front of the switch
      out.push(LAB.faceText(P, [0, 1.55, BH + 0.005], [1, 0, 0], "PUSH", 0.34, "#8a8d93", [0, -1, 0]), "</g>");
      // the brass strips: from each post in to the switch body, two screws each
      out.push(`<g data-name="terminals">${CIRC.strip(P, [-PX, PY], [-PX, SY], BH, 0.42)}${CIRC.strip(P, [-PX, SY], [-0.55, SY], BH, 0.42)}${CIRC.strip(P, [PX, PY], [PX, SY], BH, 0.42)}${CIRC.strip(P, [0.55, SY], [PX, SY], BH, 0.42)}`);
      for (const x of [-PX, PX]) out.push(CIRC.screw(P, [x, SY, BH + 0.04], 0.15, x > 0 ? 0.4 : 1.1));
      out.push(a.svg, b.svg, "</g>");
      // the switch: body, a chrome hex nut on its thread, the bezel ring the cap rides in
      out.push(`<g data-name="button">${ISO.tinted(BLACK, S(K.cylinder(0, SY, 0.62, BH, 0.45, P, 24), { tone: "mid" }))}`);
      out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, SY, 0.78, BH + 0.45, 0.28, P, 6), { tone: "mid" }) + S(K.cylinder(0, SY, 0.6, BH + 0.73, 0.16, P, 28, 0.04), { tone: "hi" })));
      out.push(`<g data-part="cap"></g></g><g data-part="words"></g>`);
      g.innerHTML = out.join("");
      g.anchors = { a: a.top, b: b.top };
      const el = LAB.parts(g), w = ISO.writer();
      const s = { on: o.on === "1" ? 1 : 0, p: o.on === "1" ? 1 : 0 };
      let lit = o.lit || "";
      // a closed ring printed on a flat top (the cap's dish, the bezel's bore)
      const ring = (r, z, c) => `<path d="${G.circleOf(LAB.Z([0, SY, z]), 0, r, P)}" fill="none" stroke="${c}" stroke-width="0.7" opacity=".8"/>`;
      const draw = () => {
        const q = Math.round(s.p * 40) / 40, z = BH + 0.89 - 0.02, hgt = 0.62 - TRAVEL * q;
        // the cap: a red plunger with a dished top; pressed, it sinks into the bezel
        w.rebuild(el.cap, String(q), () => ISO.tinted(ISO.T.red, S(K.cylinder(0, SY, 0.4, z, hgt, P, 28, 0.06), { tone: "hi" })) + ring(0.28, z + hgt + 0.002, "#7a1a14"));
        w.rebuild(el.words, lab ? String(s.on) : "", () => (lab ? CIRC.word(P, [PX + 0.6, 0, BH], s.on ? "switch pressed: on" : "switch: off") : ""));
        B13.light(w, g, lit);
      };
      g.set = (p) => { if (p.on !== undefined) s.on = String(p.on) === "1" ? 1 : 0; if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => { s.p = ISO.follow(s.p, s.on, dt, s.on ? 0.06 : 0.09, ISO.still()); if (Math.abs(s.p - s.on) < 0.003) s.p = s.on; draw(); return s.p !== s.on; };
      g.readout = () => (s.on ? "push switch pressed · contacts closed: current flows" : "push switch released · contacts open: no current");
      draw();
      return g;
    },
  });
})();
