import React, { useState } from 'react';

/**
 * Register.jsx
 * Simple registration form component.
 *
 * Usage:
 * <Register />
 */

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Email is not valid.';
    }
    if (!form.password) e.password = 'Password is required.';
    if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setStatusMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      // Replace the URL with the actual registration endpoint.
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Registration failed');
      }

      setStatusMessage({ type: 'success', text: 'Registration successful.' });
      setForm({ fullName: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Register form" style={styles.form}>
      <h2 style={styles.heading}>Create an account</h2>

      <label style={styles.label}>
        Full name
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          style={styles.input}
          autoComplete="name"
        />
        {errors.fullName && <div style={styles.error}>{errors.fullName}</div>}
      </label>

      <label style={styles.label}>
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          autoComplete="email"
        />
        {errors.email && <div style={styles.error}>{errors.email}</div>}
      </label>

      <label style={styles.label}>
        Password
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          autoComplete="new-password"
        />
        {errors.password && <div style={styles.error}>{errors.password}</div>}
      </label>

      <label style={styles.label}>
        Confirm password
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          style={styles.input}
          autoComplete="new-password"
        />
        {errors.confirmPassword && <div style={styles.error}>{errors.confirmPassword}</div>}
      </label>

      <div style={styles.actions}>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          style={statusMessage.type === 'error' ? styles.statusError : styles.statusSuccess}
        >
          {statusMessage.text}
        </div>
      )}
    </form>
  );
}

const styles = {
  form: {
    maxWidth: 420,
    margin: '0 auto',
    padding: 16,
    border: '1px solid #e1e4e8',
    borderRadius: 6,
    fontFamily: 'Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  heading: { margin: '0 0 12px 0', fontSize: 20 },
  label: { display: 'block', marginBottom: 10, fontSize: 14 },
  input: {
    display: 'block',
    width: '100%',
    padding: '8px 10px',
    marginTop: 6,
    boxSizing: 'border-box',
    borderRadius: 4,
    border: '1px solid #cbd5e0',
  },
  error: { color: '#b00020', marginTop: 6, fontSize: 13 },
  actions: { marginTop: 12 },
  button: {
    padding: '8px 14px',
    background: '#0366d6',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  statusSuccess: { marginTop: 12, color: '#166534', background: '#d1fae5', padding: 8, borderRadius: 4 },
  statusError: { marginTop: 12, color: '#7f1d1d', background: '#fee2e2', padding: 8, borderRadius: 4 },
};