-- PLAN.md §12.3 60_deletion: §6.10 deleted vs kept, the tombstone, the trigger on auth.users, one video.
begin;
set local search_path = public, extensions;
\ir helpers.psql
select plan(54);

create temp table ids (k text primary key, id uuid);
create function pg_temp.i(p_k text) returns uuid language sql as $$ select id from ids where k = p_k $$;

-- Fixture D: a paying user with two videos (one succeeded with a call, misses and clips, one failed), a share,
-- feedback, a support message, an unsent email, a rate-limit key and an account_deleted email queued by the route.
do $$
declare d uuid := pg_temp.new_user('del_d'); g1 uuid; g2 uuid; r text;
begin
  insert into ids values ('d', d);
  r := pg_temp.svc(format($f$select public.stripe_topup_paid('evt_del_1', 'checkout.session.completed', now(), false, 'cus_t_del_d',
         %L, 'cs_del_1', 'pi_del_1', 'topup_60', 499, 1, 'usd', 499)$f$, d));
  if r <> 'applied' then raise exception 'fixture topup: %', r; end if;
  g1 := pg_temp.gid(pg_temp.reserve(d, gen_random_uuid(), 'whiteboard', 'How does insulin work?'));
  perform pg_temp.svc(format($f$select public.record_model_call(%L, 'whiteboard', 'round', 1::smallint, 'sha', now(), 1, 1, 'end_turn',
            1, 1, 1, 1, 1, null, 0.05, 'req', 'raw model text about insulin')::text$f$, g1));
  r := pg_temp.finish(g1, 450, 'whiteboard', format('{"misses":["insulin_pen"],"error_detail":"x","clips":[{"path":"%s/%s/0.mp3"}]}', d, g1)::jsonb);
  if r not like 'settled:3:%' then raise exception 'fixture finish: %', r; end if;
  g2 := pg_temp.gid(pg_temp.reserve(d, gen_random_uuid(), 'paper', 'Why do I feel dizzy?'));
  r := pg_temp.fail(g2, 'check_failed', '{"error_detail":"bad step 2","misses":["dizzy_face"]}');
  insert into ids values ('g1', g1), ('g2', g2);
  r := pg_temp.as_user(d, format('select outcome from public.create_share(%L)', g1));
  if r <> 'created' then raise exception 'fixture share: %', r; end if;
  insert into ids values ('slug_owner', d);
  perform pg_temp.as_user(d, format('select public.submit_feedback(%L, -1::smallint, %L, %L)', g1, '{unclear}', 'note'));
  perform pg_temp.svc(format($f$select public.submit_support_message(%L, 'd@example.test', 'video', 'help', null)$f$, d));
  insert into public.email_outbox (user_id, kind, dedupe_key, payload) values (d, 'terms_change', 'v9', '{}');
  insert into public.email_outbox (user_id, kind, dedupe_key, to_email) values (d, 'account_deleted', d::text, 'd@example.test');
  perform pg_temp.svc(format($f$select public.hit_rate_limit('export:%s', 3600, 1)$f$, d));
end $$;
create temp table slug_d as select slug from public.shares where user_id = pg_temp.i('d');
create temp table before_d as
  select (select count(*) from public.credit_ledger where user_id = pg_temp.i('d')) ledger,
         (select count(*) from public.generations where user_id = pg_temp.i('d')) gens;

select is(pg_temp.as_user(pg_temp.i('d'), 'select count(*) from public.generations'), '2', 'before: D reads its 2 generations');
select is(pg_temp.bal(pg_temp.i('d')), '0/57/0', 'before: D has 57 credits (60 - 3)');

-- Deletion.
select is(pg_temp.svc(format('select public.delete_account_data(%L)', pg_temp.i('d'))), 'deleted', 'delete_account_data -> deleted');
select is(pg_temp.svc(format('select public.delete_account_data(%L)', pg_temp.i('d'))), 'already_deleted', '... again -> already_deleted');

-- D's still-valid JWT reads nothing and every authenticated function refuses it.
select is(pg_temp.as_user(pg_temp.i('d'), format('select count(*) from public.%I', t)), '0',
          format('a deleted user''s live JWT reads 0 %s rows', t))
  from unnest(array['profiles','credit_balances','credit_ledger','generations','purchases','subscriptions','shares','video_feedback']) t;
select is(pg_temp.as_user(pg_temp.i('d'), sql), 'ERROR 42501: not allowed', format('a deleted user cannot call %s', f))
  from (values ('create_share', format('select outcome from public.create_share(%L)', pg_temp.i('g1'))),
               ('revoke_share', format('select public.revoke_share(%L)::text', pg_temp.i('g1'))),
               ('submit_feedback', format('select public.submit_feedback(%L, 1::smallint, null, null)::text', pg_temp.i('g1'))),
               ('redeem_invite', $$select public.redeem_invite('X')::text$$),
               ('accept_terms', $$select public.accept_terms(public.current_terms_version())$$)) x(f, sql);
select is(pg_temp.as_user(pg_temp.i('d'), $$select count(*) from public.search_my_videos('insulin')$$), '0',
  'search_my_videos finds nothing for a deleted user');
select is(pg_temp.anon(format('select count(*) from public.get_shared_video(%L)', (select slug from slug_d))), '0',
  'the old share slug -> empty');
select is(pg_temp.svc(format($f$select public.stripe_invoice_paid('evt_del_2', 'invoice.paid', now(), false, 'cus_t_del_d', 'in_del_2',
  'sub_del', 'subscription_cycle', 'plus', 999, 999, now() + interval '30 days', null)$f$)), 'account_deleted',
  'a renewal for the deleted account -> account_deleted, no grant');

-- Kept: the ledger (+1 forfeit), metering, purchases, costs; zero balances; the tombstone.
select is((select count(*) from public.credit_ledger where user_id = pg_temp.i('d')), (select ledger + 1 from before_d),
  'the ledger is kept: the same rows + 1 forfeit');
select is((select kind || '(' || sub_delta || ')[' || topup_delta || ']' from public.credit_ledger where user_id = pg_temp.i('d')
            order by id desc limit 1), 'forfeit(0)[-57]', '... the forfeit takes the 57 left');
select is(pg_temp.bal(pg_temp.i('d')), '0/0/0', 'balances are zero');
select is((select string_agg(style || ':' || status || ':' || credits_charged || ':' || narration_chars || ':' || billable_seconds
             || ':' || coalesce(error_code, '-'), ',' order by created_at, style)
             from public.generations where user_id = pg_temp.i('d')),
  'paper:failed:0:0:0:check_failed,whiteboard:succeeded:3:450:30:-', 'generation metering intact');
select is((select count(*)::int from public.generations where user_id = pg_temp.i('d')
             and question is null and script is null and voice_clips is null and content_deleted_at is not null), 2,
  'question, script and voice clips are null on both, content_deleted_at stamped');
select is((select raw_text || ':' || cost_usd from public.generation_calls where generation_id = pg_temp.i('g1')), null,
  'generation_calls.raw_text is null (the cost row stays)');
select is((select cost_usd from public.generation_calls where generation_id = pg_temp.i('g1')), 0.05::numeric(10,6), '... cost kept');
select is((select count(*)::int from public.generation_internal where generation_id in (pg_temp.i('g1'), pg_temp.i('g2'))
             and error_detail is null and misses = '{}'), 2, 'generation_internal: error_detail null, misses empty');
select is((select n from public.miss_counts where name = 'insulin_pen' and day = (now() at time zone 'utc')::date), 1,
  'the id-free miss count stays');
select is((select count(*)::int from public.purchases where user_id = pg_temp.i('d')), 1, 'purchases kept');
select is((select (deleted_at is not null) || ':' || coalesce(age_band, '-') || ':' || coalesce(stripe_customer_id, '-') || ':' || terms_version
             from public.profiles where id = pg_temp.i('d')), 'true:-:cus_t_del_d:2026-10-13-beta',
  'the tombstone: deleted_at, no age band, Stripe customer and terms kept');
-- Deleted: shares, feedback, support, unsent mail (except account_deleted), rate-limit keys.
select is((select count(*)::int from public.shares where user_id = pg_temp.i('d')), 0, 'shares deleted');
select is((select count(*)::int from public.video_feedback where user_id = pg_temp.i('d')), 0, 'feedback deleted');
select is((select count(*)::int from public.support_messages where user_id = pg_temp.i('d')), 0, 'support messages deleted');
select is((select string_agg(kind, ',') from public.email_outbox where user_id = pg_temp.i('d')), 'account_deleted',
  'unsent email deleted except the account_deleted confirmation');
select is((select count(*)::int from public.rate_limits where key like '%' || pg_temp.i('d')), 0, 'rate-limit keys deleted');

-- busy, and force.
insert into ids values ('e', pg_temp.new_user('del_e'));
select pg_temp.give(pg_temp.i('e'), 0, 20) is null as f \gset
select is(pg_temp.outcome(pg_temp.reserve(pg_temp.i('e'))), 'reserved', 'E has a video being made');
select is(pg_temp.svc(format('select public.delete_account_data(%L)', pg_temp.i('e'))), 'busy', 'deletion while held > 0 -> busy');
select is(pg_temp.bal(pg_temp.i('e')), '0/14/6', '... nothing changed');
select is(pg_temp.svc(format('select public.delete_account_data(%L, true)', pg_temp.i('e'))), 'deleted', 'with force -> deleted');
select is((select string_agg(kind, ',' order by id) from public.credit_ledger where user_id = pg_temp.i('e')), 'grant_topup,reserve,release,forfeit',
  '... the open video was failed stale and released first, then the 20 forfeited');

-- The trigger on auth.users: a paid user leaves a tombstone; a never-paid user (who wrote to support and is in
-- admin_audit) leaves nothing, with no FK error.
insert into ids values ('f', pg_temp.new_user('del_f'));
select pg_temp.give(pg_temp.i('f'), 0, 6) is null as f \gset
delete from auth.users where id = pg_temp.i('f');
select is((select (deleted_at is not null)::text from public.profiles where id = pg_temp.i('f')), 'true',
  'auth user with ledger rows deleted -> tombstone');
insert into ids values ('g', pg_temp.new_user('del_g'));
select is(pg_temp.svc(format($f$select (public.submit_support_message(%L, 'g@example.test', 'account', 'I am 12, delete me', null) is not null)::text$f$,
  pg_temp.i('g'))), 'true', 'the never-paid user wrote to support');
select is(pg_temp.as_admin('aal2', format($f$select public.admin_change_email(%L, 'test audit row', gen_random_uuid())::text$f$, pg_temp.i('g'))),
  'true', '... and has an admin_audit row');
select lives_ok(format('delete from auth.users where id = %L', pg_temp.i('g')), 'deleting that auth user raises no FK error');
select is((select count(*)::int from public.profiles where id = pg_temp.i('g')) + (select count(*)::int from public.credit_balances
             where user_id = pg_temp.i('g')) + (select count(*)::int from public.support_messages where user_id = pg_temp.i('g')), 0,
  '... profile, balance and support message are gone completely');
select is((select count(*)::int from public.admin_audit where target_user_id = pg_temp.i('g')), 1, '... the audit row survives');

-- One video (C7).
select pg_temp.give(pg_temp.ua(), 0, 10) is null as f \gset
do $$
declare g uuid := pg_temp.gid(pg_temp.reserve(pg_temp.ua(), gen_random_uuid(), 'whiteboard', 'How do vaccines work?'));
begin
  insert into ids values ('va', g);
  perform pg_temp.svc(format($f$select public.record_model_call(%L, 'whiteboard', 'round', 1::smallint, 'sha', now(), 1, 1, 'end_turn',
            1, 1, 1, 1, 1, null, 0.02, 'req', 'raw text')::text$f$, g));
  perform pg_temp.finish(g, 300, 'whiteboard', '{"misses":["syringe"],"error_detail":"repaired"}');
  perform pg_temp.as_user(pg_temp.ua(), format('select public.submit_feedback(%L, 1::smallint, null, null)', g));
end $$;
select is(pg_temp.as_user(pg_temp.ua(), format('select public.delete_my_video(%L, %L)::text', pg_temp.ua(), pg_temp.i('va'))),
  'ERROR 42501: permission denied for function delete_my_video', 'delete_my_video as authenticated -> 42501');
select is(pg_temp.svc(format('select public.delete_my_video(%L, %L)::text', pg_temp.ub(), pg_temp.i('va'))), 'false',
  'service_role deleting A''s video on behalf of B -> false');
select is(pg_temp.svc(format('select public.delete_my_video(%L, %L)::text', pg_temp.ua(), pg_temp.i('va'))), 'true',
  'the owner''s delete -> true');
select is((select coalesce(c.raw_text, 'null') || ':' || coalesce(i.error_detail, 'null') || ':' || i.misses::text || ':' ||
             (select count(*) from public.video_feedback f where f.generation_id = g.id) || ':' || coalesce(g.question, 'null')
             || ':' || g.credits_charged
             from public.generations g join public.generation_calls c on c.generation_id = g.id
             join public.generation_internal i on i.generation_id = g.id where g.id = pg_temp.i('va')),
  'null:null:{}:0:null:2', 'one video: raw_text, error_detail, misses, feedback and question gone; the charge stays');

-- Foreign keys to profiles(id), by hand (§6.10).
select set_eq($$select conrelid::regclass::text, confdeltype::text from pg_constraint
                 where contype = 'f' and confrelid = 'public.profiles'::regclass$$,
  $$values ('credit_balances','r'), ('credit_ledger','r'), ('generations','r'), ('purchases','r'), ('subscriptions','r'),
           ('admins','r'), ('account_flags','c'), ('shares','c'), ('video_feedback','c'), ('support_messages','c'),
           ('conversations','r')$$,
  'FKs to profiles(id) equal the hand-written list with their rules (none from admin_audit or email_outbox)');

-- A live user is untouched.
select is(pg_temp.as_user(pg_temp.ub(), 'select count(*) from public.credit_ledger') || ':' ||
          pg_temp.as_user(pg_temp.ub(), 'select count(*) from public.purchases'), '1:1', 'live user B still reads its own rows');
select is(pg_temp.drift(), '0', 'credit_drift() is empty');
select * from finish();
rollback;
