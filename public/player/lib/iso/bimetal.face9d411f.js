// "bimetal cx cy width k=cold|hot lab=1 lit=…" — a brass-on-steel bimetallic strip clamped over a Bunsen flame.
// Brass expands about 19 µm per metre per °C, steel 12, so heated the strip curls toward the steel side with curvature
// κ ≈ 1.5·Δα·ΔT ÷ t (equal layers, t = 1 mm; drawn thicker so you can see both). The 150 mm strip's free end drops about
// 0.12 mm per °C; at about 200 °C it reaches a contact screw and closes a circuit that lights a lamp (a fire alarm, a
// thermostat). set({ heat: 1|0 }) lights or puts out the burner.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -126, y: -50, w: 246, d: 104, r: 7 }, X0 = -68, Z0 = 100, LEN = 150, LAY = 3, DA = 7e-6, GAP = 22, CX = 78, ROOM = 20, HOT = 320;
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const kOf = (T) => (1.5 * DA * (T - ROOM)) / 1;                     // per mm, t = 1 mm
  const dropAt = (k, s) => (k < 1e-9 ? 0 : (1 - Math.cos(k * s)) / k);
  const touchK = (() => { let lo = 0, hi = 0.01; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; dropAt(m, CX - X0) > GAP ? (hi = m) : (lo = m); } return lo; })();
  const wire = (P, pts, color) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="#1d1f22" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${K.pathOf(pts.map((p) => K.iso(p, P)))}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>` + D([K.iso(pts[0], P), K.iso(pts[pts.length - 1], P)], { size: 1, tone: "hi" });

  function strip(P, k) {
    const n = 30, mid = [], up = [], lo = [];
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * LEN, th = k * s, x = X0 + (k < 1e-9 ? s : Math.sin(th) / k), z = Z0 - dropAt(k, s), nx = Math.sin(th), nz = Math.cos(th);
      mid.push([x, z]); up.push([x + nx * LAY, z + nz * LAY]); lo.push([x - nx * LAY, z - nz * LAY]);
    }
    return `<g data-name="strip">${ISO.prismY(P, [...mid, ...lo.reverse()], -6, 6, ["#8d9096", "#c7c9cd"], "#d9dadd", "#3c3f45")}${ISO.prismY(P, [...up, ...mid.slice().reverse()], -6, 6, ["#c9a85a", "#eed8a0"], "#f6e7bf", "#6b5114")}</g>`;
  }
  function rigSvg(P, part) {
    const out = [];
    if (part === "back") {
      out.push(ISO.baseboard(P, BOARD), ISO.plate(P, { x: 70, y: -44, w: 40, d: 14, r: 1.2 }));
      // Retort stand: base, rod, boss, arm to the clamp.
      out.push(`<g data-name="stand">`, ISO.wbox(P, [-118, -76], [-44, -8], [0, 4], "mid"), S(K.cylinder(-100, -26, 2.6, 4, 116, P, 18), { tone: "mid", crease: "none" }));
      out.push(ISO.wbox(P, [-105, -95], [-31, -21], [Z0 - 6, Z0 + 6], "mid"), S(G.disc(0, 24, 2, G.frameOf([-100, -21, Z0], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }));
      out.push(ISO.wbox(P, [-104, X0 + 6], [-8, -2], [Z0 - 2, Z0 + 2], "mid"), ISO.wbox(P, [X0 - 8, X0 + 8], [-9, 9], [Z0 - 9, Z0 - 3], "mid"), `</g>`);
      // Burner under the middle of the strip, with its hose to a gas tap.
      out.push(ISO.wbox(P, [20, 40], [-44, -30], [0, 10], "mid"), S(G.disc(0, 8, 2.4, G.frameOf([30, -30, 6], [0, 1, 0], [1, 0, 0], [0, 0, 1]), P), { tone: "mid" }));
      const hose = [[30, -22, 6], [24, -16, 2.5], [8, -6, 2.5], [4, -2, 3]];
      out.push(`<path d="${K.pathOf(hose.map((p) => K.iso(p, P)))}" fill="none" stroke="#2a2b2f" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><path d="${K.pathOf(hose.map((p) => K.iso(p, P)))}" fill="none" stroke="#c0392b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`);
      out.push(`<g data-name="burner">`, S(K.cylinder(-6, 0, 13, 0, 4, P, 40, 0.5), { tone: "mid" }), S(K.cylinder(-6, 0, 4.2, 4, 40, P, 24), { tone: "mid", crease: "none" }));
      out.push(S(K.cylinder(-6, 0, 5.4, 10, 7, P, 24, 0.3), { tone: "mid" }), S(K.cylinder(-6, 0, 4.8, 42, 3, P, 24), { tone: "mid" }), `</g>`);
      // Contact: an insulated post under the free end, a brass contact screw with its lock nut.
      out.push(`<g data-name="contact">`, S(K.cylinder(CX, 0, 7, 0, 3, P, 28, 0.4), { tone: "mid" }), ISO.tinted(ISO.T.plastic, S(K.cylinder(CX, 0, 3.6, 3, 56, P, 20), { tone: "hi", crease: "none" })));
      out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(CX, 0, 4.4, 59, 4, P, 6), { tone: "hi" }) + S(K.cylinder(CX, 0, 1.5, 63, Z0 - LAY - GAP - 63 - 1.2, P, 12), { tone: "hi" }) + S(K.cylinder(CX, 0, 2.4, Z0 - LAY - GAP - 1.2, 1.2, P, 16), { tone: "hi" })));
      out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(CX, 0, 2.2, 6, 3, P, 6), { tone: "hi" })), `</g>`);
    }
    if (part === "front") {
      out.push(`<g data-name="stand">${ISO.wbox(P, [X0 - 8, X0 + 8], [-9, 9], [Z0 + 3, Z0 + 9], "mid")}${S(K.cylinder(X0, 0, 1.4, Z0 + 9, 5, P, 12), { tone: "mid" })}${ISO.tinted(ISO.T.plastic, S(K.cylinder(X0, 0, 3.6, Z0 + 14, 3, P, 18), { tone: "hi" }) + L(K.knurl(X0, 0, 3.6, Z0 + 14, Z0 + 17, 14, P), { tone: "lo" }))}</g>`);
      // Cells and the lamp at the front, and the wires: clamp → cells → lamp → contact post.
      out.push(`<g data-name="cells">`, ISO.wbox(P, [-60, -16], [24, 40], [0, 3], "mid"));
      for (const x of [-56, -36]) { const F = G.frameOf([x, 32, 10], [1, 0, 0], [0, 1, 0], [0, 0, 1]); out.push(ISO.tinted(ISO.T.copper, S(G.disc(0, 3, 5.5, F, P), { tone: "hi" })), S(G.disc(3, 17, 5.5, F, P), { tone: "hi" }), S(G.disc(17, 18.2, 2, F, P), { tone: "mid" })); }
      out.push(`</g>`);
      out.push(wire(P, [[X0 - 8, 9, Z0 + 6], [X0 - 14, 9, Z0 + 6], [X0 - 14, 20, 1], [-60, 32, 8]], "#1d1f22"));
      out.push(wire(P, [[-17, 32, 10], [-4, 32, 1], [30, 32, 1], [36, 32, 7]], "#c0392b"));
      out.push(wire(P, [[50, 32, 7], [70, 20, 1], [CX, 8, 1], [CX, 2.2, 9]], "#c0392b"));
    }
    return out.join("");
  }
  function lampSvg(P, on) {
    const x = 43, y = 32, out = [`<g data-name="lamp">`, ISO.wbox(P, [x - 12, x + 12], [y - 8, y + 8], [0, 4], "mid")];
    for (const e of [x - 10, x + 6]) out.push(ISO.tinted(ISO.T.brass, ISO.wbox(P, [e, e + 4], [y - 3, y + 1], [4, 7], "hi")));
    out.push(S(K.cylinder(x, y, 5, 4, 5, P, 28, 0.4), { tone: "mid" }), ISO.tinted(ISO.T.brass, S(K.cylinder(x, y, 3.4, 9, 5, P, 24), { tone: "hi" }) + L(K.knurl(x, y, 3.4, 9, 14, 10, P), { tone: "lo" })));
    const c = K.iso([x, y, 21], P);
    if (on > 0.01) out.push(`<circle cx="${c[0]}" cy="${c[1]}" r="${(18 * on).toFixed(1)}" fill="url(#bmglow)" opacity="${on.toFixed(2)}"/>`);
    out.push(ISO.tinted(on > 0.5 ? ISO.T.amber : ISO.T.glass, S(G.sphereOf([x, y, 21], 7, P), { tone: "hi" })), `</g>`);
    return out.join("");
  }

  ISO.add({
    name: "bimetal", title: "Bimetallic strip", compare: "bimetal 480 250 400 k=hot",
    about: "A brass-on-steel strip clamped over a flame: brass expands more, so it bends toward the steel until it touches a contact and lights a lamp.",
    line: "bimetal cx cy width k=cold|hot lab=1 lit=strip|contact|lamp|burner",
    demo: { line: "bimetal 480 270 420", script: [{ set: {}, hold: 1 }, { set: { heat: 1 }, hold: "settle" }, { set: { heat: 0 }, hold: "settle" }] },
    make([cx, cy, size = 400], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.4, H = size * 0.95;
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -12, 0), [-100, -26, 122], [X0, 0, Z0 + 18]], cx, cy, W, H, { azimuth: 64, elevation: 20 }, parent);
      const hot = o.k === "hot", s = { T: hot ? HOT : ROOM, heat: hot ? 1 : 0, flame: hot ? 1 : 0, glow: 0 };
      const defs = `<defs><radialGradient id="bmglow"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd84a" stop-opacity=".5"/><stop offset="1" stop-color="#ffd84a" stop-opacity="0"/></radialGradient></defs>`;
      g.innerHTML = defs + `<g>${rigSvg(P, "back")}</g><g data-part="flame"></g><g data-part="strip"></g><g>${rigSvg(P, "front")}</g><g data-part="lamp"></g><g data-part="words"></g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer();
      let lit = o.lit || "strip";
      const base = K.iso([-6, 0, 45], P), rise = K.screenRise(1, P), fx = ISO.flameFx(g, P, W, H, el.flame, [-6, 0, 45], 40);
      const kNow = () => Math.min(kOf(s.T), touchK), touching = () => kOf(s.T) >= touchK;
      const draw = () => {
        w.rebuild(el.strip, kNow().toExponential(4), () => strip(P, kNow()));
        if (fx) fx.flame(1, s.flame);
        else w.rebuild(el.flame, s.flame.toFixed(2), () => {
          if (s.flame < 0.02) return "";
          const h = 50 * s.flame * rise, wd = 5.5 * rise, [bx, by] = base;
          const cone = (hh, ww) => `M${bx - ww} ${by}C${bx - ww} ${by - hh * 0.45} ${bx - ww * 0.3} ${by - hh * 0.8} ${bx} ${by - hh}C${bx + ww * 0.3} ${by - hh * 0.8} ${bx + ww} ${by - hh * 0.45} ${bx + ww} ${by}Z`;
          return `<path d="${cone(h, wd)}" fill="#8fc3ff" fill-opacity=".55" stroke="#3d7fd1" stroke-width=".6"/><path d="${cone(h * 0.45, wd * 0.55)}" fill="#3d7fd1" fill-opacity=".75"/>`;
        });
        w.rebuild(el.lamp, s.glow.toFixed(2), () => lampSvg(P, s.glow));
        w.rebuild(el.words, lab ? String(touching()) : "", () => !lab ? "" :
          ISO.word(K.iso([X0 + 20, 6, Z0 + LAY], P), "brass", "#8a6a10", { size: 14, dy: -8 }) + ISO.word(K.iso([X0 + 20, 6, Z0 - LAY], P), "steel", "#4d5158", { size: 14, dy: 18 }) +
          ISO.word(K.iso([CX + 4, 0, 50], P), "contact", "#555", { size: 13, anchor: "start" }) + ISO.word(K.iso([43, 40, 0], P), touching() ? "lamp on" : "lamp", touching() ? "#c45a00" : "#555", { size: 13, dy: 16 }) +
          ISO.word(K.iso([-38, 40, 0], P), "cells", "#555", { size: 13, dy: 16 }));
        const parts = [...g.querySelectorAll("[data-name]")];
        w.light(parts, parts.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => { if (p.heat !== undefined) s.heat = +p.heat ? 1 : 0; if (p.k) s.heat = p.k === "hot" ? 1 : 0; if (p.lit) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), target = s.heat ? HOT : ROOM;
        s.flame = ISO.follow(s.flame, s.heat, dt, s.heat ? 0.3 : 0.1, calm);
        s.T = calm ? target : Math.abs(target - s.T) < 0.5 ? target : target + (s.T - target) * Math.exp(-dt / (s.heat ? 2.2 : 3));
        s.glow = ISO.follow(s.glow, touching() ? 1 : 0, dt, 0.12, calm);
        draw();
        return s.T !== target || Math.abs(s.flame - s.heat) > 0.01 || s.glow !== (touching() ? 1 : 0);
      };
      g.readout = () => {
        const drop = dropAt(kNow(), LEN);
        return `strip ${s.T.toFixed(0)} °C · free end bent ${drop.toFixed(0)} mm toward the steel (brass expands 19, steel 12 µm per m per °C) · ${touching() ? "touching the contact: lamp on" : s.T > ROOM + 1 ? "not yet at the contact" : "cold: straight"}`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
