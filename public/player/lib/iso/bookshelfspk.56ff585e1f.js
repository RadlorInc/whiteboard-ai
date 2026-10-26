// "bookshelfspk cx cy k cut=0..1 play=0|1 lab=0 lit=cabinet|baffle|woofer|tweeter|port|magnet|coil|cone|spider|crossover"
// — a PART (PARTS.md, batch 6): the two-way loudspeaker of speaker.js as a bookshelf speaker standing on a shelf or a
// table, its origin the surface point under its middle, 20 × 25 × 34 cm, the front toward the room (+y). Walls of
// 18 mm MDF in wood veneer on four rubber feet, a black baffle carrying the 16.5 cm woofer (wooferunit), the dome
// tweeter (tweeterunit) and the flared bass port. cut=1 takes the near half (+x) away: the woofer cut through its
// middle (basket, cone and dust cap, the voice coil in the magnet's gap, the spider, the ferrite magnet), the port
// tube, the tweeter's magnet and the crossover board on the back wall. play=1 drives the cone in and out and sound
// rings spread from it. set({ cut, play }). Built in mm from its front face (y = 0); anchors in cm.
(() => {
  const K = window.K, G = window.G;
  const XW = 100, YB = -250, Z0 = 10, ZT = 340, WALL = 18, BAF = -18;   // half width, back, floor, top
  const ZW = 152, ZTW = 287, ZP = 42, HOLE = { w: 72, t: 27, p: 23 };   // woofer, tweeter and port centres, cut-outs

  ISO.add({
    name: "bookshelfspk", title: "Bookshelf speaker (part)", compare: null,
    about: "A two-way bookshelf loudspeaker: wood cabinet on rubber feet, black baffle with the woofer, the dome tweeter and the bass port; cut away the near half to see the woofer's magnet, voice coil and spider, the port tube and the crossover; play it and the cone pumps sound waves. anchors: top woofer tweeter port",
    line: "bookshelfspk cx cy k cut=0..1 play=0|1 lab=0 lit=cabinet|baffle|woofer|tweeter|port|magnet|coil|cone|spider|crossover",
    demo: { line: "bookshelfspk 480 420 9 lab=1", script: [{ set: {}, hold: 1 }, { set: { play: 1 }, hold: 2.4 }, { set: { cut: 1, play: 0 }, hold: "settle" }, { set: { lit: "crossover" }, hold: 1.2 }, { set: { play: 1, lit: "coil" }, hold: 2.4 }, { set: { cut: 0, play: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B39, T = window.TECH, W = B.WOOF, TW = B.TWEET;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), P = B.cam(ISO.mm(Pc), 0, [0, YB / 2, 0]), lab = o.lab === "1";
      const box = (x, y, z, tone = "mid", c = ISO.T.wood) => T.box(P, x, y, z, tone, c);
      const BLACK = T.C.dark, FW = B.axis(0, ZW), FT = B.axis(0, ZTW), FP = B.axis(0, ZP);
      const feet = [[-XW + 20, YB + 20], [XW - 20, YB + 20], [-XW + 20, -20], [XW - 20, -20]].sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
      const foot = ([x, y]) => T.cyl(P, x, y, 9, 0, Z0, "lo", T.C.rubber, 24);
      const base = `<path class="iso-halo" d="${K.haloOf({ x: -XW, y: YB, w: 2 * XW, d: -YB, r: 4 }, 0, 4, P)}"/>` + feet.filter(([x]) => x < 0).map(foot).join("");
      const port = `<g data-name="port">${ISO.tinted(BLACK, T.S(G.ringBand(0, 3, 20, 26, FP, P), { tone: "mid" }))}<path d="${G.circleOf(FP, 3.02, 20, P)}" fill="#16181b" stroke="#101215" stroke-width=".6"/></g>`;
      // the whole cabinet (it crossfades with the cut-open half, never shown together): veneer box, black baffle, drivers
      const whole = () => feet.filter(([x]) => x > 0).map(foot).join("") + `<g data-name="cabinet">${box([-XW, XW], [YB, BAF], [Z0, ZT])}</g><g data-name="baffle">${box([-XW, XW], [BAF, 0], [Z0, ZT], "mid", BLACK)}</g>` +
        `<g data-name="woofer">${B.wooferRing(P, FW)}</g><g data-name="tweeter">${B.tweeterFace(P, FT)}${B.dome(P, FT)}</g>${port}`;
      // the cut-open half: back wall, far side wall, floor and roof halves, the baffle round its three openings, the
      // crossover board on the back wall (an air-core coil, a capacitor, a resistor)
      const cb = YB + WALL, cz = Z0 + WALL;
      const cutSvg = () => {
      const half = [`<g data-name="cabinet">${box([-XW, 0], [YB, YB + WALL], [Z0, ZT])}${box([-XW, -XW + WALL], [YB + WALL, BAF], [Z0, ZT])}` +
        `${box([-XW + WALL, 0], [YB + WALL, BAF], [Z0, Z0 + WALL])}${box([-XW + WALL, 0], [YB + WALL, BAF], [ZT - WALL, ZT])}</g>`];
      half.push(`<g data-name="crossover">${T.box(P, [-80, -20], [cb, cb + 5], [cz + 20, cz + 110], "mid", T.C.pcb)}` +
        ISO.tinted(T.C.copper, T.S(G.ringBand(0, 14, 7, 18, G.frameAlong([-60, cb + 5, cz + 78], [0, 1, 0]), P), { tone: "mid" })) +
        T.cyl(P, -36, cb + 13, 7, cz + 36, 26, "hi", T.C.blue, 20) + T.box(P, [-62, -28], [cb + 5, cb + 12], [cz + 28, cz + 36], "mid", T.C.white) + "</g>");
      const bands = [[Z0, ZP - HOLE.p, 0], [ZP - HOLE.p, ZP + HOLE.p, HOLE.p], [ZP + HOLE.p, ZW - HOLE.w, 0], [ZW - HOLE.w, ZW + HOLE.w, HOLE.w], [ZW + HOLE.w, ZTW - HOLE.t, 0], [ZTW - HOLE.t, ZTW + HOLE.t, HOLE.t], [ZTW + HOLE.t, ZT, 0]];
      half.push(`<g data-name="baffle">${bands.map(([z0, z1, r]) => (r ? box([-XW, -r], [BAF, 0], [z0, z1], "mid", BLACK) : box([-XW, 0], [BAF, 0], [z0, z1], "mid", BLACK))).join("")}</g>`);
      // the fixed sections: basket, surround, spider, top plate, magnet, yoke and its vent; the port tube; the tweeter
      const fixed = [`<g data-name="woofer">${B.both(P, W.secBasket, 0, ZW, "basket")}${B.both(P, W.secSeat, 0, ZW, "basket")}${B.both(P, W.secFlange, 0, ZW, "basket")}${B.both(P, W.secSurround, 0, ZW, "rubber")}</g>`];
      fixed.push(`<g data-name="spider">${B.both(P, W.spider, 0, ZW, "cloth")}</g>`);
      fixed.push(`<g data-name="magnet">${B.both(P, W.secPlate, 0, ZW, "steel")}${B.both(P, W.secMagnet, 0, ZW, "magnet")}${B.sec(P, W.secYoke, 0, ZW, "steel")}${B.sec(P, W.secVent, 0, ZW, "tube")}</g>`);
      fixed.push(`<g data-name="port">${B.both(P, [[3, 20], [-150, 20], [-150, 23], [3, 23]], 0, ZP, "tube")}${B.both(P, [[3, 23], [3, 26], [0, 26], [-6, 23]], 0, ZP, "tube")}</g>`);
      fixed.push(`<g data-name="tweeter">${B.both(P, TW.secFace, 0, ZTW, "basket")}${B.both(P, TW.secMagnet, 0, ZTW, "magnet")}${B.sec(P, TW.secBack, 0, ZTW, "steel")}${B.both(P, TW.secDome, 0, ZTW, "cloth")}</g>`);
      // the moving sections: cone, dust cap, coil former and coil (the far half of the cone's inside behind them)
      const halfRing = (s, r) => Array.from({ length: 25 }, (_, i) => { const a = Math.PI / 2 + (i / 24) * Math.PI; return [r * Math.cos(a), s, ZW + r * Math.sin(a)]; });
      const [rs, rr] = W.rim, [ns, nr] = W.neck;
      const coneIn = `<path d="${K.pathOf([...halfRing(rs, rr), ...halfRing(ns, nr).reverse()].map((p) => K.iso(p, P)), true)}" fill="#d9ccab" stroke="#5a4a2a" stroke-width=".6"/>` +
        `<path d="${[0.3, 0.55, 0.78].map((f) => K.pathOf(halfRing(rs + f * (ns - rs), rr + f * (nr - rr)).map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="#a8987a" stroke-width=".5"/>`;
      const moving = `<g data-name="cone">${coneIn}${B.both(P, W.cone, 0, ZW, "paper")}${B.sec(P, W.secCap, 0, ZW, "paper")}</g>` +
        `<g data-name="coil">${B.both(P, W.secFormer, 0, ZW, "paper")}${B.both(P, W.secCoil, 0, ZW, "copper")}</g>`;
      return `${half.join("")}<g>${fixed.join("")}</g><g data-part="mov">${moving}</g>`;
      };
      // built in two parts (ISO.later): the whole cabinet with its drivers, then the cut-open half
      g.innerHTML = `${base}<g data-part="cut"></g><g data-part="whole"></g><g data-part="front"></g><g data-part="waves"></g><g data-part="words"></g>`;
      const el = window.LAB.parts(g), w = ISO.writer(), fill = (fn) => ISO.later(() => { fn(); Object.assign(el, window.LAB.parts(g)); draw(); });
      const st = { cut: B.num(o, "cut", 0, 0, 1), play: o.play === "1", amp: 0, ph: 0, wph: 0, lit: o.lit || "" };
      st.cutT = st.cut;
      const draw = () => {
        const e = st.amp * Math.sin(st.ph) * 3;                               // cone travel, mm (shown 3× for the eye)
        const fade = (1 - ISO.smooth(0, 0.6, st.cut)).toFixed(2);
        w.attr(el.whole, "opacity", fade); w.attr(el.front, "opacity", fade); w.attr(el.cut, "opacity", ISO.smooth(0.3, 1, st.cut).toFixed(2));
        w.shown(el.whole, st.cut < 0.6); w.shown(el.front, st.cut < 0.6); w.shown(el.cut, st.cut > 0.3);
        const tr = K.translateAlong(P, [0, e, 0]);
        for (const e of [el.cone, el.mov]) if (e) w.attr(e, "transform", tr);
        const q = Math.floor((st.wph % 1) * 24), on = st.amp > 0.02;
        w.rebuild(el.waves, on ? `${q} ${st.amp.toFixed(1)}` : "", () => (on ? B.rings(P, FW, 10, 90, q, st.amp) : ""));
        B.light(w, g, st.lit);
        const open = st.cut > 0.5;
        w.rebuild(el.words, lab ? String(open) : "", () => !lab ? "" : open ? [
          T.word(P, [0, -52, ZW + 42], "magnet", { color: "#1a1d20", dy: 5 }),
          T.word(P, [0, -38, ZW - 20], "voice coil", { color: "#8f4a1c", anchor: "start", dx: 8, dy: 4 }),
          T.word(P, [0, -31, ZW - 40], "spider", { anchor: "start", dx: 8, dy: 10 }),
          T.word(P, [0, -80, ZP - 24], "bass port tube", { anchor: "start", dx: 8, dy: 16 }),
          T.word(P, [-50, cb, cz + 110], "crossover", { dy: -8 }),
        ].join("") : [
          T.word(P, [XW, -9, ZW], "woofer (bass)", { anchor: "start", dx: 10 }),
          T.word(P, [XW, -9, ZTW], "tweeter (treble)", { anchor: "start", dx: 10 }),
          T.word(P, [XW, -9, ZP], "bass port", { anchor: "start", dx: 10 }),
        ].join(""));
      };
      const cm = (p) => [p[0] / 10, (p[1] - YB / 2) / 10, p[2] / 10].map((v) => +v.toFixed(2));
      g.anchors = { top: cm([0, YB / 2, ZT]), woofer: cm([0, 0, ZW]), tweeter: cm([0, 0, ZTW]), port: cm([0, 0, ZP]) };
      g.set = (p) => {
        if (B.fin(p.cut)) st.cutT = ISO.clamp(+p.cut, 0, 1);
        if (p.play !== undefined) st.play = String(p.play) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // The cone is shown moving 1.5 times a second (real bass: 40–200 times) with its travel drawn 3× larger.
      g.update = (dt) => {
        const calm = ISO.still();
        st.cut = ISO.follow(st.cut, st.cutT, dt, 0.35, calm); if (Math.abs(st.cut - st.cutT) < 0.003) st.cut = st.cutT;
        st.amp = ISO.follow(st.amp, st.play ? 1 : 0, dt, 0.3, calm); if (!st.play && st.amp < 0.01) st.amp = 0;
        if (!calm) { st.ph += dt * Math.PI * 3; st.wph += dt * 0.7; }
        draw();
        return st.cut !== st.cutT || st.amp > 0;
      };
      g.readout = () => (st.amp > 0 ? "playing · current in the voice coil sits in the magnet's field, so the coil is pushed back and forth · the cone moves about ±1 mm, 40–200 times a second for bass (shown slowed, travel drawn 3×) · the rings are the air it pushes"
        : st.cut > 0.5 ? "cut open · the voice coil hangs in the narrow gap between the pole piece and the top plate; the spider and the surround centre it; the port tube lets the box's air help the bass; the crossover sends bass to the woofer, treble to the tweeter"
          : "bookshelf speaker · 20 × 25 × 34 cm · the woofer for bass, the tweeter for treble, the port for extra bass");
      draw();
      fill(() => { el.whole.innerHTML = whole(); el.front.innerHTML = `<g data-name="cone"><g data-part="cone">${B.coneFront(P, FW)}</g></g>`; });
      fill(() => { el.cut.innerHTML = cutSvg(); });
      return g;
    },
  });
})();
