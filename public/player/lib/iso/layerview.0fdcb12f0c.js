// "layerview cx cy k kind=dry|wet|raincoat|puffer|sun fabric=… c=black|white flow=0..1" — cloth cut through and seen
// from the side, outside at the top, the warm side underneath. Threads show as cut ends with the air caught between
// them. flow runs what passes through: body heat rising (dry, puffer), rain falling and soaking in or beading on top
// (wet, raincoat), sweat vapor leaving through the membrane's tiny holes (raincoat), sun rays soaked up or bounced (sun).
(() => {
  const W = 400, H = 250, SKY = "#d3e3ea", WARM = "#f1e2c9", AIR = "#f7fbfc", WATER = "#4d8fc4", HEAT = "#d9622b", RAY = "#efbf36";
  const FAB = ["cotton", "wool", "silk", "polyester"];
  const THICK = { wool: 220, cotton: 150, polyester: 130, silk: 76 };
  const LCOL = { cotton: "#d3bd8f", wool: "#b08a5e", silk: "#9d3a56", polyester: "#5a6e8c" };
  const AIRN = { wool: 40, cotton: 14, polyester: 10, silk: 2 };
  const free = { class: "free", "data-free": "1" };
  const sm = (a, b, x) => { const t = ISO.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const f1 = (v) => v.toFixed(1);
  const ell = (x, y, rx, ry) => `M${f1(x - rx)} ${f1(y)}A${f1(rx)} ${f1(ry)} 0 1 0 ${f1(x + rx)} ${f1(y)}A${f1(rx)} ${f1(ry)} 0 1 0 ${f1(x - rx)} ${f1(y)}Z`;
  const drop = (x, y, r) => `M${f1(x)} ${f1(y - r * 1.6)}C${f1(x + r * 0.9)} ${f1(y - r * 0.5)} ${f1(x + r)} ${f1(y + r)} ${f1(x)} ${f1(y + r)}C${f1(x - r)} ${f1(y + r)} ${f1(x - r * 0.9)} ${f1(y - r * 0.5)} ${f1(x)} ${f1(y - r * 1.6)}Z`;
  const wisp = (x, y) => `M${f1(x)} ${f1(y + 26)}q9 -6 0 -13q-9 -6 0 -13q9 -6 0 -13q-9 -6 0 -13`;

  // a row of cut threads across x, centred on y0, total thickness T; returns the threads' outline for tints
  function threads(P, parent, y0, T, fabric, col, airN) {
    const n = 9, pitch = (2 * W) / (n - 1), rx = pitch * (fabric === "silk" ? 0.5 : 0.44), ry = Math.min(T * 0.3, rx * 0.78), a = T * 0.2;
    const pts = []; for (let i = -1; i <= n; i++) pts.push([-W + i * pitch, y0 + (i % 2 ? a : -a)]);
    let wave = `M${-W - pitch} ${y0}`; for (let i = 0; i < pts.length; i++) { const [x] = pts[i]; wave += `Q${f1(x - pitch / 2)} ${f1(y0 + (i % 2 ? -a : a) * 1.6)} ${f1(x)} ${y0}`; }
    P.el("path", { d: wave, fill: "none", stroke: P.dk(col, 0.25), "stroke-width": ry * 0.9, "stroke-linecap": "round", ...free }, parent);
    P.el("path", { d: wave, fill: "none", stroke: P.lt(col, 0.2), "stroke-width": ry * 0.25, opacity: 0.6, ...free }, parent);
    let outline = "", core = ""; const fib = P.layer(parent), air = P.layer(parent); let airInk = "";
    const bubble = (x, y, r) => { air.dab(x, y, r, AIR, 0.95); airInk += ell(x, y, r, r); };
    for (const [x, y] of pts) { outline += ell(x, y, rx, ry); core += ell(x, y, rx * 0.5, ry * 0.5); }
    P.el("path", { d: outline, fill: col }, parent);
    for (const [x, y] of pts) {
      const k = fabric === "silk" ? 14 : fabric === "wool" ? 26 : 20;
      for (let j = 0; j < k; j++) { const t = P.rr(0, 6.28), q = Math.sqrt(P.rr(0, 0.8)); fib.dab(x + Math.cos(t) * rx * q, y + Math.sin(t) * ry * q, fabric === "wool" ? P.rr(6, 10) : P.rr(4.5, 7), P.pick([P.dk(col, 0.18), P.lt(col, 0.18)]), 0.9); }
      fib.stroke(x - rx * 0.6, y - ry * 0.45, x + rx * 0.5, y - ry * 0.55, ry * 0.22, P.lt(col, 0.35), 0.5, -ry * 0.15);
    }
    fib.done();
    const airG = P.el("g", { "data-name": "air" }, parent);
    const ab = P.layer(airG); // air between and inside threads
    for (let i = 0; i < airN; i++) { const p = pts[1 + (i % (pts.length - 2))], up = (i + Math.floor(i / 7)) % 2 ? 1 : -1; const x = p[0] + P.rr(-0.5, 0.5) * pitch, y = y0 + up * P.rr(0, T * 0.32), r = fabric === "wool" ? P.rr(7, 13) : P.rr(5, 9); ab.dab(x, y, r, AIR, 0.95); airInk += ell(x, y, r, r); }
    ab.done(); air.done();
    P.el("path", { d: airInk, fill: "none", stroke: "#7b93a1", "stroke-width": 1.6, ...free }, airG);
    P.ink(outline, parent, 2.6, false);
    return { outline, core, top: y0 - a - ry, bottom: y0 + a + ry, airG, pitch, pts };
  }
  // a thin flat shell of cloth from y0 to y1
  function shell(P, parent, y0, y1, col) {
    const cl = P.clip(parent, `M${-W - 20} ${y0}H${W + 20}V${y1}H${-W - 20}Z`); P.brush("polyester", parent, cl, [-W, W, y0, y1], col, { density: 2 });
    P.ink(`M${-W} ${y0}H${W}M${-W} ${y1}H${W}`, parent, 3);
  }

  ISO.add({
    name: "layerview", title: "Cloth cut through", compare: null,
    about: "Cloth cut through and seen from the side: outside at the top, the warm side below (no body shown). Threads show as cut ends with air pockets between them. kind=dry: body heat rises; wool's many air pockets hold it, thin silk lets it through. kind=wet: rain falls; cotton soaks it up and loses its air, wool takes water into its core and keeps its air, polyester holds it only on top so it dries off fast. kind=raincoat: rain beads on the shell, sweat vapor leaves through the membrane's tiny holes. kind=puffer: two thin shells with fluffy filling and trapped air that holds the heat. kind=sun: rays are soaked up by black cloth (it warms) or bounced by white. flow=0..1 runs it. Parts: cloth, air, membrane, filling.",
    line: "layerview cx cy k=0.2..1.5 kind=dry|wet|raincoat|puffer|sun fabric=cotton|wool|silk|polyester c=black|white flow=0..1",
    demo: { line: "layerview 480 270 0.62 kind=raincoat flow=0", script: [{ set: { flow: 0 }, hold: 1 }, { set: { flow: 0.5 }, hold: "settle" }, { set: { flow: 1 }, hold: "settle" }] },
    make([cx, cy, k], o, t, parent) {
      const P = window.PAINT, kind = ["dry", "wet", "raincoat", "puffer", "sun"].includes(o.kind) ? o.kind : "dry";
      const fabric = FAB.includes(o.fabric) ? o.fabric : kind === "wet" ? "cotton" : kind === "dry" ? "wool" : "cotton", white = o.c === "white";
      P.seed(71 + FAB.indexOf(fabric) * 3 + kind.length);
      const g = P.base(parent, cx, cy, k), box = `M${-W} ${-H}H${W}V${H}H${-W}Z`, cid = P.clip(g, box), view = P.el("g", { "clip-path": `url(#${cid})` }, g);
      P.el("rect", { x: -W, y: -H, width: 2 * W, height: H, fill: kind === "sun" ? "#e3e6d8" : SKY }, view);
      P.el("rect", { x: -W, y: 0, width: 2 * W, height: H, fill: WARM }, view);
      const cloth = P.el("g", { "data-name": "cloth" }, view);
      const tint = P.el("g", { opacity: 0 }, view), glow = P.el("g", { opacity: 0 }, view);
      let top = -50, bottom = 50, C = null, pores = [];
      const col = kind === "sun" ? (white ? "#f2f1ec" : "#2a2c32") : LCOL[fabric];
      if (kind === "dry" || kind === "wet" || kind === "sun") {
        C = threads(P, cloth, 0, kind === "sun" ? 140 : THICK[fabric], kind === "sun" ? "cotton" : fabric, col, kind === "sun" ? 8 : AIRN[fabric]);
        top = C.top; bottom = C.bottom;
        if (kind === "wet") { const wool = fabric === "wool", poly = fabric === "polyester";
          P.el("path", { d: wool ? C.core : C.outline, fill: WATER, opacity: wool ? 0.75 : poly ? 0.18 : 0.5 }, tint); }
        if (kind === "sun") P.el("path", { d: C.outline, fill: "#e0662c", opacity: 0.45 }, glow);
      } else if (kind === "raincoat") {
        // outer shell threads, the membrane with tiny holes, a light lining
        const sh = P.el("g", {}, cloth), shellCol = P.COLORS.teal; let ink = "";
        for (let x = -W + 20; x < W; x += 70) ink += ell(x, -100, 32, 22);
        P.el("path", { d: ink, fill: shellCol }, sh); const hi = P.layer(sh); for (let x = -W + 20; x < W; x += 70) hi.stroke(x - 18, -108, x + 14, -110, 7, P.lt(shellCol, 0.4), 0.7, -2); hi.done(); P.ink(ink, sh, 2.4, false);
        const mem = P.el("g", { "data-name": "membrane" }, cloth); P.el("rect", { x: -W, y: -72, width: 2 * W, height: 30, fill: "#e9eef1" }, mem);
        let holes = ""; for (let x = -W + 55; x < W; x += 70) { pores.push(x); holes += `M${x - 4} -72h8v30h-8Z`; }
        P.el("path", { d: holes, fill: "#7b93a1" }, mem); P.ink(`M${-W} -72H${W}M${-W} -42H${W}`, mem, 2.6);
        const lin = P.layer(cloth); let lk = ""; for (let x = -W + 20; x < W; x += 40) { lin.dab(x, -24, 13, "#c9ccd2"); lk += ell(x, -24, 15, 10); } lin.done(); P.el("path", { d: lk, fill: "none", stroke: P.INK, "stroke-width": 1.8, ...free }, cloth);
        top = -122; bottom = -14;
      } else {
        // puffer: two shells, fluffy filling and the air it holds
        const shellCol = P.COLORS.plum;
        shell(P, cloth, -132, -112, shellCol); shell(P, cloth, 112, 132, shellCol);
        const fill = P.el("g", { "data-name": "filling" }, cloth), fl = P.layer(fill), fd = P.layer(fill);
        for (let i = 0; i < 15; i++) { const x = -W + 30 + (i % 8) * 106 + (i >= 8 ? 53 : 0) + P.rr(-12, 12), y = (i >= 8 ? 46 : -46) + P.rr(-12, 12), r = P.rr(30, 40);
          for (let j = 0; j < 9; j++) { const t = (j / 9) * 6.28 + P.rr(-0.3, 0.3), q = P.rr(0.35, 0.7); fl.dab(x + Math.cos(t) * r * q, y + Math.sin(t) * r * q, r * P.rr(0.35, 0.5), P.pick(["#f3ecdc", "#e8dcc3", "#fbf6ea"])); }
          for (let j = 0; j < 14; j++) { const t = P.rr(0, 6.28), x1 = x + Math.cos(t) * r * P.rr(0.2, 0.5), y1 = y + Math.sin(t) * r * P.rr(0.2, 0.5), l = P.rr(14, 26), u = t + P.rr(-0.8, 0.8); fd.stroke(x1, y1, x1 + Math.cos(u) * l, y1 + Math.sin(u) * l, 2, "#a8916a", 0.75, P.rr(-5, 5)); } }
        fl.done(); fd.done();
        const airG = P.el("g", { "data-name": "air" }, cloth), ab = P.layer(airG); let ai = "";
        for (let i = 0; i < 26; i++) { const x = P.rr(-W + 10, W - 10), y = P.rr(-96, 96), r = P.rr(6, 11); ab.dab(x, y, r, AIR, 0.95); ai += ell(x, y, r, r); }
        ab.done(); P.el("path", { d: ai, fill: "none", stroke: "#7b93a1", "stroke-width": 1.6, ...free }, airG);
        P.el("path", { d: `M${-W} -112V112M${W} -112V112`, fill: "none", stroke: "#e0cc9e", "stroke-width": 5, "stroke-dasharray": "14 9", ...free }, cloth);
        top = -132; bottom = 132;
      }
      // what moves: drops (fill + ink), vapor dots, heat wisps, sun rays
      const dropFill = P.el("path", { fill: "#8fc0e3" }, view), dropShine = P.el("path", { fill: "#ffffff", opacity: 0.85 }, view), dropInk = P.el("path", { fill: "none", stroke: P.INK, "stroke-width": 2.4, ...free }, view);
      const vapor = P.el("path", { fill: "#a9c9dc", stroke: "#6f8fa3", "stroke-width": 1.4 }, view);
      const heat = P.el("path", { fill: "none", stroke: HEAT, "stroke-width": 5, "stroke-linecap": "round", ...free }, view);
      const rays = P.el("path", { fill: "none", stroke: RAY, "stroke-width": 11, "stroke-linecap": "round", "stroke-linejoin": "round", ...free }, view), rayCore = P.el("path", { fill: "none", stroke: "#fff5cf", "stroke-width": 3.5, "stroke-linecap": "round", ...free }, view), heads = P.el("path", { fill: RAY, stroke: P.INK, "stroke-width": 2, "stroke-linejoin": "round" }, view);
      const R0 = (n, a, b) => Array.from({ length: n }, (_, i) => a + ((i + 0.5) / n) * (b - a) + P.rr(-14, 14));
      const DX = R0(6, -W + 30, W - 30), HX = R0(9, -W + 30, W - 30), HD = HX.map(() => P.rr(0, 0.3)), HS = HX.map(() => P.rr(0, 1)), VX = pores.length ? pores : R0(7, -W + 40, W - 40);
      const hold = { wool: 0.15, cotton: 0.55, polyester: 0.6, silk: 1 }[fabric];

      const st = { flow: ISO.clamp(+o.flow || 0, 0, 1) }; let f = st.flow;
      const draw = () => {
        let dd = "", sh = "", vd = "", hd = "", rd = "", hh = "";
        if (kind === "wet" || kind === "raincoat") DX.forEach((x0, i) => {
          const s = i * 0.06, fall = sm(s, s + 0.4, f), land = top - 14;
          let x = x0, y = -H - 30 + (land + H + 30) * fall, r = 14;
          if (fall >= 1) { const after = sm(s + 0.4, 0.95, f);
            if (kind === "raincoat") { x = x0 + after * 120 * (i % 2 ? 1 : -1); r = 15; y = land + 2; dd += ell(x, y, r * 1.15, r * 0.85); sh += ell(x - 5, y - 5, 4, 3); return; }
            if (fabric === "wool") r = 14 * (1 - after * 0.45); else if (fabric === "polyester") r = 14 * (1 - after * 0.6); else r = 14 * (1 - after);
            if (r < 1) return; dd += ell(x, land + 4, r * 1.2, r * 0.8); sh += ell(x - r * 0.4, land, r * 0.25, r * 0.2); return; }
          dd += drop(x, y, r); sh += ell(x - 4, y - 2, 3, 4);
        });
        if (kind === "wet") tint.setAttribute("opacity", sm(0.35, 0.85, f).toFixed(3));
        if (kind === "wet" && C && fabric !== "wool") C.airG.setAttribute("opacity", (1 - sm(0.35, 0.85, f) * (fabric === "polyester" ? 0.3 : 0.9)).toFixed(3));
        // vapor: polyester drying off, sweat leaving a raincoat
        if (kind === "raincoat") VX.forEach((x, i) => { for (let j = 0; j < 3; j++) { const a = sm(j * 0.12 + (i % 3) * 0.03, 0.62 + j * 0.12, f), y = H - 30 - j * 34 + (-H + 30 - (H - 30 - j * 34)) * a; vd += ell(x + (j % 2 ? 4 : -4), y, 6, 6); } });
        if (kind === "wet" && fabric === "polyester") VX.forEach((x, i) => { const a = sm(0.55 + 0.04 * i, 1, f); if (a <= 0) return; const y = top + (-H + 20 - top) * a; for (let j = 0; j < 3; j++) { const yy = y + j * 22; if (yy < top) vd += ell(x + (j % 2 ? 5 : -5), yy, 5.5, 5.5); } });
        // body heat rising from below
        if (kind === "dry" || kind === "puffer" || (kind === "sun" && !white)) HX.forEach((x, i) => {
          if (kind === "sun") { const a = sm(0.55 + HD[i], 1, f); if (a <= 0) return; hd += wisp(x, bottom + 20 + a * 120); return; }
          const a = sm(HD[i], HD[i] + 0.7, f), passes = kind === "dry" && HS[i] < hold, stop = kind === "puffer" ? -60 + HS[i] * 120 : top + (bottom - top) * (0.25 + 0.5 * HS[i]);
          const end = passes ? -H + 40 : stop, y = H - 40 + (end - H + 40) * a; hd += wisp(x, y);
        });
        if (kind === "sun") for (let i = 0; i < 5; i++) {
          const hx = -W + 120 + i * 140, hy = top + 4, sx = hx - 180, sy = -H - 20, a = sm(i * 0.05, 0.45 + i * 0.05, f), px = sx + (hx - sx) * a, py = sy + (hy - sy) * a;
          rd += `M${sx} ${sy}L${f1(px)} ${f1(py)}`; const ang = Math.atan2(hy - sy, hx - sx);
          let ex = px, ey = py, ea = ang;
          if (a >= 1) { if (white) { const b = sm(0.5 + i * 0.05, 0.95, f); ex = hx + 180 * b; ey = hy - 250 * b; ea = Math.atan2(-250, 180); rd += `L${f1(ex)} ${f1(ey)}`; if (b <= 0.05) continue; } else continue; }
          const L = 22; hh += `M${f1(ex + Math.cos(ea) * L)} ${f1(ey + Math.sin(ea) * L)}L${f1(ex + Math.cos(ea + 2.4) * L * 0.8)} ${f1(ey + Math.sin(ea + 2.4) * L * 0.8)}L${f1(ex + Math.cos(ea - 2.4) * L * 0.8)} ${f1(ey + Math.sin(ea - 2.4) * L * 0.8)}Z`;
        }
        if (kind === "sun" && !white) glow.setAttribute("opacity", sm(0.4, 0.9, f).toFixed(3));
        dropFill.setAttribute("d", dd); dropInk.setAttribute("d", dd); dropShine.setAttribute("d", sh); vapor.setAttribute("d", vd); heat.setAttribute("d", hd); rays.setAttribute("d", rd); rayCore.setAttribute("d", rd); heads.setAttribute("d", hh);
      };
      P.el("path", { d: box, fill: "none", stroke: P.INK, "stroke-width": 4, "stroke-linejoin": "round", ...free }, g);
      draw();
      g.anchors = { cloth: [0, (top + bottom) / 2] };
      g.set = (p) => { if (p.flow !== undefined) st.flow = ISO.clamp(+p.flow || 0, 0, 1); };
      g.update = (dt) => { f = ISO.still() ? st.flow : ISO.follow(f, st.flow, dt, 0.9); if (Math.abs(f - st.flow) < 0.002) f = st.flow; draw(); return f !== st.flow; };
      g.readout = () => `${kind}${kind === "dry" || kind === "wet" ? " " + fabric : ""}${kind === "sun" ? (white ? " white" : " black") : ""}, flow ${st.flow.toFixed(2)}`;
      return g;
    },
  });
})();
