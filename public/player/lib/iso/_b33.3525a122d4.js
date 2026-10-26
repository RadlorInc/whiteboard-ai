// Shared bits for batch 33 (computer parts: fans, cables, smooth shells, screen words). Not a recipe: it only defines
// window.B33, which deskmonitor, pcmouse, pctower, towercooler, gpucard, atxpsu and casefan call at make time.
// World units here are whatever P is (the parts pass ISO.mm(P): 1 = 1 mm).
(() => {
  const K = window.K, G = window.G;
  const B = (window.B33 = {});
  const TAU = Math.PI * 2;
  const pt = (c, U, V, a, r) => [c[0] + r * (U[0] * Math.cos(a) + V[0] * Math.sin(a)), c[1] + r * (U[1] * Math.cos(a) + V[1] * Math.sin(a)), c[2] + r * (U[2] * Math.cos(a) + V[2] * Math.sin(a))];
  B.pt = pt;
  // a flat circle in the plane (U, V) about c
  B.circle = (P, c, U, V, r, n = 40) => K.pathOf(Array.from({ length: n }, (_, i) => K.iso(pt(c, U, V, (i / n) * TAU, r), P)), true);
  // a fan's dark bore (drawn first, struts over it), then its rotor: n swept blades from the hub (0.3 r) to the tip
  B.bore = (P, c, U, V, r) => `<path d="${B.circle(P, c, U, V, r)}" fill="#1b1e22" stroke="#0c0d0f" stroke-width=".6"/>`;
  B.rotor = (P, c, U, V, r, a0, n = 7, fill = "#3e434b") => {
    const at = (a, rr) => K.iso(pt(c, U, V, a, rr), P), out = [];
    const rh = r * 0.3, rt = r * 0.95, bl = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + (i * TAU) / n, p = [];
      for (let j = 0; j <= 4; j++) { const t = j / 4; p.push(at(a + 0.42 * t * t, rh + (rt - rh) * t)); }
      for (let j = 1; j <= 3; j++) p.push(at(a + 0.42 + (0.5 * j) / 3, rt));
      for (let j = 4; j >= 0; j--) { const t = j / 4; p.push(at(a + 0.55 + 0.37 * t * t, rh + (rt - rh) * t)); }
      bl.push(K.pathOf(p, true));
    }
    out.push(`<path d="${bl.join("")}" fill="${fill}" stroke="#101215" stroke-width=".55" stroke-linejoin="round"/>`);
    return out.join("");
  };
  // the hub in front of the blades: a short drum along axis A (toward the viewer) with a plain round sticker
  B.hub = (P, c, A, r, h, sticker = "#e4e6e9") => {
    const F = G.frameAlong(c, A);
    return ISO.tinted(ISO.T.plastic, K.solidSvg(G.disc(0, h, r, F, P), { tone: "mid" })) +
      `<path d="${G.circleOf(F, h + 0.05, r * 0.72, P)}" fill="${sticker}" stroke="#55595f" stroke-width=".5"/><path d="${G.circleOf(F, h + 0.06, r * 0.22, P)}" fill="none" stroke="#8a8f96" stroke-width=".5"/>`;
  };
  // which of 12 poses a 7-blade rotor turned by angle a is in (it repeats every 1/7 turn)
  B.pose = (a, n = 7) => { const s = TAU / n; return Math.floor((((a % s) + s) % s / s) * 12) % 12; };
  B.angle = (q, n = 7) => (q / 12) * (TAU / n);
  // a round cable along world points: dark edge, colour, a soft highlight
  B.cable = (P, pts, r, color = "#2b2e33", ink = "#0e0f11") => {
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = K.screenRise(1, P) * r * 2;
    return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${(w + 1.1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="${(w * 0.22).toFixed(2)}" stroke-linecap="round" opacity=".18" transform="translate(-0.3 -0.5)"/>`;
  };
  // a smooth convex shell (a mouse): the outline of its points filled with a soft gradient, an ink edge
  let n = 0;
  B.shell = (P, V, [dark, light], ink) => {
    const id = `b33s${n++}`, hull = K.pathOf(ISO.hullOf(V.map((v) => K.iso(v, P))), true);
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${dark}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs><path d="${hull}" fill="url(#${id})" stroke="${ink}" stroke-width=".9" stroke-linejoin="round"/>`;
  };
  // built-in screen words go through the label helper's translator, then into markup
  B.say = (t) => ISO.esc(ISO.say(t));
})();
