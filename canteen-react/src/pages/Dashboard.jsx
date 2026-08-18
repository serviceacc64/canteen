import { useMemo, useState, useEffect, useRef } from "react";
import { Line, Bar } from "react-chartjs-2";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt, 
  PieChart,
  FileText,
  Calendar,
  BarChart3,
  Activity,
  CalendarDays,
  ChevronDown
} from "lucide-react";
import "../css/Dashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import useReports from "../hooks/useReports";
import { formatPeso } from "../utils/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const SALES_COLOR = "#16A34A";
const EXPENSES_COLOR = "#DC2626";

const MonthDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="month-dropdown" ref={ref}>
      <button
        className="month-dropdown__trigger"
        onClick={() => setOpen(!open)}
      >
        <span>{selected?.label || "Select month"}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="month-dropdown__panel">
          {options.map((o) => (
            <button
              key={o.value}
              className={`month-dropdown__item${o.value === value ? " month-dropdown__item--active" : ""}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { reports, loading } = useReports();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [chartMonth, setChartMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const filteredReports = useMemo(() => {
    let result = [...reports];
    if (fromDate) {
      result = result.filter(r => r.date >= fromDate);
    }
    if (toDate) {
      result = result.filter(r => r.date <= toDate);
    }
    return result;
  }, [reports, fromDate, toDate]);

  const summary = useMemo(() => {
    const reportCount = filteredReports.length;
    const totalSales = filteredReports.reduce(
      (sum, report) => sum + (report?.totals?.totalSales || 0),
      0,
    );
    const totalExpenses = filteredReports.reduce(
      (sum, report) => sum + (report?.totals?.totalExpenses || 0),
      0,
    );
    const netProfit = totalSales - totalExpenses;

    return { reportCount, totalSales, totalExpenses, netProfit };
  }, [filteredReports]);

  const sortedReports = useMemo(
    () =>
      [...filteredReports].sort((a, b) =>
        (a.date || "").localeCompare(b.date || ""),
      ),
    [filteredReports],
  );

  const availableMonths = useMemo(() => {
    const months = new Set();
    for (const r of sortedReports) {
      const key = (r.date || "").slice(0, 7);
      if (key) months.add(key);
    }
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [sortedReports]);

  useEffect(() => {
    if (availableMonths.length === 0) {
      setChartMonth("");
      return;
    }
    if (!chartMonth || !availableMonths.includes(chartMonth)) {
      setChartMonth(availableMonths[0]);
    }
  }, [availableMonths, chartMonth]);

  useEffect(() => {
    setSelectedDay("");
  }, [chartMonth]);

  const dailyReports = useMemo(
    () =>
      chartMonth
        ? sortedReports.filter((r) => (r.date || "").slice(0, 7) === chartMonth)
        : sortedReports,
    [sortedReports, chartMonth],
  );

  const dailyByDate = useMemo(() => {
    const byDate = new Map();
    for (const r of dailyReports) {
      const d = r.date || "";
      if (!d) continue;
      const entry = byDate.get(d) || { sales: 0, expenses: 0 };
      entry.sales += r?.totals?.totalSales || 0;
      entry.expenses += r?.totals?.totalExpenses || 0;
      byDate.set(d, entry);
    }
    return [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [dailyReports]);

  const reportsByDate = useMemo(() => {
    const map = new Map();
    for (const r of dailyReports) {
      const d = r.date || "";
      if (!d) continue;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(r);
    }
    for (const [d, list] of map) {
      list.sort((a, b) =>
        (a.canteenLocation || "").localeCompare(b.canteenLocation || "", undefined, {
          numeric: true,
        }),
      );
    }
    return map;
  }, [dailyReports]);

  const monthlyChartData = useMemo(() => {
    const monthTotals = new Map();
    for (const r of sortedReports) {
      const key = (r.date || "").slice(0, 7);
      if (!key) continue;
      const entry = monthTotals.get(key) || { sales: 0, expenses: 0 };
      entry.sales += r?.totals?.totalSales || 0;
      entry.expenses += r?.totals?.totalExpenses || 0;
      monthTotals.set(key, entry);
    }
    const keys = [...monthTotals.keys()].sort();
    const labels = keys.map((k) => {
      const [y, m] = k.split("-").map(Number);
      return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    });

    return {
      labels,
      datasets: [
        {
          label: "Sales",
          data: keys.map((k) => monthTotals.get(k).sales),
          borderColor: SALES_COLOR,
          backgroundColor: "rgba(46, 158, 99, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          interpolation: "monotone",
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBorderWidth: 2,
          pointBorderColor: "#F5F5F5",
          pointBackgroundColor: SALES_COLOR,
          pointHoverBackgroundColor: SALES_COLOR,
        },
        {
          label: "Expenses",
          data: keys.map((k) => monthTotals.get(k).expenses),
          borderColor: EXPENSES_COLOR,
          backgroundColor: "rgba(217, 106, 91, 0.1)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          interpolation: "monotone",
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBorderWidth: 2,
          pointBorderColor: "#F5F5F5",
          pointBackgroundColor: EXPENSES_COLOR,
          pointHoverBackgroundColor: EXPENSES_COLOR,
        },
      ],
    };
  }, [sortedReports]);

  const dailyChartData = useMemo(() => {
    const barBase = {
      borderRadius: 6,
      borderSkipped: false,
      maxBarThickness: 22,
      barPercentage: 0.8,
      categoryPercentage: 0.7,
      pointRadius: 0,
    };
    return {
      labels: dailyByDate.map(([d]) =>
        new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      ),
      datasets: [
        {
          ...barBase,
          label: "Sales",
          data: dailyByDate.map(([, e]) => e.sales),
          backgroundColor: SALES_COLOR,
        },
        {
          ...barBase,
          label: "Expenses",
          data: dailyByDate.map(([, e]) => e.expenses),
          backgroundColor: EXPENSES_COLOR,
        },
      ],
    };
  }, [dailyByDate]);

  const handleBarClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const [d] = dailyByDate[elements[0].index] || [];
      if (d) setSelectedDay(d);
    }
  };

  const handleBarHover = (event, elements) => {
    event.native.target.style.cursor =
      elements.length > 0 ? "pointer" : "default";
  };

  const selectedReports = selectedDay ? reportsByDate.get(selectedDay) : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          boxWidth: 6,
          boxHeight: 6,
          font: { size: 12, weight: '600', family: 'Inter' },
          color: '#6B7280'
        }
      },
      tooltip: {
        backgroundColor: '#1A1A1A',
        borderColor: '#2A2A2A',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 14, weight: '700', family: 'Inter' },
        bodyFont: { size: 13, family: 'JetBrains Mono' },
        cornerRadius: 10,
        displayColors: true,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '500' }, color: '#6B7280', autoSkip: true, maxRotation: 0 }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(107, 114, 128, 0.15)', drawBorder: false },
        ticks: { 
          font: { size: 11, weight: '500' }, 
          color: '#6B7280',
          callback: (value) => '₱ ' + value.toLocaleString()
        }
      }
    },
    interaction: { mode: 'index', intersect: false },
    onClick: handleBarClick,
    onHover: handleBarHover
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading records…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard">
      <header className="page-header">
        <div className="page-header__left">
          <div className="page-header__main">
            <h1 className="page-header__title">Canteen overview</h1>
            <p className="page-header__subtitle">How the canteen is doing, day by day</p>
          </div>
        </div>
        <div className="page-header__actions">
          <div className="live-indicator">
            <Activity size={14} className="pulse" />
            <span>Live</span>
          </div>
          <div className="date-display">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </header>

      <section className="dashboard__statsGrid">
        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--sales">
            <DollarSign size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Sales</span>
            <div className="stats-card__value">{formatPeso(summary.totalSales)}</div>
            <div className="stats-card__trend stats-card__trend--up">
              <TrendingUp size={12} />
              <span>All canteens</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--expenses">
            <Receipt size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Expenses</span>
            <div className="stats-card__value">{formatPeso(summary.totalExpenses)}</div>
            <div className="stats-card__trend stats-card__trend--down">
              <TrendingDown size={12} />
              <span>All canteens</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--profit">
            <Activity size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Net profit</span>
            <div className="stats-card__value">{formatPeso(summary.netProfit)}</div>
            <div className="stats-card__trend stats-card__trend--up">
              <TrendingUp size={12} />
              <span>After costs</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--reports">
            <FileText size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">Reports</span>
            <div className="stats-card__value">{summary.reportCount}</div>
            <div className="stats-card__trend stats-card__trend--neutral">
              <span>Logged days</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard__charts">
        <div className="chart-card">
          <div className="chart-card__header">
            <div className="chart-card__title-group">
              <BarChart3 size={20} className="chart-card__icon" />
              <div>
                <h3 className="chart-card__title">Sales vs. expenses</h3>
                <p className="chart-card__subtitle">Monthly sales and costs over time</p>
              </div>
            </div>

            <div className="chart-card__filters">
              <div className="filter-group">
                <div className="filter-item">
                  <label>From</label>
                  <input 
                    type="date" 
                    value={fromDate} 
                    onChange={(e) => setFromDate(e.target.value)}
                    className="dashboard-date-input"
                  />
                </div>
                <div className="filter-item">
                  <label>To</label>
                  <input 
                    type="date" 
                    value={toDate} 
                    onChange={(e) => setToDate(e.target.value)}
                    className="dashboard-date-input"
                  />
                </div>
                {(fromDate || toDate) && (
                  <button 
                    className="btn-clear-filters"
                    onClick={() => { setFromDate(""); setToDate(""); }}
                    title="Clear Filters"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="chart-card__body">
            {filteredReports.length === 0 ? (
              <div className="chart-card__empty">
                <FileText size={48} />
                <p>No records for this period.</p>
              </div>
            ) : (
              <div className="chart-card__chartWrap">
                <Line data={monthlyChartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <div className="chart-card__title-group">
              <CalendarDays size={20} className="chart-card__icon" />
              <div>
                <h3 className="chart-card__title">Daily sales vs. expenses</h3>
                <p className="chart-card__subtitle">Day by day, for the selected month</p>
              </div>
            </div>

            <div className="chart-card__filters">
              <div className="filter-group">
                <div className="filter-item">
                  <label>Month</label>
                  <MonthDropdown
                    value={chartMonth}
                    options={availableMonths.map((m) => {
                      const [y, mo] = m.split("-").map(Number);
                      return {
                        value: m,
                        label: new Date(y, mo - 1, 1).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        }),
                      };
                    })}
                    onChange={setChartMonth}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="chart-card__body chart-card__body--split">
            {dailyReports.length === 0 ? (
              <div className="chart-card__empty">
                <FileText size={48} />
                <p>No records for this month.</p>
              </div>
            ) : (
              <>
                <div className="chart-card__chartWrap chart-card__chartWrap--sm">
                  <Bar data={dailyChartData} options={chartOptions} />
                </div>
                <aside className="day-breakdown">
                  {selectedReports ? (
                    <>
                      <div className="day-breakdown__header">
                        <div className="day-breakdown__title-group">
                          <span className="day-breakdown__title">Day breakdown</span>
                          <span className="day-breakdown__date">
                            {new Date(`${selectedDay}T00:00:00`).toLocaleDateString(
                              "en-US",
                              { weekday: "long", month: "long", day: "numeric" },
                            )}
                          </span>
                        </div>
                        <button
                          className="day-breakdown__close"
                          onClick={() => setSelectedDay("")}
                          title="Close"
                        >
                          ×
                        </button>
                      </div>

                      <div className="day-breakdown__table">
                        {selectedReports.map((r) => {
                          const sales = r?.totals?.totalSales || 0;
                          const expenses = r?.totals?.totalExpenses || 0;
                          const net = sales - expenses;
                          return (
                            <div className="day-breakdown__row" key={r.id}>
                              <span className="day-breakdown__row-name">
                                {r.canteenLocation || "Canteen"}
                              </span>
                              <div className="day-breakdown__row-metrics">
                                <span className="day-breakdown__metric day-breakdown__metric--sales">
                                  <em>Sales</em>
                                  <b>{formatPeso(sales)}</b>
                                </span>
                                <span className="day-breakdown__metric day-breakdown__metric--expenses">
                                  <em>Expenses</em>
                                  <b>{formatPeso(expenses)}</b>
                                </span>
                                <span className={`day-breakdown__metric day-breakdown__metric--net${net < 0 ? " day-breakdown__metric--loss" : ""}`}>
                                  <em>Net</em>
                                  <b>{formatPeso(net)}</b>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div className="day-breakdown__footer">
                          <span className="day-breakdown__row-name">Combined</span>
                          <div className="day-breakdown__row-metrics">
                            <span className="day-breakdown__metric day-breakdown__metric--sales">
                              <em>Sales</em>
                              <b>{formatPeso(selectedReports.reduce((sum, r) => sum + (r?.totals?.totalSales || 0), 0))}</b>
                            </span>
                            <span className="day-breakdown__metric day-breakdown__metric--expenses">
                              <em>Expenses</em>
                              <b>{formatPeso(selectedReports.reduce((sum, r) => sum + (r?.totals?.totalExpenses || 0), 0))}</b>
                            </span>
                            <span className={`day-breakdown__metric day-breakdown__metric--net${selectedReports.reduce((sum, r) => sum + (r?.totals?.totalSales || 0) - (r?.totals?.totalExpenses || 0), 0) < 0 ? " day-breakdown__metric--loss" : ""}`}>
                              <em>Net</em>
                              <b>{formatPeso(selectedReports.reduce((sum, r) => sum + (r?.totals?.totalSales || 0) - (r?.totals?.totalExpenses || 0), 0))}</b>
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="day-breakdown__hint">
                      <FileText size={24} />
                      <p>Click a day to see its breakdown.</p>
                    </div>
                  )}
                </aside>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;


