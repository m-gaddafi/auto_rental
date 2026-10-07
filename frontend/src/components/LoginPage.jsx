import React, { useState } from 'react';
import { Building2, User, Key, Eye, EyeOff, LogIn, Shield, CheckCircle2, RotateCw } from 'lucide-react';
import { api } from '../api';

export default function LoginPage({ onLoginSuccess, showToast }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.login(username.trim(), password);
      if (showToast) {
        showToast(`Welcome back, ${res.data.user.username}!`, 'success');
      }
      onLoginSuccess(res.data.user);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid username or password.');
      if (showToast) {
        showToast(err.message || 'Authentication failed', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (u, p) => {
    setUsername(u);
    setPassword(p);
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.login(u, p);
      if (showToast) {
        showToast(`Welcome back, ${res.data.user.username}!`, 'success');
      }
      onLoginSuccess(res.data.user);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), var(--bg-app)'
    }}>
      {/* Background ambient decorative shapes */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: 380,
        height: 380,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '20%',
        width: 320,
        height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      {/* Main Login Card */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 460,
        padding: '38px 36px',
        position: 'relative',
        zIndex: 10,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.15)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)'
          }}>
            <Building2 size={30} color="#ffffff" />
          </div>

          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 6,
            background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AutoRental Portal
          </h1>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Sign in to access your properties, rent ledgers, and payment reconciliation
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.85rem',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Username */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={17} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 42, height: 46 }}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={17} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 42, paddingRight: 42, height: 46 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 13,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 2
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              height: 46,
              fontSize: '0.95rem',
              fontWeight: 700,
              marginTop: 6,
              borderRadius: 'var(--radius-md)'
            }}
          >
            {submitting ? (
              <>
                <RotateCw size={17} className="pulse" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <LogIn size={17} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '24px 0 18px 0',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span>Quick 1-Click Test Access</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        {/* Quick Credentials Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin', 'admin123')}
            disabled={submitting}
            className="btn btn-secondary"
            style={{
              padding: '10px 12px',
              fontSize: '0.8rem',
              flexDirection: 'column',
              gap: 3,
              alignItems: 'flex-start',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Shield size={13} />
              <span>Administrator</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              admin / admin123
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('manager1', 'manager123')}
            disabled={submitting}
            className="btn btn-secondary"
            style={{
              padding: '10px 12px',
              fontSize: '0.8rem',
              flexDirection: 'column',
              gap: 3,
              alignItems: 'flex-start',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 5 }}>
              <User size={13} />
              <span>Property Manager</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              manager1 / manager123
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          AutoRental Secure System • Connected to Django REST API
        </div>
      </div>
    </div>
  );
}
