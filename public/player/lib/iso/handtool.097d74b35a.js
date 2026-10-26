// "handtool cx cy length k=hammer|screwdriver|wrench|pliers rot=deg use=0|1 lab=1 lit=tool|work" — a hand tool at work.
// Each tool sits on a workbench block over the job it does, built from its real parts:
//   hammer: wooden handle with a rubber grip, steel head with a round face and a split claw; it drives a 6 cm nail
//     into the block, 1 cm a blow (a 0.6 kg head at 6 m/s brings about 11 J; the wood resists about 1 kN);
//   screwdriver: fluted handle, ferrule, steel shank and a cross tip in a wood screw; 4 turns of a 2.5 mm thread
//     sink it 1 cm (40 N of grip at the handle's 1.8 cm radius gives 0.7 N·m);
//   wrench: a 17 mm combination spanner, ring end on a bolt head, open end free; a 200 N pull 18 cm out = 36 N·m;
//   pliers: two halves on a rivet, jaws and handles; 100 N on handles 4 times longer than the jaws = 400 N of grip.
// set({ use: 1 }) does the job once more; set({ k }) swaps the tool. rot turns the bench. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const STEEL = ISO.T.steel, WOOD = ISO.T.wood, RUBBER = ISO.T.rubber, RED = ISO.tint("#f6b4a8", ["#a9342a", "#bd4637", "#cf5a49", "#de6e5d"], "#5e120a");
  const AMBER = ISO.tint("#ffd9a0", ["#c47a1a", "#d38a2a", "#e09c3e", "#ecb057"], "#6b3d06");
  const TOP = 6;
  const KINDS = ["hammer", "screwdriver", "wrench", "pliers"];
  const frame = (o, a, u) => G.frameOf(o, a, u, G.cross3(a, u));
  const hexOf = (r, a = 0) => Array.from({ length: 6 }, (_, i) => [Math.cos(a + (i * Math.PI) / 3) * r, Math.sin(a + (i * Math.PI) / 3) * r]);

  // ── the hammer, swung about its grip end: th = 0 is the face flat on the nail.
  const GRIP = [-31, 0, TOP + 3.25 + 4.8];
  function hammerSvg(P, th) {
    const c = Math.cos(th), s = Math.sin(th), U = [c, 0, s], Wd = [-s, 0, c];
    const at = (u, w, y) => [GRIP[0] + U[0] * u + Wd[0] * w, y, GRIP[2] + U[2] * u + Wd[2] * w];
    const Fh = frame(GRIP, U, Wd), out = [];
    out.push(ISO.tinted(WOOD, S(G.solidOf([[0, 1.25, 1], [1, 1.4, 1], [10, 1.15, 1], [22, 0.95, 1], [28.5, 1.05, 1], [29.6, 1.0]], Fh, P, { smooth: false, steps: 20 }), { tone: "hi" })));
    out.push(ISO.tinted(RUBBER, S(G.disc(1.2, 10.5, 1.45, Fh, P, { steps: 20 }), { tone: "hi", inner: L([3, 5, 7, 9].map((x) => G.arcOf(Fh, x, 1.45, P)).join(""), { tone: "faint" }) })));
    // head: the cheek block round the handle's eye, a round neck and face below, the claw's two prongs above
    const head = [ISO.box(at, P, [29.2, 32.8], [-2.2, 2.6], [-1.1, 1.1], "hi")];
    const Ff = frame(at(31, -2.2, 0), [-Wd[0], 0, -Wd[2]], U);
    head.push(S(G.solidOf([[0, 1.05], [1.2, 1.15], [2, 1.35], [2.6, 1.3]], Ff, P, { steps: 20 }), { tone: "hi" }));
    for (const y of [-1, 0.25]) head.push(ISO.poly([[29.4, 2.6, y], [32.6, 2.6, y], [31.4, 7.2, y], [30.2, 7.2, y], [29.4, 2.6, y + 0.75], [32.6, 2.6, y + 0.75], [31.4, 7.2, y + 0.75], [30.2, 7.2, y + 0.75]].map(([u, w, yy]) => at(u - 1.5 * Math.max(0, w - 2.6) / 4.6, w, yy)), ISO.BOX_F, P, "hi"));
    out.push(ISO.tinted(STEEL, head.join("")));
    return out.join("");
  }
  function nailSvg(P, out) {
    const F = frame([0, 0, TOP - 6 + out], [0, 0, 1], [1, 0, 0]);
    return ISO.tinted(STEEL, S(G.disc(Math.max(0, 6 - out), 6, 0.2, F, P), { tone: "hi" }) + S(G.disc(6, 6.25, 0.55, F, P), { tone: "hi" }));
  }
  // ── the screwdriver standing in a screw: phi is its turn.
  function driverSvg(P, sink, phi, memo) {
    const z = TOP + 0.4 - sink, F = frame([0, 0, z], [0, 0, 1], [1, 0, 0]);
    // the body is the same at every turn: build it once; only the flutes' lines move round the handle
    const body = memo.driver ||= ISO.tinted(STEEL, S(G.solidOf([[0, 0.15], [0.6, 0.32], [11, 0.32], [11.6, 0.55], [12.8, 0.7]], F, P), { tone: "hi" })) +
      ISO.tinted(ISO.T.plastic, S(G.disc(12.4, 12.8, 1.15, F, P), { tone: "hi" })) +
      ISO.tinted(AMBER, S(G.solidOf([[12.8, 1.1], [13.6, 1.5, 1], [16, 1.75, 1], [21, 1.8, 1], [22.6, 1.6, 1], [23.2, 1.1, 1], [23.4, 0]], F, P), { tone: "hi" }));
    return body + ISO.tinted(AMBER, K.fadedSvg(G.ribsOf(F, 16, 21, 1.75, 10, P, { phase: phi, fade: [0.1, 0.5], seams: true, r1: 1.8 }), { tone: "lo" }));
  }
  function screwSvg(P, sink, phi) {
    const z = TOP + 0.4 - sink, F = frame([0, 0, z], [0, 0, 1], [1, 0, 0]);
    const slot = [0, Math.PI / 2].map((a) => K.pathOf([K.iso(G.pointOf(F, 0, 0.42, phi + a), P), K.iso(G.pointOf(F, 0, 0.42, phi + a + Math.PI), P)])).join("");
    return ISO.tinted(STEEL, S(G.solidOf([[-0.5, 0.3], [-0.3, 0.5], [0, 0.5]], F, P), { tone: "hi" }) + `<path d="${slot}" stroke="#3c3f45" stroke-width="0.8" fill="none"/>`);
  }
  // ── the spanner lying on a bolt head, turned by a about the bolt.
  function wrenchSvg(P, a, memo) {
    const c = Math.cos(a), s = Math.sin(a), at = (u, w, y) => [c * u - s * w, s * u + c * w, y], z0 = TOP + 1.6, out = [];
    const ring = frame([0, 0, z0], [0, 0, 1], [c, s, 0]);
    out.push(memo.ring ||= (S(G.ringBand(0, 0.9, 1.05, 1.75, ring, P), { tone: "hi" })));
    out.push(ISO.box(at, P, [1.5, 17], [-0.65, 0.65], [z0 + 0.15, z0 + 0.75], "hi"));
    // the open end: a head with two jaws round a 17 mm gap, set at 15° to the handle
    const e = 18.6, j = 15 * Math.PI / 180, at2 = (u, w, y) => at(e + Math.cos(j) * u - Math.sin(j) * w, Math.sin(j) * u + Math.cos(j) * w, y);
    out.push(ISO.box(at2, P, [-1.8, 0.2], [-1.6, 1.6], [z0, z0 + 0.9], "hi"), ISO.box(at2, P, [0.2, 2.4], [-1.6, -0.86], [z0, z0 + 0.9], "hi"), ISO.box(at2, P, [0.2, 2.4], [0.86, 1.6], [z0, z0 + 0.9], "hi"));
    return ISO.tinted(STEEL, out.join(""));
  }
  function boltSvg(P, a) {
    const F = frame([0, 0, TOP], [0, 0, 1], [1, 0, 0]);
    return ISO.tinted(STEEL, S(G.disc(0, 0.3, 1.5, F, P), { tone: "mid" }) + S(G.prismOf(F, hexOf(0.98, a), 0.3, 2.6, P), { tone: "hi" }));
  }
  // ── the pliers, flat over a rod: each half turned by ±b about the rivet; handles have red grips.
  const ROD_X = 2.6;
  function pliersSvg(P, b) {
    const z = TOP + 0.6, out = [];
    for (const [side, y0] of [[1, z], [-1, z + 0.7]]) {
      const c = Math.cos(side * b), s = Math.sin(side * b), at = (u, w, y) => [c * u - s * w, s * u + c * w, y];
      const jaw = side > 0 ? [0.1, 0.8] : [-0.8, -0.1];
      out.push(ISO.tinted(STEEL, ISO.box(at, P, [-1.4, 1.2], [-1.1, 1.1], [y0, y0 + 0.7], "hi") + ISO.box(at, P, [1.2, 4.8], jaw, [y0, y0 + 0.7], "hi")));
      const hw = side > 0 ? [-0.9, -0.1] : [0.1, 0.9];
      out.push(ISO.tinted(STEEL, ISO.box(at, P, [-6, -1.4], hw, [y0, y0 + 0.7], "hi")), ISO.tinted(RED, ISO.box(at, P, [-16.5, -6], [hw[0] - 0.25, hw[1] + 0.25], [y0 - 0.2, y0 + 0.9], "hi")));
    }
    out.push(ISO.tinted(STEEL, S(G.disc(0, 0.25, 0.55, frame([0, 0, z + 1.4], [0, 0, 1], [1, 0, 0]), P), { tone: "hi" })));
    return out.join("");
  }
  function rodSvg(P) { return ISO.tinted(ISO.T.copper, S(G.disc(-5, 5, 0.6, frame([ROD_X, 0, TOP + 0.6 + 0.7], [0, 1, 0], [1, 0, 0]), P), { tone: "hi" })) + ISO.wbox(P, [ROD_X - 1.2, ROD_X + 1.2], [-6.5, -5], [TOP, TOP + 1.4], "mid") + ISO.wbox(P, [ROD_X - 1.2, ROD_X + 1.2], [5, 6.5], [TOP, TOP + 1.4], "mid"); }

  const B_OPEN = 0.32, B_GRIP = Math.asin(0.6 / ROD_X);
  // How each job runs: the tool's pose and the work's state at time u (s) into a use; length in s.
  const JOB = {
    hammer: { len: 3 * 0.9, pose: (u, blows0) => { const k = Math.min(2, Math.floor(u / 0.9)), f = u - k * 0.9, up = f < 0.6 ? ISO.ease(f / 0.6) : 1 - ISO.ease((f - 0.6) / 0.14); const work = Math.min(3, blows0 + k + (f >= 0.74 ? 1 : 0)); return { th: 0.95 * Math.max(0, up) - Math.asin(Math.min(3, blows0 + k + (f >= 0.6 ? 1 : 0)) / 31), work }; } },
    screwdriver: { len: 3.2, pose: (u, w0) => { const turns = Math.min(4, (u / 3.2) * 4); return { th: turns * 2 * Math.PI, work: w0 + turns * 0.25 }; } },
    wrench: { len: 2.4, pose: (u, w0) => { const f = Math.min(1, u / 1.4), back = u > 1.6 ? ISO.ease((u - 1.6) / 0.8) : 0; return { th: (ISO.ease(f) - back) * (Math.PI / 4), work: w0 + ISO.ease(f) * (Math.PI / 4) }; } },
    pliers: { len: 2.4, pose: (u) => { const f = u < 1.2 ? ISO.ease(u / 1.2) : 1 - ISO.ease((u - 1.6) / 0.8) * (u > 1.6 ? 1 : 0); return { th: B_OPEN + (B_GRIP - B_OPEN) * f, work: f }; } },
  };

  ISO.add({
    name: "handtool", title: "Hand tools at work", compare: "handtool 480 270 300",
    about: "A claw hammer, screwdriver, spanner and pliers, each on the bench doing its job: driving a nail, sinking a screw, turning a bolt, gripping a rod.",
    line: "handtool cx cy length k=hammer|screwdriver|wrench|pliers rot=deg use=0|1 lab=1 lit=tool|work",
    demo: { line: "handtool 480 270 300", script: [{ set: { use: 1 }, hold: "settle" }, { set: { k: "screwdriver", use: 1 }, hold: "settle" }, { set: { k: "wrench", use: 1 }, hold: "settle" }, { set: { k: "pliers", use: 1 }, hold: "settle" }] },
    make([cx, cy, size = 300], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.3, H = size * 1.45, rot = ISO.num(o, "rot", 0);
      // Each tool has its own bench block and camera: the hammer seen from its side, the flat tools from higher up.
      const VIEW = {
        hammer: { bench: { x: -36, y: -8, w: 48, d: 16, r: 2 }, az: 72, el: 18, pts: [[GRIP[0] + 2, 0, GRIP[2] + 30 * Math.sin(0.95) + 6], [0, 0, TOP + 12]] },
        screwdriver: { bench: { x: -14, y: -10, w: 28, d: 20, r: 2 }, az: 52, el: 20, pts: [[0, 0, TOP + 24]] },
        wrench: { bench: { x: -7, y: -9, w: 32, d: 18, r: 2 }, az: 40, el: 40, pts: [[22, 12, TOP + 2]] },
        pliers: { bench: { x: -20, y: -9, w: 30, d: 18, r: 2 }, az: 40, el: 40, pts: [[0, 0, TOP + 3]] },
      };
      const g = mk("g", { class: "iso", "data-theme": "light", transform: `translate(${cx - W / 2} ${cy - H / 2})` }, parent);
      let P = null;
      const build = (k) => {
        const v = VIEW[k], B = v.bench;
        P = K.fitProjection([...K.boxCorners(B, -4, TOP), ...v.pts], W, H, { pad: 0, azimuth: v.az + rot, elevation: v.el });
        g.innerHTML = `<path class="iso-halo" d="${K.haloOf(B, -4, 4, P)}"/>` + ISO.tinted(WOOD, S(K.slabOf(B, -4, TOP + 4, P, 3, 0.8), { tone: "mid", inner: L(K.sideSeam(B, 1, P, 3), { tone: "faint" }) }) +
          L([0.3, 0.7].map((f) => K.lineOnTop([B.x, B.y + B.d * f], [B.x + B.w, B.y + B.d * f], TOP, P)).join(""), { tone: "faint" })) +
          `<g data-name="work"></g><g data-name="tool"></g><g data-part="words"></g>`;
        el.work = g.querySelector('[data-name="work"]'); el.tool = g.querySelector('[data-name="tool"]'); el.words = g.querySelector('[data-part="words"]'); cache = {};
      };
      let cache = {};
      const el = {}, w = ISO.writer();
      const st = { k: KINDS.includes(o.k) ? o.k : "hammer", u: 1e9, w0: 0, pose: null };
      const rest = () => ({ hammer: { th: 0, work: 0 }, screwdriver: { th: 0, work: 0 }, wrench: { th: 0, work: 0 }, pliers: { th: B_OPEN, work: 0 } })[st.k];
      st.pose = rest();
      build(st.k);
      let lit = o.lit || "tool";
      const draw = () => {
        const p = st.pose, k = st.k, key = `${k} ${p.th.toFixed(k === "hammer" ? 2 : 3)} ${p.work.toFixed(3)}`;
        // poses repeat: the hammer in 0.05 rad steps, the screwdriver's flutes every 36°, the spanner's ring is round
        const hk = Math.round(p.th / 0.05), dk = Math.round(((p.th % (Math.PI / 5)) + Math.PI / 5) % (Math.PI / 5) / 0.05);
        w.rebuild(el.tool, k === "hammer" ? `h${hk}` : k === "screwdriver" ? `d${dk}` : key, () => k === "hammer" ? (cache[`h${hk}`] ||= hammerSvg(P, hk * 0.05)) : k === "screwdriver" ? (cache[`d${dk}`] ||= driverSvg(P, 0, dk * 0.05, cache)) : k === "wrench" ? wrenchSvg(P, p.th, cache) : pliersSvg(P, p.th));
        w.rebuild(el.work, k === "screwdriver" ? `s${dk}` : `${k} ${p.work.toFixed(3)}`, () => k === "hammer" ? nailSvg(P, 3 - p.work) : k === "screwdriver" ? screwSvg(P, 0, dk * 0.05) : k === "wrench" ? boltSvg(P, p.work) : rodSvg(P));
        const sink = k === "screwdriver" ? K.translateAlong(P, [0, 0, -p.work]) : "";
        w.attr(el.tool, "transform", sink); w.attr(el.work, "transform", sink);
        w.rebuild(el.words, lab ? k : "", () => !lab ? "" : ({
          hammer: ISO.word(K.iso([-16, 0, GRIP[2] + 2], P), "claw hammer", "#444", { size: 15, dy: -10 }) + ISO.word(K.iso([0, 6, TOP], P), "nail", "#444", { size: 14, dy: 18 }),
          screwdriver: ISO.word(K.iso([0, 0, TOP + 24], P), "screwdriver", "#444", { size: 15, dy: -8 }) + ISO.word(K.iso([0, 4, TOP], P), "wood screw", "#444", { size: 14, dy: 18 }),
          wrench: ISO.word(K.iso([10, 3, TOP + 2], P), "spanner, 17 mm", "#444", { size: 15, dy: 22 }) + ISO.word(K.iso([0, -3, TOP + 3], P), "bolt", "#444", { size: 14, dy: -8 }),
          pliers: ISO.word(K.iso([-10, 3, TOP + 2], P), "pliers", "#444", { size: 15, dy: 22 }) + ISO.word(K.iso([ROD_X, 6.5, TOP], P), "rod", "#444", { size: 14, dy: 18 }),
        })[k]);
        w.light([el.tool, el.work], lit === "work" ? [el.work] : [el.tool]);
      };
      g.set = (p) => {
        if (p.k && KINDS.includes(p.k) && p.k !== st.k) { st.k = p.k; st.u = 1e9; st.w0 = 0; st.pose = rest(); build(st.k); }
        if (p.use) { st.u = 0; st.w0 = st.k === "pliers" ? 0 : st.pose.work >= (st.k === "hammer" ? 3 : st.k === "screwdriver" ? 3 : 1e9) ? 0 : st.pose.work; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const job = JOB[st.k], moving = st.u < job.len;
        if (moving) { st.u = ISO.still() ? job.len : Math.min(job.len, st.u + dt); st.pose = job.pose(st.u, st.w0); }
        draw();
        return moving;
      };
      g.readout = () => {
        const p = st.pose;
        if (st.k === "hammer") return `nail ${Math.max(0, 3 - p.work).toFixed(0)} cm out of 3 · each blow: 0.6 kg head at 6 m/s ≈ 11 J against about 1 kN of wood = 1 cm`;
        if (st.k === "screwdriver") return `${(p.th / (2 * Math.PI)).toFixed(1)} turns · screw in ${(p.work * 10).toFixed(1)} mm (2.5 mm a turn) · 40 N of grip at 1.8 cm = 0.7 N·m`;
        if (st.k === "wrench") return `bolt turned ${Math.round((p.work * 180) / Math.PI)}° · 200 N pulled 18 cm from the bolt = 36 N·m · swing back and re-grip every 45°`;
        return `jaws ${p.work > 0.95 ? "gripping the rod" : "open"} · 100 N on the grips, handles 4× longer than the jaws = 400 N at the jaws`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
