import React, { useState, useEffect } from 'react';
import {
  Building2,
  Home,
  PlusCircle,
  Search,
  Filter,
  Phone,
  User,
  CheckCircle,
  RotateCw,
  Wallet,
  Edit,
  Power,
  PowerOff
} from 'lucide-react';
import EditUnitModal from './EditUnitModal';
import { api } from '../api';

export default function UnitsView({
  properties,
  onRefreshProperties,
  onOpenAddUnit,
  onOpenAddProperty,
  showToast
}) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' | 'active' | 'inactive'

  // Edit modal
  const [editingUnit, setEditingUnit] = useState(null);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedProperty) params.property_id = selectedProperty;
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const res = await api.getUnits(params);
      setUnits(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to load units', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, [selectedProperty, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUnits();
  };

  const handleToggleStatus = async (unit) => {
    try {
      const res = await api.toggleUnitStatus(unit.id);
      const newStatus = res.data.is_active;
      showToast(`Unit ${unit.unit_id} is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}.`, 'success');
      loadUnits();
    } catch (err) {
      showToast(err.message || 'Failed to change status', 'error');
    }
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-UG', {
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Bar */}
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
            <Building2 size={22} color="#6366f1" />
            <span>Properties & Rental Units</span>
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Manager hub: Modify tenant info, rent rates, and update operational unit status
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={onOpenAddProperty}
            className="btn btn-secondary btn-sm"
          >
            <PlusCircle size={15} />
            <span>Add Property</span>
          </button>
          <button
            onClick={onOpenAddUnit}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={15} />
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {/* Properties chips */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          onClick={() => setSelectedProperty('')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: selectedProperty === '' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            background: selectedProperty === '' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
            color: selectedProperty === '' ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All Properties ({properties.reduce((acc, p) => acc + (p.unit_count || 0), 0)})
        </button>

        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProperty(p.id.toString())}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: selectedProperty === p.id.toString() ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              background: selectedProperty === p.id.toString() ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
              color: selectedProperty === p.id.toString() ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {p.name} ({p.unit_count || 0})
          </button>
        ))}
      </div>

      {/* Search & Status Filters */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search by Unit ID or Tenant Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 38 }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`btn btn-sm ${statusFilter === 'active' ? 'btn-emerald' : 'btn-secondary'}`}
            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
          >
            Active Only
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`btn btn-sm ${statusFilter === 'inactive' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
          >
            Inactive Only
          </button>
        </div>

        <button
          onClick={loadUnits}
          className="btn btn-ghost btn-sm"
          title="Refresh"
        >
          <RotateCw size={15} />
        </button>
      </div>

      {/* Units Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>Unit ID</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>Property</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>Tenant</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600 }}>Phone</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Monthly Rate</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Total Paid</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Balance</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>Status</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    Loading rental units...
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No rental units found matching your search.
                  </td>
                </tr>
              ) : (
                units.map((unit) => {
                  const balance = Number(unit.current_balance);
                  return (
                    <tr
                      key={unit.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        opacity: unit.is_active ? 1 : 0.65,
                      }}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#ffffff' }}>
                        {unit.unit_id}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                        {unit.property_name || '—'}
                      </td>
                      <td style={{ padding: '14px 18px', color: unit.tenant_name ? '#ffffff' : 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <User size={14} color="var(--text-muted)" />
                          <span>{unit.tenant_name || 'Vacant'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {unit.tenant_phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={13} color="#10b981" />
                            <span>{unit.tenant_phone}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        UGX {formatMoney(unit.monthly_rate)}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', color: '#34d399', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        UGX {formatMoney(unit.total_paid)}
                      </td>
                      <td style={{
                        padding: '14px 18px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: balance > 0 ? '#fbbf24' : balance < 0 ? '#34d399' : '#94a3b8'
                      }}>
                        UGX {formatMoney(balance)}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(unit)}
                          className={`badge ${unit.is_active ? 'badge-emerald' : 'badge-rose'}`}
                          style={{
                            cursor: 'pointer',
                            border: 'none',
                            padding: '4px 10px',
                            transition: 'transform 0.15s ease'
                          }}
                          title="Click to toggle Active / Inactive"
                        >
                          <span className={`pulse-dot ${unit.is_active ? 'pulse-emerald' : ''}`} style={{ background: unit.is_active ? '#10b981' : '#f43f5e' }} />
                          <span>{unit.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setEditingUnit(unit)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          title="Modify unit details and rate"
                        >
                          <Edit size={13} color="#818cf8" />
                          <span>Modify</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Unit Modal */}
      {editingUnit && (
        <EditUnitModal
          isOpen={Boolean(editingUnit)}
          onClose={() => setEditingUnit(null)}
          unit={editingUnit}
          properties={properties}
          onSuccess={() => {
            loadUnits();
            if (onRefreshProperties) onRefreshProperties();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
