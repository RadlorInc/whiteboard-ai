-- Names on shared videos, and which video a referred sign-up came from (founder, 2 Nov 2026).
--  * Every profile gets a public_name, shown as "Asked by …" on Explore cards and share pages (a community, follows
--    later). New and old accounts start with a made-up one ("Curious Owl 482"), never anything from the account, so
--    nobody is identified unless they choose to be: Account lets them change it to their real name or a nickname.
--  * public_names(slugs) gives the names for live share links only (anon + authenticated); nothing else of the
--    profile leaves the database.
--  * friend_referrals.via_slug / own_video: a sign-up from a shared video's link (/v/<slug>?friend=<code>) keeps the
--    slug and whether the video was the referrer's own, so people paid per sign-up can be checked for bringing
--    sign-ups with their own videos. null = from the plain invite link (or before this).
-- Security change: new SECURITY DEFINER functions public_names (anon, authenticated) and set_public_name
-- (service_role); add_friend_referral gains p_via (default null, so the live code's 2-argument call keeps working).

alter table public.profiles add column public_name text not null
  default (array['Curious','Bright','Quiet','Swift','Clever','Calm','Brave','Keen','Kind','Bold','Sunny','Steady'])[1 + floor(random() * 12)::int]
    || ' ' || (array['Owl','Fox','Falcon','Otter','Panda','Tiger','Dolphin','Eagle','Koala','Lynx','Heron','Robin'])[1 + floor(random() * 12)::int]
    || ' ' || (100 + floor(random() * 900)::int)::text      -- volatile default: a different name per row, old rows too
  check (char_length(public_name) between 2 and 30 and public_name ~ '^[[:alpha:][:digit:] ._''-]+$' and public_name ~ '[[:alpha:]]');

alter table public.friend_referrals add column via_slug text check (via_slug ~ '^[A-Za-z0-9_-]{22}$'),
  add column own_video boolean;

-- Names for a page of share links (Explore, a share page, related): only slugs that are shared now, live accounts.
create function public.public_names(p_slugs text[]) returns table(slug text, name text)
language sql stable security definer set search_path = '' as $$
  select s.slug, p.public_name from public.shares s join public.profiles p on p.id = s.user_id
   where s.slug = any (p_slugs[1:100]) and p.deleted_at is null $$;
revoke all on function public.public_names(text[]) from public, anon, authenticated, service_role;
grant execute on function public.public_names(text[]) to anon, authenticated, service_role;

-- The user's own change (Account; the server passes the session user). Trimmed and single-spaced; refuses contact
-- details (_has_contact_info, as for shared questions) and names that pass for us. Returns 'ok' | 'invalid' | 'contact_info' | 'reserved'.
create function public.set_public_name(p_user_id uuid, p_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare v text := regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g');
begin
  if p_user_id is null or char_length(v) not between 2 and 30 or v !~ '^[[:alpha:][:digit:] ._''-]+$' or v !~ '[[:alpha:]]' then
    return 'invalid';
  end if;
  if public._has_contact_info(v) then return 'contact_info'; end if;
  if lower(replace(v, ' ', '')) ~ '(radlor|admin|moderator|support|official)' then return 'reserved'; end if;
  update public.profiles set public_name = v where id = p_user_id and deleted_at is null;
  return case when found then 'ok' else 'invalid' end;
end $$;
revoke all on function public.set_public_name(uuid, text) from public, anon, authenticated, service_role;
grant execute on function public.set_public_name(uuid, text) to service_role;

-- Sign-up through a friend link (lib/signup.ts). Never the inviter's own account; one inviter per account. p_via: the
-- shared video's slug the link was for; own_video says whether that video is the referrer's.
drop function public.add_friend_referral(uuid, text);
create function public.add_friend_referral(p_friend uuid, p_code text, p_via text default null) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v_via text := case when p_via ~ '^[A-Za-z0-9_-]{22}$' then p_via end;
begin
  if p_friend is null or p_code is null or p_code !~ '^[0-9a-f]{12}$' then return false; end if;
  insert into public.friend_referrals (friend, referrer, via_slug, own_video)
  select p_friend, p.id, v_via,
         case when v_via is not null then exists (select 1 from public.shares s where s.slug = v_via and s.user_id = p.id) end
    from public.profiles p
   where p.friend_code = p_code and p.id <> p_friend and p.deleted_at is null
  on conflict (friend) do nothing;
  return found;
end $$;
revoke all on function public.add_friend_referral(uuid, text, text) from public, anon, authenticated;
grant execute on function public.add_friend_referral(uuid, text, text) to service_role;
