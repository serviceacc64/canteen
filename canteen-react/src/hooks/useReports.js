import { useCallback, useEffect, useState } from 'react';
import { deleteReport, getReports, saveReport } from '../services/reportsApi';

const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshReports = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getReports();
      setReports(all);
      setError(null);
      return all;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  const createOrUpdateReport = useCallback(async (report) => {
    const saved = await saveReport(report);
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

  const removeReport = useCallback(async (id) => {
    await deleteReport(id);
    setReports((prev) => prev.filter((report) => report.id !== id));
    return true;
  }, []);

  return {
    reports,
    loading,
    error,
    refreshReports,
    createOrUpdateReport,
    removeReport,
  };
};

export default useReports;
