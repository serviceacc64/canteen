import { supabase, isSupabaseConfigured } from './supabaseClient';

const REPORTS_TABLE = 'reports';

const ensureConfigured = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    );
  }
};

const normalizeReport = (report) => ({
  ...report,
  createdAt: report.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const getReports = async () => {
  ensureConfigured();
  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .select('*')
    .order('date', { ascending: false })
    .order('createdAt', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

export const getReportById = async (id) => {
  ensureConfigured();
  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const saveReport = async (report) => {
  ensureConfigured();
  const payload = normalizeReport(report);
  const { data, error } = await supabase
    .from(REPORTS_TABLE)
    .upsert(payload, { onConflict: 'id', returning: 'representation' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteReport = async (id) => {
  ensureConfigured();
  const { error } = await supabase.from(REPORTS_TABLE).delete().eq('id', id);

  if (error) throw error;
  return true;
};
