// PLAN.md §12.3 concurrency: real concurrent reserve calls cannot double-spend or go negative.
// (a) two raw connections: the second reserve WAITS on the first one's balance-row lock and, after the commit,
//     answers busy (not an error). (b) 20 overlapping reserves on 20 connections with exactly 6 credits: exactly one
//     is reserved, the other 19 are busy, and the balance ends at 0/0/6. The HTTP version (20 parallel
//     POST /api/generate) needs the M3 route.
import { setTimeout as sleep } from 'node:timers/promises';
import { describe, expect, test } from 'vitest';
import { balance, buyPack, drift, newUser, psql, sql, stack } from './stack.mjs';

const reserveSql = (userId) => `select outcome || ':' || coalesce(generation_id::text, '') from public.reserve_generation(`
  + `'${userId}', gen_random_uuid(), 'whiteboard', 'How do magnets work?', 'build-test', 'sha-test', 1::smallint);`;

async function release(id) {
  const r = await stack().admin.rpc('fail_generation', { p_id: id, p_error_code: 'provider_error', p_metrics: null });
  if (r.error || r.data[0].outcome !== 'released') throw new Error(`release: ${JSON.stringify(r)}`);
}

describe('reserve_generation under concurrency', () => {
  test('a second reserve blocks on the balance-row lock, then answers busy', { timeout: 60_000 }, async () => {
    const u = await newUser('conc-a');
    await buyPack(u);
    const c1 = psql();
    const c2 = psql();
    try {
      const [pid1] = await c1.run('select pg_backend_pid();');
      await c1.run('begin; set local role service_role;');
      const [r1] = await c1.run(reserveSql(u.id));
      expect(r1).toMatch(/^reserved:/);
      const id1 = r1.split(':')[1];

      await c2.run("set application_name = 'wb_conc_b'; set role service_role;");
      const second = c2.run(reserveSql(u.id));

      let seen = 'not seen';
      for (let i = 0; i < 100 && seen === 'not seen'; i++) {
        const [w] = await sql(`select coalesce(wait_event_type, '-') || ':' || array_to_string(pg_blocking_pids(pid), ',')
          from pg_stat_activity where application_name = 'wb_conc_b' and state = 'active';`);
        if (w?.startsWith('Lock:')) seen = w;
        else await sleep(50);
      }
      expect(seen).toBe(`Lock:${pid1}`);                      // waiting on connection 1, and only on it

      await c1.run('commit;');
      const [r2] = await second;
      expect(r2).toBe(`busy:${id1}`);                         // not an error, not a second reservation
      await release(id1);
      expect(await balance(u.id)).toBe('0/60/0');
    } finally {
      c1.close();
      c2.close();
    }
    expect(await drift()).toEqual([]);
  });

  test('20 overlapping reserves with 6 available: exactly one reserved, 19 busy, never below 0', { timeout: 60_000 }, async () => {
    const u = await newUser('conc-b');
    await buyPack(u);
    await sql(`select public._ledger('${u.id}', 'forfeit', 0, -54, 0);`);   // fixture: spent 54 of the 60
    expect(await balance(u.id)).toBe('0/6/0');

    // 20 connections, each holding its transaction 200 ms after its reserve returns, so all 20 truly overlap
    // (over HTTP each call commits in ~2 ms and the calls barely overlap: measured, that version passed with the
    // lock removed).
    const sessions = Array.from({ length: 20 }, () => psql());
    try {
      await Promise.all(sessions.map((s) => s.run('set role service_role;')));
      const out = await Promise.all(sessions.map((s) => s.run(`begin; ${reserveSql(u.id)} select pg_sleep(0.2); commit;`)));
      const first = out.map((lines) => lines[0]);
      const reserved = first.filter((r) => r.startsWith('reserved:'));
      const busy = first.filter((r) => r.startsWith('busy:'));
      expect(first.filter((r) => !/^(reserved|busy):/.test(r))).toEqual([]);
      expect(reserved).toHaveLength(1);
      expect(busy).toHaveLength(19);
      const id = reserved[0].split(':')[1];
      expect(new Set(busy)).toEqual(new Set([`busy:${id}`]));
      expect(await balance(u.id)).toBe('0/0/6');
      const [reserves] = await sql(`select count(*) from public.credit_ledger where user_id = '${u.id}' and kind = 'reserve';`);
      expect(reserves).toBe('1');
      await release(id);
    } finally {
      sessions.forEach((s) => s.close());
    }
    expect(await balance(u.id)).toBe('0/6/0');
    expect(await drift()).toEqual([]);
  });
});
