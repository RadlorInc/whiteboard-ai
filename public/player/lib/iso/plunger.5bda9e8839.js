// "plunger cx cy height k=sink|toilet strokes=0-6 lab=1 lit=plunger|cup|water|clog|trap" — a cup plunger on a blocked sink.
// A basin cut open at the front so you see the standing water, and the drain below it in clear pipe: the tailpiece,
// the U-shaped trap and the arm to the wall, with a clog of hair and grease sitting in the trap. The red rubber cup
// seals over the drain under the water. Each push squeezes the cup and drives a pulse of water down at the clog
// (about 0.2 bar); each pull sucks it back: the clog rocks and creeps along until, after a few strokes, it is carried
// out into the wall pipe and the basin empties. k=toilet fits the cup's fold-out flange. set({ strokes }).
// World units: 1 = 1 cm (a 1¼ in drain, 3.2 cm across).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BX = 18, BY = 13, FZ = 30, TZ = 46, PR = 1.6, START = 0.52, LEVEL = 39;
  const RUBBER = ISO.tint("#f2a59a", ["#a3271b", "#b8382a", "#cc4a3a", "#dc5f4f"], "#5e120a"), WOOD = ISO.T.wood, GLASS = ISO.T.glass;
  const PORC = ISO.tint("#fbfbf9", ["#cfd3d8", "#d9dce0", "#e3e5e8", "#edeef0"], "#6f747a");
  const zA = (o, dir = 1) => G.frameOf(o, [0, 0, dir], [1, 0, 0], [0, dir, 0]);
  // The trap's centreline: straight down, a U round (5.5, 14.5), up and out to the wall.
  const route = (() => { const pts = [[0, 0, FZ], [0, 0, 14.5]]; for (let i = 1; i <= 12; i++) { const a = Math.PI + (i / 12) * Math.PI; pts.push([5.5 + Math.cos(a) * 5.5, 0, 14.5 + Math.sin(a) * 5.5]); } pts.push([11, 0, 18], [11, -6, 18], [11, -BY - 8.6, 18]); return pts; })();
  const along = (f) => G.pointAlong(route, f * G.pathLength(route));

  function counterSvg(P) {
    const out = [];
    // the wall behind and the counter top round the basin (left, right and back strips; the front is cut away)
    out.push(ISO.tinted(PORC, ISO.wbox(P, [-30, 30], [-BY - 10, -BY - 8.6], [0, 60], "hi")));
    out.push(ISO.tinted(PORC, ISO.wbox(P, [-BX - 2, BX + 2], [-BY - 2, BY + 2], [FZ - 2, FZ], "hi")));
    for (const [x0, x1, y0, y1] of [[-BX - 2, BX + 2, -BY - 2, -BY], [-BX - 2, -BX, -BY, BY + 2], [BX, BX + 2, -BY, BY + 2]]) out.push(ISO.tinted(PORC, ISO.wbox(P, [x0, x1], [y0, y1], [FZ, TZ], "hi")));
    out.push(ISO.wbox(P, [-BX - 8, BX + 8], [-BY - 8.6, -BY - 2], [TZ - 3, TZ], "mid"));
    // the drain's strainer ring in the basin floor
    out.push(L(K.ring(0, 0, 2.6, FZ, P, 24), { tone: "lo" }));
    return out.join("");
  }
  // Clear pipe: drawn see-through over what is inside it (water, the clog).
  function pipeSvg(P) {
    const d = K.pathOf(route.map((p) => K.iso(p, P))), w = 2 * PR * G.scaleOf(P);
    const out = [`<path d="${d}" fill="none" stroke="#5d7f96" stroke-width="${(w + 1.2).toFixed(1)}" stroke-linejoin="round" opacity=".7"/>`,
      `<path d="${d}" fill="none" stroke="#e3eff7" stroke-width="${w.toFixed(1)}" stroke-linejoin="round" opacity=".55"/>`,
      `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${(w * 0.25).toFixed(1)}" stroke-linejoin="round" opacity=".5" transform="translate(${(-w * 0.2).toFixed(1)} 0)"/>`];
    // slip nuts where the trap joins the tailpiece and the arm, and the escutcheon on the wall
    out.push(ISO.tinted(GLASS, S(G.disc(-0.6, 0.6, PR + 0.5, G.frameAlong([0, 0, FZ - 4], [0, 0, 1]), P), { tone: "mid" }) + S(G.disc(-0.6, 0.6, PR + 0.5, G.frameAlong([11, 0, 17], [0, 0, 1]), P), { tone: "mid" })));
    out.push(ISO.tinted(GLASS, S(G.disc(0, 0.4, PR + 1.8, G.frameAlong([11, -BY - 8.6, 18], [0, 1, 0]), P), { tone: "mid" })));
    return out.join("");
  }
  function clogSvg(P, f) {
    if (f > 0.995) return "";
    const c = along(f), pts = [];
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, r = 1.25 + 0.25 * Math.sin(i * 2.3); pts.push(K.iso([c[0] + Math.cos(a) * r, 0, c[2] + Math.sin(a) * r * 0.9], P)); }
    return `<path d="${K.pathOf(pts, true)}" fill="#7a5a3a" stroke="#3e2a18" stroke-width="0.6"/>` + D([K.iso([c[0] - 0.4, 0, c[2] + 0.3], P), K.iso([c[0] + 0.5, 0, c[2] - 0.2], P)], { size: 0.5, tone: "lo" });
  }
  // The standing water, cut at the front like the basin: its top and its front section.
  function waterSvg(P, z) {
    if (z < FZ + 0.3) return "";
    const top = [[-BX, -BY], [BX, -BY], [BX, BY], [-BX, BY]].map(([x, y]) => K.iso([x, y, z], P));
    const front = [[-BX, FZ], [BX, FZ], [BX, z], [-BX, z]].map(([x, zz]) => K.iso([x, BY, zz], P));
    return `<path d="${K.pathOf(front, true)}" fill="#bcd8f0" fill-opacity=".7" stroke="#5d86ad" stroke-width="0.6"/><path d="${K.pathOf(top, true)}" fill="#d6e8f7" fill-opacity=".75" stroke="#5d86ad" stroke-width="0.6"/>`;
  }
  // The plunger: the red cup on the drain, squashed by p (0–1), and the wooden handle above it.
  function plungerSvg(P, p, toilet) {
    const h = 6.5 - 2.6 * p, F = zA([0, 0, FZ]), out = [];
    if (toilet) out.push(ISO.tinted(RUBBER, S(G.disc(0, 2.4, 2.2, F, P, { steps: 24 }), { tone: "hi" })));
    out.push(ISO.tinted(RUBBER, S(G.solidOf([[0, 7.2 + p * 0.8], [0.6, 7.4 + p * 0.8, 1], [h * 0.45, 6.8 + p * 0.5, 1], [h * 0.8, 4.6, 1], [h, 1.8, 1], [h + 0.8, 1.6]], F, P, { steps: 40 }), { tone: "hi" })));
    out.push(ISO.tinted(WOOD, S(G.disc(h + 0.8, h + 52, 1.3, F, P, { steps: 20 }), { tone: "hi" })));
    return out.join("");
  }

  ISO.add({
    name: "plunger", title: "Cup plunger", compare: "plunger 480 280 320",
    about: "A cup plunger sealed over a blocked sink drain: each push sends a pulse of water at the clog in the trap, each pull sucks it back, until the clog is carried away and the sink drains.",
    line: "plunger cx cy height k=sink|toilet strokes=0-6 lab=1 lit=plunger|cup|water|clog|trap",
    demo: { line: "plunger 480 280 320", script: [{ set: {}, hold: 1 }, { set: { strokes: 4 }, hold: "settle" }] },
    make([cx, cy, size = 320], o, t, parent) {
      const lab = o.lab !== "0", W = size * 2.1, H = size * 1.55, toilet = o.k === "toilet";
      const { P, g } = ISO.frame([[-BX - 8, -BY - 10, 0], [BX + 2, BY + 2, 0], [-BX - 8, -BY - 10, 60], [0, 0, FZ + 60], [BX + 2, BY + 2, TZ]], cx, cy, W, H, { azimuth: 60, elevation: 20 }, parent);
      g.innerHTML = `<g>${counterSvg(P)}</g><g data-name="trap">${pipeSvg(P)}</g><g data-name="clog"></g><g data-name="plunger"></g><g data-name="water"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { clog: q("clog"), trap: q("trap"), plunger: q("plunger"), water: q("water"), words: q("words") }, w = ISO.writer();
      const s = { done: 0, u: 0, p: 0, clog: START, level: LEVEL }, goal = { strokes: ISO.clamp(ISO.num(o, "strokes", 0), 0, 6) };
      let lit = o.lit || "";
      const cache = [];
      const draw = () => {
        const pk = Math.round(s.p * 40);
        w.rebuild(el.plunger, String(pk), () => (cache[pk] ||= plungerSvg(P, pk / 40, toilet)));
        w.rebuild(el.clog, s.clog.toFixed(3), () => clogSvg(P, s.clog));
        w.rebuild(el.water, s.level.toFixed(2), () => waterSvg(P, s.level));
        w.rebuild(el.words, lab ? `${s.clog > 0.99} ${s.level > FZ + 1}` : "", () => !lab ? "" : [
          ISO.word(K.iso([0, 0, FZ + 40], P), toilet ? "flange plunger" : "cup plunger", "#444", { anchor: "start", size: 15, dy: 0 }).replace('x="', 'dx="10" x="'),
          s.clog < 0.99 ? ISO.word(K.iso(along(s.clog), P), "clog", "#7a5a3a", { anchor: "start", size: 14, dy: 22 }) : "",
          ISO.word(K.iso([5.5, 0, 9 - PR], P), "trap", "#444", { size: 14, dy: 34 }),
          s.level > FZ + 1 ? ISO.word(K.iso([-BX, BY, s.level], P), "standing water", "#1f4f8f", { anchor: "end", size: 14, dy: 4 }) : ISO.word(K.iso([-BX, BY, FZ], P), "drained", "#2c6a22", { anchor: "end", size: 14, dy: 4 })].join(""));
        const want = lit || (s.done < goal.strokes ? "plunger" : s.clog > 0.99 ? "water" : "clog");
        w.light([el.clog, el.trap, el.plunger, el.water], [q(want)].filter(Boolean));
      };
      g.set = (p) => { if (p.strokes !== undefined) goal.strokes = ISO.clamp(+p.strokes, 0, 6); if (p.lit !== undefined) lit = p.lit; };
      g.update = (dt) => {
        const calm = ISO.still(), T = 0.9;
        if (s.done < goal.strokes) {
          s.u = calm ? T : s.u + dt;
          const f = Math.min(1, s.u / T);
          // push down to the bottom at half way, pull back up: the cup squashes and springs back; the clog rocks
          // with each pulse and creeps 0.12 of the way along the drain per stroke
          s.p = Math.sin(Math.PI * f);
          s.clog = Math.min(1, START + s.done * 0.12 + 0.12 * ISO.ease(f) + 0.04 * Math.sin(2 * Math.PI * f));
          if (f >= 1) { s.done++; s.u = 0; s.p = 0; }
        } else if (goal.strokes < s.done) { s.done = goal.strokes; }
        // once the clog reaches the wall pipe, the basin empties through the open drain (about 2 cm a second)
        if (s.clog >= 0.99) { s.clog = 1; s.level = calm ? FZ : Math.max(FZ, s.level - 2.4 * dt); }
        draw();
        return s.done < goal.strokes || (s.clog >= 1 && s.level > FZ);
      };
      g.readout = () => {
        if (s.clog >= 1) return s.level > FZ + 0.2 ? "clog pushed through into the wall pipe · the sink is draining" : "drained · run hot water for a minute to flush it";
        return `${s.done} of ${goal.strokes || "a few"} strokes · ${s.p > 0.05 ? "push: the cup drives a pulse of water (about 0.2 bar) at the clog" : "pull: suction rocks the clog back"} · water stands ${Math.round(s.level - FZ)} cm deep`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
