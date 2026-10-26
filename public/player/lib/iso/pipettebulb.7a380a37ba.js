// "pipettebulb cx cy k ml=10|25 fill=0..1 aim=down|flat c=clear|… lab=0 lit=pipette|bulb|liquid" — a PART (PARTS.md,
// batch 4): a glass volumetric (bulb) pipette, class AS, with a three-valve rubber safety filler on its top; origin the
// pipette's tip. aim=down: hanging tip down (as it delivers into a flask); aim=flat: lying on the bench along +x, resting
// on its tip and the filler's ball. Real sizes: 10 mL 400 mm long, bulb 15 mm across; 25 mL 456 mm, bulb 22 mm; a
// 6.5 mm stem with a fine bore, a drawn delivery tip, the etched ring mark round the upper stem, the colour-code band
// (10 mL red, 25 mL blue, ISO 1769) and the marking on the bulb. The bulb's length is worked out from the bore so the
// glass truly holds ml up to the ring. fill 1 = liquid to the ring; it is the fraction of that volume drawn up.
// The filler: a red rubber ball with valve A (air out) on top, valve S (suck) on its stem and valve E (empty) on a side
// branch. Built in mm; anchors in cm. set({ fill, c }).
(() => {
  const K = window.K, G = window.G;
  // ml: [bulb outer radius, bore, lower stem length, upper stem length (bulb to top), ring above the bulb, tolerance, code colour]
  const SIZES = { 10: [7.5, 1.4, 120, 190, 70, "0.02", "#d0392b"], 25: [11, 1.6, 140, 205, 80, "0.03", "#2f6fd0"] };
  const RS = 3.25, CONE = 18, IN = 18, RBALL = 26;   // stem radius, bulb shoulders, how far the glass goes into the filler, ball

  // the meridians (s from the tip): outer glass and the inside bore, for a bulb of straight length lb
  const outerOf = (rb, low, lb, up) => [[0, 1.05], [1.2, 1.4, 1], [30, 2.9, 1], [42, RS], [low, RS], [low + CONE * 0.45, rb * 0.72, 1], [low + CONE, rb, 1], [low + CONE + lb, rb, 1], [low + 2 * CONE + lb - CONE * 0.45, rb * 0.72, 1], [low + 2 * CONE + lb, RS], [low + 2 * CONE + lb + up - 1.2, RS], [low + 2 * CONE + lb + up, RS - 0.9, 1]];
  const innerOf = (rb, bore, low, lb, up) => [[0.4, 0.45], [30, bore * 0.85], [42, bore], [low, bore], [low + CONE * 0.45, rb * 0.72 - 1, 1], [low + CONE, rb - 1, 1], [low + CONE + lb, rb - 1, 1], [low + 2 * CONE + lb - CONE * 0.45, rb * 0.72 - 1, 1], [low + 2 * CONE + lb, bore], [low + 2 * CONE + lb + up, bore]];
  const rOf = (prof, s) => { for (let i = 1; i < prof.length; i++) if (s <= prof[i][0] + 1e-9) { const [s0, r0] = prof[i - 1], [s1, r1] = prof[i]; return s1 === s0 ? r1 : r0 + (r1 - r0) * ISO.clamp((s - s0) / (s1 - s0), 0, 1); } return prof.at(-1)[1]; };
  // mm³ inside up to s (frustums of the piecewise-linear bore)
  const volTo = (prof, s) => { let v = 0; for (let i = 1; i < prof.length && prof[i - 1][0] < s; i++) { const [a, ra] = prof[i - 1], b = Math.min(s, prof[i][0]), rb = rOf(prof, b); v += (Math.PI * (b - a) * (ra * ra + ra * rb + rb * rb)) / 3; } return v; };

  ISO.add({
    name: "pipettebulb", title: "Volumetric pipette and filler (part)", compare: null,
    about: "A glass volumetric pipette (10 or 25 mL, real size) with its ring mark and a red rubber pipette filler on top, drawing up liquid to the ring; hanging tip down or lying flat. anchors: top",
    line: "pipettebulb cx cy k ml=10|25 fill=0..1 aim=down|flat c=clear|… lab=0 lit=pipette|bulb|liquid",
    demo: { line: "pipettebulb 480 515 6.6 ml=25 fill=0 c=blue", script: [{ set: { fill: 1, lit: "liquid" }, hold: "settle" }, { set: { lit: "bulb" }, hold: 1.5 }, { set: { fill: 0.4, lit: "pipette" }, hold: "settle" }, { set: { c: "red", fill: 1, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, S = LAB.S, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const ml = SIZES[o.ml] ? +o.ml : 25, [rb, bore, low, up, ringUp, tol, code] = SIZES[ml];
      // the bulb's straight length: what is left of ml after the stems and shoulders, over the bulb's bore
      const v0 = volTo(innerOf(rb, bore, low, 0, up), low + 2 * CONE + ringUp), lb = Math.max(4, (ml * 1000 - v0) / (Math.PI * (rb - 1) ** 2));
      const OUT = outerOf(rb, low, lb, up), INN = innerOf(rb, bore, low, lb, up), LEN = OUT.at(-1)[0], sRing = low + 2 * CONE + lb + ringUp;
      const sF0 = LEN - IN, sBall = sF0 + 58, sTop = sBall + 2 * RBALL + 9;   // filler: its mouth, the ball's foot, the A valve's top
      // aim: down = the axis straight up from the tip; flat = lying along +x, tilted so it rests on the tip and the ball
      const flat = o.aim === "flat", tilt = flat ? Math.max(Math.asin(RBALL / (sBall + RBALL)), Math.asin(rb / (low + CONE + lb / 2))) : 0;
      const ax = flat ? [Math.cos(tilt), 0, Math.sin(tilt)] : [0, 0, 1], F = G.frameAlong([0, 0, 0], ax), at = (s) => ax.map((v) => v * s);
      const V = LAB.vessel(Pm, [0, 0, 0], OUT, { axis: ax, base: 0, wall: 1, rim: false });
      const st = { f: ISO.clamp(ISO.num(o, "fill", 0.6), 0, 1), c0: o.c || "clear", c1: o.c || "clear", mixT: 1 }, want = { f: st.f };
      let lit = o.lit || "";
      const vRing = volTo(INN, sRing), tab = [];
      for (let s = 0.4; s <= LEN; s += 0.5) tab.push([s, volTo(INN, s)]);
      const levelOf = (v) => { if (v <= 0) return 0; let i = 1; while (i < tab.length - 1 && tab[i][1] < v) i++; const [s0, v0] = tab[i - 1], [s1, v1] = tab[i]; return s0 + (s1 - s0) * ISO.clamp((v - v0) / ((v1 - v0) || 1), 0, 1); };
      // what is printed and etched on the glass: the ring mark, the colour band, the marking on the bulb
      const view = G.viewOf(Pm), face = G.angleToward(F, view), u = (a) => G.mul3(G.tangentOf(F, a), -1);
      const up3 = flat ? ax : [0, 0, 1], sMid = low + CONE + lb / 2, tsz = Math.min(rb * 0.42, 4.2);
      const marks = L(G.arcOf(F, sRing, RS + 0.05, Pm, { inward: true }), { tone: "faint", free: true }) + L(G.arcOf(F, sRing, RS + 0.05, Pm), { tone: "hi", free: true }) +
        ISO.tinted(ISO.tint(code, [LAB.mix(code, "#000000", 0.25), LAB.mix(code, "#000000", 0.12), code, LAB.mix(code, "#ffffff", 0.15)], LAB.mix(code, "#000000", 0.5)), S(G.disc(LEN - 34, LEN - 28, RS + 0.12, F, Pm), { tone: "mid", crease: "none" })) +
        LAB.faceText(Pm, G.pointOf(F, sMid + tsz * 1.3, rb + 0.1, face), u(face), `${ml} mL`, tsz, "#24425c", up3) +
        LAB.faceText(Pm, G.pointOf(F, sMid - tsz * 0.1, rb + 0.1, face), u(face), "Ex  20 °C", tsz * 0.62, "#24425c", up3) +
        LAB.faceText(Pm, G.pointOf(F, sMid - tsz * 1.2, rb + 0.1, face), u(face), `AS  ± ${tol} mL`, tsz * 0.56, "#24425c", up3);
      // the filler: stem (mouth over the glass, valve S's bulge), ball, valve A on top; valve E on a side branch
      const ballProf = [];
      for (let i = 0; i <= 14; i++) { const th = 0.24 + ((Math.PI - 0.44) * i) / 14; ballProf.push([sBall + RBALL - RBALL * Math.cos(th), RBALL * Math.sin(th), 1]); }
      const filler = [[sF0, 5.2], [sF0 + 1.5, 6.2, 1], [sF0 + 30, 6.2], [sF0 + 33, 8.4, 1], [sF0 + 44, 8.4, 1], [sF0 + 47, 6.2, 1], [sBall + 0.6, 6.2], ...ballProf.slice(1), [sTop - 8, 5.8], [sTop - 5, 7, 1], [sTop - 1, 6.6, 1], [sTop, 4.2]];
      const RUB = ["#a8362b", "#ef7a68"], RINK = "#5a1a12";
      const body = LAB.turned(Pm, at(0), filler.map(([s, r, sm]) => [s, r, sm]), RUB, RINK, { axis: ax, rims: [sF0 + 33, sF0 + 44, sTop - 8] });
      const perp = flat ? [0, 1, 0] : [1, 0, 0], eAt = at(sF0 + 16), side = G.dot3(perp, view) > 0, Fe = G.frameAlong(eAt, perp), aE = G.angleToward(Fe, view);
      const eValve = LAB.turned(Pm, eAt, [[0, 4.6], [10, 4.6], [12, 6, 1], [20, 6, 1], [22, 4.8, 1], [24, 3.6]], RUB, RINK, { axis: perp, rims: [12, 20] });
      const letter = (p, dir, txt) => LAB.faceText(Pm, p, dir, txt, 5, "#fff3ef", up3);
      const fillerSvg = (side ? "" : eValve) + body + (side ? eValve : "") +
        letter(G.pointOf(F, sTop - 14, Math.sqrt(RBALL ** 2 - (sTop - 14 - sBall - RBALL) ** 2) + 0.2, face), u(face), "A") +
        letter(G.pointOf(F, sF0 + 36.5, 8.5, face), u(face), "S") + (side ? letter(G.pointOf(Fe, 16, 6.1, aE), G.mul3(G.tangentOf(Fe, aE), -1), "E") : "");
      g.innerHTML = `<g data-name="pipette">${V.back()}</g><g data-name="liquid" data-part="liquid"></g><g data-name="pipette">${V.front()}${marks}</g>` +
        `<g data-name="bulb">${fillerSvg}</g><g data-part="words"></g>`;
      g.anchors = { top: at(sTop / 10) };
      const el = LAB.parts(g), w = ISO.writer();
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const q = 1 / 400;   // a visible step of the column (a 25 mL pipette's ring is 0.7 mm of 450)
      const draw = () => {
        const f = Math.round(st.f / q) * q, sl = Math.min(LEN - IN - 1, levelOf(f * vRing)), c = colour();
        w.rebuild(el.liquid, `${f.toFixed(4)} ${c}`, () => {
          if (sl < 1) return "";
          // the column: the bore's own turned shape from the tip to the level, and its surface
          const prof = INN.filter(([s]) => s < sl).concat([[sl, rOf(INN, sl)]]), r = rOf(INN, sl), ink = LAB.ink(c);
          return `<g opacity=".7">${LAB.turned(Pm, at(0), prof, [LAB.mix(LAB.col(c), "#000000", 0.18), LAB.mix(LAB.col(c), "#ffffff", 0.2)], ink, { axis: ax })}</g>` +
            (r > 2 ? `<path d="${G.circleOf(F, sl, r, Pm)}" fill="${LAB.mix(LAB.col(c), "#ffffff", 0.45)}" stroke="${ink}" stroke-width="0.7" opacity=".85"/>` : "");
        });
        // labels: beside the glass when it hangs, above it (in steps along it) when it lies flat
        const by = (p, i) => (flat ? G.add3(G.pointOf(F, p, 0, 0), [0, 0, 30 + i * 22]) : null);
        if (lab) w.rebuild(el.words, `${(f * ml).toFixed(1)} ${st.c1}`, () => LAB.word(Pm, lab, flat ? by(sBall + RBALL, 1) : G.add3(at(sTop), [0, 0, 10]), "pipette filler", "#556", { dy: flat ? 0 : -4 }) +
          LAB.word(Pm, lab, flat ? by(sRing, 0) : G.pointOf(F, sRing, RS + 6, face - 1.2), "ring mark", "#556", { anchor: flat ? "middle" : "start" }) +
          LAB.word(Pm, lab, flat ? by(sMid, 1) : G.pointOf(F, sMid, rb + 6, face - 1.4), `${(f * ml).toFixed(1)} mL`, LAB.ink(st.c1), { anchor: flat ? "middle" : "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) want.f = ISO.clamp(+p.fill, 0, 1);
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.f = ISO.follow(st.f, want.f, dt, 0.6, calm);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        draw();
        return st.f !== want.f || st.mixT < 1;
      };
      g.readout = () => `${ml} mL volumetric pipette (${Math.round(LEN)} mm, class AS ± ${tol} mL) · ${(st.f * ml).toFixed(1)} mL of ${st.c1} liquid drawn up${st.f >= 0.999 ? ", to the ring mark" : ""} · filler valves A (air out), S (suck), E (empty)`;
      draw();
      return g;
    },
  });
})();
