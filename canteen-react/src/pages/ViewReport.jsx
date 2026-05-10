import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  Edit3,
  FileText,
  Calendar,
  MapPin,
  MessageSquare,
  TrendingUp,
  CreditCard,
  ShoppingCart,
  Package,
  Activity,
  Users,
} from "lucide-react";
import { getReportById } from "../services/reportsApi";
import useReports from "../hooks/useReports";
import {
  exportDailyReportToTemplate,
  exportMonthlyReportToTemplate,
  exportYearlyReportToTemplate,
} from "../utils/excelExport";
import { formatPeso } from "../utils/format";
import "../css/ViewReport.css";

const toNumber = (value) => {
  const n = Number(value) / 100;
  return Number.isFinite(n) ? n : 0;
};

const getSectionTotal = (rows = []) =>
  rows.reduce((sum, row) => sum + toNumber(row.amount), 0);

const monthKey = (dateValue) => {
  if (!dateValue) return "Unknown";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const yearKey = (dateValue) => {
  if (!dateValue) return "Unknown";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.getFullYear()}`;
};

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

const ReportTableSection = ({
  title,
  rows = [],
  totalLabel = "Total",
  icon: Icon,
}) => {
  const sectionTotal = useMemo(() => getSectionTotal(rows), [rows]);

  return (
    <section className="view-section">
      <div className="view-section__header">
        <div className="view-section__title-group">
          {Icon && <Icon className="view-section__icon" size={20} />}
          <h2 className="view-section__title">{title}</h2>
        </div>
        <div className="view-section__total">
          <span className="view-section__total-label">{totalLabel}</span>
          <span className="view-section__total-value">
            {formatPeso(sectionTotal)}
          </span>
        </div>
      </div>

      <div className="view-section__content">
        <table className="view-table">
          <thead>
            <tr>
              <th width="60">No.</th>
              <th>Description</th>
              <th className="text-right" width="150">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={row.id || `${title}-${index}`}>
                  <td className="text-muted">{index + 1}</td>
                  <td>
                    <div className="view-table__item">
                      <span className="view-table__label">
                        {row.label || "-"}
                      </span>
                      {row.group && (
                        <span className="view-table__group">{row.group}</span>
                      )}
                    </div>
                  </td>
                  <td className="text-right font-semibold">
                    {formatPeso(toNumber(row.amount))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-muted italic">
                  No records found in this section
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const ViewReport = () => {
  const { id, month, year } = useParams();
  const { reports: allReports, loading: reportsLoading } = useReports();
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAggregated, setIsAggregated] = useState(false);
  const [period, setPeriod] = useState("");
  const [periodKey, setPeriodKey] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportingMonthly, setExportingMonthly] = useState(false);
  const [exportingYearly, setExportingYearly] = useState(false);

  useEffect(() => {
    if (reportsLoading) return;

    setLoading(true);
    setError(null);

    if (month) {
      setIsAggregated(true);
      setPeriod("monthly");
      setPeriodKey(month);

      const loadMonthly = async () => {
        try {
          const filtered = allReports.filter((r) => monthKey(r.date) === month);
          const detailed = await Promise.all(
            filtered.map(async (r) => {
              try {
                return await getReportById(r.id);
              } catch {
                return null;
              }
            }),
          );
          setReports(detailed.filter(Boolean));
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      loadMonthly();
      return;
    }

    if (year) {
      setIsAggregated(true);
      setPeriod("yearly");
      setPeriodKey(year);

      const loadYearly = async () => {
        try {
          const filtered = allReports.filter((r) => yearKey(r.date) === year);
          const detailed = await Promise.all(
            filtered.map(async (r) => {
              try {
                return await getReportById(r.id);
              } catch {
                return null;
              }
            }),
          );
          setReports(detailed.filter(Boolean));
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      loadYearly();
      return;
    }

    {
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
  }, [id, month, year, allReports, reportsLoading]);

  const aggregatedTotals = useMemo(() => {
    if (!isAggregated) return {};
    return reports.reduce(
      (acc, r) => ({
        totalSales: acc.totalSales + (r?.totals?.totalSales || 0),
        totalExpenses: acc.totalExpenses + (r?.totals?.totalExpenses || 0),
        netProfit: acc.netProfit + (r?.totals?.netProfit || 0),
      }),
      { totalSales: 0, totalExpenses: 0, netProfit: 0 },
    );
  }, [reports, isAggregated]);

  const yearlyByMonth = useMemo(() => {
    if (!isAggregated || period !== "yearly") return [];

    const map = new Map();

    (reports ?? []).forEach((r) => {
      const mKey = monthKey(r.date);
      if (mKey === "Unknown") return;

      const current = map.get(mKey) || {
        month: mKey,
        wages: 0,
        sss: 0,
        storeSupplies: 0,
        purchases: 0,
        totalSales: 0,
        totalExpenses: 0,
        netProfit: 0,
      };

      current.totalSales += r?.totals?.totalSales || 0;
      current.totalExpenses += r?.totals?.totalExpenses || 0;
      current.netProfit += r?.totals?.netProfit || 0;

      const op = r?.operatingExpensesRows ?? [];
      current.wages += getSectionTotal(r?.salaryBreakdownRows ?? []);
      current.sss += sumRowsByLabel(op, "SSS of Helpers");
      current.storeSupplies +=
        sumRowsByLabel(op, "Utility Expenses") +
        sumRowsByLabel(op, "LPG") +
        sumRowsByLabel(op, "Others");

      current.purchases += getSectionTotal(r?.storePurchaseRows ?? []);

      map.set(mKey, current);
    });

    const getMonthName = (mKey) => {
      const [y, m] = mKey.split("-");
      const date = new Date(parseInt(y), parseInt(m) - 1, 1);
      return date.toLocaleString("default", { month: "long", year: "numeric" });
    };

    return [...map.values()]
      .sort((a, b) => b.month.localeCompare(a.month))
      .map((row) => ({
        ...row,
        monthName: getMonthName(row.month),
      }));
  }, [isAggregated, period, reports]);

  const monthlyByCanteen = useMemo(() => {
    if (!isAggregated || period !== "monthly") return [];

    const map = new Map();

    (reports ?? []).forEach((r) => {
      const name = r?.canteenLocation || "-";
      const current = map.get(name) || {
        canteen: name,
        wages: 0,
        sss: 0,
        storeSupplies: 0,
        purchases: 0,
        grossSales: 0,
        totalExpenses: 0,
        netSales: 0,
      };

      const op = r?.operatingExpensesRows ?? [];
      current.wages += getSectionTotal(r?.salaryBreakdownRows ?? []);
      current.sss += sumRowsByLabel(op, "SSS of Helpers");
      current.storeSupplies +=
        sumRowsByLabel(op, "Utility Expenses") +
        sumRowsByLabel(op, "LPG") +
        sumRowsByLabel(op, "Others");

      current.purchases += getSectionTotal(r?.storePurchaseRows ?? []);
      current.grossSales += getSectionTotal(r?.cashSalesRows ?? []);

      map.set(name, current);
    });

    const rows = [...map.values()].map((row) => {
      const totalExpenses =
        row.wages + row.sss + row.storeSupplies + row.purchases;
      const netSales = totalExpenses - row.grossSales;
      return { ...row, totalExpenses, netSales };
    });

    return rows.sort((a, b) => a.canteen.localeCompare(b.canteen));
  }, [isAggregated, period, reports]);

  const handleExport = async () => {
    if (!report) return;
    setExporting(true);
    try {
      await exportDailyReportToTemplate(report);
    } catch (exportError) {
      console.error("Failed to export report:", exportError);
      alert("Unable to export report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportMonthly = async () => {
    if (!isAggregated || period !== "monthly") return;
    setExportingMonthly(true);
    try {
      await exportMonthlyReportToTemplate({
        month: periodKey,
        rows: monthlyByCanteen,
      });
    } catch (exportError) {
      console.error("Failed to export monthly summary:", exportError);
      alert("Unable to export monthly summary. Please try again.");
    } finally {
      setExportingMonthly(false);
    }
  };

  const handleExportYearly = async () => {
    if (!isAggregated || period !== "yearly") return;
    setExportingYearly(true);
    try {
      await exportYearlyReportToTemplate({
        year: periodKey,
        rows: yearlyByMonth,
      });
    } catch (exportError) {
      console.error("Failed to export yearly summary:", exportError);
      alert("Unable to export yearly summary. Please try again.");
    } finally {
      setExportingYearly(false);
    }
  };

  if (loading || reportsLoading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Retrieving financial records...</p>
        </div>
      </div>
    );
  }

  if (isAggregated && reports.length === 0) {
    return (
      <div className="page viewReport">
        <div className="view-header">
          <div className="view-header__left">
            <Link to={`/${period}`} className="back-link">
              <ArrowLeft size={16} />
              <span>Back to {period}</span>
            </Link>
            <h1 className="view-header__title">
              {period.charAt(0).toUpperCase() + period.slice(1)} Summary
            </h1>
          </div>
        </div>
        <div className="empty-state">
          <FileText size={48} className="text-muted" />
          <p>
            No reports found for {period} {periodKey}.
          </p>
        </div>
      </div>
    );
  }

  if (!isAggregated && (!report || error)) {
    return (
      <div className="page viewReport">
        <div className="view-header">
          <div className="view-header__left">
            <Link to="/daily" className="back-link">
              <ArrowLeft size={16} />
              <span>Back to Reports</span>
            </Link>
            <h1 className="view-header__title">Report Error</h1>
          </div>
        </div>
        <div className="empty-state">
          <FileText size={48} className="text-muted" />
          <p>Report not found or may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page viewReport">
      <header className="view-header">
        <div className="view-header__left">
          <Link
            to={isAggregated ? `/${period}` : "/daily"}
            className="back-link"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>
          <div className="view-header__main">
            <h1 className="view-header__title">
              {isAggregated
                ? `${period.charAt(0).toUpperCase() + period.slice(1)} Analytics: ${periodKey}`
                : "Financial Statement"}
            </h1>
            {!isAggregated && (
              <div className="view-header__badges">
                <div className="badge badge--neutral">
                  <Calendar size={12} />
                  <span>{report.date}</span>
                </div>
                <div className="badge badge--primary">
                  <MapPin size={12} />
                  <span>{report.canteenLocation}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="view-header__actions">
          {!isAggregated ? (
            <>
              <Link
                to={`/entry?edit=${id}`}
                className="btn-icon btn-icon--secondary"
                title="Edit Statement"
              >
                <Edit3 size={18} />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-icon btn-icon--primary"
                title="Export to Excel"
              >
                <Download size={18} />
                <span>{exporting ? "Exporting..." : "Excel"}</span>
              </button>
            </>
          ) : (
            <button
              onClick={
                period === "monthly" ? handleExportMonthly : handleExportYearly
              }
              disabled={
                period === "monthly" ? exportingMonthly : exportingYearly
              }
              className="btn-icon btn-icon--primary"
            >
              <Download size={18} />
              <span>
                {(period === "monthly" ? exportingMonthly : exportingYearly)
                  ? "Exporting..."
                  : "Export Excel"}
              </span>
            </button>
          )}
        </div>
      </header>

      <section className="stats-overview">
        <div className="stat-card stat-card--success">
          <div className="stat-card__icon">
            <TrendingUp size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Gross Revenue</span>
            <span className="stat-card__value">
              {formatPeso(
                isAggregated
                  ? aggregatedTotals.totalSales
                  : report?.totals?.totalSales,
              )}
            </span>
          </div>
        </div>
        <div className="stat-card stat-card--danger">
          <div className="stat-card__icon">
            <Activity size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Operational Costs</span>
            <span className="stat-card__value">
              {formatPeso(
                isAggregated
                  ? aggregatedTotals.totalExpenses
                  : report?.totals?.totalExpenses,
              )}
            </span>
          </div>
        </div>
        <div className="stat-card stat-card--primary">
          <div className="stat-card__icon">
            <Activity size={20} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Net Performance</span>
            <span className="stat-card__value">
              {formatPeso(
                isAggregated
                  ? aggregatedTotals.netProfit
                  : report?.totals?.netProfit,
              )}
            </span>
          </div>
        </div>
      </section>

      {!isAggregated && report.remarks && (
        <section className="remarks-card">
          <div className="remarks-card__header">
            <MessageSquare size={16} />
            <span>Audit Remarks</span>
          </div>
          <p className="remarks-card__text">{report.remarks}</p>
        </section>
      )}

      {isAggregated ? (
        <div className="aggregated-content">
          <div className="reports-table-card">
            <div className="table-header">
              <h3 className="table-header__title">
                {period === "monthly"
                  ? "Branch Breakdown"
                  : "Monthly Trajectory"}
              </h3>
            </div>
            <div className="reports-table-wrap">
              <table className="reports-table">
                {period === "monthly" ? (
                  <>
                    <thead>
                      <tr>
                        <th>Canteen Unit</th>
                        <th className="text-right">Wages</th>
                        <th className="text-right">Supplies</th>
                        <th className="text-right">Purchases</th>
                        <th className="text-right">Total Costs</th>
                        <th className="text-right">Revenue</th>
                        <th className="text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyByCanteen.map((row) => (
                        <tr key={row.canteen} className="reports-table__row">
                          <td className="font-bold">{row.canteen}</td>
                          <td className="text-right">
                            {formatPeso(row.wages)}
                          </td>
                          <td className="text-right">
                            {formatPeso(row.storeSupplies)}
                          </td>
                          <td className="text-right">
                            {formatPeso(row.purchases)}
                          </td>
                          <td className="text-right text-danger">
                            {formatPeso(row.totalExpenses)}
                          </td>
                          <td className="text-right text-success">
                            {formatPeso(row.grossSales)}
                          </td>
                          <td className="text-right font-bold">
                            {formatPeso(row.netSales)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <>
                    <thead>
                      <tr>
                        <th>Month Period</th>
                        <th className="text-right">Operational Costs</th>
                        <th className="text-right">Gross Revenue</th>
                        <th className="text-right">Net Performance</th>
                        <th className="text-right" width="100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyByMonth.map((row) => (
                        <tr key={row.month} className="reports-table__row">
                          <td className="font-bold">{row.monthName}</td>
                          <td className="text-right text-danger">
                            {formatPeso(row.totalExpenses)}
                          </td>
                          <td className="text-right text-success">
                            {formatPeso(row.totalSales)}
                          </td>
                          <td className="text-right font-bold text-primary">
                            {formatPeso(row.netProfit)}
                          </td>
                          <td className="text-right">
                            <Link
                              to={`/view/monthly/${row.month}`}
                              className="action-btn action-btn--view"
                            >
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="statement-sections">
          <ReportTableSection
            title="Cash Revenue Streams"
            rows={report.cashSalesRows}
            totalLabel="Gross Sales"
            icon={CreditCard}
          />
          <ReportTableSection
            title="Store Purchases"
            rows={report.storePurchaseRows}
            totalLabel="Purchase Total"
            icon={ShoppingCart}
          />
          <ReportTableSection
            title="Stock Consignment"
            rows={report.storeConsignmentRows}
            totalLabel="Consignment Total"
            icon={Package}
          />
          <ReportTableSection
            title="Operating Overhead"
            rows={report.operatingExpensesRows}
            totalLabel="Overhead Total"
            icon={Activity}
          />
          <ReportTableSection
            title="Workforce Remuneration"
            rows={report.salaryBreakdownRows}
            totalLabel="Total Payroll"
            icon={Users}
          />
        </div>
      )}
    </div>
  );
};

export default ViewReport;
