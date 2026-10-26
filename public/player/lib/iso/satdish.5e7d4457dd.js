// "satdish cx cy height aim=0-10 lab=1 lit=dish|lnb|arm|mount|meter" — a satellite dish catching a signal.
// A 1.2 m prime-focus dish on a steel pole: base plate and bolts, the elevation bracket with its adjusting bolt, the
// spun-aluminium reflector with a rolled rim, three feed struts holding the LNB (the feed horn and the little box
// that turns the faint signal into one the cable can carry) at the focus, and the coax running down to a signal meter
// on the pole. The satellite is 36 000 km away, so its waves arrive parallel: the dish's parabola bounces every one of
// them to the one point where the LNB sits. aim= is how far off the satellite the dish points (degrees): the bounced
// rays then miss the horn and the meter drops (the beam of a 1.2 m dish is only about 1.5° wide; the drawing
// exaggerates the miss so it shows). set({ aim, lit }). World units: 1 = 10 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 6, F = 4.6, EL = 30, AZB = -62, MZ = 13.6, BACK = 1.2;
  const rad = (d) => (d * Math.PI) / 180, zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const AX = G.unit3([Math.cos(rad(EL)) * Math.cos(rad(AZB)), Math.cos(rad(EL)) * Math.sin(rad(AZB)), Math.sin(rad(EL))]);
  const VERTEX = G.add3([0, 0, MZ], G.mul3(AX, BACK)), DF = G.frameAlong(VERTEX, AX), FOCUS = G.pointOf(DF, F, 0, 0);
  const sOf = (r) => (r * r) / (4 * F), ALU = ISO.tint("#eef0f2", ["#aeb3b9", "#bcc0c5", "#cacdd1", "#d8dadd"], "#4a4f56");
  const signal = (aim) => Math.exp(-2.77 * (aim / 1.5) ** 2);
  const PAD = { x: -6.5, y: -6.5, w: 13, d: 13, r: 1 };

  function mountSvg(P) {
    const out = [ISO.tinted(ISO.T.road, S(K.slabOf(PAD, -1.4, 1.4, P, 3), { tone: "lo", halo: true }))];
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-2.2, 2.2], [-2.2, 2.2], [0, 0.4], "mid")));
    for (const [x, y] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) out.push(ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 0.4], [0.3, 0.36, 1], [0.6, 0.2]], zAx([x, y, 0.4]), P, { steps: 10 }), { tone: "mid" })));
    out.push(`<g data-name="mount">${ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.6, 0.4, MZ - 0.4, P, 24), { tone: "mid" }))}`);
    // the elevation bracket: two cheek plates on a collar, the pivot bolt through them
    out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 0.85, MZ - 1.6, 1.2, P, 24), { tone: "mid" })));
    for (const y of [-0.9, 0.7]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [-0.9, 1.1], [y, y + 0.2], [MZ - 0.4, MZ + 1.2], "mid")));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-1.2, 1.2, 0.18, G.frameOf([0.1, 0, MZ + 0.4], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P, { steps: 12 }), { tone: "hi" })), "</g>");
    return out.join("");
  }
  function meterSvg(P, sig) {
    const out = [`<g data-name="meter">${ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-0.9, 0.9], [0.6, 1.5], [6, 8.6], "mid"))}`];
    const face = (pts, fill) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, 1.52, z], P)), true)}" fill="${fill}" stroke="#111" stroke-width=".3"/>`;
    for (let i = 0; i < 5; i++) { const x0 = -0.7 + i * 0.3, on = sig > (i + 0.5) / 5; out.push(face([[x0, 6.6], [x0 + 0.2, 6.6], [x0 + 0.2, 6.9 + i * 0.3], [x0, 6.9 + i * 0.3]], on ? (sig > 0.6 ? "#5fae3a" : "#f4a531") : "#3a3e44")); }
    return out.join("") + "</g>";
  }
  function dishSvg(P) {
    const out = [];
    // the arm from the bracket's pivot to the dish's back, then the dish: back shell, rim, the bright concave face
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-0.2, BACK + 0.1, 0.32, G.frameAlong([0.1, 0, MZ + 0.4], AX), P, { steps: 14 }), { tone: "mid" })));
    const shell = []; for (let i = 0; i <= 10; i++) { const r = (R * i) / 10; shell.push([sOf(r) - 0.12, r, 1]); }
    out.push(`<g data-name="dish">${ISO.tinted(ALU, S(G.lathe([[-0.12, 0], ...shell.slice(1), [sOf(R) + 0.05, R + 0.15], [sOf(R) + 0.05, 0]], DF, P, { steps: 72 }), { tone: "hi" }))}`);
    out.push(`<path d="${G.circleOf(DF, sOf(R) + 0.06, R, P, 72)}" fill="#e3e6e9" stroke="#4a4f56" stroke-width=".8"/>`);
    // shading rings on the face, deeper toward the middle
    for (const f of [0.75, 0.5, 0.25]) out.push(`<path d="${G.circleOf(DF, sOf(R) + 0.07, R * f, P, 56)}" fill="#d4d8dc" fill-opacity=".45" stroke="none"/>`);
    out.push("</g>");
    return out.join("");
  }
  // three struts from the rim to the LNB, the LNB box with its feed horn facing the dish, the coax down the arm
  function feedSvg(P) {
    const out = [`<g data-name="arm">`];
    const tips = [90, 210, 330].map((a) => G.pointOf(DF, sOf(R) + 0.05, R - 0.2, rad(a)));
    for (const tp of tips.sort((a, b) => K.depthOf(a, P) - K.depthOf(b, P))) { const d = G.sub3(G.pointOf(DF, F + 1.4, 0, 0), tp); out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, G.len3(d), 0.09, G.frameAlong(tp, d), P, { steps: 8 }), { tone: "mid", crease: "none" }))); }
    out.push(`</g><g data-name="lnb">`);
    const LF = G.frameAlong(FOCUS, G.mul3(AX, -1));
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(-1.9, -0.9, 0.5, LF, P, { steps: 20 }), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.lathe([[-0.9, 0], [-0.9, 0.35], [0, 0.55], [0, 0]], LF, P, { steps: 20 }), { tone: "hi" })));
    out.push(`<path d="${G.circleOf(LF, 0.01, 0.42, P, 20)}" fill="#26292e"/></g>`);
    return out.join("");
  }
  function coaxSvg(P, k) {
    const a = G.pointOf(DF, F + 1.8, 0, 0), b = G.pointOf(DF, F - 0.9, 0, 0), pts = [a, G.add3(a, [0.4, 0.6, -2]), [0.5, 1.1, MZ - 1.6], [0.5, 1.05, 8.6]];
    const d = K.pathOf(pts.map((p) => K.iso(p, P)));
    return `<path d="${d}" fill="none" stroke="#111" stroke-width="${(0.24 * k + 0.4).toFixed(2)}" stroke-linejoin="round"/>`;
  }
  // the signal: parallel rays from the satellite onto the dish and bounced to the focus (or past it when off aim)
  function raysSvg(P, aim, t, k) {
    const out = [], ang = rad(aim * 4), inc = G.unit3(G.add3(G.mul3(AX, Math.cos(ang)), G.mul3(DF.v, Math.sin(ang))));
    const miss = G.add3(FOCUS, G.mul3(DF.v, -F * Math.tan(ang)));
    for (const f of [-0.8, -0.45, 0, 0.45, 0.8]) for (const side of [0, Math.PI / 2]) {
      if (side && f === 0) continue;
      const hit = G.pointOf(DF, sOf(Math.abs(f * R)), f * R, side), from = G.add3(hit, G.mul3(inc, 14));
      const a = K.iso(from, P), b = K.iso(hit, P), c = K.iso(miss, P);
      out.push(`<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}" fill="none" stroke="#e08a1a" stroke-width="1.2" stroke-opacity=".85" stroke-dasharray="${(0.6 * k).toFixed(1)} ${(1.2 * k).toFixed(1)}" stroke-dashoffset="${(-t * 2.4 * k).toFixed(1)}"/>`);
    }
    return out.join("");
  }

  ISO.add({
    name: "satdish", title: "Satellite dish", compare: "satdish 480 270 380",
    about: "A satellite dish: the parabola bounces the satellite's parallel waves to one point, where the LNB picks them up; aim it off and the meter drops.",
    line: "satdish cx cy height aim=0-10 lab=1 lit=dish|lnb|arm|mount|meter",
    demo: { line: "satdish 480 270 400 aim=6", script: [{ set: {}, hold: 2.2 }, { set: { aim: 0, lit: "lnb" }, hold: 3.4 }] },
    make([cx, cy, size = 380], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.45, H = size * 1.02;
      const { P, g } = ISO.frame([...K.boxCorners(PAD, -1.4, 0), G.pointOf(DF, sOf(R), R, 0), G.pointOf(DF, sOf(R), R, Math.PI), G.pointOf(DF, sOf(R), R, Math.PI / 2), G.pointOf(DF, sOf(R), R, -Math.PI / 2), G.add3(VERTEX, G.mul3(AX, 18))], cx, cy, W, H, { azimuth: 40, elevation: 20 }, parent);
      const k = K.cameraOf(P).k;
      g.innerHTML = `<g>${mountSvg(P)}</g><g data-part="meterg"></g><g>${coaxSvg(P, k)}</g><g>${dishSvg(P)}</g><g data-part="rays"></g><g>${feedSvg(P)}</g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { meter: q("meterg"), rays: q("rays"), words: q("words") }, w = ISO.writer();
      const s = { aim: ISO.clamp(ISO.num(o, "aim", 0), 0, 10), want: ISO.clamp(ISO.num(o, "aim", 0), 0, 10), t: 0 };
      let lit = o.lit || "";
      const draw = () => {
        const aq = Math.round(s.aim * 20) / 20, sig = signal(aq);
        w.rebuild(el.meter, String(Math.round(sig * 10)), () => meterSvg(P, sig));
        w.rebuild(el.rays, `${aq} ${(Math.round(s.t * 30) / 30).toFixed(2)}`, () => raysSvg(P, aq, s.t, k));
        w.rebuild(el.words, lab ? `${aq > 0.3} ${Math.round(sig * 100)}` : "", () => !lab ? "" : [
          ISO.word(K.iso(G.add3(VERTEX, G.mul3(AX, 15)), P), "waves from the satellite arrive parallel", "#b5541a", { size: 13, anchor: "end", dy: -4 }),
          ISO.word(K.iso(FOCUS, P), aq > 0.3 ? "bounced waves miss the LNB" : "LNB at the focus", aq > 0.3 ? "#a3271b" : "#2c6a22", { size: 13, anchor: "start", dy: -14 }).replace('x="', 'dx="10" x="'),
          ISO.word(K.iso(G.pointOf(DF, sOf(R), R, Math.PI), P), "parabolic dish", "#444", { size: 13, anchor: "end", dy: 14 }),
          ISO.word(K.iso([0.9, 1.5, 6], P), `signal ${Math.round(sig * 100)} %`, sig > 0.6 ? "#2c6a22" : "#a3271b", { size: 13, anchor: "start", dy: 6 })].join(""));
        w.light(["dish", "lnb", "arm", "mount", "meter"].map(q), [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.aim !== undefined) s.want = ISO.clamp(+p.aim, 0, 10);
        if (p.lit !== undefined) lit = p.lit;
      };
      // the installer nudges the dish round toward the satellite
      g.update = (dt) => {
        s.t += dt;
        s.aim = ISO.follow(s.aim, s.want, dt, 0.5, ISO.still()); if (Math.abs(s.aim - s.want) < 0.01) s.aim = s.want;
        draw();
        return true;
      };
      g.readout = () => `aimed ${s.aim.toFixed(1)}° off the satellite · signal ${Math.round(signal(s.aim) * 100)} % · 1.2 m dish, focus ${(F / 10).toFixed(2)} m in front of it · its beam is only about 1.5° wide, so it must point within a fraction of a degree`;
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
