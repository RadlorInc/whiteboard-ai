// "bpcuff cx cy size lab=0 lit=cuff|gauge|bulb|valve |text" — measuring blood pressure with a cuff, bulb and dial gauge.
// A plain teaching-model arm lies on its foam blocks with the cuff wrapped round the upper arm; one rubber tube runs to
// an aneroid gauge on its stand (0–300 mmHg), the other to the squeeze bulb with its air-release valve. `text` gives
// the reading to find, e.g. 120/80. set({ k: "pump" }) squeezes the bulb until the cuff is at 180 mmHg (the artery is
// shut); set({ k: "deflate" }) opens the valve: the needle falls (shown at 8 mmHg/s, about 3× the 2–3 mmHg/s used),
// and from the systolic pressure down to the diastolic each heartbeat (72 a minute) gets through and kicks the needle.
// Below the diastolic the kicks stop, and the valve is opened fully.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm.
  const ARM = { x0: -150, len: 300, y: -40, z: 44 }, CUFF = [34, 150], GA = { x: -62, y: 96, z: 62, r: 50 }, BULB = { x: 52, y: 92, z: 26 };
  const TOP = 180, DEFLATE = 8, PUMP = 30, HR = 72;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const armR = (s) => 0.86 * (s < 170 ? 41 - (s / 170) * 7 : s < 200 ? 34 + Math.sin(((s - 170) / 30) * Math.PI) * 1.2 : 34 - ((s - 200) / 100) * 9);
  const SKIN = ISO.tint("#ece7df", ["#bdb4a8", "#cbc3b8", "#d8d1c7", "#e3ddd4"], "#5e554a");
  const FOAM = ISO.tint("#8fa3b5", ["#5d7184", "#687c8f", "#73879a", "#7f93a6"], "#2a3a4a");
  const CLOTH = ISO.tint("#5f7d9c", ["#2f4760", "#38516b", "#425b76", "#4c6681"], "#18283a");
  const RUB = "#3a3d42";
  const hose = (P, pts) => { const d = K.pathOf(pts.map((p) => K.iso(p, P))), w = 6 * G.scaleOf(P); return `<path d="${d}" fill="none" stroke="#121315" stroke-width="${(w + 1.2).toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${RUB}" stroke-width="${w.toFixed(2)}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#6b6f76" stroke-width="${(w * 0.25).toFixed(2)}" stroke-linejoin="round" transform="translate(-0.4 -0.6)"/>`; };
  // gauge angle: 0 mmHg at 225° from the top, 300 at 135° (a 270° sweep), clockwise
  const angOf = (p) => ((-135 + (ISO.clamp(p, 0, 300) / 300) * 270) * Math.PI) / 180;
  const onFace = (a, r, y = GA.y + 18.6) => [GA.x + Math.sin(a) * r, y, GA.z + Math.cos(a) * r];

  function armSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: ARM.x0, y: ARM.y - 40, w: ARM.len, d: 80, r: 30 }, 0, 20, P)}"/>`];
    for (const s of [70, 240]) out.push(ISO.tinted(FOAM, S(K.slabOf({ x: ARM.x0 + s - 26, y: ARM.y - 34, w: 52, d: 68, r: 4 }, 0, ARM.z - armR(s) + 4, P, 3, 0.6), { tone: "mid" })));
    // a plain arm form: flat mounting end, smooth taper, a gentle elbow, rounded far end. No hand, no detail.
    const prof = [[0, 0], [0, armR(0)]];
    for (let s = 10; s <= ARM.len - 24; s += 10) prof.push([s, armR(s), 1]);
    const rE = armR(ARM.len - 24);
    for (let i = 1; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); prof.push([ARM.len - 24 + 24 * Math.sin(a), rE * Math.cos(a) + (i === 8 ? 0 : 0), i < 8 ? 1 : 0]); }
    const F = xAx([ARM.x0, ARM.y, ARM.z]);
    out.push(ISO.tinted(SKIN, S(G.lathe(prof, F, P), { tone: "hi" })));
    out.push(S(G.disc(-4, 0, 30, F, P), { tone: "mid" }), D(G.dotsOf(F, -4, 22, 6, P, { all: true }), { size: 0.6 }));
    return out.join("");
  }
  // The cuff round the upper arm, swelling a little with pressure; its two ports at the front, low down.
  const cuffCache = new WeakMap();
  function cuffSvg(P, swell) {
    const key = swell.toFixed(1), memo = cuffCache.get(P) || cuffCache.set(P, {}).get(P);
    if (memo[key]) return memo[key];
    const F = xAx([ARM.x0, ARM.y, ARM.z]), [s0, s1] = CUFF, prof = [[s0, 0], [s0, armR(s0) + 2], [s0 + 6, armR(s0 + 6) + 4 + swell, 1]];
    for (let s = s0 + 20; s <= s1 - 20; s += 20) prof.push([s, armR(s) + 4.6 + swell * 1.4, 1]);
    prof.push([s1 - 6, armR(s1 - 6) + 4 + swell, 1], [s1, armR(s1) + 2], [s1, 0]);
    const r = (s) => armR(s) + 4.6 + swell * 1.4;
    const seams = [s0 + 20, s1 - 20].map((s) => G.arcOf(F, s, r(s) - 0.2, P)).join("");
    return (memo[key] = ISO.tinted(CLOTH, S(G.lathe(prof, F, P), { tone: "hi", inner: L(seams, { tone: "faint" }) })) + `<path d="${G.arcOf(F, 96, r(96) + 0.1, P, { from: 1.6, to: 2.6 })}" stroke="#e8eef4" stroke-width="1.4" fill="none"/>`);
  }
  const PORT = (dx) => [ARM.x0 + 92 + dx, ARM.y + 28, ARM.z - 34];
  function gaugeSvg(P) {
    const out = [], F = yAx([GA.x, GA.y, GA.z]);
    // stand: foot, post, the yoke holding the case
    out.push(S(K.slabOf({ x: GA.x - 26, y: GA.y - 14, w: 52, d: 30, r: 5 }, 0, 6, P, 4, 0.8), { tone: "mid" }), S(K.cylinder(GA.x, GA.y + 2, 4, 6, GA.z - GA.r - 6, P, 18), { tone: "mid", crease: "none" }));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 14, GA.r, F, P), { tone: "mid", inner: L(G.arcOf(F, 7, GA.r, P), { tone: "faint" }) })));
    out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(14, 18.6, GA.r - 3.4, GA.r + 1, F, P), { tone: "hi" })));
    out.push(`<path d="${G.circleOf(F, 18.5, GA.r - 3.4, P)}" fill="#fbfbfa" stroke="#55575c" stroke-width="0.6"/>`);
    // ticks every 2 mmHg from 0 to 300, long every 10, numbers every 20; the green zone and the zero box
    const minor = [], major = [], nums = [];
    for (let p = 0; p <= 300; p += 2) {
      const a = angOf(p), r0 = GA.r - 3.6, r1 = r0 - (p % 10 ? 2.4 : 5);
      (p % 10 ? minor : major).push(K.pathOf([K.iso(onFace(a, r0), P), K.iso(onFace(a, r1), P)]));
      if (p % 40 === 0) { const q = onFace(a, GA.r - 13.5); nums.push(K.faceTextSvg(ISO.faceMatrix(P, [q[0], q[1], q[2] - 2], 1), String(p), { size: 5.6, tone: "mid", anchor: "middle" })); }
    }
    const arc = (p0, p1, r) => K.pathOf(Array.from({ length: 21 }, (_, i) => K.iso(onFace(angOf(p0 + ((p1 - p0) * i) / 20), r), P)));
    out.push(`<path d="${arc(0, 300, GA.r - 3.6)}" fill="none" stroke="#55575c" stroke-width="0.6"/>`, `<path d="${arc(80, 120, GA.r - 8.4)}" fill="none" stroke="#2f9e5b" stroke-width="2.2"/>`);
    out.push(`<path d="${minor.join("")}" stroke="#55575c" stroke-width="0.6" fill="none"/><path d="${major.join("")}" stroke="#1d1f22" stroke-width="1.1" fill="none"/>`, `<g style="--anatomy-mid:#1d1f22">${nums.join("")}</g>`);
    out.push(`<g style="--anatomy-mid:#55575c">${K.faceTextSvg(ISO.faceMatrix(P, onFace(Math.PI, 12), 1), "mmHg", { size: 4.6, tone: "mid", anchor: "middle" })}</g>`);
    // the port under the case where the tube lands
    out.push(ISO.tinted(ISO.T.brass, S(G.disc(0, 7, 3.4, G.frameOf([GA.x - 20, GA.y + 4, GA.z - GA.r + 5], [0, 0, -1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi" })));
    return out.join("");
  }
  function needleSvg(P, p) {
    const a = angOf(p), n = [Math.cos(a), -Math.sin(a)], y = GA.y + 19.4;
    const pts = [[GA.r - 6, 0], [-7, 1.6], [-7, -1.6]].map(([r, w]) => K.iso([GA.x + Math.sin(a) * r + n[0] * w, y, GA.z + Math.cos(a) * r + n[1] * w], P));
    return `<path d="${K.pathOf(pts, true)}" fill="#c0392b" stroke="#6b1a12" stroke-width="0.5" stroke-linejoin="round"/>` + S(G.disc(18.6, 21, 3.2, yAx([GA.x, GA.y, GA.z]), P, { steps: 18 }), { tone: "mid" });
  }
  // The bulb: a pear of rubber along +x from the valve, squashed by `sq` while it is squeezed; the valve and its screw.
  const bulbCache = new WeakMap();
  function bulbSvg(P, sq) {
    const key = sq.toFixed(2), memo = bulbCache.get(P) || bulbCache.set(P, {}).get(P);
    if (memo[key]) return memo[key];
    const F = xAx([BULB.x, BULB.y, BULB.z]), k = 1 - sq * 0.22, prof = [[0, 0], [0, 6.5]];
    for (let i = 1; i <= 12; i++) { const t = i / 12; prof.push([8 + t * 74, (6.5 + Math.sin(t * Math.PI * 0.92) * 18 * (t < 0.5 ? 1 : 1)) * (t > 0.2 ? k : 1), 1]); }
    prof.push([86, 0]);
    const out = [];
    out.push(ISO.tinted(ISO.T.rubber, S(G.lathe(prof, F, P), { tone: "hi" })));
    return (memo[key] = out.join(""));
  }
  function valveSvg(P) {
    const F = xAx([BULB.x - 26, BULB.y, BULB.z]);
    return ISO.tinted(ISO.T.steel, S(G.disc(0, 26, 6, F, P), { tone: "hi", inner: L(G.arcOf(F, 9, 6, P) + G.arcOf(F, 19, 6, P), { tone: "faint" }) }) +
      S(G.disc(-6, 0, 3, F, P), { tone: "mid" }) + S(G.disc(10, 16, 4, G.frameOf([BULB.x - 13, BULB.y, BULB.z + 6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "mid" })) +
      ISO.tinted(ISO.T.plastic, S(G.disc(16, 24, 6.4, G.frameOf([BULB.x - 13, BULB.y, BULB.z + 6], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi", inner: L(K.knurl(BULB.x - 13, BULB.y, 6.4, BULB.z + 22, BULB.z + 30, 18, P, 0), { tone: "lo" }) }));
  }

  ISO.add({
    name: "bpcuff", title: "Blood-pressure cuff", compare: "bpcuff 470 280 320 |120/80",
    about: "A cuff on a teaching-model arm with a dial gauge and squeeze bulb: pump to 180, let the air out, and read systolic where the beats start kicking the needle and diastolic where they stop.",
    line: "bpcuff cx cy size lab=0 lit=cuff|gauge|bulb|valve |text",
    demo: { line: "bpcuff 470 280 320 |120/80", script: [{ set: { k: "pump", lit: "bulb" }, hold: "settle" }, { set: { k: "deflate", lit: "gauge" }, hold: 9 }, { set: { lit: "valve" }, hold: "settle" }] },
    make([cx, cy, size = 320], o, text, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = size * 1.85, H = size * 1.2;
      const [sbp, dbp] = (/(\d+)\s*\/\s*(\d+)/.exec(text || "") || [0, 120, 80]).slice(1).map(Number);
      const pts = [[ARM.x0, ARM.y - 40, 0], [ARM.x0 + ARM.len, ARM.y + 40, 0], [ARM.x0, ARM.y, ARM.z + 45], [ARM.x0 + ARM.len, ARM.y, ARM.z + 40], [GA.x - GA.r, GA.y + 20, GA.z + GA.r], [GA.x - 26, GA.y + 16, 0], [BULB.x + 86, BULB.y + 25, 0]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 56, elevation: 26 }, parent);
      const h1 = G.fillet([PORT(0), [PORT(0)[0], PORT(0)[1] + 14, 3], [GA.x - 20, GA.y - 30, 3], [GA.x - 20, GA.y + 4, 3], [GA.x - 20, GA.y + 4, GA.z - GA.r - 2]], 16, 9);
      const h2 = G.fillet([PORT(16), [PORT(16)[0], PORT(16)[1] + 14, 3], [BULB.x - 60, BULB.y - 20, 3], [BULB.x - 44, BULB.y, BULB.z], [BULB.x - 32, BULB.y, BULB.z]], 16, 9);
      g.innerHTML = `<g>${ISO.tinted(ISO.T.wood, S(K.slabOf({ x: -190, y: -110, w: 380, d: 240, r: 8 }, -14, 14, P, 6, 0.8), { tone: "lo" }))}<g data-part="arm"></g></g><g data-name="cuff"></g>` +
        `<g data-name="tubes">${hose(P, h1)}${hose(P, h2)}${[0, 16].map((d) => ISO.tinted(ISO.T.plastic, S(G.disc(0, 8, 4.2, G.frameAlong(PORT(d), [0, 0.6, -0.8]), P), { tone: "mid" }))).join("")}</g>` +
        `<g data-name="gauge">${gaugeSvg(P)}<g data-part="needle"></g></g><g data-name="valve">${valveSvg(P)}</g><g data-name="bulb"></g><g data-part="words"></g>`;
      const q = (k) => g.querySelector(`[data-part="${k}"]`), nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const s = { p: 0, k: "rest", t: 0, sq: 0, kick: 0, lastBeat: 0, heard: [], lit: o.lit || "" };
      if (lab) {
        const word = (p, t, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], t, "#444", { anchor, size: 14, dy }); };
        q("words").innerHTML = word([ARM.x0 + (CUFF[0] + CUFF[1]) / 2, ARM.y, ARM.z + 50], "Cuff", "middle", -8) + word([GA.x - GA.r - 4, GA.y + 18, GA.z], "Gauge", "end", 4, -6) +
          word([BULB.x + 86, BULB.y, BULB.z], "Bulb", "start", 4, 8) + word([BULB.x - 13, BULB.y, BULB.z + 34], "Air valve", "middle", -8) + word([ARM.x0 + 240, ARM.y, ARM.z + 34], "Model arm", "middle", -8);
      }
      const draw = () => {
        w.rebuild(nm("cuff"), (Math.round(s.p / 30) * 0.5).toFixed(1), () => cuffSvg(P, Math.round(s.p / 30) * 0.5));
        w.rebuild(q("needle"), (s.p + s.kick).toFixed(1), () => needleSvg(P, s.p + s.kick));
        w.rebuild(nm("bulb"), (Math.round(s.sq * 4) / 4).toFixed(2), () => bulbSvg(P, Math.round(s.sq * 4) / 4));
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name === s.lit));
      };
      g.set = (p) => { if (p.k) s.k = p.k; if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        if (s.k === "pump") {
          // each squeeze (0.8 s) pushes about 12 mmHg into the cuff
          if (calm) s.p = TOP;
          s.p = Math.min(TOP, s.p + PUMP * dt); s.sq = s.p < TOP ? 0.5 + 0.5 * Math.sin(s.t * Math.PI * 2.5) : ISO.follow(s.sq, 0, dt, 0.1);
          if (s.p >= TOP && s.sq < 0.01) { s.sq = 0; s.k = "held"; }
        } else if (s.k === "deflate") {
          s.p = Math.max(0, s.p - (s.p > dbp - 10 ? DEFLATE : 60) * dt);
          // beats get through while the cuff is between diastolic and systolic: each kicks the needle up and back
          if (s.p <= sbp && s.p >= dbp && s.t - s.lastBeat >= 60 / HR) { s.lastBeat = s.t; if (s.heard.length < 2 || s.p < dbp + 4) s.heard.push(Math.round(s.p)); }
          if (calm) { s.p = 0; s.heard = [sbp, dbp]; }
          if (s.p === 0) s.k = "done";
        }
        const since = s.t - s.lastBeat;
        s.kick = s.k === "deflate" && s.p <= sbp + 1 && s.p >= dbp - 1 ? 3 * Math.exp(-since * 9) * Math.sin(Math.min(Math.PI, since * 12)) : 0;
        draw();
        return s.k === "pump" || s.k === "deflate";
      };
      g.readout = () => {
        const p = Math.round(s.p);
        if (s.k === "pump") return `squeezing the bulb · cuff ${p} mmHg`;
        if (s.k === "held") return `cuff ${p} mmHg · above systolic, the artery is squeezed shut · no beats`;
        if (s.k === "deflate") return p > sbp ? `letting air out · ${p} mmHg · artery still shut, no beat` : p >= dbp ? `${p} mmHg · blood gets through on each beat: tapping sounds, the needle kicks · first beat at ${sbp} = systolic` : `${p} mmHg · beats have stopped at ${dbp} = diastolic`;
        if (s.k === "done") return `${sbp}/${dbp} mmHg · systolic ${sbp} (first beat) over diastolic ${dbp} (last beat)`;
        return "cuff on the upper arm, at heart level · 0 mmHg";
      };
      draw();
      // the arm is a third of the build and never changes: a part of its own (see ISO.later)
      ISO.later(() => { g.querySelector('[data-part="arm"]').innerHTML = armSvg(P); });
      return g;
    },
  });
})();
