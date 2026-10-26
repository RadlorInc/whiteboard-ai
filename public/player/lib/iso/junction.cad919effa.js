// "junction cx cy size go=ns|ew side=left|right lab=1 lit=lights|zebra|stopline" — a model crossroads controlled by
// traffic lights, on a base board: two-lane roads, a zebra crossing and a stop line on every arm, kerbed pavements on
// the corners with a tree each, and a three-lamp signal on a pole beside each entry. go=ns gives the north–south
// road green: its cars drive through while the east–west cars stop at their red light; set({ go: "ew" }) changes the
// lights (green → amber 1.5 s → red, then the other road gets green) and the waiting cars pull away. Cars brake and
// accelerate like cars (about 2.5 m/s², 30 km/h). side=left drives on the left (UK, India); right mirrors it.
// Scale 1 unit = 0.25 m: lanes 2.75 m, crossing 3.5 m wide.
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s), L = (d, s) => K.lineSvg(d, s);
  const E = 112, HW = 22, LANE = 11, CR = 12, ZEB = [HW + 6, HW + 20], STOP = HW + 23, VMAX = 34, ACC = 10;
  const COL = { red: "#e5322b", amber: "#f2a21d", green: "#2fb36b" };

  ISO.add({
    name: "junction", title: "Crossroads with traffic lights", compare: "junction 480 270 500",
    about: "A model crossroads: the road with the green light drives through, the other road waits at its stop line until the lights change.",
    line: "junction cx cy size go=ns|ew side=left|right lab=1 lit=lights|zebra|stopline",
    demo: { line: "junction 480 275 500 go=ns", script: [{ set: { lit: "lights" }, hold: 3.2 }, { set: { go: "ew", lit: "stopline" }, hold: "settle" }, { set: { lit: "" }, hold: 1 }] },
    make([cx, cy, size = 500], o, t, parent) {
      const ROAD = window.ROAD;
      const lab = o.lab !== "0", W = size * 1.25, H = size * 0.86, sg = o.side === "right" ? -1 : 1;
      const { P, g } = ISO.frame([[-E, -E, -10], [E, E, -10], [-E, E, 0], [E, -E, 0], [0, 0, 40]], cx, cy, W, H, { azimuth: 30, elevation: 40 }, parent);
      const dir = (f) => [Math.round(Math.cos((f * Math.PI) / 180)), Math.round(Math.sin((f * Math.PI) / 180))];
      // a point d out along arm f, w across it (w > 0 toward the side cars drive in when entering)
      const armAt = (f, d, w) => { const [c, s] = dir(f), k = sg * w; return [c * d + s * k, s * d - c * k]; };
      const arms = [90, 0, -90, 180], axis = (f) => (f === 90 || f === -90 ? "ns" : "ew");

      // ── the static model
      const base = { x: -E - 6, y: -E - 6, w: 2 * E + 12, d: 2 * E + 12, r: 4 };
      const out = [`<path class="iso-halo" d="${K.haloOf(base, -10, 10, P)}"/>`, ISO.tinted(ISO.T.wood, S(K.slabOf(base, -10, 8, P, 4, 0.8), { tone: "mid", inner: L(K.sideSeam(base, -6, P, 4), { tone: "faint" }) }))];
      out.push(ISO.tinted(ROAD.TARMAC, S(K.slabOf({ x: -E, y: -E, w: 2 * E, d: 2 * E, r: 1 }, -2, 2, P, 2), { tone: "hi" })));
      // corners: a kerbed pavement (rounded where cars turn) with a grass verge inside it
      const corner = (qx, qy, inset, pave) => {
        const h = HW + inset + pave, r = Math.max(1, CR - inset - pave), pts = [];
        for (let i = 0; i <= 8; i++) { const a = Math.PI + (Math.PI / 2) * (i / 8); pts.push([qx * (h + r + Math.cos(a) * r), qy * (h + r + Math.sin(a) * r)]); }
        pts.splice(0, 0, [qx * h, qy * E]); pts.push([qx * E, qy * h], [qx * E, qy * E]);
        return pts;
      };
      const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
      for (const [qx, qy] of corners) {
        out.push(ISO.tinted(ROAD.KERB, S(K.extrude(corner(qx, qy, 0, 0), 0, 1.6, P, { convex: false }), { tone: "mid" })));
        // paving joints across the pavement, then the verge
        const joints = [];
        for (let d = HW + CR + 6; d < E; d += 8) { joints.push(ROAD.bar(P, [qx * (HW + 0.6), qy * d], [qx * (HW + 9.4), qy * d], 0.35, 1.61, "#b9b8b2"), ROAD.bar(P, [qx * d, qy * (HW + 0.6)], [qx * d, qy * (HW + 9.4)], 0.35, 1.61, "#b9b8b2")); }
        out.push(joints.join(""), ROAD.flat(P, corner(qx, qy, 0, 10), 1.62, "#bcd9a2", "#6f9a55", 0.6));
      }
      // paint: centre lines, zebra stripes across each arm, a stop line on each entry lane
      const zebra = [], stopl = [], centre = [];
      for (const f of arms) {
        for (let w = -HW + 2.2; w <= HW - 2.2; w += 4.8) zebra.push(ROAD.bar(P, armAt(f, ZEB[0], w), armAt(f, ZEB[1], w), 2.4, 0.02));
        stopl.push(ROAD.bar(P, armAt(f, STOP, 0.6), armAt(f, STOP, HW - 1), 1.3, 0.02));
        centre.push(ROAD.bar(P, armAt(f, STOP - 0.6, 0), armAt(f, STOP + 22, 0), 0.8, 0.02), ROAD.dashes(P, [armAt(f, STOP + 24, 0), armAt(f, E, 0)], 0.02, 6, 6, 0.8));
        // a lane arrow (straight ahead) painted in each entry lane
        const a = armAt(f, STOP + 18, LANE), b = armAt(f, STOP + 30, LANE), [c, s] = dir(f), head = [[a[0] - c * 0, a[1]], [a[0] + c * 4 - s * 2.8 * 1, a[1] + s * 4 + c * 2.8], [a[0] + c * 4 + s * 2.8, a[1] + s * 4 - c * 2.8]];
        centre.push(ROAD.bar(P, [a[0] + c * 4, a[1] + s * 4], b, 1.1, 0.02), ROAD.flat(P, head, 0.02, "#fbfbf7"));
      }
      out.push(`<g>${centre.join("")}</g><g data-name="zebra">${zebra.join("")}</g><g data-name="stopline">${stopl.join("")}</g>`);
      g.innerHTML = out.join("") + `<g data-part="movers"></g><g data-part="words"></g>`;

      // ── poles, heads and trees, sorted with the cars (they stand on the pavement, a K.extrude the audit does not
      // record, so it lists them as loose)
      const movers = g.querySelector("[data-part=movers]"), words = g.querySelector("[data-part=words]"), items = {}, anchors = {};
      const poleAt = (f) => armAt(f, STOP + 4, HW + 4.5);
      const headSvg = (f, state) => {
        const [x, y] = poleAt(f), [c, s] = dir(f), up = 34, out = [];
        out.push(ISO.tinted(ISO.T.steel, S(K.cylinder(x, y, 2.4, 1.6, 0.8, P, 16), { tone: "lo" }) + S(K.cylinder(x, y, 1, 2.4, up - 2.4, P, 12), { tone: "mid" })));
        // the head faces along +arm (toward cars coming in): a black box, three lenses under small visors
        const at = (u, w, z) => [x + c * u - s * w, y + s * u + c * w, z];
        out.push(ISO.tinted(ISO.T.plastic, ISO.box(at, P, [1, 4.6], [-2.6, 2.6], [up - 6, up + 12], "hi")));
        const facing = K.depthOf([x + c, y + s, 0], P) > K.depthOf([x, y, 0], P);
        if (facing) ["red", "amber", "green"].forEach((k, i) => {
          const z = up + 8.4 - i * 5.4, on = state.includes(k), ring = Array.from({ length: 14 }, (_, j) => { const a = (j / 14) * Math.PI * 2; return K.iso(at(4.65, Math.cos(a) * 1.7, z + Math.sin(a) * 1.7), P); });
          out.push(`<path d="${K.pathOf(ring, true)}" fill="${on ? COL[k] : "#2a2c30"}" stroke="#0b0c0e" stroke-width="0.5"/>`);
          if (on) { const p = K.iso(at(5, 0, z), P); out.push(`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(G.scaleOf(P) * 4.2).toFixed(1)}" fill="${COL[k]}" opacity=".28"/>`); }
        });
        return out.join("");
      };
      const heads = {};
      arms.forEach((f) => { const e = mk("g", { "data-name": "lights" }, movers); heads[f] = e; items["p" + f] = e; anchors["p" + f] = [...poleAt(f), 0]; });
      corners.forEach(([qx, qy], i) => { const e = mk("g", {}, movers); const x = qx * (HW + 22), y = qy * (HW + 26); e.innerHTML = ROAD.tree(P, x, y, 24, 1.62); items["t" + i] = e; anchors["t" + i] = [x, y, 0]; });
      // cars: arm they come in from, colour, start distance out along it
      const cars = [{ f: 90, c: "red", d: 70 }, { f: 90, c: "white", d: 96 }, { f: -90, c: "blue", d: 82 }, { f: 0, c: "yellow", d: 92 }, { f: 180, c: "green", d: 74 }];
      cars.forEach((car, i) => { car.s = 0; car.v = 0; car.end = car.d + E - 4; car.id = "c" + i; items[car.id] = mk("g", {}, movers); });
      const sort = ISO.sorter(P, movers), w = ISO.writer(), namedEls = [...g.querySelectorAll("[data-name]")];
      const st = { go: o.go === "ew" ? "ew" : "ns", light: {}, timer: 0, lit: o.lit || "", litDrawn: null };
      st.light = { ns: st.go === "ns" ? "green" : "red", ew: st.go === "ew" ? "green" : "red" };
      const carStop = (car, i) => {
        // the stop line, or the car in front in the same lane (a car's length and a gap behind it)
        let limit = car.d - (STOP + 9.5);
        if (st.light[axis(car.f)] === "green" || car.s > limit + 0.5) limit = car.end;
        for (const other of cars) if (other !== car && other.f === car.f && other.d < car.d) limit = Math.min(limit, other.s + (car.d - other.d) - 22);
        return limit;
      };
      const step = (dt) => {
        let moving = false;
        cars.forEach((car, i) => {
          const target = carStop(car, i), room = target - car.s;
          const want = room <= 0.05 ? 0 : Math.min(VMAX, Math.sqrt(2 * ACC * room));
          car.v = want > car.v ? Math.min(want, car.v + ACC * dt) : want;
          car.s = Math.min(target > car.s ? target : car.s, car.s + car.v * dt);
          if (car.v > 0.01) moving = true;
        });
        return moving;
      };
      const draw = () => {
        for (const car of cars) {
          const d = car.d - car.s, [x, y] = armAt(car.f, d, LANE), h = Math.atan2(-dir(car.f)[1], -dir(car.f)[0]);
          anchors[car.id] = [x, y, 0];
          ROAD.place(P, w, items[car.id], x, y, h, car.c);
        }
        arms.forEach((f) => w.rebuild(heads[f], st.light[axis(f)], () => headSvg(f, st.light[axis(f)] === "redamber" ? ["red", "amber"] : [st.light[axis(f)]])));
        sort(items, anchors);
        if (st.litDrawn !== st.lit) { st.litDrawn = st.lit; const on = String(st.lit).split(","); w.light(namedEls, namedEls.filter((e) => on.includes(e.dataset.name))); }
        if (lab) w.rebuild(words, `${st.light.ns} ${st.light.ew}`, () => {
          const tag = (k) => ({ green: "green: go", amber: "amber: stop if safe", red: "red: stop", redamber: "red and amber: get ready" })[k];
          return ISO.word(K.iso([...armAt(90, E - 6, -HW - 26), 2], P), "north–south " + tag(st.light.ns), COL[st.light.ns === "redamber" ? "amber" : st.light.ns], { size: 13 }) +
            ISO.word(K.iso([...armAt(0, E - 6, HW + 34), 2], P), "east–west " + tag(st.light.ew), COL[st.light.ew === "redamber" ? "amber" : st.light.ew], { size: 13 });
        });
      };
      g.set = (p) => {
        if (p.go && p.go !== st.go && (p.go === "ns" || p.go === "ew")) { st.go = p.go; st.timer = 0; st.changing = true; }
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the change: the old road goes amber for 1.5 s, then red; 1 s later the new road gets red + amber, then green
      g.update = (dt) => {
        const calm = ISO.still();
        if (st.changing) {
          st.timer += calm ? 10 : dt;
          const old = st.go === "ns" ? "ew" : "ns";
          st.light[old] = st.timer < 1.5 ? "amber" : "red";
          st.light[st.go] = st.timer < 2.5 ? "red" : st.timer < 3.5 ? "redamber" : "green";
          if (st.timer >= 3.5) st.changing = false;
        }
        let moving;
        if (calm) { for (let k = 0; k < 600 && step(0.05); k++); moving = false; }
        else moving = step(Math.min(dt, 0.05));
        draw();
        return moving || !!st.changing;
      };
      g.readout = () => {
        const waiting = cars.filter((c) => c.v < 0.1 && c.s < c.end - 1 && st.light[axis(c.f)] !== "green").length, fast = Math.max(...cars.map((c) => c.v));
        return `north–south ${st.light.ns}, east–west ${st.light.ew} · ${waiting} car${waiting === 1 ? "" : "s"} waiting at the stop line · fastest car ${Math.round(fast * 0.25 * 3.6)} km/h · drive on the ${sg > 0 ? "left" : "right"}`;
      };
      draw();
      window.LAB.title(parent, cx, cy - H / 2 - 8, t);
      return g;
    },
  });
})();
