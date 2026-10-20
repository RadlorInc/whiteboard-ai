-- Levels (founder, 20 Oct 2026): a study chat picks High school, College or Grad school beside its subject. The level
-- changes what the lesson teaches (generate.ts LEVEL_TEXT), never its length: same caps, same hold, 1 video each.
-- Home and car fixes are always 'school'.

alter table public.conversations add column level text not null default 'school'
  check (level in ('school','undergrad','grad'));

drop function public.create_conversation(text);
create function public.create_conversation(p_subject text, p_level text default 'school') returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  if (select count(*) from public.conversations where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'too many conversations' using errcode = '54000';
  end if;
  insert into public.conversations (user_id, subject, level)
    values (auth.uid(), p_subject, case when p_subject in ('home','car') then 'school' else p_level end) returning id into v_id;
  return v_id;
end $$;
revoke all on function public.create_conversation(text, text) from public, anon, authenticated, service_role;
grant execute on function public.create_conversation(text, text) to authenticated;
