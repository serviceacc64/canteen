import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import useReports from '../hooks/useReports';
import { formatPeso } from '../utils/format';
import '../css/YearlyReport.css';

const yearKey = (dateValue) => {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return `${date.getFullYear()}`;
};

const YearlyReports = () => {
  const { reports, loading, removeReport } = useReports();

  const grouped = useMemo(() => {
    const map = new Map();

    reports.forEach((report) => {
      const key = yearKey(report.date);
      const current = map.get(key) || { year: key, totalSales: 0, totalExpenses: 0, netProfit: 0, count: 0 };

      current.totalSales += report?.totals?.totalSales || 0;
      current.totalExpenses += report?.totals?.totalExpenses || 0;
      current.netProfit += report?.totals?.netProfit || 0;
      current.count += 1;

      map.set(key, current);
    });

    return [...map.values()].sort((a, b) => a.year.localeCompare(b.year));
  }, [reports]);

  const onDelete = async (year) => {
    const confirmed = window.confirm(`Delete all reports for ${year} permanently?`);
    if (!confirmed) return;

    try {
      const reportsToDelete = reports.filter((report) => yearKey(report.date) === year);
      for (const report of reportsToDelete) {
        await removeReport(report.id);
      }
    } catch (error) {
      window.alert('Unable to delete the reports. Please try again.');
    }
  };

  if (loading) {
    return <div className="page"><p>Loading yearly reports...</p></div>;
  }

  return (
    <div className="page yearlyReports">
      <header className="yearlyReports__header">
        <div>
          <h1 className="yearlyReports__title">Yearly Reports</h1>
          <p className="yearlyReports__subtitle">Yearly aggregation from saved daily reports.</p>
        </div>
      </header>

      {grouped.length === 0 ? (
        <div className="yearlyReports__empty">
          <div className="yearlyReports__emptyCard">
            <h3>No yearly data yet</h3>
            <p>Create daily reports first so yearly totals can be aggregated.</p>
          </div>
        </div>
      ) : (
        <section className="yearlyReports__tableCard">
          <div className="yearlyReports__tableWrap">
            <table className="yearlyReports__table" aria-label="Yearly reports table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Entries</th>
                <th>Total Sales</th>
                <th>Total Expenses</th>
                <th>Net Profit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((row) => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{row.count}</td>
                  <td>{formatPeso(row.totalSales)}</td>
                  <td>{formatPeso(row.totalExpenses)}</td>
                  <td>{formatPeso(row.netProfit)}</td>
                  <td className="yearlyReports__rowActions">
                    <Link className="yearlyReports__link" to={`/view/yearly/${row.year}`}>
                      View
                    </Link>
                    <Button variant="danger" onClick={() => onDelete(row.year)} aria-label={`Delete reports for ${row.year}`}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default YearlyReports;
