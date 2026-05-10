import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  PieChart,
  Plus,
  Calendar,
  Filter,
  X,
  Eye,
  Trash2,
  Layers,
  ArrowRight
} from "lucide-react";
import Button from "../components/common/Button";
import useReports from "../hooks/useReports";
import { formatPeso } from "../utils/format";
import "../css/DailyReports.css";

const DailyReports = () => {
  const { reports, loading, removeReport } = useReports();
  const [selectedDate, setSelectedDate] = useState("");
  const [viewMode, setViewMode] = useState("individual");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

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
  
  const stats = useMemo(() => sumTotals(filteredReports), [filteredReports]);

  const groupedReports =
    filteredReports.length > 0
      ? filteredReports.reduce((acc, report) => {
          const date = report?.date || "Unknown date";
          if (!acc[date]) acc[date] = [];
          acc[date].push(report);
          return acc;
        }, {})
      : {};

  const combinedDailyRows = Object.entries(groupedReports)
    .map(([date, dayReports]) => {
      const totals = sumTotals(dayReports);
      const uniqueLocations = new Set(
        dayReports.map((r) =>
          r?.canteenLocation ? String(r.canteenLocation) : "Unknown location",
        ),
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
    const confirmed = window.confirm("Are you sure you want to delete this operational report? This action is permanent.");
    if (!confirmed) return;

    try {
      await removeReport(id);
    } catch {
      window.alert("Operational error. Unable to purge the report record.");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Retrieving operational logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page daily-reports">
      <header className="page-header">
        <div className="page-header__left">
          <div className="page-header__main">
            <h1 className="page-header__title">Audit Journal</h1>
            <p className="page-header__subtitle">Daily operational logs and fiscal breakdown</p>
          </div>
        </div>
        
        <div className="page-header__actions">
          <div className="header-search">
            <Calendar size={14} className="header-search__icon" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="header-search__input"
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate("")} className="header-search__clear">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="view-toggle">
            <button 
              className={`view-toggle__btn ${viewMode === 'individual' ? 'is-active' : ''}`}
              onClick={() => {
                setViewMode("individual");
                setCurrentPage(1);
              }}
              title="Individual Logs"
            >
              <Filter size={14} />
            </button>
            <button 
              className={`view-toggle__btn ${viewMode === 'combined' ? 'is-active' : ''}`}
              onClick={() => {
                setViewMode("combined");
                setCurrentPage(1);
              }}
              title="Aggregated View"
            >
              <Layers size={14} />
            </button>
          </div>

          <Link to="/entry" className="btn btn-primary">
            <Plus size={16} />
            <span>New Session</span>
          </Link>
        </div>
      </header>

      <section className="dashboard__statsGrid">
        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--sales">
            <DollarSign size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Journal Revenue</span>
            <div className="stats-card__value">{formatPeso(stats.totalSales)}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--expenses">
            <Receipt size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Journal Costs</span>
            <div className="stats-card__value">{formatPeso(stats.totalExpenses)}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--profit">
            <PieChart size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Journal Yield</span>
            <div className="stats-card__value">{formatPeso(stats.netProfit)}</div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--reports">
            <Calendar size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Avg Session</span>
            <div className="stats-card__value">{formatPeso(stats.netProfit / (filteredReports.length || 1))}</div>
          </div>
        </div>
      </section>

      {reports.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-card__icon">
            <FileText size={48} />
          </div>
          <h3>Journal is empty</h3>
          <p>Initialize your first operational session to begin data aggregation.</p>
          <Link to="/entry" className="btn btn-primary">
            Record Entry
          </Link>
        </div>
      ) : !filteredReports.length ? (
        <div className="empty-state-card">
          <div className="empty-state-card__icon">
            <Calendar size={48} />
          </div>
          <h3>No records on this date</h3>
          <p>No operational logs match your current temporal filter.</p>
          <Button variant="secondary" onClick={() => setSelectedDate("")}>
            Reset Journal View
          </Button>
        </div>
      ) : viewMode === "individual" ? (
        <div className="audit-table-card">
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Operating Node</th>
                  <th>Gross Revenue</th>
                  <th>Operational Costs</th>
                  <th>Net Performance</th>
                  <th className="text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports
                  .slice(
                    (currentPage - 1) * entriesPerPage,
                    currentPage * entriesPerPage,
                  )
                  .map((report) => (
                    <tr key={report.id}>
                      <td className="font-bold">{report.date || "-"}</td>
                      <td>
                        <span className="location-badge">
                          {report.canteenLocation || "Unknown Node"}
                        </span>
                      </td>
                      <td className="text-success">{formatPeso(report?.totals?.totalSales || 0)}</td>
                      <td className="text-danger">
                        {formatPeso(report?.totals?.totalExpenses || 0)}
                      </td>
                      <td className="text-primary font-bold">{formatPeso(report?.totals?.netProfit || 0)}</td>
                      <td>
                        <div className="audit-actions">
                          <Link className="btn-icon" to={`/view/${report.id}`} title="View Details">
                            <Eye size={16} />
                          </Link>
                          <button
                            className="btn-icon btn-icon--danger"
                            onClick={() => onDelete(report.id)}
                            title="Purge Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length > entriesPerPage && (
            <div className="audit-pagination">
              <Button
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="pagination-info">
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{Math.ceil(filteredReports.length / entriesPerPage)}</strong>
              </span>
              <Button
                variant="secondary"
                disabled={
                  currentPage ===
                  Math.ceil(filteredReports.length / entriesPerPage)
                }
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="audit-table-card">
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Temporal Period</th>
                  <th>Nodes Active</th>
                  <th>Log Volume</th>
                  <th>Aggregate Revenue</th>
                  <th>Aggregate Costs</th>
                  <th>Net Performance</th>
                </tr>
              </thead>
              <tbody>
                {combinedDailyRows
                  .slice(
                    (currentPage - 1) * entriesPerPage,
                    currentPage * entriesPerPage,
                  )
                  .map((row) => (
                    <tr key={row.date}>
                      <td className="font-bold">{row.date}</td>
                      <td>
                        <span className="location-badge">{row.locationCount} Node(s)</span>
                      </td>
                      <td>
                        <span className="badge">{row.reportCount} Logs</span>
                      </td>
                      <td className="text-success">{formatPeso(row.totals.totalSales)}</td>
                      <td className="text-danger">{formatPeso(row.totals.totalExpenses)}</td>
                      <td className="text-primary font-bold">{formatPeso(row.totals.netProfit)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          
          {combinedDailyRows.length > entriesPerPage && (
            <div className="audit-pagination">
              <Button
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="pagination-info">
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{Math.ceil(combinedDailyRows.length / entriesPerPage)}</strong>
              </span>
              <Button
                variant="secondary"
                disabled={
                  currentPage ===
                  Math.ceil(combinedDailyRows.length / entriesPerPage)
                }
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyReports;

