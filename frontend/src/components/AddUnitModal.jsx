import React, { useState } from 'react';
import { Building2, Plus, RotateCw } from 'lucide-react';
import { api } from '../api';

export default function AddUnitModal({
  isOpen,
  onClose,
  properties,
  onSuccess,
  showToast
}) {
  const [unitId, setUnitId] = useState('');
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!unitId.trim()) {
      showToast('Unit ID is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createUnit({
        unit_id: unitId.trim(),
        property: propertyId ? Number(propertyId) : null,
        tenant_name: tenantName.trim(),
        tenant_phone: tenantPhone.trim(),
        monthly_rate: monthlyRate ? Number(monthlyRate) : 0,
        is_active: true,
      });

      showToast(`Unit ${unitId} created successfully!`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create unit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 28, maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={20} color="#6366f1" />
            <span>Add New Rental Unit</span>
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Unit Identification (e.g., A1, APT-203, SHOP-4)</label>
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
            <label className="form-label">Property Building</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="form-select"
            >
              <option value="">No Property (Independent)</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tenant Full Name</label>
              <input
                type="text"
                placeholder="e.g., Grace Nakato"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tenant Phone Number</label>
              <input
                type="text"
                placeholder="e.g., 256770123456"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                className="form-input"
              />
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
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? <RotateCw size={15} className="pulse" /> : <Plus size={15} />}
              <span>Create Unit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
