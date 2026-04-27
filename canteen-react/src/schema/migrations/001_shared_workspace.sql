-- Migration: Shared Workspace
-- Drops restrictive "own" policies and creates shared "all" policies for authenticated users.

-- ------------------------------------------------------------
-- Reports policies
-- ------------------------------------------------------------
drop policy if exists reports_select_own on public.reports;
drop policy if exists reports_insert_own on public.reports;
drop policy if exists reports_update_own on public.reports;
drop policy if exists reports_delete_own on public.reports;

create policy reports_select_all on public.reports for select to authenticated using (true);
create policy reports_insert_all on public.reports for insert to authenticated with check (user_id = auth.uid());
create policy reports_update_all on public.reports for update to authenticated using (true) with check (user_id = auth.uid());
create policy reports_delete_all on public.reports for delete to authenticated using (true);

-- ------------------------------------------------------------
-- Child table policies
-- ------------------------------------------------------------

-- Cash Sales
drop policy if exists report_cash_sales_select_own on public.report_cash_sales;
drop policy if exists report_cash_sales_insert_own on public.report_cash_sales;
drop policy if exists report_cash_sales_update_own on public.report_cash_sales;
drop policy if exists report_cash_sales_delete_own on public.report_cash_sales;

create policy report_cash_sales_select_all on public.report_cash_sales for select to authenticated using (true);
create policy report_cash_sales_insert_all on public.report_cash_sales for insert to authenticated with check (true);
create policy report_cash_sales_update_all on public.report_cash_sales for update to authenticated using (true) with check (true);
create policy report_cash_sales_delete_all on public.report_cash_sales for delete to authenticated using (true);

-- Store Purchases
drop policy if exists report_store_purchases_select_own on public.report_store_purchases;
drop policy if exists report_store_purchases_insert_own on public.report_store_purchases;
drop policy if exists report_store_purchases_update_own on public.report_store_purchases;
drop policy if exists report_store_purchases_delete_own on public.report_store_purchases;

create policy report_store_purchases_select_all on public.report_store_purchases for select to authenticated using (true);
create policy report_store_purchases_insert_all on public.report_store_purchases for insert to authenticated with check (true);
create policy report_store_purchases_update_all on public.report_store_purchases for update to authenticated using (true) with check (true);
create policy report_store_purchases_delete_all on public.report_store_purchases for delete to authenticated using (true);

-- Store Consignment
drop policy if exists report_store_consignment_select_own on public.report_store_consignment;
drop policy if exists report_store_consignment_insert_own on public.report_store_consignment;
drop policy if exists report_store_consignment_update_own on public.report_store_consignment;
drop policy if exists report_store_consignment_delete_own on public.report_store_consignment;

create policy report_store_consignment_select_all on public.report_store_consignment for select to authenticated using (true);
create policy report_store_consignment_insert_all on public.report_store_consignment for insert to authenticated with check (true);
create policy report_store_consignment_update_all on public.report_store_consignment for update to authenticated using (true) with check (true);
create policy report_store_consignment_delete_all on public.report_store_consignment for delete to authenticated using (true);

-- Operating Expenses
drop policy if exists report_operating_expenses_select_own on public.report_operating_expenses;
drop policy if exists report_operating_expenses_insert_own on public.report_operating_expenses;
drop policy if exists report_operating_expenses_update_own on public.report_operating_expenses;
drop policy if exists report_operating_expenses_delete_own on public.report_operating_expenses;

create policy report_operating_expenses_select_all on public.report_operating_expenses for select to authenticated using (true);
create policy report_operating_expenses_insert_all on public.report_operating_expenses for insert to authenticated with check (true);
create policy report_operating_expenses_update_all on public.report_operating_expenses for update to authenticated using (true) with check (true);
create policy report_operating_expenses_delete_all on public.report_operating_expenses for delete to authenticated using (true);

-- Salary Breakdown
drop policy if exists report_salary_breakdown_select_own on public.report_salary_breakdown;
drop policy if exists report_salary_breakdown_insert_own on public.report_salary_breakdown;
drop policy if exists report_salary_breakdown_update_own on public.report_salary_breakdown;
drop policy if exists report_salary_breakdown_delete_own on public.report_salary_breakdown;

create policy report_salary_breakdown_select_all on public.report_salary_breakdown for select to authenticated using (true);
create policy report_salary_breakdown_insert_all on public.report_salary_breakdown for insert to authenticated with check (true);
create policy report_salary_breakdown_update_all on public.report_salary_breakdown for update to authenticated using (true) with check (true);
create policy report_salary_breakdown_delete_all on public.report_salary_breakdown for delete to authenticated using (true);
