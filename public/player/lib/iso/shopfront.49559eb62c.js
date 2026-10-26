// "shopfront cx cy k sign=0..1 awning=0..1 lab=0 lit=building|window|goods|door|sign|board|awning" — a PART (batch 6,
// economy): the front of a small corner shop standing on the pavement, its origin the ground point under its middle,
// the shop front toward the room (+y face at y = 60). 400 × 120 × 350 cm: rendered walls on a plinth, pilasters, a
// big shop window (painted timber frame, transom bar, sill, a stall riser below) with goods on three glass shelves
// behind it, a glazed door with its push bar, kick plate and stone step, an OPEN / CLOSED card hanging inside the door
// glass, a blank sign board (no brand) under a cornice and parapet, and a striped awning in its cassette over the
// window. sign 0 → 1 turns the card from CLOSED to OPEN on its cord; awning 0 → 1 winds the awning out (110 cm, its
// front bar dropping 45 cm) with its scalloped valance. set({ sign, awning }). World: 1 = 1 cm. anchors: door (the step's
// middle), board (the sign board's middle), top
(() => {
  const K = window.K, S = (p, s) => K.solidSvg(p, s);
  const HX = 200, HY = 60, H = 350, WX = [-185, 60], DX = [85, 180], ZW = [45, 230], ZBD = [250, 300], AZ = 240;
  ISO.add({
    name: "shopfront", title: "Shop front (part)", compare: null,
    about: "The front of a small corner shop, 400 × 120 × 350 cm: shop window with goods, glass door with an OPEN / CLOSED card, a blank sign board and a striped awning that winds out. anchors: door board top",
    line: "shopfront cx cy k sign=0..1 awning=0..1 lab=0 lit=building|window|goods|door|sign|board|awning",
    demo: { line: "shopfront 470 470 1.1 sign=0 awning=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { sign: 1, lit: "sign" }, hold: "settle" }, { set: { awning: 1, lit: "awning" }, hold: "settle" }, { set: { lit: "goods" }, hold: 1.4 }, { set: { awning: 0.4, sign: 0, lit: "door" }, hold: "settle" }, { set: { lit: "board" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { sign: B.num(o, "sign", 0, 0, 1), awn: B.num(o, "awning", 0, 0, 1), lit: o.lit || "" };
      st.ws = st.sign; st.wa = st.awn;
      const box = (x, y, z) => ISO.wbox(P, x, y, z, "mid");
      const RENDER = ISO.tint("#efe6d6", ["#b9ab94", "#c7baa4", "#d5c9b5", "#e2d8c6"], "#5e5442");
      const FRAME = ISO.tint("#5f8f78", ["#24463a", "#2c5446", "#356252", "#40705f"], "#10241c");
      const STONE = ISO.tint("#d8d6d0", ["#9a988f", "#a8a69e", "#b6b4ad", "#c4c2bc"], "#4a4842");
      const F = HY;   // the facade plane
      // ── the building: a plinth course, the wall mass with the openings left as recesses (dark interior behind)
      const walls = ISO.tinted(RENDER, box([-HX, HX], [-HY, F - 12], [0, H - 10]) +
        box([-HX, WX[0]], [F - 12, F], [0, ZBD[0]]) + box([WX[1], DX[0]], [F - 12, F], [0, ZBD[0]]) + box([DX[1], HX], [F - 12, F], [0, ZBD[0]]) +
        box([WX[0], WX[1]], [F - 12, F], [0, ZW[0]]) + box([-HX, HX], [F - 12, F], [ZW[1], ZBD[0]]));
      const plinth = ISO.tinted(STONE, box([-HX - 1, DX[0]], [F - 12, F + 1.5], [0, 18]) + box([DX[1], HX + 1], [F - 12, F + 1.5], [0, 18]));
      // the parapet: cornice moulding over the board, upper wall, coping stones; flat roof inside (seen from above)
      const top = ISO.tinted(RENDER, box([-HX, HX], [-HY, F], [H - 40, H - 6])) + ISO.tinted(STONE, box([-HX - 4, HX + 4], [F - 6, F + 6], [ZBD[1] + 2, ZBD[1] + 9]) + box([-HX - 2, HX + 2], [-HY - 2, F + 2], [H - 6, H]));
      const rusts = B.free(P, [60, 90, 120, 150, 180, 210].flatMap((z) => [[[-HX, F + 0.02, z], [WX[0], F + 0.02, z]], [[DX[1], F + 0.02, z], [HX, F + 0.02, z]]]), "#b9ab94", 0.7);
      // ── the shop window: dark interior, three glass shelves of goods, the frame and transom, the glass and its glints
      const yi = F - 12, back = B.poly(P, [[WX[0], yi + 0.5, ZW[0]], [WX[1], yi + 0.5, ZW[0]], [WX[1], yi + 0.5, ZW[1]], [WX[0], yi + 0.5, ZW[1]]], "#3a3a38", "none");
      const goods = (() => {
        let s = "";
        const COL = ["#d8573a", "#e0a43a", "#4f8a4a", "#3f74ad", "#c8553d", "#7a5aa8", "#e8d6a8"];
        [70, 120, 170].forEach((z, r) => {
          s += ISO.tinted(ISO.T.glass, box([WX[0] + 4, WX[1] - 4], [yi + 1, yi + 30], [z - 1, z]));
          for (let i = 0; i < 11; i++) {
            const x = WX[0] + 14 + i * 21.5, c = COL[(i + r * 3) % 7], tall = r === 1 ? 26 : 18 + ((i * 5) % 3) * 6, wd = r === 2 ? 10 : 14;
            s += r === 0 && i % 3 === 1 ? ISO.tinted(B.tintOf(c), S(K.cylinder(x, yi + 14, 5, z, tall * 0.8, P, 16), { tone: "mid" })) : ISO.tinted(B.tintOf(c), box([x - wd / 2, x + wd / 2], [yi + 8, yi + 20], [z, z + tall]));
          }
        });
        return s;
      })();
      const fr = 6, frame = ISO.tinted(FRAME, box([WX[0], WX[0] + fr], [F - 10, F - 4], [ZW[0], ZW[1]]) + box([WX[1] - fr, WX[1]], [F - 10, F - 4], [ZW[0], ZW[1]]) +
        box([WX[0], WX[1]], [F - 10, F - 4], [ZW[1] - fr, ZW[1]]) + box([WX[0], WX[1]], [F - 10, F - 4], [192, 197]) + box([(WX[0] + WX[1]) / 2 - 2.5, (WX[0] + WX[1]) / 2 + 2.5], [F - 10, F - 4], [192, ZW[1]])) +
        ISO.tinted(STONE, box([WX[0] - 3, WX[1] + 3], [F - 10, F + 4], [ZW[0] - 4, ZW[0]]));
      const glass = (x0, x1, z0, z1, y) => B.poly(P, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], "#dcecf5", "#5d7f96", 0.5, ' fill-opacity=".22"') +
        B.free(P, [[[x0 + 12, y + 0.02, z1 - 8], [x0 + 52, y + 0.02, z0 + 30]], [[x0 + 26, y + 0.02, z1 - 8], [x0 + 46, y + 0.02, z1 - 40]]], "#ffffff", 2, ' opacity=".65" stroke-linecap="round"');
      const winGlass = glass(WX[0] + fr, WX[1] - fr, ZW[0], 192, F - 7);
      // ── the door: a recess, the frame, the glazed leaf with push bar and kick plate, the step
      const dback = B.poly(P, [[DX[0], yi + 0.5, 0], [DX[1], yi + 0.5, 0], [DX[1], yi + 0.5, ZW[1]], [DX[0], yi + 0.5, ZW[1]]], "#3a3a38", "none");
      const dframe = ISO.tinted(FRAME, box([DX[0], DX[0] + 7], [F - 10, F - 2], [0, ZW[1]]) + box([DX[1] - 7, DX[1]], [F - 10, F - 2], [0, ZW[1]]) + box([DX[0], DX[1]], [F - 10, F - 2], [ZW[1] - 7, ZW[1]]) +
        box([DX[0] + 7, DX[1] - 7], [F - 9, F - 5], [0, 22]) + box([DX[0] + 7, DX[0] + 14], [F - 9, F - 5], [22, ZW[1] - 7]) + box([DX[1] - 14, DX[1] - 7], [F - 9, F - 5], [22, ZW[1] - 7]) + box([DX[0] + 7, DX[1] - 7], [F - 9, F - 5], [ZW[1] - 20, ZW[1] - 7]));
      const dglass = glass(DX[0] + 14, DX[1] - 14, 22, ZW[1] - 20, F - 7);
      const kick = ISO.tinted(ISO.T.steel, box([DX[0] + 8, DX[1] - 8], [F - 5, F - 4.5], [3, 20]));
      const bar = ISO.tinted(ISO.T.steel, box([DX[0] + 20, DX[0] + 23], [F - 5, F + 2], [104, 108]) + box([DX[1] - 23, DX[1] - 20], [F - 5, F + 2], [104, 108]) + box([DX[0] + 20, DX[1] - 20], [F, F + 3], [103, 109]));
      const step = ISO.tinted(STONE, box([DX[0] - 6, DX[1] + 6], [F - 4, F + 30], [0, 12]));
      // ── the sign board: a moulded frame round a blank cream panel
      const board = ISO.tinted(FRAME, box([-HX + 6, HX - 6], [F, F + 6], [ZBD[0], ZBD[1]])) + ISO.tinted(ISO.tint("#f6efdc", ["#c9bea4", "#d4cab2", "#dfd6c0", "#eae2ce"], "#6a604a"), box([-HX + 14, HX - 14], [F + 6, F + 7], [ZBD[0] + 7, ZBD[1] - 7]));
      // ── the awning cassette (always there) under the board, over the window
      const cass = ISO.tinted(ISO.tint("#e8e8e4", ["#9a9a96", "#a8a8a4", "#b6b6b2", "#c4c4c0"], "#4a4a46"), box([WX[0] - 4, WX[1] + 4], [F, F + 16], [AZ - 8, AZ + 6]));
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 6, y: -HY - 6, w: 2 * HX + 12, d: 2 * HY + 12, r: 6 }, 0, H, P)}"/>` +
        `<g data-name="building">${walls}${top}${rusts}${plinth}</g><g data-name="goods">${back}${goods}</g><g data-name="window">${frame}${winGlass}</g>` +
        `<g data-name="door">${dback}</g><g data-name="sign" data-part="card"></g><g data-name="door">${dframe}${dglass}${kick}${bar}${step}</g>` +
        `<g data-name="board">${board}</g><g data-name="awning">${cass}<g data-part="awn"></g></g><g data-part="words"></g>`;
      g.anchors = { door: [(DX[0] + DX[1]) / 2, F + 15, 12], board: [0, F + 7, (ZBD[0] + ZBD[1]) / 2], top: [0, 0, H] };
      const el = B.parts(g), w = ISO.writer();
      // the card: 26 × 13 on a cord from a hook at the top of the door glass, turning about its cord
      const card = (s) => {
        const th = Math.PI * s, c = Math.cos(th), sn = Math.sin(th), flip = c < 0, u = flip ? [-c, -sn, 0] : [c, sn, 0], m = [(DX[0] + DX[1]) / 2, F - 9.5, 168];
        const hook = [m[0], m[1], ZW[1] - 24], o = B.add(B.add(m, u, -13), [0, 0, 1], 6.5), wd = Math.abs(c);
        const word = flip || s > 0.5 ? "OPEN" : "CLOSED", col = word === "OPEN" ? "#2f7a3a" : "#b8302a";
        const art = `<rect width="26" height="13" rx="1.2" fill="#fdfaf0" stroke="${col}" stroke-width=".8"/><rect x="1.6" y="1.6" width="22.8" height="9.8" rx=".8" fill="none" stroke="${col}" stroke-width=".4"/>${B.text(13, 9, word, word === "OPEN" ? 7 : 5.6, col, "middle", 800)}`;
        const cord = `<path d="${K.pathOf([K.iso(hook, P), K.iso(B.add(o, u, 4), P)])}${K.pathOf([K.iso(hook, P), K.iso(B.add(o, u, 22), P)])}" fill="none" stroke="#6a604a" stroke-width="${Math.max(0.5, k * 0.25).toFixed(2)}"/>`;
        return (wd > 0.04 ? `<g transform="${B.plane(P, o, u, [0, 0, -1])}">${art}</g>` : `<path d="${K.pathOf([K.iso(o, P), K.iso(B.add(o, [0, 0, -1], 13), P)])}" stroke="${col}" stroke-width="${Math.max(0.8, k * 0.4).toFixed(2)}"/>`) +
          cord + K.dotsSvg([K.iso(hook, P), K.iso(B.add(o, u, 4), P), K.iso(B.add(o, u, 22), P)], { size: 0.5 });
      };
      // the awning out f: striped fabric from the cassette's lip to the front bar, the valance under the bar, two arms
      const awning = (f) => {
        if (f < 0.01) return ISO.tinted(ISO.T.steel, box([WX[0] - 2, WX[1] + 2], [F + 15, F + 18], [AZ - 9, AZ - 5]));
        const y1 = F + 16 + f * 110, z1 = AZ - 6 - f * 45, NS = 12, out = [];
        const arms = (x) => B.free(P, [[[x, F + 2, AZ - 6 - f * 70], [x, y1, z1]]], "#7a7d82", Math.max(1, k * 2.2));
        out.push(ISO.tinted(ISO.T.steel, box([WX[0] + 6, WX[0] + 12], [F, F + 3], [AZ - 6 - f * 70 - 4, AZ - 6 - f * 70 + 4]) + box([WX[1] - 12, WX[1] - 6], [F, F + 3], [AZ - 6 - f * 70 - 4, AZ - 6 - f * 70 + 4])));
        out.push(arms(WX[0] + 9), arms(WX[1] - 9));
        for (let i = 0; i < NS; i++) { const x0 = WX[0] + ((WX[1] - WX[0]) * i) / NS, x1 = WX[0] + ((WX[1] - WX[0]) * (i + 1)) / NS; out.push(B.poly(P, [[x0, F + 16, AZ - 6], [x1, F + 16, AZ - 6], [x1, y1, z1], [x0, y1, z1]], i % 2 ? "#f6f0e2" : "#2f6a52", "#173a2c", 0.5)); }
        for (let i = 0; i < NS; i++) {
          const x0 = WX[0] + ((WX[1] - WX[0]) * i) / NS, x1 = WX[0] + ((WX[1] - WX[0]) * (i + 1)) / NS, pts = [[x0, y1, z1], [x1, y1, z1]];
          for (let j = 0; j <= 8; j++) { const x = x1 - ((x1 - x0) * j) / 8; pts.push([x, y1, z1 - 18 - 4 * Math.sin((j / 8) * Math.PI)]); }
          out.push(B.poly(P, pts, i % 2 ? "#f6f0e2" : "#2f6a52", "#173a2c", 0.5));
        }
        out.push(ISO.tinted(ISO.T.steel, box([WX[0] - 2, WX[1] + 2], [y1 - 2, y1 + 2], [z1 - 3, z1 + 1])));
        return out.join("");
      };
      const draw = () => {
        const s = Math.round(st.sign * 60) / 60, a = Math.round(st.awn * 80) / 80;
        w.rebuild(el.card, `${s}`, () => card(s));
        w.rebuild(el.awn, `${a}`, () => awning(a));
        if (lab) w.rebuild(el.words, "1", () => B.word(P, [HX, F, ZBD[1]], "shop") + B.word(P, [HX, F, 120], "door, with its sign", { size: 12, color: "#667" }));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.sign !== undefined) st.ws = B.num(p, "sign", st.ws, 0, 1);
        if (p.awning !== undefined) st.wa = B.num(p, "awning", st.wa, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        st.sign = ISO.follow(st.sign, st.ws, dt, 0.25, calm); if (Math.abs(st.sign - st.ws) < 0.005) st.sign = st.ws;
        st.awn = ISO.follow(st.awn, st.wa, dt, 0.5, calm); if (Math.abs(st.awn - st.wa) < 0.004) st.awn = st.wa;
        draw();
        return st.sign !== st.ws || st.awn !== st.wa;
      };
      g.readout = () => `shop front · ${st.ws > 0.5 ? "OPEN" : "CLOSED"} · awning ${st.wa < 0.05 ? "wound in" : st.wa > 0.95 ? "out" : "part out"} · 4 m wide`;
      draw();
      return g;
    },
  });
})();
