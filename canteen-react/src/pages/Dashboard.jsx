import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import '../css/Dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,

} from 'chart.js';
import useReports from '../hooks/useReports';
import { formatPeso } from '../utils/format';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const Dashboard = () => {
  const { reports, loading } = useReports();

  const summary = useMemo(() => {
    const reportCount = reports.length;
    const totalSales = reports.reduce((sum, report) => sum + (report?.totals?.totalSales || 0), 0);
    const totalExpenses = reports.reduce((sum, report) => sum + (report?.totals?.totalExpenses || 0), 0);
    const netProfit = totalSales - totalExpenses;

    return { reportCount, totalSales, totalExpenses, netProfit };
  }, [reports]);

  const chartData = useMemo(() => {
    const sorted = [...reports].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    return {
      labels: sorted.map((r) => r.date || 'Unknown'),
      datasets: [
        {
          label: 'Total Sales',
          data: sorted.map((r) => r?.totals?.totalSales || 0),
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.2)',
          tension: 0.25,
        },
        {
          label: 'Total Expenses',
          data: sorted.map((r) => r?.totals?.totalExpenses || 0),
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.2)',
          tension: 0.25,
        },
      ],
    };
  }, [reports]);

  if (loading) {
    return <div className="page"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="page dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Overview of persisted canteen reports.</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Reports</h3>
          <p>{summary.reportCount}</p>
        </div>
        <div className="summary-card">
          <h3>Total Sales</h3>
          <p>{formatPeso(summary.totalSales)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p>{formatPeso(summary.totalExpenses)}</p>
        </div>
        <div className="summary-card">
          <h3>Net Profit</h3>
          <p>{formatPeso(summary.netProfit)}</p>
        </div>
      </div>

      <div className="chart-card">
        <div className="dashboard__cardHeader">
          <h3 className="dashboard__cardTitle">Sales vs Expenses Trend</h3>
          <p className="dashboard__cardHint">Shows totals from saved daily reports.</p>
        </div>
        {reports.length === 0 ? (
          <p>No chart data yet. Save entries to view trend.</p>
        ) : (
          <div className="dashboard__chartWrap">
            <Line data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
