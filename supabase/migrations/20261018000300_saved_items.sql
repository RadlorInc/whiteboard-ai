-- Collection (founder, 18 Oct 2026): save an Explore lesson to come back to, like Instagram's saved posts. A saved
-- item is a share slug (an Explore card's, i.e. the chat's first video); it goes when the share goes (cascade) and
-- holds no user text. Writes go through save_item; the Collection page reads my_saved (same card shape as Explore).
-- Security change: adds table saved_items (RLS, SELECT own) and SECURITY DEFINER save_item and my_saved
-- (authenticated), owned by postgres with search_path = ''.

create table public.saved_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null references public.shares(slug) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, slug));
create index saved_items_recent on public.saved_items (user_id, created_at desc);

alter table public.saved_items enable row level security;
revoke all on public.saved_items from public, anon, authenticated, service_role;
grant select on public.saved_items to authenticated, service_role;
create policy saved_items_own on public.saved_items for select to authenticated
  using (user_id = (select auth.uid()) and (select public.is_live_user()));

-- Save or unsave. Only a slug that is on Explore can be saved; at most 1,000 saved per person.
-- outcome: saved | removed | not_found | full
create function public.save_item(p_slug text, p_on boolean) returns text
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if not public.is_live_user() then raise exception 'not allowed' using errcode = '42501'; end if;
  if not coalesce(p_on, false) then
    delete from public.saved_items where user_id = v_uid and slug = p_slug;
    return case when found then 'removed' else 'not_found' end;
  end if;
  if not exists (select 1 from public.shares s where s.slug = p_slug and s.explore_at is not null) then return 'not_found'; end if;
  if (select count(*) from public.saved_items where user_id = v_uid) >= 1000 then return 'full'; end if;
  insert into public.saved_items (user_id, slug) values (v_uid, p_slug) on conflict do nothing;
  return 'saved';
end $$;

-- The signed-in person's saved lessons, newest saved first, as Explore cards (only those still on Explore).
create function public.my_saved(p_limit integer)
returns table(slug text, title text, style text, script jsonb, n integer, subject text, latest timestamptz)
language sql stable security definer set search_path = '' as $$
  select i.slug, i.title, i.style, i.script, i.n, i.subject, i.latest
    from public.saved_items v
    join public.shares s on s.slug = v.slug
    join public.generations g on g.id = s.generation_id
    join public._explore_items() i on i.item = coalesce(g.conversation_id, g.id)
   where v.user_id = auth.uid() and public.is_live_user()
   order by v.created_at desc
   limit least(greatest(coalesce(p_limit, 48), 1), 200)
$$;

revoke all on function public.save_item(text, boolean)  from public, anon, authenticated, service_role;
revoke all on function public.my_saved(integer)         from public, anon, authenticated, service_role;
grant execute on function public.save_item(text, boolean) to authenticated;
grant execute on function public.my_saved(integer)        to authenticated;
