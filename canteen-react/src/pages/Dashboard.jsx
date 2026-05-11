import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
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
  CalendarDays
} from "lucide-react";
import "../css/Dashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { reports, loading } = useReports();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  const chartData = useMemo(() => {
    const sorted = [...filteredReports].sort((a, b) =>
      (a.date || "").localeCompare(b.date || ""),
    );
    return {
      labels: sorted.map((r) => r.date || "Unknown"),
      datasets: [
        {
          label: "Sales",
          data: sorted.map((r) => r?.totals?.totalSales || 0),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.05)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: "#10b981",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
        {
          label: "Expenses",
          data: sorted.map((r) => r?.totals?.totalExpenses || 0),
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244, 63, 94, 0.05)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: "#f43f5e",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [filteredReports]);

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
          color: '#71717a'
        }
      },
      tooltip: {
        backgroundColor: '#18181b',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 14, weight: '700', family: 'Inter' },
        bodyFont: { size: 13, family: 'Inter' },
        cornerRadius: 12,
        displayColors: true,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '500' }, color: '#71717a' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { 
          font: { size: 11, weight: '500' }, 
          color: '#71717a',
          callback: (value) => '₱' + value.toLocaleString()
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Orchestrating financial analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard">
      <header className="page-header">
        <div className="page-header__left">
          <div className="page-header__main">
            <h1 className="page-header__title">Operational Overview</h1>
            <p className="page-header__subtitle">Real-time financial performance auditing</p>
          </div>
        </div>
        <div className="page-header__actions">
          <div className="live-indicator">
            <Activity size={14} className="pulse" />
            <span>LIVE SYSTEM</span>
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
            <span className="stats-card__label">GROSS REVENUE</span>
            <div className="stats-card__value">{formatPeso(summary.totalSales)}</div>
            <div className="stats-card__trend stats-card__trend--up">
              <TrendingUp size={12} />
              <span>System Total</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--expenses">
            <Receipt size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">OPERATIONAL COSTS</span>
            <div className="stats-card__value">{formatPeso(summary.totalExpenses)}</div>
            <div className="stats-card__trend stats-card__trend--down">
              <TrendingDown size={12} />
              <span>Aggregate Expenses</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--profit">
            <Activity size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">NET PERFORMANCE</span>
            <div className="stats-card__value">{formatPeso(summary.netProfit)}</div>
            <div className="stats-card__trend stats-card__trend--up">
              <TrendingUp size={12} />
              <span>Yield Ratio Active</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--reports">
            <FileText size={20} />
          </div>
          <div className="stats-card__content">
            <span className="stats-card__label">REPORTS FILED</span>
            <div className="stats-card__value">{summary.reportCount}</div>
            <div className="stats-card__trend stats-card__trend--neutral">
              <span>Audited Records</span>
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
                <h3 className="chart-card__title">Fiscal Performance Trends</h3>
                <p className="chart-card__subtitle">Historical comparison of revenue and expenditure flows</p>
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
                <p>No data found for the selected period.</p>
              </div>
            ) : (
              <div className="chart-card__chartWrap">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;


