// "roundflask cx cy k ring=1|0 fill=0..1 c=… boil=0|1 lab=0 lit=glass|liquid|ring" — a PART (PARTS.md): a 250 mL
// round-bottomed flask, origin the bench point under its middle. An 8 cm glass ball, a 2.4 cm neck with a beaded lip,
// 11.4 cm tall (as distill.js and flask.js draw it). It cannot stand on its own: ring=1 sits it in a cork ring on the
// bench (as flask.js); ring=0 is the bare flask, its ball's lowest point at the origin, to place on a tripod's gauze
// (`at=tripod.top`) and hold by the neck in a retort stand's clamp (anchor `clamp`). fill is the fraction of the ball
// that is full (the volume integrated from the glass's own profile); a colour change blends over a second. boil=1:
// bubbles rise from the bottom and grow, eased in and out (distill.js). set({ fill, c, boil }). Built in mm.
(() => {
  const K = window.K, G = window.G;
  const RB = 40, NECK = 2 * RB + 34, ROUND = (() => {
    const out = [];
    // the ball's meridian sampled evenly by angle, so the round bottom stays round in outline
    for (let i = 1; i <= 24; i++) { const th = (i / 24) * Math.acos((RB - (2 * RB - 9)) / RB), s = RB - RB * Math.cos(th); out.push([s, RB * Math.sin(th), 1]); }
    out.push([2 * RB - 6, 12.4, 1], [2 * RB - 3, 11.8], [NECK - 3.5, 11.8], [NECK - 2.5, 13.1, 1], [NECK - 1, 13.4, 1], [NECK, 12.4]);
    return [[0, 0.5]].concat(out);
  })();
  const TOPS = 2 * RB - 8;   // the ball's useful top (where the neck begins)

  ISO.add({
    name: "roundflask", title: "Round-bottomed flask (part)", compare: null,
    about: "A 250 mL round-bottomed flask with a long neck, in a cork ring or bare (to sit on a gauze and be clamped by the neck), holding a coloured liquid that can boil. anchors: neck clamp inside",
    line: "roundflask cx cy k ring=1|0 fill=0..1 c=clear|blue|red|green|purple|… boil=0|1 lab=0 lit=glass|liquid|ring",
    demo: { line: "roundflask 480 430 26 ring=1 fill=0.35 c=purple", script: [{ set: { fill: 0.55 }, hold: "settle" }, { set: { boil: 1, lit: "liquid" }, hold: 3 }, { set: { c: "clear", boil: 0, lit: "ring" }, hold: "settle" }, { set: { lit: "glass" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const ring = o.ring !== "0", z0 = ring ? 9.2 : 0;   // in the ring the ball rests on its inner edge (13 mm up, r 17)
      const V = LAB.vessel(Pm, [0, 0, z0], ROUND, { base: 1.6, wall: 1.3 });
      const st = { f: ISO.clamp(ISO.num(o, "fill", 0.4), 0, 1), c0: o.c || "blue", c1: o.c || "blue", mixT: 1, boil: o.boil === "1" ? 1 : 0, heat: o.boil === "1", tq: 0 }, want = { f: st.f };
      let lit = o.lit || "";
      const levelS = () => 2 + (TOPS - 2) * st.f;
      // the cork ring: a thick annulus, its cut cork grain as a few dots on the top
      const cork = ISO.tint("#e9cfa6", ["#b98c55", "#c79c66", "#d4ad7a", "#dfbe8f"], "#6e4a1e");
      const corkSvg = () => ISO.tinted(cork, S(G.ringBand(0, 13, 17, 27, LAB.Z([0, 0, 0]), Pm), { tone: "mid" }) +
        LAB.D(Array.from({ length: 22 }, (_, i) => { const a = i * 2.39996, r = 19 + ((i * 0.618) % 1) * 6.5; return K.iso([Math.cos(a) * r, Math.sin(a) * r, 13.05], Pm); }), { size: 0.35 }));
      // the ring's front, drawn again over the ball's bottom: everything on screen below the front of its inner edge
      const tag = "rf" + Math.round(cx * 7 + cy * 3 + k * 11);
      const frontClip = () => {
        const e = Array.from({ length: 48 }, (_, i) => K.iso([17 * Math.cos((i / 48) * Math.PI * 2), 17 * Math.sin((i / 48) * Math.PI * 2), 13], Pm));
        let l = 0, r = 0; e.forEach((p, i) => { if (p[0] < e[l][0]) l = i; if (p[0] > e[r][0]) r = i; });
        const arc = []; for (let i = l; ; i = (i + 1) % 48) { arc.push(e[i]); if (i === r) break; }
        const arc2 = []; for (let i = r; ; i = (i + 1) % 48) { arc2.push(e[i]); if (i === l) break; }
        const low = arc.reduce((a, p) => a + p[1], 0) / arc.length > arc2.reduce((a, p) => a + p[1], 0) / arc2.length ? arc : arc2.reverse();
        const L0 = low[0], R0 = low[low.length - 1];
        return `<clipPath id="${tag}"><path d="${K.pathOf([[L0[0] - 400, L0[1]], ...low, [R0[0] + 400, R0[1]], [R0[0] + 400, R0[1] + 900], [L0[0] - 400, L0[1] + 900]], true)}"/></clipPath>`;
      };
      g.innerHTML = (ring ? `<defs>${frontClip()}</defs><path class="iso-halo" d="${K.haloOf({ x: -27, y: -27, w: 54, d: 54, r: 27 }, 0, 13, Pm)}"/><g data-name="ring">${corkSvg()}</g>` : "") +
        `<g data-name="glass">${V.back()}</g><g data-name="liquid" data-part="liquid"></g><g data-part="bubbles"></g><g data-name="glass">${V.front()}</g>` +
        (ring ? `<g data-name="ring" clip-path="url(#${tag})">${corkSvg()}</g>` : "") +
        `<g data-name="glass">${LAB.faceText(Pm, G.pointOf(V.F, RB * 1.05, RB + 0.4, V.facing + 0.5), G.mul3(G.tangentOf(V.F, V.facing + 0.5), -1), "250 mL", 4.2, "#5d7f96")}</g><g data-part="words"></g>`;
      g.anchors = { neck: [0, 0, (z0 + NECK) / 10], clamp: [0, 0, (z0 + NECK - 14) / 10], inside: [0, 0, (z0 + 1.6) / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const draw = () => {
        const s = levelS(), c = colour();
        w.rebuild(el.liquid, `${s.toFixed(2)} ${c}`, () => V.liquid(s, c));
        const on = st.boil > 0.05 && st.f > 0.04, tq = on ? st.tq : 0;
        w.rebuild(el.bubbles, on ? `${tq} ${st.boil.toFixed(2)} ${s.toFixed(1)}` : "", () => {
          if (!on) return "";
          const bs = [];
          for (let i = 0; i < 12; i++) {
            const ph = (tq * (0.7 + (i % 4) * 0.12) + i * 0.377) % 1, z = 5 + ph * Math.max(0, s - 8), r = Math.sqrt(Math.max(0, (RB - 4) ** 2 - (z - RB) ** 2)) * 0.75;
            if (i / 12 < st.boil) bs.push(LAB.bubble(Pm, [Math.sin(i * 2.3) * r, Math.cos(i * 1.7) * r * 0.6, z0 + z], 0.8 + ph * 1.6 * st.boil));
          }
          return bs.join("");
        });
        if (lab) w.rebuild(el.words, `${Math.round(V.vol(s))} ${st.c1}`, () => LAB.word(Pm, lab, [0, 0, z0 + NECK + 12], "round-bottomed flask", "#556") + LAB.word(Pm, lab, V.at(Math.max(s, 20), -1.3, 6), `${Math.round(V.vol(s))} mL`, LAB.ink(st.c1), { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) want.f = ISO.clamp(+p.fill, 0, 1);
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.boil !== undefined) st.heat = String(p.boil) === "1";
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt, clock = 0) => {
        const calm = ISO.still();
        st.f = ISO.follow(st.f, want.f, dt, 0.45, calm);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        st.boil = ISO.follow(st.boil, st.heat ? 1 : 0, dt, 0.5, calm);
        if (st.boil < 0.01 && !st.heat) st.boil = 0;
        st.tq = calm ? 0.4 : Math.round(clock * 24) / 24;
        draw();
        return st.f !== want.f || st.mixT < 1 || (st.boil > 0 && !calm);
      };
      g.readout = () => `250 mL round-bottomed flask${ring ? " in a cork ring" : ""} · ${Math.round(V.vol(levelS()))} mL of ${st.c1} liquid${st.boil > 0.5 ? " · boiling: bubbles of vapour rise from the bottom" : ""}`;
      draw();
      return g;
    },
  });
})();
