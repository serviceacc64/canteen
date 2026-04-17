import * as supabaseReportsApi from './supabaseReportsApi';

export const getReports = supabaseReportsApi.getReports;
export const getReportById = supabaseReportsApi.getReportById;
export const saveReport = supabaseReportsApi.saveReport;
export const deleteReport = supabaseReportsApi.deleteReport;

const reportsApi = {
  getReports,
  getReportById,
  saveReport,
  deleteReport,
};

export default reportsApi;
