import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { getSession, updatePassword, signOut } from '../services/supabaseAuthApi';
import ThemeToggle from '../components/common/ThemeToggle';
import '../css/Login.css';

const Register = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionExists, setSessionExists] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoadingSession(true);
      try {
        const { session } = await getSession();
        setSessionExists(Boolean(session?.user));
      } catch {
        setSessionExists(false);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      setInfoMessage('Account secured successfully.');
      setTimeout(async () => {
        await signOut();
        navigate('/login', { replace: true });
      }, 1500);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSession) {
    return (
      <div className="login-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (!sessionExists) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">
                <AlertCircle size={32} />
              </div>
              <h1 className="login-title">Access Restricted</h1>
              <p className="login-subtitle">No active invitation session was found.</p>
            </div>

            <div className="error-alert" role="alert">
              Please use the official invitation link sent to your work email to proceed.
            </div>

            <div className="login-footer">
              <Link to="/login" className="btn-add btn-add--inline">
                <span>Return to Sign In</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="login-title">Activate Account</h1>
            <p className="login-subtitle">Establish your secure administrative password</p>
          </div>

          <div className="login-body">
            <div className="login-intro">
              <div className="intro-badge">
                <ShieldCheck size={14} />
                <span>One-Time Activation</span>
              </div>
            </div>

            {errorMessage && (
              <div className="error-alert" role="alert">
                {errorMessage}
              </div>
            )}

            {infoMessage && (
              <div className="notification notification--success" style={{ position: 'static', marginBottom: '16px' }}>
                <CheckCircle2 size={18} />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
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
                    Securing Account...
                  </span>
                ) : (
                  "Complete Activation"
                )}
              </Button>
            </form>
          </div>

          <div className="login-footer">
            <p>© 2026 CanteenX. Security Protocol Active.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

