// "led5mm cx cy k c=red|green|blue|yellow on=0|1 legs=0.2..2.5 lab=0 lit=lens|die|anode|cathode" — a PART (PARTS.md,
// batch 6): the 5 mm LED of led.js on its own, standing on its legs in two holes 2.54 mm apart (a breadboard's pitch),
// its origin the surface point between the legs. The tinted epoxy dome lens with its rim and the flat on the rim
// (cathode side, −x), the long straight anode leg (+x) and the kinked cathode leg; seen through the epoxy, the
// cathode's anvil with its reflector cup, the tiny die in the cup and the gold bond wire to the anode post. legs = how
// far the rim stands above the surface (cm; 1 as pushed into a breadboard, 2.5 its whole legs). on=1 lights the die
// and the lens glows in its colour. set({ on, c }). Built in 0.1 mm (B35.cam) from led.js; anchors in cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const AX = 12.7, CX = -12.7, FL = 100, LZ = 110;
  const COL = {
    red: { vf: 2.0, light: "#ff3b2f", tint: ISO.tint("#f7b4ad", ["#d4473b", "#df5d52", "#e9776d", "#f19a91"], "#7a1810"), on: ISO.tint("#ffd0c8", ["#ff5a48", "#ff6f5e", "#ff8a7c", "#ffaa9e"], "#8f1a10") },
    green: { vf: 2.2, light: "#38d24a", tint: ISO.tint("#b9e8b2", ["#46a83c", "#5bb752", "#77c66f", "#98d690"], "#1c5a14"), on: ISO.tint("#d8ffd0", ["#4ed244", "#66dc5c", "#84e57b", "#a8ee9f"], "#1c6a14") },
    blue: { vf: 3.1, light: "#3a7bff", tint: ISO.tint("#b5c9f2", ["#3e66c4", "#5479cf", "#6f91da", "#93ade6"], "#16306e"), on: ISO.tint("#d4e2ff", ["#4a7cff", "#6290ff", "#7ea5ff", "#a2bfff"], "#16308a") },
    yellow: { vf: 2.1, light: "#ffcc1a", tint: ISO.tint("#f6e3a2", ["#d2a42a", "#dcb444", "#e6c562", "#efd688"], "#6b5108"), on: ISO.tint("#fff2c0", ["#ffc928", "#ffd247", "#ffdc6a", "#ffe692"], "#7a5a08") },
  };
  const amps = (c) => (5 - COL[c].vf) / 150;
  // the head (rim, lens, inside) in led.js's own heights, the rim at FL; drawn with a camera that puts FL where it stands
  const flangeSvg = (P, c, on) => {
    const ring = []; for (let i = 0; i <= 40; i++) { const a = -Math.PI * 0.84 + (i / 40) * Math.PI * 1.68; ring.push([29 * Math.cos(a), 29 * Math.sin(a)]); }
    return ISO.tinted(on ? COL[c].on : COL[c].tint, S(G.prismOf(zAx([0, 0, 0]), ring, FL, LZ, P), { tone: "mid" }));
  };
  const lensSvg = (P, c, on) => ISO.tinted(on ? COL[c].on : COL[c].tint, S(G.lathe([[LZ, 0], [LZ, 24.6], [158, 24.6], [174, 22, 1], [186, 15.6, 1], [193, 7.6, 1], [195.4, 0]], zAx([0, 0, 0]), P, { steps: 56 }), { tone: "mid" }));
  // inside the epoxy, seen through it (audit.mjs reports these as sunk in the lens: they are cast inside it)
  function insideSvg(P, c, on) {
    const out = [], fade = (svg) => `<g opacity=".82">${svg}</g>`;
    out.push(fade(ISO.tinted(ISO.T.steel, ISO.wbox(P, [CX - 2.5, CX + 2.5], [-2.5, 2.5], [LZ, 128], "mid") + ISO.wbox(P, [-22, -2], [-2.5, 2.5], [128, 146], "mid"))));
    out.push(fade(ISO.tinted(ISO.T.steel, S(G.lathe([[146, 0], [146, 3.4], [152, 6.6], [152, 5.4], [147.6, 2.6], [147.6, 0]], zAx([-9, 0, 0]), P, { steps: 28 }), { tone: "mid" }))));
    out.push(fade(ISO.tinted(ISO.T.steel, ISO.wbox(P, [AX - 2.5, AX + 2.5], [-2.5, 2.5], [LZ, 140], "mid") + ISO.wbox(P, [AX - 4, AX + 4], [-2.5, 2.5], [140, 148], "mid"))));
    const die = on ? ISO.tint("#ffffff", ["#ffffff", "#ffffff", "#ffffff", "#ffffff"], COL[c].light) : ISO.tint("#d8d4c8", ["#8a8678", "#9a9688", "#aaa698", "#bab6a8"], "#3a382f");
    out.push(ISO.tinted(die, ISO.wbox(P, [-11, -7], [-2, 2], [147.6, 150.6], "hi")));
    const bw = []; for (let i = 0; i <= 14; i++) { const u = i / 14; bw.push(K.iso([-9 + (AX + 9) * u, 0, 150.6 + (148 - 150.6) * u + 12 * Math.sin(Math.PI * u)], P)); }
    out.push(`<path d="${K.pathOf(bw)}" fill="none" stroke="#c9a85a" stroke-width=".8"/>`);
    return out.join("");
  }
  function glowSvg(P, c, amt, id) {
    if (amt < 0.02) return "";
    const p = K.iso([-9, 0, 152], P), k = K.cameraOf(P).k, col = COL[c].light;
    return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#ffffff" stop-opacity="${(0.95 * amt).toFixed(2)}"/><stop offset=".18" stop-color="${col}" stop-opacity="${(0.7 * amt).toFixed(2)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${p[0].toFixed(1)}" cy="${(p[1] - 10 * k).toFixed(1)}" rx="${(46 * k).toFixed(1)}" ry="${(56 * k).toFixed(1)}" fill="url(#${id})"/>`;
  }
  let uid = 0;

  ISO.add({
    name: "led5mm", title: "5 mm LED (part)", compare: null,
    about: "A 5 mm LED standing on its two legs (long leg +, short kinked leg − by the flat on the rim): through the tinted lens you see the tiny chip in its cup and the gold bond wire; on=1 lights it in its colour. anchors: top anode cathode",
    line: "led5mm cx cy k c=red|green|blue|yellow on=0|1 legs=0.2..2.5 lab=0 lit=lens|die|anode|cathode",
    demo: { line: "led5mm 480 400 60 c=red lab=1", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: "settle" }, { set: { c: "blue", lit: "die" }, hold: 1.4 }, { set: { c: "green", lit: "anode" }, hold: 1.2 }, { set: { on: 0, c: "yellow", lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B35;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const legs = B.num(o, "legs", 1, 0.2, 2.5) * 100;          // the rim's height, 0.1 mm
      const Pl = B.cam(P, { div: 100 }), Ph = B.cam(P, { div: 100, from: [0, 0, FL - legs] }), id = ++uid;
      // the legs: anode straight (a square steel lead), cathode with its kink, both from the surface up into the rim
      const kz = (f) => legs * f;
      const anode = ISO.tinted(ISO.T.steel, ISO.wbox(Pl, [AX - 2.5, AX + 2.5], [-2.5, 2.5], [0, legs + 1], "mid"));
      const cpath = K.pathOf([[CX, 0, 0], [CX, 0, kz(0.4)], [CX - 8, 0, kz(0.52)], [CX, 0, kz(0.64)], [CX, 0, legs + 1]].map((p) => K.iso(p, Pl)));
      const lw = Math.max(0.8, K.cameraOf(Pl).k * 5);
      const cathode = `<path d="${cpath}" fill="none" stroke="#55585e" stroke-width="${(lw + 0.8).toFixed(2)}" stroke-linejoin="round"/><path d="${cpath}" fill="none" stroke="#c9ccd1" stroke-width="${lw.toFixed(2)}" stroke-linejoin="round"/>`;
      g.innerHTML = `<g data-name="cathode">${cathode}</g><g data-name="anode">${anode}</g><g data-part="flange"></g><g data-name="lens"></g><g data-name="die"></g><g data-part="glow"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { flange: q("flange"), lens: q("lens"), die: q("die"), glow: q("glow"), words: q("words") }, w = ISO.writer();
      const s = { c: COL[o.c] && Object.hasOwn(COL, o.c) ? o.c : "red", on: o.on === "1", amt: o.on === "1" ? 1 : 0, lit: o.lit || "" };
      const bright = () => amps(s.c) / 0.02;
      const draw = () => {
        const aq = Math.round(s.amt * 30) / 30, on = aq > 0.3;
        w.rebuild(el.flange, `${s.c} ${on}`, () => flangeSvg(Ph, s.c, on));
        w.rebuild(el.lens, `${s.c} ${on}`, () => lensSvg(Ph, s.c, on));
        w.rebuild(el.die, `${s.c} ${on}`, () => insideSvg(Ph, s.c, on));
        w.rebuild(el.glow, `${s.c} ${aq}`, () => glowSvg(Ph, s.c, aq * Math.min(1, 0.45 + 0.55 * bright()), `led5glow${id}`));
        w.rebuild(el.words, lab ? `${s.c} ${on}` : "", () => !lab ? "" : [
          ISO.word(K.iso([30, 0, 190], Ph), on ? `${s.c} light from the chip` : "epoxy lens", "#444", { size: 13, anchor: "start" }),
          ISO.word(K.iso([-30, 0, 150], Ph), "chip in its cup", "#444", { size: 13, anchor: "end", dy: -4 }),
          ISO.word(K.iso([AX + 6, 0, legs * 0.5], Pl), "long leg +", "#c0392b", { size: 13, anchor: "start" }),
          ISO.word(K.iso([CX - 12, 0, legs * 0.4], Pl), "short leg −", "#2f5fbf", { size: 13, anchor: "end", dy: 4 })].join(""));
        B.light(w, g, s.lit);
      };
      g.anchors = { top: [0, 0, (legs + 95.4) / 100], anode: [AX / 100, 0, 0], cathode: [CX / 100, 0, 0] };
      g.set = (p) => {
        if (p.c && Object.hasOwn(COL, p.c)) s.c = p.c;
        if (p.on !== undefined) s.on = String(p.on) === "1";
        if (p.lit !== undefined) s.lit = p.lit;
      };
      // an LED lights in nanoseconds; the eased glow just lets the eye follow the change
      g.update = (dt) => {
        const target = s.on ? 1 : 0;
        s.amt = ISO.follow(s.amt, target, dt, 0.08, ISO.still()); if (Math.abs(s.amt - target) < 0.01) s.amt = target;
        draw();
        return s.amt !== target;
      };
      g.readout = () => !s.on ? `${s.c} 5 mm LED · off · it needs about ${COL[s.c].vf.toFixed(1)} V across it before current flows; long leg +`
        : `${s.c} LED on · ${COL[s.c].vf.toFixed(1)} V across it · with a 150 Ω resistor on 5 V: ${(amps(s.c) * 1000).toFixed(1)} mA · electrons drop into holes in the chip and give off ${s.c} light`;
      draw();
      return g;
    },
  });
})();
