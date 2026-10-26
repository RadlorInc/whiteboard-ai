// "dashlight cx cy size k=engine|oil|battery|temp|brake|tpms lab=1" — a car's instrument cluster with one warning lamp lit.
// The cluster sits in the dashboard under its hood: speedometer and rev counter with bezels, ticks and needles (engine
// idling at 800 rpm, car standing), the odometer window, a trip knob, and a strip of six warning lamps. The lamp k
// lights in its true colour: amber means "check soon" (engine, tyre pressure), red means "stop safely" (oil pressure,
// charging, coolant temperature, brake). set({ k }) fades one lamp out and the next in; the readout says what it
// means and how urgent it is. Local helper: lampSvg (a lamp window with its symbol drawn flat in the face plane).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 2 mm. The cluster is 250 mm wide; dials 60 mm across.
  const BOX = { x: -64, y: -16, w: 128, d: 16, r: 2 }, TOP = 50, DIAL_R = 15, DIALS = [[-31, 29], [31, 29]];
  const AMBER = "#f4a531", RED = "#e8402f";
  const LAMPS = [
    { k: "engine", c: AMBER, name: "check engine", say: "check engine · the engine computer found a fault · drive gently and get it checked soon; if it flashes, slow down",
      d: [["M-60 -10 L-60 30 L-40 30 L-40 44 L30 44 L44 30 L60 30 L60 -24 L40 -24 L40 -40 L-10 -40 L-10 -50 L10 -50 M-34 -40 L-34 -10 Z", 9]] },
    { k: "tpms", c: AMBER, name: "tyre pressure", say: "tyre pressure · a tyre is about 25% below its pressure · check and pump up the tyres soon",
      d: [["M-56 44 Q-70 0 -50 -40 Q0 -60 50 -40 Q70 0 56 44 M-70 44 H70 M-40 44 V56 M-14 44 V56 M14 44 V56 M40 44 V56", 9], ["M0 -26 V8", 10]], dots: [[0, 26, 7]] },
    { k: "oil", c: RED, name: "oil pressure", say: "oil pressure · not enough oil pressure · stop as soon as it is safe and switch off, then check the oil",
      d: [["M-70 10 L-40 -6 L30 -6 L60 -30 L64 -24 L34 20 L-40 20 Z M-40 -6 V-26 M-56 -26 H-24", 9]], fill: ["M70 14 C64 26 61 31 61 36 A9 9 0 0 0 79 36 C79 31 76 26 70 14 Z"] },
    { k: "battery", c: RED, name: "charging", say: "charging · the alternator has stopped charging · the car now runs on its battery for a short time: drive straight to help",
      d: [["M-64 -36 H64 V44 H-64 Z M-44 -50 V-36 M44 -50 V-36", 9], ["M-40 4 H-16 M-28 -8 V16 M16 4 H40", 8]] },
    { k: "temp", c: RED, name: "engine too hot", say: "engine too hot · coolant temperature too high · stop, switch off and let it cool; never open the hot radiator cap",
      d: [["M0 -60 V20 M0 -40 H20 M0 -20 H20 M0 0 H20", 9], ["M-70 60 q17 -12 35 0 t35 0 t35 0 t35 0", 8]], dots: [[0, 30, 14]] },
    { k: "brake", c: RED, name: "brake", say: "brake · handbrake on, or brake fluid low · release the handbrake; if it stays lit, stop and get help",
      d: [["M48 0 A48 48 0 1 0 -48 0 A48 48 0 1 0 48 0 Z", 9], ["M-66 -40 Q-84 0 -66 40 M66 -40 Q84 0 66 40", 9], ["M0 -26 V8", 10]], dots: [[0, 24, 7]] },
  ];
  const GREY = ISO.tint("#a3a9b0", ["#656b72", "#737980", "#81878e", "#8f959c"], "#2a2e33");
  const LAMP_X = (i) => -45 + i * 18, LAMP_Z = 7.5, LW = 15, LH = 11;

  // A lamp window: dark glass on a short boss, the symbol (from the whiteboard recipe's own shapes) laid in its face.
  function lampSvg(P, i, on) {
    const lamp = LAMPS[i], x = LAMP_X(i), m = ISO.faceMatrix(P, [x, 1.22, LAMP_Z], 0.058);
    const ink = on ? lamp.c : "#5d636a";
    const art = lamp.d.map(([d, sw]) => `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`).join("") +
      (lamp.fill || []).map((d) => `<path d="${d}" fill="${ink}"/>`).join("") + (lamp.dots || []).map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r}" fill="${ink}"/>`).join("");
    return `<g transform="${m}"${on ? ` style="filter:drop-shadow(0 0 22px ${lamp.c})"` : ""}>${art}</g>`;
  }
  function staticSvg(P) {
    const out = [], at3 = (p) => K.iso(p, P), yAx = (x, z, y = 0) => G.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    // Dashboard top the cluster sits in, with its shut line, then the housing and the hood over it.
    const dash = { x: -80, y: -24, w: 160, d: 38, r: 6 };
    out.push(`<path class="iso-halo" d="${K.haloOf(dash, -10, 10, P)}"/>`);
    out.push(ISO.tinted(GREY, S(K.slabOf(dash, -10, 10, P, 6, 1.2), { tone: "mid", inner: L(K.sideSeam(dash, -4, P, 6), { tone: "faint" }) })));
    out.push(ISO.tinted(GREY, S(K.slabOf(BOX, 0, TOP, P, 3, 0.6), { tone: "mid" })));
    // The face: a matt black panel just proud of the housing.
    out.push(ISO.tinted(ISO.tint("#2b2f34", ["#15171a", "#1b1d21", "#212428", "#26292d"], "#08090a"), ISO.wbox(P, [-60, 60], [0, 0.6], [2, TOP - 4], "mid")));
    out.push(ISO.tinted(GREY, S(K.slabOf({ x: -68, y: -20, w: 136, d: 26, r: 5 }, TOP, 4, P, 6, 0.8), { tone: "mid" })));
    out.push(ISO.tinted(GREY, ISO.wbox(P, [-68, 68], [4, 6], [TOP - 5, TOP], "mid")));
    // Dials: face ring, ticks rooted on the bezel's inner edge, numbers, the bezel itself standing out of the face.
    const fm = (x, z) => ISO.faceMatrix(P, [x, 0.62, z], 1);
    DIALS.forEach(([x, z], j) => {
      const ticks = [], major = [], nums = [], count = j ? 8 : 10;
      for (let i = 0; i <= count * 4; i++) {
        const a = Math.PI * (1.25 - 1.5 * (i / (count * 4))), r0 = DIAL_R - 0.2, r1 = DIAL_R - (i % 4 ? 1.6 : 3.2);
        const p = (r) => at3([x + Math.cos(a) * r, 0.62, z + Math.sin(a) * r]);
        (i % 4 ? ticks : major).push(K.pathOf([p(r0), p(r1)]));
        if (i % 4 === 0 && (j || i % 8 === 0)) { const q = [x + Math.cos(a) * (DIAL_R - 6), z + Math.sin(a) * (DIAL_R - 6) - 1]; nums.push(K.faceTextSvg(fm(q[0], q[1]), String(j ? i / 4 : (i / 4) * 20), { size: 2.6, tone: "mid", anchor: "middle" })); }
      }
      if (j) for (let i = 26; i <= 32; i++) { const a = Math.PI * (1.25 - 1.5 * (i / 32)); ticks.push(K.pathOf([[DIAL_R - 0.2, a], [DIAL_R - 2.2, a]].map(([r, b]) => at3([x + Math.cos(b) * r, 0.62, z + Math.sin(b) * r])))); }
      out.push(ISO.tinted(ISO.T.steel, S(G.ringBand(0.6, 2.2, DIAL_R, DIAL_R + 1.8, yAx(x, z), P), { tone: "hi" })));
      out.push(`<path d="${K.pathOf(ISO.arc(x, z, DIAL_R + 0.05, 0, Math.PI * 2, 64).map(([a, b]) => at3([a, 0.62, b])), true)}" fill="#1c1f23" stroke="#9aa0a7" stroke-width="0.5"/>`);
      out.push(`<path d="${ticks.join("")}" stroke="#aab0b7" stroke-width="0.7" fill="none"/><path d="${major.join("")}" stroke="#eef0f2" stroke-width="1.1" fill="none"/>`);
      out.push(`<g style="--anatomy-mid:#e9ebee">${nums.join("")}${K.faceTextSvg(fm(x, z + 5), j ? "×1000 rpm" : "km/h", { size: 1.9, tone: "mid", anchor: "middle" })}</g>`);
    });
    // Odometer window between the dials, the trip knob under the rev counter, screws on the face corners.
    out.push(ISO.tinted(ISO.tint("#c7d3c2", ["#8e9a8a", "#9aa696", "#a6b2a2", "#b2beae"], "#3c4a38"), ISO.wbox(P, [-9, 9], [0.6, 1.2], [24, 31], "hi")));
    out.push(`<g style="--anatomy-mid:#2f3b2c">${K.faceTextSvg(ISO.faceMatrix(P, [0, 1.22, 26.4], 1), "84 316 km", { size: 2.4, tone: "mid", anchor: "middle" })}</g>`);
    out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0.6, 5, 1.1, yAx(55, 19), P, { steps: 14 }), { tone: "mid" })), ISO.tinted(ISO.T.plastic, S(G.disc(5, 6.6, 2.2, yAx(55, 19), P, { steps: 18 }), { tone: "mid" })));
    out.push(D([[-56, 6], [56, 6], [-56, 42], [56, 42]].map(([x, z]) => at3([x, 0.62, z])), { size: 0.7, tone: "lo" }));
    // Lamp strip: a raised rail with six bosses, one window each.
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-56, 56], [0.6, 0.9], [1.4, 13.6], "mid")));
    LAMPS.forEach((_, i) => out.push(ISO.tinted(ISO.tint("#1d2024", ["#0e0f11", "#131417", "#17191c", "#1b1d20"], "#000"), ISO.wbox(P, [LAMP_X(i) - LW / 2, LAMP_X(i) + LW / 2], [0.9, 1.2], [LAMP_Z - LH / 2, LAMP_Z + LH / 2], "mid"))));
    return out.join("");
  }
  function needlesSvg(P, kmh, rpm) {
    const out = [], yAx = (x, z, y = 0) => G.frameOf([x, y, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
    [[DIALS[0], kmh / 200], [DIALS[1], rpm / 8000]].forEach(([[x, z], f]) => {
      const a = Math.PI * (1.25 - 1.5 * f), c = Math.cos(a), s = Math.sin(a), n = [-s, c];
      const pts = [[DIAL_R - 2, 0], [-3, 0.9], [-3, -0.9]].map(([r, w]) => K.iso([x + c * r + n[0] * w * 0.6, 1.6, z + s * r + n[1] * w * 0.6], P));
      out.push(`<path d="${K.pathOf(pts, true)}" fill="#f06a2a" stroke="#7a2a0c" stroke-width="0.5" stroke-linejoin="round"/>`);
      out.push(ISO.tinted(ISO.T.plastic, S(G.disc(0.6, 2.4, 1.8, yAx(x, z), P, { steps: 16 }), { tone: "mid" })));
    });
    return out.join("");
  }

  ISO.add({
    name: "dashlight", title: "Dashboard warning lights", compare: "dashlight 480 270 220",
    about: "An instrument cluster with dials and a strip of six warning lamps; one lights amber (check soon) or red (stop safely) and the readout says what it means.",
    line: "dashlight cx cy size k=engine|oil|battery|temp|brake|tpms lab=1",
    demo: { line: "dashlight 480 270 220", script: LAMPS.map((l) => ({ set: { k: l.k }, hold: 2.6 })) },
    make([cx, cy, size = 220], o, t, parent) {
      const lab = o.lab !== "0", Wd = size * 3.1, H = Wd * 0.62;
      const { P, g } = ISO.frame([[-80, -24, -10], [80, -24, -10], [80, 14, -10], [-80, 14, -10], [-68, -20, TOP + 4], [68, 6, TOP + 4]], cx, cy, Wd, H, { azimuth: 70, elevation: 24 }, parent);
      g.innerHTML = staticSvg(P) + `<g data-part="needles">${needlesSvg(P, 0, 800)}</g>` + LAMPS.map((_, i) => `<g data-lamp="${i}"><g>${lampSvg(P, i, false)}</g><g opacity="0">${lampSvg(P, i, true)}</g></g>`).join("") + `<g data-part="word"></g>`;
      const lit = [...g.querySelectorAll("[data-lamp]")].map((e) => e.lastElementChild), word = g.querySelector('[data-part="word"]'), w = ISO.writer();
      const pick = (k) => Math.max(0, LAMPS.findIndex((l) => l.k === k));
      const s = { k: pick(o.k || "engine"), glow: LAMPS.map(() => 0) };
      s.glow[s.k] = 1;
      const draw = () => {
        lit.forEach((e, i) => w.attr(e, "opacity", s.glow[i].toFixed(2)));
        w.rebuild(word, lab ? s.k : "", () => lab ? ISO.word(K.iso([LAMP_X(s.k), 0, -10], P), LAMPS[s.k].name, LAMPS[s.k].c === RED ? "#c0392b" : "#b26a00", { dy: 26, size: 16 }) : "");
      };
      g.set = (p) => { if (p.k !== undefined) s.k = pick(p.k); };
      g.update = (dt) => {
        let moving = false;
        s.glow = s.glow.map((v, i) => { const n = ISO.follow(v, i === s.k ? 1 : 0, dt, 0.18, ISO.still()); if (n !== (i === s.k ? 1 : 0)) moving = true; return n; });
        draw();
        return moving;
      };
      g.readout = () => `${LAMPS[s.k].c === RED ? "RED: stop safely" : "AMBER: check soon"} · ${LAMPS[s.k].say}`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
