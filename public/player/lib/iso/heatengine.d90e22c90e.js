// "heatengine cx cy size k=engine|fridge TH=80 run=1 lab=1 lit=engine|flywheel|cup|motor" — a Stirling engine on a mug.
// engine: a low-temperature Stirling engine sits on a mug of hot water. Air inside is shuffled between the hot bottom
// plate and the cool top plate by a loose displacer; it expands when hot and pushes the little power piston up, which
// turns the flywheel through a crank (the displacer's crank leads the piston's by 90°). Heat Q_H flows in from the hot
// water, some becomes work W at the flywheel and the rest, Q_C, leaves from the top plate to the air: Q_H = W + Q_C,
// and no engine can beat η = W/Q_H = 1 − T_C/T_H (17% for 80 °C water in a 20 °C room).
// fridge: a motor turns the same engine the other way round: work W goes in, heat Q_C is pulled out of the water in the
// mug (it gets colder) and Q_H = Q_C + W leaves from the top plate; best possible K = Q_C/W = T_C/(T_H − T_C).
// set({ run: 1|0 }), set({ TH: °C }) for hotter water (faster), set({ k }) swaps engine and fridge.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const MAT = { x: -110, y: -80, w: 230, d: 160, r: 5 }, ZT = 70, RP = 56, ZS = 158, XF = -46, RF = 46, CR = { d: [0, 7], p: [26, 4] }, ROD = 42;
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function benchSvg(P, k) {
    const out = [LAB.mat(P, MAT, 3, "lo", ISO.T.wood)];
    // the mug: a turned body with a thick base and a loop handle, with water to just under the rim
    const F = LAB.Z([0, 0, 3]);
    out.push(ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 34], [2, 36, 1], [6, 37], [ZT - 3, 39], [ZT - 3, 37.6], [6, 35.6], [6, 0]], F, P, { steps: 60 }), { tone: "hi" })));
    out.push(`<path d="${K.pathOf(LAB.bend([[-38, 0, 20], [-58, 0, 22], [-60, 0, 46], [-38, 0, 52]], 8).map((p) => K.iso(p, P)))}" fill="none" stroke="#33506f" stroke-width="${(K.screenRise(1, P) * 7 + 1.2).toFixed(1)}" stroke-linecap="round"/><path d="${K.pathOf(LAB.bend([[-38, 0, 20], [-58, 0, 22], [-60, 0, 46], [-38, 0, 52]], 8).map((p) => K.iso(p, P)))}" fill="none" stroke="#dfe9f4" stroke-width="${(K.screenRise(1, P) * 7).toFixed(1)}" stroke-linecap="round"/>`);
    // a digital thermometer on the mat, its probe taped to the mug's side
    out.push(ISO.wbox(P, [44, 82], [30, 56], [3, 9], "mid"), ISO.tinted(ISO.T.plastic, ISO.wbox(P, [48, 78], [56, 56.6], [4, 8.5], "hi")));
    out.push(`<path d="${K.pathOf(LAB.bend([[50, 32, 9], [46, 26, 22], [36, 16, 30], [34.6, 14, 30]], 6).map((p) => K.iso(p, P)))}" fill="none" stroke="#3a3e44" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`);
    out.push(D([K.iso([50, 32, 9], P)], { size: 0.7 }), ISO.tinted(ISO.T.amber, ISO.box((u, w, y) => [34.4 + u * 0.93 + w * 0.37, 14 + u * 0.37 - w * 0.93, y], P, [0, 1.2], [-3, 3], [26, 34], "mid")));
    if (k === "fridge") {
      // the motor on a pillar beside the engine, its pulley in line with the one on the crankshaft's far end
      out.push(S(K.cylinder(62, -56, 12, 3, 3, P, 28, 0.4), { tone: "mid" }), S(K.cylinder(62, -56, 3, 6, ZS - 40 - 6, P, 16), { tone: "mid", crease: "none" }));
      out.push(ISO.tinted(ISO.T.plastic, S(G.disc(-12, 14, 11, G.frameOf([62, -56, ZS - 28], [1, 0, 0], [0, 1, 0], [0, 0, 1]), P), { tone: "hi" })));
    }
    return out.join("");
  }
  // The engine body: hot plate, clear acrylic ring, cold plate with its fins of nothing (a flat plate), the power
  // cylinder, the displacer gland and the bearing post that carries the crankshaft.
  // (the power piston rides inside its glass cylinder and the shaft runs through its bearing block: the audit's
  // sunk lines)
  function engineSvg(P) {
    const out = [ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RP, ZT, 3, P, 64, 0.4), { tone: "mid" }))];
    out.push(`<g style="${ISO.T.glass}">${S(K.cylinder(0, 0, RP - 4, ZT + 3, 14, P, 64), { tone: "hi", crease: "faint" })}</g>`);
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, RP, ZT + 17, 3, P, 64, 0.4), { tone: "mid" })));
    out.push(D(Array.from({ length: 8 }, (_, i) => K.iso([Math.cos((i / 8) * 2 * Math.PI + 0.4) * (RP - 2.4), Math.sin((i / 8) * 2 * Math.PI + 0.4) * (RP - 2.4), ZT + 20], P)), { size: 0.5 }));
    out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(0, 0, 4, ZT + 20, 6, P, 20), { tone: "mid" })));
    out.push(`<g style="${ISO.T.glass}">${S(K.cylinder(CR.p[0], 0, 8, ZT + 20, 24, P, 28), { tone: "hi" })}</g>`, ISO.tinted(ISO.T.brass, S(K.cylinder(CR.p[0], 0, 9, ZT + 20, 2.4, P, 28), { tone: "mid" })));
    // the bearing post and its bearing block, then the crankshaft along x
    out.push(S(G.disc(XF - 4, -22, 1.6, xAx([0, 0, ZS]), P), { tone: "mid" }));
    out.push(ISO.wbox(P, [-20, -12], [-5, 5], [ZT + 20, ZS - 5], "mid"), ISO.wbox(P, [-22, -10], [-7, 7], [ZS - 7, ZS + 7], "mid"));
    out.push(S(G.disc(-10, 44, 1.6, xAx([0, 0, ZS]), P), { tone: "mid" }));
    return out.join("");
  }
  // Moving parts at crank angle th: cranks, rods, displacer rod and power piston, and the flywheel with its spokes.
  function movingSvg(P, th, k) {
    const out = [], rods = [];
    for (const [key, ph] of [["d", 0], ["p", -Math.PI / 2]]) {
      const [x, r] = CR[key], a = th + ph, pin = [x, r * Math.sin(a), ZS - r * Math.cos(a)];
      const top = [x, 0, pin[2] - Math.sqrt(ROD * ROD - pin[1] * pin[1])];
      const rd = [Math.sin(a), -Math.cos(a)], td = [Math.cos(a), Math.sin(a)];
      out.push(ISO.box((u, w, y) => [x + u, rd[0] * y + td[0] * w, ZS + rd[1] * y + td[1] * w], P, [-1.6, 1.6], [-2.2, 2.2], [-2.2, r + 2.5], "mid"));
      rods.push({ x, pin, top, key });
    }
    for (const r of rods) {
      out.push(`<path d="${K.pathOf([K.iso(r.pin, P), K.iso(r.top, P)])}" stroke="#3c3f45" stroke-width="${(K.screenRise(1, P) * 2.4 + 1).toFixed(1)}" stroke-linecap="round"/><path d="${K.pathOf([K.iso(r.pin, P), K.iso(r.top, P)])}" stroke="#d9dadd" stroke-width="${(K.screenRise(1, P) * 2.4).toFixed(1)}" stroke-linecap="round"/>`);
      out.push(D([K.iso(r.pin, P), K.iso(r.top, P)], { size: 0.8 }));
      if (r.key === "d") out.push(S(K.cylinder(0, 0, 1.2, ZT + 26, r.top[2] - ZT - 26, P, 8), { tone: "mid", crease: "none" }));
      else out.push(ISO.tinted(ISO.T.plastic, S(K.cylinder(CR.p[0], 0, 7, r.top[2] - 14 - 4, 4, P, 16), { tone: "hi" })), S(K.cylinder(CR.p[0], 0, 1.2, r.top[2] - 14, 14, P, 8), { tone: "mid", crease: "none" }));
    }
    return out.join("");
  }
  // The flywheel's rim and hub (round, so they never need redrawing) and its six spokes, which turn with the shaft.
  const wheelSvg = (P) => { const F = xAx([XF, 0, ZS]); return S(G.ringBand(-3, 3, RF - 5, RF, F, P, { steps: 64 }), { tone: "hi" }) + L(G.circleOf(F, 3, RF - 5, P, 64), { tone: "lo" }) + S(G.disc(-3, 3, 6, F, P, { steps: 24 }), { tone: "mid" }); };
  const spokesSvg = (P, th) => L(G.spokesOf(xAx([XF, 0, ZS]), 3, 6, RF - 5, 6, P, { phase: th }), { tone: "mid" });
  // In the fridge: the pulley on the shaft's far end and the belt down to the motor's pulley.
  const beltSvg = (P) => {
    const m = [44, -56, ZS - 28];
    return S(G.disc(-2, 2, 8, xAx([44, 0, ZS]), P, { steps: 28 }), { tone: "mid" }) + S(G.disc(-2, 2, 5, xAx(m), P, { steps: 20 }), { tone: "mid" }) + S(G.disc(2, 6.2, 1.4, xAx(m), P, { steps: 12 }), { tone: "mid" }) +
      `<path d="${K.pathOf([[44, -8 * 0.447, ZS + 8 * 0.894], [44, -56 - 5 * 0.447, ZS - 28 + 5 * 0.894]].map((p) => K.iso(p, P)))}M${K.iso([44, 8 * 0.447, ZS - 8 * 0.894], P)}L${K.iso([44, -56 + 5 * 0.447, ZS - 28 - 5 * 0.894], P)}" stroke="#2a2b2f" stroke-width="1.6"/>`;
  };
  const fat = (P, a, b, color) => {
    const A = K.iso(a, P), B = K.iso(b, P), an = Math.atan2(B[1] - A[1], B[0] - A[0]), nx = -Math.sin(an), ny = Math.cos(an), w2 = 4.5, h = 11;
    const C = [B[0] - Math.cos(an) * h, B[1] - Math.sin(an) * h];
    const pts = [[A[0] + nx * w2, A[1] + ny * w2], [C[0] + nx * w2, C[1] + ny * w2], [C[0] + nx * w2 * 2.2, C[1] + ny * w2 * 2.2], B, [C[0] - nx * w2 * 2.2, C[1] - ny * w2 * 2.2], [C[0] - nx * w2, C[1] - ny * w2], [A[0] - nx * w2, A[1] - ny * w2]];
    return `<path d="M${pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}Z" fill="${color}" fill-opacity=".85" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>`;
  };

  ISO.add({
    name: "heatengine", title: "Stirling engine (heat engine and fridge)", compare: "heatengine 480 270 300 k=engine",
    about: "A Stirling engine on a mug of hot water turns heat into work (Q_H = W + Q_C, η ≤ 1 − T_C/T_H); driven by a motor it runs as a fridge and cools the water.",
    line: "heatengine cx cy size k=engine|fridge TH=80 run=1 lab=1 lit=engine|flywheel|cup|motor",
    demo: { line: "heatengine 480 270 300 k=engine TH=60", script: [{ set: { run: 1 }, hold: 3 }, { set: { TH: 90, lit: "flywheel" }, hold: 3 }, { set: { k: "fridge", lit: "" }, hold: 3.6 }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.75, H = size * 1.45;
      const { P, g } = ISO.frame([...K.boxCorners(MAT, 0, 3), [XF, 0, ZS + RF], [XF, RF, ZS], [XF, -RF, ZS], [0, 0, ZS + 30]], cx, cy, W, H, { azimuth: 32, elevation: 20 }, parent);
      const TC = 20, s = { k: o.k === "fridge" ? "fridge" : "engine", TH: ISO.clamp(ISO.num(o, "TH", 80), 30, 95), run: o.run !== "0", th: 0.3, w: 0, Tw: 0 };
      s.Tw = s.k === "fridge" ? TC : s.TH;
      let lit = o.lit || "", built = "";
      const el = {}, w = ISO.writer();
      const rpm = () => (s.k === "fridge" ? 120 : Math.max(0, (s.TH - TC - 8) * 3.2));   // a toy LTD engine: no start below ~8 °C difference
      const build = () => {
        g.innerHTML = `<g data-name="cup">${benchSvg(P, s.k)}<g data-part="temp"></g></g><g data-name="flywheel">${wheelSvg(P)}<g data-part="spokes"></g></g><g data-name="engine">${engineSvg(P)}</g><g data-part="moving"></g>${s.k === "fridge" ? `<g data-name="motor">${beltSvg(P)}</g>` : ""}<g data-part="flows"></g><g data-part="words"></g>`;
        Object.assign(el, LAB.parts(g));
      };
      const draw = () => {
        if (built !== s.k) { built = s.k; build(); }
        const thq = Math.round(s.th * 50) / 50;
        w.rebuild(el.moving, `${s.k}${thq}`, () => movingSvg(P, thq, s.k));
        w.rebuild(el.spokes, String(thq), () => spokesSvg(P, thq));
        w.rebuild(el.temp, Math.round(s.Tw).toString(), () => LAB.faceText(P, [63, 56.7, 5.4], [1, 0, 0], `${Math.round(s.Tw)} °C`, 4.4, "#7fe08a"));
        const on = s.w > 0.05, fr = s.k === "fridge";
        w.rebuild(el.flows, `${s.k}${on}`, () => {
          if (!on) return "";
          const hot = "#d0392b", cold = "#2b6cc4", grn = "#2c8a2c";
          return (fr ? fat(P, [RP + 14, 0, ZT - 34], [RP + 14, 0, ZT + 2], cold) + fat(P, [RP * 0.4, -RP * 0.5, ZT + 26], [RP * 0.4, -RP * 0.5, ZT + 60], hot) + fat(P, [XF, RF + 34, ZS + 30], [XF, RF + 4, ZS + 10], grn)
            : fat(P, [RP + 14, 0, ZT - 34], [RP + 14, 0, ZT + 2], hot) + fat(P, [RP * 0.4, -RP * 0.5, ZT + 26], [RP * 0.4, -RP * 0.5, ZT + 60], cold) + fat(P, [XF, RF + 4, ZS + 10], [XF, RF + 34, ZS + 30], grn));
        });
        w.rebuild(el.words, lab ? `${s.k}${on}` : "", () => {
          if (!lab) return "";
          const out = [ISO.word(K.iso([0, -40, 3], P), fr ? "water being cooled" : "hot water", fr ? "#2b6cc4" : "#d0392b", { size: 13, dy: 14 })];
          if (on) out.push(ISO.word(K.iso([RP + 18, 0, ZT - 18], P), fr ? "Q_C taken from the water" : "Q_H in", fr ? "#2b6cc4" : "#d0392b", { size: 14, anchor: "start" }),
            ISO.word(K.iso([RP * 0.4, -RP * 0.5, ZT + 64], P), fr ? "Q_H out to the air" : "Q_C out to the air", fr ? "#d0392b" : "#2b6cc4", { size: 14, dy: -6 }),
            ISO.word(K.iso([XF, RF + 36, ZS + 34], P), fr ? "W in (motor)" : "W out", "#2c8a2c", { size: 14, dy: -6 }));
          out.push(ISO.word(K.iso([XF, 0, ZS + RF + 4], P), "flywheel", "#555", { size: 13, dy: -6 }));
          return out.join("");
        });
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.k && (p.k === "fridge") !== (s.k === "fridge")) { s.k = p.k === "fridge" ? "fridge" : "engine"; s.Tw = s.k === "fridge" ? TC : s.TH; }
        if (p.TH !== undefined) s.TH = ISO.clamp(+p.TH, 30, 95);
        if (p.run !== undefined) s.run = !!+p.run;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), want = s.run ? rpm() / 60 : 0;
        s.w = ISO.follow(s.w, want, dt, 0.8, calm);
        if (Math.abs(s.w - want) < 0.003) s.w = want;
        if (!calm) s.th += s.w * 2 * Math.PI * dt * (s.k === "fridge" ? -1 : 1);
        s.Tw = ISO.follow(s.Tw, s.k === "fridge" ? (s.run ? 6 : TC) : s.TH, dt, 1.2, calm);
        if (Math.abs(s.Tw - (s.k === "fridge" ? (s.run ? 6 : TC) : s.TH)) < 0.05) s.Tw = s.k === "fridge" ? (s.run ? 6 : TC) : s.TH;
        draw();
        return s.w > 0 || s.w !== want;
      };
      g.readout = () => {
        if (s.k === "fridge") { const Tc = s.Tw + 273, Th = TC + 273; return `fridge · motor puts in W, heat Q_C comes out of the water (now ${s.Tw.toFixed(0)} °C) and Q_H = Q_C + W goes into the room · best possible K = Q_C/W = T_C/(T_H − T_C) = ${(Tc / Math.max(1, Th - Tc)).toFixed(0)}`; }
        const Th = s.TH + 273, Tc = TC + 273;
        return `engine · water ${s.TH.toFixed(0)} °C, room ${TC} °C · ${Math.round(rpm())} turns a minute · Q_H = W + Q_C · best possible η = 1 − T_C/T_H = 1 − ${Tc}/${Th} = ${((1 - Tc / Th) * 100).toFixed(0)}%`;
      };
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
