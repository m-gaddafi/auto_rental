import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 18px',
      borderRadius: 'var(--radius-lg)',
      background: '#0f172a',
      border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.4)' : isError ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      color: '#ffffff',
      fontSize: '0.875rem',
      maxWidth: 420,
      animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {isSuccess && <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />}
      {isError && <AlertCircle size={18} color="#fb7185" style={{ flexShrink: 0 }} />}
      {!isSuccess && !isError && <Info size={18} color="#818cf8" style={{ flexShrink: 0 }} />}

      <div style={{ flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 2
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
