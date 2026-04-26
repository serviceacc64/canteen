import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import useReports from '../hooks/useReports';
import { formatPeso } from '../utils/format';
import '../css/MonthlyReports.css';

const monthKey = (dateValue) => {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const MonthlyReports = () => {
  const { reports, loading, removeReport } = useReports();

  const grouped = useMemo(() => {
    const map = new Map();

    reports.forEach((report) => {
      const key = monthKey(report.date);
      const current = map.get(key) || { month: key, totalSales: 0, totalExpenses: 0, netProfit: 0, count: 0 };

      current.totalSales += report?.totals?.totalSales || 0;
      current.totalExpenses += report?.totals?.totalExpenses || 0;
      current.netProfit += report?.totals?.netProfit || 0;
      current.count += 1;

      map.set(key, current);
    });

    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  }, [reports]);

  const onDelete = async (month) => {
    const confirmed = window.confirm(`Delete all reports for ${month} permanently?`);
    if (!confirmed) return;

    try {
      const reportsToDelete = reports.filter((report) => monthKey(report.date) === month);
      for (const report of reportsToDelete) {
        await removeReport(report.id);
      }
    } catch (error) {
      window.alert('Unable to delete the reports. Please try again.');
    }
  };

  if (loading) {
    return <div className="page"><p>Loading monthly reports...</p></div>;
  }

  return (
    <div className="page monthlyReports">
      <header className="monthlyReports__header">
        <div>
          <h1 className="monthlyReports__title">Monthly Reports</h1>
          <p className="monthlyReports__subtitle">Monthly aggregation from saved daily reports.</p>
        </div>
      </header>

      {grouped.length === 0 ? (
        <div className="monthlyReports__empty">
          <div className="monthlyReports__emptyCard">
            <h3>No monthly data yet</h3>
            <p>Create daily reports first so monthly totals can be aggregated.</p>
          </div>
        </div>
      ) : (
        <section className="monthlyReports__tableCard">
          <div className="monthlyReports__tableWrap">
            <table className="monthlyReports__table" aria-label="Monthly reports table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Entries</th>
                <th>Total Sales</th>
                <th>Total Expenses</th>
                <th>Net Profit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{row.count}</td>
                  <td>{formatPeso(row.totalSales)}</td>
                  <td>{formatPeso(row.totalExpenses)}</td>
                  <td>{formatPeso(row.netProfit)}</td>
                  <td className="monthlyReports__rowActions">
                    <Link className="btn btn-secondary" to={`/view/monthly/${row.month}`}>
                      View
                    </Link>
                    <Button variant="danger" onClick={() => onDelete(row.month)} aria-label={`Delete reports for ${row.month}`}>
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

export default MonthlyReports;
