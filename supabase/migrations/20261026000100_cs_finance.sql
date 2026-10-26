-- Computer science and Finance (founder, 26 Oct 2026): two more study subjects (build-prompts.mjs SUBJECTS 'cs',
-- 'finance'), and no new Home or Car chats (the everyday fixes are stopped). Old home and car chats stay valid and open.

alter table public.conversations drop constraint conversations_subject_check;
alter table public.conversations add constraint conversations_subject_check
  check (subject in ('biology','physics','chemistry','cs','finance','home','car'));
alter table public.library_drawings drop constraint library_drawings_subject_check;
alter table public.library_drawings add constraint library_drawings_subject_check
  check (subject in ('biology','physics','chemistry','cs','finance','home','car'));
alter table public.profiles drop constraint profiles_subjects_check;
alter table public.profiles add constraint profiles_subjects_check
  check (subjects is null or (cardinality(subjects) between 1 and 7
    and subjects <@ array['biology','physics','chemistry','cs','finance','home','car']::text[]));

create or replace function public.save_drawing_candidates(p_generation uuid, p_subject text, p_items jsonb) returns int
language plpgsql security definer set search_path = '' as $$
declare v_item jsonb; v_n int := 0; v_name text;
begin
  if jsonb_typeof(p_items) <> 'array' then raise exception 'rejected:invalid_input' using errcode = '22023'; end if;
  for v_item in select value from jsonb_array_elements(p_items) limit 3 loop
    v_name := v_item ->> 'name';
    if v_name !~ '^[a-z]{2,30}$' or jsonb_typeof(v_item -> 'lines') <> 'object' then continue; end if;
    if exists (select 1 from public.library_drawings where name = v_name and status = 'approved')
       or (select count(*) from public.library_drawings where name = v_name and status = 'pending') >= 3 then continue; end if;
    insert into public.library_drawings (generation_id, subject, name, lines)
      values (p_generation, case when p_subject in ('biology','physics','chemistry','cs','finance','home','car') then p_subject end, v_name, v_item -> 'lines');
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;

-- A new chat is a study subject; home and car chats can no longer be started (the old ones go on).
create or replace function public.create_conversation(p_subject text, p_level text default 'school') returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_subject not in ('biology','physics','chemistry','cs','finance') then
    raise exception 'rejected:subject' using errcode = '22023';
  end if;
  if (select count(*) from public.conversations where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'too many conversations' using errcode = '54000';
  end if;
  insert into public.conversations (user_id, subject, level) values (auth.uid(), p_subject, p_level) returning id into v_id;
  return v_id;
end $$;
revoke all on function public.create_conversation(text, text) from public, anon, authenticated, service_role;
grant execute on function public.create_conversation(text, text) to authenticated;
