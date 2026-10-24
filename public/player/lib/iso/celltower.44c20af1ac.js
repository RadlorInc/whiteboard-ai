// "celltower cx cy height phone=0-360 lab=1 lit=antenna|radio|dish|cabinet|phone" — a mobile phone mast.
// A 30 m steel monopole in a fenced compound: three sectors of panel antennas on the head frame, each pair facing
// out 120° apart with its radio unit behind it, a microwave dish that links the site to the network, the cable
// ladder down the pole and the equipment cabinets on the concrete pad, with the red aircraft light on top. A phone
// on a bench nearby talks to whichever sector faces it: that sector lights and its radio waves run out toward the
// phone. Move the phone (phone= bearing in degrees) and the call hands over to the next sector. set({ phone, lit }).
// World units: 1 = 1 m.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const H = 30, HEAD = 27.4, AR = 1.9, SECT = [90, 210, 330], PR = 14;
  // the head is drawn with a projection NS times larger about its centre, so the antennas read at board size
  const NS = 2.4, big = (v) => [v[0] * NS, v[1] * NS, HEAD + (v[2] - HEAD) * NS];
  const rad = (d) => (d * Math.PI) / 180, zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const GALV = ISO.tint("#e7e9ec", ["#a6abb2", "#b5b9bf", "#c4c7cc", "#d2d4d8"], "#4a4f56"), PANEL = ISO.tint("#f4f5f6", ["#bfc3c8", "#cbcfd3", "#d7dade", "#e3e5e8"], "#4a4f56");
  const GROUND = { x: -17, y: -17, w: 34, d: 34, r: 2 };
  const sectorOf = (phi) => { let best = 0, bd = 999; SECT.forEach((a, i) => { const d = Math.abs(((phi - a + 540) % 360) - 180); if (d < bd) { bd = d; best = i; } }); return best; };

  function siteSvg(P) {
    const out = [ISO.tinted(ISO.tint("#e6ead9", ["#b3b9a2", "#bec4ae", "#c9cfba", "#d4d9c6"], "#5a604c"), S(K.slabOf(GROUND, -1, 1, P, 4), { tone: "lo", halo: true }))];
    out.push(ISO.tinted(ISO.T.road, S(K.slabOf({ x: -5, y: -5, w: 10, d: 10, r: 0.4 }, 0, 0.3, P, 2), { tone: "lo" })));
    // the fence: posts at the corners and along the sides, with a top rail, back sides first
    const posts = [];
    for (let i = 0; i <= 4; i++) { const u = -5 + i * 2.5; posts.push([u, -5], [u, 5]); if (i > 0 && i < 4) posts.push([-5, u], [5, u]); }
    posts.sort((a, b) => K.depthOf([a[0], a[1], 0], P) - K.depthOf([b[0], b[1], 0], P));
    const rails = [[[-5, -5], [5, -5]], [[-5, -5], [-5, 5]], [[5, -5], [5, 5]], [[-5, 5], [5, 5]]].map(([a, b]) => K.pathOf([K.iso([a[0], a[1], 2], P), K.iso([b[0], b[1], 2], P)]) + K.pathOf([K.iso([a[0], a[1], 1], P), K.iso([b[0], b[1], 1], P)]));
    out.push(`<path d="${rails.slice(0, 2).join("")}" stroke="#7d838b" stroke-width=".6" fill="none"/>`);
    return { under: out.join(""), posts, rails };
  }
  function fenceFront(P, posts, rails) {
    return posts.map(([x, y]) => ISO.tinted(GALV, S(K.cylinder(x, y, 0.05, 0.3, 1.9, P, 6), { tone: "mid", crease: "none" }))).join("") + `<path d="${rails.slice(2).join("")}" stroke="#5f656d" stroke-width=".7" fill="none"/>`;
  }
  // the cabinets on the pad: radio/baseband cabinet and the power cabinet with its battery backup
  function cabinetsSvg(P) {
    return `<g data-name="cabinet">${ISO.tinted(ISO.T.paint, ISO.wbox(P, [-3.8, -1.6], [1.2, 2.6], [0.3, 2.2], "mid"))}${ISO.tinted(ISO.T.paint, ISO.wbox(P, [-3.8, -1.6], [-1.4, 0.4], [0.3, 2.2], "mid"))}${ISO.tinted(GALV, ISO.wbox(P, [-1.6, -0.5], [0.6, 1.0], [2.0, 2.2], "mid"))}</g>`;
  }
  function poleSvg(P) {
    const F = zAx([0, 0, 0]), out = [ISO.tinted(ISO.T.road, S(K.cylinder(0, 0, 1.2, 0.3, 0.6, P, 24), { tone: "lo" }))];
    out.push(ISO.tinted(GALV, S(G.lathe([[0.9, 0], [0.9, 0.62], [HEAD, 0.34], [HEAD, 0]], F, P, { steps: 32 }), { tone: "mid", inner: `<path d="${G.arcOf(F, 10, 0.62 - (0.28 * 9.1) / (HEAD - 0.9), P) + G.arcOf(F, 19, 0.62 - (0.28 * 18.1) / (HEAD - 0.9), P)}" fill="none" stroke="#8d939a" stroke-width=".6"/>` })));
    // the cable ladder up the pole's side, from the cabinet's feed box to the head
    out.push(ISO.tinted(GALV, ISO.wbox(P, [-0.55, -0.35], [0.5, 0.8], [2.2, HEAD - 0.4], "lo")));
    return out.join("");
  }
  // the head: a triangular frame, three sectors of two panels and their radios, the dish, the top mast and light
  function headSvg(P, active) {
    const out = [], items = [];
    out.push(ISO.tinted(GALV, S(K.cylinder(0, 0, 0.42, HEAD, 0.3, P, 20), { tone: "mid" })));
    for (let i = 0; i < 3; i++) {
      const a = rad(SECT[i]), b = rad(SECT[(i + 1) % 3]), p0 = [AR * Math.cos(a), AR * Math.sin(a)], p1 = [AR * Math.cos(b), AR * Math.sin(b)];
      items.push({ k: K.depthOf([(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, HEAD], P) - 1, svg: `<path d="${K.pathOf([K.iso([p0[0], p0[1], HEAD + 0.15], P), K.iso([p1[0], p1[1], HEAD + 0.15], P)])}" stroke="#5f656d" stroke-width="1.6" stroke-linecap="round"/>` });
      items.push({ k: K.depthOf([p0[0] / 2, p0[1] / 2, HEAD], P) - 0.5, svg: `<path d="${K.pathOf([K.iso([0, 0, HEAD + 0.15], P), K.iso([p0[0], p0[1], HEAD + 0.15], P)])}" stroke="#5f656d" stroke-width="1.2"/>` });
    }
    SECT.forEach((deg, i) => {
      const a = rad(deg), c = Math.cos(a), sn = Math.sin(a), on = i === active;
      for (const off of [-0.4, 0.4]) {
        const o = [AR * c - off * sn, AR * sn + off * c], at = (u, w, v) => [o[0] + u * c - w * sn + v * 0.07 * c, o[1] + u * sn + w * c + v * 0.07 * sn, HEAD - 0.3 + v];
        items.push({ k: K.depthOf([o[0], o[1], HEAD], P), svg: `<g data-name="radio">${ISO.tinted(GALV, ISO.box((u, w, v) => [o[0] - 0.42 * c + u * c - w * sn, o[1] - 0.42 * sn + u * sn + w * c, HEAD + v], P, [-0.15, 0.15], [-0.16, 0.16], [0.2, 0.9], "mid"))}</g><g data-name="antenna">${ISO.tinted(on ? ISO.T.amber : PANEL, ISO.box(at, P, [-0.07, 0.07], [-0.16, 0.16], [0, 1.7], on ? "hi" : "mid"))}</g>` });
      }
    });
    // the microwave dish on a short arm, pointing out between two sectors, and the lightning mast with its lamp
    const dA = rad(150), dp = [1.1 * Math.cos(dA), 1.1 * Math.sin(dA), HEAD + 1.1], DF = G.frameAlong(dp, [Math.cos(dA), Math.sin(dA), 0]);
    items.push({ k: K.depthOf(dp, P), svg: `<g data-name="dish">${ISO.tinted(GALV, S(G.disc(-1.1, 0, 0.08, DF, P, { steps: 8 }), { tone: "mid" }))}${ISO.tinted(PANEL, S(G.lathe([[0, 0], [0, 0.18], [0.12, 0.34, 1], [0.28, 0.44], [0.32, 0.44], [0.32, 0]], DF, P, { steps: 28 }), { tone: "hi" }))}</g>` });
    items.sort((p, q) => p.k - q.k).forEach((it) => out.push(it.svg));
    out.push(ISO.tinted(GALV, S(K.cylinder(0, 0, 0.08, HEAD + 0.3, H - HEAD - 0.6, P, 8), { tone: "mid", crease: "none" })));
    out.push(ISO.tinted(ISO.T.red, S(G.sphereOf([0, 0, H - 0.15], 0.18, P, { steps: 16 }), { tone: "hi" })));
    return out.join("");
  }
  // the phone propped on a bench at bearing phi
  function phoneSvg(P, phi) {
    const c = Math.cos(rad(phi)), s = Math.sin(rad(phi)), o = [PR * c, PR * s], t = [-s, c];
    const at = (u, w, z) => [o[0] + u * c + w * t[0], o[1] + u * s + w * t[1], z];
    const out = [];
    for (const w of [-0.7, 0.7]) out.push(ISO.tinted(ISO.T.wood, ISO.box(at, P, [-0.2, 0.2], [w - 0.08, w + 0.08], [0, 0.42], "mid")));
    out.push(ISO.tinted(ISO.T.wood, ISO.box(at, P, [-0.22, 0.22], [-0.9, 0.9], [0.42, 0.5], "mid")));
    // the phone (drawn about three times life size so it reads), leaning back on the bench, its screen lit
    const lean = (u, w, z) => at(u - 0.35 * (z - 0.5), w, z);
    out.push(`<g data-name="phone">${ISO.tinted(ISO.T.plastic, ISO.box(lean, P, [-0.03, 0.03], [-0.13, 0.13], [0.5, 1.05], "hi"))}</g>`);
    return out.join("");
  }
  // radio waves: arcs running from the active sector's antennas out toward the phone
  function wavesSvg(P, active, phi, t) {
    const a = rad(SECT[active]), from = big([AR * Math.cos(a), AR * Math.sin(a), HEAD + 0.5]), to = [PR * Math.cos(rad(phi)), PR * Math.sin(rad(phi)), 0.6];
    const d = G.sub3(to, from), dist = G.len3(d), u = G.unit3(d), side = G.unit3(G.cross3(u, [0, 0, 1])), up = G.cross3(side, u), out = [];
    for (let i = 0; i < 4; i++) {
      const f = (t * 0.35 + i / 4) % 1, r = 1 + f * (dist - 1.5), pts = [];
      for (let j = 0; j <= 14; j++) { const ang = -0.45 + (0.9 * j) / 14, v = G.add3(G.mul3(u, Math.cos(ang) * r), G.add3(G.mul3(side, Math.sin(ang) * r * 0.9), G.mul3(up, Math.sin(ang) * r * 0.25))); pts.push(K.iso(G.add3(from, v), P)); }
      out.push(`<path d="${K.pathOf(pts)}" fill="none" stroke="#e08a1a" stroke-width="1.4" stroke-linecap="round" opacity="${(0.85 * Math.sin(Math.PI * f)).toFixed(2)}"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "celltower", title: "Mobile phone mast", compare: "celltower 480 270 420",
    about: "A mobile phone mast: three sectors of antennas each cover a third of the circle, and a phone talks to the sector that faces it, handing over as it moves.",
    line: "celltower cx cy height phone=0-360 lab=1 lit=antenna|radio|dish|cabinet|phone",
    demo: { line: "celltower 480 270 440 phone=60", script: [{ set: {}, hold: 2.4 }, { set: { phone: 200 }, hold: 3.6 }, { set: { phone: 320 }, hold: 3.6 }] },
    make([cx, cy, size = 420], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, Hh = size * 1.02;
      const { P, g } = ISO.frame([...K.boxCorners(GROUND, -1, 0), big([0, 0, H + 0.6]), big([AR + 0.6, 0, HEAD]), big([-AR - 0.6, 0, HEAD]), big([0, AR + 0.6, HEAD]), big([0, -AR - 0.6, HEAD])], cx, cy, W, Hh, { azimuth: 40, elevation: 18 }, parent);
      const site = siteSvg(P), T0 = K.iso([0, 0, HEAD], P), P2 = { ...P, scale: P.scale * NS, origin: [T0[0] - NS * (T0[0] - P.origin[0]), T0[1] - NS * (T0[1] - P.origin[1])] };
      g.innerHTML = `<g>${site.under}</g><g data-part="items"><g data-part="mast">${cabinetsSvg(P)}${poleSvg(P)}<g data-part="head"></g>${fenceFront(P, site.posts, site.rails)}</g><g data-part="phoneat"></g></g><g data-part="waves"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { items: q("items"), mast: q("mast"), head: q("head"), ph: q("phoneat"), waves: q("waves"), words: q("words") }, w = ISO.writer();
      const sort = ISO.sorter(P, el.items);
      const s = { phi: ISO.num(o, "phone", 60) % 360, want: ISO.num(o, "phone", 60) % 360, t: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const pq = Math.round(s.phi * 2) / 2, act = sectorOf(pq);
        w.rebuild(el.head, String(act), () => headSvg(P2, act));
        w.rebuild(el.ph, String(pq), () => phoneSvg(P, pq));
        sort({ mast: el.mast, phone: el.ph }, { mast: [0, 0, 0], phone: [PR * Math.cos(rad(pq)), PR * Math.sin(rad(pq)), 0] });
        w.rebuild(el.waves, `${act} ${pq} ${(Math.round(s.t * 30) / 30).toFixed(2)}`, () => wavesSvg(P, act, pq, Math.round(s.t * 30) / 30));
        w.rebuild(el.words, lab ? `${act} ${pq}` : "", () => !lab ? "" : [
          ISO.word(K.iso([0, 0, H], P2), `sector ${act + 1} of 3 serves the phone`, "#b5541a", { size: 13, anchor: "start" }).replace('x="', 'dx="14" x="'),
          ISO.word(K.iso([PR * Math.cos(rad(pq)), PR * Math.sin(rad(pq)), 0.8], P), "phone", "#444", { size: 13, dy: -10 }),
          ISO.word(K.iso([-3.8, 2.6, 0.3], P), "radio cabinets", "#1f4f8f", { size: 12, anchor: "end", dy: 14 }),
          ISO.word(K.iso([0, 0, HEAD - 0.6], P2), "antennas: 3 sectors × 120°", "#444", { size: 12, anchor: "end" }).replace('x="', 'dx="-16" x="')].join(""));
        w.light([...g.querySelectorAll('[data-name="antenna"],[data-name="radio"],[data-name="dish"],[data-name="cabinet"],[data-name="phone"]')], [...g.querySelectorAll(`[data-name="${lit}"]`)]);
      };
      g.set = (p) => {
        if (p.phone !== undefined) s.want = ((+p.phone % 360) + 360) % 360;
        if (p.lit !== undefined) lit = p.lit;
      };
      // the phone walks round the mast the short way
      g.update = (dt) => {
        s.t += dt;
        const d = ((s.want - s.phi + 540) % 360) - 180, step = ISO.still() ? d : d * (1 - Math.exp(-dt / 0.6));
        s.phi = Math.abs(d) < 0.05 ? s.want : (s.phi + step + 360) % 360;
        draw();
        return true;
      };
      g.readout = () => { const act = sectorOf(s.phi); return `phone at bearing ${Math.round(s.phi)}° · served by sector ${act + 1}, its antennas facing ${SECT[act]}° · each sector covers 120° out to a few km · calls go down the pole to the radio cabinet, then over the microwave dish to the network`; };
      draw();
      if (t) label(parent, cx, cy + Hh / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
