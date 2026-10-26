// "stockscreen cx cy k on=0|1 mood=up|down|mixed scroll=0..1 lab=0 lit=bracket|panel|rows|ticker" — a PART (batch 6,
// money): a trading-floor style wall screen on a bracket, its origin the wall point behind the screen's middle, the
// screen facing the room (+y). A steel wall plate with four bolts and two arms hold a 120 × 70 cm panel (5 cm deep)
// with a black bezel. The screen shows a fixed board: the title MARKET WATCH, the columns NAME · PRICE · CHANGE and six
// rows of made-up company names (ALFA BRIX CORA DELT ECHO FERN), each with its price and a green up or red down arrow
// and the % change (the price is the base price moved by that %); below them a ticker strip of the same names that
// scrolls along. mood picks the day: up (all green), down (all red) or mixed. scroll 0 → 1 runs the strip one full
// length; on=0 dark glass. set({ mood, scroll, on }). Generic names and numbers only. World: 1 = 1 cm.
// anchors: screen (the screen's middle) top (the panel's top middle)
(() => {
  const K = window.K;
  const HX = 60, HZ = 35, FY = 8, SX = 57, SZ0 = -33, SZ1 = 32, TZ = -27;   // panel half sizes, face, screen, ticker top
  const SW = 2 * SX, SH = SZ1 - SZ0;
  const NAMES = ["ALFA", "BRIX", "CORA", "DELT", "ECHO", "FERN"], BASE = [42.1, 18.35, 96.4, 7.82, 55.05, 23.6];
  const MOODS = { up: [0.8, 1.2, 0.4, 2.5, 0.9, 1.6], down: [-1.1, -0.6, -2.3, -0.9, -1.8, -0.5], mixed: [0.8, -0.6, 0.4, -0.9, 0.9, -0.5] };
  const UPC = "#3fd06a", DNC = "#ff5a4a";
  const price = (i, m) => (BASE[i] * (1 + MOODS[m][i] / 100)).toFixed(2);
  const pct = (v) => `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}%`;
  const arrow = (x, y, s, up, c) => `<path d="${up ? `M${x - s} ${y + s * 0.6}L${x} ${y - s * 0.7}L${x + s} ${y + s * 0.6}Z` : `M${x - s} ${y - s * 0.6}L${x} ${y + s * 0.7}L${x + s} ${y - s * 0.6}Z`}" fill="${c}"/>`;
  // the board as flat art (x right, y down, 1 = 1 cm) above the ticker strip
  function boardArt(B, m) {
    const s = [`<rect width="${SW}" height="${SZ1 - TZ}" fill="#0c1218"/>`, `<rect width="${SW}" height="7" fill="#16212b"/>`];
    s.push(B.text(3, 5, "MARKET WATCH", 3.6, "#e6edf3", "start", 800), B.text(SW - 3, 5, "LIVE", 2.6, "#ffcf4a", "end", 800));
    s.push(`<circle cx="${SW - 13}" cy="3.9" r="0.9" fill="#ff5a4a"/>`);
    const cols = [4, 64, 104];
    s.push(B.text(cols[0], 11.2, "NAME", 2.4, "#7f93a6", "start"), B.text(cols[1], 11.2, "PRICE", 2.4, "#7f93a6", "end"), B.text(cols[2], 11.2, "CHANGE", 2.4, "#7f93a6", "end"));
    for (let i = 0; i < 6; i++) {
      const y = 13 + i * 7.6, v = MOODS[m][i], up = v > 0, c = up ? UPC : DNC;
      if (i % 2) s.push(`<rect y="${y}" width="${SW}" height="7.6" fill="#121b23"/>`);
      s.push(B.text(cols[0], y + 5.4, NAMES[i], 3.8, "#e6edf3", "start", 800), B.text(cols[1], y + 5.4, price(i, m), 3.8, "#e6edf3", "end", 700, "'Courier New',monospace"));
      s.push(arrow(78, y + 4, 1.6, up, c), B.text(cols[2], y + 5.4, pct(v), 3.8, c, "end", 800, "'Courier New',monospace"));
    }
    return s.join("");
  }
  // the ticker strip: name, price, arrow, change, over and over (two lengths so it can run on without a gap)
  function tickerArt(B, m) {
    const s = [], step = 38;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) {
      const x = r * step * 6 + i * step + 2, v = MOODS[m][i], up = v > 0, c = up ? UPC : DNC;
      s.push(B.text(x, 4.1, NAMES[i], 3.2, "#ffcf4a", "start", 800), B.text(x + 11, 4.1, price(i, m), 3.2, "#e6edf3", "start", 700, "'Courier New',monospace"));
      s.push(arrow(x + 26.5, 2.9, 1.3, up, c), B.text(x + 28.5, 4.1, pct(v), 3.2, c, "start", 700, "'Courier New',monospace"));
    }
    return s.join("");
  }
  ISO.add({
    name: "stockscreen", title: "Market screen (part)", compare: null,
    about: "A trading-floor style wall screen on a bracket: rows of made-up company names with price and a green up or red down arrow, and a scrolling ticker strip; mood picks an up, down or mixed day. anchors: screen top",
    line: "stockscreen cx cy k on=0|1 mood=up|down|mixed scroll=0..1 lab=0 lit=bracket|panel|rows|ticker",
    demo: { line: "stockscreen 480 270 5 on=1 mood=mixed scroll=0 lab=1", script: [{ set: {}, hold: 1 }, { set: { scroll: 0.5, lit: "ticker" }, hold: "settle" }, { set: { mood: "up", lit: "rows" }, hold: 1.4 }, { set: { mood: "down", scroll: 1, lit: "" }, hold: "settle" }, { set: { on: 0, lit: "bracket" }, hold: 1.2 }, { set: { on: 1, mood: "mixed", scroll: 0, lit: "panel" }, hold: "settle" }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const B = window.B40, TE = window.TECH;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), lab = o.lab === "1";
      const st = { on: o.on !== "0", mood: MOODS[o.mood] ? o.mood : "mixed", scroll: B.num(o, "scroll", 0, 0, 1), lit: o.lit || "" };
      st.want = st.scroll; st.b = st.on ? 1 : 0;
      // the bracket: a wall plate with four bolt heads, two square arms out to the panel's back
      const plate = TE.box(P, [-16, 16], [0, 0.6], [-11, 11], "mid", ISO.T.steel) +
        TE.dot(P, [[-13, 0.62, 8], [13, 0.62, 8], [-13, 0.62, -8], [13, 0.62, -8]], 0.6, "lo");
      const arms = [-9, 9].map((x) => TE.box(P, [x - 1.5, x + 1.5], [0.6, 3], [-7, 7], "mid", TE.C.dark)).join("");
      // the panel: a back housing, the bezel box, the screen glass, a thin bar between rows and ticker
      const panel = TE.box(P, [-44, 44], [3, 4.5], [-25, 25], "mid", TE.C.dark) + TE.box(P, [-HX, HX], [4.5, FY], [-HZ, HZ], "mid", TE.C.black) +
        TE.quad(P, [[-SX - 0.5, FY + 0.02, SZ0 - 0.5], [SX + 0.5, FY + 0.02, SZ0 - 0.5], [SX + 0.5, FY + 0.02, SZ1 + 0.5], [-SX - 0.5, FY + 0.02, SZ1 + 0.5]], "#05070a") +
        `<path d="${K.pathOf([[50, FY + 0.03, -34.2], [53, FY + 0.03, -34.2]].map((p) => K.iso(p, P)))}" stroke="#2f8fe8" stroke-width="${Math.max(0.6, k * 0.25).toFixed(2)}" data-part="lamp"/>`;
      const id = `b40s${B.uid = (B.uid || 0) + 1}`, F = (z) => [-SX, FY + 0.05, z];
      const screen = TE.flat(P, F(SZ1), [1, 0, 0], [0, 0, -1], `<clipPath id="${id}a"><rect width="${SW}" height="${SZ1 - TZ}"/></clipPath><g clip-path="url(#${id}a)" data-name="rows" data-part="board"></g>`) +
        TE.flat(P, F(TZ - 0.4), [1, 0, 0], [0, 0, -1], `<clipPath id="${id}b"><rect width="${SW}" height="${TZ - 0.4 - SZ0}"/></clipPath><rect width="${SW}" height="${TZ - 0.4 - SZ0}" fill="#1a1406"/><g clip-path="url(#${id}b)" data-name="ticker"><g data-part="strip"></g></g>`) +
        TE.flat(P, F(SZ1), [1, 0, 0], [0, 0, -1], `<rect data-part="dark" width="${SW}" height="${SH}" fill="#0a0d11"/><path d="M${SW * 0.6} 0H${SW * 0.72}L${SW * 0.5} ${SH}H${SW * 0.38}Z" fill="#ffffff" fill-opacity=".05"/>`);
      g.innerHTML = `<g data-name="bracket">${plate}${arms}</g><g data-name="panel">${panel}</g><g data-name="screen">${screen}</g><g data-part="words"></g>`;
      g.anchors = { screen: [0, FY, (SZ0 + SZ1) / 2], top: [0, (4.5 + FY) / 2, HZ] };
      const el = LAB.parts(g), w = ISO.writer(), LEN = 38 * 6;
      if (lab) el.words.innerHTML = ISO.word(K.iso([HX, FY, HZ + 3], P), "market screen", "#556", { size: 13, anchor: "start" });
      const draw = () => {
        w.rebuild(el.board, st.mood, () => boardArt(B, st.mood));
        w.rebuild(el.strip, st.mood, () => tickerArt(B, st.mood));
        w.attr(el.strip, "transform", `translate(${(-st.scroll * LEN).toFixed(2)} 0)`);
        w.attr(el.dark, "fill-opacity", (1 - st.b).toFixed(2));
        w.attr(el.lamp, "stroke", st.on ? "#2f8fe8" : "#5a5f66");
        B.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) st.on = !!+p.on;
        if (p.mood !== undefined && MOODS[p.mood]) st.mood = p.mood;
        if (p.scroll !== undefined) st.want = ISO.clamp(+p.scroll, 0, 1);
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the strip runs at a steady reading speed (a full length in about 12 s), the backlight fades in half a second
      g.update = (dt) => {
        const calm = ISO.still(), d = st.want - st.scroll;
        st.scroll = calm ? st.want : st.scroll + Math.sign(d) * Math.min(Math.abs(d), dt / 12);
        const bw = st.on ? 1 : 0;
        st.b = ISO.follow(st.b, bw, dt, 0.15, calm); if (Math.abs(st.b - bw) < 0.01) st.b = bw;
        draw();
        return st.scroll !== st.want || st.b !== bw;
      };
      g.readout = () => { const v = MOODS[st.mood], ups = v.filter((x) => x > 0).length; return `market screen · ${st.on ? `${ups} of 6 up, ${6 - ups} down · ticker at ${Math.round(st.want * 100)}%` : "off"}`; };
      draw();
      return g;
    },
  });
})();
