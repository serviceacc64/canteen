import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import useReports from '../hooks/useReports';
import { formatPeso } from '../utils/format';
import '../css/DailyReports.css';


const DailyReports = () => {
  const { reports, loading, removeReport } = useReports();

  const onDelete = async (id) => {
    const confirmed = window.confirm('Delete this report permanently?');
    if (!confirmed) return;

    try {
      await removeReport(id);
    } catch (error) {
      window.alert('Unable to delete the report. Please try again.');
    }
  };

  if (loading) {
    return <div className="page"><p>Loading reports...</p></div>;
  }

  return (
    <div className="page dailyReports">
      <header className="dailyReports__header">
        <div>
          <h1 className="dailyReports__title">Daily Reports</h1>
          <p className="dailyReports__subtitle">Persisted entries in Supabase.</p>
        </div>
        <div className="dailyReports__actions">
          <Link to="/entry" className="dailyReports__primaryLink">
            Create New Entry
          </Link>
        </div>
      </header>

      {reports.length === 0 ? (
        <div className="dailyReports__empty">
          <div className="dailyReports__emptyCard">
            <h3>No reports yet</h3>
            <p>Create a report from New Entry to start tracking daily operations.</p>
            <Link to="/entry" className="dailyReports__primaryLink dailyReports__primaryLink--wide">
              Go to New Entry
            </Link>
          </div>
        </div>
      ) : (
        <section className="dailyReports__tableCard">
          <div className="dailyReports__tableWrap">
            <table className="dailyReports__table" aria-label="Daily reports table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Total Sales</th>
                <th>Total Expenses</th>
                <th>Net Profit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.date || '-'}</td>
                  <td>{report.canteenLocation || '-'}</td>
                  <td>{formatPeso(report?.totals?.totalSales || 0)}</td>
                  <td>{formatPeso(report?.totals?.totalExpenses || 0)}</td>
                  <td>{formatPeso(report?.totals?.netProfit || 0)}</td>
                  <td className="dailyReports__rowActions">
                    <Link className="dailyReports__link" to={`/view/${report.id}`}>
                      View
                    </Link>
                    <Button variant="danger" onClick={() => onDelete(report.id)} aria-label={`Delete report ${report.id}`}>
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

export default DailyReports;
