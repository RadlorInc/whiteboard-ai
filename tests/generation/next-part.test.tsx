// The Part 2 button (founder, 26 Oct 2026): it shows the next part's name and that it is a new video.
import { it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextPart } from '../../src/components/Watch';

it('the next-part button names the part and says it uses a video; its text is escaped', () => {
  const html = renderToStaticMarkup(<NextPart next={'Part 2: using the equation <b>now</b>'} onNext={() => {}} />);
  expect(html).toMatch(/<button[^>]*type="button"[^>]*>.*Part 2: using the equation &lt;b&gt;now&lt;\/b&gt;<\/button>/);
  expect(html).toContain('Uses 1 video');
});
