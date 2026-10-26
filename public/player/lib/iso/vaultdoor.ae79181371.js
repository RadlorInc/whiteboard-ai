// "vaultdoor cx cy k wheel=0..1 retract=0..1 door=0..1 lab=0 lit=frame|door|wheel|dial|bolts|hinge|vault" — a PART
// (batch 6, money): a round bank vault door in its wall frame, standing on the floor, its origin the floor point under
// the middle of the frame's front face; the vault is behind (−y), the bank hall in front (+y). The frame is a steel
// block 200 × 60 × 220 cm with a round doorway 160 cm across; the door a steel disc 176 cm across and 40 cm thick
// with a raised centre plate, a spoked wheel with four handles, a combination dial, and nine round locking bolts in its
// rim that slide out into keepers fixed round the doorway; it hangs on a hinge post at the right by two arms. Behind
// it, seen through the doorway: shelves of gold bars and banded note bundles. wheel 0 → 1 turns the wheel (and the
// dial) a full turn; retract 0 → 1 draws the bolts in out of their keepers; door 0 → 1 swings the door open to 100°,
// only once the bolts are in. set({ wheel, retract, door }). World: 1 = 1 cm. anchors: wheel dial hinge vault
(() => {
  const K = window.K, G = window.G, S = (p, s) => K.solidSvg(p, s);
  const HX = 100, HY = 30, HZ = 220, CZ = 110, R0 = 80, RD = 88, DT = 40, YC = HY + DT / 2, HXH = 100, BOLT = 12;
  const ANG = Array.from({ length: 9 }, (_, i) => ((40 + i * 35) * Math.PI) / 180);
  const STEEL = ISO.tint("#d3d7dc", ["#878d95", "#9aa0a8", "#adb2b9", "#c0c4ca"], "#2f343a");
  const DOOR = ISO.tint("#c9ced4", ["#7b828a", "#8e959d", "#a2a8af", "#b5bac0"], "#262a2f");
  const CHROME = ISO.T.steel;
  ISO.add({
    name: "vaultdoor", title: "Vault door (part)", compare: null,
    about: "A round bank vault door, 176 cm across and 40 cm thick, in a 200 × 220 cm steel frame: spoked wheel, combination dial, nine bolts into keepers round the doorway, hinge post and arms; inside, shelves of gold bars and note bundles. wheel turns the wheel, retract draws the bolts, door swings it open. anchors: wheel dial hinge vault",
    line: "vaultdoor cx cy k wheel=0..1 retract=0..1 door=0..1 lab=0 lit=frame|door|wheel|dial|bolts|hinge|vault",
    demo: { line: "vaultdoor 470 455 1.5 wheel=0 retract=0 door=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { lit: "dial" }, hold: 1 }, { set: { wheel: 1, lit: "wheel" }, hold: "settle" }, { set: { retract: 1, lit: "bolts" }, hold: "settle" }, { set: { door: 1, lit: "hinge" }, hold: "settle" }, { set: { lit: "vault" }, hold: 1.5 }, { set: { door: 0, lit: "" }, hold: "settle" }, { set: { retract: 0, wheel: 0 }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const A = window.B41, B = window.B46, lab = o.lab === "1";
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1");
      const st = { wheel: A.num(o, "wheel", 0, 0, 1), retract: A.num(o, "retract", 0, 0, 1), door: A.num(o, "door", 0, 0, 1), lit: o.lit || "" };
      st.wW = st.wheel; st.rW = st.retract; st.dW = st.door;
      if (st.retract < 0.98) st.door = 0;
      const view = G.viewOf(P), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const circle = (y, r, n = 64) => K.pathOf(Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return K.iso([Math.cos(a) * r, y, CZ + Math.sin(a) * r], P); }), true);
      const radial = (a) => [Math.cos(a), 0, Math.sin(a)];
      // the frame: the steel block, two rings round the doorway, a ring of bolt heads, the doorway's bore (dark steel)
      const bolts0 = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return K.iso([Math.cos(a) * 96, HY + 0.02, CZ + Math.sin(a) * 96], P); }).filter((_, i) => i % 2 === 0);
      const frame = B.box(P, [-HX, HX], [-HY, HY], [0, HZ], STEEL) +
        `<path d="${circle(HY + 0.01, 84)}${circle(HY + 0.01, 108)}" fill="none" stroke="#5a6068" stroke-width="0.8"/>` + K.dotsSvg(bolts0, { size: 0.5 }) +
        B.free(P, [[[-HX, HY + 0.01, 14], [HX, HY + 0.01, 14]], [[HX + 0.01, -HY, 14], [HX + 0.01, HY, 14]]], "#5a6068", 0.6) +
        `<path d="${circle(HY + 0.02, R0)}" fill="#4e545b" stroke="#1c2024" stroke-width="1"/>`;
      // the hinge post at the right and its two brackets to the frame
      const post = B.box(P, [HXH - 6, HXH + 3], [HY, YC], [55, 65], STEEL) + B.box(P, [HXH - 6, HXH + 3], [HY, YC], [155, 165], STEEL) +
        ISO.tinted(CHROME, S(K.cylinder(HXH, YC, 6, 40, 140, P, 28), { tone: "mid" })) + ISO.tinted(CHROME, S(K.cylinder(HXH, YC, 7, 180, 4, P, 28), { tone: "mid" }));
      // a keeper round the doorway, where a bolt goes in: a block on the frame's face with its socket
      const keeper = (a) => {
        const r = radial(a), tt = [-Math.sin(a), 0, Math.cos(a)], at = B.frame([0, 0, CZ], r, tt, [0, 1, 0]);
        return B.obox(P, (u, w, y) => at(u, y, w), [RD + 2, RD + 16], [HY, HY + 32], [-6, 6], STEEL);
      };
      const facing = (a) => dot(radial(a), view) > 0;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX - 2, y: -HY - 2, w: 2 * HX + 10, d: 2 * HY + 30, r: 4 }, 0, HZ, P)}"/>` +
        `<g data-name="frame">${frame}</g><g data-name="vault" data-part="vault"></g><g data-name="frame">${ANG.filter((a) => !facing(a)).map(keeper).join("")}</g>` +
        `<g data-name="hinge" data-part="postA"></g><g data-name="frame" data-part="keepOpen"></g><g data-part="doorBody"></g><g data-part="doorWheel"></g><g data-part="doorBolts"></g><g data-name="frame" data-part="keepNear"></g><g data-name="hinge" data-part="postB"></g><g data-part="words"></g>`;
      const el = B.parts(g), w = ISO.writer();
      const nearKeepers = ANG.filter(facing).map(keeper).join("");
      // the vault behind, drawn later (its own build part): back wall, floor, steel shelving with gold and cash
      ISO.later(() => {
        const id = B.id(), id2 = B.id(), YW = -75, s = [];
        s.push(`<clipPath id="${id}"><path d="${circle(HY, R0)}"/></clipPath><clipPath id="${id2}"><path d="${circle(-HY, R0)}"/></clipPath><g clip-path="url(#${id})"><g clip-path="url(#${id2})">`);
        s.push(B.quad(P, [[-90, YW, 0], [90, YW, 0], [90, YW, HZ], [-90, YW, HZ]], "#dfe2e6", "#5a6068"), B.quad(P, [[-90, YW, 30], [90, YW, 30], [90, -HY, 30], [-90, -HY, 30]], "#b9bdc2", "#5a6068"));
        s.push(B.box(P, [-72, -69], [YW, YW + 22], [30, 192], STEEL), B.box(P, [69, 72], [YW, YW + 22], [30, 192], STEEL));
        [[48, "gold"], [88, "cash"], [128, "gold"], [168, "cash"]].forEach(([z, what], i) => {
          s.push(B.box(P, [-72, 72], [YW, YW + 22], [z - 2, z], STEEL));
          if (what === "gold") { [-40, -12, 16, 44].forEach((x) => s.push(B.bar(P, [x, YW + 10, z], {}))); [-26, 2, 30].forEach((x) => s.push(B.bar(P, [x, YW + 10, z + 4], {}))); }
          else for (const x of [-52, -34, -16, 2, 20, 38]) for (let j = 0; j < 3; j++) s.push(B.bundle(P, [x + 7.5, YW + 12, z + j * 1.25], { n: 100, value: i === 1 ? 50 : 20, art: j === 2 }));
        });
        s.push(`</g></g>`);
        el.vault.innerHTML = s.join("");
      });
      // the door at swing angle b (about the hinge post), its wheel turned by wa and its bolts out by out (0..1)
      const doorSvg = (b, wa, out, part) => {
        const U = [Math.cos(b), -Math.sin(b), 0], N = [Math.sin(b), Math.cos(b), 0], Z = [0, 0, 1];
        const c = [HXH - HXH * Math.cos(b), YC + HXH * Math.sin(b), CZ], F = G.frameOf(c, N, U, Z);
        const pt = (u, z, n) => [c[0] + U[0] * u + N[0] * n, c[1] + U[1] * u + N[1] * n, c[2] + z];
        const rad = (a) => [U[0] * Math.cos(a), U[1] * Math.cos(a), Math.sin(a)];
        const bolt = (a) => { if (out <= 0.02) return ""; const pp = [-U[0] * Math.sin(a), -U[1] * Math.sin(a), Math.cos(a)]; return ISO.tinted(CHROME, S(G.disc(RD - 4, RD + BOLT * out, 3.5, G.frameOf(c, rad(a), N, pp), P), { tone: "mid" })); };
        const front = dot(N, view) > 0;
        let s = "";
        if (part === "bolts") return `<g data-name="bolts">${ANG.filter((a) => dot(rad(a), view) > 0).map(bolt).join("")}</g>`;
        if (part === "body") {
        s += `<g data-name="bolts">${ANG.filter((a) => dot(rad(a), view) <= 0).map(bolt).join("")}</g>`;
        // the arms to the hinge post (behind the disc's rim when it is open), the disc, its raised plate
        const arms = [CZ - 45, CZ + 45].map((z) => B.obox(P, B.frame(pt(0, z - CZ, 0), U, Z, N), [RD - 6, HXH], [-4, 4], [-6, 6], STEEL)).join("");
        s += `<g data-name="hinge">${arms}</g><g data-name="door">${ISO.tinted(DOOR, S(G.disc(-DT / 2, DT / 2, RD, F, P), { tone: "mid", inner: K.lineSvg(G.arcOf(F, 0, RD, P), { tone: "faint" }) }))}`;
        if (front) {
          s += ISO.tinted(DOOR, S(G.disc(DT / 2, DT / 2 + 3, 62, F, P), { tone: "mid" }));
          const face = `<circle r="56" fill="none" stroke="#5a6068" stroke-width="0.7"/><circle r="74" fill="none" stroke="#5a6068" stroke-width="0.7"/>${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 80).toFixed(1)}" cy="${(Math.sin(a) * 80).toFixed(1)}" r="1.6" fill="#7b828a" stroke="#262a2f" stroke-width="0.3"/>`; }).join("")}`;
          s += `<g transform="${A.plane(P, pt(0, 0, DT / 2 + 0.02), U, [0, 0, -1])}">${face}</g>`;
        }
        s += `</g>`;
        return s;
        }
        if (front) {
          // the dial (upper left): a short drum, its ticks and numbers turning, the fixed index mark above it
          const dc = pt(-36, 36, DT / 2 + 3), Fd = G.frameOf(dc, N, U, Z), da = wa * 3;
          let dial = ISO.tinted(CHROME, S(G.disc(0, 5, 11, Fd, P), { tone: "mid" }));
          const ticks = Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2 + da, r1 = i % 4 ? 8.6 : 7.6; return `M${(Math.cos(a) * 10).toFixed(2)} ${(Math.sin(a) * 10).toFixed(2)}L${(Math.cos(a) * r1).toFixed(2)} ${(Math.sin(a) * r1).toFixed(2)}`; }).join("");
          const nums = [0, 20, 40, 60, 80].map((n, i) => { const a = (i / 5) * Math.PI * 2 + da - Math.PI / 2; return A.text((Math.cos(a) * 5.6).toFixed(2), (Math.sin(a) * 5.6 + 0.9).toFixed(2), String(n), 2.4, "#26292e", "middle", 800); }).join("");
          dial += `<g transform="${A.plane(P, pt(-36, 36, DT / 2 + 8.02), U, [0, 0, -1])}"><circle r="10" fill="#e3e5e8" stroke="#3c4047" stroke-width="0.3"/><path d="${ticks}" stroke="#26292e" stroke-width="0.35"/>${nums}<circle r="2" fill="#a2a7ad" stroke="#3c4047" stroke-width="0.3"/><path d="M0 -13.6L1.2 -11.8H-1.2Z" fill="#c8553d"/></g>`;
          s += `<g data-name="dial">${dial}</g>`;
          // the wheel: four spokes with handles, a rim ring, the hub
          const sp = (i) => { const a = wa + (i * Math.PI) / 2, d = rad(a), pp = [-U[0] * Math.sin(a), -U[1] * Math.sin(a), Math.cos(a)];
            return B.obox(P, (u, w2, y) => [c[0] + d[0] * u + pp[0] * w2 + N[0] * y, c[1] + d[1] * u + pp[1] * w2 + N[1] * y, c[2] + d[2] * u + pp[2] * w2 + N[2] * y], [9, 40], [-1.6, 1.6], [DT / 2 + 6, DT / 2 + 10], CHROME) +
              ISO.tinted(CHROME, S(G.disc(DT / 2 + 6, DT / 2 + 18, 2.6, G.frameOf([c[0] + d[0] * 42, c[1] + d[1] * 42, c[2] + d[2] * 42], N, U, Z), P), { tone: "mid" })); };
          const order = [0, 1, 2, 3].sort((i, j) => K.depthOf(pt(Math.cos(wa + (i * Math.PI) / 2) * 30, Math.sin(wa + (i * Math.PI) / 2) * 30, 0), P) - K.depthOf(pt(Math.cos(wa + (j * Math.PI) / 2) * 30, Math.sin(wa + (j * Math.PI) / 2) * 30, 0), P));
          s += `<g data-name="wheel">${ISO.tinted(CHROME, S(G.disc(DT / 2 + 3, DT / 2 + 6, 12, F, P), { tone: "mid" }))}${order.map(sp).join("")}` +
            `<path d="${G.circleOf(F, DT / 2 + 9.5, 34, P)}${G.circleOf(F, DT / 2 + 9.5, 31, P)}" fill="#d9dadd" fill-rule="evenodd" stroke="#3c3f45" stroke-width="0.9"/>` + ISO.tinted(CHROME, S(G.disc(DT / 2 + 6, DT / 2 + 13, 8, F, P), { tone: "mid" })) + `</g>`;
        }
        return s;
      };
      const draw = () => {
        const b = (Math.round(st.door * 300) / 300) * (100 * Math.PI) / 180, wa = (Math.round(st.wheel * 360) / 360) * Math.PI * 2, out = 1 - Math.round(st.retract * 120) / 120;
        w.rebuild(el.doorBody, `${b} ${out}`, () => doorSvg(b, wa, out, "body"));
        w.rebuild(el.doorWheel, `${b} ${wa}`, () => doorSvg(b, wa, out, "wheel"));
        w.rebuild(el.doorBolts, `${b} ${out}`, () => doorSvg(b, wa, out, "bolts"));
        const shut = b < 0.12, late = b > 0.5;
        w.rebuild(el.keepNear, `${shut}`, () => (shut ? nearKeepers : ""));
        w.rebuild(el.keepOpen, `${shut}`, () => (shut ? "" : nearKeepers));
        w.rebuild(el.postA, `${late}`, () => (late ? post : ""));
        w.rebuild(el.postB, `${late}`, () => (late ? "" : post));
        const U = [Math.cos(b), -Math.sin(b), 0], N = [Math.sin(b), Math.cos(b), 0], c = [HXH - HXH * Math.cos(b), YC + HXH * Math.sin(b), CZ];
        g.anchors = { wheel: [c[0] + N[0] * (DT / 2 + 13), c[1] + N[1] * (DT / 2 + 13), CZ], dial: [c[0] - U[0] * 36 + N[0] * (DT / 2 + 8), c[1] - U[1] * 36 + N[1] * (DT / 2 + 8), CZ + 36], hinge: [HXH, YC, 110], vault: [0, -40, 30] };
        if (lab) w.rebuild(el.words, `${st.dW > 0.5 && st.rW > 0.98} ${st.rW > 0.5}`, () => B.word(P, [HX, HY, HZ], st.dW > 0.5 && st.rW > 0.98 ? "vault door, open" : st.rW > 0.5 ? "bolts drawn in" : "vault door, bolted"));
        A.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.wheel !== undefined) st.wW = A.num(p, "wheel", st.wW, 0, 1);
        if (p.retract !== undefined) st.rW = A.num(p, "retract", st.rW, 0, 1);
        if (p.door !== undefined) st.dW = A.num(p, "door", st.dW, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      g.update = (dt) => {
        const calm = ISO.still(), step = (v, to, tau) => { const x = ISO.follow(v, to, dt, tau, calm); return Math.abs(x - to) < 0.002 ? to : x; };
        // the door swings only with the bolts in; the bolts go out only with the door shut
        const dTo = st.retract >= 0.98 ? st.dW : 0, rTo = st.door > 0.002 ? 1 : st.rW;
        st.wheel = step(st.wheel, st.wW, 0.5); st.retract = step(st.retract, rTo, 0.35); st.door = step(st.door, dTo, 0.7);
        draw();
        return st.wheel !== st.wW || st.retract !== st.rW || st.door !== (st.rW >= 0.98 ? st.dW : 0);
      };
      g.readout = () => `vault door · wheel ${Math.round(st.wW * 360)}° · bolts ${st.rW > 0.98 ? "drawn in" : st.rW < 0.02 ? "out, locked" : "moving"} · door ${st.rW < 0.98 ? "held by its bolts" : st.dW > 0.95 ? "open" : st.dW < 0.05 ? "shut" : "swinging"}`;
      draw();
      return g;
    },
  });
})();
