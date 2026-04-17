import { supabase, isSupabaseConfigured } from './supabaseClient';

const TABLE_REPORTS = 'reports';
const TABLE_CASH_SALES = 'report_cash_sales';
const TABLE_STORE_PURCHASES = 'report_store_purchases';
const TABLE_STORE_CONSIGNMENT = 'report_store_consignment';
const TABLE_OPERATING_EXPENSES = 'report_operating_expenses';
const TABLE_SALARY_BREAKDOWN = 'report_salary_breakdown';

const ensureConfigured = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    );
  }
};

const getAuthenticatedUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data?.user?.id;
  if (!userId) throw new Error('You must be logged in to access reports.');
  return userId;
};

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const fromDbReport = (report) => ({
  id: report.id,
  date: report.report_date,
  canteenLocation: report.canteen_location,
  remarks: report.remarks ?? '',
  totals: report.totals ?? {},
  createdAt: report.created_at,
  updatedAt: report.updated_at,
});

const mapRowsFromDb = (rows, labelKey = 'label') =>
  (rows ?? []).map((row) => ({
    id: String(row.id),
    label: row[labelKey] ?? '',
    amount: toNumber(row.amount),
    ...(row.group_name ? { group: row.group_name } : {}),
  }));

const buildSectionRows = (rows, mapper) =>
  (rows ?? []).map((row, index) => ({
    ...mapper(row),
    sort_order: index,
  }));

const buildReportPayload = async (report) => {
  const userId = await getAuthenticatedUserId();

  return {
    id: report.id ?? `${report.date}-${report.canteenLocation}`,
    user_id: userId,
    report_date: report.date,
    canteen_location: report.canteenLocation,
    remarks: report.remarks ?? '',
    totals: report.totals ?? {},
    updated_at: new Date().toISOString(),
  };
};

const replaceChildRows = async (tableName, reportId, rows) => {
  const { error: deleteError } = await supabase.from(tableName).delete().eq('report_id', reportId);
  if (deleteError) throw deleteError;

  if (!rows.length) return;

  const { error: insertError } = await supabase.from(tableName).insert(rows);
  if (insertError) throw insertError;
};

export const getReports = async () => {
  ensureConfigured();

  const { data, error } = await supabase
    .from(TABLE_REPORTS)
    .select('*')
    .order('report_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromDbReport);
};

export const getReportById = async (id) => {
  ensureConfigured();

  const { data: report, error: reportError } = await supabase
    .from(TABLE_REPORTS)
    .select('*')
    .eq('id', id)
    .single();

  if (reportError) throw reportError;

  const [
    { data: cashSales, error: cashSalesError },
    { data: storePurchases, error: storePurchasesError },
    { data: storeConsignment, error: storeConsignmentError },
    { data: operatingExpenses, error: operatingExpensesError },
    { data: salaryBreakdown, error: salaryBreakdownError },
  ] = await Promise.all([
    supabase.from(TABLE_CASH_SALES).select('*').eq('report_id', id).order('sort_order', { ascending: true }),
    supabase
      .from(TABLE_STORE_PURCHASES)
      .select('*')
      .eq('report_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from(TABLE_STORE_CONSIGNMENT)
      .select('*')
      .eq('report_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from(TABLE_OPERATING_EXPENSES)
      .select('*')
      .eq('report_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from(TABLE_SALARY_BREAKDOWN)
      .select('*')
      .eq('report_id', id)
      .order('sort_order', { ascending: true }),
  ]);

  if (cashSalesError) throw cashSalesError;
  if (storePurchasesError) throw storePurchasesError;
  if (storeConsignmentError) throw storeConsignmentError;
  if (operatingExpensesError) throw operatingExpensesError;
  if (salaryBreakdownError) throw salaryBreakdownError;

  return {
    ...fromDbReport(report),
    cashSalesRows: mapRowsFromDb(cashSales),
    storePurchaseRows: mapRowsFromDb(storePurchases),
    storeConsignmentRows: mapRowsFromDb(storeConsignment),
    operatingExpensesRows: mapRowsFromDb(operatingExpenses),
    salaryBreakdownRows: mapRowsFromDb(salaryBreakdown, 'helper_name'),
  };
};

export const saveReport = async (report) => {
  ensureConfigured();

  const reportPayload = await buildReportPayload(report);

  const { data: savedReport, error: saveError } = await supabase
    .from(TABLE_REPORTS)
    .upsert(reportPayload, { onConflict: 'id' })
    .select('*')
    .single();

  if (saveError) throw saveError;

  const reportId = savedReport.id;

  const cashSalesRows = buildSectionRows(report.cashSalesRows, (row) => ({
    report_id: reportId,
    label: row.label ?? '',
    amount: toNumber(row.amount),
  }));

  const storePurchaseRows = buildSectionRows(report.storePurchaseRows, (row) => ({
    report_id: reportId,
    label: row.label ?? '',
    group_name: row.group ?? null,
    amount: toNumber(row.amount),
  }));

  const storeConsignmentRows = buildSectionRows(report.storeConsignmentRows, (row) => ({
    report_id: reportId,
    label: row.label ?? '',
    amount: toNumber(row.amount),
  }));

  const operatingExpensesRows = buildSectionRows(report.operatingExpensesRows, (row) => ({
    report_id: reportId,
    label: row.label ?? '',
    amount: toNumber(row.amount),
  }));

  const salaryBreakdownRows = buildSectionRows(report.salaryBreakdownRows, (row) => ({
    report_id: reportId,
    helper_name: row.label ?? '',
    amount: toNumber(row.amount),
  }));

  await replaceChildRows(TABLE_CASH_SALES, reportId, cashSalesRows);
  await replaceChildRows(TABLE_STORE_PURCHASES, reportId, storePurchaseRows);
  await replaceChildRows(TABLE_STORE_CONSIGNMENT, reportId, storeConsignmentRows);
  await replaceChildRows(TABLE_OPERATING_EXPENSES, reportId, operatingExpensesRows);
  await replaceChildRows(TABLE_SALARY_BREAKDOWN, reportId, salaryBreakdownRows);

  return {
    ...fromDbReport(savedReport),
    cashSalesRows: report.cashSalesRows ?? [],
    storePurchaseRows: report.storePurchaseRows ?? [],
    storeConsignmentRows: report.storeConsignmentRows ?? [],
    operatingExpensesRows: report.operatingExpensesRows ?? [],
    salaryBreakdownRows: report.salaryBreakdownRows ?? [],
  };
};

export const deleteReport = async (id) => {
  ensureConfigured();

  const { error } = await supabase.from(TABLE_REPORTS).delete().eq('id', id);

  if (error) throw error;
  return true;
};
