// "evcharge cx cy width plug=0|1 soc=0-100 to=0-100 lab=1 lit=post|cable|port|battery|car" — an electric car charging.
// A small electric car in a parking bay beside a 50 kW DC charging post. The post turns the grid's AC into DC (its
// screen shows the power and the charge), its cable runs to the car's charge port behind the open flap, and the
// current goes into the 60 kWh battery pack under the car's floor, seen along the sill as a row of modules that
// fill up. plug=1 plugs in and charging starts: full 50 kW up to 80 %, then the post tapers the current off to save
// the battery. About 6 km of range per kWh. set({ plug, soc, to, lit }). World units: 1 = 10 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s), D = (p, s) => K.dotsSvg(p, s);
  const yAx = (o) => G.frameOf(o, [0, 1, 0], [1, 0, 0], [0, 0, 1]), zAx = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const BAY = { x: -46, y: -16, w: 82, d: 34, r: 2 }, HW = 8.6, WR = 3.2, WX = [-13, 14], PORT = [-18.6, HW + 0.05, 10.2];
  const POST = { x0: -40, x1: -33, y0: 4, y1: 10, h: 19 }, HOLD = [-33, 8, 11];
  const PAINT = ISO.tint("#e9f1fa", ["#93abc8", "#a5bad3", "#b8c9de", "#cad8e8"], "#2c4a6e");
  const kwOf = (soc) => (soc < 80 ? 50 : Math.max(8, 50 - (soc - 80) * 2.1));
  // the car's side outline (x along the car, z up): kept convex, the wheel arches are painted on the side
  const BODY = [[22, 4.4], [22, 8], [20.6, 10], [11, 11.2], [7.6, 14.8], [-6, 15.2], [-10.6, 11.6], [-20.4, 11], [-22, 9.4], [-22, 4.4]];
  const archPts = (cx) => { const out = [[cx + 4.2, 4.4]]; for (let i = 0; i <= 12; i++) { const a = (i / 12) * Math.PI; out.push([cx + 4.2 * Math.cos(a), 3.4 + 4.2 * Math.sin(a)]); } return [...out, [cx - 4.2, 4.4]]; };

  function baySvg(P) {
    const out = [ISO.tinted(ISO.T.road, S(K.slabOf(BAY, -1.2, 1.2, P, 4), { tone: "lo", halo: true }))];
    // the bay's white lines, painted edge to edge of the bay's front strip
    for (const y of [-14, 14]) out.push(`<path d="${K.pathOf([[-28, y - 0.3], [34, y - 0.3], [34, y + 0.3], [-28, y + 0.3]].map(([x, yy]) => K.iso([x, yy, 0.02], P)), true)}" fill="#fbfbf8" stroke="#c9c9c6" stroke-width=".3"/>`);
    // the kerb and island the post stands on
    out.push(ISO.tinted(ISO.T.road, ISO.wbox(P, [-45, -29], [-15, 17], [0, 1.4], "mid")));
    return out.join("");
  }
  function postSvg(P, kw, soc, charging) {
    const p = POST, out = [ISO.tinted(ISO.T.plastic, ISO.wbox(P, [p.x0 - 0.6, p.x1 + 0.6], [p.y0 - 0.6, p.y1 + 0.6], [1.4, 2.4], "mid"))];
    out.push(ISO.tinted(ISO.T.green, ISO.wbox(P, [p.x0, p.x1], [p.y0, p.y1], [2.4, p.h], "mid")));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [p.x0 - 0.4, p.x1 + 0.4], [p.y0 - 0.4, p.y1 + 0.4], [p.h, p.h + 0.8], "mid")));
    // the screen on the front face, the holster on the side facing the car
    const face = (pts, fill, ink) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, p.y1 + 0.03, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width=".5"/>`;
    out.push(face([[p.x0 + 1, 12.4], [p.x1 - 1, 12.4], [p.x1 - 1, 17.2], [p.x0 + 1, 17.2]], "#c9dcc0", "#223"));
    const sx = K.iso([1, p.y1, 15], P)[0] > K.iso([0, p.y1, 15], P)[0] ? 1 : -1;
    const txt = (z, str, size) => `<g transform="${ISO.faceMatrix(P, [(p.x0 + p.x1) / 2, p.y1 + 0.05, z], 1).replace(/matrix\(([^ ]+) ([^ ]+)/, (m, a, b) => `matrix(${a * sx} ${b * sx}`)}"><text font-size="${size}" font-weight="700" fill="#1d2a1a" text-anchor="middle" font-family="Helvetica Neue,Arial">${str}</text></g>`;
    out.push(txt(15.1, charging ? `${Math.round(kw)} kW` : "50 kW DC", 1.5), txt(13.2, `${Math.round(soc)} %`, 1.4));
    out.push(ISO.tinted(ISO.T.plastic, ISO.wbox(P, [p.x1, p.x1 + 1], [6.6, 9.4], [9.4, 12], "mid")));
    return out.join("");
  }
  function carSvg(P) {
    const out = [];
    // the far wheels, then the battery pack under the floor, the body, the near wheels
    for (const x of WX) out.push(wheel(P, x, -HW + 1.2));
    // the pack hangs from the floor pan (a prism audit.mjs doesn't record, so it reads the pack as loose)
    out.push(`<g data-name="battery">${ISO.tinted(ISO.T.plastic, ISO.wbox(P, [-9, 10], [-7.2, 7.2], [2.6, 4.4], "mid"))}</g>`);
    out.push(`<g data-name="car">${ISO.prismY(P, BODY, -HW, HW, ["#93abc8", "#e9f1fa"], "#dfe9f4", "#2c4a6e")}`);
    // windows, door shut lines, handle, lamps on the near side
    const face = (pts, fill, ink, w = 0.6) => `<path d="${K.pathOf(pts.map(([x, z]) => K.iso([x, HW + 0.03, z], P)), true)}" fill="${fill}" stroke="${ink}" stroke-width="${w}"/>`;
    out.push(face([[-10, 11.6], [-6, 14.6], [-1.8, 14.7], [-1.8, 11.6]], "#bcd0e0", "#2c4a6e"), face([[-1, 11.6], [-1, 14.7], [7.2, 14.6], [10.2, 11.4]], "#bcd0e0", "#2c4a6e"));
    out.push(`<path d="${K.pathOf([[-1.4, 4.6], [-1.4, 11.6]].map(([x, z]) => K.iso([x, HW + 0.03, z], P)))}${K.pathOf([[9.6, 4.6], [10.6, 11.2]].map(([x, z]) => K.iso([x, HW + 0.03, z], P)))}${K.pathOf([[-11, 4.6], [-10.4, 11.4]].map(([x, z]) => K.iso([x, HW + 0.03, z], P)))}" stroke="#5d7a9c" stroke-width=".6"/>`);
    for (const x of WX) out.push(face(archPts(x), "#2a2d31", "#2c4a6e"));
    out.push(face([[3, 9.6], [6, 9.6], [6, 10.1], [3, 10.1]], "#7d93ad", "#2c4a6e", 0.4), face([[19.6, 8.4], [21.8, 8.4], [21.4, 9.4], [19.6, 9.6]], "#fff3c4", "#8a6a10", 0.4), face([[-21.8, 8.6], [-20, 8.6], [-20, 9.8], [-21.4, 9.8]], "#f3a19a", "#7a1f1f", 0.4), "</g>");
    for (const x of WX) out.push(wheel(P, x, HW - 1.2));
    return out.join("");
  }
  function wheel(P, x, y) {
    const F = yAx([x, y - 1.1, 3.4]);
    return ISO.tinted(ISO.T.rubber, S(G.lathe([[0, 0], [0, 3], [0.3, 3.3, 1], [1.9, 3.3, 1], [2.2, 3], [2.2, 0]], F, P, { steps: 32 }), { tone: "lo" })) +
      ISO.tinted(ISO.T.steel, S(G.disc(y > 0 ? 2.2 : -0.02, y > 0 ? 2.3 : 0, 2.1, F, P, { steps: 28 }), { tone: "mid" }));
  }
  // the pack seen through a cut in the near sill: eight modules, filled green to the charge
  function cellsSvg(P, soc) {
    const cut = `<path d="${K.pathOf([[-9, 4.6], [9.6, 4.6], [9.6, 7.4], [-9, 7.4]].map(([x, z]) => K.iso([x, HW + 0.04, z], P)), true)}" fill="#e4e7ea" stroke="#2c4a6e" stroke-width=".7"/>`;
    const out = [cut], n = 8, w = 18.2 / n;
    for (let i = 0; i < n; i++) {
      const x0 = -8.7 + i * w + 0.2, x1 = x0 + w - 0.4, fill = ISO.clamp(soc / 100 * n - i, 0, 1);
      const face = (z1, c) => `<path d="${K.pathOf([[x0, 4.9], [x1, 4.9], [x1, z1], [x0, z1]].map(([x, z]) => K.iso([x, HW + 0.06, z], P)), true)}" fill="${c}" stroke="#1a3a14" stroke-width=".3"/>`;
      out.push(face(7.1, "#3a3e44"));
      if (fill > 0.02) out.push(face(4.9 + 2.2 * fill, soc < 20 ? "#e0784a" : "#5fae3a"));
    }
    return out.join("");
  }
  // the port: flap swung open on its hinge, the socket inside it
  function portSvg(P, open) {
    const F = yAx(PORT), a = open * 1.6, at = (u, w, v) => [PORT[0] - 1.6 + u * Math.cos(a), PORT[1] + u * Math.sin(a) + w, PORT[2] + v];
    return (open > 0.05 ? `<path d="${G.circleOf(F, 0.02, 1.1, P, 24)}" fill="#26292e" stroke="#0d0e10" stroke-width=".5"/>` : "") + ISO.tinted(PAINT, ISO.box(at, P, [0, 3.2], [0, 0.2], [-1.4, 1.4], "mid"));
  }
  // the cable: from the post's side, sagging to the gun in the port (p = 1) or in its holster (p = 0)
  function cableSvg(P, p, k, flow, t) {
    const a = [POST.x1, 7.2, 6], tip = G.lerp3([HOLD[0] + 1.6, HOLD[1], HOLD[2] - 0.5], [PORT[0], PORT[1] + 2.6, PORT[2]], ISO.ease(p)), pts = [];
    const c1 = [a[0] + 2, a[1] + 3, 1.6], c2 = [tip[0] - 2 + 2 * p, tip[1] + 1, tip[2] - 5 + 2 * p];
    for (let i = 0; i <= 24; i++) { const u = i / 24, v = 1 - u; pts.push([0, 1, 2].map((j) => v * v * v * a[j] + 3 * v * v * u * c1[j] + 3 * v * u * u * c2[j] + u * u * u * tip[j])); }
    const d = K.pathOf(pts.map((q) => K.iso(q, P)));
    const dir = p > 0.5 ? [0, -1, 0] : [1, 0, 0], gun = G.frameAlong(tip, dir);
    return `<path d="${d}" fill="none" stroke="#0d0e10" stroke-width="${(1.1 * k).toFixed(1)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#3a3e44" stroke-width="${(0.75 * k).toFixed(1)}" stroke-linecap="round"/>` +
      (flow ? `<path d="${d}" fill="none" stroke="#ffd36b" stroke-width="${(0.3 * k).toFixed(1)}" stroke-dasharray="${(0.8 * k).toFixed(1)} ${(2.4 * k).toFixed(1)}" stroke-dashoffset="${(-t * 6 * k).toFixed(1)}" stroke-linecap="round"/>` : "") +
      ISO.tinted(ISO.T.plastic, S(G.solidOf([[-1.6, 1], [0.4, 1.3, 1], [2.4, 1.2]], gun, P, { steps: 16 }), { tone: "mid" }));
  }

  ISO.add({
    name: "evcharge", title: "Electric car charging", compare: "evcharge 480 270 520",
    about: "An electric car at a 50 kW charging post: the cable carries DC into the battery pack under the floor, full speed to 80 %, then slower to protect the battery.",
    line: "evcharge cx cy width plug=0|1 soc=0-100 to=0-100 lab=1 lit=post|cable|port|battery|car",
    demo: { line: "evcharge 480 270 520 plug=0 soc=20 to=95", script: [{ set: {}, hold: 1.2 }, { set: { plug: 1 }, hold: "settle" }] },
    make([cx, cy, size = 520], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.12, H = size * 0.72;
      const { P, g } = ISO.frame([...K.boxCorners(BAY, -1.2, 0), [0, 0, 16], [POST.x0, POST.y0, POST.h + 1], [22, HW, 4]], cx, cy, W, H, { azimuth: 56, elevation: 22 }, parent);
      const k = K.cameraOf(P).k;
      g.innerHTML = `<g>${baySvg(P)}</g><g data-name="post"></g><g>${carSvg(P)}</g><g data-part="cells"></g><g data-name="port"></g><g data-name="cable"></g><path data-part="flow" fill="none" stroke="#ffd36b" stroke-linecap="round"/><g data-part="words"></g>`;
      const q = (n) => g.querySelector(`[data-name="${n}"],[data-part="${n}"]`), el = { post: q("post"), cells: q("cells"), port: q("port"), cable: q("cable"), flow: q("flow"), words: q("words") }, w = ISO.writer();
      const plug0 = o.plug === "1" ? 1 : 0;
      const s = { p: plug0, want: plug0, soc: ISO.clamp(ISO.num(o, "soc", 20), 0, 100), to: ISO.clamp(ISO.num(o, "to", 80), 0, 100), t: 0, start: ISO.clamp(ISO.num(o, "soc", 20), 0, 100) };
      let lit = o.lit || "";
      const charging = () => s.p === 1 && s.soc < s.to - 0.01;
      const draw = () => {
        const sq = Math.round(s.soc), on = charging(), kw = on ? kwOf(s.soc) : 0;
        w.rebuild(el.post, `${sq} ${Math.round(kw)} ${on}`, () => postSvg(P, kw, s.soc, on));
        w.rebuild(el.cells, String(Math.round(s.soc * 2) / 2), () => cellsSvg(P, s.soc));
        w.rebuild(el.port, (Math.round(Math.min(1, s.p * 3) * 30) / 30).toFixed(2), () => portSvg(P, Math.min(1, s.p * 3)));
        w.rebuild(el.cable, (Math.round(s.p * 200) / 200).toFixed(3), () => cableSvg(P, s.p, k, false, 0));
        if (on && el.flow.getAttribute("d") !== el.cable._d) { el.cable._d = el.cable.querySelector("path").getAttribute("d"); w.attr(el.flow, "d", el.cable._d); w.attr(el.flow, "stroke-width", (0.3 * k).toFixed(1)); w.attr(el.flow, "stroke-dasharray", `${(0.8 * k).toFixed(1)} ${(2.4 * k).toFixed(1)}`); }
        w.shown(el.flow, on); if (on) w.attr(el.flow, "stroke-dashoffset", (-s.t * 6 * k).toFixed(1));
        w.rebuild(el.words, lab ? `${sq} ${on} ${s.p > 0.5}` : "", () => !lab ? "" : [
          ISO.word(K.iso([POST.x0, POST.y1, POST.h + 1], P), "charging post: AC in, DC out", "#2c6a22", { size: 13, anchor: "end", dy: -6 }),
          ISO.word(K.iso([0, 7.2, 2], P), `battery pack under the floor · ${sq} %`, sq < 20 ? "#b5541a" : "#2c6a22", { size: 13, dy: 22 }),
          ISO.word(K.iso([PORT[0], HW, PORT[2] + 2], P), s.p > 0.5 ? "plug in the charge port" : "charge port", "#444", { size: 13, anchor: "start", dy: -12 }).replace('x="', 'dx="6" x="'),
          ...(on ? [ISO.word(K.iso([12, HW, 16], P), `${Math.round(kw)} kW in`, "#a3271b", { size: 14, anchor: "start" })] : [])].join(""));
        w.light(["post", "cable", "port", "battery", "car"].map(q), [q(lit)].filter(Boolean));
      };
      g.set = (p) => {
        if (p.plug !== undefined) { s.want = +p.plug ? 1 : 0; if (s.want) s.start = s.soc; }
        if (p.soc !== undefined) s.soc = s.start = ISO.clamp(+p.soc, 0, 100);
        if (p.to !== undefined) s.to = ISO.clamp(+p.to, 0, 100);
        if (p.lit !== undefined) lit = p.lit;
      };
      // a real charge takes half an hour; shown here about 200 times faster (1 % a second at 50 kW, less when it tapers)
      g.update = (dt) => {
        const calm = ISO.still();
        s.t += dt;
        s.p = ISO.follow(s.p, s.want, dt, 0.3, calm); if (Math.abs(s.p - s.want) < 0.003) s.p = s.want;
        if (charging()) s.soc = calm ? s.to : Math.min(s.to, s.soc + dt * kwOf(s.soc) * 0.16);
        draw();
        return s.p !== s.want || charging();
      };
      g.readout = () => {
        if (s.p < 1) return `${Math.round(s.soc)} % of a 60 kWh battery · ${s.want ? "plugging in…" : "not plugged in"}`;
        const added = ((s.soc - s.start) / 100) * 60;
        return charging() ? `charging at ${Math.round(kwOf(s.soc))} kW DC · ${Math.round(s.soc)} % · +${added.toFixed(1)} kWh ≈ +${Math.round(added * 6)} km of range · ${s.soc < 80 ? "full speed to 80 %" : "slowing down above 80 % to protect the cells"}`
          : `stopped at ${Math.round(s.soc)} % · +${added.toFixed(1)} kWh ≈ +${Math.round(added * 6)} km`;
      };
      draw();
      if (t) label(parent, cx, cy + H / 2 + 6, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
