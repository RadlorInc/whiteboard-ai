// "hangingframe cx cy k lab=0 lit=frame|feet|hooks" — a PART (PARTS.md, batch 5): the wooden gallows frame of
// static.js (k=balloon) that two rubbed balloons hang from on threads. A 4 × 4 cm pine post stands on a cross foot at
// the −x end, a 50 cm beam runs across its top with a diagonal brace, a base bar joins the post's foot to a second
// cross foot at the +x end; a steel L plate screws the top joint, rubber pads under the feet and two brass cup hooks
// under the beam, 14 cm apart, take the threads. 50 × 4 × 60 cm; origin the floor (bench) point under its middle.
// Static. anchors: hook1 hook2 (the inside of each hook's bend, where a thread's loop sits) top. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HX = 25, PX = [-24, -20], FT = 3, BEAM = [56, 60], HOOKS = [3, 17], HD = 2.6;
  const PINE = ISO.tint("#f6e6c9", ["#d2a96f", "#ddb985", "#e6c89c", "#eed6b1"], "#74521f");
  // a cross foot: a bar along y with its ends chamfered (seen end-on from +x)
  const foot = (P, x0, x1) => ISO.prismX(P, [[-10, 0], [10, 0], [10, 1.6], [8.6, FT], [-8.6, FT], [-10, 1.6]], x0, x1, ["#d2a96f", "#eed6b1"], "#f6e6c9", "#74521f");
  // grain on a face: lines from end to end of the piece (they end on its edges)
  const grain = (P, pts) => L(pts.map(([a, b]) => K.segment(a, b, P)).join(""), { tone: "faint", free: true });
  // a steel L plate on the near face (y = 2) across the post–beam joint, three screw heads
  function cornerPlate(P) {
    const pts = [[-23.6, 59.6], [-14, 59.6], [-14, 56.6], [-20.6, 56.6], [-20.6, 50], [-23.6, 50]];
    return ISO.tinted(ISO.T.steel, ISO.prismY(P, pts, 2, 2.15, ["#8d9096", "#c7c9cd"], "#d9dadd", "#3c3f45")) +
      D([[-22.1, 58.1], [-15.6, 58.1], [-22.1, 51.6]].map(([x, z]) => K.iso([x, 2.16, z], P)), { size: 0.5 });
  }
  // a brass cup hook: its threaded shank into the beam's underside, a shoulder washer, the open J-bend
  function hook(P, x, kS) {
    const out = [ISO.tinted(ISO.T.brass, S(K.cylinder(x, 0, 0.42, BEAM[0] - 0.25, 0.25, P, 18), { tone: "hi" }) + S(K.cylinder(x, 0, 0.14, BEAM[0] - 0.9, 0.65, P, 10), { tone: "mid", crease: "none" }))];
    const pts = [[x, 0, BEAM[0] - 0.9], [x, 0, BEAM[0] - 1.6]];
    for (let i = 0; i <= 14; i++) { const a = Math.PI * (i / 14) * 1.15; pts.push([x + 0.55 - Math.cos(a) * 0.55, 0, BEAM[0] - 1.6 - Math.sin(a) * 0.55]); }
    const d = K.pathOf(pts.map((p) => K.iso(p, P))), wd = Math.max(1, kS * 0.28);
    out.push(`<path d="${d}" fill="none" stroke="#6b5114" stroke-width="${(wd + 1).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#e2c986" stroke-width="${wd.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
    return out.join("");
  }

  ISO.add({
    name: "hangingframe", title: "Hanging frame (part)", compare: null,
    about: "A wooden gallows frame 50 cm wide and 60 cm tall, post, beam and brace on two cross feet, with two cup hooks under the beam that threads (two rubbed balloons, a pendulum) hang from. anchors: hook1 hook2 top",
    line: "hangingframe cx cy k lab=0 lit=frame|feet|hooks",
    demo: { line: "hangingframe 480 470 6.5 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "hooks" }, hold: 1.5 }, { set: { lit: "feet" }, hold: 1.2 }, { set: { lit: "frame" }, hold: 1.2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", w = ISO.writer(), kS = G.scaleOf(P);
      const halo = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 1, y: -11, w: 2 * HX + 2, d: 22, r: 2 }, 0, 1, P)}"/>`;
      const pads = [-HX + 1, HX - 5].flatMap((x) => [-9.5, 7.5].map((y) => ISO.wbox(P, [x, x + 4], [y, y + 2], [-0.4, 0], "lo")));
      const post = ISO.wbox(P, PX, [-2, 2], [FT, BEAM[0]], "mid"), beam = ISO.wbox(P, [PX[0], HX], [-2, 2], BEAM, "mid");
      const brace = ISO.prismY(P, [[PX[1], 42], [-6.5, BEAM[0]], [-11, BEAM[0]], [PX[1], 46.5]], -1.2, 1.2, ["#d2a96f", "#eed6b1"], "#f6e6c9", "#74521f");
      const postGrain = grain(P, [[[PX[1], 1.2, FT], [PX[1], 1.2, BEAM[0]]], [[PX[1], -0.6, FT], [PX[1], -0.6, BEAM[0]]], [[PX[0] + 1.1, 2, FT], [PX[0] + 1.1, 2, BEAM[0]]], [[PX[0] + 2.7, 2, FT], [PX[0] + 2.7, 2, BEAM[0]]]]);
      const beamGrain = grain(P, [[[PX[0], 2, 57.2], [HX, 2, 57.2]], [[PX[0], 2, 58.6], [HX, 2, 58.6]], [[PX[0], 0.4, BEAM[1]], [HX, 0.4, BEAM[1]]]]);
            // painted back to front, bottom to top: pads, −x foot, base bar, +x foot, post and brace, hooks (their shanks
      // go up into the beam), the beam, the corner plates on the near faces
      g.innerHTML = halo + `<g data-name="feet">${ISO.tinted(ISO.T.rubber, pads.join(""))}</g>` +
        `<g data-name="feet" style="${PINE}">${foot(P, -HX, -HX + 6)}${D([[-22, -6], [-22, 6]].map(([x, y]) => K.iso([x, y, FT], P)), { size: 0.6 })}${ISO.wbox(P, [-HX + 6, HX - 6], [-2, 2], [0, FT - 0.4], "mid")}${foot(P, HX - 6, HX)}</g>` +
        `<g data-name="frame" style="${PINE}">${post}${postGrain}${brace}</g>` +
        `<g data-name="hooks">${HOOKS.map((x) => hook(P, x, kS)).join("")}</g>` +
        `<g data-name="frame" style="${PINE}">${beam}${beamGrain}${cornerPlate(P)}</g>` +
        `<g data-part="words">${lab ? ISO.word(K.iso([HX, 2, BEAM[1] + 2], P), "hanging frame", "#555", { size: 13, anchor: "end", dy: -6 }) + ISO.word(K.iso([HOOKS[1], 0, BEAM[0] - HD - 1], P), "hooks", "#6b5114", { size: 13, anchor: "start", dy: 12 }) : ""}</g>`;
      g.anchors = { hook1: [HOOKS[0] + 0.55, 0, BEAM[0] - 1.6 - 0.55], hook2: [HOOKS[1] + 0.55, 0, BEAM[0] - 1.6 - 0.55], top: [0, 0, BEAM[1]] };
      let lit = o.lit || "";
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; window.B29.light(w, g, lit); } };
      g.update = () => false;
      g.readout = () => `hanging frame 50 × 60 cm · two hooks 14 cm apart, ${BEAM[0] - 2} cm above its feet`;
      window.B29.light(w, g, lit);
      return g;
    },
  });
})();
