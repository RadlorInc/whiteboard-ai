// "instrument cx cy size k=piano|drum|guitar|flute|violin play=0|1 lab=1 lit=…" — a musical instrument that plays.
// piano: two octaves of a grand's keyboard with the lid off: 14 white and 10 black keys, behind them a hammer for every
// key and its strings running back from the tuning pins to the bridge. play: C D E F G, each key dips, its hammer
// flies up and strikes its string, which rings and dies away.  drum: a rope-tensioned drum (red shell, two hoops,
// zig-zag cords with leather ears, a calfskin-white head) and two sticks: play: the sticks strike in turn, the head
// gives at the hit and rings spread across it.  guitar: an acoustic guitar lying face up (spruce top, soundhole and
// rosette, bridge and saddle, 19 frets, six strings to the tuning pegs) and a pick: play: one strum across the six
// strings, each ringing at its own pitch.  flute: a concert flute (head joint with lip plate and crown, body and foot
// with 13 key cups on their rods and pillars): play: the keys close one after another down a D major scale.
// violin: a violin face up (spruce top with f-holes, bridge, tailpiece, chinrest, fingerboard, pegbox and scroll) with
// its bow: play: the bow draws back and forth across the A string, which vibrates (stick-slip, 440 times a second).
// set({ play: 1 }) plays once; every number in the readout is the real one. World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const zAx = DAILY.zAx, xAx = DAILY.xAx, yAx = DAILY.yAx;
  const FZ = (z) => G.frameOf([0, 0, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);     // outlines in (x, y), extruded up
  const tint = (top, dark, edge) => ISO.tint(top, [dark, mixC(dark, top, 0.25), mixC(dark, top, 0.5), mixC(dark, top, 0.75)], edge);
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixC = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
  // a vibrating string between world points a and b: the string, and a pale lens as wide as it swings (sin envelope)
  const stringSvg = (P, a, b, amp, color = "#8d9096", w = 0.9, side = [0, 0, 1]) => {
    const k = K.cameraOf(P).k, d = K.pathOf([K.iso(a, P), K.iso(b, P)]);
    let lens = "";
    if (amp > 0.05) {
      const n = 16, up = [], dn = [];
      for (let i = 0; i <= n; i++) { const f = i / n, p = G.lerp3(a, b, f), e = Math.sin(Math.PI * f) * amp; up.push(K.iso(G.add3(p, G.mul3(side, e)), P)); dn.push(K.iso(G.add3(p, G.mul3(side, -e)), P)); }
      lens = `<path d="${K.pathOf([...up, ...dn.reverse()], true)}" fill="${color}" opacity=".28" stroke="none"/>`;
    }
    return lens + `<path d="${d}" fill="none" stroke="${color}" stroke-width="${(w * k).toFixed(2)}"/>`;
  };
  const decay = (t, t0, tau, a0 = 1) => (t < t0 ? 0 : a0 * Math.exp(-(t - t0) / tau));

  // ── piano
  const PW = 23.5, PL = 150, KH = 22, NW = 14;
  const WX = (i) => -((NW * PW) / 2) + PW * i + PW / 2;
  const BLACK = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map((i) => WX(i) + PW / 2);
  const PNOTES = [["C4", 261.6], ["D4", 293.7], ["E4", 329.6], ["F4", 349.2], ["G4", 392.0]];
  const piano = {
    plan: { x: -230, y: -330, w: 460, d: 460, r: 8 }, view: { azimuth: 72, elevation: 40 }, fit: [[0, -300, 140], [0, 100, 60]], size: [2.0, 1.25],
    play: 3.4,
    statics(P) {
      const x0 = -(NW * PW) / 2, x1 = -x0, out = [];
      const CASE = tint("#3a3430", "#141110", "#050404"), FELT = tint("#e6ded0", "#8a7a64", "#3a3020");
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: x0 - 44, y: -300, w: 2 * x1 + 88, d: 400, r: 6 }, 0, 70, P)}"/>`);
      // the case: key bed, back and side rims (low, so the action shows), cheek blocks and the key slip in front
      out.push(ISO.tinted(CASE, ISO.wbox(P, [x0 - 44, x1 + 44], [-300, 96], [0, 12], "mid")));
      out.push(ISO.tinted(CASE, ISO.wbox(P, [x0 - 44, x1 + 44], [-300, -284], [12, 92], "mid")), ISO.tinted(CASE, ISO.wbox(P, [x0 - 44, x0 - 28], [-284, -80], [12, 92], "mid")));
      // the iron frame under the strings, the bridge (with its pins) and the pin block with the tuning pins
      out.push(ISO.tinted(tint("#e7c873", "#9a7a28", "#4a3808"), ISO.wbox(P, [x0 - 20, x1 + 20], [-280, -100], [12, 18], "lo")));
      out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [x0 - 12, x1 + 12], [-262, -250], [18, 66], "mid")));
      out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [x0 - 12, x1 + 12], [-122, -100], [18, 70], "mid")));
      const pins = [], bpins = [], all = [...Array.from({ length: NW }, (_, i) => WX(i)), ...BLACK].sort((a, b) => a - b);
      for (const x of all) { pins.push(K.iso([x, -111, 70], P)); bpins.push(K.iso([x, -256, 66], P)); }
      out.push(K.dotsSvg(pins, { size: 0.9, tone: "hi" }), K.dotsSvg(bpins, { size: 0.6, tone: "mid" }));
      // the hammer rail the hammers' shanks pivot on
      out.push(ISO.tinted(FELT, ISO.wbox(P, [x0, x1], [-96, -84], [12, 26], "mid")));
      return out.join("");
    },
    // hammers, strings, keys: one group each, so only what moves is rebuilt
    mount(P, root, w) {
      const x0 = -(NW * PW) / 2;
      const WHITE = tint("#fbfaf4", "#cfccc2", "#4a4840"), BLK = tint("#3a3430", "#0e0c0b", "#000000"), FELT = tint("#e6ded0", "#8a7a64", "#3a3020"), CASE = tint("#3a3430", "#141110", "#050404");
      const press = (i, t) => { const t0 = 0.2 + i * 0.6; return t < t0 ? 0 : t < t0 + 0.08 ? (t - t0) / 0.08 : t < t0 + 0.5 ? 1 : t < t0 + 0.6 ? 1 - (t - t0 - 0.5) / 0.1 : 0; };
      const hammer = (i, t) => { const t0 = 0.2 + i * 0.6 + 0.04; return t < t0 ? 0 : t < t0 + 0.06 ? (t - t0) / 0.06 : t < t0 + 0.16 ? 1 - ((t - t0 - 0.06) / 0.1) * 0.6 : t < t0 + 0.5 ? 0.4 : Math.max(0, 0.4 - (t - t0 - 0.5) * 4); };
      const hammerSvg = (i, h) => { const x = WX(i), z = 30 + h * 22; return ISO.tinted(ISO.T.wood, ISO.poly([[x - 2, -92, 22], [x + 2, -92, 22], [x + 2, -150, z + 2], [x - 2, -150, z + 2], [x - 2, -92, 25], [x + 2, -92, 25], [x + 2, -150, z + 5], [x - 2, -150, z + 5]], ISO.BOX_F, P, "lo")) + ISO.tinted(FELT, ISO.wbox(P, [x - 7, x + 7], [-160, -140], [z + 2, z + 18], "mid")); };
      const strSvg = (x, amp) => stringSvg(P, [x - 1.6, -111, 72], [x - 1.6, -256, 68], amp, "#9a9ea5", 0.7) + stringSvg(P, [x + 1.6, -111, 72], [x + 1.6, -256, 68], amp, "#9a9ea5", 0.7);
      const keySvg = (i, d) => { const x = WX(i), a = x - PW / 2 + 0.6, b = x + PW / 2 - 0.6; return ISO.tinted(WHITE, ISO.poly([[a, -75, 12], [b, -75, 12], [b, 75, 12 - d], [a, 75, 12 - d], [a, -75, 12 + KH], [b, -75, 12 + KH], [b, 75, 12 + KH - d], [a, 75, 12 + KH - d]], ISO.BOX_F, P, "mid")); };
      const add = () => mk("g", {}, root);
      const H = Array.from({ length: NW }, add);
      const all = [...Array.from({ length: NW }, (_, i) => [WX(i), i]), ...BLACK.map((x) => [x, -1])].sort((a, b) => a[0] - b[0]);
      const Sg = all.map(add);
      const Kg = Array.from({ length: NW }, add);
      add().innerHTML = BLACK.map((x) => ISO.tinted(BLK, ISO.poly([[x - 6.8, -75, 12 + KH], [x + 6.8, -75, 12 + KH], [x + 6.8, 20, 12 + KH], [x - 6.8, 20, 12 + KH], [x - 5.6, -75, 12 + KH + 12], [x + 5.6, -75, 12 + KH + 12], [x + 5.6, 18, 12 + KH + 12], [x - 5.6, 18, 12 + KH + 12]], ISO.BOX_F, P, "mid"))).join("") +
        // the cheek blocks and the key slip in front of the keys
        ISO.tinted(CASE, ISO.wbox(P, [x0 - 40, x0 - 4], [-80, 96], [12, 46], "mid")) + ISO.tinted(CASE, ISO.wbox(P, [-x0 + 4, -x0 + 40], [-80, 96], [12, 46], "mid")) + ISO.tinted(CASE, ISO.wbox(P, [x0 - 4, -x0 + 4], [80, 96], [0, 24], "mid"));
      return (t, on) => {
        for (let i = 0; i < NW; i++) {
          const h = on && i <= 4 ? Math.round(hammer(i, t) * 40) / 40 : 0, d = on && i <= 4 ? Math.round(press(i, t) * 20) / 2 : 0;
          w.rebuild(H[i], `${h}`, () => hammerSvg(i, h));
          w.rebuild(Kg[i], `${d}`, () => keySvg(i, d));
        }
        all.forEach(([x, i], j) => { const amp = on && i >= 0 && i <= 4 ? Math.round(decay(t, 0.2 + i * 0.6 + 0.1, 0.5, 2.4) * 20) / 20 : 0; w.rebuild(Sg[j], `${amp}`, () => strSvg(x, amp)); });
        const idx = on ? Math.floor((t - 0.2) / 0.6) : -1;
        return { note: idx >= 0 && idx < 5 ? PNOTES[idx] : null };
      };
    },
    words(P) { return [ISO.word(K.iso([-(NW * PW) / 2 - 44, 40, 46], P), "keys", "#444", { anchor: "end", size: 14 }), ISO.word(K.iso([-(NW * PW) / 2 - 20, -150, 60], P), "hammers", "#5a4a2a", { anchor: "end", size: 14 }), ISO.word(K.iso([(NW * PW) / 2 + 20, -200, 72], P), "strings", "#555", { anchor: "start", size: 14 })].join(""); },
    readout(m, on, t) { return m.note ? `${m.note[0]} · ${m.note[1]} Hz · key down, its hammer flies up, strikes the string and falls back so it can ring` : "two octaves of a grand piano's action · press a key and a felt hammer strikes its strings (two per note) from below"; },
  };

  // ── drum
  const DR = 180, DH = 210;
  const drum = {
    plan: { x: -300, y: -300, w: 600, d: 600, r: 10 }, view: { azimuth: 50, elevation: 30 }, fit: [[0, 0, DH + 300], [200, 200, DH + 260], [-200, 200, DH + 260]], size: [2.0, 1.45],
    play: 2.6,
    statics(P) {
      const F = zAx([0, 0, 0]), RED = tint("#f4a59a", "#9c2416", "#4a0c06"), out = [`<path class="iso-halo" d="${K.haloOf({ x: -DR, y: -DR, w: 2 * DR, d: 2 * DR, r: DR }, 0, 30, P)}"/>`];
      const HOOP = tint("#f2dca8", "#9a7440", "#4a3410");
      out.push(ISO.tinted(HOOP, S(G.ringBand(0, 26, DR - 2, DR + 6, F, P, { steps: 72 }), { tone: "mid" })));
      out.push(ISO.tinted(RED, S(G.disc(26, DH - 26, DR, F, P, { steps: 72 }), { tone: "hi" })));
      // the cords: a zig-zag from hoop to hoop on the side we see, each run ending on both hoops; leather ears on pairs
      const V = G.viewOf(P), a0 = Math.atan2(V[1], V[0]), cords = [], ears = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2, b = ((i + 0.5) / 12) * Math.PI * 2, p0 = [Math.cos(a) * (DR + 1), Math.sin(a) * (DR + 1), 24], p1 = [Math.cos(b) * (DR + 1), Math.sin(b) * (DR + 1), DH - 24], p2 = [Math.cos(a + Math.PI / 6) * (DR + 1), Math.sin(a + Math.PI / 6) * (DR + 1), 24];
        const vis = (q) => Math.cos(Math.atan2(q[1], q[0]) - a0) > 0.02;
        if (vis(p0) && vis(p1)) cords.push(K.pathOf([K.iso(p0, P), K.iso(p1, P)]));
        if (vis(p1) && vis(p2)) cords.push(K.pathOf([K.iso(p1, P), K.iso(p2, P)]));
        const e = [Math.cos(b) * (DR + 2), Math.sin(b) * (DR + 2), 70];
        if (vis(e)) ears.push(K.pathOf([[-8, 0], [8, 0], [6, 26], [-6, 26]].map(([u, z]) => K.iso([e[0] - Math.sin(b) * u, e[1] + Math.cos(b) * u, e[2] + z], P)), true));
      }
      const k = K.cameraOf(P).k;
      out.push(`<path d="${cords.join("")}" fill="none" stroke="#8a6a10" stroke-width="${(5 * k).toFixed(2)}" stroke-linecap="round"/><path d="${cords.join("")}" fill="none" stroke="#f3c33b" stroke-width="${(3 * k).toFixed(2)}" stroke-linecap="round"/>`);
      out.push(`<path d="${ears.join("")}" fill="#7a4a24" stroke="#3a220a" stroke-width=".8"/>`);
      out.push(ISO.tinted(HOOP, S(G.ringBand(DH - 26, DH, DR - 2, DR + 6, F, P, { steps: 72 }), { tone: "mid" })));
      out.push(`<path d="${G.circleOf(F, DH - 4, DR - 3, P, 72)}" fill="#f6f2e8" stroke="#9a968a" stroke-width=".8"/>`);
      return out.join("");
    },
    moving(P, t, on) {
      const F = zAx([0, 0, 0]), out = [], k = K.cameraOf(P).k;
      const hits = on ? [0.4, 1.0, 1.4, 1.8] : [];
      // the head: a white disc inside the hoop; where struck it gives a little and rings spread from the hit
      const last = hits.filter((h) => h <= t).at(-1), dip = last !== undefined ? Math.max(0, 1 - (t - last) / 0.12) : 0;
      for (const h of hits) { if (t < h || t > h + 0.9) continue; const f = (t - h) / 0.9, c = h === 0.4 || h === 1.4 ? [-50, 30] : [40, -20]; out.push(`<path d="${G.circleOf(zAx([c[0], c[1], DH - 4]), 0, 10 + f * 120, P, 48)}" fill="none" stroke="#b8b2a2" stroke-width="${(1.6 * (1 - f)).toFixed(2)}" opacity="${(1 - f).toFixed(2)}"/>`); }
      if (dip > 0.01) { const c = hits.indexOf(last) % 2 ? [40, -20] : [-50, 30]; out.push(`<path d="${G.circleOf(zAx([c[0], c[1], DH - 4]), 0, 26, P, 32)}" fill="#e2dccc" opacity="${(dip * 0.9).toFixed(2)}"/>`); }
      // two sticks, each turning about the player's grip: up, then down onto the head at its hit
      const stick = (grip, aim, sgn) => {
        // the tip rests 130 mm over its spot; for each of its hits it comes down onto the head and bounces back up
        let up = 1;
        for (const h of hits.filter((_, i) => i % 2 === sgn)) { if (t > h - 0.28 && t < h + 0.3) up = t < h ? Math.cos(((t - h + 0.28) / 0.28) * (Math.PI / 2)) : Math.sin(((t - h) / 0.3) * (Math.PI / 2)); }
        const tip = G.add3(aim, [0, 0, 8 + 130 * up]), dir = G.unit3(G.sub3(tip, grip)), len = Math.hypot(...G.sub3(tip, grip)) + 30;
        const side = G.unit3(G.cross3(dir, [0, 0, 1])), up2 = G.cross3(side, dir);
        const ring = Array.from({ length: 8 }, (_, i) => [Math.cos((i * Math.PI) / 4) * 7, Math.sin((i * Math.PI) / 4) * 7]);
        const Fk = G.frameOf(grip, side, up2, dir);
        return DAILY.prism(P, Fk, ring, -60, len - 40, ["#a8743e", "#f0d3a0"], "#e2bb82", "#5a3a1a") + DAILY.prism(P, Fk, ring.map(([a, b]) => [a * 1.25, b * 1.25]), len - 42, len - 26, ["#a8743e", "#f6e7c8"], "#f0d3a0", "#5a3a1a");
      };
      out.push(stick([-330, 300, DH + 200], [-50, 30, DH], 0), stick([330, -300, DH + 210], [40, -20, DH], 1));
      const n = hits.filter((h) => h <= t).length;
      return { svg: out.join(""), key: on && t < 2.8 ? t.toFixed(2) : "rest", n };
    },
    words(P) { return [ISO.word(K.iso([-DR, DR * 0.2, DH - 60], P), "shell", "#8f2a22", { anchor: "end", size: 14 }), ISO.word(K.iso([0, 0, DH], P), "head", "#555", { size: 14, dy: -6 }), ISO.word(K.iso([DR * 0.7, DR * 0.7, 40], P), "cords and ears", "#7a5a08", { anchor: "start", size: 13, dy: 10 })].join(""); },
    readout(m, on, t) { return on && t < 2.4 && m.n ? `hit ${m.n} · the stretched head is pushed in and springs back, many times a second; rings of vibration spread to the hoop and the shell's air sounds them` : "rope drum · 36 cm head on a 21 cm shell · pull the cords tighter (slide the leather ears down) and the note goes higher"; },
  };

  // ── guitar (face up along x: bridge at -110, nut at 540: a 650 mm scale)
  const SAD = -110, NUT = 540, SCALE = NUT - SAD, GZ = 100, STRZ = GZ + 10;
  const GNOTES = [["E2", 82.4], ["A2", 110], ["D3", 146.8], ["G3", 196], ["B3", 246.9], ["E4", 329.6]];
  const fretX = (n) => NUT - SCALE * (1 - 2 ** (-n / 12));
  const bodyOutline = (() => {
    const pts = [];
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      // x along the body, half-width: lower bout 190 at x -120, waist 120 at x 60, upper bout 145 at x 160
      const x = 40 + c * 250, wv = x < 60 ? 120 + 70 * Math.sin(Math.min(1, (60 - x) / 180) * (Math.PI / 2)) : 120 + 25 * Math.sin(Math.min(1, (x - 60) / 100) * (Math.PI / 2));
      pts.push([x, s * wv * Math.sqrt(Math.max(0, 1 - Math.max(0, Math.abs(c) - 0.86) * 7))]);
    }
    return pts.slice(0, -1);
  })();
  const SY = (i, x) => { const w = 10.5 + ((7.2 - 10.5) * (x - SAD)) / SCALE; return (i - 2.5) * w; };
  const guitar = {
    plan: { x: -260, y: -260, w: 1080, d: 520, r: 10 }, view: { azimuth: 70, elevation: 44 }, fit: [[0, 0, 160]], size: [2.4, 1.35],
    play: 3.2,
    statics(P) {
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -210, y: -190, w: 980, d: 380, r: 150 }, 0, GZ, P)}"/>`];
      out.push(DAILY.prism(P, FZ(0), bodyOutline, 0, GZ, ["#5a2e14", "#b86e3e"], "#f2d9a6", "#3a1a0a",
        // the soundhole (dark, behind the strings) and its rosette rings, the bridge's shadow line
        `<path d="${G.circleOf(zAx([150, 0, GZ]), 0.2, 44, P, 48)}" fill="#2a1a10" stroke="#3a1a0a" stroke-width=".8"/>` + [50, 56].map((r) => `<path d="${G.circleOf(zAx([150, 0, GZ]), 0.2, r, P, 48)}" fill="none" stroke="#7a4a24" stroke-width="1.2"/>`).join("")));
      // the neck under the fingerboard, the fingerboard with frets and dots, the headstock with six pegs
      out.push(ISO.tinted(tint("#e2b07a", "#8a5226", "#4a2a10"), ISO.poly([[260, -27, GZ - 22], [NUT, -23, GZ - 22], [NUT, 23, GZ - 22], [260, 27, GZ - 22], [260, -27, GZ], [NUT, -23, GZ], [NUT, 23, GZ], [260, 27, GZ]], ISO.BOX_F, P, "mid")));
      out.push(ISO.tinted(tint("#5a3e2e", "#1e140e", "#0a0604"), ISO.poly([[220, -28, GZ], [NUT, -22.5, GZ], [NUT, 22.5, GZ], [220, 28, GZ], [220, -28, GZ + 6], [NUT, -22.5, GZ + 6], [NUT, 22.5, GZ + 6], [220, 28, GZ + 6]], ISO.BOX_F, P, "mid")));
      const frets = []; for (let n = 1; n <= 19; n++) { const x = fretX(n), h = 22.5 + ((28 - 22.5) * (NUT - x)) / (NUT - 220); frets.push(K.pathOf([K.iso([x, -h, GZ + 6.1], P), K.iso([x, h, GZ + 6.1], P)])); }
      out.push(`<path d="${frets.join("")}" fill="none" stroke="#d9dadd" stroke-width="1.4"/>`);
      out.push(K.dotsSvg([3, 5, 7, 9, 12].map((n) => K.iso([(fretX(n) + fretX(n - 1)) / 2, 0, GZ + 6.1], P)), { size: 1.4, tone: "faint" }));
      out.push(ISO.tinted(tint("#f6f2e8", "#b8b2a2", "#5a564c"), ISO.wbox(P, [NUT, NUT + 5], [-23, 23], [GZ, GZ + 10], "mid")));
      out.push(ISO.tinted(tint("#5a3e2e", "#1e140e", "#0a0604"), ISO.poly([[NUT + 5, -26, GZ - 6], [NUT + 190, -36, GZ - 14], [NUT + 190, 36, GZ - 14], [NUT + 5, 26, GZ - 6], [NUT + 5, -26, GZ + 8], [NUT + 190, -36, GZ], [NUT + 190, 36, GZ], [NUT + 5, 26, GZ + 8]], ISO.BOX_F, P, "mid")));
      for (let i = 0; i < 6; i++) {
        const sd = i < 3 ? -1 : 1, x = NUT + 50 + (i % 3) * 45, y = sd * 34;
        out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 16, 4, G.frameOf([x, y, GZ - 4], [0, sd, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 12 }), { tone: "mid" })));
        out.push(ISO.tinted(tint("#f6f2e8", "#b8b2a2", "#5a564c"), ISO.wbox(P, [x - 7, x + 7], sd < 0 ? [y - 30, y - 16] : [y + 16, y + 30], [GZ - 10, GZ + 2], "hi")));
      }
      // the bridge with its saddle and pins
      out.push(ISO.tinted(tint("#5a3e2e", "#1e140e", "#0a0604"), ISO.wbox(P, [SAD - 30, SAD + 8], [-75, 75], [GZ, GZ + 9], "mid")));
      out.push(ISO.tinted(tint("#f6f2e8", "#b8b2a2", "#5a564c"), ISO.wbox(P, [SAD - 2, SAD + 1.5], [-36, 36], [GZ + 9, GZ + 12], "hi")));
      out.push(K.dotsSvg(Array.from({ length: 6 }, (_, i) => K.iso([SAD - 18, SY(i, SAD), GZ + 9.1], P)), { size: 1.2, tone: "lo" }));
      return out.join("");
    },
    moving(P, t, on) {
      const out = [], py = on ? -60 + ISO.clamp((t - 0.3) / 0.35, 0, 1) * 120 : -60, lift = on && t > 0.3 && t < 0.65 ? 0 : 14;
      // the strings, each ringing from when the pick crossed it
      for (let i = 0; i < 6; i++) {
        const y0 = SY(i, SAD), crossed = on ? 0.3 + ((y0 + 60) / 120) * 0.35 : 99, amp = decay(t, crossed, 0.9, 2.6 - i * 0.25);
        const a = [SAD, y0, GZ + 12], b = [NUT, SY(i, NUT), GZ + 10], c = [NUT + 50 + (i % 3) * 45, (i < 3 ? -1 : 1) * 34, GZ - 2];
        out.push(stringSvg(P, a, b, amp, i < 3 ? "#b08a4a" : "#a2a5ab", 1.3 - i * 0.12, [0, 1, 0]), `<path d="${K.pathOf([K.iso(b, P), K.iso(c, P)])}" fill="none" stroke="#a2a5ab" stroke-width="${(0.8 * K.cameraOf(P).k).toFixed(2)}"/>`);
      }
      // the pick: a rounded triangle over the soundhole, sweeping across the strings
      const c = [95, py, STRZ + lift], tri = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2, r = i % 3 === 0 ? 16 : 13; return [c[0] + Math.cos(a + 0.5) * r, c[1] + Math.sin(a + 0.5) * r]; });
      out.push(DAILY.prism(P, FZ(c[2]), tri, 0, 1.2, ["#b8650c", "#f8c070"], "#f4a531", "#7a3a08"));
      const rung = on ? GNOTES.filter((_, i) => t >= 0.3 + ((SY(i, SAD) + 60) / 120) * 0.35) : [];
      return { svg: out.join(""), key: on && t < 3.1 ? t.toFixed(2) : "rest", rung };
    },
    words(P) { return [ISO.word(K.iso([150, 60, GZ], P), "soundhole", "#5a3a1a", { anchor: "start", size: 14, dy: 14 }), ISO.word(K.iso([SAD - 10, 80, GZ], P), "bridge", "#444", { anchor: "middle", size: 14, dy: 18 }), ISO.word(K.iso([fretX(5), 30, GZ + 6], P), "frets", "#444", { anchor: "start", size: 14, dy: 14 })].join(""); },
    readout(m, on, t) { return m.rung && m.rung.length ? `strummed · ${m.rung.map(([n, f]) => `${n} ${f}`).join(", ")} Hz · same 650 mm length, so thicker, heavier strings ring lower` : "acoustic guitar · six strings 650 mm long from saddle to nut · 19 frets, each shortening the string so the note rises a semitone"; },
  };

  // ── flute (along x, mouthpiece at the left)
  const FR = 9.5, FL = 670, FZ0 = 30, KEYS = Array.from({ length: 13 }, (_, i) => 250 + i * 30);
  const FNOTES = [["D4", 293.7], ["E4", 329.6], ["F♯4", 370], ["G4", 392], ["A4", 440], ["B4", 493.9], ["C♯5", 554.4]];
  const flute = {
    plan: { x: -70, y: -90, w: 800, d: 180, r: 10 }, view: { azimuth: 66, elevation: 40 }, fit: [[0, 0, 60]], size: [2.4, 0.95],
    play: 4.2,
    key: (t, on) => `${on ? Math.min(7, Math.floor((t - 0.2) / 0.55) + 1) : 0}`,
    statics(P) {
      const F = xAx([0, 0, FZ0]), SIL = ISO.T.steel, out = [];
      // a velvet cloth under it
      out.push(DAILY.prism(P, FZ(0), DAILY.rrect(-50, -70, 710, 70, 16, 4), 0, 4, ["#4a2a5a", "#8a5aa8"], "#7a4a98", "#2a1438"));
      // the tube's cradle blocks on the cloth, the head joint (crown, lip plate), the body and the foot
      for (const x of [120, 600]) out.push(ISO.tinted(tint("#7a4a98", "#3a1a4a", "#1a0a24"), ISO.wbox(P, [x - 12, x + 12], [-14, 14], [4, FZ0 - FR + 1], "mid")));
      out.push(ISO.tinted(SIL, S(G.lathe([[-14, 0], [-14, 8], [-10, 10.5, 1], [-2, 10.5], [-2, FR + 0.6], [0, FR + 0.6], [0, 0]], F, P, { steps: 32 }), { tone: "hi" })));
      out.push(ISO.tinted(SIL, S(G.disc(0, 200, FR, F, P, { steps: 40 }), { tone: "hi", inner: `<path d="${G.arcOf(F, 196, FR + 0.05, P)}" fill="none" stroke="#6b6f76" stroke-width=".6"/>` })));
      out.push(ISO.tinted(SIL, S(G.disc(196, 210, FR + 1.4, F, P, { steps: 40 }), { tone: "mid" })));
      out.push(ISO.tinted(SIL, S(G.disc(210, FL, FR, F, P, { steps: 40 }), { tone: "hi", inner: `<path d="${G.arcOf(F, 562, FR + 0.05, P)}" fill="none" stroke="#6b6f76" stroke-width=".6"/>` })));
      out.push(ISO.tinted(SIL, S(G.disc(FL - 2, FL, FR + 1, F, P, { steps: 40 }), { tone: "mid" })));
      // lip plate with the embouchure hole
      out.push(ISO.tinted(SIL, ISO.poly([[52, -12, FZ0 + FR - 1], [92, -12, FZ0 + FR - 1], [92, 12, FZ0 + FR - 1], [52, 12, FZ0 + FR - 1], [54, -11, FZ0 + FR + 1.6], [90, -11, FZ0 + FR + 1.6], [90, 11, FZ0 + FR + 1.6], [54, 11, FZ0 + FR + 1.6]], ISO.BOX_F, P, "hi")));
      out.push(`<path d="${K.pathOf(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return K.iso([72 + Math.cos(a) * 6, Math.sin(a) * 5, FZ0 + FR + 1.7], P); }), true)}" fill="#1e2024" stroke="#3c3f45" stroke-width=".6"/>`);
      // the key rod along the side and its pillars
      const Fr = xAx([0, FR + 4, FZ0 + 3]);
      for (const x of [236, 330, 430, 520, 610]) out.push(ISO.tinted(SIL, ISO.wbox(P, [x - 2, x + 2], [FR - 2, FR + 6], [FZ0 + 1, FZ0 + 5], "mid")));
      out.push(ISO.tinted(SIL, S(G.disc(236, 640, 1.8, Fr, P, { steps: 12 }), { tone: "mid" })));
      return out.join("");
    },
    moving(P, t, on) {
      const out = [], SIL = ISO.T.steel, PAD = tint("#f6f0e0", "#b8ae90", "#5a5038");
      // fingering down the scale: by step n, the top n+? keys are closed (simplified: one more key each step)
      const step = on ? Math.min(7, Math.floor((t - 0.2) / 0.55) + 1) : 0;
      for (let i = 0; i < KEYS.length; i++) {
        const x = KEYS[i], closed = step > 0 && i < 6 && i >= 6 - Math.min(6, step) + 0 ? 1 : 0, z = FZ0 + FR + (closed ? 0.6 : 2.6);
        out.push(ISO.tinted(SIL, S(G.disc(z, z + 3, 8.5, zAx([x, 0, 0]), P, { steps: 24 }), { tone: closed ? "hi" : "mid", inner: `<path d="${G.circleOf(zAx([x, 0, 0]), z + 3.02, 5.5, P, 20)}" fill="${closed ? "#c7c9cd" : "#e4e5e8"}" stroke="#6b6f76" stroke-width=".5"/>` })));
        out.push(ISO.tinted(SIL, ISO.wbox(P, [x - 1.6, x + 1.6], [6, FR + 4], [z + 0.5, z + 2], "mid")));
      }
      return { svg: out.join(""), key: `${step}`, note: step > 0 ? FNOTES[Math.min(6, step - 1)] : null };
    },
    words(P) { return [ISO.word(K.iso([72, -14, FZ0 + FR], P), "lip plate", "#444", { anchor: "middle", size: 14, dy: -10 }), ISO.word(K.iso([400, -14, FZ0 + FR], P), "keys", "#444", { anchor: "middle", size: 14, dy: -10 }), ISO.word(K.iso([600, 70, 4], P), "foot joint", "#555", { anchor: "start", size: 13, dy: 14 })].join(""); },
    readout(m) { return m.note ? `${m.note[0]} · ${m.note[1]} Hz · each closed key makes the air column inside longer, so the note drops` : "concert flute · 67 cm of silver tube · blow across the lip plate's hole and the air inside rings; the keys set its length"; },
  };

  // ── violin (face up along x: tailpiece end at -190, scroll at +400)
  const VZ = 30, BRX = -40, VNUT = 290, VSTRZ = VZ + 34;
  const violinOutline = (() => {
    const pts = [];
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), x = -10 + c * 178;
      const u = (x + 188) / 356, wv = 104 * (u < 0.42 ? Math.sin(Math.min(1, (0.42 - u) / 0.32 + 0.2) * (Math.PI / 2)) * 0.9 + 0.1 : 0) + (u >= 0.42 && u < 0.6 ? 58 : 0) + (u >= 0.6 ? 84 * Math.sin(Math.min(1, (u - 0.6) / 0.22 + 0.25) * (Math.PI / 2)) : 0);
      pts.push([x, s * Math.max(58, wv) * Math.sqrt(Math.max(0, 1 - Math.max(0, Math.abs(c) - 0.9) * 9))]);
    }
    return pts.slice(0, -1);
  })();
  const VY = (i, x) => { const w = 11.5 + ((5.5 - 11.5) * (x - BRX)) / (VNUT - BRX); return (i - 1.5) * w; };
  const violin = {
    plan: { x: -230, y: -330, w: 690, d: 520, r: 10 }, view: { azimuth: 64, elevation: 46 }, fit: [[0, -300, 120], [0, 180, 120]], size: [2.1, 1.3],
    play: 3.6,
    statics(P) {
      const out = [`<path class="iso-halo" d="${K.haloOf({ x: -190, y: -110, w: 590, d: 220, r: 100 }, 0, VZ, P)}"/>`];
      const fhole = (sg) => { const pts = []; for (let i = 0; i <= 16; i++) { const f = i / 16, x = BRX - 40 + f * 80; pts.push([x, sg * (36 + 6 * Math.sin(f * Math.PI * 2))]); } const back = pts.map(([x, y]) => [x, y + sg * 3]).reverse(); return K.pathOf([...pts, ...back].map(([x, y]) => K.iso([x, y, VZ + 0.2], P)), true); };
      out.push(DAILY.prism(P, FZ(0), violinOutline, 0, VZ, ["#6e2e10", "#d0783a"], "#d88a4a", "#3a1404",
        `<path d="${fhole(-1) + fhole(1)}" fill="#2a1408"/>` + `<path d="${K.pathOf(violinOutline.map(([x, y]) => K.iso([x * 0.985 - 0.2, y * 0.95, VZ + 0.2], P)), true)}" fill="none" stroke="#7a3a14" stroke-width=".8"/>`));
      // chinrest at the tail end, the tailpiece on its gut, the fingerboard, the pegbox, pegs and the scroll
      out.push(ISO.tinted(tint("#3a2a20", "#120c08", "#000000"), ISO.poly([[-186, -60, VZ], [-150, -60, VZ], [-150, -10, VZ], [-186, -10, VZ], [-184, -58, VZ + 16], [-152, -58, VZ + 16], [-152, -12, VZ + 16], [-184, -12, VZ + 16]], ISO.BOX_F, P, "mid")));
      out.push(ISO.tinted(tint("#3a2a20", "#120c08", "#000000"), ISO.poly([[-176, -18, VZ + 4], [-80, -26, VZ + 14], [-80, 26, VZ + 14], [-176, 18, VZ + 4], [-176, -18, VZ + 10], [-80, -26, VZ + 20], [-80, 26, VZ + 20], [-176, 18, VZ + 10]], ISO.BOX_F, P, "mid")));
      out.push(ISO.tinted(tint("#3a2a20", "#120c08", "#000000"), ISO.poly([[30, -21, VZ + 12], [VNUT, -12, VZ + 22], [VNUT, 12, VZ + 22], [30, 21, VZ + 12], [30, -21, VZ + 18], [VNUT, -12, VZ + 28], [VNUT, 12, VZ + 28], [30, 21, VZ + 18]], ISO.BOX_F, P, "mid")));
      out.push(ISO.tinted(tint("#d88a4a", "#6e2e10", "#3a1404"), ISO.wbox(P, [VNUT, VNUT + 80], [-12, 12], [VZ - 4, VZ + 24], "mid")));
      for (let i = 0; i < 4; i++) { const x = VNUT + 18 + (i % 2) * 34 + (i > 1 ? 14 : 0), sd = i % 2 ? 1 : -1; out.push(ISO.tinted(tint("#3a2a20", "#120c08", "#000000"), S(G.solidOf([[0, 3], [20, 4, 1], [26, 9, 1], [34, 8]], G.frameOf([x, sd * 12, VZ + 14], [0, sd, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 14 }), { tone: "mid" }))); }
      const Fs = yAx([VNUT + 100, 0, VZ + 10]);
      out.push(ISO.tinted(tint("#d88a4a", "#6e2e10", "#3a1404"), S(G.disc(-12, 12, 20, Fs, P, { steps: 28 }), { tone: "mid", inner: `<path d="${K.pathOf(Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 3.2, r = 18 - i * 0.5; return K.iso([VNUT + 100 + Math.cos(a) * r, 12.1, VZ + 10 + Math.sin(a) * r], P); }))}" fill="none" stroke="#6e2e10" stroke-width=".8"/>` })));
      // the bridge standing on the top between the f-holes, and the nut
      out.push(ISO.tinted(tint("#f2dca8", "#9a7440", "#4a3410"), ISO.poly([[BRX - 2, -22, VZ], [BRX + 2, -22, VZ], [BRX + 2, 22, VZ], [BRX - 2, 22, VZ], [BRX - 1.2, -18, VSTRZ - 1], [BRX + 1.2, -18, VSTRZ - 1], [BRX + 1.2, 18, VSTRZ - 1], [BRX - 1.2, 18, VSTRZ - 1]], ISO.BOX_F, P, "hi")));
      out.push(ISO.tinted(tint("#f6f2e8", "#b8b2a2", "#5a564c"), ISO.wbox(P, [VNUT - 3, VNUT], [-12, 12], [VZ + 28, VZ + 31], "mid")));
      return out.join("");
    },
    moving(P, t, on) {
      const out = [];
      const stroke = on ? Math.sin(((t - 0.3) / 1.6) * Math.PI * 2) : 0, drawing = on && t > 0.3 && t < 3.5, amp = drawing ? 1.4 * Math.min(1, (t - 0.3) * 4) * Math.min(1, (3.5 - t) * 4) : on ? decay(t, 3.5, 0.3, 1.4) : 0;
      for (let i = 0; i < 4; i++) {
        const a = [-90, VY(i, -90) * 0.7, VZ + 20], b = [BRX, VY(i, BRX), VSTRZ], c = [VNUT, VY(i, VNUT), VZ + 31], d = [VNUT + 30 + (i % 2) * 34, (i % 2 ? 1 : -1) * 4, VZ + 18];
        const k = K.cameraOf(P).k;
        out.push(`<path d="${K.pathOf([a, b].map((p) => K.iso(p, P)))}" fill="none" stroke="#a2a5ab" stroke-width="${(0.7 * k).toFixed(2)}"/>`);
        out.push(stringSvg(P, b, c, i === 2 ? amp : 0, i === 0 ? "#c9a85a" : "#a2a5ab", 1.1 - i * 0.15, [0, 1, 0]));
        out.push(`<path d="${K.pathOf([c, d].map((p) => K.iso(p, P)))}" fill="none" stroke="#a2a5ab" stroke-width="${(0.7 * k).toFixed(2)}"/>`);
      }
      // the bow: its hair on the A string just past the bridge, the stick above, the frog and tip, moving along y
      const bx = 12, off = stroke * 220, hy0 = -320 + off, hy1 = 330 + off, hz = VSTRZ - 2 + (VY(2, bx) - VY(1, bx)) * 0;
      const ht = VZ + 32.5;
      out.push(ISO.tinted(tint("#fbfaf4", "#c9c2a8", "#6a6450"), ISO.poly([[bx - 5, hy0, ht], [bx + 5, hy0, ht], [bx + 5, hy1, ht], [bx - 5, hy1, ht], [bx - 5, hy0, ht + 1.2], [bx + 5, hy0, ht + 1.2], [bx + 5, hy1, ht + 1.2], [bx - 5, hy1, ht + 1.2]], ISO.BOX_F, P, "lo")));
      const stick = []; for (let i = 0; i <= 12; i++) { const f = i / 12; stick.push([hy0 + (hy1 - hy0) * f, ht + 14 - Math.sin(f * Math.PI) * 6]); }
      out.push(DAILY.prism(P, G.frameOf([bx, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]), DAILY.band(stick, 4), -2.5, 2.5, ["#3a1a0a", "#8a4a24"], "#6e3618", "#1a0a04"));
      out.push(ISO.tinted(tint("#3a2a20", "#120c08", "#000000"), ISO.wbox(P, [bx - 6, bx + 6], [hy0 - 4, hy0 + 40], [ht, ht + 18], "mid")));
      out.push(ISO.tinted(tint("#f6f2e8", "#b8b2a2", "#5a564c"), ISO.wbox(P, [bx - 4, bx + 4], [hy1 - 8, hy1 + 4], [ht, ht + 16], "hi")));
      return { svg: out.join(""), key: on && t < 3.9 ? t.toFixed(2) : "rest", amp };
    },
    words(P) { return [ISO.word(K.iso([BRX, 60, VZ], P), "f-hole", "#5a2a10", { anchor: "middle", size: 13, dy: 16 }), ISO.word(K.iso([BRX, -30, VSTRZ], P), "bridge", "#444", { anchor: "end", size: 14, dy: -4 }), ISO.word(K.iso([12, 330, VZ + 46], P), "bow", "#444", { anchor: "start", size: 14 }), ISO.word(K.iso([VNUT + 100, 0, VZ + 30], P), "scroll", "#5a2a10", { anchor: "middle", size: 13, dy: -6 })].join(""); },
    readout(m) { return m.amp > 0.1 ? "A string · 440 Hz · the rosined bow hair grips the string, drags it aside until it slips back, 440 times a second (stick-slip)" : "violin · body 356 mm · four strings G D A E (196, 293.7, 440, 659.3 Hz) over the bridge · horsehair bow with rosin"; },
  };

  // (audit: parts on the guitar's neck and headstock, both ISO.poly solids the audit does not record, read as "loose".)
  const KINDS = { piano, drum, guitar, flute, violin };
  ISO.add({
    name: "instrument", title: "Musical instrument", compare: "instrument 480 270 300 k=guitar",
    about: "A musical instrument that plays when set: piano keys and hammers, a drum and its sticks, a strummed guitar, a flute's keys closing down a scale, or a violin's bow on the A string.",
    line: "instrument cx cy size k=piano|drum|guitar|flute|violin play=0|1 lab=1 lit=body|player",
    demo: { line: "instrument 480 270 300 k=guitar", script: [{ set: {}, hold: 0.8 }, { set: { play: 1 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const kind = KINDS[o.k] ? o.k : "guitar", I = KINDS[kind], lab = o.lab !== "0";
      const W = size * I.size[0], Hh = size * I.size[1];
      const { P, g } = ISO.frame([...K.boxCorners(I.plan, -10, 0), ...I.fit], cx, cy, W, Hh, I.view, parent);
      g.innerHTML = DAILY.table(P, I.plan) + `<g data-name="body">${I.statics(P)}</g><g data-name="player"></g><g data-k="words">${lab ? I.words(P) : ""}</g>`;
      const el = { body: g.querySelector('[data-name="body"]'), player: g.querySelector('[data-name="player"]') }, w = ISO.writer();
      const s = { t: 0, on: false, m: {} }, tick = I.mount ? I.mount(P, el.player, w) : null;
      let lit = o.lit || "";
      const draw = () => {
        const on = s.on && s.t < I.play + 0.6, tk = on ? Math.round(s.t * 60) / 60 : 0, key = I.key ? I.key(tk, on) : on ? tk.toFixed(3) : "rest";
        if (tick) s.m = tick(tk, on);
        else if (el.player._key !== key) { s.m = I.moving(P, tk, on); w.rebuild(el.player, key, () => s.m.svg); }
        const want = lit || (s.on && s.t < I.play ? "player" : "");
        w.light([el.body, el.player], ({ body: [el.body], player: [el.player] }[want] || []));
      };
      g.set = (p) => { if (p.play !== undefined) { s.on = +p.play > 0.5; s.t = 0; } if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        if (!s.on) { draw(); return false; }
        s.t = ISO.still() ? I.play + 1 : Math.min(I.play + 1, s.t + dt);
        draw();
        return s.t < I.play + 1;
      };
      g.readout = () => I.readout(s.m, s.on, s.t);
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
