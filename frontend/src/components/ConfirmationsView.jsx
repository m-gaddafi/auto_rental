import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Plus,
  Trash2,
  Check,
  Building,
  User,
  Phone,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

export default function ConfirmationsView({
  units,
  showToast,
  onRefreshStats
}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [managerComment, setManagerComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPendingPayments = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingConfirmations();
      setPayments(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load pending payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const openAllocateModal = (payment) => {
    setActivePayment(payment);
    const currentMonthName = MONTHS[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    // Default single allocation row preselected to matched unit
    setAllocations([
      {
        unit: payment.matched_unit || (units[0]?.id || ''),
        amount: Number(payment.amount),
        tag: 'part',
        month: currentMonthName,
        year: currentYear,
        comment: '',
      }
    ]);
    setManagerComment('');
  };

  const handleAddRow = () => {
    const currentMonthName = MONTHS[new Date().getMonth()];
    const currentYear = new Date().getFullYear();
    setAllocations((prev) => [
      ...prev,
      {
        unit: units[0]?.id || '',
        amount: 0,
        tag: 'part',
        month: currentMonthName,
        year: currentYear,
        comment: '',
      }
    ]);
  };

  const handleRemoveRow = (idx) => {
    setAllocations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRowChange = (idx, field, value) => {
    setAllocations((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const totalAllocated = allocations.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
  const requiredAmount = activePayment ? Number(activePayment.amount) : 0;
  const difference = requiredAmount - totalAllocated;
  const isMatch = Math.abs(difference) < 0.01;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMatch) {
      showToast(`Allocated sum must equal UGX ${formatMoney(requiredAmount)}. Current diff: UGX ${formatMoney(difference)}`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createConfirmation({
        payment_id: activePayment.id,
        confirmation_comment: managerComment,
        allocations: allocations.map((row) => ({
          unit: Number(row.unit),
          amount: Number(row.amount),
          tag: row.tag,
          month: row.month,
          year: Number(row.year),
          comment: row.comment || '',
        })),
      });

      showToast('Payment allocated and submitted to Admin Verification queue!', 'success');
      setActivePayment(null);
      loadPendingPayments();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showToast(err.message || 'Failed to submit confirmation', 'error');
    } finally {
      setSubmitting(false);
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
            <CheckCircle2 size={22} color="#f59e0b" />
            <span>Manager Confirmations Queue</span>
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Allocate incoming transactions to tenant units with Full, Part, or Balance settlement tags
          </p>
        </div>

        <button
          onClick={loadPendingPayments}
          className="btn btn-secondary btn-sm"
          disabled={loading}
        >
          <RotateCw size={14} className={loading ? 'pulse' : ''} />
          <span>Refresh Queue ({payments.length})</span>
        </button>
      </div>

      {/* Payments List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RotateCw size={24} className="pulse" style={{ margin: '0 auto 10px' }} />
            <div>Loading pending payments...</div>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: '#ffffff', marginBottom: 4 }}>Queue All Caught Up!</h3>
            <p style={{ fontSize: '0.85rem' }}>There are currently no raw receipts awaiting unit allocation.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>Txn ID</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>Date & Time</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>Sender</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>Phone</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>Auto-Match</th>
                  <th style={{ padding: '14px 20px', color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const hasRejection = p.rejected_confirmations && p.rejected_confirmations.length > 0;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: hasRejection ? 'rgba(244, 63, 94, 0.05)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        <div style={{ color: '#ffffff' }}>{p.transaction_id}</div>
                        {hasRejection && (
                          <span className="badge badge-rose" style={{ marginTop: 4, fontSize: '0.65rem' }}>
                            Returned by Admin
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {p.payment_date || '—'} {p.payment_time ? `@ ${p.payment_time}` : ''}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: '#ffffff' }}>
                        {p.sender_name || '—'}
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {p.sender_phone || '—'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        UGX {formatMoney(p.amount)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {p.matched_unit_name ? (
                          <span className="badge badge-indigo">
                            {p.matched_unit_name}
                          </span>
                        ) : (
                          <span className="badge badge-muted">Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => openAllocateModal(p)}
                          className="btn btn-primary btn-sm"
                        >
                          <span>Allocate & Confirm</span>
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocate Payment Modal */}
      {activePayment && (
        <div className="modal-overlay" onClick={() => setActivePayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Allocate Payment to Unit(s)</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <span>Txn: <strong style={{ color: '#fff' }}>{activePayment.transaction_id}</strong></span>
                  <span>•</span>
                  <span>Sender: <strong style={{ color: '#fff' }}>{activePayment.sender_name || '—'}</strong></span>
                  <span>•</span>
                  <span>Amount: <strong style={{ color: '#34d399' }}>UGX {formatMoney(activePayment.amount)}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setActivePayment(null)}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Rejection note alert if applicable */}
            {activePayment.rejected_confirmations && activePayment.rejected_confirmations.length > 0 && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 20,
                fontSize: '0.85rem',
                color: '#fb7185'
              }}>
                <strong>Admin Feedback:</strong> {activePayment.rejected_confirmations[0].rejection_comment}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Allocations Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0 }}>Allocation Breakdown</label>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    <Plus size={13} />
                    <span>Split Across Another Unit</span>
                  </button>
                </div>

                {allocations.map((row, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.8fr 1.2fr 0.9fr 1.1fr 0.8fr 36px',
                      gap: 10,
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {/* Unit */}
                    <div>
                      <select
                        value={row.unit}
                        onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                        className="form-select"
                        style={{ fontSize: '0.8rem', padding: '6px 8px' }}
                        required
                      >
                        <option value="">Select unit...</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.unit_id} ({u.tenant_name || 'Vacant'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <input
                        type="number"
                        step="1000"
                        placeholder="Amount"
                        value={row.amount}
                        onChange={(e) => handleRowChange(idx, 'amount', e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.8rem', padding: '6px 8px', fontFamily: 'var(--font-mono)' }}
                        required
                      />
                    </div>

                    {/* Tag */}
                    <div>
                      <select
                        value={row.tag}
                        onChange={(e) => handleRowChange(idx, 'tag', e.target.value)}
                        className="form-select"
                        style={{ fontSize: '0.8rem', padding: '6px 6px' }}
                      >
                        <option value="part">Part</option>
                        <option value="full">Full</option>
                        <option value="bal">Bal</option>
                      </select>
                    </div>

                    {/* Month */}
                    <div>
                      <select
                        value={row.month}
                        onChange={(e) => handleRowChange(idx, 'month', e.target.value)}
                        className="form-select"
                        style={{ fontSize: '0.8rem', padding: '6px 6px', textTransform: 'capitalize' }}
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m} style={{ textTransform: 'capitalize' }}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year */}
                    <div>
                      <input
                        type="number"
                        value={row.year}
                        onChange={(e) => handleRowChange(idx, 'year', e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.8rem', padding: '6px 6px' }}
                      />
                    </div>

                    {/* Delete */}
                    <div>
                      {allocations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: 4, color: '#fb7185' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Math Validator Bar */}
              <div style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                background: isMatch ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${isMatch ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Allocated: </span>
                  <strong style={{ color: '#fff' }}>UGX {formatMoney(totalAllocated)}</strong>
                  <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>/</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Payment Total: </span>
                  <strong style={{ color: '#34d399' }}>UGX {formatMoney(requiredAmount)}</strong>
                </div>

                <div>
                  {isMatch ? (
                    <span style={{ color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={16} />
                      <span>Balanced (100%)</span>
                    </span>
                  ) : (
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                      Difference: UGX {formatMoney(difference)}
                    </span>
                  )}
                </div>
              </div>

              {/* Manager Note */}
              <div className="form-group">
                <label className="form-label">Manager Note / Allocation Justification</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Confirmed with tenant John Doe over phone. Rent payment for October."
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  className="form-textarea"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setActivePayment(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isMatch}
                  className="btn btn-primary"
                >
                  {submitting ? <RotateCw size={15} className="pulse" /> : <CheckCircle2 size={15} />}
                  <span>Submit for Admin Verification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
