// "cashbox cx cy k lid=0..1 tray=0..1 lab=0 lit=box|lid|lock|tray|coins|notes" — a PART (batch 6, economy): a
// lockable steel cash box standing on a table, its origin the table point under its middle. 30 × 24 × 9 cm: a painted
// steel body on four rubber feet, a lock with its keyhole and escutcheon on the front, a lid on a full-length hinge at
// the back with a folding carry handle on top; inside, a lift-out coin tray (five small coin wells in front, three big
// ones behind, coins stacked in them) over the note slot in the bottom, where folded notes lie. lid 0 → 1 swings the lid
// up and back (to 105°), tray 0 → 1 lifts the tray out by its rim (7 cm up). A stall's or a club's money box.
// set({ lid, tray }). World: 1 = 1 cm. anchors: top (the closed lid's middle), inside (the note slot's floor)
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 15, HY = 12, ZB = 7, LT = 2, T = 0.6, TZ0 = 3.4, TH = 3.3, LIFT = 7.5;
  ISO.add({
    name: "cashbox", title: "Cash box (part)", compare: null,
    about: "A lockable steel cash box 30 × 24 × 9 cm with a carry handle and keyhole; the lid opens on its back hinge and the coin tray lifts out, notes lie in the slot below. anchors: top inside",
    line: "cashbox cx cy k lid=0..1 tray=0..1 lab=0 lit=box|lid|lock|tray|coins|notes",
    demo: { line: "cashbox 480 410 12 lab=1", script: [{ set: {}, hold: 1 }, { set: { lid: 1, lit: "lid" }, hold: "settle" }, { set: { lit: "coins" }, hold: 1.2 }, { set: { tray: 1, lit: "tray" }, hold: "settle" }, { set: { lit: "notes" }, hold: 1.4 }, { set: { tray: 0, lid: 0, lit: "lock" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B45, B41 = window.B41, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { lid: B.num(o, "lid", 0, 0, 1), tray: B.num(o, "tray", 0, 0, 1), lit: o.lit || "" };
      st.wl = st.lid; st.wt = st.tray;
      const PAINT = ISO.tint("#8fa8b8", ["#3e5566", "#4a6375", "#577184", "#668094"], "#1c2a34");
      const INNER = ISO.tint("#c9cfd4", ["#7d858c", "#8b939a", "#99a1a8", "#a7afb6"], "#3a4148");
      const TRAY = ISO.tint("#3a3e44", ["#1f2226", "#272a2f", "#2f3338", "#363a40"], "#0d0e10");
      const box = (x, y, z, tone = "mid") => ISO.wbox(P, x, y, z, tone);
      // ── the body: feet, floor, walls (back and left first, then the contents, then right and front)
      const feet = ISO.tinted(ISO.T.rubber, [[-HX + 2.5, -HY + 2.5], [HX - 2.5, -HY + 2.5], [-HX + 2.5, HY - 2.5], [HX - 2.5, HY - 2.5]].map(([x, y]) => S(K.cylinder(x, y, 1, -0.01, 0.4, P, 14), { tone: "lo" })).join(""));
      const back = ISO.tinted(PAINT, box([-HX, HX], [-HY, HY], [0.4, 0.4 + T]) + box([-HX, HX], [-HY, -HY + T], [0.4, ZB]) + box([-HX, -HX + T], [-HY + T, HY - T], [0.4, ZB]));
      const hingeKnuckles = ISO.tinted(ISO.T.steel, [-12, -6, 0, 6, 12].map((x) => S(G.disc(-2.4, 2.4, 0.45, LAB.X([x, -HY - 0.2, ZB]), P, { steps: 12 }), { tone: "mid" })).join(""));
      // the note slot: two folded notes lying on the floor (artwork from the banknote part)
      const notes = B.top(P, [-12, -9.5, 1.02], `<g transform="rotate(-4)">${B41.note(15, 7, 20)}</g>`) + B.top(P, [-1.5, -8, 1.06], `<g transform="rotate(6)">${B41.note(15, 7, 50)}</g>`) +
        B.top(P, [-9, -1.5, 1.1], `<g transform="rotate(2)">${B41.note(15, 7, 10)}</g>`);
      const nearWalls = ISO.tinted(PAINT, box([HX - T, HX], [-HY + T, HY - T], [0.4, ZB]) + box([-HX, HX], [HY - T, HY], [0.4, ZB]));
      // the lock on the front: an escutcheon plate, the keyhole (round with a slot), the lid's latch tongue above it
      const yF = HY + 0.01, esc = B.poly(P, [[-1.6, yF, 2.6], [1.6, yF, 2.6], [1.6, yF, 6.2], [-1.6, yF, 6.2]], "#d9dadd", "#3c3f45", 0.6);
      const kh = []; for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; kh.push([Math.cos(a) * 0.45, yF + 0.01, 4.9 + Math.sin(a) * 0.45]); }
      const keyhole = B.poly(P, kh, "#14171a", "none") + B.poly(P, [[-0.18, yF + 0.01, 4.8], [0.18, yF + 0.01, 4.8], [0.3, yF + 0.01, 3.6], [-0.3, yF + 0.01, 3.6]], "#14171a", "none") +
        K.dotsSvg([[-1.15, yF + 0.02, 3.0], [1.15, yF + 0.02, 5.8]].map((p) => K.iso(p, P)), { size: 0.35 });
      // ── the coin tray (built at rest; lifted by a flat move): rim walls, the long divider, cross dividers, coins
      const tx = HX - T - 0.1, ty = HY - T - 0.1, z0 = TZ0, z1 = TZ0 + TH, wt = 0.25, ydiv = 1.5;
      const trayFar = ISO.tinted(TRAY, box([-tx, tx], [-ty, ty], [z0, z0 + 0.3]) + box([-tx, tx], [-ty, -ty + wt], [z0, z1]) + box([-tx, -tx + wt], [-ty + wt, ty - wt], [z0, z1]));
      const divs = ISO.tinted(TRAY, box([-tx + wt, tx - wt], [ydiv - wt / 2, ydiv + wt / 2], [z0, z1 - 0.4]) +
        [-1, 1].map((f) => box([f * tx / 3 - wt / 2, f * tx / 3 + wt / 2], [-ty + wt, ydiv - wt / 2], [z0, z1 - 0.4])).join("") +
        [-0.6, -0.2, 0.2, 0.6].map((f) => box([f * tx - wt / 2, f * tx + wt / 2], [ydiv + wt / 2, ty - wt], [z0, z1 - 0.4])).join(""));
      const STEEL = ISO.T.steel, BRASS = ISO.T.brass, BRONZE = B41.METAL.bronze;
      const stack = (x, y, r, n, tint) => ISO.tinted(tint, Array.from({ length: n }, (_, i) => S(K.cylinder(x + (i % 2) * 0.08, y, r, z0 + 0.3 + i * 0.22, 0.2, P, 18), { tone: "mid" })).join(""));
      const wells = [-0.8, -0.4, 0, 0.4, 0.8].map((f) => f * tx), big = [-2 / 3, 0, 2 / 3].map((f) => f * tx);
      const coins = big.map((x, i) => stack(x, (ydiv - ty) / 2 - 0.5, 1.4, [5, 3, 6][i], [BRASS, STEEL, BRONZE][i])).join("") +
        wells.map((x, i) => stack(x, (ydiv + ty) / 2, 1.0, [4, 6, 2, 5, 3][i], [BRONZE, BRONZE, STEEL, STEEL, BRASS][i])).join("");
      const trayNear = ISO.tinted(TRAY, box([tx - wt, tx], [-ty + wt, ty - wt], [z0, z1]) + box([-tx, tx], [ty - wt, ty], [z0, z1])) +
        // the two finger tabs on the rim, to lift it out by
        ISO.tinted(TRAY, box([-tx + 1, -tx + 4], [ty - 1.2, ty], [z1, z1 + 0.6]) + box([tx - 4, tx - 1], [ty - 1.2, ty], [z1, z1 + 0.6]));
      g.innerHTML = `<path class="iso-halo" data-part="halo"/><g data-part="lidBack"></g>` +
        `<g data-name="box">${feet}${back}</g><g data-name="lid">${hingeKnuckles}</g><g data-name="notes">${notes}</g>` +
        `<g data-name="tray" data-part="tray">${trayFar}${divs}<g data-name="coins">${coins}</g>${trayNear}</g>` +
        `<g data-name="box">${nearWalls}</g><g data-name="lock">${esc}${keyhole}</g><g data-part="lidFront"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, ZB + LT], inside: [0, 0, 1] };
      const el = B.parts(g), w = ISO.writer();
      // ── the lid at angle a about the hinge line (y = −HY, z = ZB): u along x, s from the hinge forward, h up
      const lidSvg = (a) => {
        const c = Math.cos(a), sn = Math.sin(a), at = (u, h, s) => [u, -HY + s * c - h * sn, ZB + s * sn + h * c];
        const lb = (u, h, s) => ISO.box(at, P, u, h, s, "mid");
        let out = ISO.tinted(PAINT, lb([-HX, HX], [0, LT], [0, 2 * HY]));
        // the latch tongue down the front edge (rides into the lock when shut)
        out += ISO.tinted(ISO.T.steel, lb([-1, 1], [-1.2, 0], [2 * HY - 0.15, 2 * HY + 0.05]));
        // the carry handle: two pivot lugs and the bar folded flat toward the front
        out += ISO.tinted(ISO.T.steel, lb([-7, -6], [LT, LT + 0.7], [10.5, 12.5]) + lb([6, 7], [LT, LT + 0.7], [10.5, 12.5]));
        out += ISO.tinted(ISO.T.plastic, lb([-6.6, 6.6], [LT + 0.05, LT + 0.75], [12.5, 14.3]));
        // a pressed panel line round the lid's top
        const hh = LT + 0.01, pts = [[-HX + 1.4, hh, 1.4], [HX - 1.4, hh, 1.4], [HX - 1.4, hh, 2 * HY - 1.4], [-HX + 1.4, hh, 2 * HY - 1.4]].map(([u, h, s]) => at(u, h, s));
        if (Math.cos(a) > 0.2) out += B.poly(P, pts, "none", "#2c3e4a", 0.5);
        return out;
      };
      const draw = () => {
        const a = (Math.round(st.lid * 200) / 200) * (105 * Math.PI) / 180, behind = a > 0.6;
        w.rebuild(el.lidBack, `${a} ${behind}`, () => (behind ? `<g data-name="lid">${lidSvg(a)}</g>` : ""));
        w.rebuild(el.lidFront, `${a} ${behind}`, () => (behind ? "" : `<g data-name="lid">${lidSvg(a)}</g>`));
        w.attr(el.tray, "transform", K.translateAlong(P, [0, 0, st.tray * LIFT]));
        const top = Math.max(ZB + LT, ZB + Math.sin(a) * 2 * HY, TZ0 + TH + st.tray * LIFT);
        w.attr(el.halo, "d", K.haloOf({ x: -HX - 0.8, y: -HY - 0.8 - (a > 1.2 ? LT : 0), w: 2 * HX + 1.6, d: 2 * HY + 1.6, r: 0.8 }, 0, top, P));
        if (lab) w.rebuild(el.words, "1", () => B.word(P, [HX, HY, 6], "cash box"));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.lid !== undefined) st.wl = B.num(p, "lid", st.wl, 0, 1);
        if (p.tray !== undefined) st.wt = B.num(p, "tray", st.wt, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the tray can only come out with the lid well open: it waits for the lid, and goes back before the lid shuts
      g.update = (dt) => {
        const fin = st.wl > 0.85 ? st.wt : 0;
        if (ISO.still()) { st.lid = st.wl; st.tray = fin; }
        else {
          const f = (x, to) => { const v = ISO.follow(x, to, dt, 0.3); return Math.abs(v - to) < 0.003 ? to : v; };
          if (st.wl <= 0.85 && st.tray > 0) st.tray = f(st.tray, 0);
          else { st.lid = f(st.lid, st.wl); st.tray = f(st.tray, st.lid > 0.85 ? st.wt : 0); }
        }
        draw();
        return st.lid !== st.wl || st.tray !== fin;
      };
      g.readout = () => `cash box · lid ${st.wl > 0.5 ? "open" : "shut"} · coin tray ${st.wt > 0.5 && st.wl > 0.85 ? "lifted out" : "in place"} · notes in the slot below`;
      draw();
      return g;
    },
  });
})();
