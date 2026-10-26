// The deploy ships public/player through scripts/ship-player.mjs: no comments, no prompt catalogues, neutral folders,
// and nothing that tells how a video is made (founder, 26 Oct 2026).
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('the shipped player', () => {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ship-')), 'player');
  execFileSync('node', ['scripts/ship-player.mjs', '--out', out], { stdio: 'pipe' });
  const all = fs.readdirSync(out, { recursive: true }) as string[];
  it('has no catalogue files, the neutral folders, and the dev examples emptied', () => {
    expect(all.filter(f => f.endsWith('.txt'))).toEqual([]);
    expect(fs.existsSync(path.join(out, 'lib', 'k', 'manifest.js')) && !fs.existsSync(path.join(out, 'lib', 'iso'))).toBe(true);
    expect(fs.readFileSync(path.join(out, 'answers.js'), 'utf8').trim()).toBe('window.ANSWERS = [];');
  });
  it('the pages and the loaders carry no comments, no old folder names and no prototype ask bar', () => {
    for (const f of ['index.html', 'matchcut.html', 'stopmotion-topics.html', 'bridge.js', 'recipes.js', 'lib/k/manifest.js']) {
      const t = fs.readFileSync(path.join(out, f), 'utf8');
      expect(t, f).not.toMatch(/^\s*\/\/|\/\*[\s\S]*?\*\/|<!--/m);
      expect(t, f).not.toMatch(/lib\/iso\/|lib\/sv\/|api\/answer|askbar|founder/i);
    }
  });
  it('the source stays as it is (comments and all)', () => {
    expect(fs.readFileSync('public/player/bridge.js', 'utf8')).toMatch(/^\s*\/\//m);
    expect(fs.existsSync('public/player/lib/iso/manifest.js')).toBe(true);
  });
});
