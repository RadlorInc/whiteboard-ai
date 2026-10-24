// "piston cx cy height k=burn run=0|1 stroke=1..4 lab=1 lit=piston|rod|crank|intake|exhaust|plug|cams" — a single-
// cylinder four-stroke engine cut open down the middle. Block with its bore and crankcase, head with a pent-roof
// chamber, two overhead cams pressing bucket tappets on spring-loaded valves, a spark plug, a piston with three rings
// on a wrist pin, an I-beam connecting rod and a crank with its counterweight over an oil sump. Everything is driven by
// one crank angle: the piston from the slider-crank formula, each valve from its own cam lobe (cams turn at half crank
// speed), the flame from the spark 10° before top dead centre. stroke=n plays stroke n (1 intake, 2 compression,
// 3 power, 4 exhaust); run=1 keeps it turning; k=burn starts just after the spark. 1 unit = 1 mm: bore 60, stroke 56.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const RB = 30, RP = 29.6, CR = 28, LR = 96, DECK = 145, HB = 146, HT = 196, WF = 160, CAMZ = 186, VX = 18, RBASE = 7, LIFT = 6;
  const PIN_UP = 18, PIN_DN = 24, YB = -36, TAU = Math.PI * 2, D2R = Math.PI / 180;
  const INK = "#3c3f45", CUT = "#cdd6e0", CUTD = "#9fb0c2", AL = ["#a9aeb5", "#e4e6e9"], SEC = "#5b6470";
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const named = (n, svg) => `<g data-name="${n}">${svg}</g>`;
  const roof = (x) => HB + 8 * ISO.clamp((RB - Math.abs(x)) / 18, 0, 1);
  const pinZ = (th) => CR * Math.cos(th * D2R) + Math.sqrt(LR * LR - (CR * Math.sin(th * D2R)) ** 2);
  const STROKES = ["power", "exhaust", "intake", "compression"], NUM = { intake: 1, compression: 2, power: 3, exhaust: 4 };
  const strokeOf = (th) => STROKES[Math.floor((((th % 720) + 720) % 720) / 180)];
  // cam lobes (cam angle = crank / 2, both clockwise): nose straight down at the middle of each valve event
  const CAMS = { exhaust: { x: VX, mid: 255 / 2 }, intake: { x: -VX, mid: 465 / 2 } }, HALF = 58 * D2R;
  const lobe = (d) => RBASE + LIFT * (Math.abs(d) < HALF ? Math.cos((Math.PI / 2) * (d / HALF)) ** 2 : 0);
  // the lobe turned clockwise by psi: a point at local angle d from the nose sits at world angle -90° + d - (psi - mid)
  const camOutline = (c, psi) => Array.from({ length: 72 }, (_, i) => { const d = -Math.PI + (i / 72) * TAU, a = -Math.PI / 2 + d - (psi - c.mid) * D2R; return [c.x + Math.cos(a) * lobe(d), CAMZ + Math.sin(a) * lobe(d)]; });
  const liftOf = (c, th) => Math.max(0, ...camOutline(c, th / 2).map(([, z]) => CAMZ - z)) - RBASE;
  // a coil spring standing on the floor plane round a vertical axis: back half and front half
  function zcoil(cx, r, z0, z1, turns, P) {
    const back = [], front = [], n = Math.round(turns * 18);
    let run = [], near = null;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * turns * TAU, p = K.iso([cx + Math.cos(a) * r, Math.sin(a) * r, z0 + ((z1 - z0) * i) / n], P), f = Math.cos(a) * 0.34 + Math.sin(a) * 0.94 > 0;
      if (near === null) near = f;
      if (f !== near) { run.push(p); (near ? front : back).push(K.pathOf(run)); run = [p]; near = f; continue; }
      run.push(p);
    }
    if (run.length > 1) (near ? front : back).push(K.pathOf(run));
    return { back: back.join(""), front: front.join("") };
  }
  const stroke = (d, w, c = INK) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const face = (P, pts, fill, w = 0.8) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, 0, z], P)), true)}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;

  // The block in section: liner walls, crankcase, a U open at the top (the head closes it), with its back wall.
  const BLOCK = [[-RB - 14, DECK], [-RB, DECK], [-RB, 50], [-52, 30], [-52, -36], [52, -36], [52, 30], [RB, 50], [RB, DECK], [RB + 14, DECK], [RB + 14, 56], [58, 34], [58, -40], [-58, -40], [-58, 34], [-RB - 14, 56]];
  const HEAD = [[-RB - 14, HB], [-RB, HB], [-12, HB + 8], [12, HB + 8], [RB, HB], [RB + 14, HB], [RB + 14, HT], [34, HT], [34, WF], [6, WF], [6, HT], [-6, HT], [-6, WF], [-34, WF], [-34, HT], [-RB - 14, HT]];
  function staticBack(P) {
    const BASE = { x: -80, y: -60, w: 160, d: 80, r: 6 }, out = [ISO.tinted(ISO.T.wood, ISO.baseboard(P, BASE, { h: 7, feet: 4 }))];
    // two cast feet under the sump, bolted down
    for (const x of [-48, 30]) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x, x + 18], [-44, -2], [0, 12], "mid")), D([K.iso([x + 4, -6, 12], P), K.iso([x + 14, -6, 12], P)], { size: 0.7 }));
    const Z0 = 12 + 30;                                                        // the engine's z = 0 sits 42 above the board
    return { out, Z0 };
  }
  ISO.add({
    name: "piston", title: "Four-stroke engine", compare: "piston 480 270 440 k=burn",
    about: "A single-cylinder four-stroke engine cut in half: the crank drives the piston, the half-speed cams open the intake and exhaust valves, the plug fires the squeezed mixture.",
    line: "piston cx cy height k=burn run=0|1 stroke=1..4 lab=1 lit=piston|rod|crank|intake|exhaust|plug|cams",
    demo: { line: "piston 480 270 440", script: [{ set: { stroke: 1 }, hold: "settle" }, { set: { stroke: 2 }, hold: "settle" }, { set: { stroke: 3, lit: "plug" }, hold: "settle" }, { set: { stroke: 4, lit: "" }, hold: "settle" }, { set: { run: 1 }, hold: 5 }, { set: { run: 0 }, hold: "settle" }] },
    make([cx, cy, size = 440], o, t, parent) {
      const lab = o.lab !== "0", H = size * 1.08, W = size * 1.5, ZO = 42;   // engine z + ZO = world z (the stand)
      const w3 = (x, y, z) => [x, y, z + ZO];
      const { P, g } = ISO.frame([w3(-80, -60, -ZO - 11), w3(80, 20, -ZO - 11), w3(-80, -60, -ZO), w3(-70, YB - 4, 228), w3(84, 0, 170), w3(-84, 0, 170), w3(60, 20, -ZO)], cx, cy, W, H, { azimuth: 70, elevation: 16, pad: 6 }, parent);
      // every engine-space point goes through Q: x, y, z (engine) → board
      const Q = { ...P, origin: K.iso([0, 0, ZO], P) };
      const fr = K.cameraOf(P).k;

      // ── static back: stand, block, head, back wall, camshafts, sump, manifolds
      const st = staticBack(P).out;
      st.push(ISO.prismY(Q, [[-62, -40], [62, -40], [60, -60], [-60, -60]], YB - 4, 0, AL, CUT, INK));    // the sump pan
      st.push(face(Q, [[-58, -40], [58, -40], [58, -46], [-58, -46]], "#f1d48a", 0.6));                   // oil in the sump, cut
      st.push(ISO.wbox(Q, [-58, 58], [YB - 4, YB], [-40, HT + 7], "mid"));                                    // the back wall of the cut
      st.push(`<path d="${K.pathOf([[-RB, 50], [RB, 50], [RB, DECK], [-RB, DECK]].map(([x, z]) => K.iso([x, YB, z], Q)), true)}" fill="url(#pst-bore)" stroke="none"/>`);
      st.push(ISO.prismY(Q, BLOCK, YB, 0, AL, CUT, INK));
      st.push(ISO.wbox(Q, [-RB - 14, RB + 14], [YB, 0], [DECK, HB], "lo"));                                 // the head gasket
      st.push(ISO.prismY(Q, HEAD, YB, 0, AL, CUT, INK));
      // camshafts from the back wall out to the lobes, the main journal from the back wall to the web
      for (const c of Object.values(CAMS)) st.push(ISO.tinted(ISO.T.steel, S(G.disc(YB, -5, 4, yAx([c.x, 0, CAMZ]), Q), { tone: "mid" })));
      st.push(ISO.tinted(ISO.T.steel, S(G.disc(YB, -14, 10, yAx([0, 0, 0]), Q), { tone: "mid" })));
      // intake runner on the left, exhaust pipe on the right, each on a flange bolted to the head's side (the head is an
      // ISO.prismY, which audit.mjs can't see, so it reports these four as loose; the same for the valves in their guides)
      st.push(ISO.tinted(ISO.T.steel, ISO.wbox(Q, [-RB - 18, -RB - 14], [-24, -4], [148, 162], "mid") + S(G.disc(-84, -RB - 18, 6, G.frameOf([0, -14, 155], [1, 0, 0], [0, 1, 0], [0, 0, 1]), Q), { tone: "mid" })));
      st.push(ISO.tinted(ISO.T.copper, ISO.wbox(Q, [RB + 14, RB + 18], [-24, -4], [148, 162], "mid") + S(G.disc(RB + 18, 84, 6, G.frameOf([0, -14, 155], [1, 0, 0], [0, 1, 0], [0, 0, 1]), Q), { tone: "mid" })));
      const back = st.join("");

      // ── the section faces drawn over the moving parts: block walls and head, with ports, guides, jackets and bolts
      const sec = [];
      sec.push(face(Q, BLOCK, CUT, 1));
      for (const sx of [-1, 1]) {
        sec.push(face(Q, [[sx * (RB + 4), 120], [sx * (RB + 10), 120], [sx * (RB + 10), 72], [sx * (RB + 4), 76]], "#cfe3f3", 0.7));   // coolant jacket
        sec.push(stroke(K.pathOf([[sx * (RB + 7), DECK - 2], [sx * (RB + 7), 124]].map(([x, z]) => K.iso([x, 0, z], Q))), 2.2 * fr, SEC));            // head bolt
      }
      sec.push(face(Q, HEAD, CUT, 1));
      // ports: intake from the left face down to its seat, exhaust from its seat out to the right face
      sec.push(face(Q, [[-RB - 14, 150], [-RB - 14, 159], [-26, 158], [-12, HB + 8.6], [-24, HB + 5], [-RB + 2, 150]], "#dfe8f1", 0.8));
      sec.push(face(Q, [[RB + 14, 150], [RB + 14, 159], [26, 158], [12, HB + 8.6], [24, HB + 5], [RB - 2, 150]], "#f3e2d6", 0.8));
      for (const c of Object.values(CAMS)) sec.push(face(Q, [[c.x - 2.2, WF], [c.x + 2.2, WF], [c.x + 2.2, roof(c.x) + 3], [c.x - 2.2, roof(c.x) + 3]], CUTD, 0.6));   // valve guides
      sec.push(face(Q, [[-3.6, HT], [3.6, HT], [3.6, HB + 8], [-3.6, HB + 8]], CUTD, 0.6));                                              // plug bore
      for (const x of [-RB - 7, RB + 7]) sec.push(stroke(K.pathOf([[x, HT - 2], [x, HB + 2]].map(([a, z]) => K.iso([a, 0, z], Q))), 2.2 * fr, SEC));
      // cam covers on top of each well
      for (const [a, b] of [[-36, -4], [4, 36]]) sec.push(ISO.wbox(Q, [a, b], [YB, 0], [HT, HT + 6], "mid"), D([K.iso([a + 3, -3, HT + 6], Q), K.iso([b - 3, -3, HT + 6], Q)], { size: 0.6 }));

      // ── moving parts
      const pistonSvg = (() => {
        const z0 = pinZ(0), ring = Array.from({ length: 25 }, (_, i) => [Math.cos((i / 24) * Math.PI) * RP, -Math.sin((i / 24) * Math.PI) * RP]);
        const out = [S(K.extrude(ring, z0 - PIN_DN, PIN_UP + PIN_DN, Q), { tone: "hi" })];
        const top = z0 + PIN_UP, bot = z0 - PIN_DN;
        out.push(face(Q, [[-RP + 4, bot], [RP - 4, bot], [RP - 4, top - 9], [-RP + 4, top - 9]], "#b9c2cc", 0.7));     // the hollow skirt
        out.push(face(Q, [[-11, z0 - 7], [11, z0 - 7], [11, z0 + 7], [-11, z0 + 7]], CUT, 0.7));                        // pin bosses
        for (const dz of [3, 6.5, 10]) for (const sx of [-1, 1]) out.push(face(Q, [[sx * RP, top - dz], [sx * (RP - 3), top - dz], [sx * (RP - 3), top - dz - 1.8], [sx * RP, top - dz - 1.8]], dz === 10 ? "#7d8792" : "#5b6470", 0.4));   // rings in their grooves
        return out.join("");
      })();
      const pinSvg = (() => { const z0 = pinZ(0), F = yAx([0, 0, z0]); return ISO.tinted(ISO.T.steel, S(G.ringBand(-1, 3.4, 2.4, 5, F, Q), { tone: "hi" })); })();
      const valveSvg = (c) => {
        const F = zAx([c.x, 0, 0]), seat = roof(c.x), top = CAMZ - RBASE;
        return ISO.tinted(ISO.T.steel, S(G.solidOf([[seat - 1.6, 8.6], [seat + 0.4, 8.6], [seat + 2.6, 3.4, 1], [seat + 5, 1.6]], F, Q), { tone: "hi" }) +
          S(K.cylinder(c.x, 0, 1.6, seat + 5, top - 7 - seat - 5, Q, 14), { tone: "hi" }) + S(K.cylinder(c.x, 0, 5.2, top - 8, 1.6, Q, 22), { tone: "mid" }) +
          S(K.cylinder(c.x, 0, 6.4, top - 6.4, 6.4, Q, 26, 0.4), { tone: "hi" }));
      };
      const memo = new Map(), node = (svg) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = svg; return e; };
      const crankNode = (q) => {
        const key = `c${q}`;
        if (memo.has(key)) return memo.get(key);
        const th = q * 3, a = th * D2R, pin = [CR * Math.sin(a), CR * Math.cos(a)], zp = pinZ(th);
        // the web: the hull of the counterweight sector opposite the pin and a boss round the pin
        const cw = [];
        for (let i = 0; i <= 18; i++) { const b = Math.PI / 2 - a + Math.PI - 1.1 + (2.2 * i) / 18; cw.push([Math.cos(b) * 32, Math.sin(b) * 32]); }
        for (let i = 0; i <= 12; i++) { const b = Math.PI / 2 - a - 1.2 + (2.4 * i) / 12; cw.push([pin[0] + Math.cos(b) * 11 - 0, pin[1] + Math.sin(b) * 11]); }
        const crank = ISO.prismY(Q, ISO.hullOf(cw), -14, -8, ["#8d9096", "#d9dadd"], "#c9ccd1", INK, D([K.iso([Math.cos(Math.PI / 2 - a + Math.PI) * 24, -8, Math.sin(Math.PI / 2 - a + Math.PI) * 24], Q)], { size: 1.6, tone: "lo" })) +
          ISO.tinted(ISO.T.steel, S(G.disc(-8, -6, 8, yAx([0, 0, 0]), Q), { tone: "mid" }));
        const pinBody = ISO.tinted(ISO.T.steel, S(G.disc(-8, 4, 6, yAx([pin[0], 0, pin[1]]), Q), { tone: "hi" }));
        // the I-beam rod from the pin eye to the big end, with its cap and two bolts
        const dir = [pin[0] - 0, pin[1] - zp], L = Math.hypot(...dir), u = [dir[0] / L, dir[1] / L], n = [-u[1], u[0]];
        const circ = (c, r) => Array.from({ length: 20 }, (_, i) => [c[0] + Math.cos((i / 20) * TAU) * r, c[1] + Math.sin((i / 20) * TAU) * r]);
        const rodOut = ISO.hullOf([...circ([0, zp], 8), ...circ(pin, 13)]);
        const at = (s, l) => [u[0] * s + n[0] * l, zp + u[1] * s + n[1] * l];
        const web2 = [at(10, -2.4), at(L - 15, -4), at(L - 15, 4), at(10, 2.4)];
        const capLine = [at(L - 2, -12.6), at(L - 2, 12.6)];
        const rod = ISO.prismY(Q, rodOut, -3, 3, ["#8d9096", "#d9dadd"], "#e9eaec", INK,
          face2(web2) + stroke(K.pathOf(capLine.map(([x, z]) => K.iso([x, 3, z], Q))), 0.9) + D(capLine.map(([x, z], i) => K.iso([x * 0 + at(L - 2, i ? 10 : -10)[0], 3, at(L - 2, i ? 10 : -10)[1]], Q)), { size: 1.3, tone: "mid" }));
        function face2(pts) { return `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, 3, z], Q)), true)}" fill="#c3c6cb" stroke="${INK}" stroke-width="0.6"/>`; }
        const pinEnd = ISO.tinted(ISO.T.steel, S(G.disc(3, 5, 5, yAx([pin[0], 0, pin[1]]), Q), { tone: "hi" }));
        const v = [node(crank), node(pinBody), node(rod + pinEnd)];
        memo.set(key, v);
        return v;
      };
      const camNode = (name, q) => {
        const key = `${name}${q}`;
        if (memo.has(key)) return memo.get(key);
        const c = CAMS[name], psi = q;                                         // q = cam angle in whole degrees
        const lobeSvg = ISO.prismY(Q, camOutline(c, psi), -5, 5, ["#8d9096", "#d9dadd"], "#eceef0", INK) + ISO.tinted(ISO.T.steel, S(G.disc(5, 7, 3, yAx([c.x, 0, CAMZ]), Q), { tone: "mid" }));
        const v = node(lobeSvg);
        memo.set(key, v);
        return v;
      };
      const springNode = (name, q) => {
        const key = `s${name}${q}`;
        if (memo.has(key)) return memo.get(key);
        const c = CAMS[name], top = CAMZ - RBASE - 8 - q / 4, co = zcoil(c.x, 4.6, WF, top, 4.5, Q);
        const v = [node(stroke(co.back, 1.6 * fr, "#5b6470")), node(stroke(co.front, 1.6 * fr, "#2f343a"))];
        memo.set(key, v);
        return v;
      };
      const plug = (() => {
        const F = zAx([0, 0, 0]);
        return ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 3.2, HB + 6, HT - HB - 6, Q, 18), { tone: "mid" }) + S(G.prismOf(F, Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3 + 0.3) * 6, Math.sin(i * Math.PI / 3 + 0.3) * 6]), HT + 6, HT + 12, Q), { tone: "mid" })) +
          S(G.solidOf([[HT + 12, 3.8], [HT + 14, 3.8], [HT + 15, 3.2], [HT + 17, 3.8], [HT + 18, 3.2], [HT + 20, 3.8], [HT + 21, 3.2], [HT + 23, 3.6], [HT + 27, 2.4]], F, Q), { tone: "hi" }) +
          ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 1.8, HT + 27, 4, Q, 14), { tone: "mid" })) + ISO.tinted(ISO.T.steel, S(K.cylinder(0, 0, 3.4, HT, 6, Q, 18), { tone: "hi" }));
      })();
      const lead = stroke(K.pathOf([[0, -1, HT + 31], [0, -6, HT + 36], [-14, -14, HT + 38], [-36, -26, HT + 24], [-50, YB, HT + 7]].map((p) => K.iso(p, Q))), 2.4 * fr, "#2f343a");
      const roofPts = (zc) => [[-RP, zc], [RP, zc], [RB, HB], [12, HB + 8], [-12, HB + 8], [-RB, HB]];

      const words = !lab ? "" : [
        ISO.word(K.iso([-RB - 14, 0, 155], Q), "intake", "#2b5cc4", { size: 14, anchor: "end", dy: -10 }),
        ISO.word(K.iso([RB + 60, 0, 160], Q), "exhaust", "#a04a1c", { size: 14, anchor: "start", dy: -8 }),
        ISO.word(K.iso([0, 0, HT + 34], Q), "spark plug", "#555", { size: 14, anchor: "start", dy: -4 }),
        ISO.word(K.iso([60, 0, 4], Q), "crank", "#555", { size: 14, anchor: "start" }),
        ISO.word(K.iso([60, 0, 70], Q), "piston", "#555", { size: 14, anchor: "start" }),
      ].join("");
      const defs = `<defs><linearGradient id="pst-bore" x1="0" x2="1"><stop offset="0" stop-color="#b7bdc5"/><stop offset=".45" stop-color="#e7e9ec"/><stop offset="1" stop-color="#9ea5ae"/></linearGradient></defs>`;
      g.innerHTML = defs + `<g>${back}</g>` +
        `<g data-name="crank"><g data-part="crank"></g></g><g data-name="crank"><g data-part="pinb"></g></g>` +
        `<g data-name="piston"><g data-part="piston">${pistonSvg}</g></g><g data-name="rod"><g data-part="rod"></g></g><g data-name="piston"><g data-part="pin">${pinSvg}</g></g>` +
        `<g data-part="flame"></g><g data-part="sec">${sec.join("")}</g>` +
        `<g data-name="intake"><g data-part="sbi"></g></g><g data-name="exhaust"><g data-part="sbe"></g></g>` +
        `<g data-name="cams"><g data-part="ci"></g><g data-part="ce"></g></g>` +
        `<g data-name="intake"><g data-part="vi">${valveSvg(CAMS.intake)}</g><g data-part="sfi"></g></g><g data-name="exhaust"><g data-part="ve">${valveSvg(CAMS.exhaust)}</g><g data-part="sfe"></g></g>` +
        `<g data-name="plug">${plug}<g data-part="spark"></g></g>${lead}<g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), lights = [...g.querySelectorAll("[data-name]")];
      // the burning gas: a shader in the plane of the cut, masked to the chamber above the crown; SVG fallback below
      const fx = ISO.gl(g, P, W, H, el.sec, `uniform float uB;uniform float uZ;uniform float uR;
        void main(){vec2 vb=viewOf(gl_FragCoord.xy);vec3 p=onWallY(vb,0.);p.z-=${ZO.toFixed(1)};
          float roofZ=${HB.toFixed(1)}+8.*clamp((${RB.toFixed(1)}-abs(p.x))/18.,0.,1.);
          float m=window(p.x,-${(RP - 0.8).toFixed(1)},${(RP - 0.8).toFixed(1)},.5)*window(p.z,uZ+.8,roofZ-.6,.5);
          float n=fbm2(p.xz*.13+vec2(0.,-uTime*2.5));
          float d=length(vec2(p.x,p.z-${(HB + 7).toFixed(1)}))/max(uR,1.);
          float heat=uB*smoothstep(1.2,.45,d+.3*(n-.5));
          vec3 col=mix(vec3(1.,.5,.12),vec3(1.,.92,.62),smoothstep(.45,1.,heat));
          gl_FragColor=finish(inkFor(mix(vec3(1.),col,smoothstep(0.,.3,heat)),0.)*m*smoothstep(0.,.12,uB));}`, ["uB", "uZ", "uR"]);
      const swap = (e, key, n) => { if (e._key !== key) { e._key = key; e.replaceChildren(n); e.parentNode._fresh = true; } };
      const burnOf = (th) => { const m = ((th % 720) + 720) % 720, ph = m > 360 ? m - 720 : m; return { b: ISO.smooth(-9, 4, ph) * (1 - ISO.smooth(25, 140, ph)), r: ISO.clamp((ph + 10) / 34, 0.08, 1) * RB * 1.5, spark: ph > -11 && ph < -2 }; };
      const s = { th: o.k === "burn" ? 4 : 360, want: o.k === "burn" ? 4 : 360, run: o.run === "1" };
      let lit = o.lit || "";
      const draw = () => {
        const q = Math.round(s.th / 3), th = q * 3, zp = pinZ(th) - pinZ(0);
        const cq0 = ((q % 120) + 120) % 120, [cn, pb, rn] = crankNode(cq0);
        swap(el.crank, `c${cq0}`, cn); swap(el.pinb, `c${cq0}`, pb); swap(el.rod, `c${cq0}`, rn);
        const tr = K.translateAlong(Q, [0, 0, zp]);
        w.attr(el.piston, "transform", tr); w.attr(el.pin, "transform", tr);
        for (const [name, v, sb, sf, c] of [["intake", el.vi, el.sbi, el.sfi, "ci"], ["exhaust", el.ve, el.sbe, el.sfe, "ce"]]) {
          const lq = Math.round(liftOf(CAMS[name], th) * 4);
          w.attr(v, "transform", K.translateAlong(Q, [0, 0, -lq / 4]));
          const [bk, fr2] = springNode(name, lq);
          swap(sb, `s${lq}`, bk); swap(sf, `s${lq}`, fr2);
          const cq = ((Math.round(th / 6) * 3 % 360) + 360) % 360;
          swap(el[c], `${name}${cq}`, camNode(name, cq));
        }
        const B = burnOf(s.th), zc = pinZ(th) + PIN_UP, bq = Math.round(B.b * 30) / 30;
        if (fx) fx.set({ uB: B.b, uZ: zc, uR: B.r }, B.b > 0.004);
        else w.rebuild(el.flame, `${bq} ${q}`, () => bq < 0.02 ? "" : face(Q, roofPts(zc), `rgba(255,170,60,${(0.75 * bq).toFixed(2)})`, 0) + `<path d="${K.pathOf(roofPts(zc).map(([x, z]) => K.iso([x * Math.min(1, B.r / RB) * 0.7, 0, zc + (z - zc) * 0.8], Q)), true)}" fill="rgba(255,236,170,${(0.8 * bq).toFixed(2)})"/>`);
        w.rebuild(el.spark, B.spark ? "1" : "", () => B.spark ? `<path d="${K.pathOf([[0, 0, HB + 6], [1.6, 0, HB + 4.6], [-0.8, 0, HB + 3.6], [0.8, 0, HB + 2.2]].map((p) => K.iso(p, Q)))}" fill="none" stroke="#1f6fe0" stroke-width="1.6" stroke-linejoin="round"/>` + D([K.iso([0, 0, HB + 4], Q)], { size: 2.2, tone: "lit" }) : "");
        w.light(lights, lights.filter((p) => p.dataset.name === lit));
      };
      const ENDS = { 1: 540, 2: 720, 3: 180, 4: 360 };
      g.set = (p) => {
        if (p.run !== undefined) s.run = !!+p.run;
        if (p.stroke !== undefined && ENDS[+p.stroke] !== undefined) { const e = ENDS[+p.stroke], ahead = (((e - s.th) % 720) + 720) % 720; s.want = s.th + (ahead < 1 ? 720 : ahead); s.run = false; }
        if (p.k === "burn") { const ahead = (((4 - s.th) % 720) + 720) % 720; s.want = s.th + ahead; }
        if (p.lit !== undefined) lit = p.lit;
      };
      // shown slowed: 120° of crank a second (the readout gives a true idle speed); eased into each stop
      g.update = (dt) => {
        if (s.run) { s.th += ISO.still() ? 0 : 160 * dt; s.want = s.th; }
        else { const d = s.want - s.th; s.th = ISO.still() || d < 0.05 ? s.want : s.th + Math.min(d, 150 * dt * Math.min(1, 0.2 + d / 60)); }
        if (s.th > 1440 && s.want > 1440) { s.th -= 720; s.want -= 720; }
        draw();
        return s.run || s.th !== s.want;
      };
      // compression ratio from the drawn geometry: swept volume over the gap at the top plus the pent roof
      const swept = Math.PI * RB * RB * 2 * CR;
      let clear = 0; for (let i = -RB + 0.5; i < RB; i += 1) for (let j = -RB + 0.5; j < RB; j += 1) if (i * i + j * j < RB * RB) clear += roof(i) - (pinZ(0) + PIN_UP);
      const cr = (swept + clear) / clear;
      g.readout = () => {
        const th = ((s.th % 720) + 720) % 720, st2 = strokeOf(th), down = pinZ(0) - pinZ(th);
        const li = liftOf(CAMS.intake, th), le = liftOf(CAMS.exhaust, th);
        const say = { intake: "intake valve open: the falling piston draws fuel and air in", compression: `both valves shut: the mixture is squeezed ${cr.toFixed(1)} : 1`, power: "spark 10° before the top: the burning gas pushes the piston down", exhaust: "exhaust valve open: the rising piston pushes the burnt gas out" }[st2];
        return `stroke ${NUM[st2]} ${st2} · crank ${th.toFixed(0)}° of 720 · piston ${down.toFixed(0)} mm below the top · intake lift ${li.toFixed(1)} mm · exhaust lift ${le.toFixed(1)} mm · ${say} · cams turn at half crank speed · ${(swept / 1000).toFixed(0)} cc`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
