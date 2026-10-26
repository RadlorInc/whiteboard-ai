// "padlock cx cy height k=locked|open key=0..1 turn=0|1 lab=1 lit=shackle|plug|pins|springs|key|balls" — a laminated
// pin-tumbler padlock cut open down the middle, clamped to a display stand. The plug runs up from the keyway; five pin
// stacks (key pin, driver pin, spring) cross the shear line from the side. The key slides up and its cuts push each key
// pin to its own depth; only when every key pin ends exactly on the shear line can the plug turn. Turning 90° turns the
// cam on the plug's top, the two locking balls fall onto its flats, and the spring under the long leg pops the shackle
// up 11 mm. key=0..1 slides the key in, turn=1 turns it. 1 unit = 0.5 mm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const BW = 40, BD = 16, BH = 90, RP = 12, PT = 70, PINZ = [14, 25, 36, 47, 58], CUTS = [3, 7, 4.5, 8, 5.5], LD = 12, CH = 34, REST = -3;
  const LEG = 20, RS = 5, LIFT = 22, BALLZ = 75, BLADE = 62, TRAVEL = 66, ZO = 100, INK = "#3c3f45", CUT = "#d5dbe2";
  const STEEL = ["#9a9da3", "#e3e4e7"], BRASS = ["#b89545", "#f1dd9f"];
  const LKEY = CUTS.map((e) => RP - e);
  const stroke = (d, w, c = INK, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const faceOf = (P, pts, fill, w = 0.8, y = 0) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
  // the key's edge (x) at height u above its shoulder: V cuts under each pin, full width between, a ramped tip
  const edge = (u) => (u < 0 || u > BLADE ? null : Math.min(9, ...CUTS.map((e, i) => e + Math.abs(u - PINZ[i])), 9 - Math.max(0, u - (BLADE - 7)) * 1.2));
  const tipsOf = (ins) => PINZ.map((z) => { const e = edge(z + TRAVEL * (1 - ins)); return e === null ? REST : Math.max(REST, e); });
  // the cam's half width along x when turned phi: a rounded 21 × 13 block
  const camHalf = (phi) => 7.5 * Math.abs(Math.cos(phi)) + 3.5 * Math.abs(Math.sin(phi)) + 3;
  // body pieces in section (the plug bore, cam channel and shackle bores between them)
  const LEFT = [[-BW, 0], [-RP, 0], [-RP, PT], [-15, PT], [-15, 18], [-25, 18], [-25, BH], [-BW, BH]];
  const MID = [[-15, 80], [15, 80], [15, BH], [-15, BH]];
  const RIGHT = [[RP, 0], [BW, 0], [BW, BH], [25, BH], [25, PT], [RP, PT]];
  function zcoil(cx, r, z0, z1, turns, P) {
    const back = [], front = [], n = Math.round(turns * 18), [vx, vy] = K.towardViewer(P);
    let run = [], near = null;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * turns * Math.PI * 2, p = K.iso([cx + Math.cos(a) * r, Math.sin(a) * r, z0 + ((z1 - z0) * i) / n], P), f = Math.cos(a) * vx + Math.sin(a) * vy > 0;
      if (near === null) near = f;
      if (f !== near) { run.push(p); (near ? front : back).push(K.pathOf(run)); run = [p]; near = f; continue; }
      run.push(p);
    }
    if (run.length > 1) (near ? front : back).push(K.pathOf(run));
    return { back: back.join(""), front: front.join("") };
  }
  // a spring lying along x in the plane y = 0 (the pin springs), drawn as a zigzag of coils seen side on
  const xcoil = (P, x0, x1, z, r, turns) => K.pathOf(Array.from({ length: turns * 2 + 1 }, (_, i) => K.iso([x0 + ((x1 - x0) * i) / (turns * 2), 0, z + (i % 2 ? r : -r) * (i === 0 || i === turns * 2 ? 0 : 1)], P)));

  ISO.add({
    name: "padlock", title: "Pin-tumbler padlock", compare: "padlock 480 280 340 k=locked",
    about: "A padlock cut in half: the key's cuts push five pin stacks to the shear line, the plug turns, the locking balls drop onto the cam's flats and the shackle springs open.",
    line: "padlock cx cy height k=locked|open key=0..1 turn=0|1 lab=1 lit=shackle|plug|pins|springs|key|balls",
    demo: { line: "padlock 480 270 440", script: [{ set: { key: 0.45 }, hold: "settle" }, { set: { key: 1, lit: "pins" }, hold: "settle" }, { set: { turn: 1, lit: "" }, hold: "settle" }, { set: { turn: 0 }, hold: "settle" }] },
    make([cx, cy, size = 340], o, t, parent) {
      const lab = o.lab !== "0", H = size * 1.12, W = size * 1.45, open = o.k === "open";
      const BASE = { x: -56, y: -46, w: 112, d: 70, r: 6 };
      const { P, g } = ISO.frame([...K.boxCorners(BASE, -11, 0), [-BW, -BD - 10, ZO + 175], [BW, 0, ZO + 175], [BW + 30, 0, ZO + 60], [-BW - 30, 0, ZO + 60]], cx, cy, W, H, { azimuth: 62, elevation: 18, pad: 6 }, parent);
      const Q = { ...P, origin: K.iso([0, 0, ZO], P) }, k = K.cameraOf(P).k;
      const rot = (phi) => ({ ...Q, azimuth: Q.azimuth + (phi * 180) / Math.PI });

      // ── the stand: board, upright plate, two clamp blocks gripping the body's sides
      const st = [ISO.tinted(ISO.T.wood, ISO.baseboard(P, BASE, { h: 7, feet: 4 }))];
      st.push(ISO.tinted(ISO.T.wood, ISO.wbox(P, [-50, 50], [-BD - 14, -BD - 4], [0, ZO + 96], "mid")));
      st.push(D([[-44, ZO + 88], [44, ZO + 88], [-44, 12], [44, 12]].map(([x, z]) => K.iso([x, -BD - 4, z], P)), { size: 0.7 }));
      for (const sx of [-1, 1]) st.push(ISO.tinted(ISO.T.steel, ISO.wbox(Q, sx < 0 ? [-BW - 10, -BW] : [BW, BW + 10], [-BD - 4, 4], [30, 60], "mid")), D([K.iso([sx * (BW + 5), 4, 38], Q), K.iso([sx * (BW + 5), 4, 52], Q)], { size: 0.8 }));
      // body back wall, then the three section pieces (laminated steel)
      st.push(ISO.wbox(Q, [-BW, BW], [-BD, -BD + 1], [0, BH], "mid"));
      const pieces = [LEFT, MID, RIGHT];
      for (const pc of pieces) st.push(ISO.prismY(Q, pc, -BD + 1, 0, STEEL, CUT, INK));
      // laminations on the right side face, rivets at the corners
      st.push(stroke(Array.from({ length: 14 }, (_, i) => K.pathOf([[BW, 0, 6 + i * 6], [BW, -BD, 6 + i * 6]].map((p) => K.iso(p, Q)))).join(""), 0.7, "#6f747b"));
      const back = st.join("");

      // ── section faces drawn over the plug: laminations across the cut, pin chambers, the shear line
      const sec = pieces.map((pc) => faceOf(Q, pc, CUT, 1));
      sec.push(stroke([6, 30, 54, 78].map((z) => K.pathOf([[-BW, 0, z], [z < 18 ? -RP : -25, 0, z]].map((p) => K.iso(p, Q)))).join("") + [6, 30, 54].map((z) => K.pathOf([[RP, 0, z + 5], [BW, 0, z + 5]].map((p) => K.iso(p, Q)))).join(""), 0.6, "#a7b0ba"));
      for (const z of PINZ) sec.push(faceOf(Q, [[RP, z - 2.6], [CH, z - 2.6], [CH, z + 2.6], [RP, z + 2.6]], "#aab4bf", 0.6));
      sec.push(D([[-BW + 4, 4], [BW - 4, 4], [-BW + 4, BH - 4], [BW - 4, BH - 4]].map(([x, z]) => K.iso([x, 0, z], Q)), { size: 1.1, tone: "mid" }));
      const shear = stroke(K.pathOf([[RP, 0, 2], [RP, 0, PT - 2]].map((p) => K.iso(p, Q))), 1.2, "#d0392b", ` stroke-dasharray="4 3"`);

      // ── the turning group: plug, keyway, key pins, key, cam — all drawn with the projection turned by phi
      const memo = new Map(), node = (svg) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = svg; return e; };
      const half = Array.from({ length: 25 }, (_, i) => [Math.cos((i / 24) * Math.PI) * RP, -Math.sin((i / 24) * Math.PI) * RP]);
      const plugNode = (q) => {
        const key = `p${q}`;
        if (memo.has(key)) return memo.get(key);
        const R = rot((q * 3 * Math.PI) / 180);
        let svg = ISO.tinted(ISO.T.brass, S(K.extrude(half, 0, PT, R), { tone: "hi" }));
        svg += faceOf(R, [[-4.6, 0], [9.6, 0], [9.6, BLADE + 2], [-4.6, BLADE + 2]], "#8a7440", 0.7);                         // keyway
        for (const z of PINZ) svg += faceOf(R, [[9.6, z - 2.6], [RP, z - 2.6], [RP, z + 2.6], [9.6, z + 2.6]], "#a88c4c", 0.5);  // pin holes
        svg += ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -10.5, y: -6.5, w: 21, d: 13, r: 3 }, PT, 10, R, 4, 0.4), { tone: "hi" }));  // the cam on top
        const v = node(svg);
        memo.set(key, v);
        return v;
      };
      const keyNode = (q) => {
        const key = `k${q}`;
        if (memo.has(key)) return memo.get(key);
        const R = rot((q * 3 * Math.PI) / 180);
        const blade = ISO.prismY(R, [[-4, 0], ...Array.from({ length: BLADE + 1 }, (_, u) => [edge(u), u]), [-4, BLADE - 4]], -1.5, 1.5, BRASS, "#f6e7bf", "#6b5114");
        const bow = ISO.prismY(R, ISO.hullOf([[-14, -5], [14, -5], [-10, -1], [10, -1], ...ISO.arc(0, -21, 13, 0, Math.PI * 2, 24)]), -2, 2, BRASS, "#f6e7bf", "#6b5114",
          faceOf(R, ISO.arc(0, -26, 4.2, 0, Math.PI * 2, 20), "#fdfdfb", 0.9, 2) + stroke(K.pathOf([[-12, 2, -5], [12, 2, -5]].map((p) => K.iso(p, R))), 0.7, "#6b5114"));
        const v = node(bow + blade);
        memo.set(key, v);
        return v;
      };
      const keyPinsSvg = (tips, phi) => {
        const R = rot(phi);
        return tips.map((x, i) => faceOf(R, [[x + 1.2, PINZ[i] - 2.3], [x + LKEY[i], PINZ[i] - 2.3], [x + LKEY[i], PINZ[i] + 2.3], [x + 1.2, PINZ[i] + 2.3], [x, PINZ[i]]], "#e9c766", 0.7, 0.05)).join("");
      };
      const driversSvg = (tips) => tips.map((x, i) => {
        const a = x + LKEY[i], b = a + LD, z = PINZ[i];
        return faceOf(Q, [[a, z - 2.3], [b, z - 2.3], [b, z + 2.3], [a, z + 2.3]], "#d9dce0", 0.7, 0.05);
      }).join("");
      const springsSvg = (tips) => tips.map((x, i) => stroke(xcoil(Q, x + LKEY[i] + LD, CH, PINZ[i], 2, 6), 0.9, "#4a5058")).join("");

      // ── the shackle: a round bar bent into a U, with a notch on each leg facing the balls
      const shackleSvg = (lift) => {
        const pts = [[-LEG, 50 + lift], [-LEG, 120 + lift], ...ISO.arc(0, 120 + lift, LEG, Math.PI, 0, 24), [LEG, 72 + lift]];
        const d = K.pathOf(pts.map(([x, z]) => K.iso([x, 0, z], Q)));
        const notch = [-1, 1].map((sx) => faceOf(Q, ISO.arc(sx * (LEG - RS + 0.5), BALLZ + lift, 3.5, sx > 0 ? Math.PI / 2 : -Math.PI / 2, sx > 0 ? Math.PI * 1.5 : Math.PI / 2, 10), "#8d9096", 0.6, RS - 1)).join("");
        return stroke(d, (2 * RS + 0.8) * k, INK) + stroke(d, 2 * RS * k, "#c9ccd1") + stroke(d, RS * 0.7 * k, "#eceef0") + notch;
      };
      const words = !lab ? "" : [
        ISO.word(K.iso([RP + 3, 0, 2], Q), "shear line", "#c0392b", { size: 13, anchor: "start", dy: 14 }),
        ISO.word(K.iso([BW + 14, 0, 62], Q), "springs", "#555", { size: 13, anchor: "start" }),
        ISO.word(K.iso([BW + 14, 0, 40], Q), "driver pins", "#555", { size: 13, anchor: "start" }),
        ISO.word(K.iso([BW + 14, 0, 18], Q), "key pins", "#555", { size: 13, anchor: "start" }),
        ISO.word(K.iso([-LEG - 10, 0, 150], Q), "shackle", "#555", { size: 13, anchor: "end" }),
      ].join("");
      g.innerHTML = `<g>${back}</g><g data-name="plug"><g data-part="plugB"></g></g><g>${sec.join("")}</g>` +
        `<g data-name="springs"><g data-part="lspring"></g></g><g data-name="shackle"><g data-part="shackle"></g></g>` +
        `<g data-name="plug"><g data-part="plugF"></g></g><g data-name="key"><g data-part="key"></g></g><g data-name="pins"><g data-part="kpins"></g><g data-part="dpins"></g></g>` +
        `<g data-name="springs"><g data-part="springs"></g></g><g data-name="balls"><g data-part="balls"></g></g>${shear}<g>${words}</g>`;
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), w = ISO.writer(), lights = [...g.querySelectorAll("[data-name]")];
      const swap = (e, key, n) => { if (e._key !== key) { e._key = key; e.replaceChildren(n); e.parentNode._fresh = true; } };
      const s = { ins: open ? 1 : 0, phi: open ? Math.PI / 2 : 0, lift: open ? LIFT : 0, v: 0 }, want = { ins: s.ins, phi: s.phi };
      let lit = o.lit || "";
      const aligned = () => tipsOf(s.ins).every((x, i) => Math.abs(x + LKEY[i] - RP) < 0.3);
      const draw = () => {
        const iq = Math.round(s.ins * 150), pq = Math.round((s.phi * 180) / Math.PI / 3), phi = (pq * 3 * Math.PI) / 180, tips = tipsOf(iq / 150);
        const pn = plugNode(pq), behind = pq < 15;
        swap(behind ? el.plugB : el.plugF, `p${pq}`, pn);
        if (behind && el.plugF._key) { el.plugF._key = ""; el.plugF.replaceChildren(); } else if (!behind && el.plugB._key) { el.plugB._key = ""; el.plugB.replaceChildren(); }
        swap(el.key, `k${pq}`, keyNode(pq));
        w.attr(el.key, "transform", K.translateAlong(Q, [0, 0, -TRAVEL * (1 - iq / 150)]));
        w.rebuild(el.kpins, `${iq} ${pq}`, () => keyPinsSvg(tips, phi));
        w.rebuild(el.dpins, String(iq), () => driversSvg(tips));
        w.rebuild(el.springs, String(iq), () => springsSvg(tips));
        const lq = Math.round(s.lift * 4) / 4;
        w.rebuild(el.shackle, String(lq), () => shackleSvg(lq));
        w.rebuild(el.lspring, String(lq), () => { const c = zcoil(-LEG, 4, 18, 50 + lq, 6, Q); return stroke(c.back, 1.4 * k * 0.6, "#5b6470") + stroke(c.front, 1.4 * k * 0.6, "#2f343a"); });
        const bx = camHalf(phi) + 4, ballX = Math.min(bx, LEG - RS + 3.5 + 0.5);
        w.rebuild(el.balls, `${ballX.toFixed(2)}`, () => ISO.tinted(ISO.T.steel, [-1, 1].map((sx) => S(G.sphereOf([sx * ballX, 0, BALLZ], 4, Q), { tone: "hi" })).join("")));
        w.light(lights, lights.filter((p) => p.dataset.name === lit));
      };
      g.set = (p) => {
        if (p.key !== undefined && s.phi < 0.01) want.ins = ISO.clamp(+p.key, 0, 1);
        if (p.turn !== undefined) want.phi = +p.turn ? Math.PI / 2 : 0;
        if (p.k === "open") { want.ins = 1; want.phi = Math.PI / 2; }
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        // the key slides at an even hand speed; it can't be pulled out while the plug is turned
        if (s.phi < 0.01) { const d = want.ins - s.ins; s.ins = calm || Math.abs(d) < 0.002 ? want.ins : s.ins + Math.sign(d) * Math.min(Math.abs(d), dt * (0.12 + Math.abs(d) * 1.2)); }
        // the plug turns only when every pin is on the shear line
        const go = want.phi > 0 ? aligned() && s.ins === 1 : true;
        if (go) s.phi = ISO.follow(s.phi, want.phi, dt, 0.28, calm);
        if (Math.abs(s.phi - want.phi) < 0.003 && go) s.phi = want.phi;
        // the shackle: free once the balls have fallen in (plug past 70°), its spring throws it up; it stays up
        if (s.phi > 1.2 && s.lift < LIFT) { s.v += 900 * dt; s.lift = Math.min(LIFT, s.lift + s.v * dt); if (calm) s.lift = LIFT; if (s.lift >= LIFT) s.v = 0; }
        draw();
        return s.ins !== want.ins || (go && s.phi !== want.phi) || (s.phi > 1.2 && s.lift < LIFT);
      };
      g.readout = () => {
        const tips = tipsOf(s.ins), on = tips.filter((x, i) => Math.abs(x + LKEY[i] - RP) < 0.3).length;
        const state = s.lift >= LIFT - 0.1 ? `open: the balls dropped onto the cam's flats and the spring threw the shackle up ${(LIFT / 2).toFixed(0)} mm` : s.phi > 0.05 ? `plug turned ${((s.phi * 180) / Math.PI).toFixed(0)}°` : on === 5 ? "all 5 pins on the shear line: the plug is free to turn" : `${on} of 5 pins on the shear line: the driver pins still block the plug`;
        return `key ${(s.ins * 100).toFixed(0)}% in · ${state} · cut depths ${CUTS.map((e) => (e / 2).toFixed(1)).join(", ")} mm · 5 pins × 6 depths = 7776 different keys`;
      };
      draw();
      if (t) label(parent, cx, cy - H / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
