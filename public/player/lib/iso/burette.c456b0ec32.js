// "burette cx cy size c=pink lab=1 lit=burette|stopcock|flask|clamp" — a 50 mL burette on a stand over a conical flask.
// Glass tube (bore 14 mm, so 1 mL = 6.5 mm) graduated from 0.00 at the top down to 50 mL, a burette clamp, a glass
// stopcock with a PTFE key whose handle turns from across the tube (shut) to along it (open), and a fine tip. Opening it
// lets liquid run into the flask on a white tile: a thin stream when fast, single drops (0.05 mL) when slow. The reading
// is taken at the bottom of the meniscus; the volume delivered is the final reading minus the first.
// set({ deliver: mL }) runs that much in all (fast, then slowing to dropwise, as you would by hand).
// LAB.buretteRig is shared with "titration".
(() => {
  const K = window.K, G = window.G;
  const BORE = 7, MMML = 1000 / (Math.PI * BORE * BORE) / 1, CAP = 50;
  const BASE = { x: -78, y: -108, w: 156, d: 172, r: 5 }, ROD = [0, -86], TILE = { x: -58, y: -52, w: 116, d: 104, r: 3 };
  const FLASK = [[0, 39], [0.8, 41, 1], [2.6, 42.4, 1], [5, 42.6, 1], [8, 41.4], [96, 15.5, 1], [102, 13.2, 1], [106, 12.6], [134, 12.6], [135, 14, 1], [137.5, 14.3, 1], [139.5, 13.4]];
  const ZF = 13.6, ZTIP = ZF + 128, ZS = ZTIP + 26, ZB = ZS + 7, L = 40 + CAP * MMML + 30, S0 = L - 26;   // S0: the 0.00 mark, along the tube
  const TOPZ = ZB + L;

  const LAB = window.LAB;
  LAB.buretteRig = (P, g, { lab = true, flaskColour = "pink", indicator = null, start = 0, acidMl = 25, swirl = false, burColour = "clear" } = {}) => {
    const S = LAB.S, Ln = LAB.L, D = LAB.D;
    const flask = LAB.vessel(P, [0, 0, ZF], FLASK, { base: 2 });
    const bur = LAB.vessel(P, [0, 0, ZB], [[0, 3.6], [6, 3.6], [16, BORE + 0.9, 1], [20, BORE + 1], [L, BORE + 1], [L + 1, BORE + 2, 1], [L + 3, BORE + 1.8]], { base: 4, wall: 1 });
    const tip = LAB.vessel(P, [0, 0, ZS - 3], [[0, 3.2], [8, 3], [20, 1.5], [26, 1]], { axis: [0, 0, -1], base: 0, wall: 0.6, rim: false });
    const st = { V: start, target: start, rate: 0, tap: 0, drops: [], spawn: 0, flash: 0, sw: 0, phase: 0 };
    const cl = LAB.clamp(P, ROD, ZB + L * 0.55 - 6.5, [0, 1], 86, BORE + 1.2, { jawH: 16 });
    const stat = [LAB.standBase(P, BASE, ROD), LAB.rod(P, ROD, 14, TOPZ + 20), LAB.mat(P, TILE, 3, "lo", ISO.tint("#ffffff", ["#d9dcdf", "#e3e6e8", "#eceef0", "#f5f6f7"], "#7c8389"))].map((s) => ISO.tinted("", s));
    // the scale: 0.00 at the top, a line every 0.5 mL, long every 1 mL, numbered every 5
    const scale = () => {
      const a = bur.facing - 0.2, r = BORE + 1.15, rule = [], minor = [], major = [], nums = [];
      for (let s = S0 - CAP * MMML; s <= S0 + 0.01; s += MMML / 2) rule.push(K.iso(G.pointOf(bur.F, s, r, a), P));
      for (let v = 0; v <= CAP * 2; v++) {
        const s = S0 - (v / 2) * MMML, big = v % 2 === 0, n = big ? 5 : 3;
        (big ? major : minor).push(K.pathOf([0, 0.5, 1].map((k) => K.iso(G.pointOf(bur.F, s, r, a + (k * n) / r), P))));
        if (v % 10 === 0) nums.push(LAB.faceText(P, G.pointOf(bur.F, s - 1.6, r + 0.2, a + 9 / r), G.mul3(G.tangentOf(bur.F, a + 9 / r), -1), String(v / 2), 4.4));
      }
      return Ln(K.pathOf(rule), { tone: "mid" }) + Ln(minor.join(""), { tone: "lo", free: "end" }) + Ln(major.join(""), { tone: "mid", free: "end" }) + nums.join("") +
        LAB.faceText(P, G.pointOf(bur.F, S0 + 12, r + 0.2, bur.facing), G.mul3(G.tangentOf(bur.F, bur.facing), -1), "50 mL ± 0.05", 4);
    };
    // the stopcock: a glass barrel across the tube, a PTFE key with a lock nut, and the handle (rebuilt as it turns)
    const FX = (x) => LAB.X([x, 0, ZS]);
    const cockBody = () => `<g style="${ISO.T.glass}">${S(G.disc(-10, 10, 4.4, FX(0), P), { tone: "mid" })}${S(G.solidOf([[0, 4.2], [4, 4.2], [7, 3.4]], LAB.Z([0, 0, ZS + 2]), P), { tone: "mid" })}</g>` +
      `<g style="${ISO.T.steel}">${S(G.disc(-13, -10, 3.6, FX(0), P), { tone: "mid", inner: Ln(G.ribsOf(FX(0), -13, -10, 3.6, 18, P), { tone: "lo" }) })}</g>`;
    const handle = (open) => {
      const th = (1 - open) * (Math.PI / 2), d = [0, Math.sin(th), Math.cos(th)], n = [0, Math.cos(th), -Math.sin(th)];
      const at = (u, w, x) => [x, d[1] * u + n[1] * w, ZS + d[2] * u + n[2] * w];
      return `<g style="${ISO.T.paint}">${S(G.disc(10, 15, 3, FX(0), P), { tone: "hi" })}${ISO.box(at, P, [-9, 9], [-2.4, 2.4], [15, 18], "hi")}</g>`;
    };
    g.innerHTML = `<g data-name="stand">${stat.join("")}</g><g data-name="clamp">${LAB.boss(P, ROD, ZB + L * 0.55 - 6.5, [0, 1])}${cl.back}</g>` +
      `<g data-part="flaskmove"><g data-part="flask" data-name="flask"></g></g><g data-part="drops"></g>` +
      `<g data-name="burette">${tip.back()}<g data-part="tipliq"></g>${tip.front({ shine: false })}${cockBody()}<g data-part="handle" data-name="stopcock"></g>${bur.back()}<g data-part="burliq"></g>${bur.front()}${scale()}</g>` +
      `<g data-name="clamp">${cl.front}</g><g data-part="words"></g>`;
    const el = LAB.parts(g), w = ISO.writer();
    const flaskCol = () => {
      if (!indicator) return flaskColour;
      const p = ISO.clamp((st.V - acidMl) / 0.05, 0, 1), f = Math.max(p, st.flash * (st.V > acidMl - 2 ? 0.75 : 0.35));
      return LAB.blend("colourless", indicator, Math.round(f * 20) / 20);
    };
    const draw = () => {
      const off = swirl ? [Math.cos(st.phase) * 2.2 * st.sw, Math.sin(st.phase) * 2.2 * st.sw] : [0, 0];
      const fc = flaskCol(), vol = acidMl + st.V;
      w.rebuild(el.flask, `${fc} ${vol.toFixed(1)}`, () => flask.back() + flask.liquid(flask.levelFor(Math.round(vol * 10) / 10), fc) + flask.front());
      w.attr(el.flaskmove, "transform", K.translateAlong(P, [off[0], off[1], 0]));
      const s = S0 - st.V * MMML;
      w.rebuild(el.burliq, (Math.round(st.V * 20) / 20).toFixed(2), () => bur.liquid(S0 - (Math.round(st.V * 20) / 20) * MMML, burColour, { opacity: 0.85 }));
      w.rebuild(el.tipliq, st.tap > 0.05 ? "1" : "0", () => (st.tap > 0.05 ? `<path d="${K.pathOf([K.iso([0, 0, ZS - 2], P), K.iso([0, 0, ZTIP + 1], P)])}" stroke="${LAB.ink(burColour)}" stroke-width="1.6" opacity=".5"/>` : ""));
      w.rebuild(el.handle, st.tap.toFixed(3), () => handle(st.tap));
      w.rebuild(el.drops, st.drops.map((d) => d.toFixed(0)).join() + (st.rate > 0.35 ? "s" : ""), () => {
        const out = [];
        if (st.rate > 0.35) {
          const surf = ZF + flask.levelFor(vol), a = K.iso([0, 0, ZTIP], P), b = K.iso([0, 0, surf], P);
          out.push(`<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="${LAB.col(burColour)}" stroke-width="${(0.8 + st.rate).toFixed(2)}" opacity=".9"/><path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="${LAB.ink(burColour)}" stroke-width="0.4" opacity=".6"/>`);
        } else for (const z of st.drops) out.push(LAB.drop(P, [0, 0, z], 1.8, burColour));
        return out.join("");
      });
      if (lab) w.rebuild(el.words, st.V.toFixed(2), () => LAB.word(P, lab, bur.at(s, -1.4, 10), `${st.V.toFixed(2)} mL`, "#2b6cc4", { anchor: "start", size: 14 }) +
        LAB.word(P, lab, [0, 0, TOPZ + 8], "burette", "#556", { dy: -4 }) + LAB.word(P, lab, [-24, 0, ZS - 4], "tap", "#556", { anchor: "end", dy: 4 }) + LAB.word(P, lab, [TILE.x + TILE.w, TILE.y + TILE.d, 0], "white tile", "#556", { anchor: "start", dy: 14 }));
    };
    const rig = {
      st, draw,
      set: (p) => { if (p.deliver !== undefined) st.target = ISO.clamp(+p.deliver, 0, CAP); },
      update: (dt) => {
        if (ISO.still()) { st.V = st.target; st.tap = 0; st.rate = 0; st.drops = []; st.flash = 0; draw(); return false; }
        const left = st.target - st.V;
        // a hand on the tap: wide open while far off, nearly shut for the last half millilitre, then shut
        const wantRate = left > 1e-4 ? ISO.clamp(left * 0.9, 0.12, 1.5) : 0;
        st.rate = ISO.follow(st.rate, wantRate, dt, 0.25);
        if (wantRate === 0 && st.rate < 0.01) st.rate = 0;
        st.tap = ISO.follow(st.tap, wantRate ? 0.25 + 0.75 * Math.min(1, wantRate / 1.5) : 0, dt, 0.15);
        if (Math.abs(st.tap) < 0.002) st.tap = 0;
        if (st.rate > 0.35) { st.V = Math.min(st.target, st.V + st.rate * dt); st.drops = []; st.flash = Math.min(1, st.flash + dt * 2); }
        else if (st.rate > 0) {
          st.spawn += dt * st.rate;
          if (st.spawn >= 0.05 && left > 1e-4) { st.spawn = 0; st.drops.push(ZTIP - 1); }
        }
        // falling drops land in the flask and count once they hit the surface
        const surf = ZF + flask.levelFor(acidMl + st.V);
        st.drops = st.drops.map((z) => z - (ZTIP - z + 6) * 8 * dt).filter((z) => { if (z > surf) return true; st.V = Math.min(st.target, st.V + 0.05); st.flash = 1; return false; });
        st.flash = Math.max(0, st.flash - dt * (st.sw > 0.5 ? 1.6 : 0.7));
        st.sw = ISO.follow(st.sw, st.target - st.V > 1e-4 || st.flash > 0.05 ? 1 : 0, dt, 0.4);
        if (st.sw < 0.01 && st.target - st.V <= 1e-4) st.sw = 0;
        st.phase += dt * 7;
        draw();
        return Math.abs(st.target - st.V) > 1e-4 || st.tap > 0 || st.drops.length > 0 || st.flash > 0.01 || st.rate > 0 || (swirl && st.sw > 0);
      },
      flaskCol, bounds: [...K.boxCorners(BASE, 0, 8), [0, -86, TOPZ + 24], [0, 0, TOPZ + 10]],
    };
    return rig;
  };

  ISO.add({
    name: "burette", title: "Burette", compare: "burette 480 270 320 c=pink",
    about: "A 50 mL burette on a stand: turn the tap, liquid runs into the flask, and the scale (0 at the top) reads the volume delivered.",
    line: "burette cx cy size c=pink deliver=0 lab=1 lit=burette|stopcock|flask|clamp",
    demo: { line: "burette 480 270 330 c=pink", script: [{ set: { deliver: 10, lit: "stopcock" }, hold: "settle" }, { set: { deliver: 12.4, lit: "burette" }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, H2 = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(BASE, 0, 8), [0, -86, TOPZ + 24], [0, 0, TOPZ + 10]], cx, cy, W, H2, { azimuth: 50, elevation: 16 }, parent);
      const rig = LAB.buretteRig(P, g, { lab, flaskColour: o.c || "pink", start: 0, acidMl: 40, burColour: "clear" });
      rig.st.target = rig.st.V = ISO.clamp(ISO.num(o, "deliver", 0), 0, CAP);
      let lit = o.lit || "";
      const w = ISO.writer();
      g.set = (p) => { rig.set(p); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => { const m = rig.update(dt); LAB.light(w, g, lit); return m; };
      g.readout = () => `first reading 0.00 mL · now ${rig.st.V.toFixed(2)} mL · delivered ${rig.st.V.toFixed(2)} mL · tap ${rig.st.tap > 0.05 ? "open" : "shut"}`;
      rig.draw(); LAB.light(w, g, lit);
      LAB.title(parent, cx, cy - H2 / 2 - 8, t);
      return g;
    },
  });
})();
