// "billfold cx cy k open=0..1 notes=0..5 lab=0 lit=wallet|cards|notes|pocket" — a PART (batch 6, money): a folding
// leather wallet lying on a table, its origin the table point under the middle of its lower half (the whole wallet,
// shut). Two 11 × 9 cm halves 1 cm thick joined by a rounded leather spine along x = +5.5. Stitched edges; inside the
// lower half a note pocket with `notes` generic notes (plain numbers and a leaf, no real design) peeking out of its
// back edge; inside the cover three stepped card slots, a card in each (plain colours, no brands). open is the fold:
// 0 shut (the cover lies on the lower half), 1 opened flat (the cover lies
// beside it toward +x, inside up). set({ open }) swings the cover over on its spine; set({ notes }) slides notes in
// or takes them out one at a time. World: 1 = 1 cm. anchors: notes (the notes' peeking edge) cards (the card slots)
(() => {
  const K = window.K, G = window.G;
  const HX = 5.5, HY = 4.5, T = 1, R = 0.6;
  const LEATHER = ISO.tint("#a8714a", ["#5e3a22", "#6e452a", "#7e5233", "#8f603d"], "#2e1a0c");
  const INSIDE = ISO.tint("#c48b5c", ["#7a4d2c", "#8a5935", "#9a663f", "#ad754b"], "#3a2210");
  const CARDS = ["#2f5f9e", "#2f7a5a", "#8c939b"], NOTES = [["green", "10"], ["blue", "20"], ["amber", "5"], ["violet", "50"], ["green", "10"]];
  ISO.add({
    name: "billfold", title: "Wallet (part)", compare: null,
    about: "A folding leather wallet: stitched edges, three card slots with cards, a note pocket with generic notes peeking out; open swings it open to show what you have to spend. anchors: notes cards",
    line: "billfold cx cy k open=0..1 notes=0..5 lab=0 lit=wallet|cards|notes|pocket",
    demo: { line: "billfold 400 320 30 open=0 notes=3 lab=1", script: [{ set: {}, hold: 1 }, { set: { open: 1, lit: "cards" }, hold: "settle" }, { set: { notes: 5, lit: "notes" }, hold: "settle" }, { set: { notes: 1, lit: "pocket" }, hold: "settle" }, { set: { open: 0.5, lit: "" }, hold: "settle" }, { set: { open: 0, notes: 3, lit: "wallet" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { open: B.num(o, "open", 0, 0, 1), notes: Math.round(B.num(o, "notes", 3, 0, 5)), lit: o.lit || "" };
      st.want = st.open; st.nWant = st.notes;
      const v0 = K.depthOf([0, 0, 0], P), view = [K.depthOf([1, 0, 0], P) - v0, K.depthOf([0, 1, 0], P) - v0, K.depthOf([0, 0, 1], P) - v0];
      const plan = { x: -HX, y: -HY, w: 2 * HX, d: 2 * HY, r: R };
      // the lower half: leather slab, its inside stitch line (seen only when open)
      const lower = TE.slab(P, plan, 0, T, "mid", LEATHER, 4, 0.15) + B.stitch(P, [[-HX + 0.5, -HY + 0.4, T + 0.01], [HX - 0.5, -HY + 0.4, T + 0.01]], "#f1dcc0", 0.7) +
        B.stitch(P, [[-HX + 0.6, HY + 0.01, T * 0.5], [HX - 0.6, HY + 0.01, T * 0.5]], "#f1dcc0", 0.7);
      // the pocket: a second layer of leather over the front two thirds, its open top edge at y = -2.2, stitched
      const pocket = TE.slab(P, { x: -HX + 0.35, y: -2.2, w: 2 * HX - 0.7, d: HY + 2.2 - 0.35, r: 0.3 }, T, 0.12, "mid", INSIDE, 3) +
        B.stitch(P, [[-HX + 0.7, -1.9, T + 0.125], [-HX + 0.7, HY - 0.7, T + 0.125], [HX - 0.7, HY - 0.7, T + 0.125], [HX - 0.7, -1.9, T + 0.125]], "#f1dcc0", 0.7);
      // notes: flat sheets slid into the pocket from the back, each peeking out a little more to one side
      const notesSvg = (n) => Array.from({ length: n }, (_, i) => {
        const [c, v] = NOTES[i], x0 = -HX + 0.5 + i * 0.25, y0 = -HY - 1.3 + i * 0.22, z = T + 0.02 + i * 0.015;
        return TE.flat(P, [x0, y0, z], [1, 0, 0], [0, 1, 0], B.note(9.4, 4.8, v, c));
      }).join("");
      // the cover in its own frame: u from the spine (x = HX) outward, w through its thickness (0 = inside face), y
      const coverSvg = (op) => {
        const a = Math.PI * (1 - op), U = [Math.cos(a), 0, Math.sin(a)], W = [-Math.sin(a), 0, Math.cos(a)], H0 = [HX, 0, T];
        const at = (u, w, y) => [H0[0] + U[0] * u + W[0] * w, y, H0[2] + U[2] * u + W[2] * w];
        const inside = W[0] * view[0] + W[2] * view[2] > 0, out = [];
        // the spine: a rounded leather fold where the halves meet, fuller when shut
        const c = 1 - op, sr = 0.5 + 0.5 * c;
        out.push(ISO.tinted(LEATHER, K.solidSvg(G.disc(0, 2 * HY - 0.2, sr, LAB.Y([HX, -HY + 0.1, 0.5 + 0.5 * c]), P), { tone: "mid" })));
        out.push(TE.obox(P, at, [0.05, 2 * HX], [-T, 0], [-HY, HY], "mid", LEATHER));
        if (inside) {
          // three stepped slots, a card's top edge showing above each
          const card = (i) => { const y = -2.9 + i * 1.25; return TE.obox(P, at, [1 + i * 0.12, 9.6 - i * 0.12], [0.02 + i * 0.1, 0.05 + i * 0.1], [y, HY - 0.5], "lo", ISO.tint(CARDS[i], ["#1c2430", CARDS[i], CARDS[i], CARDS[i]], "#14181f")); };
          const slot = (i) => { const y = -2.1 + i * 1.25; return TE.obox(P, at, [0.4, 10.6], [0.06 + i * 0.1, 0.1 + i * 0.1], [y, HY - 0.35], "mid", INSIDE) + B.stitch(P, [at(0.7, 0.105 + i * 0.1, y + 0.3), at(10.3, 0.105 + i * 0.1, y + 0.3)], "#f1dcc0", 0.6); };
          out.push(`<g data-name="cards">${[0, 1, 2].map((i) => card(i) + slot(i)).join("")}</g>`);
          out.push(B.stitch(P, [at(0.45, 0.01, -HY + 0.4), at(2 * HX - 0.4, 0.01, -HY + 0.4), at(2 * HX - 0.4, 0.01, HY - 0.4)], "#f1dcc0", 0.7));
        } else {
          // the outside: stitched round its three free edges, a pressed line inset from them
          const z = -T - 0.01;
          out.push(B.stitch(P, [at(0.5, z, -HY + 0.4), at(2 * HX - 0.4, z, -HY + 0.4), at(2 * HX - 0.4, z, HY - 0.4), at(0.5, z, HY - 0.4)], "#f1dcc0", 0.7));
          out.push(`<path d="${K.pathOf([at(1.3, z, -HY + 1.1), at(2 * HX - 1.1, z, -HY + 1.1), at(2 * HX - 1.1, z, HY - 1.1), at(1.3, z, HY - 1.1)].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#5e3a22" stroke-width="0.7" opacity=".6"/>`);
        }
        return out.join("");
      };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: -HY - 1.3, w: 4 * HX, d: 2 * HY + 1.3, r: R }, 0, 0.02, P)}"/>` +
        `<g data-name="wallet">${lower}</g><g data-name="notes" data-part="notes"></g><g data-name="pocket">${pocket}</g><g data-name="wallet" data-part="cover"></g><g data-part="words"></g>`;
      g.anchors = { notes: [-0.5, -HY - 1, T + 0.1], cards: st.open > 0.5 ? [HX + HX, 0, T + 0.2] : [0, 0, 2 * T] };
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = ISO.word(K.iso([-HX, -HY - 1.5, 2.5], P), "wallet", "#556", { size: 13, anchor: "end" });
      const draw = () => {
        const oq = Math.round(st.open * 60) / 60, n = Math.round(st.notes);
        w.rebuild(el.notes, `${n}`, () => notesSvg(n));
        w.rebuild(el.cover, `${oq}`, () => coverSvg(oq));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.open !== undefined) st.want = ISO.clamp(+p.open, 0, 1);
        if (p.notes !== undefined) st.nWant = Math.round(ISO.clamp(+p.notes, 0, 5));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the cover swings over in about a second, eased; notes go in or come out about three a second
      g.update = (dt) => {
        const calm = ISO.still();
        st.open = ISO.follow(st.open, st.want, dt, 0.22, calm); if (Math.abs(st.open - st.want) < 0.004) st.open = st.want;
        const dn = st.nWant - st.notes; st.notes = calm ? st.nWant : st.notes + Math.sign(dn) * Math.min(Math.abs(dn), dt * 3);
        draw();
        return st.open !== st.want || st.notes !== st.nWant;
      };
      g.readout = () => { const n = st.nWant, sum = NOTES.slice(0, n).reduce((s, [, v]) => s + +v, 0); return `wallet · ${st.want > 0.9 ? "open" : st.want < 0.1 ? "shut" : "half open"} · ${n} note${n === 1 ? "" : "s"} (${sum} in all) · 3 cards`; };
      draw();
      return g;
    },
  });
})();
