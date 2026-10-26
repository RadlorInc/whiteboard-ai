// "server1u cx cy k slide=0..1 on=0|1 lab=0 lit=chassis|drives|fans|cpu|ram|riser|psu|rails|lights" — a PART (batch 6):
// a 1U rack server with its lid off, 48.3 cm across the ears, 70 cm deep, 4.4 cm tall, on telescopic rails. Its origin
// is the middle of its bottom edge at the front mounting face (where the ears meet a rack's posts), so
// `at=rack.front az=<U × 4.445>` racks it. Inside, front to back: eight drive bays with status lights and the control
// panel, the drive cage and its backplane, a wall of seven fans, two processors under finned heatsinks with twelve
// memory sticks round each, a riser card, and two power supplies at the back. slide 0 → 1 pulls it 65 cm out on its
// rails (the outer rail stays, the middle rail goes half as far), on a slow eased follow; the lights blink while on=1.
// Reused from server.js (its open server). World units: 1 = 1 cm (built in mm with B38.view).
(() => {
  const K = window.K;
  const F = 350, BACK = -300, CW = 220, OUT = 650, SY = 700 / 650;   // server.js's numbers; SY stretches 65 → 70 cm
  ISO.add({
    name: "server1u", title: "1U rack server (part)", compare: null,
    about: "A 1U rack server with its lid off: drive bays and status lights at the front, drive cage and backplane, seven fans, two processors under heatsinks with twelve memory sticks each, a riser card and two power supplies at the back; slides out on its telescopic rails. Origin: front mounting face, bottom middle. anchors: front top",
    line: "server1u cx cy k slide=0..1 on=0|1 lab=0 lit=chassis|drives|fans|cpu|ram|riser|psu|rails|lights",
    demo: { line: "server1u 470 300 8", script: [{ set: {}, hold: 1.5 }, { set: { slide: 1 }, hold: 4.5 }, { set: { lit: "cpu" }, hold: 1.4 }, { set: { lit: "ram" }, hold: 1.4 }, { set: { lit: "fans" }, hold: 1.4 }, { set: { lit: "psu" }, hold: 1.4 }, { set: { lit: "rails", on: 0 }, hold: 1.4 }, { set: { lit: "", on: 1, slide: 0 }, hold: 4 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B38, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const Vf = B.view(P), V = B.view(P, -F, SY), box = V.box, z = (v) => v;
      const items = [], put = (c, svg) => items.push({ k: V.depth(c), svg });
      // the wall of fans, each in its frame with a rotor disc and hub
      const fan = (y0) => {
        const c = [260.05, y0 + 28, z(22.5)], ring = (r) => K.pathOf(Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return V.iso([c[0], c[1] + r * Math.cos(a), c[2] + r * Math.sin(a)]); }), true);
        const spokes = [0, 1, 2, 3].map((i) => { const a = (i / 4) * Math.PI * 2 + 0.4; return K.pathOf([V.iso([c[0] + 0.1, c[1] + 6 * Math.cos(a), c[2] + 6 * Math.sin(a)]), V.iso([c[0] + 0.1, c[1] + 18 * Math.cos(a + 0.5), c[2] + 18 * Math.sin(a + 0.5)])]); }).join("");
        return box([220, 260], [y0, y0 + 56], [z(2.5), z(42)], "mid", T.C.black) + `<path d="${ring(18)}" fill="#2a2d31" stroke="#0d0e10" stroke-width=".6"/><path d="${spokes}" stroke="#4a4f57" stroke-width=".6"/><path d="${ring(6)}" fill="#4a4f57" stroke="#0d0e10" stroke-width=".5"/>`;
      };
      put([250, 0, z(20)], `<g data-name="fans">${[0, 1, 2, 3, 4, 5, 6].map((i) => fan(-210 + i * 60)).join("")}</g>`);
      put([279, 0, z(20)], `<g data-name="drives">${box([278, 281], [-210, 210], [z(2.5), z(40)], "lo", T.C.pcb)}</g>`);   // the backplane
      const heatsink = (yc) => {
        const fins = [];
        for (let i = 0; i < 18; i++) { const y = yc - 44 + i * 5.1; fins.push(box([25, 115], [y, y + 1.2], [z(10), z(38)], "hi", T.C.alu)); }
        return box([28, 112], [yc - 42, yc + 42], [z(4), z(5.6)], "mid", T.C.chip) + box([25, 115], [yc - 45, yc + 45], [z(5.6), z(10)], "mid", T.C.copper) + fins.join("");
      };
      for (const yc of [-110, 110]) put([70, yc, z(20)], `<g data-name="cpu">${heatsink(yc)}</g>`);
      const dimm = (y) => box([2, 140], [y - 2.5, y + 2.5], [z(4), z(9)], "mid", T.C.black) + box([5, 137], [y - 0.7, y + 0.7], [z(9), z(35)], "hi", T.C.pcbDark);
      for (const yc of [-110, 110]) for (const side of [-1, 1]) for (let i = 0; i < 6; i++) { const y = yc + side * (52 + i * 8.6); put([70, y, z(18)], `<g data-name="ram">${dimm(y)}</g>`); }
      put([-170, 130, z(20)], `<g data-name="riser">${box([-200, -190], [70, 200], [z(4), z(24)], "mid", T.C.black)}${box([-280, -110], [70, 200], [z(24), z(25.6)], "lo", T.C.pcb)}${box([-230, -180], [110, 160], [z(25.6), z(27)], "mid", T.C.chip)}</g>`);
      for (const y of [[-214, -146], [-142, -74]]) put([-210, (y[0] + y[1]) / 2, z(20)], `<g data-name="psu">${box([BACK - 6, BACK], [y[0] + 20, y[0] + 48], [z(12), z(32)], "hi", T.C.dark)}${box([BACK, -120], y, [z(2.5), z(41)], "mid", T.C.alu)}${T.L(V.top([-130, y[0]], [-130, y[1]], z(41)), { tone: "faint" })}</g>`);
      items.sort((a, b) => a.k - b.k);
      const fr = B.front(Vf, "server");
      // chassis floor and far wall, the board (cut round the power supplies), the parts, the drive cage, the near wall
      const chassis = `<g data-name="chassis">${box([BACK, F], [-CW, CW], [z(0.5), z(2.5)], "lo", T.C.alu)}${box([BACK, F], [-CW, -CW + 1.5], [z(2.5), z(43)], "mid", T.C.alu)}` +
        `${box([BACK + 10, -115], [-70, 215], [z(2.5), z(4)], "lo", T.C.pcb)}${box([-115, 210], [-215, 215], [z(2.5), z(4)], "lo", T.C.pcb)}</g>` + items.map((i) => i.svg).join("") +
        `<g data-name="drives">${box([290, F], [-218.5, 218.5], [z(2.5), z(43)], "mid", T.C.dark)}${fr.s}</g>` +
        `<g data-name="chassis">${box([BACK, 290], [CW - 1.5, CW], [z(2.5), z(43)], "mid", T.C.alu)}</g>`;
      // telescopic rails each side: inner (on the chassis, moves), middle (moves half), outer (stays)
      const rail = (s, which) => {
        const y = (a, b) => (s > 0 ? [a, b] : [-b, -a]);
        if (which === 0) return box([BACK, F], y(220.2, 221.7), [15, 29], "mid", T.C.steel);
        if (which === 1) return box([-330 + 20, 330], y(221.7, 223.2), [13, 31], "mid", T.C.steel);
        return box([BACK, F - 2], y(223.2, 224.7), [11, 33], "lo", T.C.steel);
      };
      const mv = (f, svg) => `<g data-move="${f}">${svg}</g>`;
      g.innerHTML = mv(1, `<path class="iso-halo" d="${K.haloOf({ x: -24.15, y: -70, w: 48.3, d: 70.3, r: 1 }, 0, 0.02, P)}"/>`) +
        `<g data-name="rails">${rail(-1, 2)}${mv(0.5, rail(-1, 1))}${mv(1, rail(-1, 0))}</g>` +
        mv(1, chassis + `<g data-name="lights" data-part="leds"></g>`) +
        `<g data-name="rails">${mv(1, rail(1, 0))}${mv(0.5, rail(1, 1))}${rail(1, 2)}</g>` +
        mv(1, `<g data-name="chassis">${B.ears(Vf, 1, true, T.C.alu)}</g><g data-part="words"></g>`) + `<g data-part="still"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), movers = [...g.querySelectorAll("[data-move]")];
      const st = { slide: ISO.clamp(ISO.num(o, "slide", 0), 0, 1), want: 0, on: o.on !== "0", t: 0 };
      st.want = st.slide;
      let lit = o.lit || "";
      const blink = B.lights(Vf, el.leds, fr.L, () => st.on);
      if (lab) {
        const wd = (p, s, opt) => ISO.word(V.iso(p), s, "#444", { size: 13, ...opt });
        el.words.innerHTML = wd([F, -CW, 52], "drive bays", { anchor: "end", dy: -6 }) + wd([240, -CW, 44], "fans", { anchor: "end", dy: -8 }) +
          wd([70, -110, 40], "processors under heatsinks", { anchor: "end", dy: -26 }) + wd([70, 190, 37], "memory", { anchor: "start", dy: -14 }) + wd([-210, -180, 43], "power supplies", { dy: -12 });
        el.still.innerHTML = wd([0, CW + 4, 11], "rails", { anchor: "start", dy: 16 });
      }
      g.anchors = { front: [0, 0, 2.2], top: [0, -35, 4.445] };
      const draw = () => {
        for (const m of movers) w.attr(m, "transform", V.move(OUT * st.slide * +m.dataset.move));
        blink(ISO.still() ? 0 : st.t);
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.slide !== undefined) st.want = ISO.clamp(+p.slide, 0, 1);
        if (p.on !== undefined) st.on = !!+p.on;
        if (p.lit !== undefined) lit = p.lit;
      };
      // about 15 kg on ball-bearing rails: a slow eased follow
      g.update = (dt) => {
        st.t += dt;
        st.slide = ISO.follow(st.slide, st.want, dt, 0.55, ISO.still());
        draw();
        return (st.on && !ISO.still()) || st.slide !== st.want;
      };
      g.readout = () => `1U server, lid off · ${st.slide > 0.02 ? `pulled out ${Math.round(st.slide * 65)} cm on its rails` : "in its rails"} · 8 drives, 7 fans push air back over 2 processors and 24 memory sticks, 2 power supplies (if one fails the other carries on)`;
      draw();
      return g;
    },
  });
})();
