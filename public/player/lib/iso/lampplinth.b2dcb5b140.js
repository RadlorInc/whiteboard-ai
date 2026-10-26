// "lampplinth cx cy k on=0|1 out=0..1 lab=0 lit=plinth|holder|bulb|switch" — a PART (batch 6): bulb.js's lamp on its
// own, at real size. A wooden plinth 15 × 10 × 2.4 cm on four rubber feet; on it a cork pad held by three screws and
// the black lampholder with its ribbed grip, ring collar and the brass centre contact in its dark mouth; a rocker
// switch in its housing (two screws) at the front. In the holder a 60 W pear-shaped filament bulb: brass foot contact,
// black glass insulator, threaded brass cap, the glass with its stem, lead-in and support wires and the coiled
// filament. on=1 rocks the switch over and, with the bulb screwed home, the filament glows white; out = how far the
// bulb is screwed out (0 home, 1 out of the holder by 4.6 cm: no contact, no light). set({ on, out }) eases it.
// Origin: the table point under the plinth's middle. Built in mm (ISO.mm), anchors in cm: socket (the bottom of the
// holder's mouth), switch, top (the top of the bulb, screwed home).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), F0 = zAx([0, 0, 0]);
  const BLACK = ISO.T.plastic, FEET = 4, ZT = 28, PAD = 1.2, HX = -18, HY = -8, ZH = ZT + PAD, FZ = 116, RIM = 34, OUT = 46, SW = [44, 26];
  // the glass envelope: neck at the cap, swelling to a 30 mm-radius ball (bulb.js)
  const GLASS = [[50, 0], [50, 12.6], [58, 13.6, 1], [70, 17.4, 1], [86, 25.6, 1], [102, 29.6, 1], [120, 30, 1], [138, 26.4, 1], [150, 18.4, 1], [157, 9, 1], [159, 0]];
  const hot = "rgb(255,240,220)";
  let uid = 0;

  // the plinth, the feet, the cork pad and its screws, the switch housing (absolute, mm)
  function plinthSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -75, y: -50, w: 150, d: 100, r: 8 }, 0, 0.1, P)}"/>`];
    const feet = [[-62, -38], [62, -38], [-62, 38], [62, 38]].sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
    out.push(ISO.tinted(ISO.T.rubber, feet.map(([x, y]) => S(K.cylinder(x, y, 6, 0, FEET, P, 18), { tone: "lo" })).join("")));
    const plan = { x: -75, y: -50, w: 150, d: 100, r: 8 };
    out.push(`<g data-name="plinth">${ISO.tinted(ISO.T.wood, S(K.slabOf(plan, FEET, ZT - FEET, P, 6, 2), { tone: "mid", inner: K.lineSvg(K.planOutline(K.insetPlan(plan, 6), ZT, P, 6), { tone: "faint", free: true }) }))}` +
      // the cork pad under the holder, held by three screws
      ISO.tinted(ISO.tint("#e9cfa6", ["#b98e5a", "#c69c69", "#d2ab79", "#ddba8b"], "#6e4a1e"), S(K.cylinder(HX, HY, 27, ZT, PAD, P, 48), { tone: "lo" })) +
      ISO.tinted(ISO.T.steel, [150, 30, 270].map((d) => (d * Math.PI) / 180).map((a) => S(G.solidOf([[0, 1.8], [0.6, 1.6, 1], [1.1, 0.6]], zAx([HX + 24 * Math.cos(a), HY + 24 * Math.sin(a), ZH]), P, { steps: 14 }), { tone: "mid" })).join("")) + `</g>`);
    return out.join("");
  }
  function switchHousing(P) {
    const [x, y] = SW;
    return ISO.tinted(BLACK, ISO.wbox(P, [x - 10, x + 10], [y - 6, y + 6], [ZT, ZT + 6], "mid")) + ISO.tinted(ISO.T.steel, [x - 7.6, x + 7.6].map((sx) => S(K.cylinder(sx, y, 1.1, ZT + 6, 0.5, P, 12), { tone: "mid" })).join(""));
  }
  function rockerSvg(P, on) {
    const th = on ? -0.22 : 0.22, c = [SW[0], SW[1], ZT + 6], at = (u, w, v) => [c[0] + u * Math.cos(th) - v * Math.sin(th), c[1] + w, c[2] + u * Math.sin(th) + v * Math.cos(th)];
    return ISO.tinted(on ? ISO.T.red : ISO.tint("#7a3a34", ["#4a1c18", "#552220", "#602826", "#6b2e2c"], "#200a08"), ISO.box(at, P, [-5.6, 5.6], [-4, 4], [-0.4, 2.2], "hi"));
  }
  // the holder (local: its foot at z 0): a black skirt with a ribbed grip, the ring collar, the dark mouth, the contact
  function holderSvg(P) {
    return ISO.tinted(BLACK, S(G.lathe([[1.2, 0], [1.2, 22], [3, 22], [16, 19], [30, 18], [30, 0]], F0, P, { steps: 48 }), { tone: "mid", inner: `<path d="${G.ribsOf(F0, 6, 15, 20.6, 28, P, { r1: 19.2 }) || ""}" fill="none" stroke="#5a5f66" stroke-width=".6"/>` })) +
      ISO.tinted(BLACK, S(G.ringBand(30, RIM, 14.2, 18.6, F0, P, { steps: 56 }), { tone: "mid" })) +
      `<path d="${G.circleOf(F0, RIM - 0.02, 14.2, P, 48)}" fill="#17191c" stroke="#0d0e10" stroke-width=".5"/><path d="${G.circleOf(F0, RIM - 0.01, 3.4, P, 20)}" fill="#c9a85a" stroke="#6b5114" stroke-width=".5"/>`;
  }
  // the bulb (local), in three build slices: the cap (brass foot contact, black glass insulator, threaded brass
  // shell), the glass, and what is inside it (stem, lead-in and support wires)
  function capSvg(P) {
    const th = [[26, 0], [26, 12.4], [27, 13.2]];
    for (let s = 28; s < 47; s += 3.6) th.push([s + 0.9, 13.9], [s + 2.7, 13.2]);
    th.push([48.6, 13.2], [50.4, 12.6], [50.4, 0]);
    return ISO.tinted(ISO.T.brass, S(G.solidOf([[19.4, 1.4], [20.4, 3.6], [21.6, 4]], F0, P, { steps: 20 }), { tone: "hi" })) +
      ISO.tinted(ISO.T.plastic, S(G.lathe([[21.4, 0], [21.4, 6], [23, 9.4], [26.2, 11.6], [26.2, 0]], F0, P, { steps: 32 }), { tone: "mid" })) +
      ISO.tinted(ISO.T.brass, S(G.lathe(th, F0, P, { steps: 40 }), { tone: "hi" }));
  }
  const glassSvg = (P) => ISO.tinted(ISO.T.glass, S(G.lathe(GLASS, F0, P, { steps: 44 }), { tone: "mid" }));
  // inside the glass, drawn over it as seen through it (audit.mjs reports these as sunk in the glass, on purpose)
  function stemSvg(P) {
    const out = [ISO.tinted(ISO.T.glass, S(G.lathe([[50, 0], [50, 8.4], [56, 7.6], [64, 4], [76, 2.8], [82, 2.6], [84, 0]], F0, P, { steps: 28 }), { tone: "lo" }))];
    out.push(ISO.tinted(ISO.T.glass, S(K.cylinder(0, 0, 1, 84, 14, P, 12), { tone: "lo" }) + S(K.cylinder(0, 0, 2, 98, 1.6, P, 16), { tone: "lo" })));
    const W = (pts, c, w) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
    out.push(W([[-1.6, 0, 80], [-4.4, 0, 92], [-14, 0, FZ + 0.4]], "#6b5a3a", 1.1), W([[1.6, 0, 80], [4.4, 0, 92], [14, 0, FZ + 0.4]], "#6b5a3a", 1.1));
    for (const x of [-7, 0, 7]) out.push(W([[0, 0, 99.6], [x * 0.6, 0, 106], [x, 0, FZ - 0.9]], "#7d8187", 0.7));
    return out.join("");
  }
  function coilSvg(P, on) {
    const pts = [];
    for (let i = 0; i <= 260; i++) { const u = i / 260, x = -14 + 28 * u, sag = -1.1 * Math.sin(Math.PI * ((u * 4) % 1)), a = u * 2 * Math.PI * 30; pts.push(K.iso([x, 1.1 * Math.cos(a), FZ + sag + 1.1 * Math.sin(a)], P)); }
    return `<path d="${K.pathOf(pts)}" fill="none" stroke="${on ? hot : "#5a5048"}" stroke-width="${on ? 1.4 : 0.75}" stroke-linejoin="round"/>`;
  }
  function glowSvg(P, id) {
    const c = K.iso([0, 0, FZ], P), k = K.cameraOf(P).k;
    return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#fffbe8" stop-opacity=".95"/><stop offset=".3" stop-color="#ffe9a8" stop-opacity=".6"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient></defs><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(74 * k).toFixed(1)}" fill="url(#${id})"/>`;
  }

  ISO.add({
    name: "lampplinth", title: "Lamp on a plinth (part)", compare: null,
    about: "A filament bulb in a black lampholder on a wooden plinth with a rocker switch; switched on with the bulb screwed home the filament glows, screwed out it has no contact and stays dark. anchors: socket switch top",
    line: "lampplinth cx cy k on=0|1 out=0..1 lab=0 lit=plinth|holder|bulb|switch",
    demo: { line: "lampplinth 480 450 18 out=1", script: [{ set: {}, hold: 1 }, { set: { out: 0 }, hold: "settle" }, { set: { on: 1 }, hold: "settle" }, { set: { out: 0.5 }, hold: "settle" }, { set: { out: 0, lit: "holder" }, hold: "settle" }, { set: { on: 0, lit: "switch" }, hold: 1 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P: Pc, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", P = ISO.mm(Pc), id = ++uid;
      // the holder and the bulb are drawn about the holder's own axis and moved onto the pad (a world move is a flat
      // screen move); the bulb is clipped above the front edge of the holder's mouth, so the screwed-in part is hidden
      const mouth3 = G.arcPoints(F0, RIM, 14.2, 0, Math.PI * 2, 64), mouth = mouth3.map((p) => K.iso(p, P));
      const front = mouth.filter((p, i) => K.depthOf(mouth3[i], P) >= K.depthOf([0, 0, RIM], P)).sort((a, b) => a[0] - b[0]);
      const clip = `M-99999 -99999H99999V${front.at(-1)[1].toFixed(1)}H${front.at(-1)[0].toFixed(1)}${front.slice().reverse().map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("")}H-99999Z`;
      g.innerHTML = `<g data-part="base"></g>` +
        `<g transform="${K.translateAlong(P, [HX, HY, ZH])}"><defs><clipPath id="lpclip${id}"><path d="${clip}"/></clipPath></defs><g data-name="holder" data-part="holder"></g>` +
        `<g data-part="bulb" clip-path="url(#lpclip${id})"><g data-name="bulb"><g data-part="cap"></g><g data-part="glass"></g><g data-part="stem"></g><g data-part="coil"></g></g><g data-part="glow"></g></g></g>` +
        `<g data-name="switch"><g data-part="housing"></g><g data-part="rocker"></g></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-part="${n}"]`), el = { bulb: q("bulb"), coil: q("coil"), glow: q("glow"), rocker: q("rocker"), words: q("words"), clip: g.querySelector(`#lpclip${id} path`) }, w = ISO.writer();
      ISO.later(() => { q("base").innerHTML = plinthSvg(P); q("housing").innerHTML = switchHousing(P); q("housing").parentNode._fresh = true; q("base").querySelector("[data-name]")._fresh = true; });
      for (const [n, f] of [["holder", holderSvg], ["cap", capSvg], ["glass", glassSvg], ["stem", stemSvg]]) ISO.later(() => { const e = q(n); e.innerHTML = f(P); (e.closest("[data-name]") || e)._fresh = true; });
      g.anchors = { socket: [HX / 10, HY / 10, (ZH + 19.4) / 10], switch: [SW[0] / 10, SW[1] / 10, (ZT + 8) / 10], top: [HX / 10, HY / 10, (ZH + 159) / 10] };
      const out0 = B31.num(o, "out", 0, 0, 1);
      const s = { on: o.on === "1", out: out0, want: out0, glow: 0, lit: o.lit || "" };
      s.glow = s.on && out0 === 0 ? 1 : 0;
      const draw = () => {
        const dz = OUT * ISO.ease(s.out), lit = s.glow > 0.5;
        w.attr(el.bulb, "transform", K.translateAlong(P, [0, 0, dz]));
        w.attr(el.clip, "transform", K.translateAlong(P, [0, 0, -dz]));
        w.rebuild(el.coil, String(lit), () => coilSvg(P, lit));
        const shown = s.glow > 0.01;
        w.rebuild(el.glow, String(shown), () => (shown ? glowSvg(P, `lpglow${id}`) : ""));
        w.attr(el.glow, "opacity", s.glow.toFixed(2));
        w.rebuild(el.rocker, String(s.on), () => rockerSvg(P, s.on));
        w.rebuild(el.words, lab ? `${s.on} ${lit}` : "", () => !lab ? "" : [
          ISO.word(K.iso([HX + 30, HY, ZH + 128], P), lit ? "filament glows" : "filament bulb", lit ? "#b5541a" : "#444", { size: 13, anchor: "start" }),
          ISO.word(K.iso([HX - 30, HY, ZH + 20], P), "lampholder", "#444", { size: 13, anchor: "end" }),
          ISO.word(K.iso([SW[0] + 10, SW[1] + 6, ZT], P), s.on ? "switch on" : "switch off", "#444", { size: 13, anchor: "start", dy: 14 })].join(""));
        B31.light(w, g, s.lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) s.on = String(p.on) === "1";
        if (p.out !== undefined) { const v = +p.out; if (Number.isFinite(v)) s.want = ISO.clamp(v, 0, 1); }
        if (p.lit !== undefined) s.lit = p.lit;
      };
      // the bulb screws in or out over about a second; the filament heats and cools in a few tenths
      g.update = (dt) => {
        const calm = ISO.still(), d = Math.min(Math.max(+dt || 0, 0), 0.1);
        s.out = ISO.follow(s.out, s.want, d, 0.28, calm); if (Math.abs(s.out - s.want) < 0.003) s.out = s.want;
        const target = s.on && s.out === 0 ? 1 : 0;
        s.glow = ISO.follow(s.glow, target, d, 0.12, calm); if (Math.abs(s.glow - target) < 0.01) s.glow = target;
        draw();
        return s.out !== s.want || s.glow !== target;
      };
      g.readout = () => s.out > 0 ? `bulb screwed out ${(OUT * s.want / 10).toFixed(1)} cm · its foot contact is off the holder's contact: the circuit is open, no light`
        : !s.on ? "switch off · no current, the filament is cold"
        : "switch on · current through the foot contact, the filament and the screw thread · the coil glows at about 2500 °C · 60 W, only about 5 % of it as light";
      draw();
      return g;
    },
  });
})();
