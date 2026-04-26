import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { getSession, updatePassword, signOut } from '../services/supabaseAuthApi';
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
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to complete registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingSession) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p>Loading invitation status...</p>
        </div>
      </div>
    );
  }

  if (!sessionExists) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <h1 className="login-title" id="register-title">
              Complete Your Invitation
            </h1>
            <p className="login-subtitle">This page is only available from a valid invite link.</p>
          </div>

          <div className="error-message" role="alert" aria-live="polite">
            No active invitation session was found. Please use the invitation email link or sign in.
          </div>

          <div className="form-actions">
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1 className="login-title" id="register-title">
            Complete Invitation
          </h1>
          <p className="login-subtitle">Create your password to finish setting up your account.</p>
        </div>

        {errorMessage && (
          <div className="error-message" role="alert" aria-live="polite">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div className="success-message" role="status" aria-live="polite">
            {infoMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="login-form" role="form" aria-labelledby="register-title">
          <div className="input-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="New password"
              autoComplete="new-password"
              aria-label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" />
          </div>

          <div className="input-group">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm password"
              autoComplete="new-password"
              aria-label="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <svg className="input-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="btn-login"
            id="register-btn"
            aria-label="Finish registration"
            disabled={isLoading}
          >
            {isLoading ? 'Completing...' : 'Complete Registration'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
