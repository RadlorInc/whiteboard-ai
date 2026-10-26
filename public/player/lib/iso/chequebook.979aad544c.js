// "chequebook cx cy k tear=0..1 lab=0 lit=cover|stubs|cheque" — a PART (batch 6, money): a cheque book, 18 × 8 cm and
// 1 cm thick, lying open on a desk, its origin the middle of it on the surface, its long side along x. A card cover,
// a pad of 25 cheques (their page edges show on the sides), each with its stub (counterfoil) on the left: Date, To,
// Amount and the cheque number lines. The top cheque: a plain bank name (THE BANK), a Date line, Pay, the amount in
// words on two lines, a box for the amount in figures, a signature line, the cheque number and placeholder code
// digits along the bottom; a dotted tear perforation between cheque and stub. tear 0 → 1 lifts the top cheque off
// along the perforation and lays it on the desk in front of the book, showing the next cheque under it; its stub stays. No currency signs. 1 = 1 cm.
// anchors: sign (the top cheque's signature line) amount (its figures box) top
(() => {
  const K = window.K;
  const W = 18, D = 8, X0 = -W / 2, Y0 = -D / 2, SW = 4.6, PX = X0 + SW, CW = W - SW, ZC = 0.15, ZT = 0.95;
  const COVER = ISO.tint("#33506f", ["#1d3148", "#233a54", "#2a4460", "#304c69"], "#0f1c2b");
  const INK = "#2b3d4f";
  function chequeArt(B, no) {
    let s = `<rect width="${CW}" height="${D}" fill="#eaf3ec"/>`;
    // fine safety lines across the background, edge to edge
    for (let i = 1; i < 16; i++) s += `<path d="M0 ${(i * 0.5).toFixed(2)}H${CW}" stroke="#d9e8dd" stroke-width="0.05"/>`;
    s += `<rect x="0.25" y="0.25" width="${CW - 0.5}" height="${D - 0.5}" fill="none" stroke="#9bb8a3" stroke-width="0.04"/>`;
    s += B.text(0.6, 1.05, "THE BANK", 0.55, "#2f5a3e", "start", 800) + B.text(0.6, 1.5, "1 Main Street", 0.28, "#5f7a68", "start", 600);
    s += B.text(9.2, 1.1, "Date", 0.3, INK, "start", 700) + B.rule(10.1, 1.15, CW - 0.6, "#5f7a68");
    s += B.text(0.6, 2.75, "Pay", 0.36, INK, "start", 800) + B.rule(1.5, 2.8, CW - 0.6, "#5f7a68");
    s += B.text(0.6, 3.85, "the sum of", 0.28, INK, "start", 700) + B.rule(2.2, 3.9, 9.0, "#5f7a68") + B.rule(0.6, 4.9, 9.0, "#5f7a68");
    s += `<rect x="9.5" y="3.35" width="${(CW - 0.6 - 9.5).toFixed(2)}" height="1.4" rx="0.1" fill="#ffffff" stroke="#5f7a68" stroke-width="0.05"/>`;
    s += B.rule(8.0, 6.2, CW - 0.6, "#5f7a68") + B.text(CW - 0.6, 6.6, "signature", 0.26, "#5f7a68", "end", 600);
    s += B.num(0.6, 7.45, `${no}   00-00-00   00000000`, 0.4, "#3a4652", "start", 700);
    s += B.text(CW - 0.6, 7.45, `No. ${no}`, 0.3, INK, "end", 700);
    return s;
  }
  function stubArt(B, no) {
    let s = `<rect width="${SW}" height="${D}" fill="#f4f7f4"/>`;
    [["Date", 1.6], ["To", 3.0], ["Amount", 4.4]].forEach(([n, y]) => { s += B.text(0.35, y, n, 0.3, INK, "start", 700) + B.rule(0.35, y + 0.55, SW - 0.35, "#8aa08f"); });
    s += B.text(0.35, 7.3, `No. ${no}`, 0.3, INK, "start", 700);
    // the perforation: a row of small holes along the stub's right edge
    for (let y = 0.2; y < D; y += 0.32) s += `<circle cx="${SW - 0.05}" cy="${y.toFixed(2)}" r="0.06" fill="#7d8a80"/>`;
    return s;
  }
  ISO.add({
    name: "chequebook", title: "Cheque book (part)", compare: null,
    about: "A cheque book lying open: card cover, a pad of cheques with stubs (date, to, amount), the top cheque with a plain bank name, pay line, amount in words and figures, signature line and code digits; the top cheque tears off along its perforation. anchors: sign amount top",
    line: "chequebook cx cy k tear=0..1 lab=0 lit=cover|stubs|cheque",
    demo: { line: "chequebook 470 230 32 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "cheque" }, hold: 1.2 }, { set: { lit: "stubs" }, hold: 1.2 }, { set: { tear: 1, lit: "" }, hold: 3 }, { set: { tear: 0, lit: "cover" }, hold: 3 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B42;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { tear: B.val(o, "tear", 0, 0, 1) }; st.want = st.tear;
      // the pad: cover, the stack of pages with their edges, the stubs and the next cheque printed on its top
      const edges = []; for (let z = ZC + 0.06; z < ZT - 0.02; z += 0.07) edges.push(K.pathOf([K.iso([X0 + 0.05, -Y0 + 0.003, z], P), K.iso([-X0 - 0.05, -Y0 + 0.003, z], P), K.iso([-X0 + 0.003, Y0 + 0.05, z], P)]));
      const pad = ISO.tinted(B.PAPER, K.solidSvg(K.slabOf({ x: X0, y: Y0, w: W, d: D, r: 0.05 }, ZC, ZT - ZC, P, 2), { tone: "hi", crease: "none" })) +
        `<path d="${edges.join("")}" stroke="#c2c7cc" stroke-width="0.35" fill="none"/>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: X0 - 0.4, y: Y0 - 0.4, w: W + 0.8, d: D + 0.8, r: 0.4 }, 0, 1, P)}"/>` +
        `<g data-name="cover">${ISO.tinted(COVER, K.solidSvg(K.slabOf({ x: X0 - 0.2, y: Y0 - 0.2, w: W + 0.4, d: D + 0.4, r: 0.25 }, 0, ZC, P, 4), { tone: "mid" }))}</g>` +
        `<g data-name="stubs">${pad}${B.flat(P, [X0, Y0, ZT + 0.002], [1, 0, 0], [0, 1, 0], stubArt(B, "000101"))}</g>` +
        `<g data-name="cheque">${B.flat(P, [PX, Y0, ZT + 0.002], [1, 0, 0], [0, 1, 0], chequeArt(B, "000102"))}<g data-part="top"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), top = chequeArt(B, "000101").replace("<rect ", `<rect stroke="#9bb8a3" stroke-width="0.03" `);
      g.anchors = { sign: [PX + 10.9, Y0 + 6.2, ZT], amount: [PX + 11.2, Y0 + 4.05, ZT], top: [0, 0, ZT] };
      let lit = o.lit || "";
      const draw = () => {
        const e = B.smooth(0, 1, st.tear), r = (14 * e * Math.PI) / 180, lift = 1.4 * Math.sin(Math.PI * Math.min(1, e * 1.4));
        const O = [PX + 3 * e, Y0 + 9.5 * e, (ZT + 0.004) * (1 - e) + 0.012 * e + lift], U = [Math.cos(r), Math.sin(r), 0], V = [-Math.sin(r), Math.cos(r), 0];
        w.rebuild(el.top, e.toFixed(3), () => B.flat(P, O, U, V, top));
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([-X0, Y0, ZT], P), "cheque book", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, lit);
      };
      g.set = (p) => { st.want = B.pick(p, "tear", st.want, 0, 1); if (p.lit !== undefined) lit = p.lit; draw(); };
      g.update = (dt) => {
        const was = st.tear;
        st.tear = ISO.follow(st.tear, st.want, dt, 0.45, ISO.still());
        if (st.tear !== was) draw();
        return st.tear !== st.want;
      };
      g.readout = () => `cheque book · 18 × 8 cm · ${st.want > 0.5 ? "cheque 000101 torn off, its stub kept; 000102 next" : "cheque 000101 on top, stub attached"}`;
      draw();
      return g;
    },
  });
})();
