// "server cx cy height slide=0..1 lab=1 lit=drives|fans|cpu|ram|psu|rails|switch" — a server rack.
// An open 19-inch rack on four feet (posts with mounting holes every U, a plinth and a top panel) holding, from the
// bottom: a 2U storage server with twelve 3.5" drive bays, four 1U servers with eight drive bays and status lights,
// a blanking plate and a 24-port network switch. One 1U server slides out on its telescopic rails (slide=1) with
// its lid off: the drive cage and backplane at the front, the wall of seven fans, two processors under their finned
// heatsinks with twelve memory sticks round each, a riser card, and two power supplies at the back. Every front's
// status lights blink with disk and network activity. set({ slide, lit }). 1 unit = 1 mm (1U = 44.45 mm).
(() => {
  const K = window.K, T = window.TECH;
  const F = 350, RX = -350, PY = 250, PW = 30, U = 44.45, Z0 = 100, NU = 12, TOP = NU * U + Z0, OUT = 650, BACK = -300, CW = 220;
  // what is in the rack, bottom up: [first U, height in U, kind]
  const UNITS = [[0, 2, "storage"], [2, 1, "server"], [3, 1, "server"], [4, 1, "open"], [5, 1, "server"], [6, 1, "server"], [7, 1, "server"], [8, 1, "blank"], [9, 1, "switch"], [10, 1, "patch"], [11, 1, "blank"]];
  const uz = (u) => Z0 + u * U;

  ISO.add({
    name: "server", title: "Server rack", compare: "server 480 270 400",
    about: "A server rack: servers, storage and a network switch stacked in an open 19-inch frame; one server slides out on its rails with its lid off to show drives, fans, processors, memory and power supplies.",
    line: "server cx cy height slide=0..1 lab=1 lit=drives|fans|cpu|ram|psu|rails|switch",
    demo: { line: "server 480 270 400", script: [{ set: {}, hold: 1.2 }, { set: { slide: 1 }, hold: 4.5 }, { set: { lit: "cpu" }, hold: 1.6 }, { set: { lit: "", slide: 0 }, hold: 4 }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.1, H = size * 1.32;
      const { P, g } = ISO.frame([[RX, -PY - PW, 0], [F, -PY - PW, 0], [RX, PY + PW, 0], [F + OUT + 16, PY, uz(4)], [F + OUT + 16, -CW, uz(4)], [RX, -PY - PW, TOP + 30], [F, PY + PW, TOP + 30], [F, -PY - PW, TOP + 30]], cx, cy, W, H, { azimuth: 24, elevation: 24, pad: size * 0.04 }, parent);
      const box = (x, y, z, tone = "mid", c = T.C.dark, lit = false) => T.box(P, x, y, z, tone, c, lit), depth = (p) => K.depthOf(p, P), out = [];
      const fq = (x, y0, y1, z0, z1, fill, stroke = "#16191d", w = 0.5) => T.quad(P, [[x, y0, z0], [x, y1, z0], [x, y1, z1], [x, y0, z1]], fill, stroke, w);
      const post = (x, y, z0, z1) => box([x, x + PW], [y, y + PW], [z0, z1], "mid", T.C.dark);
      // ── feet, plinth, the two far posts and the near rear post (all behind the equipment)
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: RX, y: -PY - PW, w: F - RX, d: 2 * (PY + PW), r: 8 }, 0, 60, P)}"/>`);
      const feet = [[RX + 30, -PY - 10], [F - 30, -PY - 10], [RX + 30, PY + 10], [F - 30, PY + 10]].sort((a, b) => depth([...a, 0]) - depth([...b, 0]));
      for (const [x, y] of feet) out.push(T.cyl(P, x, y, 22, 0, 12, "lo", T.C.rubber, 24), T.cyl(P, x, y, 9, 12, 48, "mid", T.C.steel, 16));
      out.push(box([RX, F], [-PY - PW, PY + PW], [60, 90], "lo"));
      out.push(post(RX, -PY - PW, 90, TOP + 5), post(F - PW, -PY - PW, 90, TOP + 5), post(RX, PY, 90, TOP + 5));
      // mounting holes on the far front post's face, three per U
      const holes = (y) => { const p = []; for (let u = 0; u < NU; u++) for (const dz of [6.35, 22.2, 38.1]) p.push([F + 0.05, y, uz(u) + dz]); return p; };
      out.push(T.dot(P, holes(-PY - PW / 2), 0.55, "lo"));
      // the near front post is drawn in slices, one per unit, so each unit's ears land in front of it
      const nearPost = (z0, z1) => box([F - PW, F], [PY, PY + PW], [z0, z1], "mid", T.C.dark) + T.dot(P, holes(PY + PW / 2).filter((p) => p[2] > z0 && p[2] < z1), 0.55, "lo");
      out.push(nearPost(90, Z0));
      const ears = (u0, h, handle) => [-1, 1].map((s) => {
        const y = s > 0 ? [CW, PY + 12] : [-PY - 12, -CW];
        return box([F, F + 3], y, [u0 + 1.5, u0 + h * U - 1.5], "mid", T.C.alu) + (handle ? box([F + 3, F + 14], s > 0 ? [CW + 9, CW + 17] : [-CW - 17, -CW - 9], [u0 + 7, u0 + h * U - 7], "hi", T.C.alu) : "");
      }).join("");
      // ── the fronts: drive bays, control panels, ports; every light is a small window rebuilt as it blinks
      const leds = [];                                                      // { el, list: [[x, y0, y1, z0, z1, kind]] }
      const front = (kind, u0, h, x = F + 0.05) => {
        const s = [], L = [];
        if (kind === "storage") for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
          const y0 = -205 + c * 102, z0 = u0 + 6 + r * 27;
          s.push(fq(x, y0, y0 + 98, z0, z0 + 24.5, "#5a6068"), fq(x, y0 + 6, y0 + 70, z0 + 8, z0 + 16, "#3a3e44", "#16191d", 0.4));
          L.push([x, y0 + 84, y0 + 92, z0 + 10, z0 + 14, "disk"]);
        }
        if (kind === "server" || kind === "open") for (let c = 0; c < 8; c++) {
          const y0 = -210 + c * 41;
          s.push(fq(x, y0, y0 + 38, u0 + 5, u0 + 39, "#5a6068"), fq(x, y0 + 5, y0 + 33, u0 + 9, u0 + 22, "#3a3e44", "#16191d", 0.4));
          L.push([x, y0 + 15, y0 + 23, u0 + 30, u0 + 34, "disk"]);
        }
        if (kind === "server" || kind === "open" || kind === "storage") { s.push(fq(x, 132, 214, u0 + 5, u0 + 39, "#4a4f57")); L.push([x, 140, 152, u0 + 26, u0 + 32, "power"], [x, 160, 172, u0 + 26, u0 + 32, "health"]); }
        if (kind === "switch" || kind === "patch") for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) {
          const y0 = -205 + c * 26 + Math.floor(c / 6) * 10, z0 = u0 + 6 + r * 17;
          s.push(fq(x, y0, y0 + 22, z0, z0 + 13, "#16191d", "#0d0e10"));
          if (kind === "switch") L.push([x, y0 + 2, y0 + 7, z0 + 13.6, z0 + 15.6, "port"]);
        }
        if (kind === "switch") for (let c = 0; c < 4; c++) s.push(fq(x, 130 + c * 21, 148 + c * 21, u0 + 14, u0 + 26, "#3a3e44"));
        if (kind === "blank") for (let c = 0; c < 9; c++) s.push(fq(F + 3.05, -190 + c * 44, -160 + c * 44, u0 + 12, u0 + 32, "#2f343a"));
        return { s: s.join(""), L };
      };
      const ledGroup = (L) => { const id = leds.length; leds.push({ L }); return `<g data-led="${id}"></g>`; };

      // ── the open server: chassis floor and walls, cage, backplane, fans, board, processors, memory, riser, power
      const openServer = (u0) => {
        const z = (v) => u0 + v, items = [], put = (c, svg) => items.push({ k: depth(c), svg });
        const fan = (y0) => {
          const c = [260.05, y0 + 28, z(22.5)], ring = (r) => K.pathOf(Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return K.iso([c[0], c[1] + r * Math.cos(a), c[2] + r * Math.sin(a)], P); }), true);
          return box([220, 260], [y0, y0 + 56], [z(2.5), z(42)], "mid", T.C.black) + `<path d="${ring(18)}" fill="#2a2d31" stroke="#0d0e10" stroke-width=".6"/><path d="${ring(6)}" fill="#4a4f57" stroke="#0d0e10" stroke-width=".5"/>`;
        };
        put([250, 0, z(20)], `<g data-name="fans">${[0, 1, 2, 3, 4, 5, 6].map((i) => fan(-210 + i * 60)).join("")}</g>`);
        put([279, 0, z(20)], box([278, 281], [-210, 210], [z(2.5), z(40)], "lo", T.C.pcb));
        const heatsink = (yc) => {
          const fins = [];
          for (let i = 0; i < 18; i++) { const y = yc - 44 + i * 5.1; fins.push(box([25, 115], [y, y + 1.2], [z(10), z(38)], "hi", T.C.alu)); }
          return box([28, 112], [yc - 42, yc + 42], [z(4), z(5.6)], "mid", T.C.chip) + box([25, 115], [yc - 45, yc + 45], [z(5.6), z(10)], "mid", T.C.copper) + fins.join("");
        };
        for (const yc of [-110, 110]) put([70, yc, z(20)], `<g data-name="cpu">${heatsink(yc)}</g>`);
        const dimm = (y) => box([2, 140], [y - 2.5, y + 2.5], [z(4), z(9)], "mid", T.C.black) + box([5, 137], [y - 0.7, y + 0.7], [z(9), z(35)], "hi", T.C.pcbDark);
        for (const yc of [-110, 110]) for (const side of [-1, 1]) for (let i = 0; i < 6; i++) { const y = yc + side * (52 + i * 8.6); put([70, y, z(18)], `<g data-name="ram">${dimm(y)}</g>`); }
        put([-170, 130, z(20)], box([-200, -190], [70, 200], [z(4), z(24)], "mid", T.C.black) + box([-280, -110], [70, 200], [z(24), z(25.6)], "lo", T.C.pcb) + box([-230, -180], [110, 160], [z(25.6), z(27)], "mid", T.C.chip));
        for (const y of [[-214, -146], [-142, -74]]) put([-210, (y[0] + y[1]) / 2, z(20)], `<g data-name="psu">${box([BACK, -120], y, [z(2.5), z(41)], "mid", T.C.alu)}${T.L(K.lineOnTop([-130, y[0]], [-130, y[1]], z(41), P), { tone: "faint" })}</g>`);
        items.sort((a, b) => a.k - b.k);
        // the board is cut round the two power supplies, which stand on the chassis floor
        const cage = `<g data-name="drives">${box([290, F], [-218.5, 218.5], [z(2.5), z(43)], "mid", T.C.dark)}${front("open", u0).s}</g>`;
        return box([BACK, F], [-CW, CW], [z(0.5), z(2.5)], "lo", T.C.alu) + box([BACK, F], [-CW, -CW + 1.5], [z(2.5), z(43)], "mid", T.C.alu) +
          box([BACK + 10, -115], [-70, 215], [z(2.5), z(4)], "lo", T.C.pcb) + box([-115, 210], [-215, 215], [z(2.5), z(4)], "lo", T.C.pcb) + items.map((i) => i.svg).join("") + cage +
          box([BACK, 290], [CW - 1.5, CW], [z(2.5), z(43)], "mid", T.C.alu) + box([BACK, F], [CW, CW + 8], [z(15), z(29)], "mid", T.C.steel);
      };

      // ── the units, bottom up
      for (const [u, h, kind] of UNITS) {
        const u0 = uz(u), top = u0 + h * U;
        if (kind === "open") {
          const f = front("open", u0);
          out.push(`<g data-part="slide">${openServer(u0)}${ledGroup(f.L)}</g>`);
          out.push(`<g data-part="mid" data-name="rails">${box([-330, 330], [CW + 8, CW + 16], [u0 + 15, u0 + 29], "mid", T.C.steel)}</g>`);
          out.push(`<g data-name="rails">${box([RX, F], [CW + 16, PY], [u0 + 13, u0 + 31], "mid", T.C.steel)}</g>`);
          out.push(nearPost(u0, top), `<g data-part="ears">${ears(u0, h, true)}</g>`);
          continue;
        }
        const f = front(kind, u0);
        const back = kind === "patch" ? F - 90 : kind === "switch" ? F - 300 : BACK;   // a patch panel is shallow, a switch half depth
        const body = kind === "blank" ? box([F, F + 3], [-PY - 12, PY + 12], [u0 + 0.5, top - 0.5], "mid", T.C.dark) : box([back, F], [-CW, CW], [u0 + 0.7, top - 0.7], "mid", kind === "switch" || kind === "patch" ? T.C.dark : T.C.alu);
        // a blanking plate bolts onto the posts' front faces, so it goes after this slice of the near post
        if (kind === "blank") { out.push(nearPost(u0, top), body, f.s); continue; }
        out.push(`<g data-name="${kind === "switch" ? "switch" : kind === "storage" ? "drives" : "unit"}">${body}${f.s}${ledGroup(f.L)}</g>`);
        out.push(nearPost(u0, top), ears(u0, h, kind !== "switch" && kind !== "patch"));
      }
      // the top frame: four rails on the posts, open in the middle
      out.push(box([RX, F], [-PY - PW, -PY], [TOP + 5, TOP + 30], "mid"), box([RX, RX + PW], [-PY, PY], [TOP + 5, TOP + 30], "mid"), nearPost(TOP, TOP + 5), box([F - PW, F], [-PY, PY], [TOP + 5, TOP + 30], "mid"), box([RX, F], [PY, PY + PW], [TOP + 5, TOP + 30], "mid"));
      out.push(`<g data-part="words"></g>`);
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      leds.forEach((l, i) => (l.el = g.querySelector(`[data-led="${i}"]`)));

      const st = { slide: ISO.clamp(ISO.num(o, "slide", 0), 0, 1), want: 0, t: 0, lit: o.lit || "" };
      st.want = st.slide;
      // each light's colour this blink step: power steady green, health blue, disks and ports flicker with traffic
      const colourOf = (kind, n, b) => {
        const busy = ((b * 2654435761 + n * 40503) >>> 9) % 4 !== 0;
        return kind === "power" ? T.LED.green : kind === "health" ? T.LED.blue : busy ? (kind === "port" ? T.LED.amber : T.LED.green) : T.LED.off;
      };
      const draw = () => {
        const b = Math.floor(st.t * 5);
        leds.forEach((l, i) => w.rebuild(l.el, String(b), () => l.L.map(([x, y0, y1, z0, z1, kind], n) => fq(x + 0.05, y0, y1, z0, z1, colourOf(kind, n + i * 31, b), "#16191d", 0.3)).join("")));
        w.attr(el.slide, "transform", K.translateAlong(P, [OUT * st.slide, 0, 0]));
        w.attr(el.ears, "transform", K.translateAlong(P, [OUT * st.slide, 0, 0]));
        w.attr(el.mid, "transform", K.translateAlong(P, [(OUT / 2) * st.slide, 0, 0]));
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        const out = st.slide > 0.6, dx = OUT * st.slide, u0 = uz(4);
        w.rebuild(el.words, lab ? `${out} ${out ? Math.round(st.slide * 60) : 0}` : "", () => !lab ? "" : (out ? [
          T.word(P, [F + dx, -CW, u0 + 22], "drive bays", { anchor: "start", dx: 14 }),
          T.word(P, [240 + dx, -CW, u0 + 42], "fans", { anchor: "start", dx: 10, dy: -8 }),
          T.word(P, [70 + dx, -110, u0 + 38], "processors under heatsinks", { anchor: "start", dx: 30, dy: -22 }),
          T.word(P, [70 + dx, 190, u0 + 35], "memory (RAM)", { anchor: "end", dx: -6, dy: -16 }),
          T.word(P, [-210 + dx, -180, u0 + 41], "power supplies", { dy: -12 }),
          T.word(P, [F + dx / 2, PY, u0 + 15], "slide rails", { anchor: "end", dx: -10, dy: 22 }),
        ] : [
          T.word(P, [F, -PY, uz(9.5)], "network switch", { anchor: "start", dx: 18 }),
          T.word(P, [F, -PY, uz(5.5)], "1U servers", { anchor: "start", dx: 18 }),
          T.word(P, [F, -PY, uz(1)], "storage server", { anchor: "start", dx: 18 }),
          T.word(P, [F, PY + PW, uz(2.5)], "status lights blink with activity", { anchor: "end", dx: -14 }),
        ]).join(""));
      };
      g.set = (p) => {
        if (p.slide !== undefined) st.want = ISO.clamp(+p.slide, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // A server weighs about 15 kg: it glides out on its ball-bearing rails on a slow eased follow.
      g.update = (dt) => {
        st.t += dt;
        st.slide = ISO.follow(st.slide, st.want, dt, 0.55, ISO.still());
        if (Math.abs(st.slide - st.want) < 0.001) st.slide = st.want;
        draw();
        return true;
      };
      g.readout = () => (st.slide > 0.6 ? "pulled out, lid off · 8 drives at the front, 7 fans push air back over 2 processors and 24 memory sticks, 2 power supplies at the back (if one fails the other carries on)"
        : `rack: 12U of gear in a 19-inch frame, 1U = 44.45 mm · ${st.slide > 0.02 ? "the server slides out on its rails" : "lights blink as disks and network ports work"}`);
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
