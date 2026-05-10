import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Eye, 
  Trash2, 
  TrendingUp,
  FileText,
  BarChart3,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import Button from '../components/common/Button';
import useReports from '../hooks/useReports';
import { formatPeso } from '../utils/format';
import '../css/MonthlyReports.css';

const monthKey = (dateValue) => {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const monthId = (dateValue) => {
  if (!dateValue) return 'Unknown';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const MonthlyReports = () => {
  const { reports, loading, removeReport } = useReports();

  const grouped = useMemo(() => {
    const map = new Map();

    reports.forEach((report) => {
      const key = monthKey(report.date);
      const id = monthId(report.date);
      const current = map.get(key) || { 
        month: key, 
        id: id,
        totalSales: 0, 
        totalExpenses: 0, 
        netProfit: 0, 
        count: 0 
      };

      current.totalSales += report?.totals?.totalSales || 0;
      current.totalExpenses += report?.totals?.totalExpenses || 0;
      current.netProfit += report?.totals?.netProfit || 0;
      current.count += 1;

      map.set(key, current);
    });

    return [...map.values()].sort((a, b) => b.id.localeCompare(a.id));
  }, [reports]);

  const onDelete = async (monthLabel, monthIdValue) => {
    const confirmed = window.confirm(`Delete all records for ${monthLabel} permanently? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const reportsToDelete = reports.filter((report) => monthId(report.date) === monthIdValue);
      for (const report of reportsToDelete) {
        await removeReport(report.id);
      }
    } catch {
      window.alert('Operational error. Unable to purge reports.');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Analyzing fiscal cycles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page monthly-reports">
      <header className="page-header">
        <div className="page-header__left">
          <div className="page-header__main">
            <h1 className="page-header__title">Monthly Analytics</h1>
            <p className="page-header__subtitle">Periodic aggregation of operational performance</p>
          </div>
        </div>
        <div className="page-header__actions">
          <div className="stats-badge">
            <BarChart3 size={14} />
            <span>{grouped.length} Active Periods</span>
          </div>
        </div>
      </header>

      {grouped.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-card__icon">
            <FileText size={48} />
          </div>
          <h3>No historical data found</h3>
          <p>Establish operational logs to generate monthly analytical insights.</p>
          <Button variant="primary" onClick={() => navigate('/entry')}>
            Record First Session
          </Button>
        </div>
      ) : (
        <div className="monthly-reports__grid">
          {grouped.map((row) => (
            <div className="monthly-card" key={row.id}>
              <div className="monthly-card__header">
                <div className="monthly-card__title">
                  <div className="monthly-card__icon">
                    <Calendar size={20} />
                  </div>
                  <h2>{row.month}</h2>
                </div>
                <div className="monthly-card__badge">
                  {row.count} Logs
                </div>
              </div>

              <div className="monthly-card__stats">
                <div className="monthly-stat">
                  <span className="monthly-stat__label">Gross Revenue</span>
                  <span className="monthly-stat__value text-success">{formatPeso(row.totalSales)}</span>
                </div>
                <div className="monthly-stat">
                  <span className="monthly-stat__label">Operational Costs</span>
                  <span className="monthly-stat__value text-danger">{formatPeso(row.totalExpenses)}</span>
                </div>
              </div>

              <div className="monthly-card__footer">
                <div className="monthly-card__profit">
                  <span className="monthly-card__total-label">Net Performance</span>
                  <span className="monthly-card__total-value">{formatPeso(row.netProfit)}</span>
                </div>
                <div className="monthly-card__actions">
                  <Link to={`/view/monthly/${row.id}`} className="btn-icon" title="Audit Month">
                    <Eye size={18} />
                  </Link>
                  <button 
                    onClick={() => onDelete(row.month, row.id)} 
                    className="btn-icon btn-icon--danger" 
                    title="Purge Period"
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

export default MonthlyReports;


