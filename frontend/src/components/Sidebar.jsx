import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  BookOpenCheck,
  LogIn,
  LogOut,
  ExternalLink,
  UserCheck,
  Sparkles,
  Shield,
  Settings,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  stats,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenSetup,
  isOpen,
  onClose
}) {
  const pendingCount = stats?.pending_count || 0;
  const pendingVerifications = stats?.pending_verifications || 0;

  const isManager = currentUser?.role === 'manager';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.is_superuser || currentUser?.is_staff;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'rent-sheet', label: 'Rent Ledger', icon: TableProperties },
    { id: 'units', label: 'Properties & Units', icon: Building2 },
    { id: 'import', label: 'Import Receipts', icon: FileSpreadsheet },
    {
      id: 'confirmations',
      label: 'Confirmations',
      icon: CheckCircle2,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'amber'
    },
    ...(isAdmin ? [{
      id: 'verifications',
      label: 'Verifications',
      icon: ShieldCheck,
      badge: pendingVerifications > 0 ? pendingVerifications : null,
      badgeColor: 'rose',
    }] : []),
    { id: 'masterlog', label: 'Master Log', icon: BookOpenCheck },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <aside
      className={`sidebar-drawer ${isOpen ? 'open' : ''}`}
      style={{
        width: 270,
        minWidth: 270,
        background: 'rgba(11, 16, 28, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        overflowY: 'auto'
      }}
    >
      {/* Brand Header */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            flexShrink: 0
          }}>
            <Building2 size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              AutoRental
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Intelligent Ledger & Rent
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: 0
            }}
            title="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User Badge / Status Card */}
      <div style={{ padding: '16px 18px 12px 18px' }}>
        {currentUser ? (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isAdmin ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  border: `1px solid ${isAdmin ? 'var(--accent-rose)' : 'var(--accent-primary)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isAdmin ? <Shield size={16} color="#fb7185" /> : <UserCheck size={16} color="#818cf8" />}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>
                    {currentUser.username}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {currentUser.email || 'Online Session'}
                  </div>
                </div>
              </div>

              <span className={`badge ${isAdmin ? 'badge-rose' : 'badge-indigo'}`} style={{ fontSize: '0.68rem' }}>
                {currentUser.role?.toUpperCase() || (currentUser.is_staff ? 'ADMIN' : 'USER')}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 8,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'Full System Rights' : 'Manager Allocation Rights'}
              </span>
              <button
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-rose)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.825rem' }}
          >
            <LogIn size={15} />
            <span>Sign In (Admin / Manager)</span>
          </button>
        )}
      </div>

      {/* Navigation Group Header */}
      <div style={{ padding: '8px 20px 4px 20px' }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          Navigation Menu
        </span>
      </div>

      {/* Main Navigation Buttons */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '4px 12px',
        flex: 1
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.08) 100%)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <Icon size={18} color={isActive ? '#818cf8' : 'currentColor'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  padding: '2px 7px',
                  borderRadius: 10,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: item.badgeColor === 'amber' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(244, 63, 94, 0.25)',
                  color: item.badgeColor === 'amber' ? '#fbbf24' : '#fb7185',
                  border: `1px solid ${item.badgeColor === 'amber' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Actions Buttons */}
      <div style={{
        padding: '16px 14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          paddingLeft: 4
        }}>
          Quick Actions
        </span>

        {isAdmin && (
          <button
            onClick={() => { onOpenSetup(); if (onClose) onClose(); }}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}
          >
            <Settings size={15} color="#fff" />
            <span style={{ fontWeight: 600 }}>Setup (Admin)</span>
          </button>
        )}

        <a
          href="/admin/"
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', color: 'var(--text-muted)' }}
          title="Open Django Unfold Admin"
        >
          <ExternalLink size={14} />
          <span>Django Admin</span>
        </a>
      </div>
    </aside>
  );
}
