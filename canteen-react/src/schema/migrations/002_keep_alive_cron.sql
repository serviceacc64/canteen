-- Migration: Keep-Alive Cron
-- Runs entirely inside Supabase (via pg_cron) so the project stays active
-- every day without depending on GitHub Actions or any external caller.

create extension if not exists pg_cron;

create table if not exists public.keep_alive (
  id smallint primary key default 1,
  pinged_at timestamptz not null default now(),
  constraint keep_alive_singleton check (id = 1)
);

insert into public.keep_alive (id, pinged_at)
values (1, now())
on conflict (id) do nothing;

alter table public.keep_alive enable row level security;

-- Unschedule any previous run of this job before re-scheduling (safe to re-run this migration).
select cron.unschedule(jobid)
from cron.job
where jobname = 'daily_keep_alive';

select cron.schedule(
  'daily_keep_alive',
  '0 3 * * *', -- every day at 03:00 UTC
  $$ update public.keep_alive set pinged_at = now() where id = 1; $$
);
