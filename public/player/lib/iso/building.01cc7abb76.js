// "building cx cy width k=house|factory|shop|bank open=0..1 lights=0|1 lab=1 |sign lit=door|windows|roof|chimney|sign|columns"
// A building on its plot, one of four kinds, each built the way the real one is:
// house: brick-red tiled gable roof, chimney, front door with a step, sash windows; open swings the door in.
// factory: a sawtooth roof whose glazed sides face one way (even daylight), brick chimney smoking, a roller door that
// rolls up with open, a loading dock. shop: two storeys, a striped awning, a sign board (|sign or "SHOP"), a display
// window whose roller shutter rolls up with open. bank: three steps, a porch of five columns, entablature and pediment,
// double doors that open. lights=1 lights every window. lab=0 hides its words. 1 unit ≈ 0.1 m.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), INK = "#3c3f45";
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const BRICK = ISO.tint("#e9b9a4", ["#b9735a", "#c98468", "#d69a80", "#e0ab93"], "#5e2a18");
  const TILE = ["#8f3a2a", "#c9604a"], WALL = { house: "#f6e3c2", factory: "#e3e6ea", shop: "#fbf1dc", bank: "#efe9dc" };
  let uid = 0;
  // flat art on a wall: x along the wall, y down (= −z); the wall at y = y0 (front) or x = x0 (side)
  const front = (P, y0, svg) => `<g class="bd-face" transform="${ISO.faceMatrix(P, [0, y0, 0], 1)}">${svg}</g>`;
  const side = (P, x0, svg) => {
    const o = K.iso([x0, 0, 0], P), a = K.iso([x0, -1, 0], P), b = K.iso([x0, 0, -1], P);
    return `<g class="bd-face" transform="matrix(${a[0] - o[0]} ${a[1] - o[1]} ${b[0] - o[0]} ${b[1] - o[1]} ${o[0]} ${o[1]})">${svg}</g>`;
  };
  // a window: frame, glass (lights up), glazing bars, as art at (x, bottom z, width, height)
  const win = (x, z, w, h, bars = 1) => {
    const y = -z - h, out = [`<rect x="${x - 1.2}" y="${y - 1.2}" width="${w + 2.4}" height="${h + 2.4}" fill="#fdfdfb" stroke="${INK}"/>`, `<rect class="bd-glass" x="${x}" y="${y}" width="${w}" height="${h}" stroke="${INK}"/>`];
    if (bars) out.push(`<path d="M${x + w / 2} ${y}V${y + h}M${x} ${y + h / 2}H${x + w}" stroke="${INK}"/>`);
    return out.join("");
  };
  const rect = (x, z, w, h, fill, extra = "") => `<rect x="${x}" y="${-z - h}" width="${w}" height="${h}" fill="${fill}" stroke="${INK}" ${extra}/>`;
  const sill = (P, x, z, w, y0) => ISO.wbox(P, [x - 2, x + w + 2], [y0, y0 + 2], [z - 2.4, z - 1.2], "mid");
  // a door leaf hinged at (hx, y0), width dw, height dh, swung in by a (radians), clipped to its opening
  const leaf = (P, hx, y0, z0, dw, dh, a, dir = 1) => {
    const d = [Math.cos(a) * dir, -Math.sin(a)], n = [Math.sin(a) * dir, Math.cos(a)];
    const at = (u, w, z) => [hx + d[0] * u + n[0] * (w - 1.2) * dir, y0 + d[1] * u + n[1] * (w - 1.2), z];
    return ISO.box(at, P, [0, dw], [0, 1.2], [z0, z0 + dh], "mid") + K.dotsSvg([K.iso(at(dw - 3, 1.3, z0 + dh * 0.48), P)], { size: 1.2, tone: "mid" });
  };
  const opening = (P, x0, x1, y0, z0, z1) => K.pathOf([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]].map((p) => K.iso(p, P)), true);

  const KINDS = {
    house: {
      size: [120, 80], top: 98, base: { x: -76, y: -56, w: 152, d: 132, r: 6 }, sign: "",
      build(P, o) {
        const W = 60, D = 40, H = 56, out = [];
        out.push(named("walls", S(K.slabOf({ x: -W, y: -D, w: 2 * W, d: 2 * D, r: 0 }, 0, H, P, 1), { tone: "mid", inner: K.lineSvg(K.sideSeam({ x: -W, y: -D, w: 2 * W, d: 2 * D, r: 0 }, 4, P, 1), { tone: "faint" }) })));
        out.push(front(P, D, `<rect x="-60" y="-4" width="120" height="4" fill="#d9c9ad" stroke="none"/>`));
        out.push(named("windows", front(P, D, win(-46, 18, 22, 22) + win(26, 18, 22, 22)) + side(P, W, win(-12, 18, 24, 22)) + sill(P, -46, 18, 22, D) + sill(P, 26, 18, 22, D)));
        out.push(front(P, D, rect(-10, 0, 20, 36, "#3b3530")), `<g data-part="door" clip-path="url(#bd${uid}a)"></g>`, `<clipPath id="bd${uid}a"><path d="${opening(P, -10, 10, D, 0, 36)}"/></clipPath>`);
        out.push(front(P, D, `<rect x="-12" y="-38" width="24" height="38" fill="none" stroke="${INK}"/>`));
        out.push(ISO.tinted(ISO.T.road, ISO.wbox(P, [-16, 16], [D, D + 8], [0, 3], "mid")));                                       // the step
        // the gable roof: one prism with overhangs, tile courses on the near slope, the chimney through it
        const roof = [[-D - 7, H - 4], [D + 7, H - 4], [0, H + 36]];
        out.push(named("roof", ISO.prismX(P, roof, -W - 6, W + 6, TILE, WALL.house, "#5e2a18")));
        const k = K.cameraOf(P).k, rows = [];
        for (let i = 1; i < 8; i++) { const f = i / 8, y = D + 7 - (D + 7) * f, z = H - 4 + 40 * f; rows.push(K.pathOf([K.iso([-W - 6, y, z], P), K.iso([W + 6, y, z], P)])); }
        out.push(`<path d="${rows.join("")}" stroke="#6e2a1c" stroke-width="${(0.4 * k).toFixed(2)}"/>`);
        out.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-W - 6, W + 6], [D + 6, D + 8.4], [H - 7, H - 4.6], "mid")));                 // gutter
        out.push(named("chimney", ISO.tinted(BRICK, ISO.wbox(P, [28, 40], [-14, -2], [H + 14, H + 46], "mid") + ISO.wbox(P, [26.5, 41.5], [-15.5, -0.5], [H + 46, H + 49], "mid"))));
        return out.join("");
      },
      door(P, f) { return leaf(P, -10, 40, 0, 20, 36, f * 80 * Math.PI / 180); },
      say: (f) => `front door ${f < 0.02 ? "shut" : `open ${(f * 80).toFixed(0)}°`} · floor 12 m × 8 m = 96 m² · roof pitch 40°`,
    },
    factory: {
      size: [170, 90], top: 140, base: { x: -100, y: -60, w: 210, d: 132, r: 6 }, sign: "",
      build(P, o) {
        const W = 85, D = 45, H = 44, out = [];
        out.push(named("walls", ISO.tinted(ISO.T.paint, S(K.slabOf({ x: -W, y: -D, w: 2 * W, d: 2 * D, r: 0 }, 0, H, P, 1), { tone: "mid", inner: [10, 30].map((z) => K.lineSvg(K.sideSeam({ x: -W, y: -D, w: 2 * W, d: 2 * D, r: 0 }, z, P, 1), { tone: "faint" })).join("") }))));
        let ws = "";
        for (let i = 0; i < 4; i++) ws += win(-76 + i * 22, 16, 16, 14);
        out.push(named("windows", front(P, D, ws) + side(P, W, win(-30, 16, 20, 14) + win(10, 16, 20, 14))));
        out.push(front(P, D, rect(18, 0, 10, 26, "#7d8893") + rect(34, 0, 40, 38, "#2f3338")), `<g data-part="door"></g>`);
        out.push(ISO.tinted(ISO.T.road, ISO.wbox(P, [30, 78], [D, D + 14], [0, 6], "mid")));                                      // loading dock
        // the sawtooth roof: four teeth, drawn far to near, each with its glazing on the steep side facing +x
        const roof = [];
        for (let i = 0; i < 4; i++) {
          const x0 = -W + i * 42.5, x1 = x0 + 42.5;
          roof.push(ISO.prismY(P, [[x0, H], [x1, H + 22], [x1, H]], -D, D, ["#8d9096", "#d9dadd"], "#e9ebee", INK));
          let g = ""; for (let j = 0; j < 6; j++) g += win(-D + 2 + j * 14.4, H + 3, 11, 16, 0);
          roof.push(side(P, x1, g));
        }
        out.push(named("roof", roof.join("")));
        const C = [W + 18, -24];
        out.push(named("chimney", ISO.tinted(BRICK, S(K.cylinder(C[0], C[1], 13, 0, 10, P, 4), { tone: "mid" }) + S(K.cylinder(C[0], C[1], 8, 10, 120, P, 32), { tone: "mid", inner: [40, 80].map((z) => K.lineSvg(K.ring(C[0], C[1], 8, z, P, 40), { tone: "lo" })).join("") }) + S(K.cylinder(C[0], C[1], 9.4, 130, 5, P, 32), { tone: "mid" }))));
        return out.join("");
      },
      // the roller door coils up into its box over the opening
      door(P, f) {
        const h = 38 * (1 - f), sl = [];
        for (let z = 38 - 3; z > 38 - h; z -= 3) sl.push(`M34 ${-z}H74`);
        return front(P, 45, (h > 0.5 ? rect(34, 38 - h, 40, h, "#c7ccd2") + `<path d="${sl.join("")}" stroke="#8d9399"/>` : "") + rect(32, 38, 44, 5, "#9aa1a8"));
      },
      smoke: [103, -24, 135],
      say: (f) => `roller door ${f < 0.02 ? "down" : `${(f * 100).toFixed(0)}% up`} · floor 17 m × 9 m · sawtooth roof glazing faces one way for even daylight`,
    },
    shop: {
      size: [130, 70], top: 92, base: { x: -80, y: -50, w: 160, d: 118, r: 6 }, sign: "SHOP",
      build(P, o, text) {
        const W = 65, D = 35, H = 86, out = [];
        out.push(named("walls", S(K.slabOf({ x: -W, y: -D, w: 2 * W, d: 2 * D, r: 0 }, 0, H, P, 1), { tone: "mid", inner: K.lineSvg(K.sideSeam({ x: -W, y: -D, w: 2 * W, d: 2 * D, r: 0 }, 44, P, 1), { tone: "faint" }) })));
        out.push(S(K.slabOf({ x: -W - 2, y: -D - 2, w: 2 * W + 4, d: 2 * D + 4, r: 0 }, H, 4, P, 1), { tone: "mid" }));            // parapet coping
        out.push(named("windows", front(P, D, win(-54, 6, 60, 30, 0) + win(-50, 62, 20, 16) + win(-10, 62, 20, 16) + win(30, 62, 20, 16)) + side(P, W, win(-14, 62, 28, 16)) +
          sill(P, -50, 62, 20, D) + sill(P, -10, 62, 20, D) + sill(P, 30, 62, 20, D)));
        out.push(front(P, D, rect(18, 0, 24, 36, "#9a6a3e") + `<rect class="bd-glass" x="21" y="-33" width="18" height="22" stroke="${INK}"/>` + `<circle cx="38" cy="-17" r="1" fill="${INK}"/>`), `<g data-part="door"></g>`);
        out.push(ISO.wbox(P, [-40, -16], [-20, -4], [H + 4, H + 14], "mid"), ISO.wbox(P, [20, 28], [-26, -18], [H + 4, H + 10], "mid"));      // a cooling unit and a vent on the roof
        // the sign board on two brackets, its words printed on its face
        out.push(named("sign", ISO.wbox(P, [-44, 44], [D, D + 2.4], [47, 59], "hi") + front(P, D + 2.4, `<text x="0" y="-49.6" text-anchor="middle" fill="#b8322a" style="font:700 9px 'Helvetica Neue',Arial,sans-serif">${text}</text>`)));
        // the striped awning sloping out from the wall, and its valance
        const k = K.cameraOf(P).k, st = [], n = 12, x0 = -W + 4, x1 = W - 4, aw = (x1 - x0) / n;
        for (let i = 0; i < n; i++) {
          const a = x0 + i * aw, b = a + aw, c = i % 2 ? "#fdfdfb" : "#d6463a";
          st.push(`<path d="${K.pathOf([[a, D, 44], [b, D, 44], [b, D + 16, 37], [a, D + 16, 37]].map((p) => K.iso(p, P)), true)}" fill="${c}" stroke="${c}" stroke-width="0.4"/>`);
          st.push(`<path d="${K.pathOf([[a, D + 16, 37], [b, D + 16, 37], [b, D + 16, 33.5], [a + aw / 2, D + 16, 32], [a, D + 16, 33.5]].map((p) => K.iso(p, P)), true)}" fill="${c}" stroke="#8f2a22" stroke-width="0.6"/>`);
        }
        st.push(`<path d="${K.pathOf([[x0, D, 44], [x1, D, 44], [x1, D + 16, 37], [x0, D + 16, 37]].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#8f2a22" stroke-width="${(0.3 * k + 0.4).toFixed(2)}"/>`);
        out.push(named("awning", st.join("")));
        return out.join("");
      },
      door(P, f) {
        const h = 30 * (1 - f), sl = [];
        for (let z = 36 - 2.5; z > 36 - h; z -= 2.5) sl.push(`M-54 ${-z}H6`);
        return front(P, 35, (h > 0.5 ? rect(-54, 36 - h, 60, h, "#c7ccd2") + `<path d="${sl.join("")}" stroke="#8d9399"/>` : "") + rect(-56, 36, 64, 4, "#9aa1a8"));
      },
      say: (f) => `shutter ${f < 0.02 ? "down: shop shut" : `${(f * 100).toFixed(0)}% up${f > 0.98 ? ": shop open" : ""}`} · shop front 13 m wide, two storeys`,
    },
    bank: {
      size: [170, 100], top: 100, base: { x: -100, y: -64, w: 200, d: 132, r: 6 }, sign: "BANK",
      build(P, o, text) {
        const out = [];
        for (let i = 0; i < 3; i++) out.push(ISO.tinted(ISO.T.road, S(K.slabOf({ x: -85 + i * 5, y: -50 + i * 5, w: 170 - i * 10, d: 100 - i * 10, r: 0 }, i * 4, 4, P, 1), { tone: "mid" })));
        out.push(named("walls", S(K.slabOf({ x: -70, y: -40, w: 140, d: 52, r: 0 }, 12, 60, P, 1), { tone: "mid", inner: [30, 50].map((z) => K.lineSvg(K.sideSeam({ x: -70, y: -40, w: 140, d: 52, r: 0 }, z, P, 1), { tone: "faint" })).join("") })));
        out.push(named("windows", front(P, 12, win(-56, 26, 16, 26) + win(40, 26, 16, 26)) + side(P, 70, win(-10, 26, 16, 26))));
        out.push(front(P, 12, rect(-14, 12, 28, 40, "#3b3530")), `<g data-part="door" clip-path="url(#bd${uid}a)"></g>`, `<clipPath id="bd${uid}a"><path d="${opening(P, -14, 14, 12, 12, 52)}"/></clipPath>`);
        // five columns on the porch, far to near
        const cols = [];
        for (let i = 0; i < 5; i++) {
          const F = G.frameOf([-60 + i * 30, 28, 12], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
          cols.push(ISO.wbox(P, [-67 + i * 30, -53 + i * 30], [21, 35], [12, 14], "mid") + S(G.solidOf([[2, 5.6], [3.2, 4.8, 1], [46, 4.4], [47.4, 5.4, 1], [48, 6]], F, P), { tone: "hi" }) +
            K.fadedSvg(G.ribsOf(F, 4, 45, 4.6, 14, P, { fade: [0.1, 0.5], seams: true }), { tone: "faint" }) + ISO.wbox(P, [-67 + i * 30, -53 + i * 30], [21, 35], [60, 62], "mid"));
        }
        out.push(named("columns", cols.join("")));
        out.push(named("sign", ISO.wbox(P, [-74, 74], [-44, 38], [62, 72], "hi") + front(P, 38, `<text x="0" y="-64.2" text-anchor="middle" fill="#6e6250" style="font:700 7px 'Times New Roman',serif;letter-spacing:3px">${text}</text>`)));
        out.push(named("roof", ISO.prismY(P, [[-76, 72], [76, 72], [0, 94]], -46, 39, ["#b8b1a0", "#efe9dc"], "#f6f2e8", "#6e6250") + front(P, 39, `<path d="M-60 -74.5H60L0 -91Z" fill="none" stroke="#9a8f78"/>`)));
        return out.join("");
      },
      door(P, f) { const a = f * 75 * Math.PI / 180; return leaf(P, -14, 12, 12, 14, 40, a, 1) + leaf(P, 14, 12, 12, 14, 40, a, -1); },
      say: (f) => `doors ${f < 0.02 ? "shut" : `open ${(f * 75).toFixed(0)}°`} · five columns on a three-step plinth · front 17 m wide`,
    },
  };

  ISO.add({
    name: "building", title: "Buildings", compare: "building 480 280 400 k=shop",
    about: "A house, factory, shop or bank built as the real thing: walls, windows, roof and door; open opens its door or rolls up its shutter, lights lights the windows.",
    line: "building cx cy width k=house|factory|shop|bank open=0..1 lights=0|1 lab=1 |sign lit=walls|windows|roof|chimney|sign|awning|columns",
    demo: { line: "building 480 280 400 k=shop", script: [{ set: { open: 1 }, hold: "settle" }, { set: { lights: 1, lit: "windows" }, hold: 2 }, { set: { open: 0, lights: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const kind = KINDS[o.k] ? o.k : "house", B = KINDS[kind], lab = o.lab !== "0", W = size * 1.65, H = size * 1.05;
      uid++;
      const pts = [...K.boxCorners(B.base, -10, 0), [0, 0, B.top]];
      if (B.smoke) pts.push([B.smoke[0] - 20, B.smoke[1], B.smoke[2] + 40]);
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 56, elevation: 28, pad: 6 }, parent);
      const text = lab ? (t || B.sign) : "";
      g.innerHTML = `<style>.bd-face *{vector-effect:non-scaling-stroke;stroke-width:0.9px}.bd-glass{fill:#d7e8f5;transition:fill .8s}.bd-on .bd-glass{fill:#ffd978}@media (prefers-reduced-motion:reduce){.bd-glass{transition:none}}</style>` +
        `<g style="--anatomy-paper:${WALL[kind]};--anatomy-top:${WALL[kind]}">${ISO.baseboard(P, B.base, { h: 6, feet: 3, tint: ISO.T.road })}${B.build(P, o, text)}</g><g data-part="smoke"></g>`;
      if (!g.querySelector('[data-part="door"]')) g.insertAdjacentHTML("beforeend", `<g data-part="door"></g>`);
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      // the factory chimney smokes all the time: WebGL puffs, or grey discs without it
      if (B.smoke) {
        const [x, y, z] = B.smoke, list = Array.from({ length: 6 }, (_, i) => { const f = i / 6; return [x - f * 34, y + f * 4, z + f * 40, 5 + f * 10, 0.55 * Math.sin(Math.PI * (f + 0.08)) * (1 - 0.3 * f)]; });
        const fx = ISO.puffsFx(g, P, W, H, el.smoke, 6);
        if (fx) fx(list);
        else el.smoke.innerHTML = `<g fill="#cfd6dd" stroke="#9aa3ad" stroke-width="0.5">${list.map(([px, py, pz, r, a]) => { const c = K.iso([px, py, pz], P); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(r * K.cameraOf(P).k * 0.7).toFixed(1)}" opacity="${(a * 0.8).toFixed(2)}"/>`; }).join("")}</g>`;
      }
      const s = { open: ISO.clamp(ISO.num(o, "open", 0), 0, 1) }, want = { open: s.open };
      let lights = o.lights === "1", lit = o.lit || "";
      const draw = () => {
        w.rebuild(el.door, s.open.toFixed(2), () => B.door(P, Math.round(s.open * 100) / 100));
        g.classList.toggle("bd-on", lights);
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.open !== undefined) want.open = ISO.clamp(+p.open || 0, 0, 1); if (p.lights !== undefined) lights = !!+p.lights; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => { s.open = ISO.follow(s.open, want.open, dt, 0.45, ISO.still()); draw(); return s.open !== want.open; };
      g.readout = () => `${kind}: ${B.say(s.open)} · lights ${lights ? "on" : "off"}`;
      draw();
      return g;
    },
  });
})();
