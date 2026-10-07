import React, { useState, useEffect } from 'react';
import { Building2, Save, RotateCw, CheckCircle, Power, User, Phone } from 'lucide-react';
import { api } from '../api';

export default function EditUnitModal({
  isOpen,
  onClose,
  unit,
  properties,
  onSuccess,
  showToast
}) {
  const [unitId, setUnitId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (unit) {
      setUnitId(unit.unit_id || '');
      setPropertyId(unit.property ? unit.property.toString() : '');
      setTenantName(unit.tenant_name || '');
      setTenantPhone(unit.tenant_phone || '');
      setMonthlyRate(unit.monthly_rate ? unit.monthly_rate.toString() : '0');
      setIsActive(Boolean(unit.is_active));
    }
  }, [unit]);

  if (!isOpen || !unit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!unitId.trim()) {
      showToast('Unit ID is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateUnit(unit.id, {
        unit_id: unitId.trim(),
        property: propertyId ? Number(propertyId) : null,
        tenant_name: tenantName.trim(),
        tenant_phone: tenantPhone.trim(),
        monthly_rate: Number(monthlyRate) || 0,
        is_active: isActive,
      });

      showToast(`Unit ${unitId} updated successfully!`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to update unit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 28, maxWidth: 540 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={20} color="#6366f1" />
              <span>Modify Unit: {unit.unit_id}</span>
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Manager tool: Update tenant details, rental rates, and occupancy status
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status Toggle Card */}
          <div style={{
            padding: '14px 16px',
            background: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
            border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isActive ? '#34d399' : '#fb7185', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Power size={15} />
                <span>Unit Status: {isActive ? 'ACTIVE (Operational)' : 'INACTIVE (Archived / Closed)'}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {isActive ? 'Included in active rental spreadsheets and collections' : 'Excluded from monthly rent collections'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={isActive ? 'btn btn-emerald btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              {isActive ? 'Mark Inactive' : 'Mark Active'}
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Unit ID / Designation</label>
            <input
              type="text"
              placeholder="e.g., MSJ-101"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Property</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="form-select"
            >
              <option value="">No Property (Independent)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id.toString()}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tenant Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="e.g., John Baptist"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tenant Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="e.g., 256772123456"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Rent Rate (UGX)</label>
            <input
              type="number"
              step="5000"
              placeholder="e.g., 500000"
              value={monthlyRate}
              onChange={(e) => setMonthlyRate(e.target.value)}
              className="form-input"
              style={{ fontFamily: 'var(--font-mono)' }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <RotateCw size={15} className="pulse" /> : <Save size={15} />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
