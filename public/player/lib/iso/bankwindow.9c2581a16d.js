// "bankwindow cx cy k drawer=0..1 sign=open|closed lab=0 lit=counter|glass|grille|drawer|sign" — a PART (batch 6,
// money): a bank teller's counter window standing on the floor, its origin the floor point under its middle; the
// customer stands on the +y side (the room), the teller on the −y side. 150 × 60 × 120 cm: a wooden counter on a dark
// plinth with three raised front panels, a thick top, and on it a glass screen in a steel frame with a round speaking
// grille; under the glass a steel pass-through housing whose drawer slides out to the customer with the cash or the
// papers in it; a small sign holder at the right shows OPEN (or CLOSED). drawer 0 = in (teller side), 1 = out to the
// customer. set({ drawer }). World: 1 = 1 cm. anchors: top drawer sign
(() => {
  const K = window.K, G = window.G;
  const HX = 75, HY = 30, TZ = 92, GZ0 = 98, GZ1 = 120, DX = 14, DOUT = 24;
  const WOOD = ISO.tint("#e9cfa8", ["#a87c4c", "#b98d5b", "#c99f6d", "#d9b385"], "#5a3a16");
  const DARKWOOD = ISO.tint("#c9a274", ["#7a5430", "#8a623a", "#9a7046", "#ab8055"], "#3e260c");
  ISO.add({
    name: "bankwindow", title: "Teller window (part)", compare: null,
    about: "A bank teller's counter window, 150 × 60 × 120 cm: wooden counter, glass screen with a round speaking grille, a pass-through drawer under the glass that slides out to the customer, a small OPEN or CLOSED sign; drawer slides it. anchors: top drawer sign",
    line: "bankwindow cx cy k drawer=0..1 sign=open|closed lab=0 lit=counter|glass|grille|drawer|sign",
    demo: { line: "bankwindow 470 470 3.2 drawer=0 sign=open lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "grille" }, hold: 1 }, { set: { drawer: 1, lit: "drawer" }, hold: "settle" }, { set: { lit: "sign" }, hold: 1 }, { set: { drawer: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1", open = o.sign !== "closed";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { drawer: A.num(o, "drawer", 0, 0, 1), lit: o.lit || "" };
      st.want = st.drawer;
      // the counter: plinth, body with three raised panels on its front, the thick top with an eased front edge
      const panels = [-1, 0, 1].map((i) => { const x0 = i * 48 - 21, x1 = i * 48 + 21; return B.box(P, [x0, x1], [HY - 0.1, HY + 0.8], [16, 80], WOOD) + B.free(P, [[[x0 + 3, HY + 0.81, 20], [x1 - 3, HY + 0.81, 20], [x1 - 3, HY + 0.81, 76], [x0 + 3, HY + 0.81, 76], [x0 + 3, HY + 0.81, 20]]], "#8a623a", 0.6); }).join("");
      const counter = B.box(P, [-HX + 2, HX - 2], [-HY + 2, HY - 2], [0, 8], ISO.T.plastic, "lo") + B.box(P, [-HX, HX], [-HY, HY - 0.1], [8, 88], WOOD) + panels +
        B.box(P, [-HX - 1, HX + 1], [-HY - 1, HY + 2], [88, TZ], DARKWOOD) + B.free(P, [[[-HX - 1, HY + 2.01, 90], [HX + 1, HY + 2.01, 90]]], "#3e260c", 0.5, ' opacity=".5"');
      // the pass-through housing under the glass (straddling it), the bottom rail of the screen either side of it
      const housing = B.box(P, [-DX - 2, DX + 2], [-12, 12], [TZ, GZ0], ISO.T.steel) + B.quad(P, [[-DX, 12.01, TZ + 0.6], [DX, 12.01, TZ + 0.6], [DX, 12.01, TZ + 5.4], [-DX, 12.01, TZ + 5.4]], "#2a2d31", "#14171a", 0.6);
      const rail = B.box(P, [-HX, -DX - 2], [-1.2, 1.2], [TZ, GZ0], ISO.T.steel) + B.box(P, [DX + 2, HX], [-1.2, 1.2], [TZ, GZ0], ISO.T.steel);
      // the glass: two posts, a top rail, the pane (clear: a pale fill and its shine), the speaking grille on it
      const post = (x) => B.box(P, [x - 1.2, x + 1.2], [-1.2, 1.2], [GZ0, GZ1], ISO.T.steel);
      const pane = B.quad(P, [[-HX + 1.2, 0.6, GZ0], [HX - 1.2, 0.6, GZ0], [HX - 1.2, 0.6, GZ1 - 2], [-HX + 1.2, 0.6, GZ1 - 2]], "#dcebf5", "#5d7f96", 0.8, ' fill-opacity=".38"') +
        B.free(P, [[[-50, 0.61, GZ0 + 2], [-40, 0.61, GZ1 - 4]], [[-44, 0.61, GZ0 + 2], [-37, 0.61, GZ0 + 15]], [[38, 0.61, GZ0 + 3], [47, 0.61, GZ1 - 4]]], "#ffffff", 1.2, ' opacity=".8" stroke-linecap="round"');
      const grille = (() => {
        const s = [`<circle r="6" fill="#c7c9cd" fill-opacity=".9" stroke="#3c3f45" stroke-width="0.25"/><circle r="5" fill="none" stroke="#8d9096" stroke-width="0.15"/>`];
        for (const [r, n] of [[0, 1], [1.4, 6], [2.7, 12], [4, 18]]) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; s.push(`<circle cx="${(Math.cos(a) * r).toFixed(2)}" cy="${(Math.sin(a) * r).toFixed(2)}" r="0.42" fill="#3c3f45"/>`); }
        return `<g transform="${A.plane(P, [0, 0.65, 109], [1, 0, 0], [0, 0, -1])}">${s.join("")}</g>`;
      })();
      const top = B.box(P, [-HX, HX], [-1.2, 1.2], [GZ1 - 2, GZ1], ISO.T.steel);
      // the sign holder: a clear stand on a small base, its card
      const SX = 52, SY = 22, card = open ? ["OPEN", "Please come to this window", "#2c6a22"] : ["CLOSED", "Please use the next window", "#8f2a22"];
      const sign = B.box(P, [SX - 8, SX + 8], [SY - 3, SY + 3], [TZ, TZ + 0.8], ISO.T.plastic) +
        B.quad(P, [[SX - 7.5, SY + 0.4, TZ + 0.8], [SX + 7.5, SY + 0.4, TZ + 0.8], [SX + 7.5, SY - 1.2, TZ + 10.8], [SX - 7.5, SY - 1.2, TZ + 10.8]], "#f7f6f1", "#4a5058", 0.6) +
        `<g transform="${A.plane(P, [SX - 7.5, SY - 1.2, TZ + 10.8], [1, 0, 0], [0, 0.16, -0.987])}">${A.text(7.5, 5.2, card[0], 3.4, card[2], "middle", 800)}${A.text(7.5, 8.1, card[1], 1.05, "#4a5058", "middle", 600)}</g>`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 1, y: -HY - 1, w: 2 * HX + 2, d: 2 * HY + 3, r: 2 }, 0, GZ1, P)}"/>` +
        `<g data-name="counter">${counter}</g><g data-name="drawer">${housing}</g><g data-name="glass">${rail}${post(-HX + 1.2)}${pane}</g><g data-name="grille">${grille}</g>` +
        `<g data-name="glass">${post(HX - 1.2)}${top}</g><g data-name="drawer" data-part="tray"></g><g data-name="sign">${sign}</g><g data-part="words"></g>`;
      const el = B.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.drawer * 300) / 300, y1 = 12 + DOUT * q;   // the tray's front; only what is past the housing shows
        w.rebuild(el.tray, `${q}`, () => {
          let s = "";
          if (y1 > 12.3) {
            // open tray: its floor and far wall, a few notes in it, then the near walls and the front with its pull
            s += B.box(P, [-DX, DX], [12, y1 - 1], [TZ + 0.6, TZ + 1.1], B.DARK, "lo") + B.box(P, [-DX, -DX + 0.5], [12, y1], [TZ + 0.6, TZ + 5], ISO.T.steel, "lo");
            if (y1 > 22) s += B.stack(P, [-2, y1 - 5, TZ + 1.1], 12, 20, { w: 15, d: 7 });
            s += B.box(P, [DX - 0.5, DX], [12, y1], [TZ + 0.6, TZ + 5], ISO.T.steel);
          }
          s += B.box(P, [-DX - 0.5, DX + 0.5], [y1 - 1, y1], [TZ + 0.4, TZ + 5.6], ISO.T.steel) + B.box(P, [-5, 5], [y1, y1 + 1.4], [TZ + 3.4, TZ + 4.4], ISO.T.steel);
          return s;
        });
        g.anchors = { top: [-40, 15, TZ], drawer: [0, y1 - 6, TZ + 1.1], sign: [SX, SY, TZ + 11] };
        if (lab) w.rebuild(el.words, `${st.want > 0.5}`, () => B.word(P, [HX, 0, GZ1], st.want > 0.5 ? "teller window, drawer out" : "teller window"));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.drawer !== undefined) st.want = A.num(p, "drawer", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.drawer = ISO.follow(st.drawer, st.want, dt, 0.4, ISO.still());
        if (Math.abs(st.drawer - st.want) < 0.002) st.drawer = st.want;
        draw();
        return st.drawer !== st.want;
      };
      g.readout = () => `teller window · ${open ? "open" : "closed"} · pass drawer ${st.want > 0.5 ? "out to the customer" : "in"}`;
      draw();
      return g;
    },
  });
})();
