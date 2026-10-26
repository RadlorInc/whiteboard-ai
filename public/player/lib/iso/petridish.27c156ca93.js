// "petridish cx cy size day=2 disc=1 lab=1" — a petri dish of agar with bacterial colonies growing over days.
// A glass dish and its lid (lifted), amber agar, colonies that grow from specks (day 0) to spots a few mm across
// (day 2), doubling about every 20–30 minutes at 37 °C, and an antibiotic paper disc with a clear ring round it
// where nothing grows. set({ day }) incubates it.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const R = 50, DISC = [18, -10], ZONE = 15;
  const zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  // Where colonies start: a scatter across the plate, none inside the clear zone round the disc.
  const SEEDS = (() => {
    const out = []; let a = 1;
    for (let i = 0; i < 70; i++) {
      a = (a * 9301 + 49297) % 233280; const r = Math.sqrt(a / 233280) * (R - 6); a = (a * 9301 + 49297) % 233280; const t = (a / 233280) * Math.PI * 2;
      const p = [Math.cos(t) * r, Math.sin(t) * r]; if (Math.hypot(p[0] - DISC[0], p[1] - DISC[1]) > ZONE) out.push([...p, 0.6 + ((i * 7) % 5) * 0.15]);
    }
    return out;
  })();

  function dishSvg(P, lab) {
    const out = [`<path class="iso-halo" d="${K.haloOf({ x: -R - 6, y: -R - 6, w: 2 * R + 12, d: 2 * R + 12, r: R }, 0, 4, P)}"/>`];
    out.push(`<g opacity=".55">${ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, R + 2], [12, R + 2], [12, R]], zAx([0, 0, 0]), P, { steps: 64 }), { tone: "hi" }))}</g>`);
    out.push(`<path d="${K.ring(0, 0, R - 0.5, 5, P, 64)}" fill="#f2c96b" fill-opacity=".85" stroke="#a87a1c" stroke-width="0.6"/>`);
    // The antibiotic disc: a white paper disc printed with its code.
    out.push(S(K.cylinder(DISC[0], DISC[1], 3.2, 5, 0.6, P, 24), { tone: "hi" }), K.faceTextSvg(K.topMatrix([DISC[0] - 2.4, DISC[1] + 0.8], 5.6, P, "x"), "AMP", { size: 1.8, tone: "lo" }));
    if (lab) out.push(ISO.word(K.iso([R + 4, DISC[1], 6], P), "← antibiotic disc: clear zone", "#555", { size: 13, anchor: "start" }), ISO.word(K.iso([0, R + 4, 0], P), "agar jelly", "#8a6a10", { size: 13, dy: 16 }));
    return out.join("");
  }
  // Colonies at a given day: cream spots growing in radius, a few with darker centres.
  function coloniesSvg(P, day) {
    const out = [];
    for (const [x, y, k] of SEEDS) {
      const r = Math.min(4, 0.25 + 1.6 * day * k);
      out.push(`<path d="${K.ring(x, y, r, 5.05, P, 16)}" fill="#fbf3dc" stroke="#c9a85a" stroke-width="0.5"/>`);
    }
    return out.join("");
  }
  // The lid, held up above the dish so you can see in.
  // The lid, set down behind the dish, upside down so it doesn't hide the plate.
  const lidSvg = (P) => `<g opacity=".5">${ISO.tinted(ISO.T.glass, S(G.lathe([[0, 0], [0, R + 4.5], [10, R + 4.5], [10, R + 2.5]], zAx([-40, -112, 0]), P, { steps: 64 }), { tone: "hi" }))}</g>`;

  ISO.add({
    name: "petridish", title: "Petri dish with colonies", compare: "petridish 480 260 560",
    about: "Bacteria on agar grow from specks into colonies over two days; none grow round an antibiotic disc.",
    line: "petridish cx cy size day=2 lab=1",
    demo: { line: "petridish 480 270 420 day=0", script: [{ set: {}, hold: 1 }, { set: { day: 1 }, hold: "settle" }, { set: { day: 2 }, hold: "settle" }] },
    make([cx, cy, size = 560], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.45, H = size * 0.95;
      const { P, g } = ISO.frame([[-R - 6, -R - 6, 0], [R + 6, R + 6, 0], [-40 - R - 6, -112 - R - 6, 0], [-40 + R, -112 + R, 12]], cx, cy, W, H, { azimuth: 45, elevation: 40 }, parent);
      const s = { day: ISO.clamp(ISO.num(o, "day", 2), 0, 3), dT: 0 }; s.dT = s.day;
      g.innerHTML = `<g>${lidSvg(P)}</g><g>${dishSvg(P, lab)}</g><g data-part="colonies"></g>`;
      const el = g.querySelector('[data-part="colonies"]'), w = ISO.writer();
      const draw = () => w.rebuild(el, (Math.round(s.day * 40) / 40).toFixed(3), () => coloniesSvg(P, Math.round(s.day * 40) / 40));
      g.set = (p) => { if (p.day !== undefined) s.dT = ISO.clamp(+p.day, 0, 3); };
      g.update = (dt) => { s.day = ISO.follow(s.day, s.dT, dt, 1, ISO.still()); draw(); return s.day !== s.dT; };
      g.readout = () => `day ${s.day.toFixed(1)} at 37 °C · each colony started from one cell; doubling every 20–30 min makes millions in a day · no growth within ${ZONE / 2 * 2} mm of the antibiotic`;
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
