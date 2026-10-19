// Draws a realistic drawing with all its pins in the real player, for a visual check.
//   node scripts/servier/preview-parts.mjs <out dir> <id> [id ...]   (dev server on :3100)
import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
const [out, ...ids] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1.5 });
p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto('http://localhost:3100/player/index.html'); await p.waitForTimeout(1000);
for (const id of ids) {
  const t = fs.readFileSync(path.join(here, '..', '..', 'public', 'player', 'lib', 'sv', id + '.js'), 'utf8');
  const d = JSON.parse(t.slice(t.indexOf(',') + 1).replace(/\);\s*$/, ''));
  const H = Math.min(470, Math.round(470 * 440 / Math.max(440, d.w * 470 / 1000)));   // fit between the label columns
  const els = { h: `sv id=${id} 480 272 ${H}` }; Object.keys(d.parts || {}).forEach((k, i) => { els['p' + i] = `pin of=h part=${k}`; });
  const err = await p.evaluate(async els => { try { await SV.need([els.h.split('id=')[1].split(' ')[0]]); FAST = true; build({ els, steps: [] });
    for (const k of Object.keys(els)) await run('draw ' + k); await run('fill h'); FAST = false; marker.style.opacity = 0; return null; } catch (e) { return String(e); } }, els);
  if (err) console.log(id, err);
  await p.waitForTimeout(900);
  await p.locator('svg').first().screenshot({ path: path.join(out, `pp-${id}.png`) });
}
await b.close();
