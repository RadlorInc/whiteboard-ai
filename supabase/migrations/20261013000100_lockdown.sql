-- M1 / PLAN.md §6.2: lock the defaults down before any object exists.
-- Supabase grants ALL on new public tables/functions to anon, authenticated, service_role (per-schema defaults):
alter default privileges for role postgres in schema public revoke all on tables    from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated, service_role;
-- PUBLIC's EXECUTE on functions is a GLOBAL default; a per-schema revoke cannot remove it:
alter default privileges for role postgres revoke execute on functions from public;

-- The sweep, plan-credit expiry, drift check and scrubs run in the database (C20, §6.8).
create extension if not exists pg_cron;
