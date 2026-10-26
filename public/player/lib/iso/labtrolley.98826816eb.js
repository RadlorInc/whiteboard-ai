// "labtrolley cx cy k tilt=-40..40 x=0..200 v=0|1 lab=0 lit=body|wheels|plunger" — a PART (PARTS.md): a school
// dynamics trolley on a road that rises along +x at tilt degrees, its origin the road point under its middle at x = 0
// (at=<rampboard>.top with the ramp's deg sits it on the board). A 22 × 9 cm beech body with chamfered top edges, two
// steel axles in brass bearing plates, four 3.2 cm wheels (rubber tyres, steel hubs with five holes that turn with
// the distance rolled), a spring plunger at the front (−x, downhill) with its release button on top, a light-gate card
// standing in a slot on top, a ticker-tape clip at the back and a maker's label. x = how far it has rolled down its
// road (toward −x, cm). v=1: it starts from rest and speeds up at a = g·sin(tilt) (no friction), as a real trolley,
// x = ½·a·t², until it gets there; v=0 (or a road that does not slope down) it eases there. set({ x, v, tilt }).
// The whole trolley moves as one flat screen move (a world move along the road), only the hubs are redrawn.
// World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const HL = 11, HW = 4.5, R = 1.6, AX = 7.5, WT = 0.75, Z0 = 1.25, Z1 = 4.6, g9 = 981;   // cm, cm/s²
  const BEECH = ISO.tint("#f6e3c4", ["#d2a46c", "#dbb37f", "#e3c294", "#ebd0aa"], "#74511f");
  const CARD = ISO.tint("#fbfbf8", ["#cfd1d4", "#dadcde", "#e4e5e7", "#eeefef"], "#4a4d52");
  const rad = (d) => (d * Math.PI) / 180;
  // the road frame: u along the road (+x uphill), w up from the road, y across; origin the road point at x = 0
  const roadOf = (th) => { const d = [Math.cos(th), 0, Math.sin(th)], n = [-Math.sin(th), 0, Math.cos(th)]; return { d, n, at: (u, w, y) => [u * d[0] + w * n[0], y, u * d[2] + w * n[2]] }; };

  // one wheel at axle position u on side y (its outer face toward ±y), turned by phase
  function wheelSvg(P, rd, u, side, phase) {
    const y0 = side > 0 ? HW + 0.15 : -HW - 0.15 - WT, y1 = y0 + WT, outer = side > 0 ? y1 : y0;
    const F = G.frameOf(rd.at(u, R, 0), [0, 1, 0], rd.d, rd.n);
    const out = [ISO.tinted(ISO.T.rubber, S(G.disc(y0, y1, R, F, P), { tone: "mid" }))];
    if (side > 0) {
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(outer, outer + 0.06, R * 0.62, F, P), { tone: "hi" })));
      out.push(D(G.dotsOf(F, outer + 0.07, R * 0.4, 5, P, { phase, all: true }), { size: 0.9, tone: "lo" }));
      out.push(ISO.tinted(ISO.T.steel, S(G.disc(outer + 0.06, outer + 0.2, 0.22, F, P), { tone: "mid" })));   // the axle's end
    }
    return out.join("");
  }
  // the body and everything fixed to it, drawn back to front: plunger (front, far), body, top fittings, back clip
  function bodySvg(P, rd, lab) {
    const at = rd.at, out = [];
    // the plunger: a steel tube out of the front face, the spring round its rod, the rod and its buffer cap
    const pF = G.frameOf(at(-HL, 3, 0), [-rd.d[0], 0, -rd.d[2]], [0, 1, 0], rd.n);
    out.push(`<g data-name="plunger">${ISO.tinted(ISO.T.steel, S(G.disc(0, 0.9, 0.55, pF, P), { tone: "mid" }))}` +
      ISO.tinted(ISO.T.steel, S(G.disc(0.9, 2.6, 0.18, pF, P), { tone: "mid" })) +
      ISO.tinted(ISO.T.steel, [0, 1, 2, 3, 4, 5].map((i) => S(G.disc(1 + i * 0.26, 1.1 + i * 0.26, 0.38, pF, P), { tone: "lo" })).join("")) +   // the spring's turns
      ISO.tinted(ISO.T.plastic, S(G.disc(2.6, 3.2, 0.62, pF, P), { tone: "mid" })) + "</g>");
    // the body: a beech block with chamfered top edges (an eight-point section along u)
    const c = 0.45, sec = [[-HW, Z0], [HW, Z0], [HW, Z1 - c], [HW - c, Z1], [-HW + c, Z1], [-HW, Z1 - c]];
    const V = [...sec.map(([y, w]) => at(-HL, w, y)), ...sec.map(([y, w]) => at(HL, w, y))], n = sec.length;
    const F = [[...Array(n).keys()], [...Array(n).keys()].map((i) => i + n), ...sec.map((_, i) => [i, (i + 1) % n, ((i + 1) % n) + n, i + n])];
    out.push(`<g data-name="body">${ISO.tinted(BEECH, ISO.poly(V, F, P, "mid"))}`);
    // brass bearing plates where the axles come through the near side, two screws each
    for (const u of [-AX, AX]) {
      out.push(ISO.tinted(ISO.T.brass, ISO.box(at, P, [u - 1.1, u + 1.1], [Z0 + 0.05, R + 0.9], [HW, HW + 0.08], "mid")));
      out.push(D([at(u - 0.75, R + 0.55, HW + 0.09), at(u + 0.75, R + 0.55, HW + 0.09)].map((p) => K.iso(p, P)), { size: 0.35 }));
    }
    // the maker's label on the near side: a plate with three printed rules
    out.push(ISO.tinted(CARD, ISO.box(at, P, [-3.2, 3.2], [2.1, 3.9], [HW, HW + 0.05], "mid")));
    out.push(`<path d="${[2.55, 3, 3.45].map((w, i) => K.pathOf([K.iso(at(-2.7, w, HW + 0.06), P), K.iso(at(2.7 - i * 1.4, w, HW + 0.06), P)])).join("")}" stroke="#8a877f" stroke-width="0.5"/>`);
    // a dark groove round the top where a mass sits, and the plunger's release button
    out.push(`<path d="${K.pathOf([at(-6, Z1 + 0.005, -2.6), at(-6, Z1 + 0.005, 2.6), at(6, Z1 + 0.005, 2.6), at(6, Z1 + 0.005, -2.6)].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#9b7444" stroke-width="0.7"/>`);
    out.push(ISO.tinted(ISO.T.red, S(G.disc(0, 0.35, 0.42, G.frameOf(at(-9.2, Z1, 0), rd.n, rd.d, [0, 1, 0]), P), { tone: "mid" })), "</g>");
    // the light-gate card in its slot block
    out.push(ISO.tinted(ISO.T.plastic, ISO.box(at, P, [-4.4, 4.4], [Z1, Z1 + 0.7], [-0.45, 0.45], "mid")));
    out.push(`<g data-name="card">${ISO.tinted(CARD, ISO.box(at, P, [-4, 4], [Z1 + 0.7, Z1 + 5.7], [-0.06, 0.06], "hi"))}</g>`);
    // the ticker-tape clip at the back
    out.push(ISO.tinted(ISO.T.steel, ISO.box(at, P, [HL, HL + 0.3], [2.4, 3.8], [-1.2, 1.2], "mid") + ISO.box(at, P, [HL + 0.3, HL + 1.1], [3.4, 3.7], [-1, 1], "mid")));
    if (lab) out.push(CIRC.word(P, at(HL, Z1 + 3, 0), "dynamics trolley"));
    return out.join("");
  }

  ISO.add({
    name: "labtrolley", title: "Dynamics trolley (part)", compare: null,
    about: "A school dynamics trolley: wooden body, four wheels on steel axles, a spring plunger at the front (downhill, −x), a card on top for a light gate; on a road rising at tilt° it rolls x cm down it, speeding up at g·sin(tilt) when v=1. anchors: front back",
    line: "labtrolley cx cy k tilt=-40..40 x=0..200 v=0|1 lab=0 lit=body|wheels|plunger",
    demo: { line: "labtrolley 640 330 17 tilt=15 x=0 v=1", script: [{ set: {}, hold: 1 }, { set: { x: 16, v: 1, lit: "wheels" }, hold: "settle" }, { set: { x: 0, v: 0, lit: "plunger" }, hold: "settle" }, { set: { tilt: 30, x: 16, v: 1, lit: "" }, hold: "settle" }, { set: { tilt: 0, x: 4, v: 0, lit: "body" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const s = { th: rad(ISO.clamp(ISO.num(o, "tilt", 0), -40, 40)), x: ISO.clamp(ISO.num(o, "x", 0), 0, 200), to: 0, vel: 0, v: o.v === "1" };
      s.to = s.x;
      g.innerHTML = `<g data-part="car"></g>`;
      const car = g.firstChild, w = ISO.writer();
      let lit = o.lit || "", el;
      const build = () => {
        const rd = roadOf(s.th);
        const halo = `<path class="iso-halo" d="${K.haloOf({ x: -HL - 3.5, y: -HW - 1, w: 2 * HL + 5, d: 2 * HW + 2, r: 1.5 }, 0, 0.4, P)}"/>`;
        car.innerHTML = (s.th === 0 ? halo : "") + `<g data-name="wheels" data-part="far"></g><g data-part="body">${bodySvg(P, rd, lab)}</g><g data-name="wheels" data-part="near"></g>`;
        el = LAB.parts(car); el.far._key = el.near._key = null;
        g.anchors = { front: rd.at(-HL - 3.2, 3, 0).map((v) => +v.toFixed(3)), back: rd.at(HL + 1.1, 3.5, 0).map((v) => +v.toFixed(3)) };
      };
      const draw = () => {
        const rd = roadOf(s.th), x = Math.round(s.x * 100) / 100, phase = x / R;
        car.setAttribute("transform", K.translateAlong(P, [-x * rd.d[0], 0, -x * rd.d[2]]));
        const key = String(Math.round(phase * 40) / 40);
        w.rebuild(el.far, key, () => [-AX, AX].map((u) => wheelSvg(P, rd, u, -1, +key)).join(""));
        w.rebuild(el.near, key, () => [-AX, AX].map((u) => wheelSvg(P, rd, u, 1, +key)).join(""));
        LAB.light(w, g, lit);
      };
      const accel = () => g9 * Math.sin(s.th);   // cm/s² down the road (toward −x)
      g.set = (p) => {
        if (p.tilt !== undefined && Number.isFinite(+p.tilt)) { const th = rad(ISO.clamp(+p.tilt, -40, 40)); if (th !== s.th) { s.th = th; build(); } }
        if (p.v !== undefined) s.v = String(p.v) === "1";
        if (p.x !== undefined && Number.isFinite(+p.x)) { s.to = ISO.clamp(+p.x, 0, 200); if (s.to < s.x || !s.v) s.vel = 0; }
        if (p.lit !== undefined) lit = p.lit;
        draw();
      };
      g.update = (dt) => {
        if (ISO.still() || dt > 1) { s.x = s.to; s.vel = 0; }
        else if (s.v && accel() > 0 && s.to > s.x) {
          // a real roll from where it is: v grows by a·dt, x by v·dt, until it reaches its mark (it is caught there)
          s.vel += accel() * dt; s.x += s.vel * dt;
          if (s.x >= s.to) { s.x = s.to; s.vel = 0; }
        } else { s.x = ISO.follow(s.x, s.to, dt, 0.35, false); s.vel = 0; }
        draw();
        return s.x !== s.to;
      };
      g.readout = () => {
        const a = accel() / 100, deg = Math.round((s.th * 180) / Math.PI);
        return `trolley rolled ${s.x.toFixed(1)} cm down a ${deg}° road · speed ${(s.vel / 100).toFixed(2)} m/s · a = g·sin θ = ${a.toFixed(2)} m/s²${s.v && a > 0 ? " · x = ½·a·t²" : ""}`;
      };
      build();
      draw();
      return g;
    },
  });
})();
