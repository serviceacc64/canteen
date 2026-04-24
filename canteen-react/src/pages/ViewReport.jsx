import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getReportById } from '../services/reportsApi';
import useReports from '../hooks/useReports';
import { exportDailyReportToTemplate } from '../utils/excelExport';
import { formatPeso } from '../utils/format';
import '../css/ViewReport.css';

const toNumber = (value) => {
  const n = Number(value) / 100;
  return Number.isFinite(n) ? n : 0;
};

const getSectionTotal = (rows = []) => rows.reduce((sum, row) => sum + toNumber(row.amount), 0);

const monthKey = (dateValue) => {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const yearKey = (dateValue) => {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return `${date.getFullYear()}`;
};

const ReportTableSection = ({ title, rows = [], totalLabel = 'Total' }) => {
  const sectionTotal = useMemo(() => getSectionTotal(rows), [rows]);

  return (
    <section className="viewReport__section" aria-label={title}>
      <div className="viewReport__sectionHeader">
        <h2 className="viewReport__sectionTitle">{title}</h2>
        <p className="viewReport__sectionTotal">{totalLabel}: {formatPeso(sectionTotal)}</p>
      </div>

      <div className="viewReport__tableWrap">
        <table className="viewReport__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th className="is-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={row.id || `${title}-${index}`}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="viewReport__itemCell">
                      <span>{row.label || '-'}</span>
                      {row.group ? <small className="viewReport__muted">{row.group}</small> : null}
                    </div>
                  </td>
                  <td className="is-right">{formatPeso(toNumber(row.amount))}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="viewReport__empty">No rows saved for this section.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>{totalLabel}</td>
              <td className="is-right">{formatPeso(sectionTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
};

const ViewReport = () => {
  const { id } = useParams();
  const { reports: allReports, loading: reportsLoading } = useReports();
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAggregated, setIsAggregated] = useState(false);
  const [period, setPeriod] = useState('');
  const [periodKey, setPeriodKey] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (reportsLoading) return;

    setLoading(true);
    setError(null);

    if (id.startsWith('monthly/')) {
      setIsAggregated(true);
      setPeriod('monthly');
      const key = id.split('/')[1];
      setPeriodKey(key);
      const filtered = allReports.filter(r => monthKey(r.date) === key);
      setReports(filtered);
      setLoading(false);
    } else if (id.startsWith('yearly/')) {
      setIsAggregated(true);
      setPeriod('yearly');
      const key = id.split('/')[1];
      setPeriodKey(key);
      const filtered = allReports.filter(r => yearKey(r.date) === key);
      setReports(filtered);
      setLoading(false);
    } else {
      setIsAggregated(false);
      const loadReport = async () => {
        try {
          const data = await getReportById(id);
          setReport(data);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      loadReport();
    }
  }, [id, allReports, reportsLoading]);

  const aggregatedTotals = useMemo(() => {
    if (!isAggregated) return {};
    return reports.reduce((acc, r) => ({
      totalSales: acc.totalSales + (r?.totals?.totalSales || 0),
      totalExpenses: acc.totalExpenses + (r?.totals?.totalExpenses || 0),
      netProfit: acc.netProfit + (r?.totals?.netProfit || 0),
    }), { totalSales: 0, totalExpenses: 0, netProfit: 0 });
  }, [reports, isAggregated]);

  const handleExport = async () => {
    if (!report) return;
    setExporting(true);
    try {
      await exportDailyReportToTemplate(report);
    } catch (exportError) {
      console.error('Failed to export report:', exportError);
      alert('Unable to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading || reportsLoading) {
    return <div className="page"><p>Loading report...</p></div>;
  }

  if (isAggregated && reports.length === 0) {
    return (
      <div className="page viewReport">
        <header className="viewReport__header">
          <div>
            <h1 className="viewReport__title">View {period.charAt(0).toUpperCase() + period.slice(1)} Report</h1>
            <p className="viewReport__subtitle">No reports found for {period} {periodKey}.</p>
          </div>
        </header>
        <div className="viewReport__actions">
          <Link className="btn btn-secondary" to={`/${period}`}>Back to {period.charAt(0).toUpperCase() + period.slice(1)} Reports</Link>
        </div>
      </div>
    );
  }

  if (!isAggregated && (!report || error)) {
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

  if (isAggregated) {
    return (
      <div className="page viewReport">
        <header className="viewReport__header">
          <div>
            <h1 className="viewReport__title">{period.charAt(0).toUpperCase() + period.slice(1)} Report for {periodKey}</h1>
            <p className="viewReport__subtitle">All daily reports aggregated for this {period}.</p>
          </div>
        </header>

        <section className="viewReport__totals" aria-label="Overall totals">
          <div className="summary-card">
            <h3>Total Sales</h3>
            <p>{formatPeso(aggregatedTotals.totalSales)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Expenses</h3>
            <p>{formatPeso(aggregatedTotals.totalExpenses)}</p>
          </div>
          <div className="summary-card">
            <h3>Net Profit</h3>
            <p>{formatPeso(aggregatedTotals.netProfit)}</p>
          </div>
        </section>

        <section className="viewReport__tableCard">
          <div className="viewReport__tableWrap">
            <table className="viewReport__table" aria-label={`${period} reports table`}>
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
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date || '-'}</td>
                    <td>{r.canteenLocation || '-'}</td>
                    <td>{formatPeso(r?.totals?.totalSales || 0)}</td>
                    <td>{formatPeso(r?.totals?.totalExpenses || 0)}</td>
                    <td>{formatPeso(r?.totals?.netProfit || 0)}</td>
                    <td className="viewReport__rowActions">
                      <Link className="viewReport__link" to={`/view/${r.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="viewReport__actions">
          <Link className="btn btn-secondary" to={`/${period}`}>Back to {period.charAt(0).toUpperCase() + period.slice(1)} Reports</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page viewReport">
      <header className="viewReport__header">
        <div>
          <h1 className="viewReport__title">Report Details</h1>
          <p className="viewReport__subtitle">Complete report information with all line items and totals.</p>
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
        <div className="viewReport__metaItem">
          <span className="viewReport__metaLabel">Remarks</span>
          <span className="viewReport__metaValue is-wrap">{report.remarks || '-'}</span>
        </div>
      </section>

      <section className="viewReport__totals" aria-label="Overall totals">
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
      </section>

      <div className="viewReport__sections">
        <ReportTableSection title="Cash Sales" rows={report.cashSalesRows} totalLabel="Cash Sales Total" />
        <ReportTableSection title="Store Purchases" rows={report.storePurchaseRows} totalLabel="Store Purchases Total" />
        <ReportTableSection title="Store Consignment" rows={report.storeConsignmentRows} totalLabel="Store Consignment Total" />
        <ReportTableSection title="Operating Expenses" rows={report.operatingExpensesRows} totalLabel="Operating Expenses Total" />
        <ReportTableSection title="Salary Breakdown" rows={report.salaryBreakdownRows} totalLabel="Salary Total" />
      </div>

      <div className="viewReport__actions">
        <Link className="btn btn-secondary" to={`/entry?edit=${id}`}>Edit Report</Link>
        <button className="btn btn-primary" type="button" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Exporting...' : 'Export As Excel'}
        </button>
      </div>
    </div>
  );
};

export default ViewReport;
