// "pillbox cx cy length open=none|Mon-AM…Sun-PM lab=0 lit=lid|pills|tray" — a weekly pill organiser.
// A tray of 14 compartments, a column for each day Monday to Sunday, the morning (AM) row at the front and the evening
// (PM) row at the back; each compartment has its own tinted lid on a hinge, with the day's letter on it (AM lids pale
// yellow, PM lids pale blue). The front lids open forward, the back lids lift up and back. This week holds two
// tablets and a capsule each morning and one tablet each evening. set({ open: "Wed-AM" }) opens that lid and closes
// any other; set({ open: "none" }) closes them all.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  // World units: 1 = 1 mm. Seven columns along x, 28 mm apart; the AM row at +y (front), PM at −y.
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], LET = ["M", "T", "W", "T", "F", "S", "S"], PITCH = 28, WALL = 2, TH = 20, ROW = 25;
  const colX = (i) => -3 * PITCH + i * PITCH;
  const TRAY = ISO.tint("#f3f5f7", ["#c0c8cf", "#ccd3d9", "#d8dde2", "#e3e7eb"], "#46505b");
  const LID = { AM: ISO.tint("#fff4c7", ["#e9c95c", "#efd473", "#f4de8c", "#f8e8a8"], "#7a5d0b"), PM: ISO.tint("#dcebfb", ["#8fb4de", "#a3c2e4", "#b7cfea", "#cadcf0"], "#244d7c") };
  const STYLE = `<style>.pb-lid .iso-fill{fill-opacity:.55}.pb-lid .iso-shade{fill-opacity:.8}.pb-lid .iso-top{fill-opacity:.62}</style>`;
  const planeMatrix = (P, o, eu, ev) => { const a = K.iso(o, P), b = K.iso(eu, P), c = K.iso(ev, P); return `matrix(${b[0] - a[0]} ${b[1] - a[1]} ${c[0] - a[0]} ${c[1] - a[1]} ${a[0]} ${a[1]})`; };
  const rowY = (am) => (am ? [WALL / 2, WALL / 2 + ROW] : [-WALL / 2 - ROW, -WALL / 2]);

  function traySvg(P) {
    const x0 = colX(0) - PITCH / 2 - WALL / 2, x1 = colX(6) + PITCH / 2 + WALL / 2, y0 = -ROW - WALL * 1.5, y1 = ROW + WALL * 1.5, out = [];
    out.push(`<path class="iso-halo" d="${K.haloOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 4 }, 0, TH, P)}"/>`);
    out.push(ISO.tinted(TRAY, S(K.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 3 }, 0, TH, P, 4, 0.6), { tone: "mid", inner: L(K.sideSeam({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r: 3 }, 4, P, 4), { tone: "faint" }) })));
    // each compartment's dark well in the top, rounded at the bottom
    for (let i = 0; i < 7; i++) for (const am of [false, true]) {
      const [ya, yb] = rowY(am), xa = colX(i) - PITCH / 2 + WALL / 2, xb = colX(i) + PITCH / 2 - WALL / 2;
      out.push(`<path d="${K.pathOf(K.ringOf({ x: xa, y: ya, w: xb - xa, d: yb - ya, r: 3 }, 3).map(([x, y]) => K.iso([x, y, TH], P)), true)}" fill="#9aa4ad" stroke="#46505b" stroke-width="0.5"/>`);
    }
    return out.join("");
  }
  // This week's pills: two white tablets and a red-and-cream capsule in each AM well, one tablet in each PM well.
  function pillsSvg(P) {
    const out = [], white = ISO.tint("#fbfbfa", ["#d9dbdd", "#e3e5e6", "#ecedee", "#f4f4f5"], "#6b7480"), z = TH - 4;
    for (let i = 0; i < 7; i++) {
      const x = colX(i);
      out.push(ISO.tinted(white, S(K.cylinder(x - 5, ROW / 2 + 4, 4.4, z, 2.6, P, 24, 0.4), { tone: "hi" }) + S(K.cylinder(x + 5, ROW / 2 + 7, 4.4, z, 2.6, P, 24, 0.4), { tone: "hi" })));
      const F = G.frameAlong([x - 2, ROW / 2 - 4, z + 2.4], [1, 0.2, 0]);
      out.push(ISO.tinted(ISO.T.red, S(G.disc(-6, 0, 2.4, F, P, { steps: 18 }), { tone: "hi" })) + ISO.tinted(ISO.T.amber, S(G.disc(0, 6, 2.4, F, P, { steps: 18 }), { tone: "hi" })));
      out.push(ISO.tinted(ISO.T.blue, S(K.cylinder(x, -ROW / 2 - 1, 4.8, z, 2.6, P, 24, 0.4), { tone: "hi" })));
    }
    return out.join("");
  }
  // A lid opened by a (0 shut … 1 open): the front lids hinge on the front edge and fold forward, the back on the back.
  function lidSvg(P, i, am, a) {
    const [ya, yb] = rowY(am), xa = colX(i) - PITCH / 2 + 0.4, xb = colX(i) + PITCH / 2 - 0.4, th = a * (am ? 1.95 : 1.75);
    const hy = am ? yb + 0.8 : ya - 0.8, dir = am ? -1 : 1;
    // a point on the lid: v across from the hinge (0 at the hinge), w its thickness
    const at = (x, v, w) => [x, hy + dir * (v * Math.cos(th) - w * Math.sin(th)) * 1, TH + v * Math.sin(th) + w * Math.cos(th)];
    const len = yb - ya + 1.6, box = (x0, x1, v0, v1, w0, w1) => ISO.poly([[x0, v0, w0], [x1, v0, w0], [x1, v1, w0], [x0, v1, w0], [x0, v0, w1], [x1, v0, w1], [x1, v1, w1], [x0, v1, w1]].map(([x, v, w]) => at(x, v, w)), ISO.BOX_F, P, "mid");
    const out = [`<g class="pb-lid">${ISO.tinted(LID[am ? "AM" : "PM"], box(xa, xb, 0, len, 0, 1.8))}</g>`];
    // the finger tab at the free edge, and the day letter moulded in the top
    out.push(ISO.tinted(LID[am ? "AM" : "PM"], box(colX(i) - 5, colX(i) + 5, len, len + 3, 0.2, 1.4)));
    const c = colX(i), m = planeMatrix(P, at(c, len / 2, 1.82), at(c + 1, len / 2, 1.82), at(c, len / 2 + (am ? -1 : 1), 1.82));
    out.push(`<g transform="${m}"><text x="0" y="4.4" text-anchor="middle" fill="${am ? "#7a5d0b" : "#244d7c"}" style="font:800 12px 'Helvetica Neue',Arial,sans-serif">${LET[i]}</text></g>`);
    return out.join("");
  }

  ISO.add({
    name: "pillbox", title: "Weekly pill organiser", compare: "pillbox 480 270 400",
    about: "A weekly pill organiser: fourteen compartments, Monday to Sunday, AM at the front and PM at the back, each with its own hinged lid.",
    line: "pillbox cx cy length open=none|Mon-AM…Sun-PM lab=0 lit=lid|pills|tray",
    demo: { line: "pillbox 480 270 400 open=none", script: [{ set: { open: "Wed-AM", lit: "lid" }, hold: "settle" }, { set: { open: "Wed-PM" }, hold: "settle" }, { set: { open: "none", lit: "" }, hold: "settle" }] },
    make([cx, cy, length = 400], o, t, parent) {
      const lab = o.lab !== "0" && o.lbl !== "0", W = length * 1.45, H = length * 0.82;
      const x0 = colX(0) - PITCH / 2, x1 = colX(6) + PITCH / 2;
      const pts = [[x0, -ROW - 3, 0], [x1, ROW + 3, 0], [x0, ROW + 3, 0], [x1, -ROW - 3, 0], [x0, -ROW - 3, TH + ROW + 4], [x1, ROW + 30, TH - 20]];
      const { P, g } = ISO.frame(pts, cx, cy, W, H, { azimuth: 66, elevation: 30 }, parent);
      const order = (am) => DAYS.map((_, i) => i).sort((a, b) => K.depthOf([colX(a), 0, 0], P) - K.depthOf([colX(b), 0, 0], P)).map((i) => `<g data-name="lid" data-lid="${DAYS[i]}-${am ? "AM" : "PM"}"></g>`).join("");
      g.innerHTML = STYLE + `<g data-name="tray">${traySvg(P)}</g><g data-name="pills">${pillsSvg(P)}</g>${order(false)}${order(true)}<g data-part="words"></g>`;
      const lids = Object.fromEntries([...g.querySelectorAll("[data-lid]")].map((e) => [e.dataset.lid, e])), w = ISO.writer(), parts = [...g.querySelectorAll("[data-name]")];
      const s = { open: DAYS.some((d) => (o.open || "").startsWith(d)) ? o.open : "none", a: {}, lit: o.lit || "" };
      for (const k in lids) s.a[k] = k === s.open ? 1 : 0;
      if (lab) {
        const word = (p, t2, anchor, dy = 4, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], t2, "#444", { anchor, size: 14, dy }); };
        g.querySelector('[data-part="words"]').innerHTML = word([x0 - 2, ROW / 2, TH / 2], "AM", "end", 4, -6) + word([x0 - 2, -ROW / 2, TH / 2], "PM", "end", 4, -6) +
          DAYS.map((d, i) => word([colX(i), ROW + 3, 0], d, "middle", 18)).join("");
      }
      const draw = () => {
        for (const k in lids) { const [d, r] = k.split("-"), i = DAYS.indexOf(d); w.rebuild(lids[k], s.a[k].toFixed(3), () => lidSvg(P, i, r === "AM", s.a[k])); }
        const lit = s.lit === "lid" && s.open !== "none" ? [lids[s.open]] : parts.filter((p) => s.lit && s.lit !== "lid" && p.dataset.name === s.lit);
        w.light([...parts, ...Object.values(lids)], lit);
      };
      g.set = (p) => { if (p.open !== undefined) s.open = lids[p.open] ? p.open : "none"; if (p.lit !== undefined) s.lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still();
        let moving = false;
        // a lid swings on its hinge in about half a second; one closes as the next opens
        for (const k in lids) { const want = k === s.open ? 1 : 0, n = calm ? want : Math.abs(want - s.a[k]) < dt * 2 ? want : s.a[k] + Math.sign(want - s.a[k]) * dt * 2; if (n !== s.a[k]) moving = true; s.a[k] = n; }
        draw();
        return moving;
      };
      g.readout = () => {
        if (s.open === "none") return "all 14 lids shut · this week: 2 tablets + 1 capsule each morning, 1 tablet each evening (14 doses: 21 tablets and 7 capsules a week)";
        const [d, r] = s.open.split("-"), full = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" }[d];
        return `${full} ${r} open · ${r === "AM" ? "2 tablets and 1 capsule" : "1 tablet"} to take now · close the lid when done`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
