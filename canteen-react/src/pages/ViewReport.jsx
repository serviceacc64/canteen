import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

const ReportTableSection = ({ title, rows = [], totalLabel = "Total" }) => {
  const sectionTotal = useMemo(() => getSectionTotal(rows), [rows]);

  return (
    <section className="viewReport__section" aria-label={title}>
      <div className="viewReport__sectionHeader">
        <h2 className="viewReport__sectionTitle">{title}</h2>
        <p className="viewReport__sectionTotal">
          {totalLabel}: {formatPeso(sectionTotal)}
        </p>
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
                      <span>{row.label || "-"}</span>
                      {row.group ? (
                        <small className="viewReport__muted">{row.group}</small>
                      ) : null}
                    </div>
                  </td>
                  <td className="is-right">
                    {formatPeso(toNumber(row.amount))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="viewReport__empty">
                  No rows saved for this section.
                </td>
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
        <p>Loading report...</p>
      </div>
    );
  }

  if (isAggregated && reports.length === 0) {
    return (
      <div className="page viewReport">
        <header className="viewReport__header">
          <div>
            <h1 className="viewReport__title">
              View {period.charAt(0).toUpperCase() + period.slice(1)} Report
            </h1>
            <p className="viewReport__subtitle">
              No reports found for {period} {periodKey}.
            </p>
          </div>
        </header>
        <div className="viewReport__actions">
          <Link className="btn btn-secondary" to={`/${period}`}>
            Back to {period.charAt(0).toUpperCase() + period.slice(1)} Reports
          </Link>
          {period === "monthly" || period === "yearly" ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={period === "monthly" ? handleExportMonthly : handleExportYearly}
              disabled={period === "monthly" ? exportingMonthly : exportingYearly}
            >
              { (period === "monthly" ? exportingMonthly : exportingYearly) ? "Exporting..." : "Export As Excel" }
            </button>
          ) : null}
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
            <p className="viewReport__subtitle">
              Report not found or may have been removed.
            </p>
          </div>
        </header>
        <div className="viewReport__actions">
          <Link className="btn btn-secondary" to="/daily">
            Back to Daily Reports
          </Link>
          <Link className="btn btn-primary" to="/entry">
            Create New Entry
          </Link>
        </div>
      </div>
    );
  }

  if (isAggregated) {
    return (
      <div className="page viewReport">
        <header className="viewReport__header">
          <div>
            <h1 className="viewReport__title">
              {period.charAt(0).toUpperCase() + period.slice(1)} Report for{" "}
              {periodKey}
            </h1>
            <p className="viewReport__subtitle">
              All daily reports aggregated for this {period}.
            </p>
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

        {period === "monthly" ? (
          <section className="viewReport__tableCard">
            <div className="viewReport__tableWrap">
              <table
                className="viewReport__table"
                aria-label="Monthly canteen summary table"
              >
                <thead>
                  <tr>
                    <th>Canteen</th>
                    <th className="is-right">Wages</th>
                    <th className="is-right">SSS</th>
                    <th className="is-right">Store Supplies</th>
                    <th className="is-right">Purchases</th>
                    <th className="is-right">Total Expenses</th>
                    <th className="is-right">Gross Sales</th>
                    <th className="is-right">Net Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyByCanteen.length ? (
                    monthlyByCanteen.map((row) => (
                      <tr key={row.canteen}>
                        <td>{row.canteen}</td>
                        <td className="is-right">{formatPeso(row.wages)}</td>
                        <td className="is-right">{formatPeso(row.sss)}</td>
                        <td className="is-right">
                          {formatPeso(row.storeSupplies)}
                        </td>
                        <td className="is-right">
                          {formatPeso(row.purchases)}
                        </td>
                        <td className="is-right">
                          {formatPeso(row.totalExpenses)}
                        </td>
                        <td className="is-right">
                          {formatPeso(row.grossSales)}
                        </td>
                        <td className="is-right">{formatPeso(row.netSales)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="viewReport__empty">
                        No reports found for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td className="is-right">
                      {formatPeso(
                        monthlyByCanteen.reduce((s, r) => s + r.wages, 0),
                      )}
                    </td>
                    <td className="is-right">
                      {formatPeso(
                        monthlyByCanteen.reduce((s, r) => s + r.sss, 0),
                      )}
                    </td>
                    <td className="is-right">
                      {formatPeso(
                        monthlyByCanteen.reduce(
                          (s, r) => s + r.storeSupplies,
                          0,
                        ),
                      )}
                    </td>
                    <td className="is-right">
                      {formatPeso(
                        monthlyByCanteen.reduce((s, r) => s + r.purchases, 0),
                      )}
                    </td>
                    <td className="is-right">
                      {formatPeso(
                        monthlyByCanteen.reduce(
                          (s, r) => s + r.totalExpenses,
                          0,
                        ),
                      )}
                    </td>
                    <td className="is-right">
                      {formatPeso(
                        monthlyByCanteen.reduce((s, r) => s + r.grossSales, 0),
                      )}
                    </td>
                    <td className="is-right">
                      {formatPeso(
                        monthlyByCanteen.reduce((s, r) => s + r.netSales, 0),
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        ) : (
          <section className="viewReport__tableCard">
            <div className="viewReport__tableWrap">
              <table
                className="viewReport__table"
                aria-label={`${period} reports table`}
              >
                <thead>
                  <tr>
                    <th>Month</th>
                    <th className="is-right">Wages</th>
                    <th className="is-right">SSS</th>
                    <th className="is-right">Store Supplies</th>
                    <th className="is-right">Purchases</th>
                    <th className="is-right">Total Expenses</th>
                    <th className="is-right">Total Sales</th>
                    <th className="is-right">Net Profit</th>
                    <th className="is-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyByMonth.length ? (
                    yearlyByMonth.map((row) => (
                      <tr key={row.month}>
                        <td>{row.monthName}</td>
                        <td className="is-right">{formatPeso(row.wages)}</td>
                        <td className="is-right">{formatPeso(row.sss)}</td>
                        <td className="is-right">
                          {formatPeso(row.storeSupplies)}
                        </td>
                        <td className="is-right">
                          {formatPeso(row.purchases)}
                        </td>
                        <td className="is-right">
                          {formatPeso(row.totalExpenses)}
                        </td>
                        <td className="is-right">
                          {formatPeso(row.totalSales)}
                        </td>
                        <td className="is-right">
                          {formatPeso(row.netProfit)}
                        </td>
                        <td className="viewReport__rowActions is-right">
                          <Link
                            className="btn btn-secondary"
                            to={`/view/monthly/${row.month}`}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="viewReport__empty">
                        No reports found for this year.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </section>
        )}

        <div className="viewReport__actions">
          <Link className="btn btn-secondary" to={`/${period}`}>
            Back to {period.charAt(0).toUpperCase() + period.slice(1)} Reports
          </Link>
          {period === "monthly" || period === "yearly" ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={period === "monthly" ? handleExportMonthly : handleExportYearly}
              disabled={period === "monthly" ? exportingMonthly : exportingYearly}
            >
              { (period === "monthly" ? exportingMonthly : exportingYearly) ? "Exporting..." : "Export As Excel" }
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="page viewReport">
      <header className="viewReport__header">
        <div>
          <h1 className="viewReport__title">Report Details</h1>
          <p className="viewReport__subtitle">
            Complete report information with all line items and totals.
          </p>
        </div>
      </header>

      <section className="viewReport__meta" aria-label="Report metadata">
        <div className="viewReport__metaItem">
          <span className="viewReport__metaLabel">Date</span>
          <span className="viewReport__metaValue">{report.date || "-"}</span>
        </div>
        <div className="viewReport__metaItem">
          <span className="viewReport__metaLabel">Canteen</span>
          <span className="viewReport__metaValue">
            {report.canteenLocation || "-"}
          </span>
        </div>
        <div className="viewReport__metaItem">
          <span className="viewReport__metaLabel">Remarks</span>
          <span className="viewReport__metaValue is-wrap">
            {report.remarks || "-"}
          </span>
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
        <ReportTableSection
          title="Cash Sales"
          rows={report.cashSalesRows}
          totalLabel="Cash Sales Total"
        />
        <ReportTableSection
          title="Store Purchases"
          rows={report.storePurchaseRows}
          totalLabel="Store Purchases Total"
        />
        <ReportTableSection
          title="Store Consignment"
          rows={report.storeConsignmentRows}
          totalLabel="Store Consignment Total"
        />
        <ReportTableSection
          title="Operating Expenses"
          rows={report.operatingExpensesRows}
          totalLabel="Operating Expenses Total"
        />
        <ReportTableSection
          title="Salary Breakdown"
          rows={report.salaryBreakdownRows}
          totalLabel="Salary Total"
        />
      </div>

      <div className="viewReport__actions">
        <Link className="btn btn-secondary" to={`/entry?edit=${id}`}>
          Edit Report
        </Link>
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export As Excel"}
        </button>
      </div>
    </div>
  );
};

export default ViewReport;
