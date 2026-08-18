import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CalendarDays,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import "../css/Sidebar.css";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navItems = [
    { path: "/", label: "Overview", Icon: LayoutDashboard },
    { path: "/entry", label: "New entry", Icon: PlusCircle },
    { path: "/daily", label: "Daily records", Icon: FileText },
    { path: "/monthly", label: "Monthly reports", Icon: CalendarDays },
    { path: "/yearly", label: "Yearly reports", Icon: BarChart3 },
  ];

  return (
    <aside className="sidebar" aria-label="Main Navigation">
      <div className="sidebar__inner">
        <div className="sidebar__brand">
          <img src="/rectologo.png" alt="Recto MNHS logo" className="sidebar__logo" />
          <div className="sidebar__brandText">
            <div className="sidebar__title">Recto MNHS</div>
            <div className="sidebar__subtitle">CANTEEN LEDGER</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          <div className="sidebar__navLabel">Records</div>
          {navItems.map(({ path, label, Icon: LucideIcon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `sidebar__link${isActive ? " is-active" : ""}`
              }
            >
              <span className="sidebar__icon">
                <LucideIcon size={20} />
              </span>
              <span className="sidebar__label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              <User size={20} />
            </div>
            <div className="sidebar__userInfo">
              <div className="sidebar__userName">
                {user?.displayName || "Administrator"}
              </div>
              <div className="sidebar__userRole">Canteen manager</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar__logoutBtn"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
