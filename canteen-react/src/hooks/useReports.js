import { useCallback, useEffect, useState } from 'react';
import { deleteReport, getReports, saveReport } from '../services/reportsApi';

const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshReports = useCallback(() => {
    const all = getReports();
    setReports(all);
    setLoading(false);
    return all;
  }, []);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  const createOrUpdateReport = useCallback((report) => {
    const saved = saveReport(report);
    setReports((prev) => {
      const idx = prev.findIndex((item) => item.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    return saved;
  }, []);

  const removeReport = useCallback((id) => {
    const ok = deleteReport(id);
    if (ok) {
      setReports((prev) => prev.filter((report) => report.id !== id));
    }
    return ok;
  }, []);

  return {
    reports,
    loading,
    refreshReports,
    createOrUpdateReport,
    removeReport,
  };
};

export default useReports;
