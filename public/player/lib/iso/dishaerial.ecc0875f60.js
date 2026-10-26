// "dishaerial cx cy k el=15..60 aim=0..10 rays=0|1 lab=0 lit=dish|lnb|struts|arm|bracket|rays" — a PART (PARTS.md):
// satdish.js's 1.2 m prime-focus dish as a part, its origin the pole-top point its collar slides over (place it at= a
// steelpole's `top`). The collar clamps 14 cm of the pole; on it the elevation bracket's two cheek plates and pivot
// bolt, and the adjusting bolt from a lug on the collar up to the back arm. The arm carries the spun-aluminium
// reflector (a true paraboloid, focus 46 cm in front of its middle) with its rolled rim and back plate; three feed
// struts from the rim hold the LNB (the feed horn and its box, with its F socket underneath) at the focus. el = the
// satellite's elevation (degrees): the parallel waves come in from there. aim = how many degrees the dish points off
// the satellite: it tips down by that much (drawn 3× so it shows; a 1.2 m dish's beam is only about 1.5° wide), and
// the bounced rays miss the horn. rays=1 draws the waves. set({ aim, el, rays }). World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const R = 60, F = 46, BACK = 12, PVZ = 8, AZB = -30, VIS = 3, RAY = 95;
  const rad = (d) => (d * Math.PI) / 180, sOf = (r) => (r * r) / (4 * F);
  const H = [Math.cos(rad(AZB)), Math.sin(rad(AZB)), 0], PA = [-H[1], H[0], 0], PV = [0, 0, PVZ];
  const ALU = ISO.tint("#eef0f2", ["#aeb3b9", "#bcc0c5", "#cacdd1", "#d8dadd"], "#4a4f56");
  const signal = (aim) => Math.exp(-2.77 * (aim / 1.5) ** 2);
  // the dish's own frame at tilt th (degrees above level): axis AX, v = "up" square to it, u = the pivot's axis
  const frameAt = (th) => { const a = [H[0] * Math.cos(rad(th)), H[1] * Math.cos(rad(th)), Math.sin(rad(th))], v = [-H[0] * Math.sin(rad(th)), -H[1] * Math.sin(rad(th)), Math.cos(rad(th))]; return { a, v, vertex: G.add3(PV, G.mul3(a, BACK)) }; };
  const local = (o, a, w, v) => (x, y, z) => G.add3(o, G.add3(G.mul3(a, x), G.add3(G.mul3(PA, y), G.mul3(v, z))));
  const LUG = G.add3([0, 0, -11], G.mul3(H, 4.6));   // the adjusting bolt's lug on the collar, toward the dish

  // the collar on the pole top, its clamp bolts, the bracket's cheek plates and the pivot bolt through them
  function mountSvg(P) {
    const zf = G.frameOf([0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]), out = [];
    out.push(ISO.tinted(B37.ZINC, S(K.cylinder(0, 0, 4.4, -14, 12.6, P, 28, 0.4), { tone: "mid", inner: L(G.arcOf(zf, -7, 4.4, P), { tone: "faint" }) }) + S(K.cylinder(0, 0, 4.2, -1.4, 1.4, P, 28), { tone: "mid" })));
    const at = local([0, 0, 0], H, PA, [0, 0, 1]);
    // the lug for the adjusting bolt and two clamp bolt heads on the collar's side
    out.push(ISO.tinted(B37.ZINC, ISO.box((u, w, y) => at(u, w, y), P, [4, 6.2], [-1, 1], [-12.5, -9.5], "mid")));
    for (const z of [-11, -4]) out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, 1, 0.9, G.frameAlong(at(0, 4.3, z), PA), P, { steps: 6 }), { tone: "hi" })));
    // the cheeks: two plates on the collar's top, square to the pivot, up past it
    for (const y of [-3.2, 2.4]) out.push(ISO.tinted(B37.ZINC, ISO.box((u, w, v) => at(u, w, v), P, [-4, 4], [y, y + 0.8], [-1, PVZ + 3], "mid")));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(-4.4, 4.4, 0.8, G.frameAlong(PV, PA), P, { steps: 12 }), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(3.2, 4.6, 1.3, G.frameAlong(PV, PA), P, { steps: 6 }), { tone: "mid" })));
    return out.join("");
  }
  // the back arm (a square tube from the pivot to the dish's back plate) and the adjusting bolt up to its lug
  function armSvg(P, fr) {
    const at = local(PV, fr.a, PA, fr.v), out = [];
    const armLug = at(4, 0, -4.5), d = G.sub3(armLug, LUG);
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(0, G.len3(d), 0.6, G.frameAlong(LUG, d), P, { steps: 10 }), { tone: "mid", crease: "none", inner: L([0.3, 0.45, 0.6, 0.75].map((f) => G.arcOf(G.frameAlong(LUG, d), G.len3(d) * f, 0.6, P)).join(""), { tone: "faint" }) })));
    out.push(ISO.tinted(ISO.T.steel, S(G.disc(G.len3(d) * 0.5, G.len3(d) * 0.5 + 1.2, 1.1, G.frameAlong(LUG, d), P, { steps: 6 }), { tone: "hi" })));
    out.push(ISO.tinted(B37.ZINC, ISO.box(at, P, [-2.5, BACK - 1], [-2.2, 2.2], [-2.2, 2.2], "mid")));
    out.push(ISO.tinted(B37.ZINC, ISO.box(at, P, [2.5, 5.5], [-1.2, 1.2], [-5.5, -2.2], "mid")));
    // the back plate the dish is bolted to
    out.push(ISO.tinted(B37.ZINC, ISO.box(at, P, [BACK - 1.6, BACK - 0.4], [-7, 7], [-7, 7], "mid")));
    return out.join("");
  }
  function dishSvg(P, fr) {
    const DF = G.frameOf(fr.vertex, fr.a, PA, fr.v), out = [];
    // the shell with its rolled rim, then the face's shading rings, deeper toward the middle
    out.push(ISO.tinted(ALU, B37.dish(P, DF, R, F, 0.9, { steps: 48, lip: 1.2 })));
    for (const f of [0.75, 0.5, 0.25]) out.push(`<path d="${G.circleOf(DF, sOf(R * f) + 0.07, R * f, P, 40)}" fill="#d4d8dc" fill-opacity=".45" stroke="none"/>`);
    // a small sticker on the face near the bottom: the dish's size, no brand
    out.push(L(G.arcOf(DF, sOf(R) + 0.08, R - 4, P, { from: rad(250), to: rad(290) }), { tone: "faint", free: true }));
    return out.join("");
  }
  // three struts from the rim to the LNB holder; the holder ring, the LNB box, its feed horn and the F socket
  function feedSvg(P, fr) {
    const DF = G.frameOf(fr.vertex, fr.a, PA, fr.v), focus = G.pointOf(DF, F, 0, 0), LF = G.frameAlong(focus, G.mul3(fr.a, -1)), out = [];
    const hold = G.pointOf(LF, -12, 0, 0);
    const rimMid = G.pointOf(DF, sOf(R) - 0.4, 0, 0);
    const tips = [90, 210, 330].map((a) => { const tp = G.pointOf(DF, sOf(R) - 0.4, R - 1, rad(a)); return [tp, G.add3(hold, G.mul3(G.unit3(G.sub3(tp, rimMid)), 6))]; });
    const struts = tips.map(([tp, end]) => { const d = G.sub3(end, tp); return { k: K.depthOf(G.mul3(G.add3(tp, end), 0.5), P), svg: ISO.tinted(ISO.T.steel, S(G.disc(0, G.len3(d), 0.9, G.frameAlong(tp, d), P, { steps: 8 }), { tone: "mid", crease: "none" })) }; });
    const lnb = [];
    lnb.push(ISO.tinted(ISO.T.plastic, S(G.disc(-21, -9, 5, LF, P, { steps: 20 }), { tone: "mid" })));
    lnb.push(ISO.tinted(ISO.T.plastic, S(G.disc(-13, -11, 6.2, LF, P, { steps: 24 }), { tone: "lo" })));
    lnb.push(ISO.tinted(ALU, S(G.solidOf([[-9, 3.5], [0, 5.6]], LF, P, { steps: 24 }), { tone: "hi" })));
    lnb.push(`<path d="${G.circleOf(LF, 0.05, 4.6, P, 24)}" fill="#26292e"/>`);
    // the F socket under the box, pointing down (square to the dish's axis); the cable plugs in here
    const portFoot = G.add3(G.pointOf(LF, -18, 0, 0), G.mul3(fr.v, -5)), down = G.mul3(fr.v, -1);
    lnb.push(B37.fport(P, portFoot, down));
    const sk = K.depthOf(hold, P);
    return {
      svg: `<g data-name="struts">${struts.filter((s) => s.k <= sk).map((s) => s.svg).join("")}</g><g data-name="lnb">${lnb.join("")}</g><g data-name="struts">${struts.filter((s) => s.k > sk).map((s) => s.svg).join("")}</g>`,
      port: G.add3(portFoot, G.mul3(down, 1.1)), focus,
    };
  }
  // the waves: parallel lines from the satellite (along el) onto the face, bounced to the focus or past it
  function raysSvg(P, fr, off, el) {
    const DF = G.frameOf(fr.vertex, fr.a, PA, fr.v), inc = [H[0] * Math.cos(rad(el)), H[1] * Math.cos(rad(el)), Math.sin(rad(el))];
    const miss = G.add3(G.pointOf(DF, F, 0, 0), G.mul3(fr.v, -F * Math.tan(rad(off)))), c = K.iso(miss, P), out = [];
    for (const f of [-0.8, -0.45, 0.45, 0.8, 0]) for (const side of [Math.PI / 2, 0]) {
      if (side === 0 && f === 0) continue;
      const hit = G.pointOf(DF, sOf(Math.abs(f * R)), f * R, side === 0 ? 0 : side), a = K.iso(G.add3(hit, G.mul3(inc, RAY)), P), b = K.iso(hit, P);
      out.push(`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`);
    }
    return `<path d="${out.join("")}" fill="none" stroke="#e08a1a" stroke-width="1.3" stroke-opacity=".85" data-free=""/>`;
  }

  ISO.add({
    name: "dishaerial", title: "Satellite dish (part)", compare: null,
    about: "A 1.2 m prime-focus satellite dish on its collar: aluminium reflector with a rolled rim, three struts holding the LNB at the focus, back arm, elevation bracket and adjusting bolt; aim it off the satellite and the bounced waves miss the horn. anchors: lnb focus",
    line: "dishaerial cx cy k el=15..60 aim=0..10 rays=0|1 lab=0 lit=dish|lnb|struts|arm|bracket|rays",
    demo: { line: "dishaerial 380 360 2.6 el=30 aim=4 rays=1 lab=1", script: [{ set: {}, hold: 1.5 }, { set: { aim: 0, lit: "lnb" }, hold: "settle" }, { set: { el: 45, lit: "dish" }, hold: "settle" }, { set: { rays: 0, lit: "bracket" }, hold: 1.2 }, { set: { rays: 1, aim: 2, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 300, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { el: B37.num(o, "el", 30, 15, 60), aim: B37.num(o, "aim", 0, 0, 10), rays: o.rays === "0" ? 0 : 1, lit: o.lit || "" };
      const s = { el: st.el, aim: st.aim, ph: 0 };
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -5, y: -5, w: 10, d: 10, r: 4 }, -14, 0, P)}"/><g data-name="bracket">${mountSvg(P)}</g><g data-name="arm"></g><g data-name="dish"></g><g data-name="rays"></g><g data-part="feed"></g><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { arm: q("arm"), dish: q("dish"), rays: q("rays"), feed: q("feed"), words: q("words") }, w = ISO.writer();
      let feed = null;
      const tiltOf = () => s.el - s.aim * VIS;
      const draw = () => {
        const th = Math.round(tiltOf() * 2) / 2, fr = frameAt(th), key = String(th), off = st.el - th;
        w.rebuild(el.arm, key, () => armSvg(P, fr));
        w.rebuild(el.dish, key, () => dishSvg(P, fr));
        w.rebuild(el.feed, key, () => { feed = feedSvg(P, fr); return feed.svg; });
        w.rebuild(el.rays, `${key} ${st.el} ${st.rays}`, () => (st.rays ? raysSvg(P, fr, Math.round((s.el - th) * 4) / 4, s.el) : ""));
        w.attr(el.rays, "stroke-dasharray", `${(6 * k).toFixed(1)} ${(4 * k).toFixed(1)}`);
        w.attr(el.rays, "stroke-dashoffset", (-s.ph * 10 * k).toFixed(1));
        const hit = Math.abs(s.aim) < 0.3;
        w.rebuild(el.words, lab ? `${key} ${hit}` : "", () => !lab ? "" : [
          ISO.word(K.iso(feed.focus, P), hit ? "LNB at the focus" : "bounced waves miss the LNB", hit ? "#2c6a22" : "#a3271b", { size: 13, anchor: "start", dy: -16 }).replace('x="', 'dx="12" x="'),
          ISO.word(K.iso(G.pointOf(G.frameOf(fr.vertex, fr.a, PA, fr.v), sOf(R), R, Math.PI), P), "parabolic dish", "#444", { size: 13, anchor: "end", dy: 16 })].join(""));
        B37.light(w, g, st.lit);
        return off;
      };
      g.set = (p) => {
        if (p.aim !== undefined) st.aim = B37.num(p, "aim", st.aim, 0, 10);
        if (p.el !== undefined) st.el = B37.num(p, "el", st.el, 15, 60);
        if (p.rays !== undefined) st.rays = String(p.rays) === "0" ? 0 : 1;
        if (p.lit !== undefined) st.lit = p.lit;
        draw();
      };
      // the installer turns the dish slowly on its bracket; the waves crawl in toward it
      g.update = (dt) => {
        const calm = ISO.still();
        s.aim = ISO.follow(s.aim, st.aim, dt, 0.6, calm); s.el = ISO.follow(s.el, st.el, dt, 0.6, calm);
        if (Math.abs(s.aim - st.aim) < 0.01) s.aim = st.aim;
        if (Math.abs(s.el - st.el) < 0.02) s.el = st.el;
        if (!calm) s.ph = (s.ph + dt) % 100;
        draw();
        return s.aim !== st.aim || s.el !== st.el;
      };
      g.readout = () => `aimed ${s.aim.toFixed(1)}° off the satellite · signal ${Math.round(signal(s.aim) * 100)} % · 1.2 m dish, focus 46 cm in front of it · its beam is only about 1.5° wide (the drawing tips it 3× so it shows)`;
      draw();
      g.anchors = { lnb: feed.port, focus: feed.focus };
      return g;
    },
  });
})();
