// "podium cx cy width flags=0..1 lab=1 lit=first|second|third|flags |first, second, third" — a winners' podium.
// An architect's model on its base board: a carpeted stage, the three blocks (1st in the middle, 60 cm; 2nd on its left,
// 40 cm; 3rd on its right, 25 cm), each with a recessed kick plinth, a carpet cap and its number and medal colour on the
// front, a step up to the top block, and behind them a backdrop wall with three flagpoles. The names from the text stand
// on the blocks. set({ flags: 1 }) runs the flags up their halyards as the anthem plays: the winner's flag in the middle
// goes highest, as at the Olympics. World units: 1 = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const BOARD = { x: -230, y: -110, w: 460, d: 210, r: 10 };
  const STAGE = { x: -200, y: -90, w: 400, d: 170, r: 4 }, SH = 12;
  // blocks: [place, x0, x1, height, medal colour, word colour]
  const BLOCKS = [
    { k: "second", n: 2, x0: -165, x1: -55, h: 40, medal: "#c9ced4", ink: "#4a5058" },
    { k: "first", n: 1, x0: -55, x1: 55, h: 60, medal: "#f2c94c", ink: "#7a5a0a" },
    { k: "third", n: 3, x0: 55, x1: 165, h: 25, medal: "#d39a62", ink: "#6e3a1c" },
  ];
  const Y0 = -40, Y1 = 40;
  const POLES = [{ x: -110, top: 215 }, { x: 0, top: 245 }, { x: 110, top: 195 }];   // where each flag's top edge stops
  const PH = 270, PY = -70, FW = 54, FH = 36;
  const CARPET = ISO.tint("#e9eef6", ["#9aa9c2", "#aebbd0", "#c1ccdd", "#d1daea"], "#33435e");
  const WALL = ISO.T.paint, STEEL = ISO.T.steel, WOOD = ISO.T.wood;
  const FLAGS = [["#2f6fd0", "#fdfdfb"], ["#c8352a", "#fdfdfb"], ["#2c8a4a", "#fdfdfb"]];

  function staticSvg(P) {
    const out = [ISO.baseboard(P, BOARD, { h: 7 })];
    // the stage: a carpeted platform with a nosing strip along its front
    out.push(ISO.tinted(CARPET, S(K.slabOf(STAGE, 0, SH, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(STAGE, SH - 3, P, 4), { tone: "faint" }) })));
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [STAGE.x + 4, STAGE.x + STAGE.w - 4], [STAGE.y + STAGE.d, STAGE.y + STAGE.d + 1], [SH - 3.4, SH - 1], "mid")));
    // the backdrop wall: a panel on two feet, with a top rail
    out.push(ISO.tinted(WALL, ISO.wbox(P, [-190, 190], [-88, -80], [SH, SH + 150], "mid")));
    out.push(ISO.tinted(WALL, ISO.wbox(P, [-194, 194], [-90, -78], [SH + 150, SH + 156], "mid")));
    // panel joints: a dado line and the vertical joints of the five panels, each ending on the wall's edges
    const seams = [K.pathOf([K.iso([-190, -79.95, SH + 20], P), K.iso([190, -79.95, SH + 20], P)])];
    for (let x = -114; x < 190; x += 76) seams.push(K.pathOf([K.iso([x, -79.95, SH], P), K.iso([x, -79.95, SH + 150], P)]));
    out.push(L(seams.join(""), { tone: "faint" }));
    return out.join("");
  }
  // the three poles stand on round bases in front of the wall; each has a ball on top and a cleat for its halyard
  function poleSvg(P, x) {
    const out = [];
    out.push(ISO.tinted(STEEL, S(K.cylinder(x, PY, 9, SH, 3, P, 28, 0.6), { tone: "mid" })));
    out.push(ISO.tinted(STEEL, S(K.cylinder(x, PY, 2, SH + 3, PH, P, 18), { tone: "hi" })));
    out.push(ISO.tinted(ISO.T.brass, S(K.cylinder(x, PY, 3.4, SH + 3 + PH, 5, P, 20, 1.6), { tone: "mid" })));
    out.push(ISO.tinted(STEEL, ISO.wbox(P, [x + 2, x + 4.5], [PY - 1, PY + 1], [SH + 40, SH + 48], "mid")));
    return out.join("");
  }
  // a flag hoisted to height z (its top edge) on pole x: the halyard runs from the cleat up to the truck, the flag on it
  function flagSvg(P, x, z, [a, b], wave) {
    const k = K.cameraOf(P).k, top = SH + 3 + PH;
    const out = [`<path d="${K.pathOf([K.iso([x + 2.6, PY, SH + 46], P), K.iso([x + 2.6, PY, top], P)])}" fill="none" stroke="#6b7078" stroke-width="${(0.35 * k).toFixed(2)}"/>`];
    const pts = [], n = 8;
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x + 2.6 + u * FW, PY + Math.sin(u * 3 + wave) * 3 * u, z]); }
    for (let i = n; i >= 0; i--) { const u = i / n; pts.push([x + 2.6 + u * FW, PY + Math.sin(u * 3 + wave) * 3 * u, z - FH]); }
    out.push(`<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" fill="${a}" stroke="#2a2d31" stroke-width=".7" stroke-linejoin="round"/>`);
    // a white band across the middle third
    const band = [];
    for (let i = 0; i <= n; i++) { const u = i / n; band.push([x + 2.6 + u * FW, PY + Math.sin(u * 3 + wave) * 3 * u, z - FH / 3]); }
    for (let i = n; i >= 0; i--) { const u = i / n; band.push([x + 2.6 + u * FW, PY + Math.sin(u * 3 + wave) * 3 * u, z - (2 * FH) / 3]); }
    out.push(`<path d="${K.pathOf(band.map((p) => K.iso(p, P)), true)}" fill="${b}" stroke="#2a2d31" stroke-width=".5"/>`);
    return out.join("");
  }
  // a block: kick plinth, body, carpet cap, the number and medal on its front, and (for 1st) a step in front
  function blockSvg(P, b) {
    const out = [], z0 = SH;
    out.push(ISO.wbox(P, [b.x0 + 3, b.x1 - 3], [Y0 + 3, Y1 - 3], [z0, z0 + 5], "lo"));
    out.push(ISO.tinted(WOOD, ISO.wbox(P, [b.x0, b.x1], [Y0, Y1], [z0 + 5, z0 + b.h - 3], "mid")));
    out.push(ISO.tinted(CARPET, ISO.wbox(P, [b.x0 - (b.n === 3 ? 0 : 1.2), b.x1 + (b.n === 2 ? 0 : 1.2)], [Y0 - 1.2, Y1 + 1.2], [z0 + b.h - 3, z0 + b.h], "hi")));
    // a seam round the body under the cap: front and right faces, ends on the body's corners
    out.push(L(K.pathOf([K.iso([b.x0, Y1 + 0.05, z0 + b.h - 9], P), K.iso([b.x1, Y1 + 0.05, z0 + b.h - 9], P), K.iso([b.x1 + 0.05, Y0, z0 + b.h - 9], P)]), { tone: "faint" }));
    const mid = (b.x0 + b.x1) / 2, cz = z0 + 5 + (b.h - 8) / 2, r = Math.min(13, (b.h - 10) / 2);
    out.push(`<g transform="${ISO.faceMatrix(P, [mid, Y1 + 0.1, cz], 1)}"><circle cx="0" cy="0" r="${r.toFixed(1)}" fill="${b.medal}" stroke="${b.ink}" stroke-width="1"/><circle cx="0" cy="0" r="${(r - 2).toFixed(1)}" fill="none" stroke="${b.ink}" stroke-width=".5"/>` +
      `<text x="0" y="${(r * 0.42).toFixed(1)}" text-anchor="middle" fill="${b.ink}" style="font:800 ${(r * 1.25).toFixed(1)}px 'Helvetica Neue',Arial,sans-serif">${b.n}</text></g>`);
    return `<g data-name="${b.k}">${out.join("")}</g>`;
  }
  function stepSvg(P) {
    return ISO.tinted(WOOD, ISO.wbox(P, [-30, 30], [Y1, Y1 + 18], [SH, SH + 8], "mid")) + ISO.tinted(CARPET, ISO.wbox(P, [-31, 31], [Y1, Y1 + 19], [SH + 8, SH + 10], "hi"));
  }

  ISO.add({
    name: "podium", title: "Winners' podium", compare: "podium 480 280 460 | Asha, Omar, Lina",
    about: "A model of a winners' podium on its stage: 1st in the middle and highest, 2nd on the left, 3rd on the right, and the three flags rising behind them.",
    line: "podium cx cy width flags=0..1 lab=1 lit=first|second|third|flags |first, second, third",
    demo: { line: "podium 480 285 460 | Asha, Omar, Lina", script: [{ set: {}, hold: 1 }, { set: { flags: 1 }, hold: "settle" }, { set: {}, hold: 1.5 }] },
    make([cx, cy, size = 460], o, txt, parent) {
      const lab = o.lab !== "0", W = size * 1.3, H = size * 0.95;
      const names = (txt || "").split(",").map((s) => s.trim()).filter(Boolean);
      const { P, g } = ISO.frame([...K.boxCorners(BOARD, -11, 0), [0, PY, SH + PH + 10], [200, 80, 0]], cx, cy, W, H, { azimuth: 66, elevation: 20 }, parent);
      // far to near: wall, poles and flags, then the blocks (2nd and 1st and 3rd stand side by side; 3rd's right face is seen)
      g.innerHTML = `<g>${staticSvg(P)}</g><g data-name="poles">${POLES.map((p) => poleSvg(P, p.x)).join("")}</g><g data-name="flags"></g>` +
        `<g>${BLOCKS.map((b) => blockSvg(P, b)).join("")}${stepSvg(P)}</g><g data-part="words"></g>`;
      const el = { flags: g.querySelector('[data-name="flags"]'), words: g.querySelector('[data-part="words"]'), poles: g.querySelector('[data-name="poles"]') };
      BLOCKS.forEach((b) => (el[b.k] = g.querySelector(`[data-name="${b.k}"]`)));
      const w = ISO.writer(), low = SH + 46 + FH;
      const s = { f: ISO.clamp(ISO.num(o, "flags", 0), 0, 1), want: 0, t: 0 };
      s.want = s.f;
      let lit = o.lit || "";
      const draw = () => {
        const wave = s.f > 0 && s.f < 1 ? Math.round(s.t * 10) / 10 : 0;
        w.rebuild(el.flags, `${s.f.toFixed(3)} ${wave}`, () => POLES.map((p, i) => flagSvg(P, p.x, low + (p.top - low) * s.f, FLAGS[[1, 0, 2][i]], wave)).join(""));
        w.rebuild(el.words, lab ? String(s.f > 0.98) : "", () => !lab ? "" : BLOCKS.map((b, i) => {
          const who = names[[1, 0, 2][i]], mid = (b.x0 + b.x1) / 2;
          return (who ? ISO.word(K.iso([mid, 0, SH + b.h], P), who, "#1f4f8f", { size: 18, dy: -10 }) : "") +
            ISO.word(K.iso([mid, Y1 + 10, SH], P), ["2nd: silver", "1st: gold", "3rd: bronze"][i], b.ink, { size: 12, dy: 30 });
        }).join(""));
        const groups = { first: [el.first], second: [el.second], third: [el.third], flags: [el.flags, el.poles] };
        w.light(Object.values(groups).flat(), groups[lit || (s.f > 0.02 && s.f < 0.98 ? "flags" : "")] || []);
      };
      g.set = (p) => { if (p.flags !== undefined) s.want = ISO.clamp(+p.flags, 0, 1); if (p.lit !== undefined) lit = p.lit; };
      // the flags rise at a steady hoisting speed, as if pulled hand over hand through the anthem
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        s.f = calm ? s.want : Math.abs(s.want - s.f) <= dt * 0.28 ? s.want : s.f + Math.sign(s.want - s.f) * dt * 0.28;
        draw();
        return s.f !== s.want;
      };
      g.readout = () => s.f <= 0 ? "blocks 60 cm (1st), 40 cm (2nd), 25 cm (3rd) · 1st stands in the middle, 2nd on its right hand, 3rd on its left"
        : s.f < 1 ? `flags rising · ${Math.round(s.f * 100)}% · the anthem of the winner plays (about 60–90 s)` : "flags up · the winner's flag in the middle flies highest";
      draw();
      if (txt && !names.length) label(parent, cx, cy - H / 2 - 8, txt, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
