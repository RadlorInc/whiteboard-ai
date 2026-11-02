-- Names only when chosen (founder, 2 Nov 2026, after 20261102000100): the made-up names ("Sunny Koala 979") read as
-- people who don't exist. public_name is now null until the user sets one on Account, and "Asked by" shows only
-- then. Our own videos (admin accounts) say "Ask Radlor". Only made-up names are cleared: a name a user set stays.
-- An empty name in set_public_name clears it (no name shown).
-- Security change: none (public_names and set_public_name keep their grants; public_names now skips null names).

alter table public.profiles alter column public_name drop default, alter column public_name drop not null;
update public.profiles set public_name = null where public_name ~ '^[A-Z][a-z]+ [A-Z][a-z]+ [1-9][0-9]{2}$';
update public.profiles set public_name = 'Ask Radlor' where id in (select user_id from public.admins);   -- set_public_name refuses it for users

create or replace function public.public_names(p_slugs text[]) returns table(slug text, name text)
language sql stable security definer set search_path = '' as $$
  select s.slug, p.public_name from public.shares s join public.profiles p on p.id = s.user_id
   where s.slug = any (p_slugs[1:100]) and p.deleted_at is null and p.public_name is not null $$;

create or replace function public.set_public_name(p_user_id uuid, p_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare v text := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
begin
  if p_user_id is null then return 'invalid'; end if;
  if v = '' then
    update public.profiles set public_name = null where id = p_user_id and deleted_at is null;
    return case when found then 'ok' else 'invalid' end;
  end if;
  if char_length(v) not between 2 and 30 or v !~ '^[[:alpha:][:digit:] ._''-]+$' or v !~ '[[:alpha:]]' then
    return 'invalid';
  end if;
  if public._has_contact_info(v) then return 'contact_info'; end if;
  if lower(replace(v, ' ', '')) ~ '(radlor|admin|moderator|support|official)' then return 'reserved'; end if;
  update public.profiles set public_name = v where id = p_user_id and deleted_at is null;
  return case when found then 'ok' else 'invalid' end;
end $$;
