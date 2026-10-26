// "lockcylinder cx cy k in=0..1 cuts=2,5,3,6,4 lab=0 lit=…" — a PART (b34): key.js's pin-tumbler lock cylinder, cut
// open along the keyway on its bench fixture, at real size; its origin the bench point under the board's middle. A
// wooden board on four feet, two steel brackets and a back plate holding the cylinder: the brass plug and the steel
// housing in section, five pin chambers, each with a key pin, a driver pin and a spring; a cut-depth gauge (depths
// 1 … 6, 0.4 mm apart) on the plug's end and a maker's plate on the board. The key (bow, shoulder, blade with its
// milled groove and five V cuts) slides in along +x as in goes 0 → 1; each cut lifts its key pin. The lock is pinned
// for the first cuts it is given; when the key is fully in and every key-pin top sits on the shear line the line
// turns green (this key turns the plug); cuts= (while the key is out) changes the key, so a wrong cut leaves its pin
// across the line. Anchor `keyway` = the mouth of the keyway on the plug's face. 1 unit = 0.4 mm.
(() => {
  const K = window.K, D = (p, s) => K.dotsSvg(p, s), KY = () => B34.KEY;
  const LD = 18, CT = 58, OUT = 112, ZO = 34, INK = "#3c3f45", BR = ["#b89545", "#f1dd9f"], BRF = "#f6e7bf", BRI = "#6b5114", ST = ["#9a9da3", "#e3e4e7"];
  const BASE = { x: -150, y: -40, w: 280, d: 80, r: 6 }, MID = [-10, 0, -11];
  const stroke = (d, w, c = INK, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const faceOf = (P, pts, fill, w = 0.8, y = 0) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const xcoilZ = (P, x, z0, z1, r, turns) => K.pathOf(Array.from({ length: turns * 2 + 1 }, (_, i) => K.iso([x + (i % 2 ? r : -r) * (i === 0 || i === turns * 2 ? 0 : 1), 0.05, z0 + ((z1 - z0) * i) / (turns * 2)], P)));

  ISO.add({
    name: "lockcylinder", title: "Lock cylinder, cut open (part)", compare: null,
    about: "A pin-tumbler door lock cylinder cut open along the keyway on a bench fixture: the key slides in, each cut lifts its key pin, and with the right key every pin top lands on the shear line, which turns green. anchors: keyway",
    line: "lockcylinder cx cy k in=0..1 cuts=2,5,3,6,4 lab=0 lit=key|pins|springs|plug|housing|shear|gauge|board",
    demo: { line: "lockcylinder 470 330 55 lab=1", script: [{ set: { in: 1 }, hold: "settle" }, { set: { in: 0 }, hold: "settle" }, { set: { cuts: "2,5,1,6,4" }, hold: 1 }, { set: { in: 1, lit: "pins" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pu = { ...P, scale: P.scale / 25 }, lab = o.lab === "1";
      const Pb = B34.shift(Pu, MID), Q = B34.shift(Pb, [0, 0, -ZO]), { PX, SL, KF, KT, hOf } = KY();
      const LKEY = (cuts) => cuts.map((d) => SL - hOf(d));
      // ── the fixture: board, two brackets, back plate; the plug (brass) and housing (steel) in section
      const PLUG = [[0, 0], [110, 0], [110, SL], [0, SL], [0, KT], [100, KT], [100, KF], [0, KF]];
      const HOUSE = [[-4, SL], [114, SL], [114, CT + 6], [-4, CT + 6]];
      const st = [`<g data-name="board">${ISO.tinted(ISO.T.wood, ISO.baseboard(Pb, BASE, { h: 7, feet: 4 }))}${ISO.plate(Pb, { x: -120, y: 14, w: 44, d: 14, r: 1.2 })}</g><g data-name="housing">`];
      for (const x of [-14, 114]) st.push(ISO.tinted(ISO.T.steel, ISO.wbox(Pb, [x, x + 10], [-26, -14], [0, ZO + CT + 6], "mid")), D([K.iso([x + 5, -14, 6], Pb), K.iso([x + 5, -14, ZO + CT], Pb)], { size: 0.8 }));
      st.push(ISO.wbox(Q, [-4, 114], [-14, -12], [0, CT + 6], "mid"), ISO.prismY(Q, HOUSE, -12, 0, ST, "#d5dbe2", INK));
      for (const x of PX) st.push(faceOf(Q, [[x - 3, SL], [x + 3, SL], [x + 3, CT], [x - 3, CT]], "#aab4bf", 0.5));
      st.push(D([[0, CT + 3], [110, CT + 3]].map(([x, z]) => K.iso([x, 0, z], Q)), { size: 0.9 }), `</g><g data-name="plug">${ISO.prismY(Q, PLUG, -12, 0, BR, BRF, BRI)}`);
      for (const x of PX) st.push(faceOf(Q, [[x - 3, KT], [x + 3, KT], [x + 3, SL], [x - 3, SL]], "#a88c4c", 0.5));
      st.push(D([[2, 1.5], [108, 1.5]].map(([x, z]) => K.iso([x, 0, z], Q)), { size: 0.9 }), "</g>");
      const gauge = [1, 2, 3, 4, 5, 6].map((d) => K.pathOf([[104, 0.05, hOf(d)], [109, 0.05, hOf(d)]].map((p) => K.iso(p, Q)))).join("");
      st.push(`<g data-name="gauge">${stroke(gauge, 0.8, BRI)}${stroke(K.pathOf([[109, 0.05, hOf(6)], [109, 0.05, hOf(1)]].map((p) => K.iso(p, Q))), 0.8, BRI)}</g>`);
      const words = !lab ? "" : [
        ISO.word(K.iso([-4, 0, CT + 2], Q), "springs", "#555", { size: 13, anchor: "end" }),
        ISO.word(K.iso([-4, 0, 40], Q), "driver pins", "#555", { size: 13, anchor: "end" }),
        ISO.word(K.iso([114, 0, 18], Q), "depth 1–6", "#6b5114", { size: 13, anchor: "start", dy: 4 }),
        ISO.word(K.iso([-60, 0, -2], Q), "key", "#6b5114", { size: 13, dy: 18 }),
      ].join("");
      g.innerHTML = `<g>${st.join("")}</g><g data-name="key" data-part="key"></g><g data-name="pins" data-part="pins"></g><g data-name="springs" data-part="springs"></g><g data-name="shear" data-part="shear"></g><g data-part="words">${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const U = KY().U, cm = (x, y, z) => [x, y, z].map((v, i) => +((v - MID[i]) * U).toFixed(2));
      g.anchors = { keyway: cm(0, 0, ZO + (KF + KT) / 2) };
      const fit = KY().parse(o.cuts);
      const s = { cuts: fit, x: B34.num(o.in, 0, 0, 1), want: B34.num(o.in, 0, 0, 1), lit: o.lit || "" };
      const memo = new Map();
      const tipsOf = (cuts, dx) => PX.map((x) => { const u = x - dx; return u < 0 || u > KY().TIP ? KF : Math.max(KF, KY().edgeOf(cuts)(u)); });
      const pinsSvg = (cuts, tips) => tips.map((z, i) => {
        const x = PX[i], a = z + LKEY(fit)[i], b = a + LD;
        return faceOf(Q, [[x, z], [x + 2.6, z + 1.6], [x + 2.6, a], [x - 2.6, a], [x - 2.6, z + 1.6]], "#e9c766", 0.7, 0.05) + faceOf(Q, [[x - 2.6, a], [x + 2.6, a], [x + 2.6, b], [x - 2.6, b]], "#d9dce0", 0.7, 0.05);
      }).join("");
      const springsSvg = (tips) => stroke(tips.map((z, i) => xcoilZ(Q, PX[i], z + LKEY(fit)[i] + LD, CT, 2.2, 5)).join(""), 0.9, "#4a5058");
      const aligned = (tips) => tips.map((z, i) => Math.abs(z + LKEY(fit)[i] - SL) < 0.3);
      const draw = () => {
        const q = Math.round(s.x * 160), dx = -OUT * (1 - q / 160), cutKey = s.cuts.join(",");
        if (!memo.has(cutKey)) memo.set(cutKey, KY().edgeSvg(Q, s.cuts));
        w.rebuild(el.key, cutKey, () => `<g>${memo.get(cutKey)}</g>`);
        w.attr(el.key.firstChild, "transform", K.translateAlong(Q, [dx, 0, 0]));
        const tips = tipsOf(s.cuts, dx), ok = q === 160 && aligned(tips).every(Boolean);
        w.rebuild(el.pins, `${q} ${cutKey}`, () => pinsSvg(s.cuts, tips));
        w.rebuild(el.springs, `${q} ${cutKey}`, () => springsSvg(tips));
        w.rebuild(el.shear, ok ? "ok" : "no", () => stroke(K.pathOf([[-4, 0.1, SL], [114, 0.1, SL]].map((p) => K.iso(p, Q))), 1.6, ok ? "#1f9d4a" : "#d0392b", ` stroke-dasharray="5 3" data-free=""`) +
          (lab ? ISO.word(K.iso([114, 0, SL], Q), ok ? "shear line: clear" : "shear line", ok ? "#1f9d4a" : "#c0392b", { size: 13, anchor: "start", dy: 5 }) : ""));
        B34.light(w, g, s.lit);
      };
      g.set = (p) => {
        if (p.in !== undefined) s.want = B34.num(p.in, s.want, 0, 1);
        if (p.cuts !== undefined && s.x === 0) s.cuts = KY().parse(p.cuts);
        if (p.lit !== undefined) s.lit = p.lit;
        draw();
      };
      // slid at an even hand speed, slowing into the stop
      g.update = (dt) => {
        const d = s.want - s.x;
        s.x = ISO.still() || Math.abs(d) < 0.002 ? s.want : s.x + Math.sign(d) * Math.min(Math.abs(d), dt * (0.15 + Math.abs(d) * 0.9));
        draw();
        return s.x !== s.want;
      };
      g.readout = () => {
        const tips = tipsOf(s.cuts, -OUT * (1 - s.x)), on = aligned(tips).filter(Boolean).length;
        const wrong = s.cuts.map((d, i) => (d !== fit[i] ? i + 1 : 0)).filter(Boolean);
        return `key cuts ${s.cuts.join(" ")} (depth 1 shallow … 6 deep, 0.4 mm steps) · lock pinned for ${fit.join(" ")} · key ${(s.x * 100).toFixed(0)}% in · ${on} of 5 pin tops on the shear line` +
          (s.x === 1 ? (on === 5 ? " · the plug can turn" : ` · pin ${wrong.join(", ")} sits across the line: the plug can't turn`) : "");
      };
      draw();
      return g;
    },
  });
})();
