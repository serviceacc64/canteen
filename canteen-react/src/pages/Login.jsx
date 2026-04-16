import { useState } from "react";
import { Navigate } from "react-router-dom";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import "../css/Login.css";

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const [name, setName] = useState("Canteen Staff");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (event) => {
    event.preventDefault();
    login({ name: name.trim() || "Canteen Staff" });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1 className="login-title" id="login-title">
            Admin Login
          </h1>
          <p className="login-subtitle">Secure administrator access for staff only.</p>
        </div>

        <div
          id="error-message"
          className="error-message"
          role="alert"
          aria-live="polite"
        >
          Invalid email or password. Please try again.
        </div>

        <form onSubmit={onSubmit} className="login-form" role="form" aria-labelledby="login-title">
          <div className="input-group">
            <input
              type="email"
              id="username"
              name="username"
              placeholder="Email"
              autoComplete="email"
              aria-label="Admin Email"
              required
            />
            <svg
              className="input-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              
            </svg>
          </div>

          <div className="input-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Password"
              required
            />
            <svg
              className="input-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              
            </svg>
          </div>

          <div className="options">
            <label className="checkbox-group">
              <input type="checkbox" id="remember" name="remember" />
              Keep me signed in
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="btn-login"
            id="login-btn"
            aria-label="Login to admin panel"
          >
            Access Admin
          </Button>
        </form>

        <p className="bottom-text">Authorized personnel only</p>
      </div>
    </div>
  );
};

export default Login;
