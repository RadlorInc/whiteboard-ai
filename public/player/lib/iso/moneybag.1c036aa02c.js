// "moneybag cx cy k zip=0..1 lab=0 lit=bag|zip|tab|label" — a PART (batch 6, money): a canvas bank deposit bag
// standing on its bottom, its origin the floor (or counter) point under its middle, its front toward the room (+y).
// 25 × 5 × 35 cm: heavy canvas sewn round its edge, a white printed panel with the bag's plain number and two
// write-on lines, a zip along the top with its metal slider and pull, and a lock tab at the right end where the pull's
// hole meets the tab's hole (for a seal or a small lock). zip 0 = closed (slider at the lock tab), 1 = open: the slider
// runs to the left end and the open mouth shows the note bundles inside. set({ zip }). World: 1 = 1 cm.
// anchors: top tab
(() => {
  const K = window.K;
  const HX = 12.5, HY = 2.5, H = 35, ZX0 = -11, ZX1 = 9.8;
  const CANVAS = ISO.tint("#c9b994", ["#8c7b55", "#9b8a63", "#ab9a72", "#bbab84"], "#4a3e22");
  ISO.add({
    name: "moneybag", title: "Deposit bag (part)", compare: null,
    about: "A canvas bank deposit bag, 25 × 35 cm, sewn edges, a plain printed number, a zip along the top with a lock tab; zip opens it to show the note bundles inside. anchors: top tab",
    line: "moneybag cx cy k zip=0..1 lab=0 lit=bag|zip|tab|label",
    demo: { line: "moneybag 480 470 10 zip=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "tab" }, hold: 1 }, { set: { zip: 1, lit: "zip" }, hold: "settle" }, { set: { lit: "label" }, hold: 1 }, { set: { zip: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { zip: A.num(o, "zip", 0, 0, 1), lit: o.lit || "" };
      st.want = st.zip;
      // the bag's outline in x–z: a flat bottom, sides that bow out a little, rounded corners, a straight top
      const out = [];
      const corner = (cx2, cz, a0, a1, r) => { for (let i = 0; i <= 6; i++) { const a = a0 + ((a1 - a0) * i) / 6; out.push([cx2 + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
      corner(-HX + 2.5, 2.5, Math.PI, Math.PI * 1.5, 2.5); corner(HX - 2.5, 2.5, -Math.PI / 2, 0, 2.5);
      for (let i = 1; i < 6; i++) { const z = 2.5 + ((H - 3.5) * i) / 6; out.push([HX + 0.35 * Math.sin((Math.PI * i) / 6), z]); }
      corner(HX - 1, H - 1, 0, Math.PI / 2, 1); corner(-HX + 1, H - 1, Math.PI / 2, Math.PI, 1);
      for (let i = 5; i > 0; i--) { const z = 2.5 + ((H - 3.5) * i) / 6; out.push([-HX - 0.35 * Math.sin((Math.PI * i) / 6), z]); }
      const body = ISO.prismY(P, out, -HY, HY, ["#8c7b55", "#cdbd98"], "#d4c5a2", "#4a3e22");
      // the front: the sewn hem a cm in from the edge, the canvas weave as faint rows, the white panel with the number
      const art = (() => {
        const s = [];
        const hem = out.map(([x, z]) => `${(x * 0.93 + HX).toFixed(2)} ${(H - (z * 0.95 + 0.9)).toFixed(2)}`);
        s.push(`<path d="M${hem.join("L")}Z" fill="none" stroke="#6b5c38" stroke-width="0.14" stroke-dasharray="0.6 0.4"/>`);
        for (let i = 1; i < 12; i++) s.push(`<path data-free d="M2.5 ${(i * 2.8).toFixed(1)}H22.5" stroke="#b3a37c" stroke-width="0.08" opacity=".6"/>`);
        s.push(`<rect x="4.5" y="8" width="16" height="12" rx="0.4" fill="#f6f3ea" stroke="#4a3e22" stroke-width="0.12"/>`);
        s.push(A.text(12.5, 11.4, "DEPOSIT BAG", 1.5, "#2b3440", "middle", 800), A.text(12.5, 15.4, "No 0417", 2.6, "#1f3b4d", "middle", 800));
        s.push(A.text(5.4, 18.6, "From", 0.9, "#4a5058", "start", 600), `<path data-free d="M8.2 18.7H19.6" stroke="#4a5058" stroke-width="0.07"/>`);
        return s.join("");
      })();
      const front = `<g data-name="label" transform="${A.plane(P, [-HX, HY + 0.02, H], [1, 0, 0], [0, 0, -1])}">${art}</g>`;
      // the lock tab: a steel plate standing on the top at the right end, its hole; the zip's stop under it
      const tab = B.box(P, [ZX1 + 0.9, ZX1 + 1.9], [-0.15, 0.15], [H, H + 2.2], ISO.T.steel) + B.quad(P, [[ZX1 + 1.1, 0.16, H + 1.2], [ZX1 + 1.7, 0.16, H + 1.2], [ZX1 + 1.7, 0.16, H + 1.8], [ZX1 + 1.1, 0.16, H + 1.8]], "#3c3f45");
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 0.5, y: -HY - 0.5, w: 2 * HX + 1, d: 2 * HY + 1, r: 2 }, 0, H, P)}"/>` +
        `<g data-name="bag">${body}</g>${front}<g data-name="zip" data-part="zip"></g><g data-name="tab">${tab}</g><g data-part="slider"></g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, H], tab: [ZX1 + 1.4, 0, H + 1.5] };
      const el = B.parts(g), w = ISO.writer();
      const draw = () => {
        const q = Math.round(st.zip * 200) / 200, xs = ZX1 - (ZX1 - ZX0) * q;   // the slider's place: closed at the tab
        w.rebuild(el.zip, `${q}`, () => {
          // the tape, the teeth joined from the left stop to the slider, the open mouth (dark, notes inside) from the slider to the tab
          let s = B.box(P, [ZX0 - 0.6, ZX1 + 0.4], [-0.9, 0.9], [H, H + 0.12], B.DARK, "lo");
          if (q > 0.005) {
            const x0 = xs + 0.8, x1 = ZX1;
            if (x1 - x0 > 0.3) s += B.quad(P, [[x0, -0.5, H + 0.13], [x1, -0.5, H + 0.13], [x1, 0.5, H + 0.13], [x0, 0.5, H + 0.13]], "#1b1d20") +
              B.quad(P, [[x0 + 0.5, -0.3, H + 0.14], [x1 - 0.3, -0.3, H + 0.14], [x1 - 0.3, 0.05, H + 0.14], [x0 + 0.5, 0.05, H + 0.14]], "#b9d3a8", "#2f5a22", 0.4) +
              B.quad(P, [[x0 + 0.8, 0.12, H + 0.15], [x1 - 0.6, 0.12, H + 0.15], [x1 - 0.6, 0.4, H + 0.15], [x0 + 0.8, 0.4, H + 0.15]], "#c4d5ea", "#25476f", 0.4);
          }
          const teeth = [];
          for (let x = ZX0; x < xs + 0.6; x += 0.35) teeth.push([[x, -0.12, H + 0.13], [x, 0.12, H + 0.13]]);
          if (teeth.length) s += B.free(P, teeth, "#9a9da3", 0.7);
          return s;
        });
        // the slider: a small steel body on the tape, its pull lying flat behind it (hole at its end)
        w.rebuild(el.slider, `${q}`, () => B.box(P, [xs - 0.7, xs + 0.7], [-0.6, 0.6], [H + 0.12, H + 0.6], ISO.T.steel) +
          B.box(P, [xs - 2.3, xs - 0.7], [-0.3, 0.3], [H + 0.3, H + 0.45], ISO.T.steel) + B.quad(P, [[xs - 2.1, -0.12, H + 0.46], [xs - 1.7, -0.12, H + 0.46], [xs - 1.7, 0.12, H + 0.46], [xs - 2.1, 0.12, H + 0.46]], "#3c3f45"));
        if (lab) w.rebuild(el.words, `${st.want > 0.5}`, () => B.word(P, [HX, 0, H + 1], st.want > 0.5 ? "deposit bag, open" : "deposit bag, zipped and tabbed"));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.zip !== undefined) st.want = A.num(p, "zip", st.want, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        st.zip = ISO.follow(st.zip, st.want, dt, 0.35, ISO.still());
        if (Math.abs(st.zip - st.want) < 0.002) st.zip = st.want;
        draw();
        return st.zip !== st.want;
      };
      g.readout = () => `deposit bag No 0417 · ${st.want < 0.05 ? "zipped shut at the lock tab" : st.want > 0.95 ? "open" : "zip part open"}`;
      draw();
      return g;
    },
  });
})();
