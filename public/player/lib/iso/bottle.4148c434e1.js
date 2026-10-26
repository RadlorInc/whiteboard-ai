// "bottle cx cy k kind=spray|glue spray=0|1 lab=0 lit=bottle|nozzle|trigger" — a PART (PARTS.md): a bottle standing on
// the floor or a surface, its origin the point under its middle. kind=spray: a 500 mL trigger spray bottle (7.6 cm
// across, 28 cm tall): a blown body with a shoulder and a printed label, the screw collar with its grip ribs, the
// trigger head (shroud, piston, pivot pin, the trigger with finger ridges) and the turning nozzle cap
// (OFF / SPRAY / STREAM faces). spray=1 squeezes the trigger and a fine mist (SVG dots) leaves the nozzle along +x,
// widening and thinning as it goes. kind=glue: a 237 mL wood-glue bottle (5.8 cm across, 19 cm tall) with its label and
// a pointed spout cap; spray=1 pushes a bead of glue out of the tip. set({ spray }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]), xAx = (o) => G.frameOf(o, [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const SPRAY = {
    body: [[0, 3.3], [0.25, 3.7, 1], [0.8, 3.8, 1], [14.6, 3.8, 1], [16.4, 3.3, 1], [17.8, 2.1, 1], [18.6, 1.5, 1], [19.3, 1.45]],
    zc: [19.1, 21.5], rc: 1.85, nozzle: [6.1, 0, 26.6], tint: ISO.tint("#e3f4f1", ["#7fb8ae", "#95c7be", "#acd5cd", "#c4e3dd"], "#245a52"),
  };
  const GLUE = {
    body: [[0, 2.5], [0.25, 2.85, 1], [0.8, 2.9, 1], [12, 2.9, 1], [13.2, 2.3, 1], [13.9, 1.4, 1], [14.2, 1.3]],
    zc: [13.9, 15.7], rc: 1.65, nozzle: [0, 0, 19.5], tint: ISO.tint("#fbf7ec", ["#cfc6ae", "#dcd4bd", "#e7e0cc", "#f1ecdd"], "#5a4f32"),
  };
  const HEAD = ISO.tint("#ffffff", ["#b9bcc2", "#cacdd2", "#dadce0", "#e9eaed"], "#3a3d44");
  const RED = ISO.tint("#ffd9c9", ["#d4552a", "#e06a3e", "#ea8257", "#f39d78"], "#6e2208");
  const rAt = (prof, z) => { for (let i = 1; i < prof.length; i++) if (z <= prof[i][0]) { const [z0, r0] = prof[i - 1], [z1, r1] = prof[i]; return r0 + ((r1 - r0) * (z - z0)) / (z1 - z0 || 1); } return prof.at(-1)[1]; };
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const R = rng(11), MIST = Array.from({ length: 46 }, () => [R(), R() * 2 * Math.PI, Math.sqrt(R()), 0.5 + R() * 0.8]);   // phase, angle, radius, size

  // the body (one smooth turned profile), the label on its front, the screw collar with its ribs
  function bodySvg(P, B, face, kind) {
    const F = zAx([0, 0, 0]), out = [S(G.solidOf(B.body, F, P, { steps: 64 }), { tone: "hi" })];
    const z0 = kind === "spray" ? 3.4 : 2.6, z1 = kind === "spray" ? 12.6 : 10.6, r = B.body[3][1] + 0.03, a0 = face - 1.05, a1 = face + 1.05;
    const on = (z, a, dr = 0) => K.iso(G.pointOf(F, z, r + dr, a), P), arc = (z, from, to, dr = 0) => Array.from({ length: 17 }, (_, i) => on(z, from + ((to - from) * i) / 16, dr));
    out.push(`<path d="${K.pathOf([...arc(z0, a0, a1), ...arc(z1, a1, a0)], true)}" fill="#fdfdfb" stroke="#3a3d44" stroke-width="0.5" stroke-linejoin="round"/>`);
    // a coloured band across the label and the printed lines under it
    const band = kind === "spray" ? "#2f9e8f" : "#c0532a", zb = z0 + (z1 - z0) * 0.62;
    out.push(`<path d="${K.pathOf([...arc(zb, a0, a1, 0.01), ...arc(zb + 1.6, a1, a0, 0.01)], true)}" fill="${band}" stroke="none"/>`);
    const rule = (z, f) => K.pathOf(arc(z, face - 0.75, face - 0.75 + 1.5 * f, 0.02));
    out.push(L(rule(zb - 1.1, 1) + rule(zb - 2.1, 0.75) + rule(zb - 3.1, 0.5), { tone: "lo", free: true }));
    // the collar: a ribbed screw cap over the neck's thread, its ribs running from the lower rim to the upper one
    const [c0, c1] = B.zc, tint = kind === "spray" ? HEAD : RED;
    out.push(ISO.tinted(tint, S(G.lathe([[c0, 0], [c0, B.rc - 0.1], [c0 + 0.15, B.rc, 1], [c1 - 0.15, B.rc, 1], [c1, B.rc - 0.15], [c1, 0]], F, P, { steps: 48 }), { tone: "mid",
      inner: L(G.ribsOf(F, c0 + 0.3, c1 - 0.3, B.rc + 0.01, 36, P, { seams: true, least: 0.2 }), { tone: "lo" }) })));
    return out.join("");
  }
  // the trigger head: the shroud (a moulded shell, side profile as a prism), the piston under it, the pivot pin
  const SHROUD = [[-2, 21.5], [1.9, 21.5], [1.9, 24.6], [4.6, 25.2], [4.9, 25.8], [4.9, 27.4], [3.4, 27.9], [0.2, 28.1], [-1.4, 27.6], [-2.1, 26.6], [-2.2, 23]];
  function headSvg(P) {
    const out = [ISO.tinted(HEAD, S(G.disc(1.6, 3.6, 0.55, xAx([0, 0, 24.1]), P, { steps: 20 }), { tone: "mid" }))];
    out.push(ISO.prismY(P, SHROUD, -1.45, 1.45, ["#b9bcc2", "#f4f5f7"], "#eceef1", "#3a3d44",
      // the parting line round the shroud's side and the vent slot
      `<path d="${K.pathOf([[-2.15, 25], [1.9, 25]].map(([x, z]) => K.iso([x, 1.46, z], P)))}" fill="none" stroke="#9a9ea6" stroke-width="0.45"/>` +
      `<path d="${K.pathOf([[-0.8, 26.6], [1.2, 26.6], [1.2, 27], [-0.8, 27]].map(([x, z]) => K.iso([x, 1.46, z], P)), true)}" fill="#6b6f78" stroke="#3a3d44" stroke-width="0.4"/>`));
    out.push(D([K.iso([3.9, 1.47, 25.35], P)], { size: 0.5 }));
    return out.join("");
  }
  // the trigger: a curved lever hung from its pin, finger ridges on its front; pulled = turned back about the pin
  const TRIG = [[3.5, 25.2], [4.4, 25.1], [4.6, 24.2], [4.75, 22.6], [4.95, 21.4], [5.3, 20.6], [4.7, 20.4], [4, 21.2], [3.7, 22.6], [3.5, 24]];
  function triggerSvg(P, pull) {
    const th = -0.2 * pull, pv = [3.9, 25.35], rot = ([x, z]) => [pv[0] + (x - pv[0]) * Math.cos(th) - (z - pv[1]) * Math.sin(th), pv[1] + (x - pv[0]) * Math.sin(th) + (z - pv[1]) * Math.cos(th)];
    const ridges = [22, 22.6, 23.2, 23.8].map((z) => { const a = rot([3.75, z]), b = rot([4.5 + 0.06 * (24 - z), z]); return K.pathOf([K.iso([a[0], 0.61, a[1]], P), K.iso([b[0], 0.61, b[1]], P)]); }).join("");
    return ISO.prismY(P, TRIG.map(rot), -0.6, 0.6, ["#b9bcc2", "#f4f5f7"], "#e4e6ea", "#3a3d44", `<path d="${ridges}" fill="none" stroke="#7d818a" stroke-width="0.45"/>`);
  }
  // the nozzle cap: a square turning cap on the shroud's front, a face mark on each side and the orifice in the middle
  function nozzleSvg(P) {
    const out = [ISO.tinted(HEAD, ISO.wbox(P, [4.9, 6.1], [-0.75, 0.75], [25.85, 27.35], "mid"))];
    const f = (x, y, z) => K.iso([x, y, z], P);
    out.push(`<path d="${G.circleOf(xAx([6.1, 0, 26.6]), 0.01, 0.32, P, 16)}" fill="#3a3d44" stroke="none"/><path d="${G.circleOf(xAx([6.1, 0, 26.6]), 0.01, 0.55, P, 20)}" fill="none" stroke="#7d818a" stroke-width="0.4"/>`);
    out.push(L(K.pathOf([f(5.2, 0.76, 26.6), f(5.8, 0.76, 26.6)]) + K.pathOf([f(5.2, 0, 27.36), f(5.8, 0, 27.36)]), { tone: "mid", free: true }));
    return out.join("");
  }
  // the spout cap of the glue bottle: a cone to a point with a cut-off tip, and its tip cap's seam
  function spoutSvg(P) {
    const F = zAx([0, 0, 0]);
    return ISO.tinted(RED, S(G.lathe([[15.7, 0], [15.7, 1.15], [16.1, 1.05, 1], [17.4, 0.6, 1], [19.2, 0.26, 1], [19.5, 0.16], [19.5, 0]], F, P, { steps: 32 }), { tone: "hi",
      inner: L(G.arcOf(F, 17.4, 0.61, P), { tone: "lo" }) }));
  }
  // the mist: droplets riding out of the nozzle along +x in a 25° cone, smaller and paler as they spread
  function mistSvg(P, t, on) {
    if (on < 0.02) return "";
    const k = K.cameraOf(P).k, [nx, , nz] = SPRAY.nozzle, out = [];
    for (const [ph, ang, rad, sz] of MIST) {
      const f = (ph + t * 0.9) % 1, s = 0.4 + f * 22, spread = 0.05 + 0.22 * s, p = K.iso([nx + s, Math.cos(ang) * rad * spread, nz + Math.sin(ang) * rad * spread - 0.02 * s * s], P);
      const a = on * (1 - f) * (f < 0.06 ? f / 0.06 : 1), r = Math.max(0.35, sz * k * 0.09 * (1 + f));
      if (a > 0.03) out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r.toFixed(2)}" fill="#7fb4e6" fill-opacity="${(0.85 * a).toFixed(2)}"/>`);
    }
    return out.join("");
  }
  // a bead of glue welling out of the tip: a glossy white drop with its shine
  function beadSvg(P, f) {
    if (f < 0.02) return "";
    const r = 0.35 * f, c = [0, 0, 19.5 + r * 0.8];
    return `<g>${S(G.sphereOf(c, r, P, { steps: 20 }), { tone: "hi" })}</g>`.replace("<g>", `<g style="${ISO.tint("#ffffff", ["#e6e2d6", "#ece9df", "#f3f1ea", "#f9f8f4"], "#8a8270")}">`);
  }

  ISO.add({
    name: "bottle", title: "Bottle (part)", compare: null,
    about: "A trigger spray bottle (500 mL, 28 cm) that sprays a fine mist, or a wood-glue bottle with a pointed spout cap; a part to place in any scene. anchors: nozzle",
    line: "bottle cx cy k kind=spray|glue spray=0|1 lab=0 lit=bottle|nozzle|trigger",
    demo: { line: "bottle 400 440 12 kind=spray lab=1", script: [{ set: {}, hold: 1 }, { set: { spray: 1 }, hold: 2.5 }, { set: { spray: 0, lit: "trigger" }, hold: "settle" }] },
    make([cx = 480, cy = 440, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1", kind = o.kind === "glue" ? "glue" : "spray", B = kind === "glue" ? GLUE : SPRAY;
      const face = G.angleToward(zAx([0, 0, 0]), G.viewOf(P)), rb = B.body[3][1];
      const halo = { x: -rb - 1, y: -rb - 1, w: 2 * rb + 2, d: 2 * rb + 2, r: rb + 1 };
      const head = kind === "spray"
        ? `<g data-name="trigger" data-part="trigger"></g>${headSvg(P)}<g data-name="nozzle">${nozzleSvg(P)}</g><g data-part="mist"></g>`
        : `<g data-name="nozzle">${spoutSvg(P)}</g><g data-part="mist"></g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(halo, -0.5, 0.5, P)}"/><g data-name="bottle" style="${B.tint}">${bodySvg(P, B, face, kind)}</g>${head}<g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const s = { on: o.spray === "1" ? 1 : 0, onT: 0, clock: 0, lit: o.lit || "" };
      s.onT = s.on;
      if (lab) el.words.innerHTML = ISO.word(K.iso([0, rb, 0], P), kind === "glue" ? "wood glue" : "spray bottle", "#444", { size: 13, dy: 18 });
      const draw = () => {
        if (kind === "spray") {
          const q = Math.round(s.on * 20) / 20;
          w.rebuild(el.trigger, q.toFixed(2), () => triggerSvg(P, q));
          w.rebuild(el.mist, s.on > 0.02 ? `${s.on.toFixed(2)} ${s.clock.toFixed(3)}` : "", () => mistSvg(P, s.clock, s.on));
        } else w.rebuild(el.mist, s.on.toFixed(2), () => beadSvg(P, s.on));
        w.light(parts, parts.filter((p) => p.dataset.name === s.lit));
      };
      g.anchors = { nozzle: B.nozzle };   // the nozzle's tip (spray: the orifice, pointing +x; glue: the spout's point, up)
      g.set = (p) => { if (p.spray !== undefined) s.onT = +p.spray ? 1 : 0; if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        s.on = ISO.follow(s.on, s.onT, dt, 0.18, calm);
        if (!calm && s.on > 0.02 && kind === "spray") s.clock += dt;
        draw();
        return s.on !== s.onT || (kind === "spray" && s.on > 0.02 && !calm);
      };
      g.readout = () => kind === "glue"
        ? `wood-glue bottle · 237 mL · ${s.onT ? "a bead of glue at the spout's tip" : "spout cap closed"}`
        : `spray bottle · 500 mL · ${s.onT ? "trigger squeezed: about 1 mL of fine mist a pull, spreading in a 25° cone" : "trigger released"}`;
      draw();
      return g;
    },
  });
})();
