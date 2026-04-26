import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import useReports from '../hooks/useReports';
import { formatPeso } from '../utils/format';
import '../css/DailyReports.css';


const DailyReports = () => {
  const { reports, loading, removeReport } = useReports();
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('individual');

  const sumTotals = (items) =>
    items.reduce(
      (acc, report) => {
        const totals = report?.totals ?? {};
        acc.totalSales += Number(totals.totalSales ?? 0);
        acc.totalExpenses += Number(totals.totalExpenses ?? 0);
        acc.netProfit += Number(totals.netProfit ?? 0);
        return acc;
      },
      { totalSales: 0, totalExpenses: 0, netProfit: 0 },
    );

  const getFilteredReports = () => {
    if (!selectedDate) {
      return reports;
    }
    return reports.filter((report) => report.date === selectedDate);
  };

  const filteredReports = getFilteredReports();

  const groupedReports =
    filteredReports.length > 0
      ? filteredReports.reduce((acc, report) => {
          const date = report?.date || 'Unknown date';
          if (!acc[date]) acc[date] = [];
          acc[date].push(report);
          return acc;
        }, {})
      : {};

  const combinedDailyRows = Object.entries(groupedReports)
    .map(([date, dayReports]) => {
      const totals = sumTotals(dayReports);
      const uniqueLocations = new Set(
        dayReports.map((r) => (r?.canteenLocation ? String(r.canteenLocation) : 'Unknown location')),
      );

      return {
        date,
        reportCount: dayReports.length,
        locationCount: uniqueLocations.size,
        totals,
      };
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const onDelete = async (id) => {
    const confirmed = window.confirm('Delete this report permanently?');
    if (!confirmed) return;

    try {
      await removeReport(id);
    } catch {
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
          <div className="dailyReports__filterGroup">
            <label htmlFor="dateFilter" className="dailyReports__filterLabel">
              Filter by Date:
            </label>
            <input
              id="dateFilter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="dailyReports__dateInput"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="dailyReports__clearBtn"
                title="Clear date filter"
              >
                Clear
              </button>
            )}
          </div>
          <Button 
            variant={viewMode === 'individual' ? 'secondary' : 'primary'}
            className="dailyReports__toggleBtn"
            onClick={() => setViewMode(viewMode === 'individual' ? 'combined' : 'individual')}
          >
            {viewMode === 'individual' ? 'View Combined (per day)' : 'View Individual (per canteen)'}
          </Button>
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
      ) : !filteredReports.length ? (
        <div className="dailyReports__empty">
          <div className="dailyReports__emptyCard">
            <h3>No reports found</h3>
            <p>No reports match the selected date. Try a different date.</p>
            <button
              onClick={() => setSelectedDate('')}
              className="dailyReports__primaryLink dailyReports__primaryLink--wide"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              View All Reports
            </button>
          </div>
        </div>
      ) : viewMode === 'individual' ? (
        filteredReports.length > 0 && (
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
                  {filteredReports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.date || '-'}</td>
                      <td>{report.canteenLocation || '-'}</td>
                      <td>{formatPeso(report?.totals?.totalSales || 0)}</td>
                      <td>{formatPeso(report?.totals?.totalExpenses || 0)}</td>
                      <td>{formatPeso(report?.totals?.netProfit || 0)}</td>
                      <td className="dailyReports__rowActions">
                        <Link className="btn btn-secondary" to={`/view/${report.id}`}>
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
        )
      ) : viewMode === 'combined' && combinedDailyRows.length === 0 ? (
        <div className="dailyReports__empty">
          <div className="dailyReports__emptyCard">
            <h3>No combined data</h3>
            <p>No reports available to combine for the selected date filter.</p>
            <button
              onClick={() => setSelectedDate('')}
              className="dailyReports__primaryLink dailyReports__primaryLink--wide"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>
        </div>
      ) : (
        <section className="dailyReports__tableCard">
          <div className="dailyReports__tableWrap">
            <table className="dailyReports__table" aria-label="Combined daily reports table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Canteens</th>
                  <th>Reports</th>
                  <th>Total Sales</th>
                  <th>Total Expenses</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {combinedDailyRows.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.locationCount}</td>
                    <td>{row.reportCount}</td>
                    <td>{formatPeso(row.totals.totalSales)}</td>
                    <td>{formatPeso(row.totals.totalExpenses)}</td>
                    <td>{formatPeso(row.totals.netProfit)}</td>
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
