import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ArrowRight,
  ClipboardPaste,
  FileText
} from 'lucide-react';
import { api } from '../api';

export default function ImportReceiptsView({
  units,
  setActiveTab,
  showToast,
  onRefreshStats
}) {
  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);

  // Sample MTN Mobile Money SMS receipt template for quick 1-click test
  const sampleSms = `TxnID: MTN892178342 Date: 06/10/2026 Time: 10:15 From: John Baptist Tel: 256772123456 Amount: UGX 450,000
TxnID: MTN892178343 Date: 06/10/2026 Time: 11:30 From: Sarah Namubiru Tel: 256782654321 Amount: UGX 600,000
TxnID: MTN892178344 Date: 06/10/2026 Time: 14:00 From: Peter Mukasa Tel: 256701987654 Amount: UGX 1,000,000`;

  const handleInsertSample = () => {
    setRawText(sampleSms);
    setFile(null);
  };

  const handleParse = async () => {
    if (!rawText.trim() && !file) {
      showToast('Please paste SMS receipt text or choose an Excel/Word file', 'error');
      return;
    }

    setParsing(true);
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await api.parsePayments(formData);
      } else {
        res = await api.parsePayments({ raw_text: rawText });
      }

      setPreview(res.data.transactions || []);
      showToast(`Detected ${res.data.count} receipt(s)! Review matching units below.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to parse payments', 'error');
    } finally {
      setParsing(false);
    }
  };

  const handleUnitChange = (index, unitId) => {
    setPreview((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        matched_unit: unitId ? Number(unitId) : null,
      };
      return updated;
    });
  };

  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    try {
      const res = await api.importPayments(preview);
      showToast(res.data.detail, 'success');
      setPreview([]);
      setRawText('');
      setFile(null);
      if (onRefreshStats) onRefreshStats();
      // Jump to Confirmations queue
      setActiveTab('confirmations');
    } catch (err) {
      showToast(err.message || 'Failed to import payments', 'error');
    } finally {
      setImporting(false);
    }
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-UG', {
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileSpreadsheet size={22} color="#6366f1" />
            <span>Import & Ingest Payment Receipts</span>
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Parse MTN Mobile Money SMS notifications or upload bank spreadsheets (.xlsx) and Word tables (.docx)
          </p>
        </div>

        <button
          onClick={handleInsertSample}
          className="btn btn-secondary btn-sm"
          title="Fill sample SMS receipts"
        >
          <Sparkles size={14} color="#fbbf24" />
          <span>Insert Sample MTN SMS</span>
        </button>
      </div>

      {/* Input Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Method 1: Text Paste */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ClipboardPaste size={18} color="#818cf8" />
            <h2 style={{ fontSize: '1rem' }}>Paste SMS Notification Texts</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Paste one or multiple MTN Mobile Money SMS transaction alerts.
          </p>
          <textarea
            rows={8}
            placeholder={`TxnID: 10928374 Date: 05/10/2026 Time: 12:30 From: John Doe Tel: 256770000000 Amount: UGX 500,000`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="form-textarea"
            style={{
              flex: 1,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              resize: 'vertical',
              marginBottom: 16
            }}
          />
          <button
            onClick={handleParse}
            disabled={parsing || !rawText.trim()}
            className="btn btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {parsing ? <RotateCw size={15} className="pulse" /> : <Sparkles size={15} />}
            <span>Parse SMS Receipts</span>
          </button>
        </div>

        {/* Method 2: Document Upload */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Upload size={18} color="#10b981" />
            <h2 style={{ fontSize: '1rem' }}>Upload Excel (.xlsx) or Word (.docx)</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Upload files containing bank statements or receipt export tables.
          </p>

          <div style={{
            flex: 1,
            border: '2px dashed var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'rgba(255, 255, 255, 0.01)',
            marginBottom: 16
          }}>
            <FileText size={36} color="var(--text-muted)" style={{ marginBottom: 10 }} />
            <input
              type="file"
              accept=".xlsx,.docx"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) setFile(e.target.files[0]);
              }}
            />
            <label htmlFor="file-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', marginBottom: 6 }}>
              Choose File
            </label>
            <span style={{ fontSize: '0.8rem', color: file ? '#34d399' : 'var(--text-muted)' }}>
              {file ? file.name : 'Supported formats: .xlsx, .docx'}
            </span>
          </div>

          <button
            onClick={handleParse}
            disabled={parsing || !file}
            className="btn btn-emerald"
            style={{ alignSelf: 'flex-start' }}
          >
            {parsing ? <RotateCw size={15} className="pulse" /> : <Upload size={15} />}
            <span>Parse Uploaded File</span>
          </button>
        </div>
      </div>

      {/* Preview & Unit Matching Section */}
      {preview.length > 0 && (
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span>Extracted Receipts Preview ({preview.length})</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Verify auto-matched units before adding to the manager allocation queue.
              </p>
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="btn btn-primary"
            >
              {importing ? <RotateCw size={15} className="pulse" /> : <ArrowRight size={15} />}
              <span>Import {preview.length} Receipts to Queue</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#1e293b', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 16px', color: '#cbd5e1' }}>Txn ID</th>
                  <th style={{ padding: '12px 16px', color: '#cbd5e1' }}>Date & Time</th>
                  <th style={{ padding: '12px 16px', color: '#cbd5e1' }}>Sender</th>
                  <th style={{ padding: '12px 16px', color: '#cbd5e1' }}>Phone</th>
                  <th style={{ padding: '12px 16px', color: '#cbd5e1', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px 16px', color: '#cbd5e1', width: 220 }}>Matched Unit</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((item, idx) => {
                  const currentSelected = item.matched_unit ?? item.suggested_unit_id ?? '';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {item.transaction_id || `Txn #${idx + 1}`}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {item.payment_date || '—'} {item.payment_time ? `@ ${item.payment_time}` : ''}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                        {item.sender_name || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {item.sender_phone || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        UGX {formatMoney(item.amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          value={currentSelected}
                          onChange={(e) => handleUnitChange(idx, e.target.value)}
                          className="form-select"
                          style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                        >
                          <option value="">Select Unit...</option>
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.unit_id} ({u.tenant_name || 'Vacant'}) - {formatMoney(u.monthly_rate)}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
