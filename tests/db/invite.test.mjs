// Invite credits through the API the app uses (the user's own session calls redeem_invite): 100 top-up credits,
// once. pgTAP (35_invite_credits) covers the edge cases; this drives the real caller.
import { describe, expect, test } from 'vitest';
import { balance, drift, newUser, sql, stack } from './stack.mjs';

describe('invite credits', () => {
  test('redeeming an invite as the user gives 100 top-up credits, and a second code gives none', { timeout: 60_000 }, async () => {
    const u = await newUser('invite', { invite: true });
    expect(await balance(u.id)).toBe('0/100/0');
    await sql(`insert into public.invites (code, max_uses, note) values ('NODE-SECOND-${u.id.slice(0, 8)}', 1, 'node test');`);
    const again = await stack().as(u.token).rpc('redeem_invite', { p_code: `NODE-SECOND-${u.id.slice(0, 8)}` });
    expect(again.data).toBe(true);
    expect(await balance(u.id)).toBe('0/100/0');
    expect(await drift()).toEqual([]);
  });
});
