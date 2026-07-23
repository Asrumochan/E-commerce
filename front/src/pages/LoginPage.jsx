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
      <div className="auth-card">
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
            <input
              className="form-control"
              type="password"
              name="password"
              value={credentials.password}
              onChange={onChange}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="auth-switch-text">
          No account yet? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
