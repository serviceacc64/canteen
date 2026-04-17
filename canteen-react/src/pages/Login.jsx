import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';
import { signIn } from '../services/supabaseAuthApi';
import '../css/Login.css';

const Login = () => {
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await signIn(email.trim(), password);
      login({ user: data.user, session: data.session });
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to sign in. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
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

        {errorMessage && (
          <div className="error-message" role="alert" aria-live="polite">
            {errorMessage}
          </div>
        )}

        <form onSubmit={onSubmit} className="login-form" role="form" aria-labelledby="login-title">
          <div className="input-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              aria-label="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <svg
              className="input-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <svg
              className="input-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            />
          </div>

          <div className="options">
            <label className="checkbox-group">
              <input type="checkbox" id="remember" name="remember" defaultChecked />
              Keep me signed in
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="btn-login"
            id="login-btn"
            aria-label="Login to admin panel"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Access Admin'}
          </Button>
        </form>

        <p className="bottom-text">Authorized personnel only</p>
      </div>
    </div>
  );
};

export default Login;
