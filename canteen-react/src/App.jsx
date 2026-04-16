import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/layout/Header';
import useAuth from './hooks/useAuth';
import Login from './pages/Login';
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

const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<Login />} />
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
          path="/view/:id"
          element={(
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Layout><ViewReport /></Layout>
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
