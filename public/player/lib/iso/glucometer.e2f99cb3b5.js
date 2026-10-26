// "glucometer cx cy size strip=0|1 drop=0|1 unit=mgdl|mmol lab=1 lit=meter|screen|strip|port|drop|button |text" — a blood glucose meter.
// A handheld meter on the table: a screen in its top, a main button and two arrow buttons, and the strip port at the
// end. A test strip slides into the port (its contacts first), which wakes the meter; a drop of blood touched to the
// strip's tip is drawn into its channel, the meter counts down 5 s and shows the result. `text` is the reading in
// mg/dL (default 112). mmol/L = mg/dL ÷ 18 (glucose weighs 180 g a mole). set({ strip: 1 }), set({ drop: 1 }),
// set({ unit: "mmol" }) step through it.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm. The meter lies along x with its strip port at +x; its top at z = TH.
  const M = { x: -50, y: -28, w: 96, d: 56, r: 12 }, TH = 17, PX = M.x + M.w, SL = 34, SW = 7;
  const SCR = { x0: -22, x1: 28, y0: -18, y1: 18 };
  const SHELL = ISO.tint("#f4f6f8", ["#c3cad1", "#cfd5db", "#dbe0e5", "#e6eaee"], "#46505b");
  const BASE = ISO.tint("#59626c", ["#2f353b", "#373e45", "#3f474f", "#485058"], "#16191c");
  const STRIP = ISO.tint("#f3f4f2", ["#c9ccc6", "#d5d8d2", "#e0e2dd", "#e9ebe7"], "#5c6159");
  const planeMatrix = (P, o, eu, ev) => { const a = K.iso(o, P), b = K.iso(eu, P), c = K.iso(ev, P); return `matrix(${b[0] - a[0]} ${b[1] - a[1]} ${c[0] - a[0]} ${c[1] - a[1]} ${a[0]} ${a[1]})`; };
  const txt = (x, y, s, size, fill, anchor = "start", weight = 700) => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" style="font:${weight} ${size}px 'Helvetica Neue',Arial,sans-serif">${s}</text>`;

  function meterSvg(P) {
    const out = [`<path class="iso-halo" d="${K.haloOf(M, 0, TH, P)}"/>`];
    out.push(ISO.tinted(BASE, S(K.slabOf(M, 0, 7, P, 8, 0.6), { tone: "mid" })));
    out.push(ISO.tinted(SHELL, S(K.slabOf(M, 7, TH - 7, P, 8, 1.2), { tone: "mid", inner: L(K.sideSeam(M, 9, P, 8), { tone: "faint" }) })));
    // screen bezel, and the buttons: a round main button and two small arrow keys
    out.push(ISO.tinted(ISO.T.plastic, S(K.slabOf({ x: SCR.x0 - 4, y: SCR.y0 - 4, w: SCR.x1 - SCR.x0 + 8, d: SCR.y1 - SCR.y0 + 8, r: 4 }, TH, 0.6, P, 4, 0.3), { tone: "mid" })));
    out.push(ISO.tinted(ISO.T.blue, S(K.cylinder(M.x + 14, 0, 7, TH, 1.6, P, 32, 0.4), { tone: "hi" })));
    for (const y of [-14, 14]) out.push(ISO.tinted(SHELL, S(K.cylinder(M.x + 15, y, 3.2, TH, 1.2, P, 20), { tone: "hi" })));
    out.push(L(K.ring(M.x + 14, 0, 4.2, TH + 1.6, P, 24), { tone: "lo" }));
    return out.join("");
  }
  // The strip port in the end face: a raised mouth with a dark slot.
  function portSvg(P) {
    const y0 = -SW / 2 - 2, y1 = SW / 2 + 2;
    const out = [ISO.tinted(SHELL, ISO.wbox(P, [PX - 1, PX + 2.4], [y0, y1], [8, 13.4], "mid"))];
    out.push(`<path d="${K.pathOf([[PX + 2.45, -SW / 2 - 0.4, 10.2], [PX + 2.45, SW / 2 + 0.4, 10.2], [PX + 2.45, SW / 2 + 0.4, 11.2], [PX + 2.45, -SW / 2 - 0.4, 11.2]].map((p) => K.iso(p, P)), true)}" fill="#14171a"/>`);
    return out.join("");
  }
  // The strip, its contact end at x0 (in the port when inserted), the sample tip at x0 + SL with the channel filling.
  function stripSvg(P, x0, fill) {
    const out = [ISO.tinted(STRIP, ISO.wbox(P, [x0, x0 + SL], [-SW / 2, SW / 2], [10.4, 10.9], "hi"))];
    const m = planeMatrix(P, [x0, -SW / 2, 10.92], [x0 + 1, -SW / 2, 10.92], [x0, -SW / 2 + 1, 10.92]);
    // printed traces from the contacts to the tip, the sample window, and the blood that has run into the channel
    let art = `<path d="M1 1.6H${SL - 7}M1 3.5H${SL - 6}M1 5.4H${SL - 7}" stroke="#b28a2c" stroke-width="0.7"/><rect x="${SL - 7.5}" y="1" width="6.6" height="5" rx="1" fill="#e9eef2" stroke="#7d8792" stroke-width="0.4"/>`;
    if (fill > 0) art += `<rect x="${SL - 1 - 6.4 * fill}" y="2.4" width="${6.4 * fill}" height="2.2" fill="#b3261e"/>`;
    art += `<path d="M0.4 0.3H8" stroke="#2b6cc4" stroke-width="0.6"/>`;
    out.push(`<g transform="${m}">${art}</g>`);
    return out.join("");
  }
  // The meter's screen: off, waiting for blood, counting down, or the reading in either unit.
  function screenSvg(P, st, mg, unit) {
    const w = SCR.x1 - SCR.x0, h = SCR.y1 - SCR.y0, m = planeMatrix(P, [SCR.x0, SCR.y0, TH + 0.62], [SCR.x0 + 1, SCR.y0, TH + 0.62], [SCR.x0, SCR.y0 + 1, TH + 0.62]);
    let a = `<rect width="${w}" height="${h}" rx="2" fill="${st === "off" ? "#7f8a7c" : "#c7d3c2"}"/>`;
    const ink = "#1f2a1d";
    if (st === "wait") a += `<path d="M${w / 2} 7 C${w / 2 + 6} 15 ${w / 2 + 6} 22 ${w / 2} 22 C${w / 2 - 6} 22 ${w / 2 - 6} 15 ${w / 2} 7Z" fill="${ink}"/>` + txt(w / 2, 31, "apply blood", 5, ink, "middle", 600);
    if (st.startsWith("count")) a += txt(w / 2, 25, st.slice(5), 18, ink, "middle");
    if (st === "result") {
      const v = unit === "mmol" ? (mg / 18).toFixed(1) : String(Math.round(mg));
      a += txt(w - 13, 25, v, 18, ink, "end") + txt(w - 2, 13, unit === "mmol" ? "mmol" : "mg", 4.6, ink, "end", 600) + txt(w - 2, 19, unit === "mmol" ? "/L" : "/dL", 4.6, ink, "end", 600);
      a += txt(2.4, 5.6, "08:14  24 Oct", 3.6, ink, "start", 600);
    }
    return `<g transform="${m}">${a}</g>`;
  }

  ISO.add({
    name: "glucometer", title: "Blood glucose meter", compare: "glucometer 480 290 300 |112",
    about: "A glucose meter: slide a strip in, touch a drop of blood to its tip, and after a 5 s count the screen reads mg/dL, or mmol/L (mg/dL ÷ 18).",
    line: "glucometer cx cy size strip=0|1 drop=0|1 unit=mgdl|mmol lab=1 lit=meter|screen|strip|port|drop|button |text",
    demo: { line: "glucometer 480 290 300 strip=0 drop=0 |112", script: [{ set: { strip: 1, lit: "strip" }, hold: "settle" }, { set: { drop: 1, lit: "drop" }, hold: "settle" }, { set: { unit: "mmol", lit: "screen" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, text, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = size * 1.75, H = size * 1.2;
      const mg = ISO.clamp(parseFloat(text) || 112, 20, 600);
      const pts = [[M.x - 4, M.y - 6, -3], [PX + SL + 30, M.y + M.d + 14, -3], [M.x - 14, M.y + M.d + 14, -3], [PX + SL + 30, M.y - 14, -3], [M.x, 0, TH + 4], [PX + SL + 6, 0, 26]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 42, elevation: 38 }, parent);
      const T = { x: M.x - 14, y: M.y - 14, w: M.w + SL + 44, d: M.d + 28, r: 6 };
      g.innerHTML = `<g>${ISO.tinted(ISO.T.wood, S(K.slabOf(T, -3, 3, P, 4, 0.6), { tone: "lo", inner: L(K.sideSeam(T, -1.5, P, 4), { tone: "faint" }) }))}</g>` +
        `<g data-name="meter">${meterSvg(P)}</g><g data-name="screen"></g><g data-name="strip"></g><g data-name="port">${portSvg(P)}</g><g data-name="drop"></g><g data-part="words"></g>`;
      const nm = (k) => g.querySelector(`[data-name="${k}"]`), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const has = (k) => o[k] !== "0";
      const s = { strip: has("strip"), x: 0, drop: has("drop"), d: 0, fill: 0, t: 99, unit: o.unit === "mmol" ? "mmol" : "mgdl", lit: o.lit || "" };
      s.x = s.strip ? 1 : 0; s.d = s.drop ? 1 : 0; s.fill = s.drop ? 1 : 0;
      if (lab) {
        const word = (p, txt2, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt2, "#444", { anchor, size: 14, dy }); };
        g.querySelector('[data-part="words"]').innerHTML = word([M.x + 14, M.y + M.d, 0], "Meter", "middle", 26) + word([PX + SL, SW / 2, 10], "Test strip", "start", 18, 2) +
          word([PX + 2, -SW, 14], "Strip port", "middle", -10) + word([0, SCR.y0 - 4, TH], "Screen", "middle", -12);
      }
      const state = () => !s.strip || s.x < 0.98 ? "off" : !s.drop || s.fill < 1 ? "wait" : s.t < 5 ? `count${5 - Math.floor(s.t)}` : "result";
      const draw = () => {
        // the strip comes in from beyond the tip and slides home into the port (contacts 4 mm inside)
        const x0 = PX - 4 + (1 - ISO.ease(s.x)) * 40;
        w.rebuild(nm("strip"), `${x0.toFixed(2)} ${s.fill.toFixed(2)}`, () => stripSvg(P, x0, s.fill));
        w.rebuild(nm("screen"), `${state()} ${s.unit}`, () => screenSvg(P, state(), mg, s.unit));
        const tip = [x0 + SL + 1.6, 0, 11.2];
        w.rebuild(nm("drop"), s.d.toFixed(2), () => (s.d > 0.02 ? ISO.tinted(ISO.T.red, S(G.sphereOf(tip, 3.2 * s.d * (1 - 0.5 * s.fill) + 0.3, P), { tone: "hi" })) : ""));
        w.light(parts, parts.filter((p) => s.lit && p.dataset.name === s.lit));
      };
      g.set = (p) => {
        if (p.strip !== undefined) s.strip = !!+p.strip;
        if (p.drop !== undefined) { s.drop = !!+p.drop; s.t = 0; }
        if (p.unit !== undefined) s.unit = p.unit === "mmol" ? "mmol" : "mgdl";
        if (p.lit !== undefined) s.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), before = state();
        s.x = calm ? +s.strip : Math.abs(+s.strip - s.x) < dt / 0.9 ? +s.strip : s.x + Math.sign(+s.strip - s.x) * (dt / 0.9);
        s.d = ISO.follow(s.d, s.drop && s.x > 0.98 ? 1 : 0, dt, 0.25, calm);
        // the channel fills by capillary action in about a second once the drop touches it
        if (s.drop && s.d > 0.9) s.fill = Math.min(1, s.fill + dt / 1); else if (!s.drop) s.fill = 0;
        if (calm && s.drop) s.fill = 1;
        if (s.fill >= 1) s.t = calm ? 9 : s.t + dt;
        draw();
        return s.x !== +s.strip || (s.drop && (s.fill < 1 || s.t < 5)) || Math.abs(s.d - (s.drop && s.x > 0.98 ? 1 : 0)) > 1e-3 || before !== state();
      };
      g.readout = () => {
        const st = state(), mmol = (mg / 18).toFixed(1);
        if (st === "off") return "meter off · slide a test strip into the port to wake it";
        if (st === "wait") return "strip in, meter on · prick the side of a fingertip and touch the drop to the strip's tip";
        if (st.startsWith("count")) return `blood drawn into the strip · measuring… ${5 - Math.floor(s.t)}`;
        return `${Math.round(mg)} mg/dL = ${mmol} mmol/L (mg/dL ÷ 18; × 18 back) · before-meal target 80–130 mg/dL (4.4–7.2 mmol/L)`;
      };
      draw();
      return g;
    },
  });
})();
