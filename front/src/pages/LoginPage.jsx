import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const LoginPage = ({ onLogin, isLoggedIn }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  if (isLoggedIn) {
    return <Navigate to="/welcome" replace />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
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

    const namePart = email.split('@')[0] || 'User';
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    onLogin({
      name: displayName,
      email,
      loggedInAt: new Date().toISOString()
    });
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1 className="page-title">Login</h1>
        <p className="page-subtitle">Access your welcome dashboard and manage your commerce space.</p>

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
          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
