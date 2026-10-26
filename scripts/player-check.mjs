// Drives the real player (public/player, served as static files) in a headless browser. No Next server, no database.
//   node scripts/player-check.mjs lazy [cat,…]   the lazy library (lib/wb-load.js lazy=1): every catalogue example
//                                               builds from its own category alone exactly when it builds with all of them
//   node scripts/player-check.mjs iso [name,…]  every Anatomy recipe (lib/iso): loaded on demand, drawn as a poster at
//                                               its demo line and in a box=, its demo's set steps run, no page errors
//   node scripts/player-check.mjs lite           Lite mode, the frame watch, freed shader contexts, phone-size labels
//   node scripts/player-check.mjs attack [name,…] markup and quotes in every option and text never run or reach the board
//   --browser webkit                             the same in WebKit (Safari, iPhone)
// Exits 1 on any failure.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from '@playwright/test';

// PLAYER_ROOT=<dir holding player/>: check a shipped copy (scripts/ship-player.mjs --out <dir>/player), where lib/iso is lib/k
const root = process.env.PLAYER_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const ISO_DIR = fs.existsSync(path.join(root, 'player', 'lib', 'iso')) ? 'iso' : 'k';
const [mode = 'iso', only] = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--browser');
if (!['lazy', 'iso', 'lite', 'attack'].includes(mode)) { console.error(`unknown mode "${mode}" (lazy, iso, lite, attack): nothing was checked`); process.exit(1); }   // "iso --browser webkit" as ONE argument once checked nothing and said all ok
const engine = process.argv.includes('--browser') && process.argv[process.argv.indexOf('--browser') + 1] === 'webkit' ? webkit : chromium;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = `http://localhost:${server.address().port}/player/index.html`;
const browser = await engine.launch();
const fails = [];
// a fresh page (the player keeps what it has loaded); its page errors are collected into errs
async function open(query) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } }), errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  await page.goto(base + query); await page.waitForFunction(() => 'RECIPES' in window);
  return { page, errs };
}

if (mode === 'lazy') {
  const P = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib', 'generation', 'prompts.json'), 'utf8'));
  const cats = P.wbLib.filter(c => !c.cat.startsWith('servier') && (!only || only.split(',').includes(c.cat)));
  // Builds each example line into its own board; returns the lines that threw, with the error.
  const tryAll = (page, lines) => page.evaluate(lines => lines.map(line => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); document.body.append(s);
    try { const { type, n, o, content } = parse(line); if (!RECIPES[type]) return [line, 'not loaded']; RECIPES[type](n, o, content, s); return null; }
    catch (e) { return [line, String(e.message).slice(0, 100)]; } finally { s.remove(); }
  }).filter(Boolean), lines);
  const eager = await open('');
  for (const c of cats) {
    const lines = c.lines.map(l => l.example.split(' | ')[0] === l.example ? l.example : l.example);
    const before = new Map((await tryAll(eager.page, lines)).map(([l, e]) => [l, e]));
    const { page, errs } = await open('?lazy=1');
    // its own category after the ones it draws from (lib/wb-index.js WB_DEPS), as bridge.js needLib loads them
    await page.evaluate(async cat => {
      const one = c => new Promise(done => { const s = document.createElement('script'); s.src = `lib/wb/${c}.js`; s.onload = s.onerror = done; document.head.append(s); });
      const seen = new Set(), walk = async c => { if (seen.has(c)) return; seen.add(c); for (const d of WB_DEPS[c] || []) await walk(d); await one(c); };
      await walk(cat);
    }, c.cat);
    const after = await tryAll(page, lines), worse = after.filter(([l]) => !before.has(l));
    if (worse.length || errs.length) fails.push(`${c.cat}: ${worse.length} lines fail only when lazy (${worse.slice(0, 3).map(x => x.join(' → ')).join(' · ')}) ${errs.slice(0, 2).join(' · ')}`);
    console.log(`${worse.length || errs.length ? 'FAIL' : 'ok  '} ${c.cat.padEnd(12)} ${lines.length} examples${before.size ? ` (${before.size} fail eagerly too, left as they are)` : ''}`);
    await page.close();
  }
}

if (mode === 'iso') {
  global.window = {};
  await import(path.join(root, 'player', 'lib', ISO_DIR, 'manifest.js'));
  const M = global.window.ISO_MANIFEST;
  const names = only ? only.split(',') : Object.keys(M.recipes);
  const { page, errs } = await open('?lazy=1');
  // the demo lines and set steps come from the recipes themselves, once their files are loaded
  for (const name of names) {
    errs.length = 0;
    const r = await page.evaluate(async name => {
      const poster = script => new Promise(done => {
        const on = e => { if (e.data?.type === 'posterDone' || e.data?.type === 'error') { removeEventListener('message', on); done(e.data); } };
        addEventListener('message', on); postMessage({ type: 'poster', script }, '*');
      });
      // first a bare line, so the files load; then the recipe's real demo line, in a box, with its set steps
      let m = await poster({ q: 't', els: { x: `${name}Iso` }, steps: [{ say: '', do: ['draw x'] }] });
      if (m.type === 'error') return { error: m.message };
      if (!self.ISO?.all[name]) return { error: 'not loaded' };
      const R = ISO.all[name], line = R.demo.line.replace(/^\S+/, `${name}Iso`);
      const sets = R.demo.script.map(s => s.set).filter(s => s && Object.keys(s).length).map(s => `set x ${Object.entries(s).map(([k, v]) => `${k}=${v}`).join(' ')}`);
      const out = {};
      const boxed = line.includes('|') ? line.replace(/\s*\|/, ' box=520,40,400,300 |') : `${line} box=520,40,400,300`;   // box= before any "| text"
      for (const [k, spec] of [['line', line], ['box', boxed]]) {
        m = await poster({ q: 't', els: { t: 'tag 150 60 200 44 s=20 | 1. Look', x: spec }, steps: [{ say: '', do: ['draw t', 'draw x', ...sets] }] });
        if (m.type === 'error') return { error: `${k}: ${m.message}` };
        const x = [...document.querySelectorAll('#scene > g')].find(g => g.iso);
        if (!x) return { error: `${k}: no recipe group on the board` };
        x.querySelectorAll('[data-fx]').forEach(f => f.style.display = 'none');
        // a recipe that clips its own view (g.box) is measured by that box: a client rect counts what the clip hides
        const own = x.iso.box && (() => { const [bx, by, bw, bh] = x.iso.box, M = x.iso.parentNode.getScreenCTM(), p = new DOMPoint(bx, by).matrixTransform(M), q = new DOMPoint(bx + bw, by + bh).matrixTransform(M); return { left: p.x, top: p.y, width: q.x - p.x, height: q.y - p.y }; })();
        const b = own || x.getBoundingClientRect(), board = document.querySelector('svg').getBoundingClientRect(), shown = x.style.opacity === '1' && [...x.iso.children].every(p => !p.style.opacity || p.style.opacity === '1');
        out[k] = { w: Math.round(b.width / board.width * 960), h: Math.round(b.height / board.width * 960), x: Math.round((b.left - board.left) / board.width * 960), y: Math.round((b.top - board.top) / board.width * 960), shown };
      }
      return out;
    }, name).catch(e => ({ error: String(e.message).slice(0, 160) }));
    // circular's demo cuts the line (cut=1): the bung flies off along the circle, out of any box, on purpose
    const inBox = name === 'circular' || (r.box && r.box.x >= 515 && r.box.y >= 35 && r.box.x + r.box.w <= 925 && r.box.y + r.box.h <= 345);
    // drawn and not blank: a thin thing (a thermometer) is tall, not wide
    const bad = r.error || errs.length || !r.line?.shown || !r.box?.shown || !(Math.max(r.line.w, r.line.h) > 20 && Math.min(r.line.w, r.line.h) > 3) || !inBox;
    if (bad) fails.push(`${name}: ${r.error || ''} ${errs.slice(0, 2).join(' · ')} ${JSON.stringify(r)}`);
    console.log(`${bad ? 'FAIL' : 'ok  '} ${name.padEnd(14)} ${r.error || `line ${r.line.w}×${r.line.h} · box ${r.box.w}×${r.box.h} at ${r.box.x},${r.box.y}`}${errs.length ? ' · ' + errs[0] : ''}`);
  }
}

// An attack on the player (the server cleans first; this is the player on its own): markup and quotes in every option
// of a recipe and in its text must never run or reach the board as markup.
if (mode === 'attack') {
  global.window = {};
  await import(path.join(root, 'player', 'lib', ISO_DIR, 'manifest.js'));
  const names = only ? only.split(',') : Object.keys(global.window.ISO_MANIFEST.recipes);
  const { page, errs } = await open('?lazy=1');
  const BAD = ['"><img src=x onerror="window.__pwn=1">', "'><svg onload=window.__pwn=1>", '</text><script>window.__pwn=1</script>', 'javascript:window.__pwn=1'];
  for (const name of names) {
    const r = await page.evaluate(async ([name, BAD]) => {
      const poster = script => new Promise(done => { const on = e => { if (e.data?.type === 'posterDone' || e.data?.type === 'error') { removeEventListener('message', on); done(e.data); } }; addEventListener('message', on); postMessage({ type: 'poster', script }, '*'); });
      await poster({ q: 't', els: { x: `${name}Iso` }, steps: [{ say: '', do: ['draw x'] }] });
      const keys = [...(ISO.all[name]?.line || '').matchAll(/\b([a-z][a-z0-9]*)=/g)].map(m => m[1]);
      let worst = '';
      for (const bad of BAD) {
        const opts = keys.map(k => `${k}=${bad.replace(/\s/g, '')}`).join(' ');
        const m = await poster({ q: 't', els: { x: `${name}Iso 480 270 300 ${opts} | ${bad}` }, steps: [{ say: '', do: ['draw x', `set x ${opts}`] }] });
        const board = document.getElementById('scene');
        if (window.__pwn) return { bad: 'script ran: ' + bad };
        if (board.querySelector('img, script, foreignObject [onerror], [onload], [onerror]')) return { bad: 'markup on the board: ' + bad };
        if (m.type === 'error') worst = m.message;          // a refused value may stop a board; it must not run anything
      }
      return { ok: true, worst };
    }, [name, BAD]).catch(e => ({ bad: String(e.message).slice(0, 120) }));
    if (r.bad) fails.push(`${name}: ${r.bad}`);
    console.log(`${r.bad ? 'FAIL' : 'ok  '} ${name.padEnd(14)} ${r.bad || (r.worst ? 'refused: ' + r.worst.slice(0, 80) : 'drew with the junk dropped')}`);
  }
  if (errs.some(e => /pwn/.test(e))) fails.push('page error mentions the payload: ' + errs.join(' · '));
}

// Lite mode and the board's upkeep (ARCHITECTURE.md §B–D): a weak device starts in Lite (no shader layers, end poses),
// a slow board drops to Lite by itself, a cleared board frees its shader contexts, labels grow on a phone-wide board.
if (mode === 'lite') {
  const poster = (page, els, cmds) => page.evaluate(([els, cmds]) => new Promise(done => {
    const on = e => { if (e.data?.type === 'posterDone' || e.data?.type === 'error') { removeEventListener('message', on); done(e.data); } };
    addEventListener('message', on); postMessage({ type: 'poster', script: { q: 't', els, steps: [{ say: '', do: cmds }] } }, '*');
  }), [els, cmds]);
  const expectThat = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) fails.push(what); };
  {   // 1 GB of memory: Lite from the start
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
    await page.addInitScript(() => Object.defineProperty(navigator, 'deviceMemory', { get: () => 1 }));
    await page.goto(base + '?lazy=1'); await page.waitForFunction(() => 'RECIPES' in window);
    const m = await poster(page, { b: 'bunsenIso 480 270 300 k=blue' }, ['draw b']);
    const r = await page.evaluate(() => ({ lite: document.getElementById('scene').classList.contains('lite'), fx: document.querySelectorAll('[data-fx]').length, hold: ISO.hold() }));
    expectThat(m.type === 'posterDone' && r.lite && r.fx === 0 && r.hold, `a 1 GB phone draws in Lite: no shader layer, end poses (${JSON.stringify(r)})`);
    await page.close();
  }
  {   // a full device: shader layers, then a new board frees the old one's contexts
    const { page } = await open('?lazy=1');
    await poster(page, { b: 'bunsenIso 300 270 260 k=blue', k: 'kettleIso 700 270 260 on=1' }, ['draw b', 'draw k']);
    const before = await page.evaluate(() => ({ live: ISO.glLive.size, lite: document.getElementById('scene').classList.contains('lite') }));
    await poster(page, { l: 'leverIso 480 270 300' }, ['draw l']);
    const after = await page.evaluate(() => ISO.glLive.size);
    // WebKit draws the effects in SVG (index.html WEBKIT): no layers there
    if (engine === webkit) expectThat(!before.lite && before.live === 0, `WebKit: no shader layers, the SVG effects instead (${before.live})`);
    else expectThat(!before.lite && before.live >= 1 && after === 0, `shader layers on a full device (${before.live}), freed when the board is cleared (${after} left)`);
    await page.close();
  }
  // the frame watch: a board at full speed stays Full; with the CPU slowed 30× it drops to Lite within its first 2 s
  if (engine === chromium) for (const rate of [1, 30]) {
    const { page } = await open('?lazy=1');
    const cdp = await page.context().newCDPSession(page);
    await poster(page, { c: 'cprIso 480 280 320', h: 'handwashIso 200 260 200' }, ['draw c', 'draw h']);   // files loaded first
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await page.evaluate(() => { postMessage({ type: 'els', els: { c: 'cprIso 480 280 320 run=1', h: 'handwashIso 200 260 200 run=1' } }, '*');
      postMessage({ type: 'step', step: { say: 'Step 1: push.', do: ['draw c', 'draw h', 'set c run=1', 'wait 4000'] } }, '*'); postMessage({ type: 'done' }, '*'); });
    await page.waitForTimeout(rate === 1 ? 4000 : 9000);
    const lite = await page.evaluate(() => document.getElementById('scene').classList.contains('lite'));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    expectThat(rate === 1 ? !lite : lite, rate === 1 ? 'a board at full speed stays in Full mode' : 'a board that runs slow (CPU 30× slower) drops to Lite by itself');
    await page.close();
  }
  {   // a phone-wide board: labels grow and the board is "narrow"
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(base + '?lazy=1'); await page.waitForFunction(() => 'RECIPES' in window);
    await poster(page, { l: 'leverIso 480 270 300' }, ['draw l']);
    const r = await page.evaluate(() => { const s = document.getElementById('scene'), t = s.querySelector('text');
      return { board: +s.style.getPropertyValue('--iso-board'), narrow: s.classList.contains('narrow'), px: t ? t.getBoundingClientRect().height : 0 }; });
    expectThat(r.board > 1.5 && r.narrow && r.px >= 9, `a 390 px phone: labels scaled ${r.board}×, about ${r.px.toFixed(1)} px tall`);
    await page.close();
  }
}

await browser.close(); server.close();
console.log(fails.length ? `\n${fails.length} FAILED:\n${fails.join('\n')}` : '\nall ok');
process.exit(fails.length ? 1 : 0);
