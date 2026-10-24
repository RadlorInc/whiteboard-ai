// "pipevalve cx cy width open=0-1 lab=1 lit=valve|gauge|tee" — a run of flanged pipe on saddle supports with a gate
// valve, a tee branch and a pressure gauge upstream. The gate valve is the outside-screw-and-yoke kind: turning the
// red handwheel screws the stem up through the yoke, and the stem lifts the wedge gate out of the bore (seen through a
// cut-away in the body). Closed, the gauge reads the full 4.0 bar of the supply and nothing moves; opened, water flows
// (dashes march along the pipe) and the gauge drops a little, to 3.4 bar at full flow, because moving water loses
// pressure to friction. DN80 pipe, gate travel 80 mm, stem 4 mm a turn (20 turns), 2.4 L/s fully open. Units: 5 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const PZ = 34, R = 8, VX = -30, TX = 44, GX = -86, LIFT = 2 * R + 2, P0 = 4.0, DROP = 0.6, QMAX = 2.4;
  const SLAB = { x: -132, y: -40, w: 260, d: 80, r: 4 };
  const xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]), yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const RED = ISO.T.red, named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const AX = xAx([0, 0, PZ]);
  const flange = (P, F, s0, s1, r, n, tone = "mid") => S(G.disc(s0, s1, r, F, P), { tone }) + D(G.dotsOf(F, s1, r * 0.76, n, P, { fade: [0.04, 0.42] }), { size: 0.6 });
  const pipe = (P, F, s0, s1, r = R) => S(G.disc(s0, s1, r, F, P), { tone: "hi", crease: "none" });

  function slabSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(SLAB, -10, 10, P)}"/>`, ISO.tinted(ISO.T.road, S(K.slabOf(SLAB, -10, 10, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(SLAB, -5, P, 4), { tone: "faint" }) }))];
    out.push(L([-60, 10, 80].map((x) => K.segment([x, SLAB.y + SLAB.d, -10], [x, SLAB.y + SLAB.d, 0], P) + K.lineOnTop([x, SLAB.y], [x, SLAB.y + SLAB.d], 0, P)).join(""), { tone: "faint" }));
    return out.join("");
  }
  // A pipe support: a base plate with four bolts, a post and a saddle with a U-bolt over the pipe.
  function supportSvg(P, x, front) {
    if (front) return `<path d="${G.arcOf(xAx([0, 0, PZ]), x, R + 0.7, P)}" fill="none" stroke="#3c3f45" stroke-width="1.6"/>`;
    const out = [ISO.wbox(P, [x - 8, x + 8], [-10, 10], [0, 1.6], "mid")];
    out.push(D([[-5, -7], [5, -7], [-5, 7], [5, 7]].map(([dx, dy]) => K.iso([x + dx, dy, 1.6], P)), { size: 0.6 }));
    out.push(S(K.cylinder(x, 0, 3, 1.6, PZ - R - 5, P, 20), { tone: "mid", crease: "none" }));
    out.push(ISO.wbox(P, [x - 4, x + 4], [-R - 3, R + 3], [PZ - R - 4, PZ - R], "mid"));
    return out.join("");
  }
  // Gate valve body: two end flanges and necks, the chamber with its cut-away window, the bonnet and the yoke.
  function bodySvg(P) {
    const out = [];
    for (const sg of [-1, 1]) out.push(flange(P, AX, VX + sg * 22 - 1.5, VX + sg * 22 + 1.5, 14, 8, "hi"), flange(P, AX, VX + sg * 19 - 1.5, VX + sg * 19 + 1.5, 14, 8), S(G.disc(Math.min(VX + sg * 12, VX + sg * 17.5), Math.max(VX + sg * 12, VX + sg * 17.5), 10.5, AX, P), { tone: "mid" }));
    out.push(ISO.wbox(P, [VX - 12, VX + 12], [-11, 11], [PZ - 16, PZ + 18], "mid"));
    out.push(`<path d="${K.pathOf([[VX - 9, 11.05, PZ - 13], [VX + 9, 11.05, PZ - 13], [VX + 9, 11.05, PZ + 15], [VX - 9, 11.05, PZ + 15]].map((p) => K.iso(p, P)), true)}" fill="#9ea4ab" stroke="#3c3f45" stroke-width="0.8"/>`);
    out.push(ISO.wbox(P, [VX - 14, VX + 14], [-13, 13], [PZ + 18, PZ + 22], "mid"), D([[-11, -10], [11, -10], [-11, 10], [11, 10], [0, 10]].map(([dx, dy]) => K.iso([VX + dx, dy, PZ + 22], P)), { size: 0.7 }));
    const Fb = zAx([VX, 0, 0]);
    out.push(S(G.solidOf([[PZ + 22, 9], [PZ + 26, 8, 1], [PZ + 40, 7], [PZ + 44, 7]], Fb, P), { tone: "mid" }), S(G.disc(PZ + 44, PZ + 48, 5, Fb, P), { tone: "hi" }));
    return out.join("");
  }
  // What is seen through the window: the dark bore band (blue once water moves) and the wedge gate at its height.
  function windowSvg(P, lift, wet) {
    const f = 11.1, poly = (pts, fill, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" ${extra}/>`;
    const out = [poly([[VX - 9, f, PZ - R], [VX + 9, f, PZ - R], [VX + 9, f, PZ + R], [VX - 9, f, PZ + R]], wet ? "#9cc3ea" : "#4a4f56")];
    const z0 = PZ - R - 1.5 + lift;
    out.push(ISO.wbox(P, [VX - 7, VX + 7], [-3, 3.5], [z0, z0 + 2 * R + 4], "hi", true));
    out.push(L(K.segment([VX - 4, 3.5, z0], [VX - 4, 3.5, z0 + 2 * R + 4], P) + K.segment([VX + 4, 3.5, z0], [VX + 4, 3.5, z0 + 2 * R + 4], P), { tone: "faint" }));
    return out.join("");
  }
  function stemSvg(P, lift, part) {
    const F = zAx([VX, 0, 0]), top = PZ + 82 + lift;
    if (part === "low") return S(G.disc(PZ + 48, PZ + 70, 1.8, F, P), { tone: "hi", crease: "none" });
    const threads = []; for (let z = PZ + 78; z < top - 1; z += 2.4) threads.push(G.arcOf(F, z, 1.8, P));
    return S(G.disc(PZ + 76, top, 1.8, F, P), { tone: "hi", inner: L(threads.join(""), { tone: "lo" }) }) + S(G.disc(top, top + 1.2, 2.4, F, P), { tone: "hi" });
  }
  function yokeSvg(P, sg) { return ISO.wbox(P, [VX + sg * 7 - 1.6, VX + sg * 7 + 1.6], [-3, 3], [PZ + 46, PZ + 68], "mid"); }
  // The handwheel: yoke nut and hub are fixed; only the spokes and the grip mark turn, so only they are rebuilt.
  function wheelSvg(P, a) {
    const F = zAx([VX, 0, 0]), z = PZ + 74, ring = K.pathOf(Array.from({ length: 49 }, (_, i) => K.iso(G.pointOf(F, z, 17.2, (i / 48) * Math.PI * 2), P)), true);
    const spokes = Array.from({ length: 5 }, (_, i) => K.pathOf([K.iso(G.pointOf(F, z, 3.5, a + (i * 2 * Math.PI) / 5), P), K.iso(G.pointOf(F, z, 17.2, a + (i * 2 * Math.PI) / 5), P)])).join("");
    const k = K.cameraOf(P).k, tube = (d, w) => `<path d="${d}" fill="none" stroke="#8f2a22" stroke-width="${(w + 0.9) * k}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#e0584b" stroke-width="${w * k}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#f6b3ab" stroke-width="${w * 0.3 * k}" stroke-linecap="round" transform="translate(0 ${-w * 0.25 * k})"/>`;
    return tube(spokes, 1.6) + tube(ring, 2.8) + ISO.tinted(RED, S(G.disc(PZ + 72, PZ + 75.5, 4.6, F, P), { tone: "hi" })) + D([K.iso(G.pointOf(F, z + 1.4, 17.2, a + 0.6), P)], { size: 1, tone: "hi" });
  }
  function wheelBaseSvg(P) { const F = zAx([VX, 0, 0]); return ISO.wbox(P, [VX - 10, VX + 10], [-4, 4], [PZ + 66, PZ + 71], "mid") + S(G.disc(PZ + 71, PZ + 76, 4.2, F, P), { tone: "mid" }); }
  // Pressure gauge on a tapping upstream: boss, isolating cock, a short riser, then the dial facing the viewer.
  function gaugeSvg(P, bar, needleOnly) {
    if (needleOnly) { const c = [GX, 3.3, PZ + R + 28], dd = (-135 + (bar / 10) * 270) * Math.PI / 180; return `<path class="iso-line" data-tone="lit" data-free="end" d="${K.segment(c, [c[0] + Math.sin(dd) * 7.6, 3.3, c[2] + Math.cos(dd) * 7.6], P)}" style="stroke-width:1.2"/>` + D([K.iso(c, P)], { size: 1, tone: "hi" }); }
    const Fz = zAx([GX, 0, 0]), out = [S(G.disc(PZ + R - 1, PZ + R + 3, 3.4, Fz, P), { tone: "mid" }), S(G.disc(PZ + R + 3, PZ + R + 16, 1.6, Fz, P), { tone: "mid", crease: "none" })];
    out.push(S(G.prismOf(Fz, Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * 3, Math.sin(i * Math.PI / 3) * 3]), PZ + R + 7, PZ + R + 11, P), { tone: "mid" }));
    const c = [GX, 0, PZ + R + 28], Fy = yAx(c);
    out.push(S(G.disc(-3, 2.5, 12, Fy, P), { tone: "mid" }), S(G.disc(2.5, 3.2, 12, Fy, P), { tone: "hi" }), `<path d="${G.circleOf(Fy, 3.21, 10.4, P)}" fill="#fbfbfa" stroke="#8a8a8f" stroke-width="0.5"/>`);
    const at = (deg, r) => [c[0] + Math.sin(deg * Math.PI / 180) * r, 3.25, c[2] + Math.cos(deg * Math.PI / 180) * r];
    const arc = [], minor = [], major = [];
    for (let d = -135; d <= 135; d += 5) arc.push(K.iso(at(d, 8.4), P));
    for (let i = 0; i <= 20; i++) { const d = -135 + i * 13.5; (i % 4 ? minor : major).push(K.segment(at(d, 8.4), at(d, i % 4 ? 7.2 : 6.4), P)); }
    out.push(L(K.pathOf(arc), { tone: "lo" }), D([arc[0], arc[arc.length - 1]], { size: 0.5, tone: "lo" }), L(minor.join(""), { tone: "lo", free: "end" }), L(major.join(""), { tone: "mid", free: "end" }));
    const red = []; for (let d = 135 - 27; d <= 135; d += 3) red.push(K.iso(at(d, 8.8), P));
    out.push(`<path d="${K.pathOf(red)}" fill="none" stroke="#c0392b" stroke-width="1.2"/>`);
    return out.join("");
  }
  // The rest of the run: tee (a cast ball), the branch rising to a flanged elbow, and the main pipe on to its flange.
  function downstreamSvg(P) {
    const out = [pipe(P, AX, VX + 23.5, TX - 9.5), S(G.sphereOf([TX, 0, PZ], 11.5, P), { tone: "hi" })];
    const Fz = zAx([TX, 0, 0]);
    out.push(pipe(P, Fz, PZ + 9.5, PZ + 40), flange(P, Fz, PZ + 40, PZ + 43, 13, 8, "hi"), flange(P, Fz, PZ + 43, PZ + 46, 13, 8, "hi"), pipe(P, Fz, PZ + 46, PZ + 60), flange(P, Fz, PZ + 60, PZ + 63, 13, 8, "hi"), `<path d="${G.circleOf(Fz, PZ + 63, 7.4, P)}" fill="#3a5a7a"/>`);
    out.push(pipe(P, AX, TX + 9.5, 122), flange(P, AX, 122, 125, 13, 8, "hi"));
    return named("tee", out.join(""));
  }
  const flowD = (P) => {
    const on = (pts) => K.pathOf(pts.map(([x, y, z]) => K.iso([x, y + R * 0.72, z + R * 0.69], P)));
    return on([[-124, 0, PZ], [VX - 21, 0, PZ]]) + on([[VX + 21, 0, PZ], [TX - 11.5, 0, PZ]]) + on([[TX + 11.5, 0, PZ], [121, 0, PZ]]) +
      K.pathOf([[TX + R * 0.5, R * 0.62, PZ + 12], [TX + R * 0.5, R * 0.62, PZ + 39]].map((p) => K.iso(p, P)));
  };
  const style = `<style>.pv-flow path{stroke-dasharray:5 9;opacity:0;transition:opacity .4s}.pv-flow[data-on="1"] path{opacity:1;animation:pv-flow .7s linear infinite}@keyframes pv-flow{to{stroke-dashoffset:-28}}@media (prefers-reduced-motion:reduce){.pv-flow path{animation:none}}</style>`;

  ISO.add({
    name: "pipevalve", title: "Gate valve on a pipe", compare: "pipevalve 480 270 480",
    about: "Flanged pipe on saddle supports with a gate valve (red handwheel, rising stem), a tee branch and a pressure gauge: open the valve, the gate lifts, water flows and the gauge drops a little.",
    line: "pipevalve cx cy width open=0-1 lab=1 lit=valve|gauge|tee",
    demo: { line: "pipevalve 480 280 480", script: [{ set: { open: 0 }, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { open: 0.4 }, hold: "settle" }, { set: { open: 0 }, hold: "settle" }] },
    make([cx, cy, size = 480], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.45, H = size * 0.92;
      const { P, g } = ISO.frame([...K.boxCorners(SLAB, -10, 0), [VX, 0, PZ + 100], [TX, 0, PZ + 76], [GX, 0, PZ + R + 42]], cx, cy, W, H, { azimuth: 58, elevation: 24 }, parent);
      const s = { f: ISO.clamp(ISO.num(o, "open", 0), 0, 1), want: 0 };
      s.want = s.f;
      let lit = o.lit || "";
      const words = !lab ? "" : [
        ISO.word(K.iso([VX - 20, 0, PZ + 74], P), "handwheel", "#c0392b", { size: 14, anchor: "end" }),
        ISO.word(K.iso([VX, 11, PZ - 16], P), "gate (cut away)", "#555", { size: 13, dy: 20 }),
        ISO.word(K.iso([TX, 0, PZ + 76], P), "tee branch", "#555", { size: 14, dy: -10 }),
        ISO.word(K.iso([-124, 0, PZ + 12], P), "from mains", "#2b6cc4", { size: 14, dy: -6 }),
      ].join("");
      g.innerHTML = style + `<g>${slabSvg(P)}${[-108, 10, 92].map((x) => supportSvg(P, x)).join("")}${pipe(P, AX, -122, VX - 23.5)}${flange(P, AX, -125, -122, 13, 8, "hi")}</g>` +
        `<g data-name="gauge">${gaugeSvg(P)}<g data-part="needle"></g></g><g>${bodySvg(P)}</g><g data-part="window"></g><g>${yokeSvg(P, -1)}</g><g data-part="stemlow"></g><g>${yokeSvg(P, 1)}</g><g>${wheelBaseSvg(P)}</g><g data-name="valve" data-part="wheel"></g><g data-part="stemtop"></g>` +
        `<g>${downstreamSvg(P)}${[-108, 10, 92].map((x) => supportSvg(P, x, true)).join("")}</g><g class="pv-flow" data-part="flow"><path d="${flowD(P)}" fill="none" stroke="#2b6cc4" stroke-width="1.5" stroke-linecap="round"/></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const bar = () => P0 - DROP * s.f * s.f;
      const winId = `pv-win-${Math.random().toString(36).slice(2, 7)}`;
      el.window.innerHTML = `<defs><clipPath id="${winId}"><path d="${K.pathOf([[VX - 9, 11.05, PZ - 13], [VX + 9, 11.05, PZ - 13], [VX + 9, 11.05, PZ + 15], [VX - 9, 11.05, PZ + 15]].map((p) => K.iso(p, P)), true)}"/></clipPath></defs><g clip-path="url(#${winId})"></g>`;
      const win = el.window.lastElementChild;
      const draw = () => {
        const lift = s.f * LIFT, key = lift.toFixed(2);
        w.rebuild(win, `${key} ${s.f > 0.08}`, () => windowSvg(P, lift, s.f > 0.08));
        w.rebuild(el.stemlow, "s", () => stemSvg(P, 0, "low"));
        w.rebuild(el.stemtop, key, () => stemSvg(P, lift, "top"));
        w.rebuild(el.wheel, key, () => wheelSvg(P, s.f * 20 * Math.PI * 2 / 8));
        w.rebuild(el.needle, bar().toFixed(3), () => gaugeSvg(P, bar(), true));
        w.rebuild(el.words, `${bar().toFixed(1)}`, () => words + (lab ? ISO.word(K.iso([GX, 0, PZ + R + 42], P), `gauge ${bar().toFixed(1)} bar`, "#c0392b", { size: 14, dy: -6 }) : ""));
        w.attr(el.flow, "data-on", s.f > 0.08 ? "1" : "0");
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.open !== undefined) s.want = ISO.clamp(+p.open, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const step = dt * 0.45;                              // a steady hand on the wheel: about 2 s end to end
        s.f = ISO.still() || Math.abs(s.want - s.f) <= step ? s.want : s.f + Math.sign(s.want - s.f) * step;
        draw();
        return s.f !== s.want;
      };
      g.readout = () => {
        const q = QMAX * Math.min(1, s.f * 1.15);
        return s.f < 0.02 ? `valve shut · no flow · gauge ${P0.toFixed(1)} bar (full supply pressure)` :
          `valve ${(s.f * 100).toFixed(0)}% open (${(s.f * 20).toFixed(1)} of 20 turns, stem up ${(s.f * 80).toFixed(0)} mm) · flow ${q.toFixed(1)} L/s · gauge ${bar().toFixed(2)} bar: moving water loses a little pressure to friction`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
