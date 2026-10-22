-- Contract step of 20261022000100_free_20_friends.sql: the old "free videos a month" setting goes, now that the app
-- live reads ops_settings.free_videos. Run migrate-prod for this ONLY after the code that reads free_videos is live.
-- Security change: redefines SECURITY DEFINER admin_set_settings (without the old key); grants unchanged.

create or replace function public.admin_set_settings(p_changes jsonb, p_reason text, p_request_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_old public.ops_settings; v_new public.ops_settings; v_c text;
begin
  perform public._admin_check(p_reason);
  if p_request_id is null or p_changes is null or jsonb_typeof(p_changes) <> 'object' or p_changes = '{}'
     or exists (select 1 from jsonb_object_keys(p_changes) k where k not in ('generation_enabled','purchases_enabled',
       'signup_mode','daily_spend_cap_usd','max_open_generations','user_uncharged_cap_usd','smoke_user_id','notice',
       'user_daily_cap','user_monthly_cap','free_videos','slow_1_after','slow_1_seconds','slow_2_after','slow_2_seconds')) then
    raise exception 'rejected:invalid_input' using errcode = '22023';
  end if;
  if exists (select 1 from public.admin_audit where request_id = p_request_id) then return true; end if;
  select * into v_old from public.ops_settings where id for update;
  v_new := jsonb_populate_record(v_old, p_changes);
  begin
    update public.ops_settings set generation_enabled = v_new.generation_enabled,
      purchases_enabled = v_new.purchases_enabled, signup_mode = v_new.signup_mode,
      daily_spend_cap_usd = v_new.daily_spend_cap_usd, max_open_generations = v_new.max_open_generations,
      user_uncharged_cap_usd = v_new.user_uncharged_cap_usd, smoke_user_id = v_new.smoke_user_id,
      notice = v_new.notice, user_daily_cap = v_new.user_daily_cap, user_monthly_cap = v_new.user_monthly_cap,
      free_videos = v_new.free_videos,
      slow_1_after = v_new.slow_1_after, slow_1_seconds = v_new.slow_1_seconds,
      slow_2_after = v_new.slow_2_after, slow_2_seconds = v_new.slow_2_seconds, updated_at = now(), updated_by = auth.uid()
     where id;
  exception when check_violation or not_null_violation then
    get stacked diagnostics v_c = constraint_name;
    raise exception 'rejected:%', v_c using errcode = sqlstate, detail = '';
  end;
  perform public._audit('set_settings', null, 'ops_settings', null, p_request_id, p_reason,
    jsonb_build_object('before', to_jsonb(v_old) - 'updated_at' - 'updated_by', 'after', p_changes));
  return true;
end $$;


alter table public.ops_settings drop column free_videos_monthly;
