// "microwave cx cy width secs=30 lab=1" — a countertop microwave oven, built from its real parts.
// Four feet under a base pan; the outer wrap (top and sides) with vent slots; inside, the enamelled cavity with the
// cavity lamp, the drive coupler, the roller ring and the glass turntable carrying a bowl of soup. The door hangs on two
// hinge knuckles at the left: a black frame round a recessed window whose metal mesh (holes ~1 mm, far smaller than the
// 12 cm wavelength) keeps the waves in while light gets out. The control panel at the right has the display, a
// 12-key keypad, start and stop, and the door-release button. set({ start: 1 }) runs it for `secs`: the lamp lights the
// cavity, the turntable turns (the roller ring at half its speed), the soup steams, the display counts down.
// 1 unit = 1 cm.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const X0 = -25, X1 = 25, BK = -18, FR = 16, DT = 3.5, H = 30, PX = 13;     // cabinet, door thickness, panel edge
  const CAV = { x0: -23.4, x1: 12, y0: -16.4, z0: 4, z1: 27 };
  const TT = [-9.5, 0], PLATE_R = 12, PLATE_Z = 5.8, ORBIT = 3.5, ROLL_R = 7;
  const WIN = { x0: -21, x1: 9, z0: 7.4, z1: 25.4, y: FR + 1.5 };              // the window: the recess goes 2 cm in
  const FACE = FR + DT;                                                           // front face of door and panel
  const zF = (o) => G.frameOf(o, [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const BOWL = [[0, 0], [0, 3.2], [0.8, 3.9, 1], [2.4, 5, 1], [4.6, 5.9], [4.6, 0]];
  let uid = 0;

  ISO.add({
    name: "microwave", title: "Microwave oven", compare: "microwave 480 270 360",
    about: "A microwave: the turntable turns the bowl through the waves so it heats evenly; the mesh in the door keeps the waves in; the timer counts down.",
    line: "microwave cx cy width secs=30 lab=1",
    demo: { line: "microwave 480 270 360", script: [{ set: { start: 1 }, hold: "settle" }] },
    make([cx, cy, size = 360], o, t, parent) {
      const lab = o.lab !== "0", W = size * 1.5, Hh = size * 1.05, id = `mw${uid++}`;
      const { P, g } = ISO.frame([[X0 - 2, BK, 0], [X1, BK, 0], [X0 - 2, FACE + 1, 0], [X1, FACE + 1, 0], [X0, BK, H], [X1, FACE, H], [X0, FACE, H]], cx, cy, W, Hh, { azimuth: 58, elevation: 20, pad: size * 0.12 }, parent);
      const box = (x, y, z, tone = "mid", tint = "", lit = false) => ISO.tinted(tint, ISO.wbox(P, x, y, z, tone, lit));
      const quad = (pts, attrs) => `<path d="${K.pathOf(pts.map((p) => K.iso(p, P)), true)}" ${attrs}/>`;
      const out = [];

      // ── base: halo, four feet, the base pan
      out.push(`<path class="iso-halo" d="${K.haloOf({ x: X0, y: BK, w: X1 - X0, d: FACE - BK, r: 2 }, 0, 3, P)}"/>`);
      const feet = [[X0 + 4, BK + 4], [X1 - 4, BK + 4], [X0 + 4, FR - 3], [X1 - 4, FR - 3]].sort((a, b) => K.depthOf([...a, 0], P) - K.depthOf([...b, 0], P));
      for (const [x, y] of feet) out.push(ISO.tinted(ISO.T.rubber, S(K.cylinder(x, y, 1.6, 0, 1.2, P, 20), { tone: "mid" })));
      out.push(box([X0, X1], [BK, FR], [1.2, 2.4], "lo"));
      // ── the back panel and the far (left) side of the wrap
      out.push(box([X0 + 0.6, X1 - 0.6], [BK, BK + 0.6], [2.4, H - 0.6], "lo"), box([X0, X0 + 0.6], [BK, FR], [2.4, H - 0.6], "mid"));
      // ── the cavity: floor, back wall, left wall, the lamp cover on the back wall (lit while running)
      const cav = [box([CAV.x0 - 1, PX - 1], [CAV.y0 - 1, FR], [2.4, CAV.z0], "mid"),
        box([CAV.x0 - 1, PX - 1], [CAV.y0 - 1, CAV.y0], [CAV.z0, CAV.z1], "mid"),
        box([CAV.x0 - 1, CAV.x0], [CAV.y0, FR], [CAV.z0, CAV.z1], "mid")];
      out.push(`<g data-part="cavity">${cav.join("")}<g data-part="lamp"></g></g>`);
      out.push(`<g data-part="ring"></g><g data-part="plate"></g><g data-part="bowl"></g>`);
      // ── partition to the control bay, cavity ceiling, then the wrap's top and near (right) side with its vents
      out.push(`<g data-part="top">${box([PX - 1, PX], [CAV.y0 - 1, FR], [2.4, CAV.z1 + 1], "mid")}${box([CAV.x0 - 1, PX - 1], [CAV.y0 - 1, FR], [CAV.z1, CAV.z1 + 1], "mid")}`);
      out.push(box([X0, X1], [BK, FR], [H - 0.6, H], "mid"), box([X1 - 0.6, X1], [BK, FR], [2.4, H - 0.6], "mid"));
      // vent slots: closed dark slots stamped in the near side (over the magnetron) and across the back of the top
      const slots = [];
      for (let i = 0; i < 9; i++) { const y = BK + 4 + i * 2.2; slots.push(quad([[X1 + 0.02, y, 14], [X1 + 0.02, y + 1, 14], [X1 + 0.02, y + 1, 26], [X1 + 0.02, y, 26]], `fill="#4a4f56" stroke="#2a2e33" stroke-width=".4"`)); }
      for (let i = 0; i < 12; i++) { const x = -14 + i * 2.4; slots.push(quad([[x, BK + 2, H + 0.02], [x + 1, BK + 2, H + 0.02], [x + 1, BK + 7, H + 0.02], [x, BK + 7, H + 0.02]], `fill="#4a4f56" stroke="#2a2e33" stroke-width=".4"`)); }
      out.push(slots.join(""), `</g>`);
      // ── the window: glass seen through the recess, lit from inside while running, and the mesh in front of it
      const winPts = [[WIN.x0, WIN.y, WIN.z0], [WIN.x1, WIN.y, WIN.z0], [WIN.x1, WIN.y, WIN.z1], [WIN.x0, WIN.y, WIN.z1]];
      const mesh = `<pattern id="${id}" width="0.9" height="0.9" patternUnits="userSpaceOnUse"><path d="M0 0H.9V.9H0ZM.45 .13A.32 .32 0 1 0 .4501 .13Z" fill="#12161a" fill-rule="evenodd"/></pattern>`;
      out.push(`<defs>${mesh}</defs><g data-part="glass">${quad(winPts, `fill="#2b333b" fill-opacity=".45"`)}</g>`);
      out.push(`<g transform="${ISO.faceMatrix(P, [WIN.x0, WIN.y, WIN.z1], 1)}"><rect width="${WIN.x1 - WIN.x0}" height="${WIN.z1 - WIN.z0}" fill="url(#${id})" opacity=".62"/></g>`);
      out.push(quad(winPts, `fill="none" stroke="#0d0e10" stroke-width=".8"`));
      // The steam is drawn over the mesh rather than under it: it stays inside the cavity's bounds, so the door bars
      // and the wrap still cover it everywhere but the window, and under a mesh that hides 60% of it it can't be seen.
      out.push(`<g data-part="steam"></g>`);
      // ── the door: four frame bars round the window (their inner faces are the recess), a grip in the right bar,
      // two hinge knuckles on the left edge
      const DOOR = ISO.T.plastic;
      out.push(box([X0, WIN.x0], [FR, FACE], [2.4, H], "hi", DOOR), box([WIN.x0, WIN.x1], [FR, FACE], [2.4, WIN.z0], "hi", DOOR),
        box([WIN.x0, WIN.x1], [FR, FACE], [WIN.z1, H], "hi", DOOR), box([WIN.x1, PX], [FR, FACE], [2.4, H], "hi", DOOR));
      out.push(box([WIN.x1 + 1.2, WIN.x1 + 2.6], [FACE, FACE + 0.8], [9, 23], "mid", DOOR));
      for (const z of [5, 23]) out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(X0 - 0.6, FR + DT / 2, 0.9, z, 3.4, P, 16), { tone: "mid" })));
      // ── the control panel: fascia, display, keypad 1–9, 0 and the two wide keys, start and stop, door release
      const PANEL = ISO.T.plastic;
      out.push(box([PX, X1], [FR, FACE], [2.4, H], "mid", PANEL));
      out.push(box([PX + 2, X1 - 2], [FACE, FACE + 0.3], [24, 27.6], "lo", ISO.tint("#16241c", ["#0c140f", "#101a14", "#132018", "#16241c"], "#050806")));
      out.push(`<g data-part="display"></g>`);
      const KEY = ISO.tint("#e9ebee", ["#a9adb3", "#b9bdc2", "#c9ccd0", "#d9dbde"], "#2a2e33");
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) out.push(box([PX + 2 + c * 2.8, PX + 4.2 + c * 2.8], [FACE, FACE + 0.5], [20.8 - r * 2.2, 22.4 - r * 2.2], "hi", KEY));
      out.push(box([PX + 2, PX + 5.6], [FACE, FACE + 0.6], [10.6, 12.4], "hi", ISO.T.red), box([PX + 6.4, X1 - 2], [FACE, FACE + 0.6], [10.6, 12.4], "hi", ISO.T.green));
      out.push(box([PX + 2, X1 - 2], [FACE, FACE + 0.9], [4.4, 8.6], "hi", KEY));
      // ── labels
      if (lab) {
        const w = (p, txt, anchor = "middle", dy = 0, dx = 0) => { const a = K.iso(p, P); return ISO.word([a[0] + dx, a[1]], txt, "#444", { anchor, size: 13, dy }); };
        out.push(`<g data-part="words">${w([-6, FACE, 2.4], "metal mesh window", "middle", 18)}${w([X1, FACE, 22], "keypad", "start", 4, 8)}${w([X1, FACE, 6.5], "door release", "start", 4, 8)}` +
          `${w([X1, BK + 4, H], "vents", "start", -6, 6)}${w([X0 - 1, FACE, 26], "hinge", "end", 0, -6)}${w([TT[0], PLATE_R, PLATE_Z], "turntable", "middle", 12)}</g>`);
      }
      g.innerHTML = out.join("");
      const el = Object.fromEntries([...g.querySelectorAll("[data-part]")].map((e) => [e.dataset.part, e])), wr = ISO.writer();

      // The turntable under the bowl: drive coupler, the roller ring's three wheels on their spider, the glass plate.
      const ringSvg = (a) => {
        const [x0, y0] = TT, r = [ISO.tinted(ISO.T.steel, S(K.cylinder(x0, y0, 1.6, CAV.z0, 0.8, P, 20), { tone: "mid" }))];
        const wheels = [0, 1, 2].map((i) => { const b = a + (i * Math.PI * 2) / 3; return [Math.cos(b), Math.sin(b)]; }).sort((p, q) => K.depthOf([...p, 0], P) - K.depthOf([...q, 0], P));
        r.push(`<path d="${wheels.map(([c, s]) => K.pathOf([K.iso([x0 + c * 1.6, y0 + s * 1.6, CAV.z0 + 0.6], P), K.iso([x0 + c * (ROLL_R - 0.5), y0 + s * (ROLL_R - 0.5), CAV.z0 + 0.6], P)])).join("")}" stroke="#55595f" stroke-width="1.2" fill="none" stroke-linecap="round"/>`);
        for (const [c, s] of wheels) r.push(ISO.tinted(ISO.T.plastic, S(G.disc(-0.45, 0.45, 0.9, G.frameAlong([x0 + c * ROLL_R, y0 + s * ROLL_R, CAV.z0 + 0.9], [c, s, 0]), P), { tone: "mid" })));
        r.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x0, y0, 0.9, CAV.z0 + 0.8, PLATE_Z - CAV.z0 - 0.8, P, 16), { tone: "mid" })));
        return r.join("");
      };
      el.plate.innerHTML = ISO.tinted(ISO.T.glass, S(K.cylinder(TT[0], TT[1], PLATE_R, PLATE_Z, 0.6, P, 64, 0.2), { tone: "hi" })) +
        `<path d="${K.ring(TT[0], TT[1], PLATE_R - 2.4, PLATE_Z + 0.6, P, 56)}" fill="none" stroke="#9db6c6" stroke-width=".7"/>`;
      // The bowl is drawn once at the turntable's centre and carried round its orbit by a transform.
      const bz = PLATE_Z + 0.6, BF = zF([TT[0] + ORBIT, TT[1], bz]);
      el.bowl.innerHTML = ISO.tinted(ISO.tint("#fbfaf7", ["#cfcac0", "#dcd8cf", "#e7e3dc", "#f1eee9"], "#6d6658"), S(G.lathe(BOWL, BF, P, { steps: 40 }), { tone: "hi" })) +
        `<path d="${G.circleOf(BF, 4.6, 5.2, P)}" fill="#e2a85c" stroke="#9a6224" stroke-width=".5"/>`;

      const st = { secs: ISO.clamp(ISO.num(o, "secs", 30), 1, 5999), left: 0, a: 0, heat: 0, clock: 0, done: false };
      const puffs = ISO.puffsFx(g, P, W, Hh, el.steam, 6, 0.1);
      const steamOf = () => {
        const s = ISO.smooth(0.15, 0.7, st.heat), list = [];
        const c = [TT[0] + Math.cos(st.a) * ORBIT, TT[1] + Math.sin(st.a) * ORBIT, bz + 4.8];
        for (let i = 0; i < 6; i++) {
          const f = (st.clock * 0.3 + i / 6) % 1;
          list.push([c[0] + Math.sin(i * 2.1 + f * 3) * 1.2, c[1] + Math.cos(i * 1.7) * 1.2, c[2] + f * 11, 1.3 + f * 1.9, s * 0.7 * Math.sin(Math.PI * f)]);
        }
        return list;
      };
      const ringMemo = [];
      const draw = () => {
        const on = st.left > 0, a = st.a;
        // the ring has three-fold symmetry: 21 poses of 1/3 turn, each built once
        const rq = Math.round(((a / 2) % ((Math.PI * 2) / 3)) * 10) % 21;
        if (!ringMemo[rq]) ringMemo[rq] = ringSvg(rq / 10);
        wr.rebuild(el.ring, String(rq), () => ringMemo[rq]);
        wr.attr(el.bowl, "transform", K.translateAlong(P, [Math.cos(a) * ORBIT - ORBIT, Math.sin(a) * ORBIT, 0]));
        // lit cavity: the interior takes a warm tint, the lamp cover glows, the window glass lets the light through
        wr.attr(el.cavity, "style", on ? ISO.T.amber : "");
        wr.rebuild(el.lamp, String(on), () => box([CAV.x0, CAV.x0 + 0.6], [3, 8], [18, 21.5], "hi", on ? ISO.tint("#fff3c4", ["#f2cf6e", "#f5d985", "#f8e29c", "#fbebb3"], "#8a5a10") : "", on));
        wr.attr(el.glass.firstChild, "fill", on ? "#f3d58a" : "#2b333b");
        wr.attr(el.glass.firstChild, "fill-opacity", on ? ".22" : ".45");
        const shown = on ? `${Math.floor(Math.ceil(st.left) / 60)}:${String(Math.ceil(st.left) % 60).padStart(2, "0")}` : st.done ? "End" : `${Math.floor(st.secs / 60)}:${String(st.secs % 60).padStart(2, "0")}`;
        wr.rebuild(el.display, shown, () => `<g transform="${ISO.faceMatrix(P, [PX + 2, FACE + 0.32, 27.6], 1)}"><text x="${(X1 - PX - 4) / 2}" y="2.75" text-anchor="middle" style="font:700 2.6px ui-monospace,Menlo,monospace" fill="#7fe0a0">${shown}</text></g>`);
        const list = steamOf();
        if (puffs) puffs(list);
        else wr.rebuild(el.steam, list.some((p) => p[4] > 0.02) ? `${Math.round(st.clock * 20)} ${Math.round(st.heat * 20)}` : "off", () => list.filter((p) => p[4] > 0.02).map(([x, y, z, r, op]) => {
          const c = K.iso([x, y, z], P), k = K.cameraOf(P).k * r * 0.8;
          return `<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="${k.toFixed(1)}" ry="${(k * 0.8).toFixed(1)}" fill="#eef2f5" fill-opacity="${(op * 0.7).toFixed(2)}"/>`;
        }).join(""));
      };
      g.set = (p) => {
        if (p.secs !== undefined) st.secs = ISO.clamp(Math.round(+p.secs), 1, 5999);
        if (p.start) { st.left = st.secs; st.done = false; }
      };
      // The clock runs 6× fast: a 30 s heat takes 5 s. The turntable keeps true pace with that clock: ~5 rpm.
      g.update = (dt) => {
        const calm = ISO.still();
        st.clock += dt;
        if (st.left > 0) {
          const run = calm ? st.left : Math.min(st.left, dt * 6);
          st.left -= run; st.a += (run * 5 * Math.PI * 2) / 60; st.heat = Math.min(1, st.heat + run / 12);
          if (st.left <= 0) { st.left = 0; st.done = true; }
        } else st.heat = calm ? 0 : Math.max(0, st.heat - dt * 0.5);
        draw();
        return st.left > 0 || st.heat > 0;
      };
      g.readout = () => (st.left > 0 ? `heating · ${Math.ceil(st.left)} s left (shown 6× faster) · 800 W of 2.45 GHz waves make water molecules jiggle, which heats the food · turntable ~5 rpm` : st.done ? "done · ding · the mesh in the door kept the waves inside the whole time" : `set to ${st.secs} s · press start`);
      draw();
      if (t) label(parent, cx, cy - Hh / 2 - 8, t, TXT.blue, 22, "middle");
      return g;
    },
  });
})();
