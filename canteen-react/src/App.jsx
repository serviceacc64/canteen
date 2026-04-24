import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/layout/Header';
import useAuth from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DailyReports from './pages/DailyReports';
import Entry from './pages/Entry';
import MonthlyReports from './pages/MonthlyReports';
import YearlyReports from './pages/YearlyReports';
import ViewReport from './pages/ViewReport';
import './App.css';

const Layout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="app-main">
      <Header />
      {children}
    </main>
  </div>
);

const isInviteCallback = (location) => {
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  return Boolean(
    type === 'signup' ||
    type === 'invite' ||
    (accessToken && refreshToken)
  );
};

const RedirectInviteToRegister = ({ children }) => {
  const location = useLocation();
  if (isInviteCallback(location) && location.pathname !== '/register') {
    return <Navigate to={`/register${location.search}`} replace />;
  }
  return children;
};

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <RedirectInviteToRegister>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/daily"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><DailyReports /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/entry"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><Entry /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/monthly"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><MonthlyReports /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/yearly"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><YearlyReports /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/view/monthly/:month"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><ViewReport /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/view/yearly/:year"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><ViewReport /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route
          path="/view/:id"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><ViewReport /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </RedirectInviteToRegister>
    </Router>
  );
};

export default App;
