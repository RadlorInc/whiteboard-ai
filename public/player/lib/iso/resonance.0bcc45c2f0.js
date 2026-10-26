// "resonance cx cy width k=resonance|damped L=12 liquid=water release=1 lab=1 lit=fork|tube|meter|spring|logger"
// resonance: a 512 Hz tuning fork rings over a glass tube standing in a tall jar of water. Raising the tube makes the air
// column longer. The column has its own natural notes, f = v/(4(L + e)) and 3v/(4(L + e)) (closed at the water, open at
// the top, end correction e = 0.6r); when one of them matches the fork the column is driven at its natural frequency and
// the sound swells: resonance, at L = λ/4 − e = 15.9 cm and 3λ/4 − e = 49.4 cm (v = 343 m/s, λ = 67 cm). A sound meter
// shows how loud it is. set({ L: cm }) slides the tube.
// damped: a mass on a spring hangs into a beaker; pulled down 3 cm and let go, it oscillates and dies away. In air it
// rings on (light damping); in water it dies in a few swings (underdamped); in oil it creeps straight back with no
// overshoot (critical damping, the quickest); in glycerol it oozes back slowly (overdamped). A motion sensor under the
// force sensor at the top of the spring draws each release on the logger, so the curves can be compared. set({ liquid, release: 1 }).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const V = 343, F = 512, RT = 14, E = 0.6 * 1.4, PCM = 2.4, MAT = { x: -120, y: -80, w: 240, d: 150, r: 5 }, JAR = { r: 34, h: 170 }, WL = 3 + 160;
  const ZETA = { air: 0.03, water: 0.18, oil: 1, glycerol: 3 }, COL = { air: "#888", water: "#2b6cc4", oil: "#2c8a2c", glycerol: "#c0392b" }, W0 = (2 * Math.PI) / 0.8;
  const loud = (Lcm) => {
    let a = 0;
    for (const n of [1, 3]) { const fn = (n * V) / (4 * (Lcm + E) / 100), r = F / fn, Q = 14; a = Math.max(a, 1 / Math.sqrt((1 - r * r) ** 2 + (r / Q) ** 2)); }
    return Math.min(1, a / 14);
  };
  const x = (z, tt) => {   // displacement (cm, down +) after release from 3 cm with damping ratio z
    const w = W0, A = 3;
    if (z < 1) { const wd = w * Math.sqrt(1 - z * z); return A * Math.exp(-z * w * tt) * (Math.cos(wd * tt) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * tt)); }
    if (z === 1) return A * (1 + w * tt) * Math.exp(-w * tt);
    const q = Math.sqrt(z * z - 1), r1 = -w * (z - q), r2 = -w * (z + q);
    return (A * (r2 * Math.exp(r1 * tt) - r1 * Math.exp(r2 * tt))) / (r2 - r1);
  };

  // ── resonance tube
  function tubeBench(P) {
    return LAB.mat(P, MAT, 3, "lo", ISO.T.wood) + `<g transform="${K.translateAlong(P, [0, 0, 3])}">${LAB.standBase(P, { x: -110, y: -70, w: 70, d: 56, r: 5 }, [-90, -50])}${LAB.rod(P, [-90, -50], 14, 400)}</g>`;
  }
  // the sound meter on the mat: a box with a dial window; its needle is drawn live
  function meterSvg(P) {
    const out = [];
    out.push(ISO.wbox(P, [50, 96], [20, 50], [3, 40], "mid"), ISO.tinted(ISO.T.plastic, S(G.disc(0, 4, 3, G.frameOf([60, 50, 32], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "hi" })));
    out.push(S(K.slabOf({ x: 54, y: 50, w: 38, d: 0.6, r: 0.2 }, 10, 18, P, 1), { tone: "hi", crease: "none" }));
    out.push(ISO.tinted(ISO.T.plastic, S(G.solidOf([[0, 4.6], [10, 4.6], [14, 2.4, 1]], G.frameOf([73, 35, 40], [0, 0, 1], [1, 0, 0], [0, 1, 0]), P), { tone: "hi" })));
    return out.join("");
  }
  // (the tube and the fork are held by clamp jaws drawn as ISO.box parts the audit can't see, and slid by a transform;
  // each prong's faint blur copies overlap it on purpose: those are its loose and sunk lines, with the LAB.boss ones)
  const jar = (P) => LAB.vessel(P, [0, 0, 3], [[0, JAR.r - 2], [0.7, JAR.r - 0.6, 1], [2, JAR.r], [JAR.h, JAR.r]]);
  function tubeSvg(P, top) {
    const bot = top - 60 * PCM, F0 = LAB.Z([0, 0, bot]);   // a 60 cm tube
    return `<g style="${ISO.T.glass}">${S(G.lathe([[0, RT], [top - bot, RT], [top - bot, RT - 1.4], [0, RT - 1.4]], F0, P, { steps: 40 }), { tone: "hi" })}</g>`;
  }
  // the fork, ringing: two prongs on a stem, clamped by its stem above the tube; at 512 Hz the prongs are a blur, so
  // each is drawn faintly at both ends of its swing over the still one
  function forkSvg(P, top, amp) {
    const z0 = top + 12, out = [], dir = G.unit3([90, 50, 0]).slice(0, 2), c = LAB.clamp(P, [-90, -50], z0 + 72, dir, Math.hypot(90, 50), 2.2, { jawH: 8 });
    out.push(LAB.boss(P, [-90, -50], z0 + 72, dir), c.back, ISO.tinted(ISO.T.steel, S(G.disc(0, 26, 2.2, LAB.Z([0, 0, z0 + 64]), P, { steps: 14 }), { tone: "mid" })), c.front);
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-7.4, 7.4], [-2.2, 2.2], [z0 + 58, z0 + 64], "mid")));
    for (const xx of [-5, 5]) out.push(`<g opacity=".3">${[-amp, amp].map((d) => ISO.tinted(ISO.T.steel, ISO.wbox(P, [xx + d * Math.sign(xx) - 2.2, xx + d * Math.sign(xx) + 2.2], [-2.2, 2.2], [z0, z0 + 58], "mid"))).join("")}</g>`, ISO.tinted(ISO.T.steel, ISO.wbox(P, [xx - 2.2, xx + 2.2], [-2.2, 2.2], [z0, z0 + 60], "mid")));
    return out.join("");
  }

  // ── damped spring
  const BK = { r: 36, h: 90 }, ZTOP = 196, LREST = 110;
  function springBench(P) {
    const out = [LAB.mat(P, MAT, 3, "lo", ISO.T.wood), `<g transform="${K.translateAlong(P, [0, 0, 3])}">${LAB.standBase(P, { x: -110, y: -70, w: 70, d: 56, r: 5 }, [-90, -50])}${LAB.rod(P, [-90, -50], 14, ZTOP + 24)}${LAB.boss(P, [-90, -50], ZTOP - 6, [0.87, 0.5])}</g>`];
    out.push(S(G.disc(7.5, 104, 2.2, LAB.A([-90, -50, ZTOP + 3.5], G.unit3([90, 50, 0])), P), { tone: "mid" }));
    // a force sensor hangs from the arm's end; the spring hooks under it, and its cable runs to the logger
    out.push(ISO.tinted(ISO.T.blue, ISO.wbox(P, [-6, 6], [-5, 5], [ZTOP - 6, ZTOP + 1.5], "mid")));
    out.push(`<path d="${K.pathOf(LAB.bend([[6, 0, ZTOP - 2], [30, -20, ZTOP - 10], [60, -60, 80], [60, -66, 66]], 8).map((p) => K.iso(p, P)))}" fill="none" stroke="#2a2b2f" stroke-width="1.2" stroke-linecap="round"/>`);
    // the logger at the back right with its screen facing the reader, wired to the motion sensor
    out.push(ISO.wbox(P, [30, 112], [-74, -66], [3, 70], "mid"), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [36, 106], [-66, -65.4], [10, 64], "hi")));
    return out.join("");
  }
  const beaker = (P) => LAB.vessel(P, [0, 0, 3], [[0, BK.r - 2], [0.7, BK.r - 0.6, 1], [2, BK.r], [BK.h, BK.r]], { spout: true });
  // the spring (rebuilt as it stretches) and the hanger with its slotted masses (built once, slid by dz)
  function springSvg(P, dz) {
    const zt = ZTOP - LREST - dz, pts = [];
    for (let k = 0; k <= 14 * 10; k++) { const a = (k / 10) * 2 * Math.PI, z = ZTOP - 6 - ((ZTOP - 6 - zt - 4) * k) / (14 * 10); pts.push(K.iso([Math.cos(a) * 7, Math.sin(a) * 7, z], P)); }
    return `<path d="${K.pathOf(pts)}" fill="none" stroke="#5a6068" stroke-width="1.4"/>`;
  }
  function massSvg(P) {
    const zt = ZTOP - LREST, out = [S(K.cylinder(0, 0, 1, zt, 5, P, 10), { tone: "mid", crease: "none" }), S(K.cylinder(0, 0, 13, zt - 6, 6, P, 32), { tone: "mid" })];
    for (let k = 0; k < 4; k++) out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 13, zt - 6 - (k + 1) * 6, 6, P, 32), { tone: "mid" })));
    return out.join("");
  }

  ISO.add({
    name: "resonance", title: "Resonance tube and damped spring", compare: "resonance 480 270 440 k=resonance",
    about: "A tuning fork over an air column in water gets loud when the column's own note matches it (resonance); a spring and mass dipped in air, water, oil or glycerol shows light, critical and heavy damping.",
    line: "resonance cx cy width k=resonance|damped L=12 liquid=air|water|oil|glycerol release=1 lab=1 lit=fork|tube|meter|spring|logger",
    demo: { line: "resonance 480 270 440 k=resonance L=8", script: [{ set: { L: 8 }, hold: 1 }, { set: { L: 15.9, lit: "meter" }, hold: "settle" }, { set: { L: 30, lit: "" }, hold: "settle" }, { set: { L: 49.4, lit: "meter" }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.15, H = size * 1.08;
      const tall = o.k === "damped" ? ZTOP + 26 : 404;   // framed for the set-up the line asks for
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 3), [0, 0, tall], [-90, -50, tall]], cx, cy, W, H, { azimuth: 56, elevation: 18 }, parent);
      const s = { k: o.k === "damped" ? "damped" : "resonance", L: ISO.clamp(ISO.num(o, "L", 12), 5, 55), liq: ZETA[o.liquid] !== undefined ? o.liquid : "water", t: o.release === "1" ? 0 : -1, runs: [], clock: 0 };
      s.LT = s.L;
      let lit = o.lit || "", built = "";
      const el = {}, w = ISO.writer();
      const build = () => {
        if (s.k === "resonance") {
          const J = jar(P);
          g.innerHTML = `<g>${tubeBench(P)}</g><g data-name="meter">${meterSvg(P)}<g data-part="needle"></g></g><g>${J.back()}${J.liquid(WL, "clear")}</g><g data-part="tube" data-name="tube"></g><g>${J.front()}</g><g data-part="clamp" data-name="fork"></g><g data-part="waves"></g><g data-part="words"></g>`;
        } else {
          const B = beaker(P);
          g.innerHTML = `<g data-name="logger">${springBench(P)}<g data-part="trace"></g></g><g>${B.back()}</g><g data-part="liquid"></g><g data-name="spring"><g data-part="spring"></g><g data-part="mass"></g></g><g>${B.front()}</g><g data-part="words"></g>`;
        }
        Object.assign(el, LAB.parts(g));
      };
      const draw = () => {
        if (built !== s.k) { built = s.k; build(); }
        if (s.k === "resonance") {
          const top = WL + s.L * PCM, key = s.L.toFixed(2), A = loud(s.L);
          // the tube, its clamp and the fork are built once at L = 30 cm and slid up and down together
          const top0 = WL + 30 * PCM, shift = K.translateAlong(P, [0, 0, top - top0]);
          w.rebuild(el.tube, "built", () => tubeSvg(P, top0));
          w.rebuild(el.clamp, "built", () => { const c = LAB.clamp(P, [-90, -50], top0 - 30, G.unit3([90, 50, 0]).slice(0, 2), Math.hypot(90, 50), RT); return LAB.boss(P, [-90, -50], top0 - 30, G.unit3([90, 50, 0]).slice(0, 2)) + c.back + c.front + forkSvg(P, top0, 1.4); });
          w.attr(el.tube, "transform", shift); w.attr(el.clamp, "transform", shift);
          // sound swelling from the mouth: rings whose number and darkness follow the loudness
          w.rebuild(el.waves, `${key}${Math.round(A * 10)}${Math.floor(s.clock * 6) % 3}`, () => {
            const out = [], n = Math.round(A * 4), ph = (s.clock * 6) % 1;
            for (let k = 0; k < n; k++) { const r = RT + 8 + (k + ph) * 9, pts = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * 2 * Math.PI; pts.push(K.iso([Math.cos(a) * r, Math.sin(a) * r, top + 6], P)); } out.push(`<path d="${K.pathOf(pts, true)}" fill="none" stroke="#2b6cc4" stroke-width="1.2" opacity="${(0.25 + 0.6 * A) * (1 - k / 5)}"/>`); }
            return out.join("");
          });
          w.rebuild(el.needle, String(Math.round(A * 100)), () => { const c = [73, 50.7, 12], a = -1 + A * 2; return `<path d="${K.pathOf([K.iso(c, P), K.iso([c[0] + Math.sin(a) * 14, c[1], c[2] + Math.cos(a) * 14], P)])}" stroke="#c0392b" stroke-width="1.2" data-free=""/>`; });
          w.rebuild(el.words, lab ? `${key}${A > 0.6}` : "", () => !lab ? "" :
            ISO.word(K.iso([12, 0, top + 74], P), "512 Hz tuning fork", "#555", { size: 13, anchor: "start" }) + ISO.word(K.iso([-RT - 6, 0, (top + WL) / 2], P), `L = ${s.L.toFixed(1)} cm`, "#333", { size: 14, anchor: "end" }) +
            ISO.word(K.iso([73, 50, 56], P), A > 0.6 ? "loud: resonance" : "quiet", A > 0.6 ? "#c0392b" : "#777", { size: 14, dy: -8 }) + ISO.word(K.iso([-JAR.r - 4, 0, 60], P), "water", "#2b6cc4", { size: 13, anchor: "end" }));
        } else {
          const z = ZETA[s.liq], tt = s.t < 0 ? 0 : s.t, dz = s.t < 0 ? 0 : x(z, tt) * PCM, key = dz.toFixed(2);
          w.rebuild(el.spring, key, () => springSvg(P, dz));
          w.rebuild(el.mass, "built", () => massSvg(P));
          w.attr(el.mass, "transform", K.translateAlong(P, [0, 0, -dz]));
          w.rebuild(el.liquid, s.liq, () => (s.liq === "air" ? "" : beaker(P).liquid(70, { water: "clear", oil: "yellow", glycerol: "colourless" }[s.liq])));
          w.rebuild(el.trace, `${s.runs.length}${Math.floor(tt * 30)}`, () => {
            const x0 = 40, x1 = 102, zc = 37, sc = 8, out = [`<path d="${K.pathOf([[x0, -65.3, zc], [x1, -65.3, zc]].map((p) => K.iso(p, P)))}" stroke="#9aa0a8" stroke-width="0.6" data-free=""/>`];
            for (const r of [...s.runs, ...(s.t >= 0 ? [{ liq: s.liq, T: tt }] : [])]) {
              const pts = [];
              for (let k = 0; k <= 60; k++) { const q = Math.min(r.T, 5) * (k / 60); pts.push(K.iso([x0 + (q / 5) * (x1 - x0), -65.3, zc - x(ZETA[r.liq], q) * sc], P)); }
              out.push(`<path d="${K.pathOf(pts)}" fill="none" stroke="${COL[r.liq]}" stroke-width="1.2"/>`);
            }
            return out.join("");
          });
          w.rebuild(el.words, lab ? s.liq : "", () => !lab ? "" : ISO.word(K.iso([BK.r + 4, 0, 50], P), s.liq === "air" ? "beaker (empty: air)" : s.liq, COL[s.liq], { size: 14, anchor: "start" }) + ISO.word(K.iso([71, -70, 70], P), "displacement against time", "#555", { size: 13, dy: -6 }));
        }
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.k && (p.k === "damped") !== (s.k === "damped")) s.k = p.k === "damped" ? "damped" : "resonance";
        if (p.L !== undefined) s.LT = ISO.clamp(+p.L, 5, 55);
        if (p.liquid && ZETA[p.liquid] !== undefined) { if (s.t > 0) s.runs = [...s.runs.slice(-3), { liq: s.liq, T: s.t }]; s.liq = p.liquid; s.t = -1; }
        if (p.release !== undefined && +p.release) { if (s.t > 0) s.runs = [...s.runs.slice(-3), { liq: s.liq, T: s.t }]; s.t = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        if (!calm) s.clock += dt;
        s.L = ISO.follow(s.L, s.LT, dt, 0.6, calm);
        if (Math.abs(s.L - s.LT) < 0.02) s.L = s.LT;
        if (s.t >= 0 && s.t < 5) s.t = calm ? 5 : s.t + dt;
        draw();
        return s.k === "resonance" ? s.L !== s.LT : s.t >= 0 && s.t < 5;
      };
      g.readout = () => {
        if (s.k === "resonance") {
          const f1 = V / (4 * (s.L + E) / 100);
          return `air column L = ${s.L.toFixed(1)} cm · its notes ${f1.toFixed(0)} Hz and ${(3 * f1).toFixed(0)} Hz · fork 512 Hz · ${loud(s.L) > 0.6 ? "they match: resonance, loud" : "no match: quiet"} · resonance at λ/4 − e = 15.9 cm and 3λ/4 − e = 49.4 cm`;
        }
        const z = ZETA[s.liq];
        return `${s.liq} · damping ratio ζ ≈ ${z} · ${z < 1 ? "underdamped: it swings past and dies away" : z === 1 ? "critically damped: back to rest fastest, no overshoot" : "overdamped: creeps back slowly, no overshoot"} · undamped period 0.8 s`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
