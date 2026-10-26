// "backpack cx cy height open=0..1 lab=1 lit=bag|zip|flap|pocket|books|bottle|straps" — a red school backpack.
// A 30 × 16 × 42 cm bag (about 19 L): the padded back with two shoulder straps and their adjuster buckles, the grab
// handle on top, a front pocket with its own zip, a mesh bottle pocket on the side with a water bottle, and the main
// compartment's two-way zip running round the top. set({ open: 1 }): the two sliders run down from the top to the
// ends of the zip, then the front panel flops forward and rests on the front pocket, showing the books, a pencil
// case and a lunchbox inside. open: 0 lifts it back and zips it shut. World units: 1 = 1 mm.
(() => {
  const K = window.K, G = window.G, DAILY = window.DAILY, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const HW = 150, ZH = 150, ZC = 270, TOPZ = ZC + HW, YB = -80, YF = 80, YI = 72, PK = 38;      // ZH: hinge / zip end height
  const FLOOR = { x: -260, y: -190, w: 520, d: 420, r: 10 }, OPEN = (103 * Math.PI) / 180;
  const RED = ["#9e2418", "#e3604c"], REDF = "#d24a37", INK = "#5e120a";
  const DARK = ["#7a1a10", "#c0402e"], LINING = "#4a4f57";
  // frame for outlines in (x, z) extruded along y
  const FY = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  // the tombstone outline above z0: straight sides up to ZC, a semicircle over the top; i insets it
  const tomb = (z0, i = 0, n = 24) => { const r = HW - i, out = [[r, z0 + (i ? i * 0.3 : 0)]]; for (let k = 0; k <= n; k++) { const a = (k / n) * Math.PI; out.push([Math.cos(a) * r, ZC + Math.sin(a) * r]); } out.push([-r, z0 + (i ? i * 0.3 : 0)]); return out; };
  const tombAt = (f) => {                                                  // a point at fraction f along the zip (0 left end … 1 right end)
    const side = ZC - ZH, arc = Math.PI * HW, tot = 2 * side + arc, d = f * tot;
    if (d < side) return [-HW, ZH + d, [0, 1]];
    if (d > side + arc) return [HW, ZC - (d - side - arc), [0, -1]];
    const a = Math.PI - (d - side) / HW; return [Math.cos(a) * HW, ZC + Math.sin(a) * HW, [Math.sin(a), -Math.cos(a)]];
  };

  // (audit.mjs records no DAILY.prism parts, so everything that sits on the bag's prisms (books on the lining floor,
  // zip stops, pocket slider, bottle in its pocket) reads as "loose" there; each sits on a prism face.)
  function strapsSvg(P) {
    const out = [];
    for (const x of [-74, 74]) {
      const F = G.frameOf([x, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]);
      const pts = DAILY.bez([YB, TOPZ - 34], [YB - 70, TOPZ - 40], [YB - 66, 120], [YB - 4, 46], 20);
      out.push(DAILY.prism(P, F, DAILY.band(pts, 12), -28, 28, ["#1f2226", "#4a4f56"], "#33373c", "#0d0e10"));
      // the adjuster buckle near the strap's foot, and the webbing down to the bag's bottom corner
      out.push(ISO.tinted(ISO.T.plastic, ISO.box((u, w, y) => [x + w, u, y], P, [YB - 34, YB - 26], [-22, 22], [70, 88], "mid")));
    }
    return out.join("");
  }
  // Lower body (fixed), the upper back with the compartment's opening, the inside (clipped to the opening).
  function bodySvg(P, id) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -HW, y: YB, w: 2 * HW, d: YF - YB + PK, r: 20 }, 0, 20, P)}"/>`];
    out.push(DAILY.prism(P, FY, DAILY.rrect(-HW, 0, HW, ZH, 24, 5), YB, YF, RED, REDF, INK));
    out.push(DAILY.prism(P, FY, tomb(ZH), YB, YI, RED, REDF, INK));
    const open = tomb(ZH, 12).map(([x, z]) => K.iso([x, YI + 0.05, z], P));
    out.push(`<clipPath id="${id}"><path d="${K.pathOf(open, true)}"/></clipPath><path d="${K.pathOf(open, true)}" fill="${LINING}" stroke="${INK}" stroke-width=".8"/>`);
    out.push(`<g clip-path="url(#${id})">`);
    // the lining: back wall and floor, then what is packed inside, back to front
    out.push(`<path d="${K.pathOf(tomb(ZH, 12).map(([x, z]) => K.iso([x, YB + 30, z], P)), true)}" fill="#5a6069" stroke="#2b2f35" stroke-width=".6"/>`);
    out.push(`<path d="${K.pathOf([[-138, YB + 30], [138, YB + 30], [138, YI], [-138, YI]].map(([x, y]) => K.iso([x, y, ZH], P)), true)}" fill="#3d4249" stroke="#2b2f35" stroke-width=".6"/>`);
    out.push(`<g data-name="books">${booksSvg(P)}</g>`);
    out.push("</g>");
    return out.join("");
  }
  function booksSvg(P) {
    const book = (x, y, z1, cover) => ISO.tinted(ISO.tint("#fbfaf4", cover[0], cover[1]), ISO.wbox(P, x, y, [ZH, z1], "mid"));
    const out = [
      book([-100, 100], [YB + 32, YB + 54], 340, [["#2e5f9e", "#3b6fae", "#4a7fbd", "#5a8fca"], "#173a66"]),
      book([-95, 90], [YB + 56, YB + 70], 318, [["#3f8a3a", "#4d9a47", "#5caa55", "#6dba66"], "#1f4a1c"]),
      book([-108, 104], [YB + 72, YB + 80], 334, [["#7a5aa8", "#8868b6", "#9677c2", "#a587cd"], "#3e2a5e"]),
      book([-90, 70], [YB + 82, YB + 88], 300, [["#d9a520", "#e3b434", "#ebc24a", "#f2cf60"], "#7a5a08"]),
    ];
    // the lunchbox and a pencil case in front of the books
    out.push(ISO.tinted(ISO.tint("#bfe3a8", ["#4f9a33", "#5ea842", "#6fb654", "#82c268"], "#24561c"), ISO.wbox(P, [10, 120], [YB + 96, YB + 140], [ZH, ZH + 58], "mid")));
    out.push(ISO.tinted(ISO.T.blue, S(G.disc(-120, -14, 13, DAILY.xAx([0, YB + 130, ZH + 13]), P, { steps: 24 }), { tone: "mid" })));
    return out.join("");
  }
  // The zip round the compartment, on the upper back's outer surface next to the flap; and the two sliders.
  function zipSvg(P, f, zy) {
    const pts = []; for (let i = 0; i <= 60; i++) { const [x, z] = tombAt(i / 60); pts.push(K.iso([x * 1.003, zy, z + (z > ZC ? (z - ZC) * 0.003 : 0)], P)); }
    const k = K.cameraOf(P).k, d = K.pathOf(pts);
    const out = [`<path d="${d}" fill="none" stroke="#2a2d31" stroke-width="${(4.4 * k).toFixed(2)}"/><path d="${d}" fill="none" stroke="#8a8f96" stroke-width="${(1.6 * k).toFixed(2)}" stroke-dasharray="${(1.2 * k).toFixed(2)} ${(1.2 * k).toFixed(2)}"/>`];
    // end stops at both ends of the zip
    for (const e of [0, 1]) { const [x, z] = tombAt(e); out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [x - 4 + (e ? -0.5 : 0.5), x + 4 + (e ? -0.5 : 0.5)], [zy - 2.5, zy + 2.5], [z - 3, z + 5], "mid"))); }
    for (const at of [0.5 - f * 0.5 - 0.025, 0.5 + f * 0.5 + 0.025].map((v) => ISO.clamp(v, 0.012, 0.988))) {
      const [x, z, [tx, tz]] = tombAt(at), nx = -tz, nz = tx;                // tangent along the zip, normal out of the bag
      const o = [x + nx * 1.5, zy, z + nz * 1.5];
      const pt = (a, b, c) => [o[0] + tx * a + nx * c, o[1] + b, o[2] + tz * a + nz * c];
      out.push(ISO.tinted(ISO.T.steel, ISO.poly([[-7, -5, 0], [7, -5, 0], [7, 5, 0], [-7, 5, 0], [-6, -4, 5], [6, -4, 5], [6, 4, 5], [-6, 4, 5]].map(([a, b, c]) => pt(a, b, c)), ISO.BOX_F, P, "hi")));
      // the pull: a tab hanging from the slider (towards the floor), with a cord loop
      const hang = (a, h, c) => [o[0] + nx * 5 + a, o[1] + 3 + c, o[2] + nz * 5 - h];
      out.push(ISO.tinted(ISO.T.plastic, ISO.poly([[-3, 2, 0], [3, 2, 0], [3, 22, 0], [-3, 22, 0], [-3, 2, 2.4], [3, 2, 2.4], [3, 22, 2.4], [-3, 22, 2.4]].map(([a, h, c]) => hang(a, h, c)), ISO.BOX_F, P, "mid")));
    }
    return out.join("");
  }
  // The front pocket on the lower body, its zip along the top with a slider, and the pocket's piping.
  function pocketSvg(P) {
    const out = [DAILY.prism(P, FY, DAILY.rrect(-110, 24, 110, 140, 22, 5), YF, YF + PK, RED, "#cc4432", INK)];
    const zy = YF + PK + 0.2, pts = [[-92, 122], [92, 122]].map(([x, z]) => K.iso([x, zy, z], P)), k = K.cameraOf(P).k, d = K.pathOf(pts);
    out.push(`<path d="${d}" fill="none" stroke="#2a2d31" stroke-width="${(3.6 * k).toFixed(2)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#8a8f96" stroke-width="${(1.3 * k).toFixed(2)}" stroke-dasharray="${(1.1 * k).toFixed(2)} ${(1.1 * k).toFixed(2)}"/>`);
    out.push(ISO.tinted(ISO.T.steel, ISO.wbox(P, [52, 64], [zy, zy + 4], [117, 127], "hi")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [55, 61], [zy + 4, zy + 6.4], [96, 118], "mid")));
    return out.join("");
  }
  // The mesh bottle pocket on the right side and the bottle standing in it.
  // The mesh bottle pocket on the right side and the bottle standing in it, seen only above the pocket's mouth
  // (clipped to the screen region over the mouth's near edge).
  function bottleSvg(P, id) {
    const F = DAILY.zAx([HW + 26, 6, 16]);
    const bottle = ISO.tinted(ISO.T.blue, S(G.lathe([[0, 0], [0, 25], [180, 25], [196, 16, 1], [204, 14], [204, 0]], F, P, { steps: 40, smooth: false }), { tone: "hi" })) +
      ISO.tinted(ISO.T.plastic, S(G.disc(204, 222, 15, F, P, { steps: 28 }), { tone: "mid" }));
    const mesh = DAILY.prism(P, G.frameOf([HW, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0]), DAILY.rrect(-46, 14, 58, 104, 14, 4), 0, 53, ["#59606a", "#9aa2ac"], "#7d858f", "#1d2126");
    // the elastic band round the pocket's mouth
    const band = ISO.tinted(ISO.T.plastic, ISO.box((u, w, y) => [HW + w, u, y], P, [-46, 58], [0, 54], [96, 106], "mid"));
    const rim = [[0, -46], [54, -46], [54, 58], [0, 58]].map(([x, y]) => K.iso([HW + x, y, 106], P));
    let lo = 0, hi = 0; rim.forEach((p, i) => { if (p[0] < rim[lo][0]) lo = i; if (p[0] > rim[hi][0]) hi = i; });
    const chain = [], dir = rim[(lo + 1) % 4][1] > rim[(lo + 3) % 4][1] ? 1 : -1;
    for (let i = lo; ; i = (i + dir + 4) % 4) { chain.push(rim[i]); if (i === hi) break; }
    const clip = K.pathOf([...chain, [rim[hi][0], rim[hi][1] - 3000], [rim[lo][0], rim[lo][1] - 3000]], true);
    return mesh + band + `<clipPath id="${id}"><path d="${clip}"/></clipPath><g clip-path="url(#${id})">${bottle}</g>`;
  }
  function handleSvg(P) {
    const F = G.frameOf([0, YB + 26, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
    const pts = DAILY.bez([-30, TOPZ - 4], [-28, TOPZ + 44], [28, TOPZ + 44], [30, TOPZ - 4], 18);
    return DAILY.prism(P, F, DAILY.band(pts, 9), -9, 9, ["#1f2226", "#4a4f56"], "#33373c", "#0d0e10");
  }
  // The front panel, turned th about its hinge along the front at the zip's ends; a reflective patch on it.
  function flapSvg(P, th) {
    const a = [0, Math.sin(th), Math.cos(th)], v = [0, Math.cos(th), -Math.sin(th)], F = G.frameOf([0, YF, ZH], a, [1, 0, 0], v);
    const out = [DAILY.prism(P, F, tomb(ZH).map(([x, z]) => [x, z - ZH]), -(YF - YI), 0, RED, G.dot3(v, G.viewOf(P)) > 0 ? REDF : "#5a6069", INK)];
    if (G.dot3(v, G.viewOf(P)) > 0) {
      const patch = DAILY.rrect(-46, 110, 46, 142, 8, 3).map(([x, s]) => K.iso(DAILY.at(F, x, s, 0.3), P));
      out.push(`<path d="${K.pathOf(patch, true)}" fill="#ffd84a" stroke="#8a6a10" stroke-width=".8"/>`);
      // a stitched seam round the panel, 8 mm in from its edge (closed, so it ends on itself)
      out.push(`<path d="${K.pathOf(tomb(ZH, 9).map(([x, z]) => K.iso(DAILY.at(F, x, z - ZH + 6, 0.2), P)), true)}" fill="none" stroke="${INK}" stroke-width=".6" stroke-dasharray="3 2.4" opacity=".7"/>`);
    } else {
      // inside the panel: a flat mesh sleeve
      out.push(`<path d="${K.pathOf(DAILY.rrect(-110, 24, 110, 170, 14, 4).map(([x, s]) => K.iso(DAILY.at(F, x, s, -(YF - YI) - 0.3), P)), true)}" fill="#6a7079" stroke="#2b2f35" stroke-width=".7"/>`);
    }
    return out.join("");
  }

  let clipN = 0;
  ISO.add({
    name: "backpack", title: "School backpack", compare: "backpack 480 270 300",
    about: "A school backpack: the two zip sliders run down round the top, the front panel flops forward onto the front pocket, and the books, pencil case and lunchbox show inside.",
    line: "backpack cx cy height open=0..1 lab=1 lit=bag|zip|flap|pocket|books|bottle|straps",
    demo: { line: "backpack 480 270 320", script: [{ set: {}, hold: 1 }, { set: { open: 1 }, hold: "settle" }, { set: { lit: "books" }, hold: 1.4 }, { set: { open: 0, lit: "" }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.1, Hh = size * 1.25;
      const flapTop = [0, YF + (TOPZ - ZH) * Math.sin(OPEN), ZH + (TOPZ - ZH) * Math.cos(OPEN)];
      const { P, g } = ISO.frame([...K.boxCorners(FLOOR, -8, 0), [0, YB, TOPZ + 50], [HW, 0, TOPZ], flapTop, [HW + 50, 0, 240]], cx, cy, W, Hh, { azimuth: 62, elevation: 22 }, parent);
      g.innerHTML = DAILY.table(P, FLOOR, 8) + `<g data-name="straps">${strapsSvg(P)}</g><g data-name="bag">${bodySvg(P, `bp-open-${++clipN}`)}</g><g data-name="zip"></g>` +
        `<g data-name="pocket">${pocketSvg(P)}</g><g data-name="bottle">${bottleSvg(P, `bp-bottle-${clipN}`)}</g><g data-name="flap"></g><g data-k="zipfront"></g><g data-name="handle">${handleSvg(P)}</g><g data-k="words"></g>`;
      const q = (n) => g.querySelector(`[data-k="${n}"],[data-name="${n}"]`), el = Object.fromEntries(["straps", "bag", "zip", "zipfront", "pocket", "bottle", "flap", "words", "books", "handle"].map((n) => [n, q(n)])), w = ISO.writer();
      const memo = DAILY.memo();
      const op = ISO.num(o, "open", 0) > 0.5;
      const s = { zip: op ? 1 : 0, flap: op ? 1 : 0, v: 0 }, goal = { open: op ? 1 : 0 };
      let lit = o.lit || "";
      const draw = () => {
        const zk = (Math.round(s.zip * 60) / 60).toFixed(3), fk = (Math.round(s.flap * 80) / 80).toFixed(4);
        // closed, the zip is the seam on the panel's edge (over the panel); open, its track on the bag's rim shows
        const shut = s.flap <= 0.001;
        w.rebuild(el.zip, shut ? "" : zk, () => (shut ? "" : zipSvg(P, +zk, YI - 2.5)));
        w.rebuild(el.zipfront, shut ? zk : "", () => (shut ? zipSvg(P, +zk, YI + 2.5) : ""));
        w.rebuild(el.flap, fk, () => memo(fk, () => flapSvg(P, +fk * OPEN)));
        const shown = s.flap > 0.6;
        w.rebuild(el.words, lab ? `${shown} ${s.zip > 0.5}` : "", () => !lab ? "" : [
          ISO.word(K.iso([-HW, YI, ZC + 40], P), s.zip > 0.02 ? "main zip (open)" : "main zip", "#444", { anchor: "end", size: 14, dy: 0 }),
          ISO.word(K.iso([0, YF + PK, 24], P), "front pocket", "#8f2a22", { size: 14, dy: 18 }),
          ISO.word(K.iso([HW + 24, 6, 250], P), "bottle pocket", "#1f4f8f", { anchor: "start", size: 14, dy: -6 }),
          shown ? ISO.word(K.iso([-40, YB + 60, 345], P), "books", "#173a66", { size: 15, dy: -6 }) : "",
        ].join(""));
        const want = lit || (s.zip > 0.02 && s.zip < 0.98 ? "zip" : s.flap > 0.02 && s.flap < 0.98 ? "flap" : "");
        const groups = { bag: [el.bag], zip: [el.zip, el.zipfront], flap: [el.flap], pocket: [el.pocket], books: [el.books], bottle: [el.bottle], straps: [el.straps, el.handle] };
        w.light(Object.values(groups).flat().filter((e, i, a) => e && a.indexOf(e) === i && e !== el.books).concat(el.books), (groups[want] || []).filter(Boolean));
      };
      g.set = (p) => { if (p.open !== undefined) goal.open = +p.open > 0.5 ? 1 : 0; if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), step = (v, to, rate) => (calm ? to : Math.abs(to - v) <= rate * dt ? to : v + Math.sign(to - v) * rate * dt);
        if (goal.open) {
          s.zip = step(s.zip, 1, 0.9);
          // once unzipped the panel falls under its own weight (more torque as it leans out), and stops on the
          // front pocket with a small bounce
          if (s.zip >= 1 && (s.flap < 1 || s.v)) {
            if (calm) { s.flap = 1; s.v = 0; }
            else { s.v += (1.2 + 3 * Math.sin(s.flap * OPEN)) * dt; s.flap += s.v * dt; if (s.flap >= 1) { s.flap = 1; s.v = s.v > 0.5 ? -0.25 * s.v : 0; } }
          }
        } else {
          s.v = 0; s.flap = step(s.flap, 0, 0.8);
          if (s.flap <= 0) s.zip = step(s.zip, 0, 1.1);
        }
        draw();
        return goal.open ? s.zip < 1 || s.flap < 1 || s.v !== 0 : s.zip > 0 || s.flap > 0;
      };
      g.readout = () => {
        if (s.zip <= 0 && s.flap <= 0) return "30 × 16 × 42 cm, about 19 L · packed, keep it under about 10–15% of the child's body weight";
        if (s.flap <= 0.01) return `two sliders running down the zip · ${Math.round(s.zip * 100)}% open`;
        return `front panel down ${Math.round(s.flap * 103)}°${s.flap >= 1 ? " · resting on the front pocket · books at the back, next to the padded straps, so the weight sits close to the spine" : ""}`;
      };
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
