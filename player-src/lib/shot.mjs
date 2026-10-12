// Render check for a library category:  node lib/shot.mjs wb physics   |  node lib/shot.mjs paper science  |  node lib/shot.mjs mc vehicles
// Writes lib/shots/<style>-<cat>.png and exits 1 if any drawing threw, was empty, or the page logged an error.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const { chromium } = createRequire('/Users/mrk/milo_react/milo-story-mode/package.json')('playwright');
const [style, cat] = process.argv.slice(2); if (!style || !cat) { console.error('usage: node lib/shot.mjs wb|paper|mc <category>'); process.exit(2); }
const root = path.join(import.meta.dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain' };
const srv = http.createServer((q, r) => { if (q.url.startsWith('/api/')) { r.writeHead(204); return r.end(); } const f = path.join(root, decodeURIComponent(new URL(q.url, 'http://x').pathname));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port, b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1960, height: 1000 } }), logs = [];
p.on('pageerror', e => logs.push('pageerror: ' + e.message)); p.on('console', m => m.type() === 'error' && !/favicon|fonts\.g/.test(m.text()) && logs.push('console: ' + m.text()));
const url = { wb: `lib/gallery.html?cat=${cat}`, paper: `stopmotion-topics.html?mode=paper&gallery=${cat}`, mc: `matchcut.html?gallery=${cat}` }[style];
await p.goto(`http://localhost:${port}/${url}`); await p.waitForSelector('body[data-done]', { timeout: 30000 }); await p.waitForTimeout(800);
const errs = await p.evaluate(() => window.ERRS || []);
const out = path.join(root, 'lib', 'shots', `${style}-${cat}.png`);
await (style === 'wb' ? p.locator('#grid') : p.locator('#gallery')).screenshot({ path: out });
await b.close(); srv.close();
const all = [...errs, ...logs]; console.log(all.length ? all.join('\n') : `ok: ${style}/${cat}`, '\n→', out); process.exit(all.length ? 1 : 0);
