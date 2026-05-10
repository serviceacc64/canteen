import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Eye, 
  Trash2, 
  FileText, 
  TrendingUp, 
  BarChart3,
  Award,
  ChevronRight
} from "lucide-react";
import Button from "../components/common/Button";
import useReports from "../hooks/useReports";
import { formatPeso } from "../utils/format";
import "../css/YearlyReport.css";

const toNumber = (value) => {
  const n = Number(value) / 100;
  return Number.isFinite(n) ? n : 0;
};

const getSectionTotal = (rows = []) =>
  rows.reduce((sum, row) => sum + toNumber(row.amount), 0);

const normalizeLabel = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const sumRowsByLabel = (rows = [], wantedLabel) => {
  const wanted = normalizeLabel(wantedLabel);
  return (rows ?? []).reduce((sum, row) => {
    if (normalizeLabel(row?.label) !== wanted) return sum;
    return sum + toNumber(row?.amount);
  }, 0);
};

const yearKey = (dateValue) => {
  if (!dateValue) return "Unknown";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.getFullYear()}`;
};

const YearlyReports = () => {
  const { reports, loading, removeReport } = useReports();

  const grouped = useMemo(() => {
    const map = new Map();

    reports.forEach((report) => {
      const key = yearKey(report.date);
      const current = map.get(key) || {
        year: key,
        count: 0,
        wages: 0,
        sss: 0,
        storeSupplies: 0,
        purchases: 0,
        totalSales: 0,
        totalExpenses: 0,
        netProfit: 0,
      };

      current.totalSales += report?.totals?.totalSales || 0;
      current.totalExpenses += report?.totals?.totalExpenses || 0;
      current.netProfit += report?.totals?.netProfit || 0;
      current.count += 1;

      const op = report?.operatingExpensesRows ?? [];
      current.wages += getSectionTotal(report?.salaryBreakdownRows ?? []);
      current.sss += sumRowsByLabel(op, "SSS of Helpers");
      current.storeSupplies +=
        sumRowsByLabel(op, "Utility Expenses") +
        sumRowsByLabel(op, "LPG") +
        sumRowsByLabel(op, "Others");

      current.purchases += getSectionTotal(report?.storePurchaseRows ?? []);

      map.set(key, current);
    });

    return [...map.values()].sort((a, b) => b.year.localeCompare(a.year));
  }, [reports]);

  const onDelete = async (year) => {
    const confirmed = window.confirm(
      `Delete all records for fiscal year ${year} permanently? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      const reportsToDelete = reports.filter(
        (report) => yearKey(report.date) === year,
      );
      for (const report of reportsToDelete) {
        await removeReport(report.id);
      }
    } catch {
      window.alert("Operational error. Unable to purge reports.");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Synthesizing annual performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page yearly-reports">
      <header className="page-header">
        <div className="page-header__left">
          <div className="page-header__main">
            <h1 className="page-header__title">Annual Performance</h1>
            <p className="page-header__subtitle">Consolidated fiscal year auditing and trends</p>
          </div>
        </div>
        <div className="page-header__actions">
          <div className="stats-badge">
            <Award size={14} />
            <span>{grouped.length} Fiscal Years</span>
          </div>
        </div>
      </header>

      {grouped.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-card__icon">
            <FileText size={48} />
          </div>
          <h3>No annual data archived</h3>
          <p>Complete your daily logs to generate comprehensive yearly financial insights.</p>
        </div>
      ) : (
        <div className="yearly-grid">
          {grouped.map((row) => (
            <div className="yearly-card" key={row.year}>
              <div className="yearly-card__header">
                <div className="yearly-card__year-badge">{row.year}</div>
                <div className="yearly-card__badge">{row.count} Records</div>
              </div>

              <div className="yearly-card__summary">
                <div className="summary-block">
                  <span className="summary-block__label">Annual Revenue</span>
                  <span className="summary-block__value">{formatPeso(row.totalSales)}</span>
                </div>
                <div className="summary-block">
                  <span className="summary-block__label">Operational Costs</span>
                  <span className="summary-block__value">{formatPeso(row.totalExpenses)}</span>
                </div>
              </div>

              <div className="yearly-card__metrics">
                <div className="metric-item">
                  <span className="metric-item__label">Wages</span>
                  <span className="metric-item__value">{formatPeso(row.wages)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-item__label">SSS</span>
                  <span className="metric-item__value">{formatPeso(row.sss)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-item__label">Purchases</span>
                  <span className="metric-item__value">{formatPeso(row.purchases)}</span>
                </div>
              </div>

              <div className="yearly-card__profit">
                <div className="profit-info">
                  <span className="profit-label">Net Performance</span>
                  <div className="profit-amount">{formatPeso(row.netProfit)}</div>
                </div>
                <div className="yearly-card__actions">
                  <Link to={`/view/yearly/${row.year}`} className="btn-icon" title="Audit Year">
                    <Eye size={18} />
                  </Link>
                  <button 
                    onClick={() => onDelete(row.year)} 
                    className="btn-icon btn-icon--danger" 
                    title="Purge Year"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default YearlyReports;


