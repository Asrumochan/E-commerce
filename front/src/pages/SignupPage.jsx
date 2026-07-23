import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { apiClient, extractErrorMessage } from '../api/client';

const SignupPage = ({ onSignup, isLoggedIn }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminAccessCode: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isLoggedIn) {
    return <Navigate to="/products" replace />;
  }

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name || !email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.post('/auth/signup', {
        name,
        email,
        password: form.password,
        adminAccessCode: form.adminAccessCode.trim()
      });
      onSignup(response.data.user);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to create account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <h1 className="page-title">Sign Up</h1>
        <p className="page-subtitle">Create your TerraShop account. Credentials are securely stored in MongoDB.</p>

        {error && <div className="status-card status-error">{error}</div>}

        <form className="form-grid" onSubmit={onSubmit}>
          <div>
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={form.email}
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
              value={form.password}
              onChange={onChange}
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div>
            <label className="form-label">Confirm Password</label>
            <input
              className="form-control"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              placeholder="Repeat password"
              required
            />
          </div>
          <div>
            <label className="form-label">Admin Access Code (optional)</label>
            <input
              className="form-control"
              type="password"
              name="adminAccessCode"
              value={form.adminAccessCode}
              onChange={onChange}
              placeholder="Only for authorized admins"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default SignupPage;
