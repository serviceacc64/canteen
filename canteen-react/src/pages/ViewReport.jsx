import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getReportById } from '../services/reportsApi';
import { formatPeso } from '../utils/format';
import '../css/ViewReport.css';

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const getSectionTotal = (rows = []) => rows.reduce((sum, row) => sum + toNumber(row.amount), 0);

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
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const data = await getReportById(id);
        setReport(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadReport();
    }
  }, [id]);

  if (loading) {
    return <div className="page"><p>Loading report...</p></div>;
  }

  if (!report || error) {
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
        <Link className="btn btn-secondary" to="/daily">Back to Daily Reports</Link>
        <Link className="btn btn-primary" to="/entry">Create Another Entry</Link>
      </div>
    </div>
  );
};

export default ViewReport;
