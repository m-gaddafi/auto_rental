import React, { useState } from 'react';
import { Building, Plus, RotateCw } from 'lucide-react';
import { api } from '../api';

export default function AddPropertyModal({
  isOpen,
  onClose,
  onSuccess,
  showToast
}) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Property name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createProperty({
        name: name.trim(),
        is_active: true,
      });

      showToast(`Property "${name}" created successfully!`, 'success');
      setName('');
      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create property', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: 28, maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building size={20} color="#10b981" />
            <span>Add New Property</span>
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Property / Building Name</label>
            <input
              type="text"
              placeholder="e.g., Kampala Plaza, Victoria Heights"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-emerald">
              {submitting ? <RotateCw size={15} className="pulse" /> : <Plus size={15} />}
              <span>Add Property</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
