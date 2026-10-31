// The board's hand-drawn filters stay light enough for an iPhone (public/player/recipes.js).
// 22 Oct 2026: a fixed 6000-unit filter region made Safari drop full-size drawings (e2e/player-safari.spec.ts).
// 31 Oct 2026: the watercolour's second, fine-grained noise closed the tab on an iPhone 13 after two boards with
// apples in a row (Radlic staging); one soft noise, measured on the same phone, did not.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const recipes = readFileSync(resolve(process.cwd(), 'public/player/recipes.js'), 'utf8');
const filter = (id: string) => recipes.match(new RegExp(`<filter id="${id}"[\\s\\S]*?</filter>`))?.[0] ?? '';

describe('player filters', () => {
  it('both hand-drawn filters exist (positive control)', () => {
    expect(filter('wc')).toContain('feDisplacementMap');
    expect(filter('rough')).toContain('feDisplacementMap');
  });
  it.each(['wc', 'rough'])('#%s covers its own shape plus a margin, not a fixed user-space square', (id) => {
    expect(filter(id)).not.toMatch(/filterUnits="userSpaceOnUse"/);
  });
  it('#wc makes one noise of one octave (no paper grain)', () => {
    const noises = [...filter('wc').matchAll(/<feTurbulence\b[^>]*>/g)].map((m) => m[0]);
    expect(noises).toHaveLength(1);
    expect(noises[0]).toMatch(/numOctaves="1"/);
  });
});
