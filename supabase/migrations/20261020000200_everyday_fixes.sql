-- Everyday fixes (founder, 20 Oct 2026): two more chat subjects, Home fixes and Car fixes, each with its own prompt and
-- drawing library (build-prompts.mjs SUBJECTS). The subject checks and the drawing-candidate filter take them.

alter table public.conversations drop constraint conversations_subject_check;
alter table public.conversations add constraint conversations_subject_check
  check (subject in ('biology','physics','chemistry','home','car'));
alter table public.library_drawings drop constraint library_drawings_subject_check;
alter table public.library_drawings add constraint library_drawings_subject_check
  check (subject in ('biology','physics','chemistry','home','car'));

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
      values (p_generation, case when p_subject in ('biology','physics','chemistry','home','car') then p_subject end, v_name, v_item -> 'lines');
    v_n := v_n + 1;
  end loop;
  return v_n;
end $$;
