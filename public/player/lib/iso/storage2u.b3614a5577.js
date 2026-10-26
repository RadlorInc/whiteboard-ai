// "storage2u cx cy k on=0|1 lab=0 lit=chassis|drives|ears|lights" — a PART (batch 6): a 2U storage server, 48.3 cm
// across the ears, 70 cm deep, 8.9 cm tall. Its origin is the middle of its bottom edge at the front mounting face
// (where the ears meet a rack's posts), so `at=rack.front az=<U × 4.445>` racks it; standing loose it rests on its
// bottom there. Twelve 3.5" drive bays (3 rows of 4) with their pull latches and activity lights across its front,
// rack ears with lift handles and their screw slots, the power and health lights on the right ear. Reused from
// server.js (its 2U storage unit). Lights blink with disk activity while on=1. World units: 1 = 1 cm (built in mm).
(() => {
  const K = window.K;
  const H = 2 * 44.45, BACK = -700, CW = 220;
  ISO.add({
    name: "storage2u", title: "2U storage server (part)", compare: null,
    about: "A 2U rack storage server: twelve 3.5-inch drive bays with activity lights across its front, rack ears with handles; the lights blink with disk work. Origin: front mounting face, bottom middle. anchors: top",
    line: "storage2u cx cy k on=0|1 lab=0 lit=chassis|drives|ears|lights",
    demo: { line: "storage2u 500 300 8", script: [{ set: {}, hold: 1.5 }, { set: { lit: "drives" }, hold: 1.5 }, { set: { lit: "lights" }, hold: 1.2 }, { set: { on: 0, lit: "" }, hold: 1.2 }, { set: { on: 1, lit: "ears" }, hold: 1.5 }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B38, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", V = B.view(P);
      const st = { on: o.on !== "0", t: 0 }, f = B.front(V, "storage");
      // the right ear carries the power and health lights
      f.L.push([3.05, 235, 240, H - 22, H - 16, "power"], [3.05, 235, 240, H - 32, H - 26, "health"]);
      const halo = { x: -24.15, y: -70, w: 48.3, d: 70.3, r: 1 };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, 0, 0.02, P)}"/>` +
        `<g data-name="chassis">${V.box([BACK, 0], [-CW, CW], [0.7, H - 0.7], "mid", T.C.alu)}${T.L(V.top([-160, -CW], [-160, CW], H - 0.7), { tone: "faint" })}` +
        `${V.fq(-0.05, -CW, CW, 1.5, 3.5, "#3a3e44", "#16191d", 0.3)}</g>` +
        `<g data-name="drives">${f.s}</g><g data-name="ears">${B.ears(V, 2, true, T.C.alu)}</g>` +
        `<g data-name="lights" data-part="leds"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), blink = B.lights(V, el.leds, f.L, () => st.on);
      if (lab) el.words.innerHTML = ISO.word(V.iso([0, -CW, H + 8]), "2U storage server", "#444", { size: 13, anchor: "start" }) + ISO.word(V.iso([0, 120, -6]), "12 drive bays", "#444", { size: 13, dy: 18 });
      g.anchors = { top: [0, -35, H / 10] };
      let lit = o.lit || "";
      const draw = () => { blink(ISO.still() ? 0 : st.t); LAB.light(w, g, lit); };
      g.set = (p) => { if (p.on !== undefined) st.on = !!+p.on; if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => { st.t += dt; draw(); return st.on && !ISO.still(); };
      g.readout = () => `2U storage server · 12 × 3.5-inch drives · 8.9 cm tall (2U = 2 × 4.445 cm) · ${st.on ? "lights blink as the disks work" : "off"}`;
      draw();
      return g;
    },
  });
})();
