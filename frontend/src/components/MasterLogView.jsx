import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Search,
  RotateCw,
  Filter,
  Calendar,
  Building,
  User,
  Phone,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

export default function MasterLogView({ showToast }) {
  const currentYear = new Date().getFullYear();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadEntries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.q = query.trim();
      if (year) params.year = year;
      if (month) params.month = month;
      if (statusFilter) params.payment_status = statusFilter;

      const res = await api.getMasterLog(params);
      setEntries(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load master log', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [year, month, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEntries();
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-UG', {
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const totalAmount = entries.reduce((acc, row) => acc + (Number(row.amount_paid) || 0), 0);

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
            <BookOpenCheck size={22} color="#6366f1" />
            <span>Master Accounting Ledger</span>
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Official chronological audit log of all verified rental payments, unit postings, and settlements
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtered Total</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              UGX {formatMoney(totalAmount)}
            </div>
          </div>
          <button
            onClick={loadEntries}
            className="btn btn-secondary btn-sm"
            disabled={loading}
          >
            <RotateCw size={14} className={loading ? 'pulse' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search Txn ID, Tenant Name, Unit ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 38 }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        {/* Year Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={15} color="var(--text-muted)" />
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="form-select"
            style={{ width: 110, padding: '7px 10px', fontSize: '0.85rem' }}
          >
            <option value="">All Years</option>
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Month Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="form-select"
            style={{ minWidth: 120, padding: '7px 10px', fontSize: '0.85rem', textTransform: 'capitalize' }}
          >
            <option value="">All Months</option>
            {MONTHS.map((m) => (
              <option key={m} value={m} style={{ textTransform: 'capitalize' }}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ minWidth: 130, padding: '7px 10px', fontSize: '0.85rem' }}
          >
            <option value="">All Statuses</option>
            <option value="full">Full Payment</option>
            <option value="partial">Partial</option>
            <option value="overpayment">Overpayment</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>Txn ID</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>Unit & Property</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>Tenant / Sender</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', textAlign: 'right' }}>Amount Paid</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>Period</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>Payment Status</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>Tag</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                    <RotateCw size={24} className="pulse" style={{ margin: '0 auto 10px' }} />
                    <div>Loading verified ledger entries...</div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                    No verified transactions found matching your search filters.
                  </td>
                </tr>
              ) : (
                entries.map((item) => {
                  const statusBadgeClass =
                    item.payment_status === 'full'
                      ? 'badge-emerald'
                      : item.payment_status === 'partial'
                      ? 'badge-amber'
                      : item.payment_status === 'overpayment'
                      ? 'badge-indigo'
                      : 'badge-muted';

                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                        {item.transaction_id || `Txn #${item.id}`}
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {item.payment_date || item.created_at?.substring(0, 10) || '—'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>
                          {item.unit_name || '—'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.property_name || 'No Property'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ color: '#cbd5e1', fontWeight: 600 }}>
                          {item.tenant_name || '—'}
                        </div>
                        {item.sender_phone && (
                          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {item.sender_phone}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        UGX {formatMoney(item.amount_paid)}
                      </td>
                      <td style={{ padding: '14px 18px', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {item.payment_month || '—'} {item.payment_year || ''}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge ${statusBadgeClass}`}>
                          {item.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {item.confirmation_tag ? (
                          <span className="badge badge-indigo">
                            {item.confirmation_tag.toUpperCase()}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
