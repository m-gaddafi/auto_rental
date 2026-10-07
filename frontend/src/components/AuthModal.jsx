import React, { useState } from 'react';
import { LogIn, Key, User, Shield, RotateCw } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  showToast
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Username and password are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.login(username, password);
      showToast(`Welcome back, ${res.data.user.username}!`, 'success');
      onSuccess(res.data.user);
      onClose();
    } catch (err) {
      showToast(err.message || 'Login failed. Check your credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <LogIn size={20} color="#6366f1" />
            <span>Sign In to AutoRental</span>
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
            ✕
          </button>
        </div>

        {/* Quick Credentials Chips */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 18,
          fontSize: '0.8rem'
        }}>
          <div style={{ color: '#818cf8', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={14} />
            <span>Quick Dev Sign-In Accounts:</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, padding: '5px 8px', fontSize: '0.75rem' }}
            >
              👑 Admin (admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('manager1', 'manager123')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, padding: '5px 8px', fontSize: '0.75rem' }}
            >
              💼 Manager (manager1)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <RotateCw size={15} className="pulse" /> : <LogIn size={15} />}
              <span>Sign In</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
