// "deskmonitor cx cy k on=0|1 show=code|page|desktop lab=0 lit=stand|neck|panel|screen" — a PART (batch 6): a 24-inch
// desktop monitor standing on the desk, its origin the desk point under the middle of its stand base, its screen
// facing the room (+y). A rounded aluminium base, the neck, the bracket that holds the panel's back, the panel
// 540 × 330 mm with a thin black bezel and a chin with the power lamp, the screen (530 × 300 mm, 16:9). The screen
// shows one of three fixed pictures with their own built-in words: code (an editor with coloured lines), page (a
// document) or desktop (a window of folders and a task bar); on=0 dark glass. on fades the picture in or out.
// From computer.js (its monitor and screen). Built in mm; anchors in cm.
(() => {
  const K = window.K;
  const SX = 262, SZ0 = 136, SZ1 = 440, FY = 40;   // the screen's half width, its bottom and top, the panel's face
  const SW = 2 * SX, SH = SZ1 - SZ0, SHOWS = ["code", "page", "desktop"];
  let uid = 0;
  // each picture in flat screen units (x right, y down, 1 = 1 mm)
  function picture(show, B, T, id) {
    const s = [], word = (x, y, t, size, c, a = "start", wt = 600) => `<text x="${x}" y="${y}" text-anchor="${a}" fill="${c}" style="font:${wt} ${size}px 'Helvetica Neue',Arial,sans-serif">${B.say(t)}</text>`;
    const bar = (x, y, w, c, h = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${c}"/>`;
    if (show === "code") {
      s.push(`<rect width="${SW}" height="${SH}" fill="#1e2833"/><rect width="${SW}" height="26" fill="#141b22"/><rect x="8" y="4" width="92" height="22" fill="#1e2833"/>`, word(18, 19, "main.py", 12, "#dfe7ee"), word(116, 19, "notes.txt", 12, "#7f8c98"));
      s.push(`<rect y="26" width="34" height="${SH - 46}" fill="#19222b"/><rect y="${SH - 20}" width="${SW}" height="20" fill="#2f6fae"/>`, word(10, SH - 6, "Ready · line 12", 10, "#e6f1fd"));
      for (let i = 0; i < 10; i++) s.push(word(26, 50 + i * 24, String(i + 1), 10, "#5e6b77", "end", 400));
      s.push(T.code(46, 46, SW * 0.72, 10, 24, 6));
    } else if (show === "page") {
      s.push(`<rect width="${SW}" height="${SH}" fill="#e9edf1"/><rect width="${SW}" height="26" fill="#3b4f6b"/>`, word(14, 18, "My notes", 12, "#ffffff"));
      s.push(`<rect x="112" y="40" width="300" height="${SH - 40}" fill="#ffffff" stroke="#c9ced4"/>`, word(132, 78, "Today", 22, "#1f2a36", "start", 700));
      for (let i = 0; i < 8; i++) s.push(bar(132, 98 + i * 20, [250, 236, 258, 180, 248, 222, 256, 140][i], "#b9c0c8"));
    } else {
      s.push(`<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f8fc4"/><stop offset="1" stop-color="#2d5f8a"/></linearGradient></defs><rect width="${SW}" height="${SH}" fill="url(#${id}g)"/>`);
      s.push(`<rect x="110" y="40" width="300" height="196" rx="6" fill="#f4f6f8"/><rect x="110" y="40" width="300" height="24" rx="6" fill="#d9dee4"/>`, word(122, 57, "Files", 12, "#2b3440"));
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const x = 132 + i * 68, y = 82 + j * 74; s.push(`<path d="M${x} ${y + 6}h16l6 6h20v30h-42z" fill="#f0b84a" stroke="#b07c1c"/>`, word(x + 21, y + 54, ["Home", "Music", "School", "Photos", "Work", "Books", "Maths", "Notes"][i + j * 4], 9, "#3b4450", "middle", 500)); }
      s.push(`<rect y="${SH - 24}" width="${SW}" height="24" fill="#1c2733" fill-opacity=".85"/>`);
      for (let i = 0; i < 5; i++) s.push(`<rect x="${SW / 2 - 70 + i * 28}" y="${SH - 19}" width="16" height="14" rx="3" fill="${["#e6f1fd", "#f0b84a", "#7fe08a", "#f7a094", "#7fd0ff"][i]}"/>`);
      s.push(word(SW - 12, SH - 8, "9:41", 10, "#e6f1fd", "end"));
    }
    return s.join("");
  }
  ISO.add({
    name: "deskmonitor", title: "Desktop monitor (part)", compare: null,
    about: "A 24-inch desktop monitor on its stand: base, neck, bracket, the panel with a thin black bezel and a screen showing code, a page or a desktop; on lights the screen. anchors: top screen",
    line: "deskmonitor cx cy k on=0|1 show=code|page|desktop lab=0 lit=stand|neck|panel|screen",
    demo: { line: "deskmonitor 480 450 8 on=0 show=code lab=1", script: [{ set: {}, hold: 1 }, { set: { on: 1 }, hold: 2 }, { set: { show: "page", lit: "screen" }, hold: 2 }, { set: { show: "desktop", lit: "stand" }, hold: 2 }, { set: { on: 0, lit: "panel" }, hold: 2 }] },
    make([cx = 480, cy = 400, k = 3], o, t, parent) {
      const T = window.TECH, B = window.B33, LAB = window.LAB;
      const { P, g } = ISO.part(cx, cy, k, parent, o.flip === "1"), Pm = ISO.mm(P), lab = o.lab === "1";
      const box = (x, y, z, c, tone = "mid") => T.box(Pm, x, y, z, tone, c);
      const base = { x: -120, y: -140, w: 240, d: 180, r: 34 };
      const stand = T.slab(Pm, base, 0, 12, "mid", T.C.alu, 8, 1.5) + T.D([K.iso([0, -50, 12], Pm)], { size: 0.5, tone: "lo" });
      // the neck from the base, the bracket out to the panel's back, a cable clip hole in the neck
      const neck = box([-28, 28], [-62, -38], [12, 340], T.C.alu) + `<path d="${K.pathOf([[-12, 60], [12, 60], [12, 90], [-12, 90]].map(([x, z]) => K.iso([x, -37.95, z], Pm)), true)}" fill="#5a6067" stroke="#3a3f45" stroke-width=".5"/>` +
        box([-60, 60], [-38, -4], [290, 340], T.C.alu);
      // the panel: a back housing, the panel with its bezel, the chin's lamp and a small name-free logo bar
      const panel = box([-200, 200], [-4, 14], [180, 400], T.C.dark) + box([-270, 270], [14, FY], [120, 450], T.C.black) +
        `<path d="${K.pathOf([[-SX - 2, SZ0 - 2], [SX + 2, SZ0 - 2], [SX + 2, SZ1 + 2], [-SX - 2, SZ1 + 2]].map(([x, z]) => K.iso([x, FY + 0.03, z], Pm)), true)}" fill="#0d0f12"/>` +
        `<path d="${B.circle(Pm, [246, FY + 0.05, 127], [1, 0, 0], [0, 0, 1], 1.8, 12)}" data-part="lamp" fill="#5a5f66"/>`;
      const cid = `b33m${uid++}`;
      g.innerHTML = `<path class="iso-halo" d="${K.haloOf(base, 0, 12, Pm)}"/><g data-name="stand">${stand}</g><g data-name="neck">${neck}</g><g data-name="panel">${panel}</g>` +
        `<g data-name="screen">${T.flat(Pm, [-SX, FY + 0.06, SZ1], [1, 0, 0], [0, 0, -1], `<clipPath id="${cid}"><rect width="${SW}" height="${SH}"/></clipPath><g clip-path="url(#${cid})"><g data-part="pic"></g><rect data-part="dark" width="${SW}" height="${SH}" fill="#101317"/><path d="M${SW * 0.55} 0L${SW * 0.75} 0L${SW * 0.35} ${SH}L${SW * 0.15} ${SH}Z" fill="#ffffff" data-part="glare" fill-opacity=".05"/></g>`)}</g><g data-part="words"></g>`;
      if (lab) g.querySelector('[data-part="words"]').innerHTML = LAB.word(Pm, lab, [270, FY, 450], "monitor", "#556", { anchor: "start", dx: 8 });
      g.anchors = { top: [0, 2.7, 45], screen: [0, FY / 10, (SZ0 + SZ1) / 20] };
      const el = LAB.parts(g), w = ISO.writer();
      const st = { on: o.on === "1", show: SHOWS.includes(o.show) ? o.show : "code", lit: o.lit || "" };
      st.b = st.on ? 1 : 0;
      const draw = () => {
        w.rebuild(el.pic, st.show, () => picture(st.show, B, T, cid));
        w.attr(el.dark, "fill-opacity", (1 - st.b).toFixed(2));
        w.attr(el.glare, "fill-opacity", (0.07 - st.b * 0.05).toFixed(3));
        w.attr(el.lamp, "fill", st.on ? T.LED.blue : T.LED.off);
        LAB.light(w, g, st.lit);
      };
      g.set = (p) => {
        if (p.on !== undefined) st.on = !!+p.on;
        if (p.show !== undefined && SHOWS.includes(p.show)) st.show = p.show;
        if (p.lit !== undefined) st.lit = p.lit;
      };
      // the backlight comes up (or goes down) over about half a second
      g.update = (dt) => {
        const want = st.on ? 1 : 0;
        st.b = ISO.follow(st.b, want, dt, 0.15, ISO.still()); if (Math.abs(st.b - want) < 0.01) st.b = want;
        draw();
        return st.b !== want;
      };
      g.readout = () => `24-inch monitor · ${st.on ? `on, showing ${st.show === "code" ? "code in an editor" : st.show === "page" ? "a document" : "the desktop"}` : "off"}`;
      draw();
      return g;
    },
  });
})();
