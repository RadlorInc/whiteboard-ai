// "metrerule cx cy k aim=up|flat len=30|50|100 lab=0 lit=rule|scale" — a PART (PARTS.md, batch 3): a wooden rule
// 28 × 6 mm with a brass cap on each end, its origin the middle of the zero end. aim=up stands it on that end (0 at
// the bottom, the scale facing the room, +y), aim=flat lays it on a surface along +x (scale up). Printed scale: mm
// ticks hanging from the edge nearest −x (standing) or the back (+y) edge (flat), 5 mm ticks longer, cm ticks longest,
// a number at every cm. Placed beside a spring (ax= in cm) to read its stretch. Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const W = 28, T = 6, CAP = 1.2;
  ISO.add({
    name: "metrerule", title: "Metre rule (part)", compare: null,
    about: "A wooden metre rule (30, 50 or 100 cm) with mm ticks, cm numbers and brass end caps, standing up beside a spring or lying flat to measure. anchors: zero",
    line: "metrerule cx cy k aim=up|flat len=30|50|100 lab=0 lit=rule|scale",
    demo: { line: "metrerule 470 480 13 aim=up len=30", script: [{ set: {}, hold: 1.2 }, { set: { lit: "scale" }, hold: 1.5 }, { set: { lit: "rule" }, hold: 1.5 }] },
    make([cx = 480, cy = 480, k = 3], o, t, parent) {
      const LAB = window.LAB, L = LAB.L;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const flat = o.aim === "flat", len = [30, 50, 100].reduce((a, b) => (Math.abs(b - ISO.num(o, "len", 50)) < Math.abs(a - ISO.num(o, "len", 50)) ? b : a)), Lm = len * 10;
      // the rule's own frame: s along its length from the zero end, w across its face (the ticked edge at w = −W/2),
      // h through its thickness (the printed face at h = T/2)
      const at = flat ? (s, w, h) => [s, -w, h + T / 2] : (s, w, h) => [w, h, s];
      const face = (s, w) => at(s, w, T / 2 + 0.02), u = flat ? [1, 0, 0] : [1, 0, 0], up = flat ? [0, -1, 0] : [0, 0, 1];
      let lit = o.lit || "";
      const out = [];
      if (flat) out.push(`<path class="iso-halo" d="${K.haloOf({ x: -CAP, y: -W / 2, w: Lm + 2 * CAP, d: W, r: 1 }, 0, T, Pm)}"/>`);
      // the brass caps (thin sleeves over each end) and the board between them: zero end first (lower / further back)
      const cap = (s0, s1) => ISO.tinted(ISO.T.brass, ISO.box(at, Pm, [s0, s1], [-W / 2 - 0.4, W / 2 + 0.4], [-T / 2 - 0.4, T / 2 + 0.4], "mid"));
      const board = ISO.tinted(ISO.T.wood, ISO.box(at, Pm, [CAP + 3, Lm - CAP - 3], [-W / 2, W / 2], [-T / 2, T / 2], "mid"));
      out.push(`<g data-name="rule">${cap(-0.01, CAP + 3) + board + cap(Lm - CAP - 3, Lm + 0.01)}</g>`);
      // the scale: every mm from the cap's edge (5 mm) to the far cap; ticks start on the face's edge
      const e = -W / 2, mm = [], half = [], cm = [], nums = [];
      for (let m = 5; m <= Lm - 5; m++) {
        const big = m % 10 === 0, mid = m % 5 === 0, d = K.segment(face(m, e), face(m, e + (big ? 7.5 : mid ? 5 : 3)), Pm);
        (big ? cm : mid ? half : mm).push(d);
        if (big) nums.push(LAB.faceText(Pm, face(m + (flat ? 0 : 1.1), e + 12.5 + (m >= 100 ? 1.4 : 0)), u, String(m / 10), m >= 100 ? 3.4 : 3.8, "#3a2a12", up));
      }
      const ink = ISO.tint("#2b2014", ["#2b2014", "#2b2014", "#2b2014", "#2b2014"], "#2b2014");
      out.push(`<g data-name="scale">${ISO.tinted(ink, L(mm.join(""), { tone: "lo", free: "end" }) + L(half.join(""), { tone: "mid", free: "end" }) + L(cm.join(""), { tone: "hi", free: "end" }))}${nums.join("")}` +
        LAB.faceText(Pm, face(Lm * 0.5 + 25, W / 2 - 4.5), u, "cm", 3.2, "#7a5a2e", up) + `</g>`);
      out.push(`<g data-part="words">${lab ? LAB.word(Pm, lab, flat ? [Lm / 2, -W, T + 4] : [W + 6, 0, Lm * 0.7], "metre rule", "#556", { anchor: flat ? "middle" : "start" }) : ""}</g>`);
      g.innerHTML = out.join("");
      g.anchors = { zero: [0, 0, 0] };
      const w = ISO.writer();
      const draw = () => LAB.light(w, g, lit);
      g.set = (p) => { if (p.lit !== undefined) { lit = p.lit; draw(); } };
      g.update = () => false;
      g.readout = () => `${len} cm wooden rule · mm ticks, cm numbers · ${flat ? "lying flat" : "standing, 0 at the bottom"}`;
      draw();
      return g;
    },
  });
})();
