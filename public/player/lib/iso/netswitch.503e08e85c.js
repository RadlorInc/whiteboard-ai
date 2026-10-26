// "netswitch cx cy k on=0|1 lab=0 lit=chassis|ports|ears|lights" — a PART (batch 6): a 1U network switch, 48.3 cm
// across the ears, 25 cm deep, 4.4 cm tall. Its origin is the middle of its bottom edge at the front mounting face, so
// `at=rack.front az=<U × 4.445>` racks it. 24 network ports in two rows of twelve (in two blocks of six), each with its
// link light above it, four uplink cages, a blue console port, power and health lights, rack ears with screw slots.
// Reused from server.js (its switch). The link lights flicker with traffic while on=1. World units: 1 = 1 cm (mm build).
(() => {
  const K = window.K;
  const H = 44.45, BACK = -250, CW = 220;
  ISO.add({
    name: "netswitch", title: "Network switch (part)", compare: null,
    about: "A 1U network switch: 24 network ports with link lights, four uplink cages, a console port and rack ears; the link lights flicker with traffic. Origin: front mounting face, bottom middle. anchors: top",
    line: "netswitch cx cy k on=0|1 lab=0 lit=chassis|ports|ears|lights",
    demo: { line: "netswitch 480 300 14", script: [{ set: {}, hold: 1.5 }, { set: { lit: "ports" }, hold: 1.4 }, { set: { lit: "lights" }, hold: 1.4 }, { set: { on: 0, lit: "" }, hold: 1.2 }, { set: { on: 1, lit: "ears" }, hold: 1.4 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B38, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", V = B.view(P);
      const st = { on: o.on !== "0", t: 0 }, f = B.front(V, "switch");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -24.15, y: -25, w: 48.3, d: 25.3, r: 1 }, 0, 0.02, P)}"/>` +
        `<g data-name="chassis">${V.box([BACK, 0], [-CW, CW], [0.7, H - 0.7], "mid", T.C.dark)}${T.L(V.top([-60, -CW], [-60, CW], H - 0.7), { tone: "faint" })}</g>` +
        `<g data-name="ports">${f.s}</g><g data-name="ears">${B.ears(V, 1, false, T.C.dark)}</g>` +
        `<g data-name="lights" data-part="leds"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), blink = B.lights(V, el.leds, f.L, () => st.on);
      if (lab) el.words.innerHTML = ISO.word(V.iso([0, -CW, H + 8]), "network switch", "#444", { size: 13, anchor: "start" }) + ISO.word(V.iso([0, -50, -4]), "24 ports", "#444", { size: 13, dy: 18 }) + ISO.word(V.iso([0, 207, -4]), "console", "#444", { size: 13, dy: 18 });
      g.anchors = { top: [0, -12.5, H / 10] };
      let lit = o.lit || "";
      const draw = () => { blink(ISO.still() ? 0 : st.t); LAB.light(w, g, lit); };
      g.set = (p) => { if (p.on !== undefined) st.on = !!+p.on; if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => { st.t += dt; draw(); return st.on && !ISO.still(); };
      g.readout = () => `network switch · 24 ports, 4 uplinks, a console port · ${st.on ? "link lights flicker as data passes" : "off"}`;
      draw();
      return g;
    },
  });
})();
