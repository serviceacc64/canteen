import { Link, useParams } from 'react-router-dom';
import { getReportById } from '../services/reportsApi';
import { formatPeso } from '../utils/format';
import '../css/ViewReport.css';

const ViewReport = () => {
  const { id } = useParams();
  const report = getReportById(id);

  if (!report) {
    return (
      <div className="page viewReport">
        <header className="viewReport__header">
          <div>
            <h1 className="viewReport__title">View Report</h1>
            <p className="viewReport__subtitle">Report not found or may have been removed.</p>
          </div>
        </header>

        <div className="viewReport__actions">
          <Link className="btn btn-secondary" to="/daily">Back to Daily Reports</Link>
          <Link className="btn btn-primary" to="/entry">Create New Entry</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page viewReport">
      <header className="viewReport__header">
        <div>
          <h1 className="viewReport__title">Report Details</h1>
          <p className="viewReport__subtitle">Saved report overview and totals.</p>
        </div>
      </header>

      <section className="viewReport__meta" aria-label="Report metadata">
        <div className="viewReport__metaItem">
          <span className="viewReport__metaLabel">Date</span>
          <span className="viewReport__metaValue">{report.date || '-'}</span>
        </div>
        <div className="viewReport__metaItem">
          <span className="viewReport__metaLabel">Canteen</span>
          <span className="viewReport__metaValue">{report.canteenLocation || '-'}</span>
        </div>
      </section>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Sales</h3>
          <p>{formatPeso(report?.totals?.totalSales || 0)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p>{formatPeso(report?.totals?.totalExpenses || 0)}</p>
        </div>
        <div className="summary-card">
          <h3>Net Profit</h3>
          <p>{formatPeso(report?.totals?.netProfit || 0)}</p>
        </div>
      </div>

      <div className="viewReport__actions">
        <Link className="btn btn-secondary" to="/daily">Back to Daily Reports</Link>
        <Link className="btn btn-primary" to="/entry">Create Another Entry</Link>
      </div>
    </div>
  );
};

export default ViewReport;
