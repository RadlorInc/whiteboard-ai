// Shared bits for batch 44 (shop counter parts: coin tray, cash register, cash drawer, receipt roll, scanner, counter,
// paper bag, desk bell, savings jar, passbook). Not a recipe: it only defines window.B44, which those parts call at make
// time. Coins, notes, seven-segment digits and flat artwork come from the batch 40/41 money helpers (looked up at make
// time). Money is generic: plain numbers, no currency signs, no real bank or brand. World: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const B = (window.B44 = {});
  let uid = 0;
  B.id = () => `b44c${uid++}`;
  B.say = (t) => ISO.esc(ISO.say(t));
  B.num = (o, key, d, lo, hi) => { const v = ISO.num(o, key, d); return ISO.clamp(Number.isFinite(v) ? v : d, lo, hi); };
  B.pick = (v, list, d) => (list.includes(String(v)) ? String(v) : d);
  B.light = (w, g, lit) => { const all = [...g.querySelectorAll("[data-name]")], on = String(lit || "").split(/[|,]/); w.light(all, all.filter((p) => on.includes(p.dataset.name))); };
  // flat text in artwork units (x right, y down); words go through the label translator
  B.text = (x, y, t, size, color = "#2b3440", anchor = "start", weight = 700, font = "'Helvetica Neue',Arial,sans-serif") =>
    `<text x="${(+x).toFixed(2)}" y="${(+y).toFixed(2)}" text-anchor="${anchor}" fill="${color}" style="font:${weight} ${size}px ${font}">${B.say(t)}</text>`;
  B.MONO = "'Courier New',monospace";
  // flat artwork drawn on a world plane: o = artwork (0, 0), u / v = world vectors of artwork +x / +y (per unit)
  B.flat = (P, o, u, v, svg, extra = "") => `<g transform="${window.B41.plane(P, o, u, v)}"${extra}>${svg}</g>`;
  B.quad = (P, pts, fill, stroke = "none", w = 0.6, extra = "") => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"${extra}/>`;
  B.coin = (...a) => window.B40.coin(...a);
  B.note = (...a) => window.B41.note(...a);
  B.seg = (...a) => window.B41.seg(...a);
  // a clip path from a screen-space path d; returns [defs, open-group]
  B.clip = (d) => { const id = B.id(); return [`<clipPath id="${id}"><path d="${d}"/></clipPath>`, `<g clip-path="url(#${id})">`]; };
  // the screen region above (behind) a world line a→b: everything farther up the board than the line
  B.above = (P, a, b) => { const A = K.iso(a, P), C = K.iso(b, P); return `M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${C[0].toFixed(1)} ${C[1].toFixed(1)}L${C[0].toFixed(1)} -9999L${A[0].toFixed(1)} -9999Z`; };
  // small deterministic noise
  B.rand = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // a recess (well) opening at z with its floor `deep` below, seen from above: the far walls shaded, the floor lighter,
  // `inside` (svg) drawn in it and clipped to the opening. plan = rounded plan of the opening.
  B.well = (P, plan, z, deep, inside = "", { wall = "#2d3035", floor = "#454950", ink = "#15171a", inset = 0.3 } = {}) => {
    const mouth = K.planOutline(plan, z, P, 8), bottom = K.planOutline(K.insetPlan(plan, inset), z - deep, P, 8);
    const [defs, open] = B.clip(mouth);
    return `${defs}<path d="${mouth}" fill="${wall}"/>${open}<path d="${bottom}" fill="${floor}"/>${inside}</g><path d="${mouth}" fill="none" stroke="${ink}" stroke-width="0.6"/>`;
  };

  // ── a till cash drawer (cm), its housing centred on x, front face at y = d/2, from z = 0 up to h. Returns
  // { back, tray(notes), front, top, travel }: draw back, then the tray (in its own <g>, moved by translate), then front.
  // The tray: a black insert with five note slots at the back (each a spring clip over its notes) and eight round coin
  // cups along the front, a front panel with a lock and a finger pull underneath. VALUES = the notes in the five slots.
  B.STEEL = ISO.tint("#7d828a", ["#3d4148", "#484c53", "#555960", "#62666d"], "#16181b");
  B.INSERT = ISO.tint("#3f4248", ["#202226", "#26282c", "#2c2e33", "#34363b"], "#0e0f11");
  B.CHROME = ISO.T.steel;
  B.VALUES = [5, 10, 20, 50, 100];
  B.NOTEPAPER = ISO.tint("#e9eadf", ["#b9bba9", "#c6c8b8", "#d2d4c6", "#dddfd3"], "#5d6052");
  B.drawer = (P, w = 41, d = 42, h = 10) => {
    const X = w / 2, Y = d / 2, t = 0.8, travel = d * 0.72;
    const TX = X - 1, ty0 = -Y + 1, ty1 = Y, tz0 = 0.7, tz1 = h - 1.6, front = Y + 1;
    const back = ISO.tinted(B.STEEL, ISO.wbox(P, [-X, X], [-Y, Y], [0, 0.6], "lo") + ISO.wbox(P, [-X, -X + t], [-Y, Y], [0.6, h - t], "lo")) +
      B.quad(P, [[-X + t, Y, 0.6], [X - t, Y, 0.6], [X - t, Y, h - t], [-X + t, Y, h - t]], "#1b1d20");
    // the tray at out = 0; moved out along +y by translate
    const tray = (notes) => {
      const out = [ISO.tinted(B.INSERT, ISO.wbox(P, [-TX, TX], [ty0, ty1], [tz0, tz1], "mid"))];
      // five note slots: y from the back to the middle, dividers between them
      const sy0 = ty0 + 1, sy1 = ty0 + d * 0.55, gap = 0.5, sw = (2 * TX - gap * 6) / 5;
      for (let i = 0; i < 5; i++) {
        const x0 = -TX + gap + i * (sw + gap), x1 = x0 + sw, n = notes, floor = tz1 - 1.8, nw = sw - 0.6, nh = sy1 - sy0 - 0.8;
        let inside = "";
        if (n > 0) {
          const top = floor + n * 0.06;
          inside += ISO.tinted(B.NOTEPAPER, ISO.wbox(P, [x0 + 0.3, x0 + 0.3 + nw], [sy0 + 0.4, sy0 + 0.4 + nh], [floor, top], "hi"));
          inside += B.flat(P, [x0 + 0.3 + nw, sy0 + 0.4, top + 0.005], [0, 1, 0], [-1, 0, 0], B.note(nh, nw, B.VALUES[i]));
        }
        // the spring clip: a chrome arm from its hinge at the slot's front, lying on the notes, a roller at its tip
        const cz = floor + Math.max(n, 0) * 0.06 + 0.15, cx = (x0 + x1) / 2;
        inside += ISO.tinted(B.CHROME, ISO.wbox(P, [cx - 0.35, cx + 0.35], [sy0 + 3, sy1 - 0.6], [cz, cz + 0.25], "hi") + S(G.disc(-1.6, 1.6, 0.35, LAB.X([cx, sy0 + 3, cz + 0.35]), P, { steps: 12 }), { tone: "mid" }));
        out.push(`<g data-name="notes">${B.well(P, { x: x0, y: sy0, w: sw, d: sy1 - sy0, r: 0.4 }, tz1, 1.8, inside, { inset: 0.15 })}</g>`);
      }
      // eight coin cups along the front, each with a few coins in it
      const cr = (2 * TX - 9 * 0.4) / 16, cy = sy1 + (ty1 - sy1) / 2 - 0.3, cups = [];
      for (let i = 0; i < 8; i++) {
        const x = -TX + 0.4 + cr + i * (2 * cr + 0.4), floor = tz1 - 2.6, m = 1 + Math.floor(B.rand(i + 3) * 3), metal = i < 4 ? "silver" : "gold";
        let coins = "";
        for (let j = 0; j < m; j++) coins += B.coin(P, [x + (B.rand(i * 7 + j) - 0.5) * cr * 0.5, cy + (B.rand(i * 5 + j + 1) - 0.5) * cr * 0.4, floor + 1.5 + j * 0.22], cr * (0.72 - i * 0.02), 0.2, metal, j === m - 1, 18);
        const ring = K.circleRing(x, cy, cr, 28).map(([a, b]) => K.iso([a, b, tz1], P)), floorRing = K.circleRing(x, cy, cr * 0.92, 28).map(([a, b]) => K.iso([a, b, floor], P));
        const mouth = K.pathOf(ring, true), [defs, open] = B.clip(mouth);
        cups.push(`${defs}<path d="${mouth}" fill="#2a2c30"/>${open}<path d="${K.pathOf(floorRing, true)}" fill="#40434a"/>${coins}</g><path d="${mouth}" fill="none" stroke="#0e0f11" stroke-width="0.6"/>`);
      }
      out.push(`<g data-name="coins">${cups.join("")}</g>`);
      // the front panel, its lock and the finger pull under it
      out.push(`<g data-name="drawer">${ISO.tinted(B.STEEL, ISO.wbox(P, [-X + 0.3, X - 0.3], [ty1, front], [0.9, h - 0.9], "mid"))}` +
        ISO.tinted(B.INSERT, ISO.wbox(P, [-X * 0.4, X * 0.4], [front, front + 0.25], [0.9, 2.1], "lo")) +
        ISO.tinted(B.CHROME, S(G.disc(0, 0.25, 0.9, LAB.Y([X - 5, front, h * 0.55]), P, { steps: 18 }), { tone: "mid" })) +
        `<path d="${K.pathOf([K.iso([X - 5, front + 0.27, h * 0.55 + 0.45], P), K.iso([X - 5, front + 0.27, h * 0.55 - 0.45], P)])}" stroke="#16181b" stroke-width="${Math.max(0.6, G.scaleOf(P) * 0.18).toFixed(2)}" stroke-linecap="round"/></g>`);
      return out.join("");
    };
    // the housing's near side wall, its top and the front frame's lips (drawn over the tray)
    const fore = ISO.tinted(B.STEEL, ISO.wbox(P, [X - t, X], [-Y, Y], [0.6, h - t], "mid") + ISO.wbox(P, [-X, X], [-Y, Y], [h - t, h], "mid")) +
      L(K.pathOf([K.iso([-X + 1.5, Y - 3, h], P), K.iso([X - 1.5, Y - 3, h], P)]), { tone: "faint", free: true });
    return { back, tray, fore, travel, front };
  };

  // ── a printed till receipt as flat artwork, w cm wide, its rows down y from 0 (cm): header word, rows of items
  // (grey bars with an amount), a rule, TOTAL, PAID, CHANGE, THANK YOU. Returns { svg, len } (len = how long it is).
  B.receipt = (w, { items = 6, seed = 2 } = {}) => {
    const s = [], ink = "#3a3f46", m = w * 0.08, f = (v) => v.toFixed(2);
    let y = 1.2, total = 0;
    s.push(B.text(w / 2, y, "RECEIPT", 0.62, ink, "middle", 800));
    y += 0.7;
    s.push(`<rect x="${f(w * 0.3)}" y="${f(y)}" width="${f(w * 0.4)}" height="0.14" rx="0.07" fill="#9aa1a9"/>`);
    y += 0.9;
    for (let i = 0; i < items; i++) {
      const a = Math.round((1 + B.rand(seed * 13 + i) * 9) * 4) / 4;
      total += a;
      s.push(`<rect x="${f(m)}" y="${f(y - 0.24)}" width="${f(w * (0.32 + B.rand(seed + i * 3) * 0.22))}" height="0.2" rx="0.1" fill="#8d949c"/>`, `<text x="${f(w - m)}" y="${f(y)}" text-anchor="end" fill="${ink}" style="font:700 0.42px ${B.MONO}">${a.toFixed(2)}</text>`);
      y += 0.62;
    }
    s.push(`<path d="M${f(m)} ${f(y - 0.2)}H${f(w - m)}" stroke="${ink}" stroke-width="0.04" stroke-dasharray="0.15 0.1"/>`);
    y += 0.5;
    const paid = Math.ceil(total / 10) * 10;
    for (const [word, v, big] of [["TOTAL", total, 1], ["PAID", paid, 0], ["CHANGE", paid - total, 0]]) {
      s.push(B.text(m, y, word, big ? 0.48 : 0.4, ink, "start", 800), `<text x="${f(w - m)}" y="${f(y)}" text-anchor="end" fill="${ink}" style="font:700 ${big ? 0.48 : 0.42}px ${B.MONO}">${v.toFixed(2)}</text>`);
      y += big ? 0.75 : 0.6;
    }
    y += 0.4;
    // a printed barcode, then the thank-you line
    for (let i = 0; i < 26; i++) { const bw = 0.04 + B.rand(seed * 5 + i) * 0.1; s.push(`<rect x="${f(w * 0.2 + i * w * 0.0235)}" y="${f(y)}" width="${f(bw)}" height="0.9" fill="#2b2f35"/>`); }
    y += 1.7;
    s.push(B.text(w / 2, y, "THANK YOU", 0.5, ink, "middle", 800));
    return { svg: s.join(""), len: y + 1, total, paid };
  };
})();
