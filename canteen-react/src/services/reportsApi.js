import { getItem, setItem } from './storage';

const REPORTS_KEY = 'canteen_reports';

export const getReports = () => {
  const reports = getItem(REPORTS_KEY, []);
  return Array.isArray(reports) ? reports : [];
};

export const getReportById = (id) => {
  const reports = getReports();
  return reports.find((report) => report.id === id) || null;
};

export const saveReport = (report) => {
  const reports = getReports();
  const next = {
    id: report?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: report?.createdAt || new Date().toISOString(),
    ...report,
  };

  const existingIndex = reports.findIndex((item) => item.id === next.id);

  if (existingIndex >= 0) {
    reports[existingIndex] = { ...reports[existingIndex], ...next };
  } else {
    reports.push(next);
  }

  setItem(REPORTS_KEY, reports);
  return next;
};

export const deleteReport = (id) => {
  const reports = getReports();
  const filtered = reports.filter((report) => report.id !== id);
  setItem(REPORTS_KEY, filtered);
  return filtered.length !== reports.length;
};

const reportsApi = {
  getReports,
  getReportById,
  saveReport,
  deleteReport,
};

export default reportsApi;
