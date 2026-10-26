// "speaker cx cy height waves=1 cut=0..1 play=0|1 lab=1 lit=woofer|tweeter|port|magnet|coil|cone|spider" — a loudspeaker.
// A two-way cabinet on four rubber feet: walls of 18 mm MDF in wood veneer, a black front baffle carrying the woofer
// (steel basket flange with four screws, rubber half-roll surround, paper cone, dust cap), the dome tweeter and the
// flared bass port. cut=1 takes the near half of the cabinet away and shows the woofer cut through its middle: the
// basket, the cone and dust cap, the voice coil wound on its former, sitting in the magnet's narrow gap between the
// pole piece and the top plate, the corrugated spider that centres it, the ferrite ring magnet and the back plate; the
// port tube, the tweeter's magnet and the crossover board on the back wall. play=1 drives the coil: the cone moves
// in and out and sound rings spread from it (waves=0 hides them). set({ cut, play, lit }). 1 unit = 1 mm.
(() => {
  const K = window.K, G = window.G, T = window.TECH;
  const XW = 110, YB = -210, Z0 = 10, ZT = 384, WALL = 18, BAF = -18;      // cabinet half width, back, floor, top
  const ZW = 186, ZTW = 330, ZP = 52;                                     // woofer, tweeter and port centres
  const yAx = (z) => G.frameAlong([0, 0, z], [0, 1, 0]);
  // section materials for ISO.prismX: [dark, light] sides, face, ink
  const M = {
    steel: [["#8d9096", "#d9dadd"], "#c7c9cd", "#3c3f45"], magnet: [["#3e434a", "#7d838b"], "#5d636a", "#1a1d20"],
    paper: [["#9a8a6a", "#efe4ca"], "#ddd0b0", "#5a4a2a"], rubber: [["#2a2b2f", "#55575c"], "#3e3f44", "#121214"],
    copper: [["#c98258", "#f7d9c4"], "#e2a985", "#6e3a1c"], cloth: [["#c9a85a", "#f6e7bf"], "#ecd394", "#6b5114"],
    basket: [["#262a30", "#5a6068"], "#40454c", "#101215"], wood: [["#c9a477", "#f7e8d0"], "#e9d0ad", "#7a5a2e"],
    tube: [["#2a2d31", "#5a5f66"], "#45494f", "#101215"],
  };
  // a section face at x = 0 (a thin prism from x = -1.2) of a part given in (s along the axis, r from it) about zc
  const sec = (P, pts, zc, m) => ISO.prismX(P, pts.map(([s, r]) => [s, zc + r]), -1.2, 0, ...M[m]);
  const both = (P, pts, zc, m) => sec(P, pts, zc, m) + sec(P, pts.map(([s, r]) => [s, -r]), zc, m);
  const rect = (s0, s1, r0, r1) => [[s0, r0], [s1, r0], [s1, r1], [s0, r1]];
  const crescent = (cs, cr, R0, R1, a0, a1, n = 10) => [...ISO.arc(cs, cr, R1, a0, a1, n), ...ISO.arc(cs, cr, R0, a1, a0, n)];
  // the cone from its rim (s 3, r 77) to its neck (s -38, r 22), 1.4 thick
  const CONE = [[3, 77], [-38, 22], [-38, 23.6], [3, 78.6]];
  const SPIDER = (() => { const top = [], bot = []; for (let i = 0; i <= 12; i++) { const r = 22 + (i / 12) * 34, s = -50 + (i % 2 ? 2.4 : -2.4); top.push([s + 0.6, r]); bot.unshift([s - 0.6, r]); } return [...top, ...bot]; })();
  const YOKE = [[-110, -68], [-110, 68], [-100, 68], [-100, 19.5], [-60, 19.5], [-60, -19.5], [-100, -19.5], [-100, -68]];

  ISO.add({
    name: "speaker", title: "Loudspeaker", compare: "speaker 480 270 400",
    about: "A two-way loudspeaker: cut it open to see how the woofer works (a voice coil in a magnet's gap pushes the paper cone), then play it and the cone pumps the air into sound waves.",
    line: "speaker cx cy height waves=1 cut=0..1 play=0|1 lab=1 lit=woofer|tweeter|port|magnet|coil|cone|spider",
    demo: { line: "speaker 480 270 400", script: [{ set: { play: 1 }, hold: 2.4 }, { set: { cut: 1, play: 0 }, hold: "settle" }, { set: { play: 1 }, hold: 3 }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", waves = o.waves !== "0", W = size * 1.75, H = size * 1.18;
      const { P, g } = ISO.frame([[-XW, YB, 0], [XW, YB, 0], [-XW, 0, 0], [XW, 0, 0], [-XW, YB, ZT], [XW, 0, ZT], [-XW, 0, ZT], [0, 70, ZW + 120], [0, 70, ZW - 120]], cx, cy, W, H, { azimuth: 40, elevation: 20, pad: size * 0.04 }, parent);
      const box = (x, y, z, tone = "mid", c = ISO.T.wood) => T.box(P, x, y, z, tone, c);
      const BLACK = T.C.dark, FW = yAx(ZW), FT = yAx(ZTW), FP = yAx(ZP);
      const feet = [[-XW + 20, YB + 20], [XW - 20, YB + 20], [-XW + 20, -20], [XW - 20, -20]].sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
      const foot = ([x, y]) => T.cyl(P, x, y, 9, 0, Z0, "lo", T.C.rubber, 24);
      const base = `<path class="iso-halo" d="${K.haloOf({ x: -XW, y: YB, w: 2 * XW, d: -YB, r: 4 }, 0, 4, P)}"/>` + feet.filter(([x]) => x < 0).map(foot).join("");
      // the drivers seen from the front
      const screws = (F, r) => T.D([0, 1, 2, 3].map((i) => K.iso(G.pointOf(F, 3, r, Math.PI / 4 + (i * Math.PI) / 2), P)), { size: 0.55 });
      // (audit.mjs lists the surround and the tweeter dome as loose: each sits on its flange's front face, a ring the
      // audit doesn't count as support)
      const woofer = () => {
        const s = [ISO.tinted(BLACK, T.S(G.ringBand(0, 3, 74, 92, FW, P), { tone: "mid" })), screws(FW, 87)];
        s.push(ISO.tinted(T.C.rubber, T.S(G.lathe([[3, 75], [3, 76], [5, 76.6, 1], [6.6, 80, 1], [5, 83.4, 1], [3, 84], [3, 85]], FW, P, { steps: 72 }), { tone: "mid" })));
        return s.join("");
      };
      // the moving cone seen from the front: the funnel (rim filled, corrugation rings, neck) and the dust cap
      const coneFront = () => {
        const s = [`<path d="${G.circleOf(FW, 3, 77, P)}" fill="#cfc2a2" stroke="#5a4a2a" stroke-width=".7"/>`];
        const rings = [0.3, 0.55, 0.78].map((f) => G.circleOf(FW, 3 - f * 41, 77 - f * 55, P)).join("");
        s.push(`<path d="${rings}" fill="none" stroke="#a8987a" stroke-width=".5"/>`, `<path d="${G.circleOf(FW, -38, 22, P)}" fill="#bfb18f" stroke="#5a4a2a" stroke-width=".6"/>`);
        s.push(ISO.tinted(T.C.paper, T.S(G.lathe([[-38, 0], [-38, 22], [-34, 19.6, 1], [-30, 13, 1], [-28, 6, 1], [-27.5, 0]], FW, P, { steps: 48 }), { tone: "hi" })));
        return s.join("");
      };
      const tweeter = () => ISO.tinted(BLACK, T.S(G.ringBand(0, 3, 18, 36, FT, P), { tone: "mid" })) + screws(FT, 31) +
        ISO.tinted(T.C.white, T.S(G.lathe([[3, 0], [3, 21], [6, 19, 1], [10, 12, 1], [12, 0]], FT, P, { steps: 48 }), { tone: "hi" }));
      const port = () => ISO.tinted(BLACK, T.S(G.ringBand(0, 3, 20, 29, FP, P), { tone: "mid" })) + `<path d="${G.circleOf(FP, 3.02, 20, P)}" fill="#16181b" stroke="#101215" stroke-width=".6"/>`;
      // the whole cabinet: veneer box, (it crossfades with the cut-open half below, so audit.mjs, which sees both in
      // the first pose, lists the whole box and baffle as sunk into the half's walls: they are never shown together)
      // the whole cabinet: veneer box, the black baffle on its front, a seam where they meet
      const whole = feet.filter(([x]) => x > 0).map(foot).join("") + box([-XW, XW], [YB, BAF], [Z0, ZT]) + box([-XW, XW], [BAF, 0], [Z0, ZT], "mid", BLACK) +
        `<g data-name="woofer">${woofer()}</g><g data-name="tweeter">${tweeter()}</g><g data-name="port">${port()}</g>`;
      // the cut-open half: back wall, far side wall, floor and roof halves, the baffle around its three openings,
      // the crossover board on its stand-offs on the back wall
      const half = [box([-XW, 0], [YB, YB + WALL], [Z0, ZT]), box([-XW, -XW + WALL], [YB + WALL, BAF], [Z0, ZT]),
        box([-XW + WALL, 0], [YB + WALL, BAF], [Z0, Z0 + WALL]), box([-XW + WALL, 0], [YB + WALL, BAF], [ZT - WALL, ZT])];
      half.push(T.box(P, [-82, -20], [YB + WALL, YB + WALL + 6], [Z0 + WALL + 20, Z0 + WALL + 110], "mid", T.C.pcb));
      half.push(ISO.tinted(T.C.copper, T.S(G.ringBand(0, 14, 7, 18, G.frameAlong([-62, YB + WALL + 6, Z0 + WALL + 75], [0, 1, 0]), P), { tone: "mid" })));
      half.push(T.cyl(P, -36, YB + WALL + 14, 7, Z0 + WALL + 40, 26, "hi", T.C.blue, 20));
      for (const [z0, z1, r] of [[Z0, ZP - 23, 0], [ZP - 23, ZP + 23, 23], [ZP + 23, ZW - 79, 0], [ZW - 79, ZW + 79, 79], [ZW + 79, ZTW - 22, 0], [ZTW - 22, ZTW + 22, 22], [ZTW + 22, ZT, 0]])
        half.push(r ? box([-XW, -r], [BAF, 0], [z0, z1], "mid", BLACK) : box([-XW, 0], [BAF, 0], [z0, z1], "mid", BLACK));
      // the fixed sections: basket, surround, spider, top plate, magnet, yoke with its vent; port tube; tweeter
      const fixed = [both(P, [[0, 86], [0, 91], [-60, 63], [-60, 57]], ZW, "basket"), both(P, rect(-56, -50, 54, 62), ZW, "basket")];
      fixed.push(both(P, rect(0, 3, 76, 92), ZW, "basket"), both(P, crescent(3, 80, 2.6, 4, 0, Math.PI), ZW, "rubber"));
      fixed.push(`<g data-name="spider">${both(P, SPIDER, ZW, "cloth")}</g>`);
      fixed.push(`<g data-name="magnet">${both(P, rect(-60, -70, 25.5, 68), ZW, "steel")}${both(P, rect(-70, -100, 27, 68), ZW, "magnet")}${sec(P, YOKE, ZW, "steel")}${sec(P, rect(-60, -110, -4, 4), ZW, "tube")}</g>`);
      fixed.push(`<g data-name="port">${both(P, rect(3, -150, 20, 23), ZP, "tube")}${both(P, [[3, 23], [3, 29], [0, 29], [-6, 23]], ZP, "tube")}</g>`);
      fixed.push(`<g data-name="tweeter">${both(P, rect(0, 3, 21, 36), ZTW, "basket")}${both(P, rect(-4, -20, 8, 26), ZTW, "magnet")}${sec(P, [[-20, -26], [-20, 26], [-24, 26], [-24, -26]], ZTW, "steel")}${both(P, crescent(3, 0, 11, 12.2, 0, Math.PI / 2), ZTW, "cloth")}</g>`);
      // the moving sections: cone, dust cap, coil former and coil (with the far half of the cone's inside behind them)
      const halfRing = (s, r) => Array.from({ length: 25 }, (_, i) => { const a = Math.PI / 2 + (i / 24) * Math.PI; return [r * Math.cos(a), s, ZW + r * Math.sin(a)]; });
      const coneIn = `<path d="${K.pathOf([...halfRing(3, 77), ...halfRing(-38, 22).reverse()].map((p) => K.iso(p, P)), true)}" fill="#d9ccab" stroke="#5a4a2a" stroke-width=".6"/>` +
        `<path d="${[0.3, 0.55, 0.78].map((f) => K.pathOf(halfRing(3 - f * 41, 77 - f * 55).map((p) => K.iso(p, P)))).join("")}" fill="none" stroke="#a8987a" stroke-width=".5"/>`;
      const moving = `<g data-name="cone">${coneIn}${both(P, CONE, ZW, "paper")}${sec(P, [...ISO.arc(-55.8, 0, 28.3, 0.89, -0.89, 16), ...ISO.arc(-55.8, 0, 27.1, -0.89, 0.89, 16)], ZW, "paper")}</g>` +
        `<g data-name="coil">${both(P, rect(-38, -68, 20, 21), ZW, "paper")}${both(P, rect(-53, -68, 21, 24.8), ZW, "copper")}</g>`;
      g.innerHTML = `${base}<g data-part="cut">${half.join("")}<g>${fixed.join("")}</g><g data-part="mov">${moving}</g></g><g data-part="whole">${whole}</g><g data-part="front"><g data-part="cone">${coneFront()}</g></g><g data-part="waves"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const st = { cut: ISO.clamp(ISO.num(o, "cut", 0), 0, 1), cutT: 0, play: o.play === "1", amp: 0, ph: 0, wph: 0, lit: o.lit || "" };
      st.cutT = st.cut;
      const draw = () => {
        const e = st.amp * Math.sin(st.ph) * 5;                               // cone travel, mm (shown 5× for the eye)
        w.attr(el.whole, "opacity", (1 - ISO.smooth(0, 0.6, st.cut)).toFixed(2));
        w.attr(el.front, "opacity", (1 - ISO.smooth(0, 0.6, st.cut)).toFixed(2));
        w.attr(el.cut, "opacity", ISO.smooth(0.3, 1, st.cut).toFixed(2));
        w.shown(el.whole, st.cut < 0.6); w.shown(el.front, st.cut < 0.6); w.shown(el.cut, st.cut > 0.3);
        const tr = K.translateAlong(P, [0, e, 0]);
        w.attr(el.cone, "transform", tr); w.attr(el.mov, "transform", tr);
        const q = Math.floor((st.wph % 1) * 24), on = waves && st.amp > 0.02;
        w.rebuild(el.waves, on ? `${q} ${st.amp.toFixed(1)}` : "", () => !on ? "" : [0, 1, 2].map((i) => {
          const f = (q / 24 + i / 3) % 1;
          return `<path d="${G.circleOf(FW, 10 + f * 60, 96 + f * 30, P)}" fill="none" stroke="#2f7fd6" stroke-width="${(2.2 - f * 1.4).toFixed(2)}" opacity="${(st.amp * (1 - f) * 0.8).toFixed(2)}"/>`;
        }).join(""));
        w.light(parts, parts.filter((p) => p.dataset.name === st.lit));
        const open = st.cut > 0.5;
        w.rebuild(el.words, lab ? String(open) : "", () => !lab ? "" : open ? [
          T.word(P, [0, -85, ZW + 47], "magnet", { color: "#1a1d20", dy: 5 }),
          T.word(P, [0, -62, ZW - 22], "voice coil", { color: "#8f4a1c", anchor: "start", dx: 8, dy: 4 }),
          T.word(P, [0, -50, ZW - 40], "spider", { anchor: "start", dx: 8, dy: 10 }),
          T.word(P, [-77, 3, ZW + 20], "cone", { anchor: "end", dx: -8 }),
          T.word(P, [0, -30, ZW - 70], "basket", { anchor: "start", dx: 10, dy: 10 }),
          T.word(P, [0, -80, ZP - 24], "bass port tube", { anchor: "start", dx: 8, dy: 16 }),
        ].join("") : [
          T.word(P, [XW, -9, ZW], "woofer (bass)", { anchor: "start", dx: 10 }),
          T.word(P, [XW, -9, ZTW], "tweeter (treble)", { anchor: "start", dx: 10 }),
          T.word(P, [XW, -9, ZP], "bass port", { anchor: "start", dx: 10 }),
        ].join(""));
      };
      g.set = (p) => {
        if (p.cut !== undefined) st.cutT = ISO.clamp(+p.cut, 0, 1);
        if (p.play !== undefined) st.play = !!+p.play;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // The cone is shown moving 1.5 times a second (real bass: 40–200 times) with its travel drawn 5× larger.
      g.update = (dt) => {
        const calm = ISO.still();
        st.cut = ISO.follow(st.cut, st.cutT, dt, 0.35, calm); if (Math.abs(st.cut - st.cutT) < 0.003) st.cut = st.cutT;
        st.amp = ISO.follow(st.amp, st.play ? 1 : 0, dt, 0.3, calm); if (!st.play && st.amp < 0.01) st.amp = 0;
        if (!calm) { st.ph += dt * Math.PI * 3; st.wph += dt * 0.7; }
        draw();
        return st.cut !== st.cutT || st.amp > 0;
      };
      g.readout = () => (st.amp > 0 ? `playing · current in the voice coil sits in the magnet's field, so the coil is pushed back and forth · the cone moves about ±1 mm, 40–200 times a second for bass (shown slowed, travel drawn 5×) · the waves are the air it pushes`
        : st.cut > 0.5 ? "cut open · the voice coil hangs in the narrow gap between the pole piece and the top plate; the spider and the surround centre it; the port tube lets the box's air help the bass"
          : "a two-way speaker: the big woofer for bass, the small tweeter for treble, the port for extra bass");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
