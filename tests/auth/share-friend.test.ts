// A shared video's link carries its maker's friend code (2 Nov 2026), in the form the proxy accepts.
import { describe, it, expect } from 'vitest';
import { shareUrl } from '../../src/components/ShareButton';
import { FRIEND_CODE } from '../../src/lib/radlorOps';

describe('shareUrl', () => {
  it('adds the maker friend code the proxy will store', () => {
    const u = new URL(shareUrl('https://www.askradlor.com', 'abc123', '0123456789ab'));
    expect(u.pathname).toBe('/v/abc123');
    expect(FRIEND_CODE.test(u.searchParams.get('friend')!)).toBe(true);
  });
  it('is the plain link without a code', () => {
    expect(shareUrl('https://x.test', 's', null)).toBe('https://x.test/v/s');
    expect(shareUrl('https://x.test', 's')).toBe('https://x.test/v/s');
  });
});
