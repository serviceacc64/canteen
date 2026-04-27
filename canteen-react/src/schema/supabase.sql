-- Canteen Reports Schema for Supabase (Postgres)
-- Per-section child tables + RLS ownership policies.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Utility function: keep updated_at in sync
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Parent table
-- ------------------------------------------------------------
create table if not exists public.reports (
  id text primary key, -- frontend-compatible: `${date}-${canteenLocation}`
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  canteen_location text not null,
  remarks text,
  totals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  -- Multiple reports per same user/date/location are allowed for management history.
);

drop trigger if exists trg_reports_set_updated_at on public.reports;
create trigger trg_reports_set_updated_at
before update on public.reports
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Child tables (one table per Entry.jsx section)
-- ------------------------------------------------------------

-- 1) Cash Sales
create table if not exists public.report_cash_sales (
  id bigserial primary key,
  report_id text not null references public.reports(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_report_cash_sales_set_updated_at on public.report_cash_sales;
create trigger trg_report_cash_sales_set_updated_at
before update on public.report_cash_sales
for each row
execute function public.set_updated_at();

-- 2) Store Purchases (includes group_name from Entry.jsx)
create table if not exists public.report_store_purchases (
  id bigserial primary key,
  report_id text not null references public.reports(id) on delete cascade,
  label text not null,
  group_name text,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_report_store_purchases_set_updated_at on public.report_store_purchases;
create trigger trg_report_store_purchases_set_updated_at
before update on public.report_store_purchases
for each row
execute function public.set_updated_at();

-- 3) Store Consignment
create table if not exists public.report_store_consignment (
  id bigserial primary key,
  report_id text not null references public.reports(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_report_store_consignment_set_updated_at on public.report_store_consignment;
create trigger trg_report_store_consignment_set_updated_at
before update on public.report_store_consignment
for each row
execute function public.set_updated_at();

-- 4) Operating Expenses
create table if not exists public.report_operating_expenses (
  id bigserial primary key,
  report_id text not null references public.reports(id) on delete cascade,
  label text not null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_report_operating_expenses_set_updated_at on public.report_operating_expenses;
create trigger trg_report_operating_expenses_set_updated_at
before update on public.report_operating_expenses
for each row
execute function public.set_updated_at();

-- 5) Salary Breakdown (label in Entry.jsx is helper name)
create table if not exists public.report_salary_breakdown (
  id bigserial primary key,
  report_id text not null references public.reports(id) on delete cascade,
  helper_name text not null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_report_salary_breakdown_set_updated_at on public.report_salary_breakdown;
create trigger trg_report_salary_breakdown_set_updated_at
before update on public.report_salary_breakdown
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_report_date on public.reports(report_date desc);
create index if not exists idx_reports_location on public.reports(canteen_location);

create index if not exists idx_cash_sales_report_id on public.report_cash_sales(report_id, sort_order);
create index if not exists idx_store_purchases_report_id on public.report_store_purchases(report_id, sort_order);
create index if not exists idx_store_consignment_report_id on public.report_store_consignment(report_id, sort_order);
create index if not exists idx_operating_expenses_report_id on public.report_operating_expenses(report_id, sort_order);
create index if not exists idx_salary_breakdown_report_id on public.report_salary_breakdown(report_id, sort_order);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.reports enable row level security;
alter table public.report_cash_sales enable row level security;
alter table public.report_store_purchases enable row level security;
alter table public.report_store_consignment enable row level security;
alter table public.report_operating_expenses enable row level security;
alter table public.report_salary_breakdown enable row level security;

-- ------------------------------------------------------------
-- Reports policies
-- ------------------------------------------------------------
drop policy if exists reports_select_own on public.reports;
create policy reports_select_all on public.reports for select to authenticated using (true);

drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_all on public.reports for insert to authenticated with check (user_id = auth.uid());

drop policy if exists reports_update_own on public.reports;
create policy reports_update_all on public.reports for update to authenticated using (true) with check (user_id = auth.uid());

drop policy if exists reports_delete_own on public.reports;
create policy reports_delete_all on public.reports for delete to authenticated using (true);

-- ------------------------------------------------------------
-- Child table policies
-- ------------------------------------------------------------

-- report_cash_sales policies
drop policy if exists report_cash_sales_select_own on public.report_cash_sales;
create policy report_cash_sales_select_all on public.report_cash_sales for select to authenticated using (true);

drop policy if exists report_cash_sales_insert_own on public.report_cash_sales;
create policy report_cash_sales_insert_all on public.report_cash_sales for insert to authenticated with check (true);

drop policy if exists report_cash_sales_update_own on public.report_cash_sales;
create policy report_cash_sales_update_all on public.report_cash_sales for update to authenticated using (true) with check (true);

drop policy if exists report_cash_sales_delete_own on public.report_cash_sales;
create policy report_cash_sales_delete_all on public.report_cash_sales for delete to authenticated using (true);

-- report_store_purchases policies
drop policy if exists report_store_purchases_select_own on public.report_store_purchases;
create policy report_store_purchases_select_all on public.report_store_purchases for select to authenticated using (true);

drop policy if exists report_store_purchases_insert_own on public.report_store_purchases;
create policy report_store_purchases_insert_all on public.report_store_purchases for insert to authenticated with check (true);

drop policy if exists report_store_purchases_update_own on public.report_store_purchases;
create policy report_store_purchases_update_all on public.report_store_purchases for update to authenticated using (true) with check (true);

drop policy if exists report_store_purchases_delete_own on public.report_store_purchases;
create policy report_store_purchases_delete_all on public.report_store_purchases for delete to authenticated using (true);

-- report_store_consignment policies
drop policy if exists report_store_consignment_select_own on public.report_store_consignment;
create policy report_store_consignment_select_all on public.report_store_consignment for select to authenticated using (true);

drop policy if exists report_store_consignment_insert_own on public.report_store_consignment;
create policy report_store_consignment_insert_all on public.report_store_consignment for insert to authenticated with check (true);

drop policy if exists report_store_consignment_update_own on public.report_store_consignment;
create policy report_store_consignment_update_all on public.report_store_consignment for update to authenticated using (true) with check (true);

drop policy if exists report_store_consignment_delete_own on public.report_store_consignment;
create policy report_store_consignment_delete_all on public.report_store_consignment for delete to authenticated using (true);

-- report_operating_expenses policies
drop policy if exists report_operating_expenses_select_own on public.report_operating_expenses;
create policy report_operating_expenses_select_all on public.report_operating_expenses for select to authenticated using (true);

drop policy if exists report_operating_expenses_insert_own on public.report_operating_expenses;
create policy report_operating_expenses_insert_all on public.report_operating_expenses for insert to authenticated with check (true);

drop policy if exists report_operating_expenses_update_own on public.report_operating_expenses;
create policy report_operating_expenses_update_all on public.report_operating_expenses for update to authenticated using (true) with check (true);

drop policy if exists report_operating_expenses_delete_own on public.report_operating_expenses;
create policy report_operating_expenses_delete_all on public.report_operating_expenses for delete to authenticated using (true);

-- report_salary_breakdown policies
drop policy if exists report_salary_breakdown_select_own on public.report_salary_breakdown;
create policy report_salary_breakdown_select_all on public.report_salary_breakdown for select to authenticated using (true);

drop policy if exists report_salary_breakdown_insert_own on public.report_salary_breakdown;
create policy report_salary_breakdown_insert_all on public.report_salary_breakdown for insert to authenticated with check (true);

drop policy if exists report_salary_breakdown_update_own on public.report_salary_breakdown;
create policy report_salary_breakdown_update_all on public.report_salary_breakdown for update to authenticated using (true) with check (true);

drop policy if exists report_salary_breakdown_delete_own on public.report_salary_breakdown;
create policy report_salary_breakdown_delete_all on public.report_salary_breakdown for delete to authenticated using (true);

-- ------------------------------------------------------------
-- Grants (RLS still enforces ownership)
-- ------------------------------------------------------------
grant usage on schema public to authenticated;

grant select, insert, update, delete on public.reports to authenticated;
grant select, insert, update, delete on public.report_cash_sales to authenticated;
grant select, insert, update, delete on public.report_store_purchases to authenticated;
grant select, insert, update, delete on public.report_store_consignment to authenticated;
grant select, insert, update, delete on public.report_operating_expenses to authenticated;
grant select, insert, update, delete on public.report_salary_breakdown to authenticated;

grant usage, select on sequence public.report_cash_sales_id_seq to authenticated;
grant usage, select on sequence public.report_store_purchases_id_seq to authenticated;
grant usage, select on sequence public.report_store_consignment_id_seq to authenticated;
grant usage, select on sequence public.report_operating_expenses_id_seq to authenticated;
grant usage, select on sequence public.report_salary_breakdown_id_seq to authenticated;
