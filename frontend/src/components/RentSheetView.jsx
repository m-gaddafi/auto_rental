import React, { useState, useEffect } from 'react';
import {
  TableProperties,
  Calendar,
  Building,
  RotateCw,
  Percent,
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function RentSheetView({ properties }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSheet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRentSheet(year, selectedPropertyId);
      setSheet(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load rent sheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSheet();
  }, [year, selectedPropertyId]);

  const formatMoney = (val) => {
    if (!val || val === 0) return '—';
    return new Intl.NumberFormat('en-UG', {
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header controls */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: 10,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8'
          }}>
            <TableProperties size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem' }}>12-Month Rental Ledger</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Excel-style matrix tracking rent payments across every unit for calendar year {year}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Year selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={16} color="var(--text-muted)" />
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="form-select"
              style={{ width: 110, padding: '7px 12px', fontSize: '0.875rem' }}
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Property Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={16} color="var(--text-muted)" />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="form-select"
              style={{ minWidth: 160, padding: '7px 12px', fontSize: '0.875rem' }}
            >
              <option value="">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={loadSheet}
            className="btn btn-secondary btn-sm"
            disabled={loading}
            title="Refresh Ledger"
          >
            <RotateCw size={14} className={loading ? 'pulse' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Ledger Metrics Summary */}
      {sheet && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}>
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Monthly Expected Capacity
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: 4 }}>
              {formatCurrency(sheet.maximum_possible)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              From {sheet.rows?.length || 0} enrolled units
            </div>
          </div>

          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Annual Potential
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', marginTop: 4 }}>
              {formatCurrency((sheet.maximum_possible || 0) * 12)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              100% full-year theoretical target
            </div>
          </div>

          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Ledger Color Codes
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
              <span className="badge badge-emerald">Full Payment</span>
              <span className="badge badge-amber">Partial</span>
              <span className="badge badge-muted">Not Paid</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          padding: 16,
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid var(--accent-rose)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#fb7185'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Spreadsheet Matrix Table */}
      {loading ? (
        <div className="glass-panel" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RotateCw size={28} className="pulse" style={{ margin: '0 auto 12px' }} />
          <div>Loading accounting matrix for {year}...</div>
        </div>
      ) : sheet && sheet.rows ? (
        <div className="rent-sheet-wrapper">
          <table className="rent-table">
            <thead>
              <tr>
                <th className="sticky-col" style={{ width: 140 }}>Unit ID</th>
                <th className="sticky-col-2" style={{ width: 140 }}>Monthly Rate</th>
                {sheet.months.map(([key, label]) => (
                  <th key={key} style={{ minWidth: 105, textTransform: 'capitalize' }}>
                    {label.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.rows.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    No units enrolled for this filter.
                  </td>
                </tr>
              ) : (
                sheet.rows.map((row) => (
                  <tr key={row.unit.id}>
                    {/* Unit ID Sticky */}
                    <td className="sticky-col">
                      <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.875rem' }}>
                        {row.unit.unit_id}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {row.unit.property_name || 'No Property'}
                      </div>
                    </td>

                    {/* Monthly Rate Sticky */}
                    <td className="sticky-col-2">
                      <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                        UGX {formatMoney(row.unit.monthly_rate)}/mo
                      </div>
                    </td>

                    {/* 12 Months Cells */}
                    {row.cells.map((cell, idx) => {
                      const cellClass =
                        cell.state === 'paid-full'
                          ? 'rent-cell-paid-full'
                          : cell.state === 'paid-partial'
                          ? 'rent-cell-paid-partial'
                          : 'rent-cell-not-paid';
                      return (
                        <td key={idx} className={cellClass}>
                          {cell.amount > 0 ? formatMoney(cell.amount) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}

              {/* Monthly Totals Row */}
              <tr className="summary-row">
                <td className="sticky-col" style={{ background: '#1e293b', fontWeight: 800 }}>TOTAL REVENUE</td>
                <td className="sticky-col-2" style={{ background: '#1e293b', color: '#94a3b8', fontSize: '0.75rem' }}>
                  Total Collected
                </td>
                {sheet.monthly_totals.map((total, idx) => (
                  <td key={idx} style={{ color: total > 0 ? '#34d399' : '#94a3b8' }}>
                    {total > 0 ? formatMoney(total) : '0'}
                  </td>
                ))}
              </tr>

              {/* Recovery % Row */}
              <tr className="summary-row">
                <td className="sticky-col" style={{ background: '#1e293b', fontWeight: 800 }}>RECOVERY %</td>
                <td className="sticky-col-2" style={{ background: '#1e293b', color: '#94a3b8', fontSize: '0.75rem' }}>
                  Collected vs Target
                </td>
                {sheet.recovery.map((rate, idx) => {
                  const num = Number(rate);
                  const isHigh = num >= 90;
                  const isMid = num > 0 && num < 90;
                  return (
                    <td key={idx} style={{
                      color: isHigh ? '#34d399' : isMid ? '#fbbf24' : '#64748b',
                      fontWeight: 700
                    }}>
                      {num.toFixed(0)}%
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
