// "pinpadlock cx cy k key=0..1 turn=0|1 clamp=0|1 lab=0 lit=body|shackle|plug|pins|springs|key|balls" — a PART
// (PARTS.md, batch 6): a laminated pin-tumbler padlock cut open down the middle, 5 cm wide, 5.6 cm body (the shackle
// 3.1 cm more), so its back half (1.25 cm) shows the works on the cut face. Origin: the middle of the body's bottom
// on the cut plane. The plug runs up from the keyway; five pin stacks (key pin, driver pin, spring) cross the shear
// line from the side. key 0..1 slides the key up into the plug (at 0 its tip is at the keyway, the bow hangs 6.3 cm
// below: place the lock in a lockstand, at=stand.lock clamp=1); its cuts push each key pin to its own depth, and only
// when every key pin ends on the shear line can the plug turn. turn=1 turns it 90°: the cam on the plug's top turns,
// the two locking balls fall onto its flats and the spring under the long leg pops the shackle up 1.1 cm. clamp=1
// draws the stand's near clamp block over the body (painter's order: it is in front of the body's side).
// Reused from padlock.js (1 unit = 0.625 mm here). set({ key, turn }). anchors: top keyway
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), D = (p, s) => K.dotsSvg(p, s);
  const F = 0.0625, BW = 40, BD = 20, BH = 90, RP = 12, PT = 70, PINZ = [14, 25, 36, 47, 58], CUTS = [3, 7, 4.5, 8, 5.5], LD = 12, CH = 34, REST = -3;
  const LEG = 20, RS = 5, LIFT = 17.6, BALLZ = 75, BLADE = 62, TRAVEL = 66, INK = "#3c3f45", CUT = "#d5dbe2";
  const STEEL = ["#9a9da3", "#e3e4e7"], BRASS = ["#b89545", "#f1dd9f"];
  const LKEY = CUTS.map((e) => RP - e);
  const stroke = (d, w, c = INK, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const faceOf = (P, pts, fill, w = 0.8, y = 0) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, y, z], P)), true)}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
  const edge = (u) => (u < 0 || u > BLADE ? null : Math.min(9, ...CUTS.map((e, i) => e + Math.abs(u - PINZ[i])), 9 - Math.max(0, u - (BLADE - 7)) * 1.2));
  const tipsOf = (ins) => PINZ.map((z) => { const e = edge(z + TRAVEL * (1 - ins)); return e === null ? REST : Math.max(REST, e); });
  const camHalf = (phi) => 7.5 * Math.abs(Math.cos(phi)) + 3.5 * Math.abs(Math.sin(phi)) + 3;
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
  const xcoil = (P, x0, x1, z, r, turns) => K.pathOf(Array.from({ length: turns * 2 + 1 }, (_, i) => K.iso([x0 + ((x1 - x0) * i) / (turns * 2), 0, z + (i % 2 ? r : -r) * (i === 0 || i === turns * 2 ? 0 : 1)], P)));

  ISO.add({
    name: "pinpadlock", title: "Cut-open padlock (part)", compare: null,
    about: "A laminated pin-tumbler padlock cut open: the key slides in (key 0..1) and lines its five pin stacks up on the shear line, turn=1 turns the plug 90°, the balls drop and the shackle pops up 1.1 cm; place it in a lockstand with clamp=1. anchors: top keyway",
    line: "pinpadlock cx cy k key=0..1 turn=0|1 clamp=0|1 lab=0 lit=body|shackle|plug|pins|springs|key|balls",
    demo: { line: "pinpadlock 480 330 34 lab=1", script: [{ set: { key: 0.45 }, hold: "settle" }, { set: { key: 1, lit: "pins" }, hold: "settle" }, { set: { turn: 1, lit: "balls" }, hold: "settle" }, { set: { turn: 0, lit: "" }, hold: "settle" }] },
    make([cx = 480, cy = 330, k = 3], o, t, parent) {
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const Q = B36.cam(P, F), kq = K.cameraOf(Q).k, open = o.turn === "1";
      const rot = (phi) => ({ ...Q, azimuth: Q.azimuth + (phi * 180) / Math.PI });
      // ── the body: back wall, the three section pieces (laminated steel), laminations on the right side, rivets
      const st = [`<path class="iso-halo" d="${K.haloOf({ x: -BW * F, y: -BD * F, w: 2 * BW * F, d: BD * F, r: 0.2 }, 0, BH * F, P)}"/>`];
      st.push(ISO.wbox(Q, [-BW, BW], [-BD, -BD + 1], [0, BH], "mid"));
      const pieces = [LEFT, MID, RIGHT];
      for (const pc of pieces) st.push(ISO.prismY(Q, pc, -BD + 1, 0, STEEL, CUT, INK));
      st.push(stroke(Array.from({ length: 14 }, (_, i) => K.pathOf([[BW, 0, 6 + i * 6], [BW, -BD, 6 + i * 6]].map((p) => K.iso(p, Q)))).join(""), 0.7, "#6f747b"));
      const back = st.join("");
      const sec = pieces.map((pc) => faceOf(Q, pc, CUT, 1));
      sec.push(stroke([6, 30, 54, 78].map((z) => K.pathOf([[-BW, 0, z], [z < 18 ? -RP : -25, 0, z]].map((p) => K.iso(p, Q)))).join("") + [6, 30, 54].map((z) => K.pathOf([[RP, 0, z + 5], [BW, 0, z + 5]].map((p) => K.iso(p, Q)))).join(""), 0.6, "#a7b0ba"));
      for (const z of PINZ) sec.push(faceOf(Q, [[RP, z - 2.6], [CH, z - 2.6], [CH, z + 2.6], [RP, z + 2.6]], "#aab4bf", 0.6));
      sec.push(D([[-BW + 4, 4], [BW - 4, 4], [-BW + 4, BH - 4], [BW - 4, BH - 4]].map(([x, z]) => K.iso([x, 0, z], Q)), { size: 1.1, tone: "mid" }));
      const shear = stroke(K.pathOf([[RP, 0, 2], [RP, 0, PT - 2]].map((p) => K.iso(p, Q))), 1.2, "#d0392b", ` stroke-dasharray="4 3"`);

      // ── the turning group: plug, keyway, key pins, key, cam — drawn with the projection turned by phi
      const memo = new Map(), node = (svg) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "g"); e.innerHTML = svg; return e; };
      const half = Array.from({ length: 25 }, (_, i) => [Math.cos((i / 24) * Math.PI) * RP, -Math.sin((i / 24) * Math.PI) * RP]);
      const plugNode = (q) => {
        const key = `p${q}`;
        if (memo.has(key)) return memo.get(key);
        const R = rot((q * 3 * Math.PI) / 180);
        let svg = ISO.tinted(ISO.T.brass, S(K.extrude(half, 0, PT, R), { tone: "hi" }));
        svg += faceOf(R, [[-4.6, 0], [9.6, 0], [9.6, BLADE + 2], [-4.6, BLADE + 2]], "#8a7440", 0.7);
        for (const z of PINZ) svg += faceOf(R, [[9.6, z - 2.6], [RP, z - 2.6], [RP, z + 2.6], [9.6, z + 2.6]], "#a88c4c", 0.5);
        svg += ISO.tinted(ISO.T.steel, S(K.slabOf({ x: -10.5, y: -6.5, w: 21, d: 13, r: 3 }, PT, 10, R, 4, 0.4), { tone: "hi" }));
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
      const driversSvg = (tips) => tips.map((x, i) => { const a = x + LKEY[i], b = a + LD, z = PINZ[i]; return faceOf(Q, [[a, z - 2.3], [b, z - 2.3], [b, z + 2.3], [a, z + 2.3]], "#d9dce0", 0.7, 0.05); }).join("");
      const springsSvg = (tips) => tips.map((x, i) => stroke(xcoil(Q, x + LKEY[i] + LD, CH, PINZ[i], 2, 6), 0.9, "#4a5058")).join("");
      // ── the shackle: a round bar bent into a U, a notch on each leg facing the balls
      const shackleSvg = (lift) => {
        const pts = [[-LEG, 50 + lift], [-LEG, 120 + lift], ...ISO.arc(0, 120 + lift, LEG, Math.PI, 0, 24), [LEG, 72 + lift]];
        const d = K.pathOf(pts.map(([x, z]) => K.iso([x, 0, z], Q)));
        const notch = [-1, 1].map((sx) => faceOf(Q, ISO.arc(sx * (LEG - RS + 0.5), BALLZ + lift, 3.5, sx > 0 ? Math.PI / 2 : -Math.PI / 2, sx > 0 ? Math.PI * 1.5 : Math.PI / 2, 10), "#8d9096", 0.6, RS - 1)).join("");
        return stroke(d, (2 * RS + 0.8) * kq, INK) + stroke(d, 2 * RS * kq, "#c9ccd1") + stroke(d, RS * 0.7 * kq, "#eceef0") + notch;
      };
      // the stand's near clamp, drawn in the lock's own world (the stand's world moved by its lock anchor)
      const L = B36.LOCK, clamp = o.clamp === "1" ? B36.clamp(B36.cam(P, 1, [0, -L.Y, -L.Z0]), 1) : "";
      g.innerHTML = `<g data-name="body">${back}</g><g data-name="plug"><g data-part="plugB"></g></g><g data-name="body">${sec.join("")}</g>` +
        `<g data-name="springs"><g data-part="lspring"></g></g><g data-name="shackle"><g data-part="shackle"></g></g>` +
        `<g data-name="plug"><g data-part="plugF"></g></g><g data-name="key"><g data-part="key"></g></g><g data-name="pins"><g data-part="kpins"></g><g data-part="dpins"></g></g>` +
        `<g data-name="springs"><g data-part="springs"></g></g><g data-name="balls"><g data-part="balls"></g></g>${shear}<g>${clamp}</g><g data-part="words"></g>`;
      g.anchors = { top: [0, 0, (120 + LEG) * F], keyway: [0, 0, 0] };
      const el = B36.parts(g), w = ISO.writer();
      const swap = (e, key, n) => { if (e._key !== key) { e._key = key; e.replaceChildren(n); e.parentNode._fresh = true; } };
      const s = { ins: open ? 1 : B36.num(o, "key", 0, 0, 1), phi: open ? Math.PI / 2 : 0, lift: open ? LIFT : 0, v: 0 }, want = { ins: s.ins, phi: s.phi };
      let lit = o.lit || "";
      const aligned = () => tipsOf(s.ins).every((x, i) => Math.abs(x + LKEY[i] - RP) < 0.3);
      const words = !lab ? "" : [
        ISO.word(K.iso([RP + 3, 0, 2], Q), "shear line", "#c0392b", { size: 13, anchor: "start", dy: 14 }),
        ISO.word(K.iso([BW + 8, 0, 62], Q), "springs", "#555", { size: 13, anchor: "start" }),
        ISO.word(K.iso([BW + 8, 0, 40], Q), "driver pins", "#555", { size: 13, anchor: "start" }),
        ISO.word(K.iso([BW + 8, 0, 18], Q), "key pins", "#555", { size: 13, anchor: "start" }),
        ISO.word(K.iso([-LEG - 10, 0, 150], Q), "shackle", "#555", { size: 13, anchor: "end" }),
      ].join("");
      el.words.innerHTML = words;
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
        w.rebuild(el.lspring, String(lq), () => { const c = zcoil(-LEG, 4, 18, 50 + lq, 6, Q); return stroke(c.back, 0.84 * kq, "#5b6470") + stroke(c.front, 0.84 * kq, "#2f343a"); });
        const bx = camHalf(phi) + 4, ballX = Math.min(bx, LEG - RS + 3.5 + 0.5);
        w.rebuild(el.balls, `${ballX.toFixed(2)}`, () => ISO.tinted(ISO.T.steel, [-1, 1].map((sx) => S(G.sphereOf([sx * ballX, 0, BALLZ], 4, Q), { tone: "hi" })).join("")));
        B36.light(w, g, lit);
      };
      g.set = (p) => {
        if (p.key !== undefined && s.phi < 0.01) want.ins = ISO.clamp(+p.key, 0, 1);
        if (p.turn !== undefined) want.phi = String(p.turn) === "1" ? Math.PI / 2 : 0;
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still();
        if (s.phi < 0.01) { const d = want.ins - s.ins; s.ins = calm || Math.abs(d) < 0.002 ? want.ins : s.ins + Math.sign(d) * Math.min(Math.abs(d), dt * (0.12 + Math.abs(d) * 1.2)); }
        const go = want.phi > 0 ? aligned() && s.ins === 1 : true;
        if (go) s.phi = ISO.follow(s.phi, want.phi, dt, 0.28, calm);
        if (Math.abs(s.phi - want.phi) < 0.003 && go) s.phi = want.phi;
        if (s.phi > 1.2 && s.lift < LIFT) { s.v += 900 * dt; s.lift = Math.min(LIFT, s.lift + s.v * dt); if (calm) s.lift = LIFT; if (s.lift >= LIFT) s.v = 0; }
        draw();
        return s.ins !== want.ins || (go && s.phi !== want.phi) || (s.phi > 1.2 && s.lift < LIFT);
      };
      g.readout = () => {
        const tips = tipsOf(s.ins), on = tips.filter((x, i) => Math.abs(x + LKEY[i] - RP) < 0.3).length;
        const state = s.lift >= LIFT - 0.1 ? "open: the balls dropped onto the cam's flats and the spring threw the shackle up 11 mm" : s.phi > 0.05 ? `plug turned ${((s.phi * 180) / Math.PI).toFixed(0)}°` : on === 5 ? "all 5 pins on the shear line: the plug is free to turn" : `${on} of 5 pins on the shear line: the driver pins still block the plug`;
        return `key ${(s.ins * 100).toFixed(0)}% in · ${state} · 5 pins × 6 depths = 7776 different keys`;
      };
      draw();
      return g;
    },
  });
})();
