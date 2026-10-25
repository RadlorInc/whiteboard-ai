// "conicalflask cx cy k ml=100|250|500 fill=0..1 c=blue|pink|… bung=0|1 lab=0 lit=glass|liquid|bung" — a PART (PARTS.md): a
// borosilicate narrow-neck Erlenmeyer flask standing on the bench, origin the bench point under its middle. Real sizes
// (outer base diameter × height, neck): 100 mL 64 × 105, neck 24; 250 mL 85 × 140, neck 34; 500 mL 105 × 180, neck
// 34 mm. Flat base with a rounded heel, a straight cone, a beaded neck; approximate marks printed on the cone and a
// white marking patch. fill is the fraction of the body (below the neck) that is full; the volume is integrated from
// the glass's own profile. bung=1 puts a rubber stopper in the neck. Built in mm; anchors in cm.
// set({ fill, c, bung }).
(() => {
  const K = window.K, G = window.G;
  // ml: [base diameter, height, neck outer diameter, neck length]
  const SIZES = { 100: [64, 105, 24, 26], 250: [85, 140, 34, 32], 500: [105, 180, 34, 38] };
  const BASE = 2;
  // the meridian (as flask.js's 250 mL cone, sized): heel, cone to the shoulder, neck, beaded lip
  const profile = (R, H, rn, nl) => {
    const hc = H - nl - 10;
    return [[0, R - 3.6], [0.8, R - 1.6, 1], [2.6, R - 0.2, 1], [5, R, 1], [8, R - 1.2], [hc, rn + 2.9, 1], [hc + 6, rn + 0.6, 1], [hc + 10, rn],
      [H - 5.5, rn], [H - 4.5, rn + 1.4, 1], [H - 2, rn + 1.7, 1], [H, rn + 0.8]];
  };

  ISO.add({
    name: "conicalflask", title: "Conical flask (part)", compare: null,
    about: "A glass conical (Erlenmeyer) flask, 100 to 500 mL at real size, holding a coloured liquid, with a rubber bung when bung=1; a bench part. anchors: neck inside",
    line: "conicalflask cx cy k ml=100|250|500 fill=0..1 c=blue|pink|… bung=0|1 lab=0 lit=glass|liquid|bung",
    demo: { line: "conicalflask 480 440 20 ml=250 fill=0.25 c=colourless", script: [{ set: { c: "pink", fill: 0.5 }, hold: "settle" }, { set: { lit: "liquid" }, hold: 1.5 }, { set: { bung: 1, lit: "bung" }, hold: 1.5 }, { set: { lit: "glass" }, hold: 1.5 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const LAB = window.LAB, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const ml = SIZES[o.ml] ? +o.ml : 250, [D, H, dn, nl] = SIZES[ml], R = D / 2, rn = dn / 2, hc = H - nl - 10;
      const V = LAB.vessel(Pm, [0, 0, 0], profile(R, H, rn, nl), { base: BASE, wall: 1.4 });
      const st = { f: ISO.clamp(ISO.num(o, "fill", 0.4), 0, 1), c0: o.c || "blue", c1: o.c || "blue", mixT: 1, bung: o.bung === "1" }, want = { f: st.f };
      let lit = o.lit || "";
      const levelZ = () => BASE + (hc - BASE) * st.f;
      // marks every fifth of the nominal volume (approximate, as the real flask's), numbered, on a rule up the cone
      const marks = () => {
        const mls = [1, 2, 3, 4].map((i) => (ml * i) / 5), ss = mls.map((m) => V.levelFor(m)), face = V.facing - 0.45, rule = [], ticks = [], out = [];
        for (let i = 0; i <= 40; i++) { const s = ss[0] + ((ss[3] - ss[0]) * i) / 40; rule.push(K.iso(G.pointOf(V.F, s, V.rAt(s) + 0.15, face), Pm)); }
        ss.forEach((s) => ticks.push(K.pathOf([0, 0.5, 1].map((q) => K.iso(G.pointOf(V.F, s, V.rAt(s) + 0.15, face - (q * R * 0.13) / V.rAt(s)), Pm)))));
        out.push(L(K.pathOf(rule), { tone: "mid" }), L(ticks.join(""), { tone: "mid", free: "end" }));
        mls.forEach((m, i) => out.push(LAB.faceText(Pm, G.pointOf(V.F, ss[i] - R * 0.03, V.rAt(ss[i]) + 0.3, face - (R * 0.24) / V.rAt(ss[i])), G.mul3(G.tangentOf(V.F, face), -1), String(m), R * 0.08)));
        return out.join("");
      };
      // the marking patch on the cone, with the nominal volume
      const patch = () => {
        const s0 = H * 0.12, s1 = H * 0.12 + Math.min(22, H * 0.18), mid = V.facing + 0.35, half = 13 / R, pts = [];
        for (let i = 0; i <= 8; i++) pts.push(K.iso(G.pointOf(V.F, s0, V.rAt(s0) + 0.2, mid - half + (2 * half * i) / 8), Pm));
        for (let i = 8; i >= 0; i--) pts.push(K.iso(G.pointOf(V.F, s1, V.rAt(s1) + 0.2, mid - half + (2 * half * i) / 8), Pm));
        return `<path d="${K.pathOf(pts, true)}" fill="#ffffff" fill-opacity=".92" stroke="${LAB.GLASS}" stroke-width="0.5"/>` +
          LAB.faceText(Pm, G.pointOf(V.F, s0 + (s1 - s0) * 0.32, V.rAt((s0 + s1) / 2) + 0.4, mid), G.mul3(G.tangentOf(V.F, mid), -1), `${ml} mL`, (s1 - s0) * 0.27);
      };
      // a No. rubber stopper: a tapered plug in the neck, its top above the lip, a moulded ring on its top face
      const rIn = rn - 1.4, BH = Math.round(rIn * 1.6), bz = H - BH * 0.55;
      // drawn twice: the whole plug before the front glass (the neck's glass over its lower part), then the part above
      // the lip again after it (in front of the rim's back arc)
      const r0 = rIn * 0.95, r1 = rIn * 1.16, rLip = r0 + ((r1 - r0) * (H - bz)) / BH;
      const plug = (s0, r) => ISO.tinted(ISO.T.rubber, LAB.S(G.solidOf([[s0, r], [BH, r1]], LAB.Z([0, 0, bz]), Pm), { tone: "hi" }));
      const bungSvg = (front) => (front ? plug(H - bz, rLip) + `<path d="${G.circleOf(LAB.Z([0, 0, 0]), bz + BH + 0.05, rIn * 0.6, Pm)}" fill="none" stroke="#121214" stroke-width="0.6" opacity=".6"/>` : plug(0, r0));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -R, y: -R, w: D, d: D, r: R }, 0, 4, Pm)}"/>` +
        `<g data-name="glass">${V.back()}</g><g data-name="liquid" data-part="liquid"></g><g data-name="bung" data-part="bung"></g>` +
        `<g data-name="glass">${V.front()}${patch()}${marks()}</g><g data-name="bung" data-part="bungtop"></g><g data-part="words"></g>`;
      g.anchors = { neck: [0, 0, H / 10], inside: [0, 0, BASE / 10] };
      const el = LAB.parts(g), w = ISO.writer();
      const colour = () => LAB.blend(st.c0, st.c1, Math.round(ISO.ease(st.mixT) * 10) / 10);
      const draw = () => {
        const z = levelZ(), c = colour();
        w.rebuild(el.liquid, `${z.toFixed(2)} ${c}`, () => V.liquid(z, c));
        w.rebuild(el.bung, String(st.bung), () => (st.bung ? bungSvg(false) : ""));
        w.rebuild(el.bungtop, String(st.bung), () => (st.bung ? bungSvg(true) : ""));
        if (lab) w.rebuild(el.words, `${Math.round(V.vol(z))} ${st.c1}`, () => LAB.word(Pm, lab, [0, 0, H + (st.bung ? 22 : 12)], "conical flask", "#556") + LAB.word(Pm, lab, V.at(Math.max(z, 8), -1.3, 6), `${Math.round(V.vol(z))} mL`, LAB.ink(st.c1), { anchor: "start", size: 14 }));
        LAB.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.fill !== undefined) want.f = ISO.clamp(+p.fill, 0, 1);
        if (p.c && p.c !== st.c1) { st.c0 = colour(); st.c1 = p.c; st.mixT = 0; }
        if (p.bung !== undefined) st.bung = String(p.bung) === "1";
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.f = ISO.follow(st.f, want.f, dt, 0.45, calm);
        st.mixT = calm ? 1 : Math.min(1, st.mixT + dt / 1.1);
        draw();
        return st.f !== want.f || st.mixT < 1;
      };
      g.readout = () => `${ml} mL conical flask (${D} × ${H} mm) · ${Math.round(V.vol(levelZ()))} mL of ${st.c1} liquid${st.bung ? " · stoppered" : ""}`;
      draw();
      return g;
    },
  });
})();
