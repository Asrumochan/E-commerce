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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const passwordChecks = {
    minLength: form.password.length >= 6,
    hasNumber: /\d/.test(form.password),
    hasLetter: /[A-Za-z]/.test(form.password)
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card auth-card-wide">
        <div className="auth-highlight-panel signup-panel">
          <p className="hero-eyebrow">Create Account</p>
          <h2 className="auth-panel-title">Join TerraShop</h2>
          <p className="auth-panel-text">
            Create your profile to unlock synced shopping data and secure account-level access management.
          </p>
          <div className="password-rules-box">
            <p className="mb-2">Password checks</p>
            <div className={passwordChecks.minLength ? 'rule-item ok' : 'rule-item'}>Minimum 6 characters</div>
            <div className={passwordChecks.hasLetter ? 'rule-item ok' : 'rule-item'}>At least one letter</div>
            <div className={passwordChecks.hasNumber ? 'rule-item ok' : 'rule-item'}>At least one number</div>
          </div>
        </div>

        <div className="auth-form-panel">
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
              <div className="password-field-wrap">
                <input
                  className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
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
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="password-field-wrap">
                <input
                  className="form-control"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={onChange}
                  placeholder="Repeat password"
                  required
                />
                <button
                  className="password-toggle-btn"
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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
            <button className="btn btn-primary auth-submit-btn" type="submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
