// Space hardware with the app's signatures: spacerocket (a two-stage rocket on its pad that lifts off),
// spacesat (a satellite whose solar panels unfold), spacescope (a refracting telescope on a tripod that tilts up).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const flame = (P, base, len, w) => {
    const pts = [[0, 0], [w, -len * 0.3], [w * 0.6, -len * 0.7], [0, -len], [-w * 0.6, -len * 0.7], [-w, -len * 0.3]].map(([x, z]) => K.iso([base[0] + x, base[1], base[2] + z], P));
    const inner = [[0, 0], [w * 0.5, -len * 0.25], [0, -len * 0.6], [-w * 0.5, -len * 0.25]].map(([x, z]) => K.iso([base[0] + x, base[1], base[2] + z], P));
    return `<path d="${K.pathOf(pts, true)}" fill="#f4a531" stroke="#c0392b" stroke-width="0.8"/><path d="${K.pathOf(inner, true)}" fill="#ffe08a"/>`;
  };

  // spacerocket: pad with a launch tower, a two-stage rocket (fins, interstage, fairing), lift-off on a real thrust.
  ISO.add({
    name: "spacerocket", title: "Rocket lift-off", compare: "spacerocket 480 270 360",
    about: "A two-stage rocket on its pad: at lift-off thrust beats weight and it climbs, faster each second as its fuel burns away.",
    line: "spacerocket cx cy height go=1 lab=1",
    demo: { line: "spacerocket 480 270 380 go=0", script: [{ set: {}, hold: 1 }, { set: { go: 1 }, hold: 4 }, { set: { go: 0 }, hold: "settle" }] },
    make([cx, cy, size = 360], o, t, parent) {
      const lab = o.lab !== "0", W = size * 0.9, H = size * 1.1;
      const { P, g } = ISO.frame([[-60, -60, 0], [60, 60, 0], [0, 0, 200]], cx, cy, W, H, { azimuth: 50, elevation: 16 }, parent);
      const statics = [ISO.baseboard(P, { x: -60, y: -60, w: 120, d: 120, r: 6 }, { h: 6, tint: ISO.T.road })];
      statics.push(ISO.wbox(P, [-22, 22], [-22, 22], [0, 8], "mid"));
      // Launch tower: a lattice of four posts with cross bars, standing beside the rocket.
      for (const [x, y] of [[-46, -10], [-34, -10], [-46, 2], [-34, 2]]) statics.push(S(K.cylinder(x, y, 1.2, 0, 150, P, 10), { tone: "mid", crease: "none" }));
      for (let z = 20; z <= 140; z += 20) statics.push(ISO.wbox(P, [-47, -33], [-11, 3], [z, z + 1.2], "mid"));
      g.innerHTML = `<g>${statics.join("")}</g><g data-part="rocket"></g>`;
      const el = g.querySelector('[data-part="rocket"]'), w = ISO.writer();
      // exhaust and the billows of steam and smoke rolling off the pad, as a shader layer under the rocket;
      // the plume stops at the pad's top (z 8), where it spreads into the billows
      const fx = ISO.gl(g, P, W, H, el, `uniform float uH;uniform float uT;uniform float uB;
        void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec4 c=vec4(0.);
          for(int i=0;i<12;i++){float a=float(i)*2.39+.6,k=fract(float(i)*.37+uTime*.06);float r=(10.+16.*k)*(.4+.6*uB);
            c=over(puffInk(vb,vec4(cos(a)*(14.+30.*k),sin(a)*(14.+30.*k),8.+r*.5,r),.95*uB*(1.-k*k)*smoothstep(0.,.15,k),uTime,float(i),.4),c);}
          vec2 ax=axisOf(vb,vec3(0.,0.,uH+2.),vec3(0.,0.,-1.));
          c=over(exhaustInk(vb,vec3(0.,0.,uH+2.),vec3(0.,0.,-1.),40.,6.,uT,uTime)*smoothstep(8.,10.,uH+2.-ax.y),c);
          gl_FragColor=finish(c);}`, ["uH", "uT", "uB"]);
      const body = (() => {
        const F = zAx([0, 0, 8]), out = [];
        out.push(ISO.tinted(ISO.T.paint, S(G.lathe([[0, 0], [0, 12], [70, 12], [70, 0]], F, P, { steps: 40 }), { tone: "hi" })));
        out.push(S(G.lathe([[70, 0], [70, 12], [78, 10], [78, 0]], F, P, { steps: 40 }), { tone: "mid" }));
        out.push(ISO.tinted(ISO.T.paint, S(G.lathe([[78, 0], [78, 10], [120, 10], [120, 0]], F, P, { steps: 40 }), { tone: "hi" })));
        out.push(S(G.lathe([[120, 0], [120, 11], [136, 10.5, 1], [148, 7, 1], [156, 0]], F, P, { smooth: true, steps: 40 }), { tone: "hi" }));
        for (const a of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) out.push(ISO.tinted(ISO.T.red, ISO.box((u, ww, y) => [Math.cos(a) * u - Math.sin(a) * y, Math.sin(a) * u + Math.cos(a) * y, 8 + ww], P, [11, 26], [0, 22], [-0.8, 0.8], "hi")));
        out.push(L(G.arcOf(F, 34, 12, P) + G.arcOf(F, 100, 10, P), { tone: "faint" }));
        out.push(S(G.lathe([[0, 0], [0, 9], [-6, 7], [-6, 0]], F, P, { steps: 24 }), { tone: "lo" }));
        return out.join("");
      })();
      const s = { go: o.go === "1", h: 0, v: 0, t: 0 };
      const draw = () => w.rebuild(el, s.h.toFixed(1), () => `<g transform="${K.translateAlong(P, [0, 0, s.h])}">${body}${!fx && (s.go || s.h > 0) ? flame(P, [0, 0, 2], 26 + 8 * Math.sin(s.t * 20), 7) : ""}</g>` + (lab ? ISO.word(K.iso([20, 0, 140 + s.h], P), s.go ? "lift-off" : "on the pad", "#555", { size: 13, anchor: "start" }) : ""));
      g.set = (p) => { if (p.go !== undefined) { s.go = !!+p.go; if (!s.go) { s.h = 0; s.v = 0; } } };
      s.T = 0; s.B = 0;
      g.update = (dt) => {
        s.t += dt;
        // thrust comes up in about 0.3 s; the billows build while the plume still reaches the pad, then drift and thin
        const calm = ISO.still();
        s.T = ISO.follow(s.T, s.go ? 1 : 0, dt, s.go ? 0.12 : 0.05, calm);
        s.B = ISO.follow(s.B, s.go ? 1 : 0, dt, s.go ? 0.35 : 1, calm);
        if (fx) fx.set({ uH: s.h, uT: s.T, uB: s.B }, s.T > 0.002 || s.B > 0.002);
        if (s.go && !ISO.still()) { const a = 9.81 * (1.4 * (1 + s.t * 0.05) - 1); s.v += a * dt * 4; s.h = Math.min(s.h + s.v * dt, 60); }
        draw();
        return s.go || s.T > 0 || s.B > 0;
      };
      g.readout = () => (s.go ? `thrust ≈ 1.4 × weight at lift-off, so it accelerates at about ${(0.4 * 9.81).toFixed(1)} m/s² · lighter every second as fuel burns, so faster still` : "on the pad · weight held up by the pad");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });

  // spacesat: a gold-foil box with a dish, antennas, and two solar wings that unfold.
  ISO.add({
    name: "spacesat", title: "Satellite", compare: "spacesat 480 270 380",
    about: "A satellite's gold-foil body, dish and antennas; its two solar wings fold out to face the Sun.",
    line: "spacesat cx cy size open=1 lab=1",
    demo: { line: "spacesat 480 270 380 open=0", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { open: 0 }, hold: "settle" }] },
    make([cx, cy, size = 380], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 0.9;
      const { P, g } = ISO.frame([[-110, -30, -20], [110, 30, -20], [0, 0, 70]], cx, cy, W, H, { azimuth: 40, elevation: 24 }, parent);
      const gold = ISO.tint("#f6dfa0", ["#c9a440", "#d6b55a", "#e2c676", "#ecd690"], "#6b5114");
      const statics = [ISO.tinted(gold, ISO.wbox(P, [-18, 18], [-18, 18], [0, 36], "hi"))];
      for (let z = 8; z < 36; z += 9) statics.push(`<path d="${K.sideSeam({ x: -18, y: -18, w: 36, d: 36, r: 0 }, z, P, 2)}" fill="none" stroke="#a0801c" stroke-width="0.6"/>`);
      const dishF = G.frameOf([0, 0, 36], [0.3, 0.3, 0.9], [0.7, -0.7, 0], [0, 0, 1]);
      statics.push(S(G.lathe([[0, 0], [0, 2], [8, 16, 1], [9, 18]], dishF, P, { smooth: true, steps: 40 }), { tone: "hi" }), S(G.disc(0, 14, 0.8, dishF, P, { steps: 10 }), { tone: "mid" }));
      statics.push(S(G.disc(0, 20, 0.6, G.frameOf([18, 0, 30], [1, 0, 0.4], [0, 1, 0], [0, 0, 1]), P, { steps: 8 }), { tone: "mid" }));
      g.innerHTML = `<g>${statics.join("")}</g><g data-part="wings"></g>`;
      const el = g.querySelector('[data-part="wings"]'), w = ISO.writer(), s = { f: o.open === "0" ? 0 : 1, fT: 0 }; s.fT = s.f;
      const blue = ISO.tint("#d4e2f6", ["#3b5c9a", "#4a6cad", "#5a7cbf", "#6b8dd0"], "#1d2f55");
      const wing = (sx, f) => {
        // Three panels fanning out from the body along ±x, folded flat against the side when f = 0.
        const out = [ISO.wbox(P, sx > 0 ? [18, 26] : [-26, -18], [-1, 1], [17, 19], "mid")];
        for (let i = 0; i < 3; i++) {
          const x0 = 26 + i * 26 * f + i * 1.5 * f, x1 = x0 + 26 * f + 0.8 * (1 - f), xs = sx > 0 ? [x0, x1] : [-x1, -x0];
          // A thin panel (1.2 thick) with its rows of cells on top.
          out.push(ISO.tinted(blue, ISO.wbox(P, xs, [-14, 14], [17.4, 18.6], "hi")));
          const cells = [];
          for (let k = 1; k < 4; k++) cells.push(K.segment([xs[0], -14 + k * 7, 18.65], [xs[1], -14 + k * 7, 18.65], P));
          out.push(`<path d="${cells.join("")}" stroke="#9fb6e0" stroke-width="0.5"/>`);
        }
        return out.join("");
      };
      const draw = () => w.rebuild(el, s.f.toFixed(3), () => wing(1, s.f) + wing(-1, s.f) + (lab ? ISO.word(K.iso([60 * s.f + 26, 0, 30], P), "solar panels", "#1d2f55", { size: 13, dy: -6 }) : ""));
      g.set = (p) => { if (p.open !== undefined) s.fT = +p.open ? 1 : 0; };
      g.update = (dt) => { s.f = ISO.follow(s.f, s.fT, dt, 0.6, ISO.still()); draw(); return s.f !== s.fT; };
      g.readout = () => (s.f > 0.9 ? "wings open · about 1.36 kW of sunlight falls on each square metre in orbit; panels turn about 30% of it into electricity" : "wings folded for launch");
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });

  // spacescope: a refracting telescope on an alt-azimuth mount on a tripod, tilting up toward the sky.
  ISO.add({
    name: "spacescope", title: "Telescope on a tripod", compare: "spacescope 480 250 320",
    about: "A refracting telescope: a big objective lens collects light, a small eyepiece magnifies; it tilts up on its mount.",
    line: "spacescope cx cy size alt=30 lab=1",
    demo: { line: "spacescope 480 260 340 alt=5", script: [{ set: {}, hold: 1 }, { set: { alt: 40 }, hold: "settle" }, { set: { alt: 15 }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 1.15;
      const { P, g } = ISO.frame([[-60, -60, 0], [60, 60, 0], [0, 0, 150], [70, 0, 140]], cx, cy, W, H, { azimuth: 50, elevation: 16 }, parent);
      const statics = [];
      for (let i = 0; i < 3; i++) { const a = (i * 2 * Math.PI) / 3 + 0.4, foot = [Math.cos(a) * 50, Math.sin(a) * 50, 0]; statics.push(`<path d="${K.pathOf([K.iso(foot, P), K.iso([0, 0, 82], P)])}" stroke="#5f656c" stroke-width="3" stroke-linecap="round"/>`, S(K.cylinder(foot[0], foot[1], 3, 0, 2, P, 14), { tone: "lo" })); }
      statics.push(S(K.cylinder(0, 0, 8, 82, 6, P, 28, 0.4), { tone: "mid" }), ISO.wbox(P, [-4, 4], [-10, 10], [88, 100], "mid"));
      g.innerHTML = `<g>${statics.join("")}</g><g data-part="tube"></g>`;
      const el = g.querySelector('[data-part="tube"]'), w = ISO.writer(), s = { alt: ISO.clamp(ISO.num(o, "alt", 30), 0, 70), aT: 0 }; s.aT = s.alt;
      const tube = (alt) => {
        const a = (alt * Math.PI) / 180, axis = [Math.cos(a), 0, Math.sin(a)], F = G.frameOf([-30 * Math.cos(a), 0, 96 - 30 * Math.sin(a)], axis, [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]);
        return ISO.tinted(ISO.T.paint, S(G.disc(0, 90, 7, F, P, { steps: 32 }), { tone: "hi" })) + S(G.disc(90, 98, 9, F, P, { steps: 32 }), { tone: "mid" }) + ISO.tinted(ISO.T.glass, S(G.disc(98, 98.6, 8, F, P, { steps: 28 }), { tone: "hi" })) +
          S(G.disc(-10, 0, 2.6, F, P, { steps: 16 }), { tone: "mid" }) + S(G.disc(-14, -10, 3.4, F, P, { steps: 16 }), { tone: "hi", lit: true }) +
          (lab ? ISO.word(K.iso(G.pointOf(F, 98, 12, Math.PI / 2), P), "objective lens", "#555", { size: 13, anchor: "start" }) + ISO.word(K.iso(G.pointOf(F, -14, 6, -Math.PI / 2), P), "eyepiece", "#555", { size: 13, anchor: "end" }) : "");
      };
      const draw = () => w.rebuild(el, s.alt.toFixed(2), () => tube(s.alt));
      g.set = (p) => { if (p.alt !== undefined) s.aT = ISO.clamp(+p.alt, 0, 70); };
      g.update = (dt) => { s.alt = ISO.follow(s.alt, s.aT, dt, 0.6, ISO.still()); draw(); return s.alt !== s.aT; };
      g.readout = () => `pointing ${s.alt.toFixed(0)}° above the horizon · magnification = objective focal length ÷ eyepiece focal length (900 mm ÷ 25 mm = 36×)`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
