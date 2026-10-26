// "phonemast cx cy k h=1500..4000 phone=0..360 call=0|1 lab=0 lit=pole|antenna|radio|dish|ladder|light|base" — a PART
// (batch 6): celltower.js's steel mobile monopole at real size (h = its height in cm, 30 m by default; the head is
// NOT drawn larger, as the scene does). A concrete foundation with the base plate, its anchor nuts and four gussets;
// the galvanised pole tapering from 60 to 38 cm across, its two slip joints and the access hatch; the cable ladder up
// its side with the feeder cables from the entry port; 3 m below the top the triangular head frame (two levels of
// arms and face tubes) with three sectors, each two panel antennas with their radio units behind on mount pipes
// (B31.panelItems), facing 90°, 210° and 330°; the microwave link dish on an arm below the head, facing 150°; the
// lightning mast on top with the red aircraft light. phone = the bearing of the phone it serves (0 = +x, 90 = +y);
// call=1 lights the sector facing it and its radio waves run out toward the phone (25 m away, down at hand height);
// the light flashes about 40 times a minute. set({ phone, call }). Origin: the ground point under the pole's middle.
// World: 1 = 1 cm. anchors: base (the base plate's top), port (the cable entry), dish (its face), head, top.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const SECT = [90, 210, 330], AR = 85, ZB = 34, R0 = 30, R1 = 19, FAR = 2500, DISH = 150;
  const rad = (d) => (d * Math.PI) / 180;
  const CONC = ISO.tint("#e4e2dc", ["#aeaba3", "#bab7af", "#c6c3bb", "#d2cfc7"], "#5f5c55");
  const sectorOf = (phi) => { let best = 0, bd = 999; SECT.forEach((a, i) => { const d = Math.abs(((phi - a + 540) % 360) - 180); if (d < bd) { bd = d; best = i; } }); return best; };
  const GW = (P, w) => Math.max(0.6, K.cameraOf(P).k * w).toFixed(2);

  function geometry(H) {
    const TOP = H - 200, HEAD = H - 300, rAt = (z) => R0 - ((R0 - R1) * (ISO.clamp(z, ZB, TOP) - ZB)) / (TOP - ZB);
    return { H, TOP, HEAD, rAt, ZD: HEAD - 260 };
  }
  // foundation, base plate with its anchor nuts, the far gussets (−x, −y); the near ones go after the pole
  function baseSvg(P, M) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -90, y: -90, w: 180, d: 180, r: 6 }, 0, 0.1, P)}"/>`];
    out.push(ISO.tinted(CONC, S(K.slabOf({ x: -80, y: -80, w: 160, d: 160, r: 3 }, 0, 30, P, 3, 1.5), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -45, y: -45, w: 90, d: 90, r: 2 }, 30, 4, P, 3), { tone: "mid" })));
    const nuts = [];
    for (let i = 0; i < 8; i++) { const a = rad(22.5 + i * 45); nuts.push([38 * Math.cos(a), 38 * Math.sin(a)]); }
    nuts.sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
    out.push(ISO.tinted(ISO.T.steel, nuts.map(([x, y]) => S(K.cylinder(x, y, 3, ZB, 3, P, 6), { tone: "mid" }) + S(K.cylinder(x, y, 1.4, ZB + 3, 3, P, 10), { tone: "mid" })).join("")));
    return out.join("");
  }
  function gusset(P, ax) {
    const ink = "#4a4f56", sh = ["#a6abb2", "#d2d4d8"], face = "#c4c7cc", s = ax[0] + ax[1];
    if (ax[0]) return ISO.prismY(P, [[s * R0, ZB], [s * 44, ZB], [s * R0, ZB + 30]], -0.8, 0.8, sh, face, ink);
    return ISO.prismX(P, [[s * R0, ZB], [s * 44, ZB], [s * R0, ZB + 30]], -0.8, 0.8, sh, face, ink);
  }
  function poleSvg(P, M) {
    const F = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), j1 = ZB + (M.TOP - ZB) / 3, j2 = ZB + (2 * (M.TOP - ZB)) / 3;
    const joints = [j1, j2].map((z) => G.arcOf(F, z, M.rAt(z) + 0.6, P)).join("");
    let s = ISO.tinted(B31.GALV, S(G.lathe([[ZB, 0], [ZB, R0], [M.TOP, R1], [M.TOP, 0]], F, P, { steps: 40 }), { tone: "mid", inner: `<path d="${joints}" fill="none" stroke="#8d939a" stroke-width="${GW(P, 1.2)}"/>` }));
    // the slip-joint collars and the access hatch on the side facing the viewer
    s += [j1, j2].map((z) => ISO.tinted(B31.GALV, S(G.ringBand(z - 6, z, M.rAt(z) - 0.5, M.rAt(z) + 1.2, F, P, { steps: 40 }), { tone: "mid" }))).join("");
    const af = Math.atan2(K.depthOf([0, 1, 0], P) - K.depthOf([0, 0, 0], P), K.depthOf([1, 0, 0], P) - K.depthOf([0, 0, 0], P));
    const hatch = []; for (let i = 0; i <= 8; i++) { const a = af - 0.35 + (0.7 * i) / 8; hatch.push([Math.cos(a), Math.sin(a), 100]); }
    for (let i = 8; i >= 0; i--) { const a = af - 0.35 + (0.7 * i) / 8; hatch.push([Math.cos(a), Math.sin(a), 180]); }
    s += `<path d="${K.pathOf(hatch.map(([c, n, z]) => K.iso([c * (M.rAt(z) + 0.1), n * (M.rAt(z) + 0.1), z], P)), true)}" fill="none" stroke="#6a7078" stroke-width="${GW(P, 0.8)}"/>`;
    // the cap, the lightning mast and its spike
    s += ISO.tinted(B31.GALV, S(K.cylinder(0, 0, R1 + 2, M.TOP, 4, P, 24), { tone: "mid" }) + S(K.cylinder(0, 0, 3, M.TOP + 4, M.H - 40 - M.TOP - 4, P, 10), { tone: "mid", crease: "none" }));
    return `<g data-name="pole">${s}</g>`;
  }
  // the cable ladder: two rails standing off the tapering pole at bearing 90°, rungs every 30 cm, three feeders on
  // it from the entry port to the head
  function ladderSvg(P, M) {
    const z0 = 250, z1 = M.HEAD - 80, at = (u, w, h) => [u, M.rAt(h) + 2 + w, h];
    let s = ISO.tinted(B31.GALV, ISO.box(at, P, [-13, -11], [0, 5], [z0, z1], "mid") + ISO.box(at, P, [11, 13], [0, 5], [z0, z1], "mid"));
    const rungs = []; for (let z = z0 + 30; z < z1 - 10; z += 30) rungs.push(K.pathOf([K.iso(at(-11, 2.5, z), P), K.iso(at(11, 2.5, z), P)]));
    s += `<path d="${rungs.join("")}" stroke="#8d939a" stroke-width="${GW(P, 1)}"/>`;
    s += `<path d="${[-6, 0, 6].map((u) => K.pathOf([K.iso(at(u, 6, z0 + 20), P), K.iso(at(u, 6, z1), P)])).join("")}" stroke="#26272b" stroke-width="${GW(P, 2.4)}" stroke-linecap="round"/>`;
    s += ISO.tinted(B31.RADIO, ISO.box(at, P, [-16, 16], [0, 9], [z0 - 30, z0 + 20], "mid"));
    return `<g data-name="ladder">${s}</g>`;
  }
  // the head frame: per level, three arms from a collar to the face tubes, which run between the triangle's corners
  // only = one sector's arms, tubes and panels (the collars come with sector 0), so a build can take a slice each
  function headItems(P, M, act, call, full, only = -1) {
    const items = [], dep = (p) => K.depthOf(p, P), tube = (a, b) => `<path d="${K.pathOf([K.iso(a, P), K.iso(b, P)])}" stroke="#7d838b" stroke-width="${GW(P, 6)}" stroke-linecap="round"/>`;
    for (const z of [M.HEAD - 60, M.HEAD + 60]) {
      if (only <= 0) items.push({ k: dep([0, 0, z]) + 0.5, svg: B31.band(P, [0, 0], M.rAt(z), z - 6, 12) });
      SECT.forEach((d, i) => {
        if (only >= 0 && i !== only) return;
        const a = rad(d), c = [AR * Math.cos(a), AR * Math.sin(a), z], v0 = [2 * AR * Math.cos(a - rad(60)), 2 * AR * Math.sin(a - rad(60)), z], v1 = [2 * AR * Math.cos(a + rad(60)), 2 * AR * Math.sin(a + rad(60)), z];
        items.push({ k: dep([c[0] / 2, c[1] / 2, z]), svg: tube([0, 0, z], c) });
        items.push({ k: dep(c) - 2, svg: tube(v0, v1) });
      });
    }
    SECT.forEach((d, i) => {
      if (only >= 0 && i !== only) return;
      const a = rad(d), n = [Math.cos(a), Math.sin(a), 0], sd = [-n[1], n[0], 0];
      for (const off of [-55, 55]) {
        const o = [AR * n[0] + off * sd[0], AR * n[1] + off * sd[1], M.HEAD];
        items.push(...B31.panelItems(P, o, n, { on: call && i === act, full, pipe: [-90, 90] }));
      }
    });
    return items;
  }
  function dishItems(P, M) {
    const a = rad(DISH), n = [Math.cos(a), Math.sin(a), 0], r = M.rAt(M.ZD);
    const items = B31.dishItems(P, [0, 0, M.ZD], n, { pipeR: r + 0.5, arm: r + 22, stub: false });
    items.push({ k: K.depthOf([0, 0, 0], P) + 0.1, svg: B31.band(P, [0, 0], r, M.ZD - 4, 8) });
    return items.map((it) => ({ k: it.k, svg: it.svg, name: "dish" }));
  }
  // the aircraft light: a red lens on its base and the spike above; on = lit, with a soft glow (both drawn once)
  const RED_OFF = ISO.tint("#9a4a42", ["#5a1e18", "#66241e", "#722a24", "#7e302a"], "#2a0a08");
  function lightSvg(P, M, on) {
    const c = [0, 0, M.H - 28], kk = K.cameraOf(P).k;
    let s = ISO.tinted(B31.GALV, S(K.cylinder(0, 0, 9, M.H - 40, 4, P, 16), { tone: "mid" }));
    s += ISO.tinted(on ? ISO.T.red : RED_OFF, S(K.cylinder(0, 0, 7, M.H - 36, 12, P, 16), { tone: "hi" }) + S(K.cylinder(0, 0, 4, M.H - 24, 4, P, 12), { tone: "hi" }));
    s += ISO.tinted(B31.GALV, S(K.cylinder(0, 0, 1, M.H - 20, 20, P, 8), { tone: "mid", crease: "none" }));
    if (on) { const p = K.iso(c, P); s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${Math.max(4, 40 * kk).toFixed(1)}" fill="#ff5a4a" opacity=".3"/>`; }
    return s;
  }
  // radio waves: arcs running from the active sector out toward the phone, 25 m away at hand height
  function wavesSvg(P, M, act, phi, t) {
    const a = rad(SECT[act]), from = [(AR + 21) * Math.cos(a), (AR + 21) * Math.sin(a), M.HEAD], to = [FAR * Math.cos(rad(phi)), FAR * Math.sin(rad(phi)), 120];
    const d = G.sub3(to, from), dist = G.len3(d), u = G.unit3(d), side = G.unit3(G.cross3(u, [0, 0, 1])), up = G.cross3(side, u), out = [];
    for (let i = 0; i < 4; i++) {
      const f = (t * 0.35 + i / 4) % 1, r = 60 + f * (dist - 80), pts = [];
      for (let j = 0; j <= 14; j++) { const ang = -0.3 + (0.6 * j) / 14, v = G.add3(G.mul3(u, Math.cos(ang) * r), G.add3(G.mul3(side, Math.sin(ang) * r * 0.9), G.mul3(up, Math.sin(ang) * r * 0.25))); pts.push(K.iso(G.add3(from, v), P)); }
      out.push(`<path data-free d="${K.pathOf(pts)}" fill="none" stroke="#e08a1a" stroke-width="1.4" stroke-linecap="round" opacity="${(0.85 * Math.sin(Math.PI * f)).toFixed(2)}"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "phonemast", title: "Mobile phone mast (part)", compare: null,
    about: "A 30 m steel mobile monopole: three sectors of two panel antennas with their radios on the head frame, a microwave dish, a cable ladder and a red aircraft light; the sector facing the phone lights and sends radio waves to it. anchors: base port dish head top",
    line: "phonemast cx cy k h=1500..4000 phone=0..360 call=0|1 lab=0 lit=pole|antenna|radio|dish|ladder|light|base",
    demo: { line: "phonemast 480 505 0.2 h=2400 phone=60 call=1", script: [{ set: {}, hold: 2.4 }, { set: { phone: 200 }, hold: 3 }, { set: { phone: 320, lit: "dish" }, hold: 3 }, { set: { call: 0, lit: "ladder" }, hold: 1.6 }] },
    make([cx = 480, cy = 500, k = 0.2], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const M = geometry(Math.round(B31.num(o, "h", 3000, 1500, 4000))), full = k >= 0.8;
      // the head's items behind the pole, the pole with its ladder and dish, the head's items in front of it
      g.innerHTML = `<g data-name="base" data-part="base"></g><g data-part="back"></g><g data-part="mid"></g><g data-part="front"></g>` +
        `<g data-name="base" data-part="base2"></g><g data-name="light" data-part="light"></g><g data-part="waves"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-part="${n}"]`), el = { back: q("back"), front: q("front"), light: q("light"), waves: q("waves"), words: q("words") }, w = ISO.writer();
      // build slices (ISO.later): the foundation, then the pole, the ladder and each piece of the dish
      ISO.later(() => { q("base").innerHTML = baseSvg(P, M) + [[-1, 0], [0, -1]].map((ax) => gusset(P, ax)).join(""); q("base2").innerHTML = [[1, 0], [0, 1]].map((ax) => gusset(P, ax)).join(""); q("base")._fresh = q("base2")._fresh = true; });
      const poleK = K.depthOf([0, 0, 0], P);
      B31.place(q("mid"), [{ k: poleK, svg: () => poleSvg(P, M) }, { k: K.depthOf([0, R0, 0], P), svg: () => ladderSvg(P, M) }, ...dishItems(P, M)]);
      const da = rad(DISH);
      g.anchors = { base: [0, 0, ZB], port: [0, M.rAt(250) + 11, 245], dish: [(M.rAt(M.ZD) + 41) * Math.cos(da), (M.rAt(M.ZD) + 41) * Math.sin(da), M.ZD], head: [0, 0, M.HEAD], top: [0, 0, M.H] };
      const phi0 = ((B31.num(o, "phone", 60, 0, 360) % 360) + 360) % 360;
      const s = { phi: phi0, want: phi0, call: o.call === "1", t: 0, lit: o.lit || "" };
      // the head: the first build takes a slice per sector, then sorts them behind and in front of the pole
      const fillHead = (items, key) => {
        w.rebuild(el.back, key, () => B31.sorted(items.filter((i) => i.k < poleK)));
        el.front._key = ""; w.rebuild(el.front, key, () => B31.sorted(items.filter((i) => i.k >= poleK)));
      };
      const head = { ready: false, parts: [] };
      for (const i of [0, 1, 2]) ISO.later(() => { head.parts[i] = headItems(P, M, sectorOf(s.phi), s.call, full, i); });
      ISO.later(() => { const act = sectorOf(Math.round(s.phi * 2) / 2); fillHead(head.parts.flat(), `${act} ${s.call}`); head.ready = true; head.parts = []; draw(); });
      const draw = () => {
        const pq = Math.round(s.phi * 2) / 2, act = sectorOf(pq);
        if (head.ready && el.back._key !== `${act} ${s.call}`) fillHead(headItems(P, M, act, s.call, full), `${act} ${s.call}`);
        const on = ISO.still() || (s.t % 1.5) < 0.5;
        w.rebuild(el.light, String(on), () => lightSvg(P, M, on));
        const tq = Math.round(s.t * 30) / 30;
        w.rebuild(el.waves, s.call ? `${act} ${pq} ${tq.toFixed(2)}` : "", () => (s.call ? wavesSvg(P, M, act, pq, tq) : ""));
        w.rebuild(el.words, lab ? `${act} ${s.call}` : "", () => !lab ? "" : [
          ISO.word(K.iso([0, 0, M.H], P), s.call ? `sector ${act + 1} of 3 serves the phone` : "phone mast", s.call ? "#b5541a" : "#444", { size: 13, anchor: "start" }).replace('x="', 'dx="14" x="'),
          ISO.word(K.iso([0, 0, M.HEAD - 40], P), "antennas: 3 sectors × 120°", "#444", { size: 12, anchor: "end" }).replace('x="', 'dx="-34" x="'),
          ISO.word(K.iso([0, 0, M.ZD], P), "microwave dish", "#444", { size: 12, anchor: "end" }).replace('x="', 'dx="-26" x="')].join(""));
        B31.light(w, g, s.lit);
      };
      g.set = (p) => {
        if (p.phone !== undefined) { const v = +p.phone; if (Number.isFinite(v)) s.want = ((v % 360) + 360) % 360; }
        if (p.call !== undefined) s.call = String(p.call) === "1";
        if (p.lit !== undefined) s.lit = p.lit;
      };
      // the phone's bearing changes the short way round; the light keeps flashing, the waves keep running
      g.update = (dt) => {
        const d0 = Math.min(Math.max(+dt || 0, 0), 0.1);
        s.t = (s.t + d0) % 600;
        const d = ((s.want - s.phi + 540) % 360) - 180, step = ISO.still() ? d : d * (1 - Math.exp(-d0 / 0.6));
        s.phi = Math.abs(d) < 0.05 ? s.want : (s.phi + step + 360) % 360;
        draw();
        return !ISO.still() || s.phi !== s.want;
      };
      g.readout = () => { const act = sectorOf(s.want); return `${(M.H / 100).toFixed(0)} m monopole · ${s.call ? `phone at bearing ${Math.round(s.want)}°, served by sector ${act + 1} (its antennas face ${SECT[act]}°)` : "no call"} · each sector covers 120° out to a few km · calls go down the cables to the radio cabinet, and over the microwave dish to the network`; };
      draw();
      return g;
    },
  });
})();
