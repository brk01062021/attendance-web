"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { getStoredUser } from '@/lib/auth';
import { financeApi, type FeeReminderHistory, type FeeReminderPreview, type FeeReminderRow, type FeeReminderSummary } from '@/lib/financeApi';

const card: CSSProperties = { border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: 18, padding: 18, background: 'rgba(255,255,255,0.94)', boxShadow: '0 12px 28px rgba(15,23,42,0.08)' };
const stat: CSSProperties = { ...card, padding: 14, minHeight: 88 };
const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#475569', borderBottom: '1px solid #e2e8f0' };
const td: CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' };

function statusColor(status?: string) {
  if (status === 'READY' || status === 'SENT') return '#166534';
  if (status === 'INVALID_ROW' || status === 'MISSING_STUDENT' || status === 'MISSING_PARENT_MAPPING') return '#991b1b';
  return '#0f172a';
}
function formatAmount(value?: number) { return typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : '-'; }
function formatDate(value?: string) { return value ? new Date(value).toLocaleDateString() : '-'; }

export default function FeeReminderPanel() {
  const user = getStoredUser();
  const schoolId = user?.schoolId || 'TST2';
  const token = user?.token;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FeeReminderPreview | null>(null);
  const [history, setHistory] = useState<FeeReminderHistory[]>([]);
  const [uploads, setUploads] = useState<FeeReminderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const summary = preview?.summary;
  const rows = preview?.rows || [];
  const canSend = Boolean(summary?.uploadId && summary.readyRows > 0);

  const cards = useMemo(() => [
    ['Total Rows', summary?.totalRows || 0], ['Ready', summary?.readyRows || 0], ['Invalid', summary?.invalidRows || 0],
    ['Missing Student', summary?.missingStudentRows || 0], ['Missing Parent Mapping', summary?.missingParentMappingRows || 0], ['Sent', summary?.sentRows || 0],
  ], [summary]);

  async function loadHistory() {
    const [h, u] = await Promise.all([financeApi.history(schoolId, token), financeApi.uploads(schoolId, token)]);
    setHistory(h); setUploads(u);
  }
  useEffect(() => { loadHistory().catch(() => undefined); }, [schoolId]);

  async function upload() {
    if (!file) { setMessage('Select a pending fee Excel file first.'); return; }
    setLoading(true); setMessage('');
    try {
      const formData = new FormData(); formData.append('file', file);
      const result = await financeApi.uploadFeeReminders(formData, schoolId, token, user?.displayName || 'Web Admin');
      setPreview(result); await loadHistory(); setMessage('Validation completed. Review the preview before sending reminders.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setLoading(false); }
  }
  async function send() {
    if (!summary?.uploadId) return;
    setLoading(true); setMessage('');
    try {
      const result = await financeApi.sendFeeReminders(summary.uploadId, schoolId, token, user?.displayName || 'Web Admin');
      setPreview({ summary: result.summary, rows: rows.map((row) => row.status === 'READY' ? { ...row, status: 'SENT', validationMessage: 'Reminder sent to mapped parent account(s).' } : row) });
      await loadHistory(); setMessage(`${result.notificationsCreated} parent notification(s) created.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Send failed.'); }
    finally { setLoading(false); }
  }

  return <div style={{ display: 'grid', gap: 18 }}>
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div><h2 style={{ margin: 0, color: '#0f172a' }}>Fee Reminder Upload</h2><p style={{ margin: '6px 0 0', color: '#64748b' }}>Required: Student ID or Student Name, Pending Amount, Due Date. Optional: Class, Section, Remarks.</p></div>
        <div style={{ color: '#92400e', fontWeight: 800 }}>Tenant: {schoolId}</div>
      </div>
      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div style={{ color: '#0f172a', fontWeight: 900 }}>Fee Reminder Excel</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ border: '1px solid #cbd5e1', borderRadius: 999, padding: '10px 18px', background: '#ffffff', color: '#0f172a', fontWeight: 900 }}>Choose File</button>
          <span style={{ color: file ? '#166534' : '#64748b', fontWeight: 800 }}>Selected File: {file?.name || 'No file selected'}</span>
          <button onClick={upload} disabled={loading || !file} style={{ border: 0, borderRadius: 999, padding: '10px 18px', background: file ? '#0f172a' : '#cbd5e1', color: 'white', fontWeight: 800 }}>{loading ? 'Processing...' : 'Validate Excel'}</button>
          <button onClick={send} disabled={loading || !canSend} style={{ border: 0, borderRadius: 999, padding: '10px 18px', background: canSend ? '#b45309' : '#cbd5e1', color: 'white', fontWeight: 800 }}>Send Reminders</button>
        </div>
      </div>
      {message && <p style={{ margin: '12px 0 0', color: message.includes('failed') ? '#991b1b' : '#166534', fontWeight: 700 }}>{message}</p>}
    </section>

    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>{cards.map(([label, value]) => <div key={label} style={stat}><div style={{ color: '#64748b', fontSize: 12, fontWeight: 800 }}>{label}</div><div style={{ color: '#0f172a', fontSize: 28, fontWeight: 900 }}>{value}</div></div>)}</section>

    <section style={card}><h3 style={{ marginTop: 0 }}>Row Preview</h3><DataTable rows={rows} /></section>
    <section style={card}><h3 style={{ marginTop: 0 }}>Reminder History</h3>{history.length === 0 ? <p style={{ color: '#64748b' }}>No reminders sent yet.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={th}>Sent</th><th style={th}>Student</th><th style={th}>Parent</th><th style={th}>Amount</th><th style={th}>Due</th><th style={th}>Status</th></tr></thead><tbody>{history.map((item) => <tr key={item.id}><td style={td}>{formatDate(item.sentAt)}</td><td style={td}>{item.studentName || item.studentId}</td><td style={td}>{item.parentName}</td><td style={td}>{formatAmount(item.pendingAmount)}</td><td style={td}>{formatDate(item.dueDate)}</td><td style={td}>{item.status}</td></tr>)}</tbody></table></div>}</section>
    <section style={card}><h3 style={{ marginTop: 0 }}>Recent Uploads</h3>{uploads.length === 0 ? <p style={{ color: '#64748b' }}>No upload history yet.</p> : <div style={{ display: 'grid', gap: 10 }}>{uploads.slice(0, 5).map((item) => <div key={item.uploadId} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 14 }}><strong>{item.originalFilename || `Upload ${item.uploadId}`}</strong><div style={{ color: '#64748b', fontSize: 13 }}>{item.status} · Ready {item.readyRows} · Sent {item.sentRows}</div></div>)}</div>}</section>
  </div>;
}

function DataTable({ rows }: { rows: FeeReminderRow[] }) {
  if (!rows.length) return <p style={{ color: '#64748b' }}>Upload an Excel file to see validation preview.</p>;
  return <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={th}>Row</th><th style={th}>Student</th><th style={th}>Class</th><th style={th}>Amount</th><th style={th}>Due</th><th style={th}>Parents</th><th style={th}>Status</th><th style={th}>Message</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td style={td}>{row.rowNumber}</td><td style={td}>{row.studentName || row.studentId || '-'}</td><td style={td}>{[row.className, row.section].filter(Boolean).join(' - ') || '-'}</td><td style={td}>{formatAmount(row.pendingAmount)}</td><td style={td}>{formatDate(row.dueDate)}</td><td style={td}>{row.mappedParentNames || '-'}</td><td style={{ ...td, color: statusColor(row.status), fontWeight: 900 }}>{row.status.replace(/_/g, ' ')}</td><td style={td}>{row.validationMessage || '-'}</td></tr>)}</tbody></table></div>;
}
