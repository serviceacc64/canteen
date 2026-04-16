import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CalendarDays,
  BarChart3,
  LogOut,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import '../css/Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/entry', label: 'New Entry', Icon: PlusCircle },
    { path: '/daily', label: 'Daily Reports', Icon: FileText },
    { path: '/monthly', label: 'Monthly', Icon: CalendarDays },
    { path: '/yearly', label: 'Yearly', Icon: BarChart3 },
  ];

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebar__inner">
        <div className="sidebar__brand">
          <div className="sidebar__mark" aria-hidden="true" />
          <div className="sidebar__brandText">
            <div className="sidebar__title">RMNHS Canteen</div>
            <div className="sidebar__subtitle">Operations & Reports</div>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Sections">
          {navItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}
            >
              <span className="sidebar__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="sidebar__label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar__link sidebar__link--danger"
          >
            <span className="sidebar__icon" aria-hidden="true">
              <LogOut size={18} />
            </span>
            <span className="sidebar__label">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
