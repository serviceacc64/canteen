import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, TrendingUp } from "lucide-react";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import { signIn } from "../services/supabaseAuthApi";
import ThemeToggle from "../components/common/ThemeToggle";
import "../css/Login.css";

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    window.localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');

    try {
      const data = await signIn(email.trim(), password);
      login({ user: data.user, session: data.session });
    } catch (error) {
      setErrorMessage(
        error?.message ||
          "Authentication failed. Please verify your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-top-right">
        <ThemeToggle />
      </div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <TrendingUp size={32} />
            </div>
            <h1 className="login-title">CanteenX</h1>
            <p className="login-subtitle">Advanced Financial Operations Suite</p>
          </div>

          <div className="login-body">
            <div className="login-intro">
              <div className="intro-badge">
                <ShieldCheck size={14} />
                <span>Secure Administrator Access</span>
              </div>
            </div>

            {errorMessage && (
              <div className="error-alert" role="alert">
                {errorMessage}
              </div>
            )}

            <form onSubmit={onSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Work Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="label-text">Remember this device</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="login-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-content">
                    <span className="spinner"></span>
                    Authenticating...
                  </span>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          </div>

          <div className="login-footer">
            <p>© 2026 CanteenX. Authorized Personnel Only.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
