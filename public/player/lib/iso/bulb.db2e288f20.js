// "bulb cx cy height k=on|off power=0-100 out=0|1 lab=1 lit=glass|filament|cap|contact|switch" — a filament bulb.
// A 60 W pear-shaped bulb in a black lampholder on a wooden plinth with a rocker switch. Inside the clear glass
// (filled with argon so the filament can't burn): the glass stem with its flare, two lead-in wires, the support wires
// from the glass button and the coiled tungsten filament strung between them. out=1 lifts the bulb out of its holder
// to show how the current gets in: one wire meets the brass foot contact, the other the screw thread, and a ring of
// black glass keeps the two apart. Switched on, current through the thin filament heats it to about 2500 °C and it
// glows white; power= dims it (cooler, orange, far less light: light goes roughly as power^2). Only about 5 % of the
// power comes out as light. set({ k, power, out, lit }). World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), F0 = zAx([0, 0, 0]);
  const BLACK = ISO.T.plastic, PLINTH = 48, FZ = 116, RIM = 34, OUT = 46;
  // the glass envelope: neck at the cap, swelling to a 30 mm-radius ball
  const GLASS = [[50, 0], [50, 12.6], [58, 13.6, 1], [70, 17.4, 1], [86, 25.6, 1], [102, 29.6, 1], [120, 30, 1], [138, 26.4, 1], [150, 18.4, 1], [157, 9, 1], [159, 0]];
  const tempOf = (pw) => 2500 * Math.pow(Math.max(pw, 0.001), 0.25), lightOf = (pw) => Math.pow(pw, 2.1);
  const hot = (pw) => { const u = ISO.clamp((tempOf(pw) - 700) / 1800, 0, 1); return `rgb(255,${Math.round(90 + 150 * u)},${Math.round(30 + 190 * u * u)})`; };
  let uid = 0;

  function baseSvg(P) {
    const out = [];
    for (const a of [90, 210, 330].map((d) => (d * Math.PI) / 180)) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(36 * Math.cos(a), 36 * Math.sin(a), 6, -18, 4, P, 20), { tone: "lo" })));
    out.push(ISO.tinted(ISO.T.wood, S(G.lathe([[-14, 0], [-14, PLINTH - 1], [-13, PLINTH, 1], [-1, PLINTH, 1], [0, PLINTH - 1.6], [0, 0]], F0, P, { steps: 72 }), { tone: "mid", inner: `<path d="${G.arcOf(F0, -7, PLINTH + 0.05, P)}" fill="none" stroke="#b89a6c" stroke-width=".6"/>` })));
    // a cork pad under the holder, held by three screws
    out.push(ISO.tinted(ISO.T.wood, S(K.cylinder(0, 0, 27, 0, 1.2, P, 56), { tone: "lo" })));
    for (const a of [150, 30, 270].map((d) => (d * Math.PI) / 180)) out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 1.8], [0.6, 1.6, 1], [1.1, 0.6]], zAx([24 * Math.cos(a), 24 * Math.sin(a), 1.2]), P, { steps: 14 }), { tone: "mid" })));
    // the rocker switch's housing at the front of the plinth, two screws
    out.push(ISO.tinted(BLACK, ISO.wbox(P, [16, 36], [22, 34], [0, 6], "mid")));
    for (const x of [18.4, 33.6]) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, 28, 1.1, 6, 0.5, P, 12), { tone: "mid" })));
    // the lampholder: a black skirt with a ribbed grip and a ring collar round its mouth
    out.push(ISO.tinted(BLACK, S(G.lathe([[1.2, 0], [1.2, 22], [3, 22, 1], [16, 19], [30, 18], [30, 0]], F0, P, { steps: 56 }), { tone: "mid", inner: `<path d="${G.ribsOf(F0, 6, 15, 20.6, 28, P, { r1: 19.2 }) || ""}" fill="none" stroke="#5a5f66" stroke-width=".6"/>` })));
    out.push(ISO.tinted(BLACK, S(G.ringBand(30, RIM, 14.2, 18.6, F0, P, { steps: 56 }), { tone: "mid" })));
    // the mouth: dark inside, the brass centre contact at the bottom
    out.push(`<path d="${G.circleOf(F0, RIM - 0.02, 14.2, P, 48)}" fill="#17191c" stroke="#0d0e10" stroke-width=".5"/><path d="${G.circleOf(F0, RIM - 0.01, 3.4, P, 20)}" fill="#c9a85a" stroke="#6b5114" stroke-width=".5"/>`);
    return out.join("");
  }
  function switchSvg(P, on) {
    const th = on ? -0.22 : 0.22, c = [26, 28, 6], at = (u, w, v) => [c[0] + u * Math.cos(th) - v * Math.sin(th), c[1] + w, c[2] + u * Math.sin(th) + v * Math.cos(th)];
    return ISO.tinted(on ? ISO.T.red : ISO.tint("#7a3a34", ["#4a1c18", "#552220", "#602826", "#6b2e2c"], "#200a08"), ISO.box(at, P, [-5.6, 5.6], [-4, 4], [-0.4, 2.2], "hi"));
  }
  // the cap: brass foot contact, the black glass insulator, the threaded brass shell the glass neck sits in
  function capSvg(P) {
    const th = [[26, 0], [26, 12.4], [27, 13.2]];
    for (let s = 28; s < 47; s += 3.6) th.push([s + 0.9, 13.9, 1], [s + 2.7, 13.2, 1]);
    th.push([48.6, 13.2], [50.4, 12.6], [50.4, 0]);
    return ISO.tinted(ISO.T.brass, S(G.solidOf([[19.4, 1.4], [20.4, 3.6, 1], [21.6, 4]], F0, P, { steps: 24 }), { tone: "hi" })) +
      ISO.tinted(ISO.T.plastic, S(G.lathe([[21.4, 0], [21.4, 6], [23, 9.4, 1], [26.2, 11.6], [26.2, 0]], F0, P, { steps: 40 }), { tone: "mid" })) +
      `<g data-name="cap">${ISO.tinted(ISO.T.brass, S(G.lathe(th, F0, P, { steps: 56 }), { tone: "hi" }))}</g>`;
  }
  // inside the glass, drawn over it as seen through it: stem flare, button rod, lead-ins, supports, the coil.
  // (audit.mjs reports these as sunk in the glass: they are inside it, on purpose)
  function stemSvg(P) {
    const out = [ISO.tinted(ISO.T.glass, S(G.lathe([[50, 0], [50, 8.4], [56, 7.6, 1], [64, 4, 1], [76, 2.8], [82, 2.6, 1], [84, 0]], F0, P, { steps: 36 }), { tone: "lo" }))];
    out.push(ISO.tinted(ISO.T.glass, S(K.cylinder(0, 0, 1, 84, 14, P, 12), { tone: "lo" }) + S(K.cylinder(0, 0, 2, 98, 1.6, P, 16), { tone: "lo" })));
    const W = (pts, c, w) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
    out.push(W([[-1.6, 0, 80], [-4.4, 0, 92], [-14, 0, FZ + 0.4]], "#6b5a3a", 1.1), W([[1.6, 0, 80], [4.4, 0, 92], [14, 0, FZ + 0.4]], "#6b5a3a", 1.1));
    for (const x of [-7, 0, 7]) out.push(W([[0, 0, 99.6], [x * 0.6, 0, 106], [x, 0, FZ - 0.9]], "#7d8187", 0.7));
    return out.join("");
  }
  function coilSvg(P, pw, on) {
    const pts = [];
    for (let i = 0; i <= 260; i++) { const u = i / 260, x = -14 + 28 * u, sag = -1.1 * Math.sin(Math.PI * ((u * 4) % 1)), a = u * 2 * Math.PI * 30; pts.push(K.iso([x, 1.1 * Math.cos(a), FZ + sag + 1.1 * Math.sin(a)], P)); }
    return `<path d="${K.pathOf(pts)}" fill="none" stroke="${on ? hot(pw) : "#5a5048"}" stroke-width="${on ? 1.4 : 0.75}" stroke-linejoin="round"/>`;
  }
  function glowSvg(P, pw, id) {
    if (pw < 0.02) return "";
    const lt = lightOf(pw), k = K.cameraOf(P).k, c = K.iso([0, 0, FZ], P), warm = ISO.clamp((tempOf(pw) - 1500) / 1000, 0, 1);
    return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#fffbe8" stop-opacity="${(0.95 * Math.max(lt, 0.55)).toFixed(2)}"/><stop offset=".3" stop-color="${warm > 0.6 ? "#ffe9a8" : "#ffbe6e"}" stop-opacity="${(0.6 * Math.max(lt, 0.45)).toFixed(2)}"/><stop offset="1" stop-color="#ffd36b" stop-opacity="0"/></radialGradient></defs><circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${((22 + 52 * lt) * k).toFixed(1)}" fill="url(#${id})"/>`;
  }

  ISO.add({
    name: "bulb", title: "Filament light bulb", compare: "bulb 480 270 340 k=on",
    about: "A filament bulb in its holder: the foot contact and the thread carry the current, a thin tungsten coil heats to about 2500 °C and glows white; dimmed it glows orange and gives far less light.",
    line: "bulb cx cy height k=on|off power=0-100 out=0|1 lab=1 lit=glass|filament|cap|contact|switch",
    demo: { line: "bulb 480 270 360 k=off out=1", script: [{ set: {}, hold: 1.4 }, { set: { out: 0 }, hold: "settle" }, { set: { k: "on" }, hold: "settle" }, { set: { power: 35 }, hold: "settle" }] },
    make([cx, cy, size = 340], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.86;
      const { P, g } = ISO.frame([[-PLINTH, -PLINTH, -18], [PLINTH, PLINTH, -18], [PLINTH, -PLINTH, 0], [-PLINTH, PLINTH, 0], [0, 0, 162 + OUT * 0.5], [-30, 0, 120], [30, 0, 120]], cx, cy, W, H, { azimuth: 48, elevation: 18 }, parent);
      const id = ++uid, k = K.cameraOf(P).k;
      // the bulb is clipped above the front edge of the holder's mouth, so the part screwed in is hidden by the holder
      const mouth = G.arcPoints(F0, RIM, 14.2, 0, Math.PI * 2, 64).map((p) => K.iso(p, P)), front = mouth.filter((p, i) => K.depthOf(G.arcPoints(F0, RIM, 14.2, 0, Math.PI * 2, 64)[i], P) >= K.depthOf([0, 0, RIM], P));
      front.sort((a, b) => a[0] - b[0]);
      const clip = `M-9999 -9999H9999V${front.at(-1)[1].toFixed(1)}H${front.at(-1)[0].toFixed(1)}${front.slice().reverse().map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("")}H-9999Z`;
      g.innerHTML = `<defs><clipPath id="bulbclip${id}"><path d="${clip}"/></clipPath></defs><g>${baseSvg(P)}</g><g data-name="switch"></g>
        <g data-part="bulb" clip-path="url(#bulbclip${id})"><g data-name="contact">${capSvg(P)}</g>
        <g data-name="glass">${ISO.tinted(ISO.T.glass, S(G.lathe(GLASS, F0, P, { steps: 64 }), { tone: "mid" }))}</g>
        <g>${stemSvg(P)}</g><g data-name="filament"></g><g data-part="glow"></g></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { bulb: q("bulb"), coil: q("filament"), glow: q("glow"), sw: q("switch"), words: q("words") }, w = ISO.writer();
      const out0 = o.out === "1" ? 1 : 0;
      const s = { pw: 0, on: o.k === "on", goal: ISO.clamp(ISO.num(o, "power", 100), 0, 100) / 100, out: out0, wantOut: out0 };
      s.pw = s.on && !out0 ? s.goal : 0;
      let lit = o.lit || "";
      const draw = () => {
        const pq = Math.round(s.pw * 60) / 60;
        w.attr(el.bulb, "transform", K.translateAlong(P, [0, 0, OUT * ISO.ease(s.out)]));
        // the clip moves with the bulb's group, so shift the clip path back down by the same amount
        w.attr(g.querySelector(`#bulbclip${id} path`), "transform", K.translateAlong(P, [0, 0, -OUT * ISO.ease(s.out)]));
        w.rebuild(el.coil, `${pq}`, () => coilSvg(P, pq, pq > 0.01));
        w.rebuild(el.glow, `${pq}`, () => glowSvg(P, pq, `bulbglow${id}`));
        w.rebuild(el.sw, String(s.on), () => switchSvg(P, s.on));
        const up = s.out > 0.5, dz = OUT * ISO.ease(s.out);
        w.rebuild(el.words, lab ? `${s.on} ${Math.round(tempOf(pq) / 50)} ${up} ${dz.toFixed(0)}` : "", () => !lab ? "" : [
          ISO.word(K.iso([-16, 0, FZ + 8 + dz], P), pq > 0.01 ? `tungsten filament ≈ ${Math.round(tempOf(pq) / 50) * 50} °C` : "tungsten filament", pq > 0.01 ? "#b5541a" : "#444", { size: 14, anchor: "end", dy: -46 }),
          ISO.word(K.iso([30, 0, 128 + dz], P), "glass bulb, filled with argon", "#1f4f8f", { size: 13, anchor: "start" }),
          ...(up ? [ISO.word(K.iso([-14, 0, 38 + dz], P), "screw thread: one wire", "#6b5114", { size: 13, anchor: "end" }),
            ISO.word(K.iso([-6, 0, 21 + dz], P), "foot contact: the other wire", "#6b5114", { size: 13, anchor: "end", dy: 6 }),
            ISO.word(K.iso([12, 0, 23 + dz], P), "black glass keeps them apart", "#444", { size: 12, anchor: "start", dy: 8 })]
            : [ISO.word(K.iso([-16, 0, 40], P), "screw cap", "#6b5114", { size: 13, anchor: "end" })]),
          ISO.word(K.iso([36, 34, 0], P), s.on ? "switch on" : "switch off", "#444", { size: 13, anchor: "start", dy: 14 })].join(""));
        w.light(["glass", "filament", "cap", "contact", "switch"].map(q), [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.k !== undefined) s.on = p.k === "on";
        if (p.power !== undefined) s.goal = ISO.clamp(+p.power, 0, 100) / 100;
        if (p.out !== undefined) s.wantOut = +p.out ? 1 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      // the bulb lifts out or screws in over about a second; a filament heats and cools in a few tenths
      g.update = (dt) => {
        const calm = ISO.still();
        s.out = ISO.follow(s.out, s.wantOut, dt, 0.28, calm); if (Math.abs(s.out - s.wantOut) < 0.003) s.out = s.wantOut;
        const target = s.on && s.out === 0 ? s.goal : 0;
        s.pw = ISO.follow(s.pw, target, dt, 0.18, calm); if (Math.abs(s.pw - target) < 0.004) s.pw = target;
        draw();
        return s.pw !== target || s.out !== s.wantOut;
      };
      g.readout = () => s.out > 0 ? "bulb out of its holder · current comes in at the foot contact, through the filament, out by the screw thread"
        : !s.on ? "off · no current, the filament is cold"
        : `${Math.round(60 * s.goal)} W · filament ≈ ${Math.round(tempOf(s.pw) / 50) * 50} °C · light ${Math.round(lightOf(s.pw) * 100)} % of full · only about 5 % of the power becomes light, the rest is heat`;
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
