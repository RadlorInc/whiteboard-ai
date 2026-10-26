// "skyframe cx baseY height floors=8 forces=0|1" — a steel-frame office block going up, as a museum model.
// On a walnut plinth: the concrete ground slab with column base plates, a 4 × 2 bay frame of steel columns (spliced
// every storey) and beams in red-oxide primer, a metal deck on every floor, cross bracing in the core bay, the lower
// three floors closed in with a glass curtain wall (mullions and spandrels), and a tower crane beside it. set floors=n
// and the crane erects the next storeys piece by piece: each column or beam is lowered on the hook into its place.
// forces=1 shows the load path: each floor's load into the beams, the beams into the columns, the column load growing
// storey by storey toward the base. World units: 0.25 m (bays 6 m, storeys 3.6 m).
(() => {
  const K = window.K, G = window.G, M = window.MODEL, S = M.S;
  const BX = 24, BY = 24, NX = 4, NY = 2, FH = 14.4, MAXF = 10, GLAZED = 3;
  const XS = [...Array(NX + 1)].map((_, i) => i * BX), YS = [...Array(NY + 1)].map((_, j) => -j * BY);
  const PLINTH = { x: -46, y: -74, w: 160, d: 100, r: 4 };
  const MAST = [-26, -24], MZ = MAXF * FH + 26;
  const RED = ISO.tint("#eba083", ["#9a4a2e", "#b05a3a", "#c46a48", "#d67e5c"], "#5a2414");
  const DECK = ISO.tint("#e4e6e9", ["#a2a5ab", "#b6b9be", "#c7c9cd", "#d5d7da"], "#4a4f56");
  const Y = ISO.tint("#ffd84d", ["#c99a12", "#d9ab1f", "#e7bd33", "#f2cd45"], "#6b5208"), YI = "#8a6414", YF = "#f2c230";
  const DEAD = 4, LIVE = 2.5, TRIB = 36, STEEL = 55;                    // kPa, kPa, m² per inner column, kg/m² of floor

  // The members of storey k (1-based): its columns, then the beams at its top, as boxes with a world centre.
  const membersOf = (k) => {
    const z0 = (k - 1) * FH + 0.6, z1 = k * FH + 0.6, out = [];
    for (const x of XS) for (const y of YS) out.push({ kind: "col", c: [x, y, (z0 + z1) / 2], box: [[x - 0.7, x + 0.7], [y - 0.7, y + 0.7], [z0, z1 - 1.2]] });
    for (const y of YS) for (let i = 0; i < NX; i++) out.push({ kind: "beam", c: [XS[i] + BX / 2, y, z1 - 0.6], box: [[XS[i] + 0.7, XS[i + 1] - 0.7], [y - 0.4, y + 0.4], [z1 - 1.2, z1]] });
    for (const x of XS) for (let j = 0; j < NY; j++) out.push({ kind: "beam", c: [x, YS[j] - BY / 2, z1 - 0.6], box: [[x - 0.4, x + 0.4], [YS[j] - BY + 0.7, YS[j] - 0.7], [z1 - 1.2, z1]] });
    return out;
  };
  const boxSvg = (P, m, lit) => ISO.tinted(RED, ISO.wbox(P, ...m.box, "mid", lit));
  // one storey's members sorted far to near, up to count of them (the ones already erected)
  const storeySvg = (P, k, count) => membersOf(k).slice(0, count).sort((a, b) => K.depthOf(a.c, P) - K.depthOf(b.c, P))
    .map((m) => M.named(m.kind === "col" ? "columns" : "beams", boxSvg(P, m))).join("");
  // the deck on floor k, its bracing (above the glazed floors) and curtain wall (glazed floors)
  const deckSvg = (P, k) => M.named("deck", ISO.tinted(DECK, ISO.wbox(P, [-0.4, XS[NX] + 0.4], [YS[NY] - 0.4, 0.4], [k * FH + 0.6, k * FH + 1.4], "mid")));
  const braceSvg = (P, k) => {
    const z0 = (k - 1) * FH + 1.4, z1 = k * FH - 0.6, x0 = XS[2] + 0.7, x1 = XS[3] - 0.7, kk = K.cameraOf(P).k;
    const d = [[[x0, 0.5, z0], [x1, 0.5, z1]], [[x1, 0.5, z0], [x0, 0.5, z1]]].map(([a, b]) => K.pathOf([K.iso(a, P), K.iso(b, P)])).join("");
    return M.named("bracing", `<path d="${d}" fill="none" stroke="#5a2414" stroke-width="${(1.3 * kk).toFixed(2)}"/><path d="${d}" fill="none" stroke="#c46a48" stroke-width="${(0.8 * kk).toFixed(2)}"/>`);
  };
  const glassSvg = (P, k) => {
    const z0 = (k - 1) * FH + 1.4, z1 = k * FH + 0.6, out = [];
    const pane = (pts) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="#cfe6f6" fill-opacity=".85" stroke="#3a5a74" stroke-width=".7"/>`;
    const band = (pts) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="#7d8a96" stroke="#3a4650" stroke-width=".6"/>`;
    for (let i = 0; i < NX; i++) for (let m = 0; m < 3; m++) {
      const a = XS[i] + (m * BX) / 3, b = a + BX / 3, y = 0.9;
      out.push(pane([[a, y, z0], [b, y, z0], [b, y, z1 - 2.4], [a, y, z1 - 2.4]]), band([[a, y, z1 - 2.4], [b, y, z1 - 2.4], [b, y, z1], [a, y, z1]]));
    }
    for (let j = 0; j < NY; j++) for (let m = 0; m < 3; m++) {
      const a = YS[j] - (m * BY) / 3, b = a - BY / 3, x = XS[NX] + 0.9;
      out.push(pane([[x, a, z0], [x, b, z0], [x, b, z1 - 2.4], [x, a, z1 - 2.4]]), band([[x, a, z1 - 2.4], [x, b, z1 - 2.4], [x, b, z1], [x, a, z1]]));
    }
    return M.named("glazing", out.join(""));
  };
  // everything up to (and including) n whole storeys, built once per n
  const storeyAll = (P, k) => storeySvg(P, k, 1e9) + (k > GLAZED ? braceSvg(P, k) : glassSvg(P, k)) + deckSvg(P, k);
  function baseSvg(P) {
    const out = [M.plinth(P, PLINTH)];
    out.push(ISO.tinted(M.tintOf("concrete"), S(K.slabOf({ x: -6, y: YS[NY] - 6, w: XS[NX] + 12, d: BY * NY + 12, r: 0.6 }, 0, 0.6, P, 2), { tone: "mid" })));
    for (const x of XS) for (const y of YS) out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [x - 1.6, x + 1.6], [y - 1.6, y + 1.6], [0.6, 0.6 + 0.01], "mid")));
    // the crane's base: a concrete pad and the mast foot
    out.push(ISO.tinted(M.tintOf("concrete"), S(K.slabOf({ x: MAST[0] - 7, y: MAST[1] - 7, w: 14, d: 14, r: 0.6 }, 0, 2, P, 2), { tone: "mid" })));
    // a stack of beams and a site cabin waiting on the plinth
    for (let i = 0; i < 3; i++) out.push(ISO.tinted(RED, ISO.wbox(P, [8 + i * 0.1, 30], [8 + i * 2.2, 9.6 + i * 2.2], [0, 1.2], "mid")));
    out.push(ISO.tinted(ISO.T.paint, ISO.wbox(P, [60, 84], [6, 16], [0, 10], "mid")), ISO.tinted(ISO.T.glass, ISO.wbox(P, [64, 72], [16, 16.3], [4, 8], "hi")));
    return out.join("");
  }
  // the crane: lattice mast, then (per pose) the jib slewed to angle a with the trolley at radius r and the hook
  const tube = (d, w, k) => `<path d="${d}" fill="none" stroke="${YI}" stroke-width="${((w + 0.6) * k).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${YF}" stroke-width="${(w * k).toFixed(2)}" stroke-linecap="round"/>`;
  const segs = (P, list) => list.map(([a, b]) => K.pathOf([K.iso(a, P), K.iso(b, P)])).join("");
  function mastSvg(P) {
    const k = K.cameraOf(P).k, h = 2.4, [mx, my] = MAST, c = [[-h, -h], [h, -h], [h, h], [-h, h]], br = [];
    for (let z = 2; z < MZ - 1; z += 6) for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; br.push([[mx + a[0], my + a[1], z], [mx + b[0], my + b[1], Math.min(MZ, z + 6)]]); }
    return M.named("crane", `<path d="${segs(P, br)}" fill="none" stroke="${YI}" stroke-width="${(0.5 * k).toFixed(2)}"/>` + tube(segs(P, c.map(([x, y]) => [[mx + x, my + y, 2], [mx + x, my + y, MZ]])), 0.9, k));
  }
  function jibSvg(P, a, r) {
    const k = K.cameraOf(P).k, [mx, my] = MAST, d = [Math.cos(a), Math.sin(a)], at = (s, l, z) => [mx + s * d[0] - l * d[1], my + s * d[1] + l * d[0], z];
    const JL = 150, out = [];
    out.push(ISO.tinted(Y, ISO.box((u, w, y) => at(u, y, w), P, [-4, 4], [MZ, MZ + 4], [-4, 4], "mid")));
    out.push(tube(segs(P, [[at(4, -2, MZ + 1), at(JL, -2, MZ + 1)], [at(4, 2, MZ + 1), at(JL, 2, MZ + 1)], [at(4, 0, MZ + 7), at(JL - 4, 0, MZ + 2)], [at(-4, -2, MZ + 1), at(-40, -2, MZ + 1)], [at(-4, 2, MZ + 1), at(-40, 2, MZ + 1)]]), 0.8, k));
    const zz = []; for (let s = 4; s < JL - 8; s += 8) zz.push([at(s, -2, MZ + 1), at(s + 4, 0, MZ + 7 - (5 * (s + 4)) / JL)], [at(s + 4, 0, MZ + 7 - (5 * (s + 4)) / JL), at(s + 8, 2, MZ + 1)]);
    out.push(`<path d="${segs(P, zz)}" fill="none" stroke="${YI}" stroke-width="${(0.5 * k).toFixed(2)}"/>`);
    out.push(ISO.tinted(M.tintOf("concrete"), ISO.box((u, w, y) => at(u, y, w), P, [-40, -32], [MZ - 8, MZ + 1], [-3.4, 3.4], "mid")));
    out.push(ISO.tinted(Y, ISO.box((u, w, y) => at(u, y, w), P, [r - 2.5, r + 2.5], [MZ - 1, MZ + 1], [-3, 3], "mid")));
    return M.named("crane", out.join(""));
  }
  // the hook block on its rope under the trolley, with the slings to the member it carries
  function hookSvg(P, a, r, hz, hang) {
    const k = K.cameraOf(P).k, [mx, my] = MAST, d = [Math.cos(a), Math.sin(a)], at = (s, l, z) => [mx + s * d[0] - l * d[1], my + s * d[1] + l * d[0], z], out = [];
    out.push(`<path d="${segs(P, [[at(r, 0, MZ - 1), at(r, 0, hz + 2.4)]])}" fill="none" stroke="#2f343a" stroke-width="${(0.4 * k).toFixed(2)}"/>`);
    out.push(ISO.tinted(Y, ISO.box((u, w, y) => at(u, y, w), P, [r - 1.4, r + 1.4], [hz + 0.6, hz + 2.4], [-1, 1], "hi")));
    if (hang) out.push(`<path d="${segs(P, [[at(r, 0, hz + 0.6), hang[0]], [at(r, 0, hz + 0.6), hang[1]]])}" fill="none" stroke="#3c3f45" stroke-width="${(0.35 * k).toFixed(2)}"/>`);
    return M.named("crane", out.join(""));
  }
  // forces: per storey, arrows beside the front columns, longer the more floors they carry; floor-load arrows on top
  function forceSvg(P, n) {
    const out = [], red = "#c0392b", y = 2.2;
    for (let k = 1; k <= n; k++) for (const x of XS) {
      const above = n - k + 1, len = 2 + 9 * (above / MAXF), zc = (k - 0.5) * FH;
      out.push(M.arrow(P, [x + 2.6, y, zc + len / 2], [x + 2.6, y, zc - len / 2], { color: red, w: 1 + 1.6 * (above / MAXF), head: 3 }));
    }
    for (let i = 0; i < NX; i++) for (const f of [0.3, 0.7]) { const x = XS[i] + BX * f, z = n * FH + 1.4; out.push(M.arrow(P, [x, y - 1.4, z + 6], [x, y - 1.4, z + 0.4], { color: "#1f4f8f", w: 1, head: 2.2 })); }
    return out.join("");
  }

  ISO.add({
    name: "skyframe", title: "Steel-frame building", compare: "skyframe 480 500 440",
    about: "A model of a steel-frame office block going up: columns, beams, decks, bracing, a glass curtain wall on the lower floors and a tower crane lowering each member into place.",
    line: "skyframe cx baseY height floors=1..10 forces=0|1 lab=1 lit=columns|beams|bracing|deck|glazing|crane",
    demo: { line: "skyframe 480 505 450 floors=5", script: [{ set: { floors: 6 }, hold: "settle" }, { set: { floors: 8 }, hold: "settle" }, { set: { forces: 1 }, hold: 2.5 }] },
    make([cx, by, size = 380], o, t, parent) {
      const lab = o.lab !== "0", H = size, W = size * 1.5;
      const { P, g } = ISO.frame([...K.boxCorners(PLINTH, -13, 0), [MAST[0], MAST[1], MZ + 8], [MAST[0] + 150 * Math.cos(-0.15), MAST[1] + 150 * Math.sin(-0.15), MZ], [MAST[0] - 40, MAST[1] + 8, MZ]], cx, by - H / 2, W, H, { azimuth: 52, elevation: 20 }, parent);
      g.innerHTML = `<g>${baseSvg(P)}</g><g data-part="mast-back"></g><g data-part="frame"></g><g data-part="storey"></g><g data-part="hung"></g><g data-part="jib"></g><g data-part="hook"></g><g data-part="force"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      const start = ISO.clamp(Math.round(ISO.num(o, "floors", 8)), 1, MAXF);
      const s = { done: start, prog: 0, want: start, forces: o.forces === "1", a: -0.15, r: 60, hz: MZ - 30 };
      const MEM = new Map(), memo = (key, fn) => { if (!MEM.has(key)) MEM.set(key, fn()); return MEM.get(key); };
      const per = membersOf(1).length;
      // the mast stands left of the building, behind it; drawn once in the back slot
      el["mast-back"].innerHTML = mastSvg(P);
      let lit = o.lit || "";
      const target = () => {                                                // where the hook is going and what it carries
        if (s.done >= s.want) return null;
        const k = s.done + 1, list = membersOf(k), i = Math.min(per - 1, Math.floor(s.prog)), m = list[i], f = s.prog - i;
        return { k, i, m, f };
      };
      const draw = () => {
        // storeys built so far, each built once: the frame is the joined list (adding a storey costs one storey)
        w.rebuild(el.frame, s.done, () => { let out = ""; for (let k = 1; k <= s.done; k++) out += memo(`f${k}`, () => storeyAll(P, k)); return out; });
        const tg = target();
        w.rebuild(el.storey, tg ? `${tg.k} ${tg.i}` : "", () => (tg ? memo(`s${tg.k} ${tg.i}`, () => storeySvg(P, tg.k, tg.i)) : ""));
        let hang = null;
        if (tg) {
          // the member comes down from 18 units above its place, eased into its seat
          const lift = 18 * (1 - ISO.ease(Math.min(1, tg.f * 1.25))), b = tg.m.box.map((r, j) => (j === 2 ? [r[0] + lift, r[1] + lift] : r));
          const mm = { ...tg.m, box: b };
          const top = [(b[0][0] + b[0][1]) / 2, (b[1][0] + b[1][1]) / 2, b[2][1]];
          s.a = Math.atan2(top[1] - MAST[1], top[0] - MAST[0]); s.r = Math.hypot(top[0] - MAST[0], top[1] - MAST[1]); s.hz = top[2] + 6;
          const alongX = b[0][1] - b[0][0] > b[1][1] - b[1][0];
          hang = tg.m.kind === "col" ? [top, top] : alongX ? [[b[0][0] + 3, top[1], top[2]], [b[0][1] - 3, top[1], top[2]]] : [[top[0], b[1][0] + 3, top[2]], [top[0], b[1][1] - 3, top[2]]];
          w.rebuild(el.hung, `${tg.k} ${tg.i} ${lift.toFixed(1)}`, () => boxSvg(P, mm, true));
        } else w.rebuild(el.hung, "", () => "");
        w.rebuild(el.jib, `${s.a.toFixed(3)} ${s.r.toFixed(1)}`, () => jibSvg(P, s.a, s.r));
        w.rebuild(el.hook, `${s.a.toFixed(3)} ${s.r.toFixed(1)} ${s.hz.toFixed(1)} ${hang ? hang.flat().map((v) => v.toFixed(1)).join() : ""}`, () => hookSvg(P, s.a, s.r, s.hz, hang));
        const n = s.done;
        w.rebuild(el.force, s.forces ? n : "", () => (s.forces ? forceSvg(P, n) : ""));
        w.rebuild(el.words, lab ? `${n}` : "", () => !lab ? "" : [
          M.label(P, [XS[NX] + 2, 0, GLAZED * FH * 0.5], "glass curtain wall", "#1f4f8f", { anchor: "start", dy: 4 }),
          n > GLAZED ? M.label(P, [XS[NX] + 2, 0, (GLAZED + 0.5) * FH], "steel columns and beams", "#5a2414", { anchor: "start", dy: 4 }) : "",
          M.label(P, [MAST[0], MAST[1], MZ * 0.55], "tower crane", "#6b5208", { anchor: "end", dx: 0, dy: 0 })].join(""));
        // light only when parts were rebuilt or the choice changed (querying ~500 parts every frame is the costly bit)
        const lk = `${lit} ${n} ${tg ? tg.k + " " + tg.i : ""}`;
        if (lk !== lastLit) { lastLit = lk; M.light(g, w, lit); }
      };
      let lastLit = null;
      g.set = (p) => {
        if (p.floors !== undefined) {
          s.want = ISO.clamp(Math.round(+p.floors), 1, MAXF);
          if (s.want < s.done) { s.done = s.want; s.prog = 0; }
        }
        if (p.forces !== undefined) s.forces = String(p.forces) === "1";
        if (p.lit !== undefined) lit = p.lit;
      };
      // members go up one after another, quicker when several storeys are still to build
      g.update = (dt) => {
        if (s.done < s.want) {
          if (ISO.still()) { s.done = s.want; s.prog = 0; }
          else {
            s.prog += dt * 6 * Math.min(3, s.want - s.done);
            if (s.prog >= per) { s.done++; s.prog = 0; }
          }
        }
        draw();
        return s.done < s.want;
      };
      g.readout = () => {
        const n = s.done, col = TRIB * (DEAD + LIVE) * n, area = (BX * NX * BY * NY) / 16;
        return `${n} storeys up · an inner column carries ${TRIB} m² × (${DEAD} dead + ${LIVE} live kPa) per floor = ${(TRIB * (DEAD + LIVE)).toFixed(0)} kN a floor, ${col.toFixed(0)} kN at its base · steel so far ≈ ${((STEEL * area * n) / 1000).toFixed(0)} t`;
      };
      draw();
      if (t) label(parent, cx, by - H - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
