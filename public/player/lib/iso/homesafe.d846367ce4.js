// "homesafe cx cy k open=0..1 key=none|0|1|2|3|4|5|6|7|8|9 lab=0 lit=body|door|keypad|handle|hinges|shelf|cash|papers"
// — a PART (batch 6, money): a small steel home safe standing on the floor (or in a cupboard), its origin the floor
// point under its middle, its door toward the room (+y). 35 × 30 × 25 cm: a welded steel body with 1.5 cm walls,
// two anchor-bolt holes in its floor, a 3 cm thick stepped door on two hinge barrels at the left, a keypad of twelve
// keys (1–9, *, 0, #) with a small status light, a turning handle and an emergency keyhole; the door's edge carries two
// round locking bolts. Inside: a shelf with two banded note bundles on it, and papers in an envelope on the floor (the
// family's documents). open 0 → 1 swings the door out to 100°; key lights that digit's key (and its light), as when a
// code is typed. set({ open, key }). World: 1 = 1 cm. anchors: top shelf
(() => {
  const K = window.K;
  const HX = 17.5, HY = 15, H = 25, WT = 1.5, OX = HX - 2, OZ0 = 2, OZ1 = 23, DW = 33, PLUG = 3, KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
  const BODY = ISO.tint("#8a9199", ["#4e555d", "#5b626a", "#687077", "#767d85"], "#1c2024");
  const INSIDE = ISO.tint("#8a8f96", ["#4e535a", "#5a5f66", "#676c73", "#757a81"], "#24272b");
  ISO.add({
    name: "homesafe", title: "Home safe (part)", compare: null,
    about: "A small steel home safe, 35 × 30 × 25 cm: thick door with a keypad, handle and keyhole on two hinges, locking bolts in its edge; inside a shelf with note bundles and papers. open swings the door; key lights a keypad digit. anchors: top shelf",
    line: "homesafe cx cy k open=0..1 key=none|0|1|2|3|4|5|6|7|8|9 lab=0 lit=body|door|keypad|handle|hinges|shelf|cash|papers",
    demo: { line: "homesafe 470 440 9 open=0 key=none lab=1", script: [{ set: {}, hold: 1 }, { set: { key: "4", lit: "keypad" }, hold: 0.6 }, { set: { key: "1" }, hold: 0.6 }, { set: { key: "7" }, hold: 0.6 }, { set: { key: "none", open: 1, lit: "door" }, hold: "settle" }, { set: { lit: "cash" }, hold: 1.2 }, { set: { lit: "papers" }, hold: 1.2 }, { set: { open: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { open: A.num(o, "open", 0, 0, 1), key: A.pick(o.key, ["none", ...KEYS.filter((c) => /\d/.test(c))], "none"), lit: o.lit || "" };
      st.want = st.open;
      const id = B.id(), opening = [[-OX, HY, OZ0], [OX, HY, OZ0], [OX, HY, OZ1], [-OX, HY, OZ1]];
      // the body: a steel box with its front opening dark; seams where the sheets are welded
      const body = B.box(P, [-HX, HX], [-HY, HY], [0, H], BODY) +
        B.free(P, [[[HX + 0.01, -HY, H - 1.5], [HX + 0.01, HY, H - 1.5]], [[-HX, HY + 0.01, H - 1.5], [HX, HY + 0.01, H - 1.5]]], "#24282c", 0.5, ' opacity=".5"') +
        B.quad(P, opening, "#2a2d31", "#14171a", 0.8);
      // inside, seen only through the opening: back and left walls, floor with two anchor-bolt holes, papers, shelf, cash
      const IY0 = -HY + WT, IZ = OZ0, SZ = 12.5;
      const papers = B.box(P, [-14, 8], [-12, 5], [IZ, IZ + 0.5], B.PAPER, "lo") + B.box(P, [-13.5, 7], [-11.2, 4.2], [IZ + 0.5, IZ + 1.1], B.KRAFT) +
        B.free(P, [[[-13.5, -3.5, IZ + 1.11], [-3.2, 4.2, IZ + 1.11]], [[-3.2, 4.2, IZ + 1.11], [7, -3.5, IZ + 1.11]]], "#7a5a2e", 0.6) +
        B.face(P, [0.5, 1.5, IZ + 1.12], [1, 0, 0], [0, -1, 0], "PAPERS", 1.2, "#5e4a26");
      const inside = `<clipPath id="${id}"><path d="${K.pathOf(opening.map((p) => K.iso(p, P)), true)}"/></clipPath><g clip-path="url(#${id})">` +
        B.box(P, [-OX, OX], [IY0 - 0.5, IY0], [OZ0, OZ1], INSIDE, "lo") + B.box(P, [-OX - 0.5, -OX], [IY0, HY], [OZ0, OZ1], INSIDE, "lo") + B.box(P, [-OX, OX], [IY0, HY], [OZ0 - 0.5, OZ0], INSIDE, "lo") +
        [[-11, -10], [11, -10]].map(([x, y]) => `<path d="${K.pathOf(Array.from({ length: 16 }, (_, i) => K.iso([x + Math.cos((i / 16) * 6.283) * 0.7, y + Math.sin((i / 16) * 6.283) * 0.7, OZ0 + 0.01], P)), true)}" fill="#1b1d20" stroke="#14171a" stroke-width="0.5"/>`).join("") +
        `<g data-name="papers">${papers}</g>` +
        `<g data-name="shelf">${B.box(P, [-OX, -OX + 1], [IY0, HY - 1], [SZ - 1, SZ], INSIDE, "lo")}${B.box(P, [-OX, OX], [IY0, HY - 1.5], [SZ, SZ + 0.4], ISO.T.steel)}</g>` +
        `<g data-name="cash">${B.bundle(P, [-7.6, -3, SZ + 0.4], { n: 100, value: 50 })}${B.bundle(P, [7.6, -3, SZ + 0.4], { n: 100, value: 20 })}${B.bundle(P, [7.6, -3, SZ + 1.6], { n: 60, value: 20 })}</g></g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 1, y: -HY - 1, w: 2 * HX + 2, d: 2 * HY + 2, r: 1 }, 0, H, P)}"/>` +
        `<g data-name="body">${body}</g>${inside}<g data-part="door"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H], shelf: [0, -3, SZ + 0.4] };
      const el = B.parts(g), w = ISO.writer(), view = G_view(P);
      // the door, turned a radians about the hinge line at the front-left corner
      const doorSvg = (a, key) => {
        const U = [Math.cos(a), Math.sin(a), 0], N = [-Math.sin(a), Math.cos(a), 0], Z = [0, 0, 1], o = [-HX, HY, 0];
        const at = B.frame(o, U, Z, N), pt = (u, z, n) => at(u, z, n), outward = N[0] * view[0] + N[1] * view[1] > 0;
        let s = "";
        // the hinge barrels on the body's corner (they stay), then the plug that fits the opening, the bolts, the plate
        const hinges = [[4, 8], [17, 21]].map(([z0, z1]) => B.cyl(P, -HX, HY + 0.9, 0.9, z0, z1 - z0, ISO.T.steel)).join("");
        s += `<g data-name="hinges">${hinges}</g><g data-name="door">`;
        const bolts = [7, 18].map((z) => ISO.tinted(ISO.T.steel, ISO.box(B.frame(at(32.6, z, -1.5), U, [0, 0, 1], N), P, [0, 1.6], [-0.7, 0.7], [-0.7, 0.7], "mid"))).join("");
        if (a > 0.05) s += bolts + B.obox(P, at, [3.5, 31.5], [OZ0 + 1, OZ1 - 1], [-PLUG, 0], INSIDE, "lo");
        s += B.obox(P, at, [1, 1 + DW], [1, 24], [0, 3], BODY);
        // the inner face (seen when the door is far open): a cover plate with screws over the bolt work
        if (!outward) {
          s += B.quad(P, [pt(6, 6, -PLUG - 0.01), pt(29, 6, -PLUG - 0.01), pt(29, 19, -PLUG - 0.01), pt(6, 19, -PLUG - 0.01)], "#9aa0a7", "#3c4047", 0.6);
          s += [[7, 7], [28, 7], [28, 18], [7, 18]].map(([u, z]) => `<circle cx="${K.iso(pt(u, z, -PLUG - 0.02), P)[0].toFixed(1)}" cy="${K.iso(pt(u, z, -PLUG - 0.02), P)[1].toFixed(1)}" r="${Math.max(0.6, 0.25 * K.cameraOf(P).k).toFixed(2)}" fill="#3c4047"/>`).join("");
        }
        s += `</g>`;
        if (outward) {
          // the keypad: a dark panel, the status light, twelve keys with their digits; the lit key glows green
          s += `<g data-name="keypad">` + B.obox(P, at, [5, 14.5], [6, 20.5], [3, 3.25], B.DARK, "lo");
          s += `<g data-part="led">${B.quad(P, [pt(6, 19.2, 3.26), pt(13.5, 19.2, 3.26), pt(13.5, 20, 3.26), pt(6, 20, 3.26)], key === "none" ? "#2a3a2c" : "#7fe08a", "#14171a", 0.4)}</g>`;
          KEYS.forEach((c, i) => {
            const col = i % 3, row = (i / 3) | 0, u = 6.7 + col * 3, z = 17 - row * 2.9, on = c === key;
            s += B.obox(P, at, [u - 1.1, u + 1.1], [z - 1, z + 1], [3.25, 3.65], on ? ISO.T.green : ISO.T.steel);
            s += B.face(P, pt(u, z - 0.45, 3.66), U, Z, c, 1.25, on ? "#1d4f17" : "#26292e");
          });
          s += `</g><g data-name="handle">`;
          // the handle: a round boss and a lever; the emergency keyhole under it behind a small cover
          const hub = pt(24, 14, 3);
          s += ISO.tinted(ISO.T.steel, K.solidSvg(G_disc(P, hub, N, 0, 0.9, 2.2), { tone: "mid" }));
          s += B.obox(P, B.frame(pt(24, 14, 3.9), U, Z, N), [-0.7, 6.5], [-0.8, 0.8], [0, 0.9], ISO.T.steel);
          s += B.quad(P, [pt(22.8, 6.5, 3.01), pt(25.2, 6.5, 3.01), pt(25.2, 9.5, 3.01), pt(22.8, 9.5, 3.01)], "#a2a7ad", "#2f343a", 0.6) +
            `<path d="${K.pathOf([pt(24, 8.6, 3.02), pt(24, 7.2, 3.02)].map((p) => K.iso(p, P)))}" stroke="#14171a" stroke-width="${Math.max(0.8, 0.18 * K.cameraOf(P).k).toFixed(2)}" stroke-linecap="round"/>`;
          s += `</g>`;
        }
        return s;
      };
      const draw = () => {
        const a = (Math.round(st.open * 200) / 200) * (100 * Math.PI) / 180;
        w.rebuild(el.door, `${a} ${st.key}`, () => doorSvg(a, st.key));
        if (lab) w.rebuild(el.words, `${st.want > 0.5}`, () => B.word(P, [HX, HY, H + 1], st.want > 0.5 ? "home safe, open" : "home safe, locked"));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.open !== undefined) st.want = A.num(p, "open", st.want, 0, 1);
        if (p.key !== undefined) st.key = A.pick(p.key, ["none", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], st.key);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.open = ISO.follow(st.open, st.want, dt, 0.4, ISO.still());
        if (Math.abs(st.open - st.want) < 0.002) st.open = st.want;
        draw();
        return st.open !== st.want;
      };
      g.readout = () => `home safe · door ${st.want > 0.95 ? "open" : st.want < 0.05 ? "shut" : "opening"}${st.key !== "none" ? ` · key ${st.key} pressed` : ""} · 35 × 30 × 25 cm`;
      draw();
      return g;
    },
  });
  const G_view = (P) => window.G.viewOf(P);
  // a short disc along axis n from s0 to s1 at point c
  const G_disc = (P, c, n, s0, s1, r) => { const G = window.G, u = [n[1], -n[0], 0], v = [0, 0, 1]; return G.disc(s0, s1, r, G.frameOf(c, n, u, v), P); };
})();
