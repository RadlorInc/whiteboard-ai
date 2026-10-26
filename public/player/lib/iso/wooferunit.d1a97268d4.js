// "wooferunit cx cy k aim=side|front cut=0|1 play=0|1 lab=0 lit=basket|surround|cone|spider|coil|magnet" — a PART (PARTS.md, batch 6):
// the woofer of speaker.js as a loose driver, 16.5 cm across and 7 cm deep, facing the room (+y). Its origin is the
// middle of its mounting face (the back of the flange, which sits flat on a baffle), so it is placed at= a
// cabinet's woofer hole. The steel basket: its flange with four screw holes, four legs back to the spider's seat,
// the terminal strip; the rubber half-roll surround, the paper cone and the dust cap; the corrugated spider (seen
// between the legs); the ferrite ring magnet between the steel top plate and back plate. cut=1 shows it cut through
// its middle (speaker.js's section): the voice coil on its former hanging in the narrow gap between the pole piece
// and the top plate. aim=front faces the room (+y) to sit on a baffle; aim=side (the default) turns it 40° toward −x so
// the basket, magnet and terminals show and the cut faces you. play=1 drives it: the cone moves in and out (travel shown 3×, slowed). set({ cut, play }).
// Built in mm; anchors in cm.
(() => {
  const K = window.K, G = window.G;
  ISO.add({
    name: "wooferunit", title: "Woofer driver (part)", compare: null,
    about: "A loudspeaker woofer driver: steel basket with four screw holes, rubber surround, paper cone and dust cap, the spider, and the ferrite magnet; cut it to see the voice coil in the magnet's gap, play it and the cone moves in and out. anchors: front back",
    line: "wooferunit cx cy k aim=side|front cut=0|1 play=0|1 lab=0 lit=basket|surround|cone|spider|coil|magnet",
    demo: { line: "wooferunit 480 280 20 lab=1", script: [{ set: {}, hold: 1 }, { set: { play: 1 }, hold: 2.4 }, { set: { play: 0, lit: "spider" }, hold: 1.2 }, { set: { cut: 1, lit: "" }, hold: 1.2 }, { set: { play: 1, lit: "coil" }, hold: 2.4 }, { set: { cut: 0, play: 0, lit: "magnet" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B39, T = window.TECH, W = B.WOOF;
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), aim = o.aim === "front" ? "front" : "side", P = B.aimCam(ISO.mm(Pc), aim), lab = o.lab === "1";
      const F = B.axis(0, 0), view = G.viewOf(P), sx = view[0] >= 0 ? 1 : -1, lathe = (pts, c, tone = "mid", steps = 40, hole = null) => (hole ? '<g fill-rule="evenodd">' : "") + ISO.tinted(c, T.S(G.lathe(pts, F, P, { steps, hole }), { tone })) + (hole ? "</g>" : "");
      const pt = (s, r, a) => [r * Math.cos(a), s, r * Math.sin(a)];
      // a basket leg: a flat steel strap from the seat ring out to the flange, 9 mm wide, 1.6 mm thick
      const leg = (a) => {
        const rad = [Math.cos(a), 0, Math.sin(a)], tan = [-Math.sin(a), 0, Math.cos(a)], [[s1, r1], [s0, r0]] = W.leg, V = [];
        for (const [s, r] of [[s0, r0], [s1, r1]]) for (const [u, d] of [[-4.5, 0], [4.5, 0], [4.5, -1.6], [-4.5, -1.6]]) { const c = pt(s, r, a); V.push(c.map((v, i) => v + tan[i] * u + rad[i] * d)); }
        return ISO.tinted(T.C.dark, ISO.poly(V, [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], P, "mid"));
      };
      const legs = [0, 1, 2, 3].map((i) => Math.PI / 4 + (i * Math.PI) / 2), nearLeg = (a) => Math.cos(a) * view[0] + Math.sin(a) * view[2] > 0;
      // four screw holes through the flange's front face
      const fs = W.flange[2][0], holes = legs.map((a) => `<path d="${K.pathOf([...Array(14).keys()].map((i) => { const b = (i / 14) * 2 * Math.PI, c = pt(fs + 0.02, W.holes, a); return K.iso([c[0] + 2.6 * Math.cos(b), c[1], c[2] + 2.6 * Math.sin(b)], P); }), true)}" fill="#16181b" stroke="#101215" stroke-width=".5"/>`).join("");
      // the terminal strip on the leg nearest the viewer's lower right, red + and black − tabs
      const ta = legs.find(nearLeg) ?? legs[0], tc = pt(-14, 70, ta);
      const term = T.box(P, [tc[0] - 4, tc[0] + 4], [tc[1] - 3, tc[1] + 3], [tc[2] - 7, tc[2] + 7], "mid", T.C.black) +
        T.box(P, [tc[0] + 4, tc[0] + 6], [tc[1] - 1, tc[1] + 1], [tc[2] + 2, tc[2] + 5], "hi", T.C.red) + T.box(P, [tc[0] + 4, tc[0] + 6], [tc[1] - 1, tc[1] + 1], [tc[2] - 5, tc[2] - 2], "hi", T.C.dark);
      // the whole driver, back to front
      const whole1 = () => `<g data-name="magnet">${lathe(W.back, T.C.steel)}${lathe(W.pole, T.C.steel, "hi")}${lathe(W.magnet, T.C.magnet, "lo")}${lathe(W.plate, T.C.steel, "hi", 48, [W.plate[0][0], W.plate[0][1]])}</g>` +
        `<g data-name="spider">${lathe(W.spider, ISO.T.amber, "mid", 28, [W.spider[0][0], W.spider[0][1]])}</g><g data-name="basket">${lathe(W.seat, T.C.dark, "mid", 48, [W.seat[2][0], W.seat[0][1]])}${legs.filter((a) => !nearLeg(a)).map(leg).join("")}</g>`;
      const whole2 = () => `<g data-name="cone"><g data-part="shell">${lathe(W.cone, T.C.paper, "lo", 40)}</g></g>` +
        `<g data-name="basket">${legs.filter(nearLeg).map(leg).join("")}${term}<g fill-rule="evenodd">${ISO.tinted(T.C.dark, T.S(G.ringBand(0, fs, 74 * 0.9, W.fr, F, P, { hole: [fs, 74 * 0.9] }), { tone: "mid" }))}</g>${holes}</g>` +
        `<g data-name="surround">${lathe(W.surround, T.C.rubber, "mid", 48, [W.surround[0][0], W.surround[0][1]])}</g><g data-name="cone"><g data-part="front">${B.coneFront(P, F)}</g></g>`;
      // the cut: fixed sections, then the moving ones (the far half of the cone's inside behind them)
      const half = (s, r) => Array.from({ length: 25 }, (_, i) => { const a = (sx > 0 ? Math.PI / 2 : -Math.PI / 2) + (i / 24) * Math.PI; return [r * Math.cos(a), s, r * Math.sin(a)]; });
      const [rs, rr] = W.rim, [ns, nr] = W.neck;
      const coneIn = `<path d="${K.pathOf([...half(rs, rr), ...half(ns, nr).reverse()].map((p) => K.iso(p, P)), true)}" fill="#d9ccab" stroke="#5a4a2a" stroke-width=".6"/>` +
        `<path d="${[0.3, 0.55, 0.78].map((f) => K.pathOf(half(rs + f * (ns - rs), rr + f * (nr - rr)).map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="#a8987a" stroke-width=".5"/>`;
      const cut = () => `<g data-name="basket">${B.both(P, W.secBasket, 0, 0, "basket", sx)}${B.both(P, W.secSeat, 0, 0, "basket", sx)}${B.both(P, W.secFlange, 0, 0, "basket", sx)}</g>` +
        `<g data-name="surround">${B.both(P, W.secSurround, 0, 0, "rubber", sx)}</g><g data-name="spider">${B.both(P, W.spider, 0, 0, "cloth", sx)}</g>` +
        `<g data-name="magnet">${B.both(P, W.secPlate, 0, 0, "steel", sx)}${B.both(P, W.secMagnet, 0, 0, "magnet", sx)}${B.sec(P, W.secYoke, 0, 0, "steel", sx)}${B.sec(P, W.secVent, 0, 0, "tube", sx)}</g>` +
        `<g data-part="mov"><g data-name="cone">${coneIn}${B.both(P, W.cone, 0, 0, "paper", sx)}${B.sec(P, W.secCap, 0, 0, "paper", sx)}</g><g data-name="coil">${B.both(P, W.secFormer, 0, 0, "paper", sx)}${B.both(P, W.secCoil, 0, 0, "copper", sx)}</g></g>`;
      // built in three parts (ISO.later): the back of the driver, its front, the cut
      g.innerHTML = `<g data-part="whole"><g data-part="w1"></g><g data-part="w2"></g></g><g data-part="cut"></g><g data-part="waves"></g><g data-part="words"></g>`;
      const el = window.LAB.parts(g), w = ISO.writer(), fill = (key, fn) => ISO.later(() => { el[key].innerHTML = fn(); Object.assign(el, window.LAB.parts(g)); draw(); });
      const st = { cut: o.cut === "1", play: o.play === "1", amp: 0, ph: 0, wph: 0, lit: o.lit || "" };
      const draw = () => {
        const e = st.amp * Math.sin(st.ph) * 3, tr = K.translateAlong(P, [0, e, 0]);
        w.shown(el.whole, !st.cut); w.shown(el.cut, st.cut);
        for (const e of [el.shell, el.front, el.mov]) if (e) w.attr(e, "transform", tr);
        const q = Math.floor((st.wph % 1) * 24), on = st.amp > 0.02 && !st.cut;
        w.rebuild(el.waves, on ? `${q} ${st.amp.toFixed(1)}` : "", () => (on ? B.rings(P, F, 8, 80, q, st.amp, 3, 50, 24) : ""));
        B.light(w, g, st.lit);
        w.rebuild(el.words, lab ? String(st.cut) : "", () => !lab ? "" : st.cut ? [
          T.word(P, [0, -50, -40], "magnet", { color: "#1a1d20", anchor: "end", dx: -10 }),
          T.word(P, [0, -38, 22], "voice coil", { color: "#8f4a1c", anchor: "start", dx: 10, dy: -14 }),
          T.word(P, [0, -31, 45], "spider", { anchor: "start", dx: 8, dy: -8 }),
          T.word(P, [0, 2, 75], "surround", { anchor: "start", dx: 10 }),
          T.word(P, [0, -12, -55], "cone", { anchor: "start", dx: 12, dy: 6 }),
        ].join("") : [
          T.word(P, [W.fr, 2, 0], "woofer", { anchor: "start", dx: 10 }),
          T.word(P, [0, -60, -62], "magnet", { anchor: "end", dx: -6, dy: 14 }),
        ].join(""));
      };
      g.anchors = { front: B.aimed(aim, [0, 0.2, 0]), back: B.aimed(aim, [0, -W.depth / 10, 0]) };
      g.set = (p) => {
        if (p.cut !== undefined) st.cut = String(p.cut) === "1";
        if (p.play !== undefined) st.play = String(p.play) === "1";
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // The cone is shown moving 1.5 times a second (real bass: 40–200 times), its travel drawn 3× larger.
      g.update = (dt) => {
        const calm = ISO.still();
        st.amp = ISO.follow(st.amp, st.play ? 1 : 0, dt, 0.3, calm); if (!st.play && st.amp < 0.01) st.amp = 0;
        if (!calm) { st.ph += dt * Math.PI * 3; st.wph += dt * 0.7; }
        draw();
        return st.amp > 0;
      };
      g.readout = () => (st.amp > 0 ? "playing · the current in the voice coil sits in the magnet's field, so the coil and the cone are pushed in and out, about ±1 mm, 40–200 times a second for bass (shown slowed, travel drawn 3×)"
        : st.cut ? "cut open · the voice coil hangs in the narrow gap between the pole piece and the top plate; the spider and the surround keep it centred" : "woofer · 16.5 cm driver for the bass · steel basket, paper cone, rubber surround, ferrite magnet");
      draw();
      fill("w1", whole1); fill("w2", whole2); fill("cut", cut);
      return g;
    },
  });
})();
