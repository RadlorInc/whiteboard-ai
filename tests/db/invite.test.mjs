// Invites through the API the app uses (the user's own session calls redeem_invite): access, and since the free tier
// (20 Oct 2026; 22 Oct: first 20 free once) no credits. pgTAP (35_invite_credits) covers the edge cases; this drives the real caller.
import { describe, expect, test } from 'vitest';
import { balance, drift, newUser, sql, stack } from './stack.mjs';

describe('invites', () => {
  test('redeeming an invite as the user gives access and no credits, and a second code gives none either', { timeout: 60_000 }, async () => {
    const u = await newUser('invite', { invite: true });
    expect(await balance(u.id)).toBe('0/0/0');
    await sql(`insert into public.invites (code, max_uses, note) values ('NODE-SECOND-${u.id.slice(0, 8)}', 1, 'node test');`);
    const again = await stack().as(u.token).rpc('redeem_invite', { p_code: `NODE-SECOND-${u.id.slice(0, 8)}` });
    expect(again.data).toBe(true);
    expect(await balance(u.id)).toBe('0/0/0');
    expect(await drift()).toEqual([]);
  });
});
