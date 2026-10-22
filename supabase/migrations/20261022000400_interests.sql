-- What a person asks about and at what level (founder, 22 Oct 2026): chosen under the birth date at sign-up, changed
-- on /settings. null subjects = every subject (accounts from before this); null study_level = high school.
alter table public.profiles
  add column subjects text[] check (subjects is null or (cardinality(subjects) between 1 and 5
    and subjects <@ array['biology','physics','chemistry','home','car']::text[])),
  add column study_level text check (study_level in ('school','undergrad','grad'));

create function public.set_interests(p_user_id uuid, p_subjects text[], p_level text) returns void
language sql security definer set search_path = '' as $$
  update public.profiles set subjects = p_subjects, study_level = p_level where id = p_user_id and deleted_at is null
$$;
revoke all on function public.set_interests(uuid, text[], text) from public, anon, authenticated, service_role;
grant execute on function public.set_interests(uuid, text[], text) to service_role;
