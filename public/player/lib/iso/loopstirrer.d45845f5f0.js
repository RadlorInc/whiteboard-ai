// "loopstirrer cx cy k stir=0|1 lab=0 lit=wire|loop" — a PART (PARTS.md, batch 5): the calorimeter's stirrer
// (calorimeter.js's wire with its ring) at real size: a 2 mm stainless steel wire 9 cm long, its lower end rounded off,
// bent at the top through a short elbow into a flat 1.6 cm finger loop. A tool: origin its lower tip (stand it at=
// a cuplid's `stir` with az= down into the cup). stir=1 bobs it up and down 8 mm, about once a second, as you mix;
// stir=0 lets it settle back. set({ stir }). hide=<cm> clips away the wire below that height over the tip (the part
// inside a lidded cup: at=lid.stir az=-6 hide=6). Built in mm (ISO.mm); anchors in cm: top = the loop's middle at rest.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const R = 1, LEN = 80, LOOP = 8, LW = 1;
  let n = 0;

  function svg(P) {
    const B09 = window.B09, out = [];
    // the wire: a rounded tip, the long straight run, a short elbow out to the loop's edge
    out.push(`<g data-name="wire">${ISO.tinted(ISO.T.steel, S(G.solidOf([[0, 0.2], [0.5, 0.8, 1], [1.4, R]], B09.Z([0, 0, 0]), P), { tone: "mid" }) +
      S(K.cylinder(0, 0, R, 1.4, LEN - 1.4, P, 12), { tone: "mid", crease: "none" }) +
      S(G.solidOf([[0, R], [6, R]], G.frameAlong([0, 0, LEN - 0.6], G.unit3([-0.55, 0, 0.83])), P), { tone: "mid" }))}</g>`);
    // the loop: a flat ring of the same wire, centred one loop radius to −x of the run (a round wire: a dark rim
    // stroke, the steel, a thin highlight along its top)
    const d = G.circleOf(B09.Z([-3.3 - LOOP + 0.6, 0, 0]), LEN + 4.4 + R, LOOP, P, 56), k = G.scaleOf(P), wd = 2 * R * k;
    out.push(`<g data-name="loop"><path d="${d}" fill="none" stroke="#3c3f45" stroke-width="${(wd + 1).toFixed(2)}"/><path d="${d}" fill="none" stroke="#b6b9be" stroke-width="${wd.toFixed(2)}"/>` +
      `<path d="${G.circleOf(B09.Z([-3.3 - LOOP + 0.6, 0, 0]), LEN + 4.4 + R * 1.6, LOOP, P, 56)}" fill="none" stroke="#e8e9eb" stroke-width="${(wd * 0.25).toFixed(2)}"/></g>`);
    return out.join("");
  }

  ISO.add({
    name: "loopstirrer", title: "Loop stirrer (part)", compare: null,
    about: "A thin steel wire stirrer 9 cm long with a finger loop at the top, pushed up and down through a lid to mix a calorimeter's liquid. anchors: top",
    line: "loopstirrer cx cy k stir=0|1 hide=0..8 lab=0 lit=wire|loop",
    demo: { line: "loopstirrer 480 440 36", script: [{ set: {}, hold: 1 }, { set: { stir: 1, lit: "loop" }, hold: 3 }, { set: { stir: 0, lit: "wire" }, hold: "settle" }] },
    make([cx = 480, cy = 440, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      // hide=<cm>: the wire below that height over its tip is inside something (a cup under a lid): clipped away
      const hide = ISO.clamp(ISO.num(o, "hide", 0), 0, 8) * 10, cid = `lstir${++n}`;
      const clip = hide ? `<defs><clipPath id="${cid}"><path d="M-4000 -4000 H8000 V${K.iso([0, 0, hide], Pm)[1].toFixed(1)} H-4000 Z"/></clipPath></defs>` : "";
      g.innerHTML = `${clip}<g${hide ? ` clip-path="url(#${cid})"` : ""}><g data-part="body">${svg(Pm)}${lab ? LAB.word(Pm, lab, [6, 0, LEN + 8], "stirrer", "#556", { anchor: "start" }) : ""}</g></g>`;
      g.anchors = { top: [(-3.3 - LOOP + 0.6) / 10, 0, (LEN + 4.4 + R) / 10] };
      const body = g.querySelector('[data-part="body"]'), w = ISO.writer(), st = { on: o.stir === "1", t: 0, bob: 0 };
      let lit = o.lit || "";
      const draw = () => { const z = Math.round(st.bob * 10) / 10; w.attr(body, "transform", K.translateAlong(Pm, [0, 0, z])); window.B09.light(w, g, lit); };
      g.set = (p) => { if (p.stir !== undefined) st.on = String(p.stir) === "1"; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        if (ISO.still()) { st.bob = 0; st.t = 0; draw(); return false; }
        if (st.on) { st.t += dt; st.bob = 4 - 4 * Math.cos(st.t * 6); }
        else { st.bob = ISO.follow(st.bob, 0, dt, 0.15); if (st.bob < 0.05) { st.bob = 0; st.t = 0; } }
        draw();
        return st.on || st.bob > 0;
      };
      g.readout = () => `loop stirrer · 2 mm steel wire, 9 cm · ${st.on ? `stirring: ${(st.bob / 10).toFixed(1)} cm up` : "at rest"}`;
      draw();
      return g;
    },
  });
})();
