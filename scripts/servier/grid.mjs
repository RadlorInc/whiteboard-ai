// Grid pictures of realistic drawings, for choosing part points by eye (scripts/servier/parts).
//   node scripts/servier/grid.mjs <out dir> <id> [id ...]   -> <out>/<id>.png, the drawing on a 0..1000-tall grid (every 50)
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const [out, ...ids] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname), sv = path.join(here, '..', '..', 'public', 'player', 'lib', 'sv');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
for (const id of ids) {
  const d = JSON.parse(fs.readFileSync(path.join(sv, id + '.js'), 'utf8').replace(/^SV\.add\("[^"]+",/, '').replace(/\);\s*$/, ''));
  const shapes = d.shapes.map(s => `<path d="${s[0]}" fill="${s[1]}"${s[2] < 1 ? ` opacity="${s[2]}"` : ''}${s[3] ? ` stroke="${s[3]}" stroke-width="${s[4]}"` : ''}/>`).join('');
  let grid = '';
  for (let x = 0; x <= d.w + 50; x += 50) grid += `<path d="M${x} -30V1030" stroke="${x % 100 ? '#9c9' : '#2a2'}" stroke-width="${x % 100 ? 1 : 2}" opacity=".55"/>` + (x % 100 ? '' : `<text x="${x + 3}" y="-8" font-size="22" fill="#060">${x}</text>`);
  for (let y = 0; y <= 1000; y += 50) grid += `<path d="M-60 ${y}H${d.w + 30}" stroke="${y % 100 ? '#9c9' : '#2a2'}" stroke-width="${y % 100 ? 1 : 2}" opacity=".55"/>` + (y % 100 ? '' : `<text x="-58" y="${y + 7}" font-size="22" fill="#060">${y}</text>`);
  const W = d.w + 100, scale = Math.min(1150 / W, 860 / 1080);
  await p.setContent(`<body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-70 -40 ${W} 1080" width="${W * scale}" height="${1080 * scale}">${shapes}${grid}</svg></body>`);
  await p.locator('svg').screenshot({ path: path.join(out, id + '.png') });
}
await b.close();
