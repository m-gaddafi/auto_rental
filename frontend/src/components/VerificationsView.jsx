import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  XCircle,
  Building,
  User,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function VerificationsView({
  showToast,
  onRefreshStats
}) {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // { type: 'reject', item }
  const [rejectionNote, setRejectionNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadPendingVerifications = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingVerifications();
      setVerifications(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load verifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const handleVerify = async (item) => {
    setProcessing(true);
    try {
      await api.verifyConfirmation(item.id);
      showToast(`Verification approved! Payment posted to Master Ledger.`, 'success');
      loadPendingVerifications();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionNote.trim()) {
      showToast('Please provide a reason for rejecting this confirmation', 'error');
      return;
    }

    setProcessing(true);
    try {
      await api.rejectConfirmation(actionModal.item.id, rejectionNote.trim());
      showToast('Confirmation rejected and returned to Manager Queue.', 'info');
      setActionModal(null);
      setRejectionNote('');
      loadPendingVerifications();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-UG', {
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={22} color="#10b981" />
            <span>Administrator Verification Portal</span>
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Audit and approve manager payment allocations before they officially post into the accounting ledgers
          </p>
        </div>

        <button
          onClick={loadPendingVerifications}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          <RotateCw size={14} className={loading ? 'pulse' : ''} />
          <span>Refresh Queue ({verifications.length})</span>
        </button>
      </div>

      {/* Verifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RotateCw size={24} className="pulse" style={{ margin: '0 auto 10px' }} />
            <div>Loading pending verifications...</div>
          </div>
        ) : verifications.length === 0 ? (
          <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: '#ffffff', marginBottom: 4 }}>No Pending Verifications</h3>
            <p style={{ fontSize: '0.85rem' }}>All submitted manager confirmations have been verified and settled.</p>
          </div>
        ) : (
          verifications.map((item) => {
            const p = item.payment_details;
            return (
              <div key={item.id} className="glass-panel" style={{ padding: 24 }}>
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 16,
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: 16,
                  marginBottom: 16
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                        Txn #{p?.transaction_id || item.payment}
                      </span>
                      <span className="badge badge-amber">Pending Verification</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Sender: <strong style={{ color: '#ffffff' }}>{p?.sender_name || '—'}</strong> ({p?.sender_phone || '—'})
                      <span style={{ margin: '0 8px' }}>•</span>
                      Date: {p?.payment_date || '—'} {p?.payment_time ? `@ ${p.payment_time}` : ''}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                      UGX {formatMoney(p?.amount || item.allocation_total)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Confirmed by: {item.confirmed_by || 'Manager'}
                    </div>
                  </div>
                </div>

                {/* Manager Note */}
                {item.confirmation_comment && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    marginBottom: 16
                  }}>
                    <strong style={{ color: '#cbd5e1' }}>Manager Justification:</strong> {item.confirmation_comment}
                  </div>
                )}

                {/* Allocations Table */}
                <div style={{ marginBottom: 16, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Unit Target</th>
                        <th style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Property</th>
                        <th style={{ padding: '8px 12px', color: 'var(--text-secondary)', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Tag</th>
                        <th style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Month & Year</th>
                        <th style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.allocations?.map((alloc, aIdx) => (
                        <tr key={aIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#ffffff' }}>
                            {alloc.unit_name || `Unit #${alloc.unit}`}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>
                            {alloc.property_name || '—'}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                            UGX {formatMoney(alloc.amount)}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span className="badge badge-indigo">
                              {alloc.allocation_tag?.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>
                            {alloc.payment_month || '—'} {alloc.payment_year || ''}
                          </td>
                          <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                            {alloc.comment || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Verification Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    onClick={() => setActionModal({ type: 'reject', item })}
                    disabled={processing}
                    className="btn btn-danger btn-sm"
                  >
                    <XCircle size={15} />
                    <span>Reject & Send Back</span>
                  </button>
                  <button
                    onClick={() => handleVerify(item)}
                    disabled={processing}
                    className="btn btn-emerald btn-sm"
                  >
                    <CheckCircle2 size={15} />
                    <span>Verify & Post to Ledger</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {actionModal?.type === 'reject' && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500, padding: 24 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 6, color: '#fb7185', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} />
              <span>Reject Allocation</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Please provide feedback explaining why this allocation was rejected. The manager will be prompted to adjust and resubmit.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label className="form-label">Rejection Reason</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Incorrect unit assigned. Tenant indicates payment was for Unit 104 instead of 102."
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !rejectionNote.trim()}
                  className="btn btn-danger btn-sm"
                >
                  {processing ? <RotateCw size={14} className="pulse" /> : <XCircle size={14} />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
