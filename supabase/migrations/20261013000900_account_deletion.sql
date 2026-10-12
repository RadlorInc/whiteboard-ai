-- M1 / PLAN.md §6.10 (C39): deleted vs kept.
-- Security change: adds SECURITY DEFINER functions delete_account_data (service_role) and on_auth_user_deleted
-- (a trigger on auth.users), owned by postgres with search_path = ''.

-- 'deleted' | 'already_deleted' | 'busy' | 'no_account'. One transaction; every step idempotent.
create function public.delete_account_data(p_user_id uuid, p_force boolean default false) returns text
language plpgsql security definer set search_path = '' as $$
declare b public.credit_balances; v_p public.profiles; v_id uuid;
begin
  select * into b from public.credit_balances where user_id = p_user_id for update;
  select * into v_p from public.profiles where id = p_user_id for update;
  if v_p.id is null then return 'no_account'; end if;
  if v_p.deleted_at is not null then return 'already_deleted'; end if;
  if b.held > 0 and not coalesce(p_force, false) then return 'busy'; end if;
  for v_id in select id from public.generations where user_id = p_user_id and status in ('reserved','running')
                for update loop
    perform public._fail_locked(v_id, 'stale', null);
  end loop;
  select * into b from public.credit_balances where user_id = p_user_id;
  if b.sub > 0 or b.topup > 0 then
    perform public._ledger(p_user_id, 'forfeit', -b.sub, -b.topup, 0);
  end if;
  update public.generations set question = null, script = null, voice_clips = null,
         content_deleted_at = coalesce(content_deleted_at, now())
   where user_id = p_user_id and (question is not null or script is not null or voice_clips is not null
                                  or content_deleted_at is null);
  update public.generation_calls set raw_text = null
   where raw_text is not null and generation_id in (select id from public.generations where user_id = p_user_id);
  update public.generation_internal set error_detail = null, misses = '{}'
   where (error_detail is not null or misses <> '{}')
     and generation_id in (select id from public.generations where user_id = p_user_id);
  delete from public.shares where user_id = p_user_id;
  delete from public.video_feedback where user_id = p_user_id;
  delete from public.support_messages where user_id = p_user_id;
  delete from public.email_outbox where user_id = p_user_id and sent_at is null and kind <> 'account_deleted';
  delete from public.rate_limits where key like '%:' || p_user_id::text;
  update public.profiles set deleted_at = now(), age_band = null, age_confirmed_at = null, age_gate_version = null
   where id = p_user_id;
  return 'deleted';
end $$;
revoke all on function public.delete_account_data(uuid, boolean) from public, anon, authenticated, service_role;
grant execute on function public.delete_account_data(uuid, boolean) to service_role;

-- Covers deletion from the route, the dashboard and the under-13 path. Someone who never paid (no ledger, purchase
-- or subscription rows) leaves no tombstone; everyone else keeps the accounting tombstone.
create function public.on_auth_user_deleted() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.credit_ledger where user_id = old.id)
     and not exists (select 1 from public.purchases where user_id = old.id)
     and not exists (select 1 from public.subscriptions where user_id = old.id) then
    delete from public.rate_limits where key like '%:' || old.id::text;
    delete from public.credit_balances where user_id = old.id;
    delete from public.profiles where id = old.id;   -- account_flags, shares, feedback, support go by cascade
  else
    perform public.delete_account_data(old.id, true);
  end if;
  return old;
end $$;
revoke all on function public.on_auth_user_deleted() from public, anon, authenticated, service_role;
create trigger on_auth_user_deleted after delete on auth.users
  for each row execute function public.on_auth_user_deleted();
