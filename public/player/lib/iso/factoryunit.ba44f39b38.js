// "factoryunit cx cy k door=0..1 steam=0..1 lab=0 lit=building|roof|door|chimney|steam" — a PART (batch 6, economy):
// a small factory building on its yard, its origin the ground point under its middle, its front toward the room (+y).
// 600 × 400 × 500 cm: brick lower walls with a ribbed metal cladding above, a sawtooth roof of three teeth whose steep
// glazed faces look toward the front (north lights), roof sheeting ribs, three turbine ventilators, a round brick
// chimney with dark bands and a cap rising from the back tooth, a loading bay with a roller door in its guide rails and
// drum box, two yellow bollards, a side door, a row of office windows and a blank name board. The start of a supply
// chain. door 0 → 1 rolls the door up (cartons stand inside), steam 0 → 1 sends puffs from the chimney.
// set({ door, steam }). World: 1 = 1 cm. anchors: bay (the loading bay's floor middle, in the doorway), chimney (its top), top
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 300, HY = 200, ZE = 400, ZR = 500, BX = [20, 260], BZ = 300, CH = [-200, -120, 25, 640];
  ISO.add({
    name: "factoryunit", title: "Factory unit (part)", compare: null,
    about: "A small factory building 600 × 400 × 500 cm: sawtooth roof with glazed north lights, chimney, ventilators, a loading bay with a roller door; door rolls up, steam puffs from the chimney. anchors: bay chimney top",
    line: "factoryunit cx cy k door=0..1 steam=0..1 lab=0 lit=building|roof|door|chimney|steam",
    demo: { line: "factoryunit 480 480 0.52 door=0 steam=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { steam: 1, lit: "chimney" }, hold: 3 }, { set: { door: 1, lit: "door" }, hold: 4 }, { set: { lit: "roof" }, hold: 1.4 }, { set: { door: 0, steam: 0, lit: "building" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { door: B.num(o, "door", 0, 0, 1), steam: B.num(o, "steam", 0, 0, 1), ph: 0, lit: o.lit || "" };
      st.wd = st.door; st.ws = st.steam;
      const box = (x, y, z) => ISO.wbox(P, x, y, z, "mid");
      const BRICK = ISO.tint("#d9a08a", ["#8e4a36", "#9c5640", "#aa634c", "#b87158"], "#4a2014");
      const CLAD = ISO.tint("#dfe4e8", ["#97a2ac", "#a6b0b9", "#b5bec6", "#c4ccd3"], "#3e4852");
      const TRIM = ISO.tint("#7f9fb8", ["#34536c", "#3e5f79", "#496b86", "#567894"], "#14283a");
      const DARK = "#2e3236", yF = HY + 0.02, xS = HX + 0.02;
      // ── the walls: brick to 150, cladding to the eaves; ribs on the cladding, courses on the brick (printed, free)
      const walls = ISO.tinted(BRICK, box([-HX, HX], [-HY, HY], [0, 150])) + ISO.tinted(CLAD, box([-HX, HX], [-HY, HY], [150, ZE]));
      const ribs = [];
      for (let x = -HX + 20; x < HX; x += 20) if (x < BX[0] - 8 || x > BX[1] + 8) ribs.push([[x, yF, 152], [x, yF, ZE - 2]]); else ribs.push([[x, yF, BZ + 32], [x, yF, ZE - 2]]);
      for (let y = -HY + 20; y < HY; y += 20) ribs.push([[xS, y, 152], [xS, y, ZE - 2]]);
      const courses = [];
      for (let z = 15; z < 150; z += 15) { courses.push([[-HX, yF, z], [BX[0] - 8, yF, z]], [[BX[1] + 8, yF, z], [HX, yF, z]], [[xS, -HY, z], [xS, HY, z]]); }
      const texture = B.free(P, ribs, "#8a96a0", 0.6) + B.free(P, courses, "#8e4a36", 0.5, ' opacity=".7"');
      const sill = ISO.tinted(TRIM, box([-HX - 2, HX + 2], [-HY - 2, HY + 2], [148, 153]) + box([-HX - 3, HX + 3], [-HY - 3, HY + 3], [ZE - 4, ZE + 2]));
      // ── the windows (office row on the front, two on the side), the side door, the name board
      const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
      const win = (pts) => B.poly(P, pts, "#bcd3e2", "#14283a", 0.8) + B.free(P, [[mid(pts[0], pts[1]), mid(pts[3], pts[2])]], "#14283a", 0.6);
      let openings = "";
      for (const x of [-280, -220, -160]) openings += win([[x, yF, 220], [x + 45, yF, 220], [x + 45, yF, 300], [x, yF, 300]]);
      for (const y of [-120, 40]) openings += win([[xS, y + 60, 220], [xS, y, 220], [xS, y, 300], [xS, y + 60, 300]]);
      openings += ISO.tinted(TRIM, box([-95, -25], [HY, HY + 2], [0, 215])) + B.poly(P, [[-89, HY + 2.02, 6], [-31, HY + 2.02, 6], [-31, HY + 2.02, 209], [-89, HY + 2.02, 209]], "#4a6b86", "#14283a", 0.6) +
        K.dotsSvg([K.iso([-38, HY + 2.1, 105], P)], { size: 0.8 }) + ISO.tinted(TRIM, box([-100, -20], [HY, HY + 18], [222, 228]));
      const board = ISO.tinted(ISO.tint("#f6f2e6", ["#c4bca8", "#d0c8b6", "#dcd5c4", "#e8e2d2"], "#5a5242"), box([-280, -110], [HY, HY + 3], [330, 380]));
      // ── the loading bay: a dark recess with cartons inside, guide rails, the curtain (drawn by door), the drum box
      const inside = B.poly(P, [[BX[0], HY - 40, 0], [BX[1], HY - 40, 0], [BX[1], HY - 40, BZ], [BX[0], HY - 40, BZ]], DARK, "none") +
        B.poly(P, [[BX[0], HY - 40, 0], [BX[1], HY - 40, 0], [BX[1], HY, 0], [BX[0], HY, 0]], "#55595e", "none") +
        B.carton(P, [60, 120], [HY - 38, HY - 8], [0, 45], { label: false }) + B.carton(P, [70, 115], [HY - 36, HY - 10], [45, 85], { label: false }) + B.carton(P, [140, 200], [HY - 38, HY - 10], [0, 50], { label: false });
      const rails = ISO.tinted(TRIM, box([BX[0] - 8, BX[0]], [HY, HY + 6], [0, BZ]) + box([BX[1], BX[1] + 8], [HY, HY + 6], [0, BZ]));
      const drum = ISO.tinted(TRIM, box([BX[0] - 10, BX[1] + 10], [HY, HY + 22], [BZ, BZ + 32]));
      const bollard = (x) => ISO.tinted(ISO.tint("#f2d34a", ["#a68a14", "#b8981c", "#c8a828", "#d8b836"], "#4a3a04"), S(K.cylinder(x, HY + 40, 6, 0, 100, P, 16), { tone: "mid" })) +
        ISO.tinted(ISO.T.plastic, S(K.cylinder(x, HY + 40, 6.1, 70, 10, P, 16), { tone: "mid" }));
      // ── the roof: three teeth, back to front; each a prism with its glazed vertical face toward +y and sheeting ribs
      const D = (2 * HY) / 3;
      const tooth = (i) => {
        const yf = HY - D * i, yb = yf - D;
        let s = ISO.prismX(P, [[yb, ZE], [yf, ZE], [yf, ZR]], -HX, HX, ["#8e98a2", "#c8d0d6"], "#b4bec6", "#3e4852");
        s += B.poly(P, [[-HX + 8, yf + 0.03, ZE + 6], [HX - 8, yf + 0.03, ZE + 6], [HX - 8, yf + 0.03, ZR - 6], [-HX + 8, yf + 0.03, ZR - 6]], "#a9c7da", "#14283a", 0.8);
        const mull = []; for (let x = -HX + 8 + 48.4; x < HX - 10; x += 48.4) mull.push([[x, yf + 0.04, ZE + 6], [x, yf + 0.04, ZR - 6]]);
        const sheet = []; for (let x = -HX + 25; x < HX; x += 25) sheet.push([[x, yb + 2, ZE + 1.5], [x, yf - 2, ZR - 1.5]]);
        s += B.free(P, mull, "#14283a", 0.8) + B.free(P, sheet, "#8a96a0", 0.5) + B.free(P, [[[-HX + 30, yf + 0.05, ZR - 12], [-HX + 70, yf + 0.05, ZE + 12]]], "#ffffff", 1.6, ' opacity=".6" stroke-linecap="round"');
        return s;
      };
      const vent = (x, i) => {
        const yf = HY - D * i, y = yf - D * 0.45, z = ZE + 0.55 * (ZR - ZE), F0 = LAB.Z([x, y, z + 10]);
        return ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 9, z - 8, 18, P, 16), { tone: "mid" }) +
          S(G.lathe([[0, 0], [0, 16, 1], [10, 14, 1], [16, 6, 1], [18, 0]], F0, P, { steps: 20 }), { tone: "mid", inner: K.lineSvg(G.ribsOf(F0, 1, 9, 15.5, 10, P, { seams: true }), { tone: "faint" }) }));
      };
      // ── the chimney: brick shaft from the back tooth, two dark bands, a cap
      const [chx, chy, chr, chz] = CH;
      const chimney = ISO.tinted(BRICK, S(K.cylinder(chx, chy, chr, 440, chz - 440, P, 24), { tone: "mid", inner: K.lineSvg([480, 520, 560, 600].map((z) => K.sideArc(chx, chy, chr, z, P, 20)).join(""), { tone: "faint" }) })) +
        ISO.tinted(ISO.T.plastic, S(K.cylinder(chx, chy, chr + 1, chz - 40, 8, P, 24), { tone: "mid" }) + S(K.cylinder(chx, chy, chr + 4, chz - 6, 8, P, 24), { tone: "mid" }));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 10, y: -HY - 10, w: 2 * HX + 20, d: 2 * HY + 60, r: 10 }, 0, ZR, P)}"/>` +
        `<g data-name="building">${walls}${texture}${sill}${openings}${board}</g><g data-name="door">${inside}<g data-part="curtain"></g>${rails}${drum}</g><g data-name="building">${bollard(BX[0] - 30)}${bollard(BX[1] + 30)}</g>` +
        `<g data-name="roof">${tooth(2)}</g><g data-name="chimney">${chimney}</g><g data-name="roof">${vent(-60, 2) + vent(140, 2)}${tooth(1)}${vent(40, 1) + vent(220, 1)}${tooth(0)}</g>` +
        `<g data-name="steam" data-part="steam"></g><g data-part="words"></g>`;
      g.anchors = { bay: [(BX[0] + BX[1]) / 2, HY, 0], chimney: [chx, chy, chz], top: [0, 0, ZR] };
      const el = B.parts(g), w = ISO.writer();
      // the roller door: its curtain from the drum down to its bottom bar, slat lines across, the bottom rail
      const curtain = (f) => {
        const zb = BZ * f, y = HY + 2;
        if (zb > BZ - 2) return "";
        const slats = []; for (let z = zb + 12; z < BZ; z += 12) slats.push([[BX[0], y + 0.02, z], [BX[1], y + 0.02, z]]);
        return B.poly(P, [[BX[0], y, zb], [BX[1], y, zb], [BX[1], y, BZ], [BX[0], y, BZ]], "#c9d1d8", "#3e4852", 0.7) + B.free(P, slats, "#7d8892", 0.6) +
          ISO.tinted(TRIM, box([BX[0], BX[1]], [y - 1, y + 3], [zb, zb + 5])) + (f < 0.1 ? K.dotsSvg([K.iso([(BX[0] + BX[1]) / 2, y + 3.1, zb + 2.5], P)], { size: 0.8 }) : "");
      };
      const puffs = (amt, ph) => {
        if (amt < 0.01) return "";
        let s = "";
        for (let i = 0; i < 7; i++) {
          const f = (ph + i / 7) % 1, p = K.iso([chx + f * 60 + Math.sin(f * 5 + i) * 8, chy, chz + 10 + f * 170], P), r = (12 + f * 38) * G.scaleOf(P);
          s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r.toFixed(1)}" fill="#f4f6f8" stroke="#b9c2ca" stroke-width=".6" opacity="${(amt * 0.85 * Math.min(1, f * 6) * (1 - f)).toFixed(2)}"/>`;
        }
        return s;
      };
      const draw = () => {
        const d = Math.round(st.door * 100) / 100, a = Math.round(st.steam * 50) / 50, ph = Math.round(st.ph * 200) / 200;
        w.rebuild(el.curtain, `${d}`, () => curtain(d));
        w.rebuild(el.steam, `${a} ${a ? ph : 0}`, () => puffs(a, ph));
        if (lab) w.rebuild(el.words, "1", () => B.word(P, [HX, HY, ZE], "factory") + B.word(P, [HX, HY, 200], "loading bay", { size: 12, color: "#667" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.door !== undefined) st.wd = B.num(p, "door", st.wd, 0, 1);
        if (p.steam !== undefined) st.ws = B.num(p, "steam", st.ws, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the door rolls at a steady motor speed (about 8 s for the full lift); the steam drifts up in a 4 s cycle
      g.update = (dt) => {
        if (ISO.still()) { st.door = st.wd; st.steam = st.ws; draw(); return false; }
        st.door += ISO.clamp(st.wd - st.door, -dt / 3, dt / 3);
        st.steam = ISO.follow(st.steam, st.ws, dt, 0.8); if (Math.abs(st.steam - st.ws) < 0.01) st.steam = st.ws;
        st.ph = st.steam > 0 ? (st.ph + dt / 4) % 1 : 0;
        draw();
        return st.door !== st.wd || st.steam > 0 || st.steam !== st.ws;
      };
      g.readout = () => `factory · roller door ${st.wd > 0.95 ? "open" : st.wd < 0.05 ? "shut" : "part open"} · ${st.ws > 0 ? "chimney steaming" : "chimney quiet"} · 6 × 4 m, 5 m tall`;
      draw();
      return g;
    },
  });
})();
