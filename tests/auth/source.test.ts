// Where a new user came from (1 Nov 2026). The channel is user input from a URL and a cookie, so only our own plain
// values may pass, and the app's list must match what the database accepts (or a sign-up would store nothing).
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { SIGNUP_SOURCES, isSource, landingSource, pickSource } from '../../src/lib/source';
import { signupQuery } from '../../src/lib/age';
import { shouldNudge } from '../../src/components/InviteNudge';

const q = (s: string) => new URLSearchParams(s);

describe('landingSource', () => {
  it('takes ?src= or ?utm_source= when it is one of ours, in any case', () => {
    expect(landingSource(q('src=whatsapp'), '/')).toBe('whatsapp');
    expect(landingSource(q('utm_source=LinkedIn'), '/')).toBe('linkedin');
    expect(landingSource(q('src=instagram&utm_source=linkedin'), '/explore')).toBe('instagram');
  });
  it('counts a shared video with no channel as "share", and a channel link over it', () => {
    expect(landingSource(q(''), '/v/abc')).toBe('share');
    expect(landingSource(q('src=whatsapp'), '/v/abc')).toBe('whatsapp');
  });
  it('ignores anything else', () => {
    for (const bad of ['evil', "instagram'--", 'instagram ', '<script>', 'x'.repeat(5000), ''])
      expect(landingSource(q(`src=${encodeURIComponent(bad)}`), '/')).toBeNull();
    expect(landingSource(q(''), '/explore')).toBeNull();
    expect(landingSource(q(''), '/vx')).toBeNull();
  });
});

describe('pickSource', () => {
  it('prefers the form, then the cookie, then a rep link, then a friend link', () => {
    expect(pickSource({ form: 'linkedin', cookie: 'whatsapp', hasRef: true, hasFriend: true })).toBe('linkedin');
    expect(pickSource({ form: 'nope', cookie: 'whatsapp', hasRef: true })).toBe('whatsapp');
    expect(pickSource({ form: null, cookie: 'tampered', hasRef: true, hasFriend: true })).toBe('ref');
    expect(pickSource({ hasFriend: true })).toBe('friend');
    expect(pickSource({})).toBeNull();
  });
  it('never passes a non-string', () => {
    for (const bad of [42, {}, ['whatsapp'], null, undefined]) expect(isSource(bad)).toBe(false);
  });
});

describe('the app list matches the database', () => {
  // The latest migration that sets profiles_signup_source_check holds the database's list.
  const dir = 'supabase/migrations';
  const sql = readdirSync(dir).sort().reverse()
    .map(f => readFileSync(`${dir}/${f}`, 'utf8')).find(s => s.includes('profiles_signup_source_check'))!;
  const lists = [...sql.matchAll(/\(('[a-z]+'(?:,\s*'[a-z]+')*)\)/g)].map(m => m[1].replace(/'|\s/g, '').split(','));
  it('the check and complete_signup() use the same list as SIGNUP_SOURCES', () => {
    const want = [...SIGNUP_SOURCES].sort();
    const found = lists.filter(l => l.includes('tiktok'));
    expect(found.length).toBe(2);
    for (const l of found) expect([...l].sort()).toEqual(want);
  });
  it('keeps the new channels in the sign-up links', () => {
    expect(signupQuery('whatsapp', null)).toBe('?src=whatsapp');
    expect(signupQuery('nope', null)).toBe('');
  });
});

describe('InviteNudge', () => {
  const day = (iso: string) => Date.parse(`${iso}T10:00:00Z`);
  it('shows once a day', () => {
    expect(shouldNudge({}, day('2026-11-01'))).toBe(true);
    expect(shouldNudge({ shown: '2026-11-01' }, day('2026-11-01'))).toBe(false);
    expect(shouldNudge({ shown: '2026-11-01' }, day('2026-11-02'))).toBe(true);
  });
  it('stays away while snoozed', () => {
    expect(shouldNudge({ snoozeUntil: day('2026-11-10') }, day('2026-11-05'))).toBe(false);
    expect(shouldNudge({ snoozeUntil: day('2026-11-10') }, day('2026-11-11'))).toBe(true);
  });
});
