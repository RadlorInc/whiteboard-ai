// "key cx cy length rot=deg in=0..1 cuts=2,5,3,6,4 lab=1 lit=key|pins|plug|shear" — a brass door key and the lock
// cylinder it fits, cut open along the keyway on a bench fixture. The key's bitting is five V cuts, each to one of six
// depths (1 shallow … 6 deep, 0.4 mm apart). Above each cut a key pin of the matching length rides the key; when the
// key is fully in, the top of every key pin sits exactly on the shear line between plug and housing and the line turns
// green: this key would turn the plug. cuts= changes the key, so a wrong cut leaves its pin across the line.
// in=0..1 slides the key in. 1 unit = 0.25 mm.
(() => {
  const K = window.K, D = (p, s) => K.dotsSvg(p, s);
  const PX = [14, 31, 48, 65, 82], SL = 30, KF = 3, KT = 24, LD = 18, CT = 58, TIP = 96, OUT = 112, ZO = 34;
  const INK = "#3c3f45", BR = ["#b89545", "#f1dd9f"], BRF = "#f6e7bf", BRI = "#6b5114", ST = ["#9a9da3", "#e3e4e7"];
  const hOf = (d) => 22 - 1.6 * d;                                  // cut depth number → height of the cut's floor
  const parseCuts = (v) => { const c = String(v || "").split(",").map(Number).filter((n) => n >= 1 && n <= 6); return c.length === 5 ? c : [2, 5, 3, 6, 4]; };
  const LKEY = (cuts) => cuts.map((d) => SL - hOf(d));             // each pin is cut to the key it belongs to
  // the bitting: the key's top edge at x along the blade (shoulder at 0): V cuts at 100°, flat tops, a ramped tip
  const edgeOf = (cuts) => (x) => Math.min(22, ...cuts.map((d, i) => hOf(d) + Math.abs(x - PX[i]) * 1.2), 22 - Math.max(0, x - (TIP - 10)) * 1.1);
  const stroke = (d, w, c = INK, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const faceOf = (P, pts, fill, w = 0.8, y = 0) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const xcoilZ = (P, x, z0, z1, r, turns) => K.pathOf(Array.from({ length: turns * 2 + 1 }, (_, i) => K.iso([x + (i % 2 ? r : -r) * (i === 0 || i === turns * 2 ? 0 : 1), 0.05, z0 + ((z1 - z0) * i) / (turns * 2)], P)));

  ISO.add({
    name: "key", title: "Key and pins", compare: "key 480 260 400",
    about: "A door key slides into a lock cylinder cut open: each cut lifts its key pin, and with the right key every pin top lands on the shear line.",
    line: "key cx cy length rot=deg in=0..1 cuts=2,5,3,6,4 lab=1 lit=key|pins|plug|shear",
    demo: { line: "key 480 270 440", script: [{ set: { in: 1 }, hold: "settle" }, { set: { in: 0 }, hold: "settle" }, { set: { cuts: "2,5,1,6,4" }, hold: 1 }, { set: { in: 1 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.7, H = size * 0.82;
      const BASE = { x: -150, y: -34, w: 280, d: 62, r: 6 };
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -11, 0), [-150, 0, ZO + 40], [120, -12, ZO + CT + 10], [-150, 0, ZO - 12]], cx, cy, W, H, { azimuth: 74, elevation: 18, pad: 6 }, parent);
      if (o.rot) g.setAttribute("transform", `${g.getAttribute("transform")} rotate(${+o.rot || 0} ${W / 2} ${H / 2})`);
      const Q = { ...P, origin: K.iso([0, 0, ZO], P) }, k = K.cameraOf(P).k;

      // ── the fixture: board, two brackets, back plate; the plug (brass) and housing (steel) in section
      const PLUG = [[0, 0], [110, 0], [110, SL], [0, SL], [0, KT], [100, KT], [100, KF], [0, KF]];
      const HOUSE = [[-4, SL], [114, SL], [114, CT + 6], [-4, CT + 6]];
      const st = [ISO.tinted(ISO.T.wood, ISO.baseboard(P, BASE, { h: 7, feet: 4 }))];
      for (const x of [-14, 114]) st.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x, x + 10], [-26, -14], [0, ZO + CT + 6], "mid")), D([K.iso([x + 5, -14, 6], P), K.iso([x + 5, -14, ZO + CT], P)], { size: 0.8 }));
      st.push(ISO.wbox(Q, [-4, 114], [-14, -12], [0, CT + 6], "mid"));
      st.push(ISO.prismY(Q, PLUG, -12, 0, BR, BRF, BRI), ISO.prismY(Q, HOUSE, -12, 0, ST, "#d5dbe2", INK));
      // pin holes in the plug above the keyway, chambers in the housing
      for (const x of PX) st.push(faceOf(Q, [[x - 3, KT], [x + 3, KT], [x + 3, SL], [x - 3, SL]], "#a88c4c", 0.5), faceOf(Q, [[x - 3, SL], [x + 3, SL], [x + 3, CT], [x - 3, CT]], "#aab4bf", 0.5));
      // a depth gauge on the plug's far end: the floor height of cut depths 1 to 6
      const gauge = [1, 2, 3, 4, 5, 6].map((d) => K.pathOf([[104, 0.05, hOf(d)], [109, 0.05, hOf(d)]].map((p) => K.iso(p, Q)))).join("");
      st.push(stroke(gauge, 0.8, BRI), stroke(K.pathOf([[109, 0.05, hOf(6)], [109, 0.05, hOf(1)]].map((p) => K.iso(p, Q))), 0.8, BRI));
      st.push(D([[2, 1.5], [108, 1.5], [0, CT + 3], [110, CT + 3]].map(([x, z]) => K.iso([x, 0, z], Q)), { size: 0.9 }));
      st.push(ISO.plate(P, { x: -120, y: 8, w: 44, d: 12, r: 1.2 }));
      const back = st.join("");

      // ── the key: blade with its bitting and milled groove, the shoulder, a round bow with a hole
      const memo = new Map(), node = (svg) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = svg; return e; };
      const keySvg = (cuts) => {
        const e = edgeOf(cuts), top = Array.from({ length: TIP + 1 }, (_, x) => [x, e(x)]);
        const blade = ISO.prismY(Q, [[-3, KF + 2], [TIP - 4, KF + 2], [TIP, KF + 8], ...top.reverse(), [-3, 22]], -1.6, 1.6, BR, BRF, BRI,
          stroke(K.pathOf([[0, 1.6, 10], [TIP - 10, 1.6, 10]].map((p) => K.iso(p, Q))), 0.8, BRI) + stroke(K.pathOf([[0, 1.6, 12.4], [TIP - 12, 1.6, 12.4]].map((p) => K.iso(p, Q))), 0.6, "#c9a85a"));
        const bow = ISO.prismY(Q, ISO.hullOf([[-3, 0], [-3, 27], [-10, 30], [-10, -3], ...ISO.arc(-30, 13, 20, 0, Math.PI * 2, 28)]), -2.2, 2.2, BR, BRF, BRI,
          faceOf(Q, ISO.arc(-38, 13, 5, 0, Math.PI * 2, 20), "#fdfdfb", 0.9, 2.2) + stroke(K.pathOf([[-12, 2.2, 0], [-12, 2.2, 26]].map((p) => K.iso(p, Q))), 0.7, BRI));
        return bow + blade + (lab ? ISO.word(K.iso([-30, 0, -8], Q), "key", "#6b5114", { size: 14, dy: 16 }) : "");
      };
      const tipsOf = (cuts, dx) => PX.map((x) => { const u = x - dx; return u < 0 || u > TIP ? KF : Math.max(KF, edgeOf(cuts)(u)); });
      const pinsSvg = (cuts, tips, fit) => tips.map((z, i) => {
        const x = PX[i], a = z + LKEY(fit)[i], b = a + LD;
        return faceOf(Q, [[x, z], [x + 2.6, z + 1.6], [x + 2.6, a], [x - 2.6, a], [x - 2.6, z + 1.6]], "#e9c766", 0.7, 0.05) +
          faceOf(Q, [[x - 2.6, a], [x + 2.6, a], [x + 2.6, b], [x - 2.6, b]], "#d9dce0", 0.7, 0.05) + stroke(xcoilZ(Q, x, b, CT, 2.2, 5), 0.9, "#4a5058");
      }).join("");
      const words = !lab ? "" : [
        ISO.word(K.iso([-4, 0, CT + 2], Q), "springs", "#555", { size: 14, anchor: "end" }),
        ISO.word(K.iso([-4, 0, 40], Q), "driver pins", "#555", { size: 14, anchor: "end" }),
        ISO.word(K.iso([114, 0, 18], Q), "depth 1–6", "#6b5114", { size: 13, anchor: "start", dy: 4 }),
      ].join("");
      g.innerHTML = `<g>${back}</g><g data-name="key"><g data-part="key"></g></g><g data-name="pins"><g data-part="pins"></g></g><g data-name="shear"><g data-part="shear"></g></g><g data-part="words">${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), lights = [...g.querySelectorAll("[data-name]")];
      const fit = parseCuts(o.cuts);                                      // the lock is pinned for the first key it's given
      const s = { cuts: fit, x: ISO.clamp(ISO.num(o, "in", 0), 0, 1), want: ISO.clamp(ISO.num(o, "in", 0), 0, 1) };
      let lit = o.lit || "";
      const aligned = (tips) => tips.map((z, i) => Math.abs(z + LKEY(fit)[i] - SL) < 0.3);
      const draw = () => {
        const q = Math.round(s.x * 160), dx = -OUT * (1 - q / 160), cutKey = s.cuts.join(",");
        if (!memo.has(cutKey)) memo.set(cutKey, node(keySvg(s.cuts)));
        if (el.key._key !== cutKey) { el.key._key = cutKey; el.key.replaceChildren(memo.get(cutKey)); el.key.parentNode._fresh = true; }
        w.attr(el.key, "transform", K.translateAlong(Q, [dx, 0, 0]));
        const tips = tipsOf(s.cuts, dx), ok = q === 160 && aligned(tips).every(Boolean);
        w.rebuild(el.pins, `${q} ${cutKey}`, () => pinsSvg(s.cuts, tips, fit));
        w.rebuild(el.shear, ok ? "ok" : "no", () => stroke(K.pathOf([[-4, 0.1, SL], [114, 0.1, SL]].map((p) => K.iso(p, Q))), 1.6, ok ? "#1f9d4a" : "#d0392b", ` stroke-dasharray="5 3"`) +
          (lab ? ISO.word(K.iso([114, 0, SL], Q), ok ? "shear line: clear" : "shear line", ok ? "#1f9d4a" : "#c0392b", { size: 14, anchor: "start", dy: 5 }) : ""));
        w.light(lights, lights.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.in !== undefined) s.want = ISO.clamp(+p.in, 0, 1);
        if (p.cuts !== undefined && s.x === 0) s.cuts = parseCuts(p.cuts);
        if (p.lit !== undefined) lit = p.lit;
      };
      // slid at an even hand speed, slowing into the stop
      g.update = (dt) => {
        const d = s.want - s.x;
        s.x = ISO.still() || Math.abs(d) < 0.002 ? s.want : s.x + Math.sign(d) * Math.min(Math.abs(d), dt * (0.15 + Math.abs(d) * 0.9));
        draw();
        return s.x !== s.want;
      };
      g.readout = () => {
        const dx = -OUT * (1 - s.x), tips = tipsOf(s.cuts, dx), on = aligned(tips).filter(Boolean).length;
        const wrong = s.cuts.map((d, i) => (d !== fit[i] ? i + 1 : 0)).filter(Boolean);
        return `key cuts ${s.cuts.join(" ")} (depth 1 shallow … 6 deep, 0.4 mm steps) · lock pinned for ${fit.join(" ")} · key ${(s.x * 100).toFixed(0)}% in · ${on} of 5 pin tops on the shear line` +
          (s.x === 1 ? (on === 5 ? " · the plug can turn" : ` · pin ${wrong.join(", ")} sits across the line: the plug can't turn`) : "");
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
