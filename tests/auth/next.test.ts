// Where a sign-up returns to (18 Oct 2026: back to the shared video). `next` is user input carried through query
// strings, forms and a cookie, so only a same-site path may pass: never another host.
import { describe, it, expect } from 'vitest';
import { okNext, signupQuery } from '../../src/lib/age';

describe('okNext', () => {
  it('keeps a same-site path', () => {
    expect(okNext('/v/Sy-OlqfhQWCvVioI2n0LTg')).toBe('/v/Sy-OlqfhQWCvVioI2n0LTg');
    expect(okNext('/ask?x=1')).toBe('/ask?x=1');
  });
  it('refuses anything that leaves the site', () => {
    for (const bad of ['//evil.example', '/\\evil.example', 'https://evil.example', 'evil.example', '', '/', null, undefined, 42, `/${'a'.repeat(200)}`])
      expect(okNext(bad)).toBeNull();
  });
});

describe('signupQuery', () => {
  it('passes a known source and a safe next', () => {
    expect(signupQuery('share', '/v/abc')).toBe('?src=share&next=%2Fv%2Fabc');
  });
  it('drops an unknown source and an unsafe next', () => {
    expect(signupQuery('spam', '//evil.example')).toBe('');
    expect(signupQuery(null, '/v/abc')).toBe('?next=%2Fv%2Fabc');
  });
});
