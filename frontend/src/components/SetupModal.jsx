import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Building2, Settings2, Trash2, Edit2 } from 'lucide-react';
import { api } from '../api';

export default function SetupModal({ isOpen, onClose, showToast, properties, units, refreshData }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  
  // Create User Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    if (isOpen && activeTab === 'users') {
      loadUsers();
    }
  }, [isOpen, activeTab]);

  const loadUsers = async () => {
    try {
      const res = await api.getUsers();
      setUsers(res.data);
    } catch (err) {
      showToast('Failed to load users', 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createManager({ username, email, password });
      showToast('Manager created successfully!', 'success');
      setUsername('');
      setEmail('');
      setPassword('');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    try {
      await api.deleteUnit(id);
      showToast('Unit deleted.', 'success');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property? This will also delete all associated units.')) return;
    try {
      await api.deleteProperty(id);
      showToast('Property deleted.', 'success');
      refreshData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 900,
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Settings2 size={20} color="#fbbf24" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>Admin Setup</h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage users, units, and properties</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Tabs Sidebar */}
          <div style={{
            width: 220,
            borderRight: '1px solid var(--border-subtle)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'users' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'users' ? '#818cf8' : 'var(--text-secondary)',
                border: activeTab === 'users' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 600
              }}
            >
              <Users size={18} /> View Users
            </button>
            <button
              onClick={() => setActiveTab('create-user')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'create-user' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'create-user' ? '#818cf8' : 'var(--text-secondary)',
                border: activeTab === 'create-user' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 600
              }}
            >
              <UserPlus size={18} /> Create User
            </button>
            <button
              onClick={() => setActiveTab('units')}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'units' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'units' ? '#818cf8' : 'var(--text-secondary)',
                border: activeTab === 'units' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: 600
              }}
            >
              <Building2 size={18} /> Units & Properties
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {activeTab === 'users' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 20 }}>Existing Users</h3>
                <div style={{ background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>ID</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Username</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Email</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '12px 16px' }}>{u.id}</td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#fff' }}>{u.username}</td>
                          <td style={{ padding: '12px 16px' }}>{u.email}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700,
                              background: u.role === 'admin' || u.is_superuser ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                              color: u.role === 'admin' || u.is_superuser ? '#34d399' : '#818cf8'
                            }}>
                              {u.role || (u.is_superuser ? 'admin' : 'user')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'create-user' && (
              <div style={{ maxWidth: 400 }}>
                <h3 style={{ marginTop: 0, marginBottom: 20 }}>Create New Manager</h3>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6, color: 'var(--text-secondary)' }}>Username</label>
                    <input type="text" className="form-input" required value={username} onChange={e => setUsername(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6, color: 'var(--text-secondary)' }}>Email</label>
                    <input type="email" className="form-input" required value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6, color: 'var(--text-secondary)' }}>Password</label>
                    <input type="password" className="form-input" required value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }}>Create User</button>
                </form>
              </div>
            )}

            {activeTab === 'units' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 20 }}>Properties & Units Management</h3>
                
                {properties.map(p => {
                  const propUnits = units.filter(u => u.property_id === p.id);
                  return (
                    <div key={p.id} style={{ marginBottom: 24, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{p.name}</div>
                        <button onClick={() => handleDeleteProperty(p.id)} className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <Trash2 size={14} /> Delete Property
                        </button>
                      </div>
                      <div style={{ padding: '16px' }}>
                        {propUnits.length === 0 ? (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No units in this property.</div>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ paddingBottom: 8 }}>Unit ID</th>
                                <th style={{ paddingBottom: 8 }}>Tenant</th>
                                <th style={{ paddingBottom: 8, textAlign: 'right' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {propUnits.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                  <td style={{ padding: '10px 0', fontWeight: 600, color: '#fff' }}>{u.unit_id}</td>
                                  <td style={{ padding: '10px 0' }}>{u.tenant_name || '-'}</td>
                                  <td style={{ padding: '10px 0', textAlign: 'right' }}>
                                    <button onClick={() => handleDeleteUnit(u.id)} className="btn btn-sm btn-ghost" style={{ padding: '4px 8px', color: '#ef4444' }} title="Delete Unit">
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
