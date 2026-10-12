-- PLAN.md §12.3 70_admin (§11.3): identity from the JWT, aal2 required, audited, request-id idempotent.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(49);

create function pg_temp.adj(p_who text, p_aal text, p_user uuid, p_delta int, p_req uuid) returns text language sql as $$
  select pg_temp.q('authenticated', case p_who when 'admin' then pg_temp.uadmin() else pg_temp.ua() end, p_aal,
    format('select public.admin_adjust_credits(%L, %s, %L, %L)::text', p_user, p_delta, 'goodwill for a broken video', p_req)) $$;
create temp table req (k text primary key, id uuid default gen_random_uuid());
insert into req (k) values ('r1'), ('r2'), ('r3'), ('ref1'), ('ref2');
create function pg_temp.r(p_k text) returns uuid language sql as $$ select id from req where k = p_k $$;

-- is_admin(): the table AND aal2 from the verified JWT.
select is(pg_temp.q('postgres', pg_temp.ua(), 'aal2', 'select public.is_admin()::text'), 'false', 'is_admin: user A at aal2 -> false');
select is(pg_temp.q('postgres', pg_temp.uadmin(), 'aal1', 'select public.is_admin()::text'), 'false', 'is_admin: the admin at aal1 -> false');
select is(pg_temp.q('postgres', pg_temp.uadmin(), 'aal2', 'select public.is_admin()::text'), 'true', 'is_admin: the admin at aal2 -> true');

-- Refused callers write nothing.
select is(pg_temp.adj('a', 'aal2', pg_temp.ub(), 10, pg_temp.r('r1')), 'ERROR 42501: not allowed', 'user A -> 42501 not allowed');
select is(pg_temp.adj('admin', 'aal1', pg_temp.ub(), 10, pg_temp.r('r1')), 'ERROR 42501: not allowed', 'the admin at aal1 -> 42501 not allowed');
select is(pg_temp.anon(format('select public.admin_adjust_credits(%L, 10, %L, %L)::text', pg_temp.ub(), 'goodwill x', pg_temp.r('r1'))),
  'ERROR 42501: permission denied for function admin_adjust_credits', 'anon -> no EXECUTE at all');
select is((select count(*)::int from public.admin_audit), 0, '... no audit rows');
select is((select count(*)::int from public.credit_ledger where user_id = pg_temp.ub()), 1, '... B''s ledger still has only its seed grant');

-- The positive twin: exactly one ledger row and one audit row; a repeated request id writes nothing more.
select is(pg_temp.adj('admin', 'aal2', pg_temp.ub(), 10, pg_temp.r('r1')), '142', 'the admin at aal2 grants 10 -> top-up 142');
select is((select count(*)::int || ':' || string_agg(kind || '[' || topup_delta || ']', ',') from public.credit_ledger
            where user_id = pg_temp.ub() and kind = 'admin_adjust'), '1:admin_adjust[10]', '... one admin_adjust row of +10');
select is((select count(*)::int || ':' || string_agg(action || ':' || delta || ':' || (admin_id = pg_temp.uadmin()) || ':' || reason, ',')
             from public.admin_audit), '1:grant_credits:10:true:goodwill for a broken video', '... one audit row naming the admin from the JWT');
select is((select count(*)::int from public.credit_ledger l join public.admin_audit a on a.id = l.admin_audit_id
             where l.user_id = pg_temp.ub()), 1, '... the ledger row points at its audit row');
select is(pg_temp.adj('admin', 'aal2', pg_temp.ub(), 10, pg_temp.r('r1')), '142', 'the same request id again -> the first result');
select is((select count(*)::int from public.admin_audit) || ':' || (select count(*) from public.credit_ledger
             where user_id = pg_temp.ub() and kind = 'admin_adjust'), '1:1', '... still one audit row and one ledger row');

-- Revoke past the balance.
select is(pg_temp.adj('admin', 'aal2', pg_temp.ub(), -143, pg_temp.r('r2')), 'ERROR P0001: would go negative', 'revoking 143 of 142 -> would go negative');
select is((select count(*)::int from public.admin_audit) || ':' || pg_temp.bal(pg_temp.ub()), '1:0/142/0', '... nothing written');
select is(pg_temp.adj('admin', 'aal2', pg_temp.ub(), -142, pg_temp.r('r3')), '0', 'revoking exactly 142 -> 0');
select is(pg_temp.adj('admin', 'aal2', pg_temp.ub(), 1001, gen_random_uuid()), 'ERROR 22023: rejected:invalid_input', 'more than 1000 -> refused');
select is(pg_temp.as_admin('aal2', format('select public.admin_adjust_credits(%L, 5, %L, gen_random_uuid())::text', pg_temp.ub(), 'shrt')),
  'ERROR 22023: rejected:reason', 'a reason under 5 characters -> refused');

-- admin_audit is append-only, for the owner too.
select throws_ok('update public.admin_audit set reason = ''changed reason''', '42501', 'admin_audit is append-only', 'UPDATE admin_audit -> refused');
select throws_ok('delete from public.admin_audit', '42501', 'admin_audit is append-only', 'DELETE admin_audit -> refused');
select throws_ok('truncate public.admin_audit', '42501', 'admin_audit is append-only', 'TRUNCATE admin_audit -> refused');

-- Refund a generation once.
create temp table g (id uuid);
insert into g select pg_temp.gid(pg_temp.reserve(pg_temp.ua()));
select is(pg_temp.finish((select id from g), 451), 'settled:4:206', 'A''s video charged 4 (210 - 4)');
select is(pg_temp.as_admin('aal2', format('select public.admin_refund_generation(%L, %L, %L)::text', (select id from g), 'drawing was broken', pg_temp.r('ref1'))),
  '4', 'refund -> 4 credits');
select is((select status from public.generations where id = (select id from g)) || ' ' || pg_temp.bal(pg_temp.ua()) || ' '
  || (select string_agg(kind || '[' || topup_delta || ']', ',') from public.credit_ledger where generation_id = (select id from g) and kind = 'admin_refund'),
  'refunded 146/64/0 admin_refund[4]', '... refunded, +4 to top-up (never expires)');
select is((select count(*)::int from public.email_outbox where kind = 'refund_notice' and dedupe_key = (select id from g)::text), 1,
  '... a refund_notice email is queued');
select is(pg_temp.as_admin('aal2', format('select public.admin_refund_generation(%L, %L, %L)::text', (select id from g), 'drawing was broken', pg_temp.r('ref1'))),
  '4', 'the same request id -> the first result');
select is(pg_temp.as_admin('aal2', format('select public.admin_refund_generation(%L, %L, %L)::text', (select id from g), 'drawing was broken', pg_temp.r('ref2'))),
  'ERROR P0001: already refunded', 'a second refund -> already refunded');
select is((select count(*)::int from public.credit_ledger where generation_id = (select id from g) and kind = 'admin_refund'), 1,
  '... one admin_refund row');

-- Other actions, each audited once.
select is(pg_temp.as_admin('aal2', $$select public.admin_set_settings('{"notice": "Maintenance at 10:00 UTC"}', 'planned notice', gen_random_uuid())::text$$),
  'true', 'admin_set_settings');
select is((select notice || ':' || (updated_by = pg_temp.uadmin()) from public.ops_settings) || ' '
  || (select detail -> 'after' ->> 'notice' from public.admin_audit where action = 'set_settings'), 'Maintenance at 10:00 UTC:true Maintenance at 10:00 UTC',
  '... the row changed and the audit keeps before/after');
select is(pg_temp.as_admin('aal2', $$select public.admin_set_settings('{"id": false}', 'try the key', gen_random_uuid())::text$$),
  'ERROR 22023: rejected:invalid_input', 'admin_set_settings refuses keys outside the allow-list');
select is(pg_temp.as_admin('aal2', format('select public.admin_view_generation(%L, %L)', (select id from g), 'support ticket 12')) is not null,
  true, 'admin_view_generation returns the row ...');
select is((select count(*)::int from public.admin_audit where action = 'view_generation'), 1, '... and audits the view');
select is(pg_temp.as_admin('aal2', format('select public.admin_grant_access(%L, %L)::text', pg_temp.ub(), 'invited by founder')), 'true', 'admin_grant_access');
select is(pg_temp.as_admin('aal2', $$select public.admin_resolve_stripe_event('evt_seed_b_top', 'checked by hand', 'billing review', gen_random_uuid())::text$$),
  'true', 'admin_resolve_stripe_event');
select is((select resolution from public.stripe_events where id = 'evt_seed_b_top'), 'checked by hand', '... resolved');

-- admin_lookup_user: one case per kind of id, with the seed's hand-written ids.
select is(pg_temp.as_admin('aal2', format('select string_agg(user_id || '':'' || matched_by, '','') from public.admin_lookup_user(%L)', q)), want, 'lookup ' || q)
  from (values ('a@example.test', '00000000-0000-4000-8000-00000000000a:email'),
               ('00000000-0000-4000-8000-00000000000b', '00000000-0000-4000-8000-00000000000b:user_id'),
               ('cs_seed_b_132', '00000000-0000-4000-8000-00000000000b:checkout_session'),
               ('pi_seed_a_60', '00000000-0000-4000-8000-00000000000a:payment_intent'),
               ('in_seed_a_plus', '00000000-0000-4000-8000-00000000000a:invoice'),
               ('sub_seed_a', '00000000-0000-4000-8000-00000000000a:subscription'),
               ('cus_seed_b', '00000000-0000-4000-8000-00000000000b:customer')) x(q, want);
select is(pg_temp.as_admin('aal2', format('select string_agg(matched_by, '','') from public.admin_lookup_user(%L)', (select id from g))),
  'generation_id', 'lookup a generation id');
select is(pg_temp.as_user(pg_temp.ua(), $$select count(*) from public.admin_lookup_user('a@example.test')$$), 'ERROR 42501: not allowed',
  'lookup as user A -> not allowed');

-- Dispute evidence: no question text; audited.
select ok(pg_temp.as_admin('aal2', format('select public.admin_dispute_evidence(%L, %L)', pg_temp.ua(), 'dispute du_123'))
          like '%Terms version: 2026-10-13-beta%in_seed_a_plus%whiteboard  refunded  4 credits%', 'dispute evidence lists terms, purchases and videos');
select is(pg_temp.as_admin('aal2', format('select position(%L in public.admin_dispute_evidence(%L, %L))::text', 'plants', pg_temp.ua(), 'dispute du_123')),
  '0', '... and never the question text');

select is(pg_temp.drift(), '0', 'credit_drift() is empty');
select * from finish();
rollback;
