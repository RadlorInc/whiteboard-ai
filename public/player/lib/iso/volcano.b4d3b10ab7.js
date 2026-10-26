// "volcano cx baseY width erupt=0..1 lab=1 lit=chamber|vent|crater|sidevent|flow|layers" — a cut-away volcano model.
// A block of rock layers with a cone on top, cut down the middle so the front face shows the inside: the magma
// chamber a few km down, the main vent up to the crater, a side vent off to the flank, and the cone built of
// alternating ash and old lava. erupt=1: magma (about 1,000–1,200 °C) rises up the vent, spills from the crater,
// lava runs down the flanks and ash and gas pour from the vent (smoke as a shader, puffs without WebGL).
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const BX = 140, BD = 80, H0 = 62, RC = 112, HC = 96, rc = 13;
  const rOf = (z) => rc + (RC - rc) * Math.pow(1 - z / HC, 1.55);
  const zOf = (r) => HC * (1 - Math.pow(Math.max(0, (r - rc) / (RC - rc)), 1 / 1.55));
  const CH = { x: -6, z: -38, rx: 46, rz: 15 };                      // magma chamber in the cut face
  const SOIL = ISO.tint("#efe2cc", ["#c4a983", "#cfb793", "#d9c5a5", "#e3d2b7"], "#6b5134");
  const CONE = ISO.tint("#e2d6c8", ["#a8968a", "#b6a598", "#c3b4a8", "#cfc2b7"], "#5e4a3c");

  // the back half of the cone, as stacked convex half-frustums (their joins read as the cone's contour bands)
  function coneSvg(P) {
    const zs = [0, 10, 21, 33, 46, 60, 76, HC], n = 20, out = [];
    for (let k = 0; k < zs.length - 1; k++) {
      const V = [];
      for (const z of [zs[k], zs[k + 1]]) for (let i = 0; i <= n; i++) { const t = Math.PI + (i / n) * Math.PI; V.push([rOf(z) * Math.cos(t), rOf(z) * Math.sin(t) * 0.999, z]); }
      const m = n + 1, F = [Array.from({ length: m }, (_, i) => i), Array.from({ length: m }, (_, i) => m + i), [0, m - 1, 2 * m - 1, m]];
      for (let i = 0; i < n; i++) F.push([i, i + 1, m + i + 1, m + i]);
      out.push(ISO.poly(V, F, P, "mid"));
    }
    return ISO.tinted(CONE, out.join(""));
  }
  // a band in the cut face that follows the cone's outline, from fraction a to b of the way in
  const coneBand = (a, b, col) => {
    const side = (f, s) => Array.from({ length: 13 }, (_, i) => { const z = (i / 12) * HC * (1 - f * 0.55); return [s * (rOf(z) - f * 70 * (1 - z / HC)), z]; });
    const outer = [...side(a, -1), ...side(a, 1).reverse()], inner = [...side(b, -1), ...side(b, 1).reverse()];
    return `<path d="${K.pathOf(outer.map(([x, z]) => [x, -z]), true)}${K.pathOf(inner.map(([x, z]) => [x, -z]), true)}" fill="${col}" fill-rule="evenodd" stroke="none"/>`;
  };
  const wave = (z, amp, ph) => Array.from({ length: 29 }, (_, i) => { const x = -BX + (i / 28) * BX * 2; return [x, -(z + amp * Math.sin(x / 38 + ph))]; });

  ISO.add({
    name: "volcano", title: "Volcano (cut-away model)", compare: "volcano 480 330 330",
    about: "A cut-away volcano model: magma rises from the chamber up the main vent, spills from the crater as lava, and ash pours out.",
    line: "volcano cx baseY width erupt=0..1 lab=1 lit=chamber|vent|crater|sidevent|flow|layers",
    demo: { line: "volcano 480 330 340", script: [{ set: { lit: "chamber" }, hold: 1.6 }, { set: { lit: "", erupt: 1 }, hold: "settle" }, { set: {}, hold: 2.5 }] },
    make([cx, by, w = 340], o, t, parent) {
      const lab = o.lab !== "0", W = w * 2.05, H = w * 1.42, cy = by - w * 0.22;
      const { P, g } = ISO.frame([[-BX - 8, -BD - 8, -H0 - 12], [BX + 8, 8, -H0 - 12], [BX, -BD, 0], [-BX, 0, 0], [0, 0, HC + 120], [-BX, -BD, 0]], cx, cy, W, H, { azimuth: 52, elevation: 24 }, parent);
      const fm = ISO.faceMatrix(P, [0, 0, 0], 1);
      // audit: the base board is drawn through a group transform (down by H0); the audit sees it untranslated and
      // reports it sunk into the block
      // the rock block under the cone, its top and right side; the front is the cut face drawn below
      const block = ISO.tinted(SOIL, ISO.wbox(P, [-BX, BX], [-BD, 0], [-H0, 0], "mid"));
      const sideStrata = [-14, -30, -48].map((z) => K.pathOf([[BX, 0, z], [BX, -BD, z + 3]].map((p) => K.iso(p, P)))).join("");
      // the cut face: rock layers, the cone's ash-and-lava layers, the chamber and the vents (art in x, -z)
      const rock = [["#e8d4b0", -H0, -44], ["#d9c19a", -44, -24], ["#e3cfae", -24, -10], ["#cdb48c", -10, 0]].map(([c, z0, z1], i) =>
        `<path d="${K.pathOf([...wave(z1 === 0 ? 0 : z1, z1 === 0 ? 0 : 2, i), ...wave(z0, z0 === -H0 ? 0 : 2, i - 1).reverse()], true)}" fill="${c}" stroke="#8a6d48" stroke-width=".6" stroke-linejoin="round"/>`).join("");
      const coneOut = [...Array.from({ length: 25 }, (_, i) => { const z = (i / 24) * HC; return [-rOf(z), -z]; }), [-rc + 3, -HC + 7], [rc - 3, -HC + 7], ...Array.from({ length: 25 }, (_, i) => { const z = HC - (i / 24) * HC; return [rOf(z), -z]; })];
      const cone = `<path d="${K.pathOf(coneOut, true)}" fill="#cbbcad" stroke="#5e4a3c" stroke-width="1" stroke-linejoin="round"/>` + coneBand(0.18, 0.36, "#b19d8c") + coneBand(0.54, 0.7, "#b19d8c");
      const chamber = `<ellipse cx="${CH.x}" cy="${-CH.z}" rx="${CH.rx}" ry="${CH.rz}" fill="#e2522a" stroke="#8a1f14" stroke-width="1.2"/><ellipse cx="${CH.x - 6}" cy="${-CH.z + 2}" rx="${CH.rx * 0.55}" ry="${CH.rz * 0.45}" fill="#f6a531"/>`;
      const ventPts = (z0, z1, half) => { const L = Array.from({ length: 15 }, (_, i) => { const z = z0 + ((z1 - z0) * i) / 14; return [Math.sin(z / 17) * 2.5 - half, -z]; }); return [...L, ...L.map(([x, z]) => [x + 2 * half, z]).reverse()]; };
      const sideVent = (f) => { const a = [CH.x + 22, CH.z + 8], b = [rOf(36) - 1, 36], pts = Array.from({ length: 11 }, (_, i) => { const u = i / 10; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + Math.sin(u * 3) * 4]; }); const up = pts.map(([x, z]) => [x - 2, -(z + 2)]), dn = pts.map(([x, z]) => [x + 2, -(z - 2)]).reverse(); return `<path d="${K.pathOf([...up, ...dn], true)}" fill="${f ? "#e2522a" : "#5a463a"}" stroke="#5e2a14" stroke-width=".8" stroke-linejoin="round"/>`; };
      g.innerHTML = `<g transform="${K.translateAlong(P, [0, 0, -H0])}">${ISO.baseboard(P, { x: -BX - 8, y: -BD - 8, w: BX * 2 + 16, d: BD + 16, r: 5 }, { h: 6, tint: ISO.T.wood })}</g><g data-name="layers">${block}<path d="${sideStrata}" fill="none" stroke="#8a6d48" stroke-width=".7"/>${coneSvg(P)}</g><g data-part="flow" data-name="flow"></g>` +
        `<g transform="${fm}"><g data-name="layers">${rock}${cone}</g><g data-name="chamber">${chamber}</g><g data-part="vent" data-name="vent"></g><g data-part="sidevent" data-name="sidevent"></g></g><g data-part="puffs"></g><g data-part="words"></g>`;
      const el = LAB.parts(g), wr = ISO.writer();
      const fx = ISO.puffsFx(g, P, W, H, el.puffs, 12, 0);
      const st = { e: ISO.clamp(ISO.num(o, "erupt", 0), 0, 1) }, want = { e: st.e };
      let lit = o.lit || "", clock = 0;
      // the main vent: empty dark rock above the magma, magma up to a level that rises with erupt
      const ventSvg = (e) => {
        const top = HC - 7, lvl = CH.z + CH.rz - 2 + (top - (CH.z + CH.rz - 2)) * ISO.clamp(e / 0.6, 0, 1);
        return `<path d="${K.pathOf(ventPts(CH.z + CH.rz - 4, top, 5), true)}" fill="#5a463a" stroke="#5e2a14" stroke-width=".9" stroke-linejoin="round"/>` +
          (e > 0.01 ? `<path d="${K.pathOf(ventPts(CH.z + CH.rz - 4, lvl, 4.2), true)}" fill="#e2522a" stroke="none"/><path d="${K.pathOf(ventPts(CH.z + CH.rz - 4, lvl, 1.4), true)}" fill="#f8b13a" stroke="none"/>` : "") +
          (e > 0.6 ? `<ellipse cx="0" cy="${-top}" rx="${(rc - 3) * ISO.smooth(0.6, 0.75, e)}" ry="2.4" fill="#f06a2a" stroke="#8a1f14" stroke-width=".7"/>` : "");
      };
      // lava running down the back flanks from the crater rim: on the cone's surface, as far as erupt has let it run
      const flowSvg = (e) => {
        const L = ISO.smooth(0.6, 1, e);
        if (L <= 0) return "";
        return [[-0.42, 0.13, 0.95], [-1.05, 0.11, 0.72]].map(([tc, wd, reach]) => {
          const zEnd = HC - L * reach * HC, n = 14, pt = (z, s) => { const r = rOf(z) + 0.3, tt = tc + s * wd * (0.45 + 0.55 * (HC - z) / HC) * (1 + 0.25 * Math.sin(z / 9 + tc)); return K.iso([r * Math.cos(tt), r * Math.sin(tt), z], P); };
          const zs = Array.from({ length: n + 1 }, (_, i) => HC - 1 - ((HC - 1 - zEnd) * i) / n);
          const body = [...zs.map((z) => pt(z, -1)), ...zs.slice().reverse().map((z) => pt(z, 1))], core = [...zs.map((z) => pt(z, -0.35)), ...zs.slice().reverse().map((z) => pt(z, 0.35))];
          return `<path d="${K.pathOf(body, true)}" fill="#e8541e" stroke="#8a1f14" stroke-width=".8" stroke-linejoin="round"/><path d="${K.pathOf(core, true)}" fill="#ffc94a" stroke="none"/>`;
        }).join("");
      };
      // ash and gas: puffs rising from the vent, drifting with the wind; their number and size grow with erupt
      const puffs = (e, tm) => {
        if (e < 0.35) return [];
        const amt = ISO.smooth(0.35, 0.9, e);
        return Array.from({ length: 12 }, (_, i) => {
          const f = (tm * 0.11 + i / 12) % 1, z = HC + 6 + f * 118 * amt, r = (7 + f * 30) * (0.5 + 0.5 * amt);
          return [f * 38 + Math.sin(i * 2.1 + tm * 0.4) * 6, -f * 10, z, r, amt * 0.85 * Math.min(1, f * 6) * (1 - f) ** 0.7];
        });
      };
      const draw = () => {
        const e = Math.round(st.e * 100) / 100;
        wr.rebuild(el.vent, String(e), () => ventSvg(e));
        wr.rebuild(el.sidevent, String(e > 0.45), () => sideVent(e > 0.45));
        wr.rebuild(el.flow, String(e), () => flowSvg(e));
        const ps = puffs(st.e, clock);
        if (fx) fx(ps);
        else { const tq = Math.round(clock * 12) / 12; wr.rebuild(el.puffs, `${e}|${tq}`, () => ps.filter((p) => p[4] > 0.02).sort((a, b) => a[2] - b[2]).map(([x, y, z, r, a]) => { const c = K.iso([x, y, z], P); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${(r * K.cameraOf(P).k * 0.8).toFixed(1)}" fill="#c3c7cc" fill-opacity="${(a * 0.8).toFixed(2)}" stroke="#7a808c" stroke-opacity="${(a * 0.6).toFixed(2)}" stroke-width=".8"/>`; }).join("")); }
        if (lab) wr.rebuild(el.words, String(e > 0.6), () => {
          const at = (x, z) => K.iso([x, 0, z], P);
          return ISO.word(at(CH.x, CH.z - CH.rz - 9), "magma chamber", "#8a1f14", { size: 13 }) + ISO.word(at(-8, 8), "main vent", "#5e2a14", { size: 13, anchor: "end" }) +
            ISO.word(at(rOf(36) + 6, 36), "side vent", "#5e2a14", { size: 12, anchor: "start" }) + ISO.word(at(-rOf(40) + 26, 34), "ash and lava layers", "#4a3a30", { size: 12, anchor: "start" }) +
            `<g data-name="crater">${ISO.word(at(-24, HC + 6), "crater", "#4a3a30", { size: 13, anchor: "end" })}</g>` + (e > 0.6 ? ISO.word(K.iso([rOf(60) * Math.cos(-0.42), rOf(60) * Math.sin(-0.42), 60], P), "lava flow", "#a8381a", { size: 13, anchor: "start", dy: -6 }) : "");
        });
        LAB.light(wr, g, lit);
      };
      g.set = (p) => {
        if (p.erupt !== undefined) want.e = ISO.clamp(+p.erupt, 0, 1);
        if (p.lit !== undefined) lit = p.lit;
      };
      g.update = (dt, c) => {
        clock = ISO.still() ? 3 : c || clock + dt;
        st.e = ISO.follow(st.e, want.e, dt, 1.3, ISO.still());
        if (Math.abs(st.e - want.e) < 0.003) st.e = want.e;
        draw();
        return st.e !== want.e;
      };
      g.readout = () => st.e < 0.05 ? "quiet: magma waits in the chamber a few km down, lighter than the rock round it" : st.e < 0.6 ? `magma rising up the main vent · ${Math.round((st.e / 0.6) * 100)}% of the way to the crater · gas bubbling out of it pushes it up` : "erupting: lava about 1,000–1,200 °C spills from the crater and runs down the flanks · ash and gas pour out of the vent";
      draw();
      LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
