// "contract cx cy k turn=0..1 signed=0..1 lab=0 lit=page1|page2|staples|seal|signature" — a PART (batch 6, money):
// a two-page agreement on A4 (21 × 29.7 cm) lying flat on a desk, its origin the middle of the pages on the surface,
// the top of the pages toward the wall (−y). Page 1: the title AGREEMENT, the two parties, numbered clauses 1–4 as
// lines of print, "page 1 of 2". Page 2 under it: clauses 5–6, two signature lines (PARTY A, PARTY B) with their
// dates, and an embossed seal: a raised paper circle with a toothed rim and a ring of dots (no wax, no crest). Two
// staples down the left edge hold the pages; the paper's edge shows its thickness. turn 0 → 1 lifts page 1 over its
// stapled left edge like a book page and lays it on the desk to the left, its blank back up; signed 0 → 1 writes
// Party A's signature, then Party B's, in blue ink. For a loan, an insurance policy or a share purchase. 1 = 1 cm.
// anchors: sign (Party A's signature line) seal (the seal's middle) staple
(() => {
  const K = window.K, G = window.G;
  const W = 21, D = 29.7, T = 0.012, X0 = -W / 2, Y0 = -D / 2;
  const INK = "#2b3440", GREY = "#9aa1a9";
  function page1(B) {
    let s = `<rect width="${W}" height="${D}" fill="#ffffff"/>`;
    s += B.text(W / 2, 3.2, "AGREEMENT", 1.05, INK, "middle", 800, "Georgia,'Times New Roman',serif");
    s += B.rule(4, 3.8, W - 4, "#55606b", 0.05);
    s += B.text(W / 2, 5.1, "between PARTY A and PARTY B", 0.48, "#55606b", "middle", 600);
    [7, 11.6, 16.2, 20.8].forEach((y, i) => { s += B.text(2.2, y + 0.2, `${i + 1}.`, 0.55, INK, "start", 800) + B.bars(3.4, y, W - 5.6, i === 2 ? 6 : 5, 0.62, 0.2, GREY, i + 1); });
    s += B.text(W / 2, D - 1.4, "page 1 of 2", 0.4, "#7d848c", "middle", 600);
    return s;
  }
  function page2(B) {
    let s = `<rect width="${W}" height="${D}" fill="#fbfbfa"/>`;
    [2.4, 6.6].forEach((y, i) => { s += B.text(2.2, y + 0.2, `${i + 5}.`, 0.55, INK, "start", 800) + B.bars(3.4, y, W - 5.6, 5, 0.62, 0.2, GREY, i + 5); });
    s += B.text(2.2, 11.6, "SIGNED by the parties", 0.5, INK, "start", 800);
    // two signature blocks: the line, the name under it, a date line
    [[2.2, "PARTY A"], [11.6, "PARTY B"]].forEach(([x]) => { s += B.rule(x, 15, x + 7.4) + B.rule(x, 17.4, x + 4.6); });
    [[2.2, "PARTY A"], [11.6, "PARTY B"]].forEach(([x, n]) => { s += B.text(x, 15.6, n, 0.42, "#55606b", "start", 700) + B.text(x, 18, "date", 0.36, "#7d848c", "start", 600); });
    s += `<g data-name="signature">${B.signature(2.5, 14.85, 6.6, "#1f3f8f", 1)}${B.signature(11.9, 14.85, 6.2, "#1f3f8f", 2)}</g>`;
    // the embossed seal: raised circle, a toothed rim, a ring of dots, a plain star; light from the top-left
    const cx = W / 2, cy = 23.6, r = 2.6, teeth = [];
    for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, rr = i % 2 ? r : r * 0.93; teeth.push(`${(cx + Math.cos(a) * rr).toFixed(3)} ${(cy + Math.sin(a) * rr).toFixed(3)}`); }
    const star = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, rr = i % 2 ? 0.42 : 1.0; star.push(`${(cx + Math.cos(a) * rr).toFixed(3)} ${(cy + Math.sin(a) * rr).toFixed(3)}`); }
    const dots = Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return `<circle cx="${(cx + Math.cos(a) * r * 0.72).toFixed(3)}" cy="${(cy + Math.sin(a) * r * 0.72).toFixed(3)}" r="0.07" fill="#c9ced4"/>`; }).join("");
    s += `<g data-name="seal"><path d="M${teeth.join("L")}Z" transform="translate(0.09 0.09)" fill="#cfd4da"/><path d="M${teeth.join("L")}Z" fill="#f4f5f6" stroke="#b9bfc6" stroke-width="0.04"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${(r * 0.84).toFixed(3)}" fill="none" stroke="#c3c8ce" stroke-width="0.05"/>${dots}<circle cx="${cx}" cy="${cy}" r="${(r * 0.6).toFixed(3)}" fill="none" stroke="#ffffff" stroke-width="0.08" transform="translate(-0.05 -0.05)"/>` +
      `<path d="M${star.join("L")}Z" fill="#e6e9ec" stroke="#b9bfc6" stroke-width="0.04"/></g>`;
    s += B.text(W / 2, D - 1.4, "page 2 of 2", 0.4, "#7d848c", "middle", 600);
    return s;
  }
  ISO.add({
    name: "contract", title: "Contract (part)", compare: null,
    about: "A two-page signed agreement on A4 lying on a desk: numbered clauses, signature lines for Party A and Party B with dates, an embossed paper seal, two staples; page 1 turns over to show page 2, and the parties sign. anchors: sign seal staple",
    line: "contract cx cy k turn=0..1 signed=0..1 lab=0 lit=page1|page2|staples|seal|signature",
    demo: { line: "contract 590 290 15 lab=1", script: [{ set: {}, hold: 1.2 }, { set: { lit: "page1" }, hold: 1.2 }, { set: { turn: 1, lit: "" }, hold: 3 }, { set: { signed: 1, lit: "signature" }, hold: 3 }, { set: { lit: "seal" }, hold: 1.4 }, { set: { turn: 0, lit: "staples" }, hold: 3 }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const B = window.B42;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { turn: B.val(o, "turn", 0, 0, 1), signed: B.val(o, "signed", 0, 0, 1) };
      st.wt = st.turn; st.ws = st.signed;
      const view = G.viewOf(P), hinge = [X0, Y0, T * 2 + 0.002];
      const halo = { x: X0 - 0.6, y: Y0 - 0.6, w: W + 1.2, d: D + 1.2, r: 0.4 };
      // the staples: a steel wire bridge on top, its two legs into the paper
      const staple = (y) => ISO.tinted(ISO.T.steel, ISO.wbox(P, [X0 + 0.9, X0 + 1.0], [y - 0.6, y + 0.6], [T * 2, T * 2 + 0.05], "hi"));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, 0, 0.05, P)}"/>` +
        `<g data-name="page2">${B.sheet(P, X0, Y0, W, D, 0, T, page2(B))}</g>` +
        `<g data-name="page1"><g data-part="page"></g></g><g data-name="staples"><g data-part="staples"></g></g><g data-part="words"></g>`;
      const el = LAB.parts(g), w = ISO.writer(), sigs = [...g.querySelectorAll('[data-name="signature"] [data-sig]')];
      const front = page1(B), back = `<rect width="${W}" height="${D}" fill="#f1f2f3"/>` + B.bars(3.4, 7, W - 5.6, 5, 0.62, 0.2, "#eceef0", 3);
      g.anchors = { sign: [X0 + 2.2 + 3.7, Y0 + 15, T], seal: [0, Y0 + 23.6, T], staple: [X0 + 0.95, Y0 + 3, T * 2] };
      let lit = o.lit || "";
      const draw = () => {
        // page 1 turns about its stapled left edge: U runs across the page from the hinge
        const a = Math.PI * B.smooth(0, 1, st.turn), U = [Math.cos(a), 0, Math.sin(a) + (a > 0.001 ? 0.0004 : 0)], V = [0, 1, 0];
        const n = [-Math.sin(a), 0, Math.cos(a)], faceUp = G.dot3(n, view) > 0, key = a.toFixed(3);
        w.rebuild(el.page, key, () => a < 0.001 ? B.sheet(P, X0, Y0, W, D, T, T, front) :
          B.flat(P, hinge, U, V, (faceUp ? front : back).replace("<rect ", `<rect stroke="#9aa1a9" stroke-width="0.04" `)));
        // the staples sit on top while page 1 is down; once it lifts their legs show in page 2's edge only
        w.rebuild(el.staples, a < 1.4 ? "on" : "off", () => (a < 1.4 ? staple(Y0 + 3) + staple(Y0 + D - 3) : ""));
        sigs.forEach((s, i) => B.sign(w, s, ISO.clamp(st.signed * 2 - i, 0, 1)));
        if (lab) w.rebuild(el.words, "1", () => ISO.word(K.iso([W / 2, -D / 2, 0.1], P), "contract", "#556", { size: 13, anchor: "start" }));
        B.light(w, g, lit);
      };
      g.set = (p) => {
        st.wt = B.pick(p, "turn", st.wt, 0, 1); st.ws = B.pick(p, "signed", st.ws, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        const calm = ISO.still(), was = st.turn + st.signed;
        st.turn = ISO.follow(st.turn, st.wt, dt, 0.45, calm);
        st.signed = Math.abs(st.ws - st.signed) < 0.004 || calm ? st.ws : st.signed + Math.sign(st.ws - st.signed) * Math.min(Math.abs(st.ws - st.signed), dt * 0.6);
        if (st.turn + st.signed !== was) draw();
        return st.turn !== st.wt || st.signed !== st.ws;
      };
      g.readout = () => `two-page agreement · ${st.wt > 0.5 ? "page 2 open: signatures and seal" : "page 1: clauses 1 to 4"} · ${st.ws >= 1 ? "signed by both parties" : st.ws > 0.5 ? "signed by Party A" : "not signed yet"}`;
      draw();
      return g;
    },
  });
})();
