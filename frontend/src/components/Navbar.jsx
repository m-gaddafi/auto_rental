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
  UserCheck
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  stats,
  currentUser,
  onOpenLogin,
  onLogout
}) {
  const pendingCount = stats?.pending_count || 0;
  const pendingVerifications = stats?.pending_verifications || 0;

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
    {
      id: 'verifications',
      label: 'Verifications',
      icon: ShieldCheck,
      badge: pendingVerifications > 0 ? pendingVerifications : null,
      badgeColor: 'rose'
    },
    { id: 'masterlog', label: 'Master Log', icon: BookOpenCheck },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(9, 13, 22, 0.92)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: 1440,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 70,
        gap: 16
      }}>
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Building2 size={22} color="#ffffff" />
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
              Payment & Unit Automation
            </div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          overflowX: 'auto',
          padding: '4px 0'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} color={isActive ? '#818cf8' : 'currentColor'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: '0.7rem',
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

        {/* User actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)'
              }}>
                <UserCheck size={15} color="#10b981" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentUser.username}
                </span>
                <span className={`badge ${currentUser.role === 'admin' || currentUser.is_staff ? 'badge-emerald' : 'badge-indigo'}`} style={{ padding: '1px 6px', fontSize: '0.68rem' }}>
                  {currentUser.role || (currentUser.is_staff ? 'Admin' : 'User')}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="btn btn-primary btn-sm"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

          <a
            href="http://localhost:8000/admin/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--text-muted)' }}
            title="Open Django Unfold Admin"
          >
            <span>Django Admin</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </header>
  );
}
