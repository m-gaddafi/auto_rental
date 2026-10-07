import React from 'react';
import {
  TrendingUp,
  Building,
  Home,
  Clock,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle,
  Sparkles,
  Zap
} from 'lucide-react';

export default function DashboardView({
  stats,
  setActiveTab,
  onOpenAddUnit,
  onOpenAddProperty
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const rejectedConfirmations = stats?.rejected_confirmations || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="badge badge-emerald">
                <span className="pulse-dot pulse-emerald" />
                Live Ledger System
              </span>
              <span className="badge badge-indigo">
                Year {stats?.year || new Date().getFullYear()}
              </span>
            </div>
            <h1 style={{ fontSize: '1.875rem', marginBottom: 6 }}>
              Automated Rental Revenue & Settlement
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 640, fontSize: '0.9375rem' }}>
              Real-time payment reconciliation from MTN Mobile Money and bank receipts directly into individual unit ledgers with multi-step manager confirmation and admin verification.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('import')}
              className="btn btn-primary"
            >
              <FileSpreadsheet size={16} />
              <span>Import Receipts</span>
            </button>
            <button
              onClick={onOpenAddUnit}
              className="btn btn-secondary"
            >
              <PlusCircle size={16} />
              <span>Add Unit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rejected Confirmations Alert (if any) */}
      {rejectedConfirmations.length > 0 && (
        <div style={{
          padding: '18px 24px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16
        }}>
          <AlertTriangle color="#fb7185" size={24} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#fb7185', fontSize: '1rem', marginBottom: 4 }}>
              Attention: {rejectedConfirmations.length} Confirmation(s) Rejected by Admin
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
              The following payments were returned for correction. Please review the admin notes and re-allocate:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rejectedConfirmations.map((rej) => (
                <div key={rej.id} style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <strong style={{ color: '#ffffff' }}>Txn {rej.transaction_id}</strong>
                    <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>•</span>
                    <span style={{ color: '#fb7185' }}>Note: "{rej.rejection_comment || 'Correction needed'}"</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('confirmations')}
                    className="btn btn-danger btn-sm"
                  >
                    Re-allocate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20
      }}>
        {/* Card 1: Total Verified Revenue */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Verified Revenue ({stats?.year || 2026})
            </span>
            <div style={{
              padding: 8,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399'
            }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginBottom: 4 }}>
            {formatCurrency(stats?.total_revenue_year || 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {stats?.confirmed_count || 0} reconciled & verified settlements
          </div>
        </div>

        {/* Card 2: Monthly Potential */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Monthly Capacity
            </span>
            <div style={{
              padding: 8,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8'
            }}>
              <Zap size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
            {formatCurrency(stats?.total_monthly_potential || 0)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Across all {stats?.unit_count || 0} active rental units
          </div>
        </div>

        {/* Card 3: Pending Manager Confirmations */}
        <div className="glass-panel" style={{ padding: 24, cursor: 'pointer' }} onClick={() => setActiveTab('confirmations')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Pending Allocation
            </span>
            <div style={{
              padding: 8,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24'
            }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginBottom: 4 }}>
            {stats?.pending_count || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Unassigned receipts</span>
            <ArrowRight size={13} />
          </div>
        </div>

        {/* Card 4: Pending Admin Verifications */}
        <div className="glass-panel" style={{ padding: 24, cursor: 'pointer' }} onClick={() => setActiveTab('verifications')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              Pending Verification
            </span>
            <div style={{
              padding: 8,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185'
            }}>
              <ShieldAlert size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fb7185', marginBottom: 4 }}>
            {stats?.pending_verifications || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Awaiting Admin approval</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </div>

      {/* Two Columns: Workflow Steps & Portfolio Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Step-by-Step Workflow Pipeline */}
        <div className="glass-panel" style={{ padding: 28 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={18} color="#6366f1" />
            <span>Automated Settlement Pipeline</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'flex',
              gap: 16,
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                flexShrink: 0
              }}>1</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 2 }}>Receipt Ingestion & Parsing</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Paste MTN Mobile Money SMS messages or upload Excel/Word receipts. The system extracts Transaction ID, date, sender, and amount.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 16,
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                flexShrink: 0
              }}>2</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 2 }}>Smart Unit Matching & Manager Split</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Tenants are matched by phone number or rent amount. The manager can allocate payments to one or multiple units with Full/Part/Bal tags.
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 16,
              padding: 14,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                flexShrink: 0
              }}>3</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 2 }}>Admin Verification & Ledger Sync</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Administrator reviews and approves allocations. The system atomically posts entries to the Master Log and updates the Rent Spreadsheet.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="glass-panel" style={{ padding: 28 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Building size={18} color="#10b981" />
            <span>Property & Unit Distribution</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Properties Enrolled</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stats?.property_count || 0}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Rental Units</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stats?.unit_count || 0}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Rate Spectrum</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#cbd5e1' }}>
                {formatCurrency(stats?.lowest_rate || 0)} — {formatCurrency(stats?.highest_rate || 0)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                onClick={() => setActiveTab('rent-sheet')}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <span>View Rent Ledger</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => setActiveTab('units')}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <span>Manage Units</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
