// "cashmachine cx cy k on=0|1 show=welcome|pin|menu|cash|done amt=0..9999 card=0..1 notes=0..1 count=0..10 lab=0
// lit=cabinet|screen|buttons|keypad|card|receipt|notes|hood" — a PART (batch 6, money): a lobby cash machine standing
// on the floor, its origin the floor point under its middle, its front toward the room (+y); 60 × 70 × 160 cm, put
// its back to a wall with ay=. A dark plinth, the steel safe with its service door, a sloped console with a metal
// keypad of raised keys (1–9, 0, red CANCEL, yellow CLEAR, green ENTER), and above it the fascia: a screen inside a
// privacy hood with four side buttons each side, the card reader with its slot and light, a receipt slot, a lit CASH
// sign on top, and below the console the note slot behind a shutter. The screen shows fixed pages with their own
// words: welcome (insert your card), pin (enter your PIN, four stars), menu (services by the side buttons), cash (how
// much, with amt) and done (take your cash: amt); on=0 dark glass. card 0 = a card sticking out of the slot (being
// put in or given back), 1 = taken in (gone). notes 0 → 1: the shutter opens and a bundle of count notes (generic:
// plain numbers, no real design) slides out; back to 0 it goes in and the shutter shuts. set({ show, amt, card,
// notes, count, on }). World: 1 = 1 cm. anchors: card (the slot's mouth) notes (the note slot) keypad screen
(() => {
  const K = window.K, G = window.G;
  const HX = 30, YB = -35, YS = 30, YF = 22, YC = 35, SX = 15, SZ0 = 114, SZ1 = 138, SW = 2 * SX, SH = SZ1 - SZ0;
  const SHOWS = ["welcome", "pin", "menu", "cash", "done"], BZ = [133, 127.5, 122, 116.5];
  const zs = (y) => 99 + ((YC - y) / (YC - YF)) * 4;   // the console's sloped top at y
  const STEEL = ISO.tint("#dfe2e6", ["#8e939a", "#a3a8ae", "#b8bcc1", "#cbced2"], "#3c4047");
  const SILVER = ISO.tint("#eceef1", ["#a2a7ae", "#b5b9bf", "#c7cacf", "#d9dbdf"], "#4a5058");
  const PANEL = ISO.tint("#5a6068", ["#2a2e33", "#33373d", "#3d4248", "#484d54"], "#121417");
  const SIGN = ISO.tint("#2f6fae", ["#173765", "#1f4a85", "#275c9c", "#2f6fae"], "#0e2140");
  // the screen's page as flat art (x right, y down, 1 = 1 cm, 30 × 24)
  function page(B, show, amt) {
    const s = [`<rect width="${SW}" height="${SH}" fill="#103a5c"/>`, `<rect width="${SW}" height="4.2" fill="#0b2c47"/>`];
    const T = (x, y, t, z, c = "#ffffff", a = "middle", wt = 700) => B.text(x, y, t, z, c, a, wt);
    const opt = (i, side, t) => { const y = [5, 10.5, 16, 21.5][i]; return side < 0 ? `<path d="M0.4 ${y - 0.5}L1.4 ${y - 1.1}V${y + 0.1}Z" fill="#ffcf4a"/>` + T(2, y, t, 1.5, "#ffffff", "start", 700) : `<path d="M${SW - 0.4} ${y - 0.5}L${SW - 1.4} ${y - 1.1}V${y + 0.1}Z" fill="#ffcf4a"/>` + T(SW - 2, y, t, 1.5, "#ffffff", "end", 700); };
    const a = String(Math.round(amt));
    if (show === "welcome") {
      s.push(T(SW / 2, 3, "WELCOME", 1.8, "#ffcf4a", "middle", 800), T(SW / 2, 10, "Welcome", 3.4), T(SW / 2, 14.5, "Please insert your card", 1.8, "#d6e4f0", "middle", 600));
      s.push(`<rect x="${SW / 2 - 3}" y="16.5" width="6" height="3.8" rx="0.4" fill="#2f5f9e" stroke="#e6f1fd" stroke-width="0.15"/><rect x="${SW / 2 - 2.2}" y="17.4" width="1.3" height="1" rx="0.15" fill="#e6c76a"/><path d="M${SW / 2} 21L${SW / 2 - 1} 22.4H${SW / 2 + 1}Z" fill="#ffcf4a" transform="rotate(180 ${SW / 2} 21.7)"/>`);
    } else if (show === "pin") {
      s.push(T(SW / 2, 3, "YOUR PIN", 1.8, "#ffcf4a", "middle", 800), T(SW / 2, 9.5, "Enter your PIN", 2.6));
      for (let i = 0; i < 4; i++) s.push(`<rect x="${SW / 2 - 7.6 + i * 4}" y="11.5" width="3.2" height="3.6" rx="0.3" fill="#0b2c47" stroke="#d6e4f0" stroke-width="0.12"/>`, T(SW / 2 - 6 + i * 4, 14.8, "*", 3.2, "#ffffff"));
      s.push(T(SW / 2, 19, "Cover the keys with your hand", 1.3, "#d6e4f0", "middle", 600), T(SW / 2, 21.6, "Press ENTER when done", 1.3, "#7fe08a", "middle", 700));
    } else if (show === "menu") {
      s.push(T(SW / 2, 3, "CHOOSE A SERVICE", 1.8, "#ffcf4a", "middle", 800));
      ["Withdraw cash", "Balance", "Mini statement", "Change PIN"].forEach((t, i) => s.push(opt(i, -1, t)));
      ["Fast cash 20", "Fast cash 50", "Print receipt", "Cancel"].forEach((t, i) => s.push(opt(i, 1, t)));
    } else if (show === "cash") {
      s.push(T(SW / 2, 3, "HOW MUCH?", 1.8, "#ffcf4a", "middle", 800));
      ["20", "40", "60", "100"].forEach((t, i) => s.push(opt(i, -1, t)));
      ["200", "300", "Other", "Cancel"].forEach((t, i) => s.push(opt(i, 1, t)));
      s.push(`<rect x="${SW / 2 - 5}" y="11" width="10" height="5" rx="0.4" fill="#0b2c47" stroke="#d6e4f0" stroke-width="0.12"/>`, T(SW / 2, 12.6, "Amount", 1.2, "#d6e4f0", "middle", 600), T(SW / 2, 15.4, a, 2.4, "#ffffff", "middle", 800));
    } else {
      s.push(T(SW / 2, 3, "THANK YOU", 1.8, "#ffcf4a", "middle", 800), T(SW / 2, 8.5, "Please take your cash", 2.2), T(SW / 2, 14, a, 4.2, "#7fe08a", "middle", 800), T(SW / 2, 18.4, "and your card", 1.8, "#d6e4f0", "middle", 600));
    }
    return s.join("");
  }
  ISO.add({
    name: "cashmachine", title: "Cash machine (part)", compare: null,
    about: "A lobby cash machine: screen in a privacy hood with side buttons, a metal keypad, card slot with light, receipt slot and a note slot with shutter; the screen walks through welcome, PIN, menu, amount and take your cash, the card goes in, notes come out. anchors: card notes keypad screen",
    line: "cashmachine cx cy k on=0|1 show=welcome|pin|menu|cash|done amt=0..9999 card=0..1 notes=0..1 count=0..10 lab=0 lit=cabinet|screen|buttons|keypad|card|receipt|notes|hood",
    demo: { line: "cashmachine 480 515 3 on=1 show=welcome card=1 notes=0 count=5 amt=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { card: 0, lit: "card" }, hold: 0.8 }, { set: { card: 1, show: "pin" }, hold: "settle" }, { set: { show: "menu", lit: "buttons" }, hold: 1.4 }, { set: { show: "cash", amt: 60, lit: "keypad" }, hold: 1.4 },
      { set: { show: "done", notes: 1, count: 3, lit: "notes" }, hold: "settle" }, { set: { card: 0, lit: "hood" }, hold: "settle" }, { set: { notes: 0, card: 1, show: "welcome", amt: 0, lit: "screen" }, hold: "settle" }, { set: { on: 0, lit: "cabinet" }, hold: 1 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { on: o.on !== "0", show: SHOWS.includes(o.show) ? o.show : "welcome", amt: Math.round(B.num(o, "amt", 0, 0, 9999)), card: B.num(o, "card", 1, 0, 1), notes: B.num(o, "notes", 0, 0, 1), count: Math.round(B.num(o, "count", 5, 0, 10)), lit: o.lit || "" };
      st.cWant = st.card; st.nWant = st.notes; st.sh = st.notes > 0 ? 1 : 0; st.b = st.on ? 1 : 0;
      const box = (x, y, z, c, tone = "mid") => TE.box(P, x, y, z, tone, c);
      const fq = (x0, x1, z0, z1, y, fill, stroke = "none", sw = 0.6) => TE.quad(P, [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], fill, stroke, sw);
      // plinth, safe (with its service door, hinge pins and a vent), upper housing
      const cabinet = box([-HX + 1, HX - 1], [YB + 2, YS - 1], [0, 8], ISO.T.plastic, "lo") + box([-HX, HX], [YB, YS], [8, 95], STEEL) +
        `<path d="${K.pathOf([[-HX + 4, YS + 0.02, 12], [HX - 4, YS + 0.02, 12], [HX - 4, YS + 0.02, 78], [-HX + 4, YS + 0.02, 78]].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#6a6f76" stroke-width="0.9"/>` +
        TE.dot(P, [[-HX + 4, YS + 0.03, 20], [-HX + 4, YS + 0.03, 70]], 0.7, "lo") + fq(HX - 10, HX - 7, 40, 50, YS + 0.03, "#8e939a", "#3c4047") +
        `<path data-free d="${[0, 1, 2, 3, 4, 5].map((i) => K.pathOf([[-12, YS + 0.03, 20 + i * 1.6], [12, YS + 0.03, 20 + i * 1.6]].map((p) => K.iso(p, P)))).join("")}" stroke="#555a61" stroke-width="${Math.max(0.6, k * 0.4).toFixed(2)}" stroke-linecap="round"/>` +
        box([-HX, HX], [YB, YF], [95, 150], SILVER) + fq(-HX + 3, HX - 3, 101, 149, YF + 0.02, "#4a4f57", "#22252a");
      // the sign on top: a blue lit box with CASH on its front
      const sign = box([-HX, HX], [YF - 10, YF + 1], [150, 160], SIGN) + B.face(P, [0, YF + 1.03, 152.2], [1, 0, 0], [0, 0, 1], "CASH", 7, "#ffffff", { weight: 800 });
      // the console: a block sloped up toward the fascia, its top a steel panel
      const outline = [[YF, 95], [YC, 95], [YC, zs(YC)], [YF, zs(YF)]];
      const console = ISO.prismX(P, outline, -HX + 1, HX - 1, ["#8e939a", "#cbced2"], "#b8bcc1", "#3c4047");
      // the keypad: a steel plate and 16 raised keys, labels printed on them
      const at = (u, w, v) => [u, v, zs(v) + w], UP = (() => { const s = 4 / (YC - YF), l = Math.hypot(1, s); return [0, -1 / l, s / l]; })();
      const KEYS = [["1", "", "d"], ["2", "", "d"], ["3", "", "d"], ["CANCEL", "", "r"], ["4", "", "d"], ["5", "", "d"], ["6", "", "d"], ["CLEAR", "", "y"], ["7", "", "d"], ["8", "", "d"], ["9", "", "d"], ["ENTER", "", "g"], ["", "", "d"], ["0", "", "d"], ["", "", "d"], ["", "", "d"]];
      const KT = { d: STEEL, r: ISO.T.red, y: ISO.T.amber, g: ISO.T.green };
      const keys = [TE.obox(P, at, [-10, 10], [0, 0.4], [24.6, 34.2], "lo", ISO.T.steel)];
      KEYS.forEach(([txt, , c], i) => {
        const col = i % 4, row = (i / 4) | 0, x = -6.9 + col * 4.4 + (col === 3 ? 0.4 : 0), y = 25.9 + row * 2.2, wdt = col === 3 ? 4.2 : 3.4;
        keys.push(TE.obox(P, at, [x - wdt / 2, x + wdt / 2], [0.4, 1], [y - 0.8, y + 0.8], "mid", KT[c]));
        if (txt) keys.push(B.face(P, at(x, 1.01, y + 0.42), [1, 0, 0], UP, txt, txt.length > 1 ? 0.75 : 1.2, c === "d" ? "#26292e" : "#2a1a10"));
      });
      // the screen's bezel and four side buttons each side, the privacy hood (wings and canopy)
      const bez = fq(-SX - 1.2, SX + 1.2, SZ0 - 1.2, SZ1 + 1.2, YF + 0.04, "#1b1e22", "#0b0c0e");
      const btn = (x) => BZ.map((z) => box([x - 1.2, x + 1.2], [YF, YF + 0.9], [z - 1, z + 1], STEEL) + fq(x - 0.9, x + 0.9, z - 0.15, z + 0.15, YF + 0.92, "#5a5f66")).join("");
      const wing = (x) => TE.plate(P, [[x - 0.8, YF], [x + 0.8, YF], [x + 0.8, YF + 9], [x - 0.8, YF + 11]], 108, 150, "mid", PANEL);
      const canopy = box([-25.8, 25.8], [YF, YF + 11], [147.5, 150], PANEL);
      // the card reader (right, below the hood): a bezel with the slot, a light round it; the receipt slot (left)
      const reader = box([14, 22], [YF, YF + 3.2], [104, 110], ISO.T.plastic) + fq(15.2, 20.8, 106.4, 107, YF + 3.22, "#0b0c0e") +
        `<path data-part="light" d="${K.pathOf([[15, YF + 3.23, 106], [21, YF + 3.23, 106], [21, YF + 3.23, 107.4], [15, YF + 3.23, 107.4]].map((p) => K.iso(p, P)), true)}" fill="none" stroke="#3cc45a" stroke-width="${Math.max(0.8, k * 0.35).toFixed(2)}"/>` +
        fq(14.6, 21.4, 108.2, 109.2, YF + 3.22, "#2a2c31") + B.face(P, [18, YF + 3.23, 108.45], [1, 0, 0], [0, 0, 1], "CARD", 0.8, "#c9ccd1");
      const receipt = box([-22, -14], [YF, YF + 1.6], [104.5, 108.5], ISO.T.plastic) + fq(-21, -15, 106.1, 106.6, YF + 1.62, "#0b0c0e") + B.face(P, [-18, YF + 1.63, 107], [1, 0, 0], [0, 0, 1], "RECEIPT", 0.75, "#c9ccd1");
      // the note slot in the safe's face: a recess, its frame, the label
      const NX = 9, NZ0 = 84, NZ1 = 89;
      const slot = box([-NX - 1.5, NX + 1.5], [YS, YS + 1.2], [NZ0 - 1.5, NZ1 + 1.5], ISO.T.plastic) + fq(-NX, NX, NZ0, NZ1, YS + 1.22, "#0b0c0e") + B.face(P, [0, YS + 1.23, NZ0 - 1.1], [1, 0, 0], [0, 0, 1], "TAKE CASH HERE", 0.8, "#c9ccd1");
      const id = `b40c${B.uid = (B.uid || 0) + 1}`;
      const screen = TE.flat(P, [-SX, YF + 0.06, SZ1], [1, 0, 0], [0, 0, -1], `<clipPath id="${id}"><rect width="${SW}" height="${SH}"/></clipPath><g clip-path="url(#${id})"><g data-part="page"></g><rect data-part="dark" width="${SW}" height="${SH}" fill="#0a0d11"/><path d="M${SW * 0.55} 0H${SW * 0.72}L${SW * 0.4} ${SH}H${SW * 0.23}Z" fill="#ffffff" fill-opacity=".06"/></g>`);
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf({ x: -HX, y: YB, w: 2 * HX, d: YC - YB, r: 2 }, 0, 0.02, P)}"/>` +
        `<g data-name="cabinet">${cabinet}${sign}</g><g data-name="hood">${wing(-25)}</g><g data-name="screen">${bez}${screen}</g><g data-name="buttons">${btn(-18.2)}${btn(18.2)}</g>` +
        `<g data-name="hood">${wing(25)}${canopy}</g><g data-name="receipt">${receipt}</g><g data-name="card">${reader}<g data-part="card"></g></g>` +
        `<g data-name="cabinet">${console}</g><g data-name="keypad">${keys.join("")}</g><g data-name="notes">${slot}<g data-part="notes"></g></g><g data-part="words"></g>`;
      g.anchors = { card: [18, YF + 3.2, 106.7], notes: [0, YS + 1.2, (NZ0 + NZ1) / 2], keypad: [0, 29.4, zs(29.4) + 1], screen: [0, YF, (SZ0 + SZ1) / 2] };
      const el = LAB.parts(g), w = ISO.writer();
      if (lab) el.words.innerHTML = ISO.word(K.iso([-HX, YF - 10, 162], P), "cash machine", "#556", { size: 13, anchor: "end" });
      // the card, sticking out of the slot by (1 − card) of its length, face up, a plain card with its stripe
      const cardSvg = (c) => {
        const out = 8.56 * (1 - c);
        if (out < 0.05) return "";
        const y0 = YF + 3.2, y1 = y0 + out;
        return TE.box(P, [15.3, 20.7], [y0, y1], [106.6, 106.68], "mid", ISO.tint("#4b7fc0", ["#1c3a63", "#2f5f9e", "#2f5f9e", "#4b7fc0"], "#1c3a63")) +
          (out > 2 ? TE.quad(P, [[17.5, y1 - 2, 106.69], [18.6, y1 - 2, 106.69], [16.6, y1, 106.69], [15.5, y1, 106.69]], "#7fa6d8") : "");
      };
      // the shutter and the notes: the shutter slides down out of the way, then the bundle slides out along +y
      const notesSvg = (sh, n, count) => {
        const s = [], out = 6 * n;
        if (sh < 0.999) { const top = NZ1 - (NZ1 - NZ0) * sh; s.push(fq(-NX, NX, NZ0, Math.max(NZ0 + 0.01, top), YS + 1.24, "#8e939a", "#3c4047", 0.6)); }
        if (out > 0.05 && count > 0) for (let i = 0; i < count; i++) {
          const z = NZ0 + 1.2 + i * 0.16, dx = ((i * 37) % 5) * 0.12 - 0.24, cid = `${id}n${i}`;
          s.push(TE.flat(P, [-7 + dx, YS + 1.2 + out - 7 - (count - 1 - i) * 0.35, z], [1, 0, 0], [0, 1, 0], `<clipPath id="${cid}"><rect y="${(7 - out).toFixed(2)}" width="14" height="${out.toFixed(2)}"/></clipPath><g clip-path="url(#${cid})">${B.note(14, 7, "20", ["green", "blue", "violet", "amber"][i % 4])}</g>`));
        }
        return s.join("");
      };
      const draw = () => {
        w.rebuild(el.page, `${st.show} ${st.amt}`, () => page(B, st.show, st.amt));
        w.attr(el.dark, "fill-opacity", (1 - st.b).toFixed(2));
        const lit = st.on && (st.card < 0.999 || st.show === "welcome");
        w.attr(el.light, "stroke", lit ? "#3cc45a" : "#2a4a30");
        const cq = Math.round(st.card * 60) / 60;
        w.rebuild(el.card, `${cq}`, () => cardSvg(cq));
        const nq = Math.round(st.notes * 40) / 40, sq = Math.round(st.sh * 20) / 20;
        w.rebuild(el.notes, `${nq} ${sq} ${st.count}`, () => notesSvg(sq, nq, st.count));
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) st.on = !!+p.on;
        if (p.show !== undefined && SHOWS.includes(p.show)) st.show = p.show;
        if (p.amt !== undefined) st.amt = Math.round(ISO.clamp(+p.amt, 0, 9999));
        if (p.card !== undefined) st.cWant = ISO.clamp(+p.card, 0, 1);
        if (p.notes !== undefined) st.nWant = ISO.clamp(+p.notes, 0, 1);
        if (p.count !== undefined) st.count = Math.round(ISO.clamp(+p.count, 0, 10));
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the card is drawn in (or pushed out) by the reader's rollers at a steady pace; the shutter opens before the
      // notes come out and shuts after they go back; the card light is green while the slot waits for a card
      g.update = (dt) => {
        const calm = ISO.still(), step = (x, to, rate) => (calm ? to : x + Math.sign(to - x) * Math.min(Math.abs(to - x), dt * rate));
        st.card = step(st.card, st.cWant, 1.4);
        const shWant = st.nWant > 0 || st.notes > 0.001 ? 1 : 0;
        st.sh = step(st.sh, shWant, 2.5);
        st.notes = st.sh >= 1 || st.nWant < st.notes ? step(st.notes, st.nWant, 0.8) : st.notes;
        const bw = st.on ? 1 : 0;
        st.b = ISO.follow(st.b, bw, dt, 0.15, calm); if (Math.abs(st.b - bw) < 0.01) st.b = bw;
        draw();
        return st.card !== st.cWant || st.notes !== st.nWant || st.sh !== shWant || st.b !== bw;
      };
      g.readout = () => `cash machine · ${st.on ? `screen: ${st.show}${st.show === "cash" || st.show === "done" ? ` ${st.amt}` : ""}` : "off"} · card ${st.cWant >= 1 ? "taken in" : "in the slot"} · ${st.nWant > 0 ? `${st.count} notes out` : "shutter shut"}`;
      draw();
      return g;
    },
  });
})();
