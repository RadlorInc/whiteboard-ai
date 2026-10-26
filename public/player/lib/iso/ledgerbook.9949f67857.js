// "ledgerbook cx cy k rows=0..12 turn=0..1 lab=0 lit=cover|pages|columns|rows|ribbon" — a PART (batch 6, money): a
// hardback account book lying open flat on a table, its origin the table point under the middle of its spine, the
// pages' bottom edges toward the room (+y). 30 × 22 cm open, 3 cm thick shut: cloth-covered boards with darker corner
// guards, two page blocks that curve down into the gutter, and on each page a ruled table with printed columns DATE ·
// ITEM · IN · OUT · BALANCE, a red margin rule and handwritten rows in blue ink. The left page is last month, all 12
// rows written (February, ending with 120 carried); the right page is this month, rows = how many of its 12 rows are
// written (March, from 120 brought forward; every balance adds up). A red ribbon marker lies across the right page and
// hangs over its bottom edge. turn 0 → 1 turns the right-hand leaf over to the left (it lifts, curls and lands), so
// the right page is a fresh one and rows then counts the rows written on it; turn back to 0 shows the old page again.
// set({ rows }) writes rows one at a time; set({ turn }). Generic amounts, no currency. World: 1 = 1 cm.
// anchors: left right (each page's middle, on the paper)
(() => {
  const K = window.K;
  const HY = 11.3, CB = 0.3, ZP = 1.42, XF = 1.2, PW = 13.1, PH = 21.2, AY = -10.6, ROW = 1.5, R0 = 2.2;
  const COLS = [0, 2.2, 6.7, 8.8, 10.9, 13.1];
  const FEB = [["1 Feb", "Brought forward", "", "", "80"], ["3 Feb", "Pocket money", "20", "", "100"], ["5 Feb", "Snacks", "", "4", "96"], ["9 Feb", "Helped neighbour", "10", "", "106"], ["11 Feb", "Bus pass", "", "15", "91"], ["14 Feb", "Card for mum", "", "3", "88"],
    ["17 Feb", "Pocket money", "20", "", "108"], ["19 Feb", "Book", "", "8", "100"], ["22 Feb", "Sold drawings", "14", "", "114"], ["24 Feb", "Lunch", "", "6", "108"], ["26 Feb", "Gift", "15", "", "123"], ["28 Feb", "Pencils", "", "3", "120"]];
  const MAR = [["1 Mar", "Brought forward", "", "", "120"], ["2 Mar", "Pocket money", "20", "", "140"], ["4 Mar", "Bus pass", "", "15", "125"], ["6 Mar", "Lunch", "", "6", "119"], ["8 Mar", "Sold old books", "12", "", "131"], ["10 Mar", "Birthday gift", "25", "", "156"],
    ["12 Mar", "Phone top-up", "", "10", "146"], ["15 Mar", "School trip", "", "18", "128"], ["18 Mar", "Car wash job", "15", "", "143"], ["21 Mar", "Stationery", "", "7", "136"], ["25 Mar", "Savings jar", "", "30", "106"], ["28 Mar", "Pocket money", "20", "", "126"]];
  const APR = [["1 Apr", "Brought forward", "", "", "126"], ["2 Apr", "Pocket money", "20", "", "146"], ["5 Apr", "Swimming", "", "5", "141"], ["7 Apr", "Snacks", "", "3", "138"], ["9 Apr", "Garden job", "10", "", "148"], ["12 Apr", "Bus pass", "", "15", "133"],
    ["14 Apr", "Book", "", "9", "124"], ["18 Apr", "Pocket money", "20", "", "144"], ["20 Apr", "Gift for friend", "", "12", "132"], ["23 Apr", "Sold toys", "18", "", "150"], ["26 Apr", "Lunch", "", "6", "144"], ["29 Apr", "Savings jar", "", "30", "114"]];
  const INK = "#2b4a8a", HAND = "'Bradley Hand','Segoe Print','Comic Sans MS',cursive";
  const CLOTH = ISO.tint("#9a3b34", ["#5a1c17", "#6a241e", "#7a2c25", "#8a342d"], "#3a110d");
  const GUARD = ISO.tint("#4a2a20", ["#24120c", "#2c1710", "#341c14", "#3e2219"], "#140805");
  const PAPER = ISO.tint("#fbf7ec", ["#d9d0bb", "#e3dbc7", "#ece5d3", "#f4efe1"], "#7a6e57");
  // one page as flat art (x right, y down, 1 = 1 cm): ruling, the printed column names, the title, n handwritten rows
  function pageArt(B, month, list, n) {
    const s = [`<rect width="${PW}" height="${PH}" fill="#fbf7ec"/>`];
    const rule = [];
    for (let i = 0; i <= 12; i++) rule.push(`M0 ${R0 + i * ROW}H${PW}`);
    s.push(`<path data-free d="${rule.join("")}M0 1.1H${PW}" stroke="#9fb7d6" stroke-width="0.035" fill="none"/>`);
    s.push(`<g data-name="columns"><path data-free d="${COLS.slice(2, 5).map((x) => `M${x} 1.1V${R0 + 12 * ROW}`).join("")}" stroke="#9fb7d6" stroke-width="0.04" fill="none"/>` +
      `<path data-free d="M${COLS[1]} 1.1V${R0 + 12 * ROW}" stroke="#d45a5a" stroke-width="0.05" fill="none"/>` +
      ["DATE", "ITEM", "IN", "OUT", "BALANCE"].map((t, i) => B.text((COLS[i] + COLS[i + 1]) / 2, 1.85, t, 0.42, "#55657a", "middle", 700)).join("") + `</g>`);
    if (month) s.push(B.text(0.1, 0.75, month, 0.55, "#55657a", "start", 700));
    const rows = [];
    for (let i = 0; i < n; i++) {
      const [d, item, inn, out, bal] = list[i], y = R0 + i * ROW + 1.08, t = (x, v, a) => (v ? B.text(x, y, v, 0.56, INK, a, 400, HAND) : "");
      rows.push(t(0.12, d, "start") + t(COLS[1] + 0.2, item, "start") + t(COLS[3] - 0.2, inn, "end") + t(COLS[4] - 0.2, out, "end") + t(COLS[5] - 0.2, bal, "end"));
    }
    s.push(`<g data-name="rows">${rows.join("")}</g>`);
    return s.join("");
  }
  ISO.add({
    name: "ledgerbook", title: "Account book (part)", compare: null,
    about: "A hardback account book open flat: ruled columns date / item / in / out / balance, handwritten rows that add up, a ribbon marker; rows writes this month's rows one by one, turn turns the page over. anchors: left right",
    line: "ledgerbook cx cy k rows=0..12 turn=0..1 lab=0 lit=cover|pages|columns|rows|ribbon",
    demo: { line: "ledgerbook 480 290 27 rows=2 lab=1", script: [{ set: {}, hold: 1 }, { set: { rows: 12, lit: "rows" }, hold: "settle" }, { set: { lit: "columns" }, hold: 1.2 }, { set: { turn: 1, lit: "" }, hold: "settle" }, { set: { rows: 5, lit: "ribbon" }, hold: "settle" }, { set: { turn: 0, lit: "cover" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { rows: Math.round(B.num(o, "rows", 6, 0, 12)), turn: B.num(o, "turn", 0, 0, 1), lit: o.lit || "" };
      st.leaf = st.turn > 0 ? 12 : 0;   // rows on the turned leaf's front (written before it was turned)
      st.rowsWant = st.rows; st.turnWant = st.turn; st.tick = 0;
      // the boards, the spine between them, the corner guards, then the two page blocks
      const boards = TE.slab(P, { x: -15.3, y: -HY, w: 15.1, d: 2 * HY, r: 0.3 }, 0, CB, "mid", CLOTH, 3) + TE.slab(P, { x: 0.2, y: -HY, w: 15.1, d: 2 * HY, r: 0.3 }, 0, CB, "mid", CLOTH, 3) +
        TE.box(P, [-0.25, 0.25], [-HY, HY], [0, CB * 0.8], "lo", CLOTH);
      const guards = [-1, 1].flatMap((sx) => [-1, 1].map((sy) => TE.plate(P, [[sx * 15.3, sy * HY], [sx * 12.8, sy * HY], [sx * 15.3, sy * (HY - 2.5)]], CB, CB + 0.04, "lo", GUARD))).join("");
      const block = (sx) => {
        const pts = [[0.25, CB], [14.8, CB], [14.8, ZP], [XF + 0.3, ZP], [0.9, ZP - 0.12], [0.5, ZP - 0.4], [0.25, CB + 0.55]].map(([x, z]) => [sx * x, z]);
        const edges = [0.5, 0.7, 0.9, 1.1, 1.3].map((z) => `M${K.iso([sx * 1.4, HY - 0.4 + 0.01, z], P)}L${K.iso([sx * 14.8, HY - 0.4 + 0.01, z], P)}`).join("");
        return ISO.prismY(P, sx < 0 ? pts.reverse() : pts, -HY + 0.4, HY - 0.4, ["#cfc5ad", "#f4efe1"], "#ece5d3", "#7a6e57", `<path data-free d="${edges}" stroke="#c9bfa6" stroke-width="0.4" fill="none"/>`);
      };
      const artAt = (x0) => [x0, AY, ZP + 0.003];
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -15.3, y: -HY, w: 30.6, d: 2 * HY, r: 0.5 }, 0, 0.02, P)}"/>` +
        `<g data-name="cover">${boards}${guards}</g><g data-name="pages">${block(-1)}${block(1)}<g data-part="left"></g><g data-part="right"></g></g>` +
        `<g data-name="ribbon" data-part="ribbon"></g><g data-name="pages" data-part="leaf"></g><g data-part="words"></g>`;
      g.anchors = { left: [-(XF + PW / 2 + 0.2), 0, ZP], right: [XF + PW / 2 + 0.2, 0, ZP] };
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = ISO.word(K.iso([0, -HY, 3], P), "account book", "#556", { size: 13 });
      // the ribbon: from the gutter's head across the right page, over its foot and onto the table, a V cut at its end
      const ribbon = () => {
        const x0 = 0.95, x1 = 1.45, q = (pts) => TE.quad(P, pts, "#c8382b", "#7a1a12", 0.5);
        return q([[x0, -HY + 0.4, ZP + 0.02], [x1, -HY + 0.4, ZP + 0.02], [x1, HY - 0.4, ZP + 0.02], [x0, HY - 0.4, ZP + 0.02]]) +
          q([[x0, HY - 0.4, ZP + 0.02], [x1, HY - 0.4, ZP + 0.02], [x1, HY + 0.25, CB + 0.1], [x0, HY + 0.25, CB + 0.1]]) +
          q([[x0, HY + 0.25, CB + 0.1], [x1, HY + 0.25, CB + 0.1], [x1, HY + 0.6, 0.02], [x1, HY + 1.8, 0.02], [(x0 + x1) / 2, HY + 1.45, 0.02], [x0, HY + 1.8, 0.02], [x0, HY + 0.6, 0.02]]);
      };
      el.ribbon.innerHTML = ribbon();
      // the turning leaf: strips along its width from the gutter, each bent a little more than the last (the free
      // edge lags as it swings over), paper front (written side) or back by which side faces the camera
      const LEN = 14.55, NS = 10, HING = [0.25, ZP];
      const leafSvg = (tq, leaf) => {
        if (tq <= 0) return "";
        if (tq >= 1) return TE.flat(P, artAt(-(XF + 0.3 + PW)), [1, 0, 0], [0, 1, 0], pageArt(B, "", [], 0));
        const th = Math.PI * tq, curl = 0.55 * Math.sin(Math.PI * tq), pts = [[HING[0], HING[1]]];
        for (let i = 1; i <= NS; i++) { const f = (i - 0.5) / NS, a = th - curl * f, [x, z] = pts[i - 1]; pts.push([x + Math.cos(a) * (LEN / NS), z + Math.sin(a) * (LEN / NS)]); }
        const view = [K.depthOf([1, 0, 0], P) - K.depthOf([0, 0, 0], P), K.depthOf([0, 0, 1], P) - K.depthOf([0, 0, 0], P)];
        const strips = [], fronts = [];
        for (let i = 0; i < NS; i++) {
          const [xa, za] = pts[i], [xb, zb] = pts[i + 1], nx = -(zb - za), nz = xb - xa, front = nx * view[0] + nz * view[1] > 0;
          fronts.push(front);
          strips.push({ k: K.depthOf([(xa + xb) / 2, 0, (za + zb) / 2], P), d: TE.quad(P, [[xa, -HY + 0.4, za], [xb, -HY + 0.4, zb], [xb, HY - 0.4, zb], [xa, HY - 0.4, za]], front ? "#fbf7ec" : "#efe9da", front ? "#fbf7ec" : "#efe9da", 0.6) });
        }
        strips.sort((a, b) => a.k - b.k);
        // its outline, the ruled lines across it, and on the written side short ink strokes where the rows are
        const line = (y, s0 = 0, s1 = NS) => K.pathOf(pts.slice(s0, s1 + 1).map(([x, z]) => K.iso([x, y, z], P)));
        const rule = Array.from({ length: 13 }, (_, i) => line(AY + R0 + i * ROW)).join("");
        const pen = [];
        for (let i = 0; i < leaf; i++) { const y = AY + R0 + i * ROW + 0.85; for (const j of [1, 2, 3, 4, 9]) if (fronts[j]) pen.push(line(y, j, j + 1)); }
        const edge = K.pathOf([...pts.map(([x, z]) => K.iso([x, -HY + 0.4, z], P)), ...pts.slice().reverse().map(([x, z]) => K.iso([x, HY - 0.4, z], P))], true);
        return strips.map((s) => s.d).join("") + `<path data-free d="${rule}" stroke="#9fb7d6" stroke-width="0.6" fill="none"/>` +
          (pen.length ? `<path data-free d="${pen.join("")}" stroke="${INK}" stroke-width="0.9" stroke-dasharray="2.2 1.1" fill="none" opacity=".75"/>` : "") +
          `<path d="${edge}" fill="none" stroke="#7a6e57" stroke-width="0.8" stroke-linejoin="round"/>`;
      };
      const draw = () => {
        const tq = Math.round(ISO.ease(st.turn) * 40) / 40, n = Math.floor(st.rows + 1e-6);
        const lefty = tq >= 1 ? "blank" : "feb";
        w.rebuild(el.left, lefty, () => (lefty === "feb" ? TE.flat(P, artAt(-(XF + 0.3 + PW)), [1, 0, 0], [0, 1, 0], pageArt(B, "February", FEB, 12)) : ""));
        // the right page: March while the leaf lies on it, a fresh April page once it has lifted
        const fresh = tq > 0, list = fresh ? APR : MAR, month = fresh ? "April" : "March";
        w.rebuild(el.right, `${month} ${n}`, () => TE.flat(P, artAt(XF + 0.3), [1, 0, 0], [0, 1, 0], pageArt(B, month, list, n)));
        w.rebuild(el.leaf, `${tq} ${st.leaf}`, () => leafSvg(tq, st.leaf));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.turn !== undefined) {
          const nt = ISO.clamp(+p.turn, 0, 1);
          if (st.turnWant === 0 && nt > 0) { st.leaf = st.rowsWant; st.rows = st.rowsWant = 0; }
          else if (st.turnWant > 0 && nt === 0) { st.rows = st.rowsWant = st.leaf; }
          st.turnWant = nt;
        }
        if (p.rows !== undefined) st.rowsWant = Math.round(ISO.clamp(+p.rows, 0, 12));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // rows are written about two a second; the leaf turns over in about 1.4 s, eased at both ends
      g.update = (dt) => {
        const calm = ISO.still();
        if (calm) { st.rows = st.rowsWant; st.turn = st.turnWant; }
        else {
          const dr = st.rowsWant - st.rows; st.rows += Math.sign(dr) * Math.min(Math.abs(dr), dt * 2.2);
          const d = st.turnWant - st.turn; st.turn += Math.sign(d) * Math.min(Math.abs(d), dt / 1.4);
        }
        draw();
        return st.rows !== st.rowsWant || st.turn !== st.turnWant;
      };
      g.readout = () => {
        const fresh = st.turnWant > 0, list = fresh ? APR : MAR, n = st.rowsWant;
        return `account book · ${fresh ? "page turned: April" : "March"} · ${n} of 12 rows written${n ? ` · balance ${list[n - 1][4]}` : ""}`;
      };
      draw();
      return g;
    },
  });
})();
