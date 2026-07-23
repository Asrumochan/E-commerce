import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../api/client';

const LoginPage = ({ onLogin, isLoggedIn }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/products" replace />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      onLogin(response.data.user);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to login'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card auth-card-wide">
        <div className="auth-highlight-panel">
          <p className="hero-eyebrow">Secure Access</p>
          <h2 className="auth-panel-title">Welcome back to TerraShop</h2>
          <p className="auth-panel-text">
            Sign in to continue with your personalized cart, wishlist, order history, and role-based dashboard.
          </p>
          <ul className="auth-benefits">
            <li>Personal cart and wishlist synced to your account</li>
            <li>Order history saved with complete pricing breakdown</li>
            <li>Admin controls automatically enabled by role</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <h1 className="page-title">Login</h1>
          <p className="page-subtitle">Sign in and continue managing your commerce space.</p>

          {error && <div className="status-card status-error">{error}</div>}

          <form className="form-grid" onSubmit={onSubmit}>
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={credentials.email}
                onChange={onChange}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="password-field-wrap">
                <input
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={onChange}
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  className="password-toggle-btn"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button className="btn btn-primary auth-submit-btn" type="submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="auth-switch-text">
            No account yet? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
