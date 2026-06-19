"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { getStoredUser } from '@/lib/auth';
import { financeApi, type FeeReminderHistory, type FeeReminderPreview, type FeeReminderRow, type FeeReminderSummary } from '@/lib/financeApi';

const navy = '#0b1f3a';
const muted = '#334155';
const card: CSSProperties = { border: '1px solid rgba(15, 23, 42, 0.12)', borderRadius: 18, padding: 18, background: 'rgba(255,255,255,0.94)', boxShadow: '0 12px 28px rgba(15,23,42,0.08)', color: navy };
const stat: CSSProperties = { ...card, padding: 14, minHeight: 88 };
const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 12, color: navy, borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 900 };
const td: CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f1f5f9', verticalAlign: 'top', color: navy };
const smallButton: CSSProperties = { border: '1px solid #cbd5e1', borderRadius: 999, padding: '8px 12px', background: '#fff', color: navy, fontWeight: 900, cursor: 'pointer' };

function statusColor(status?: string) {
  if (status === 'READY' || status === 'SENT') return '#166534';
  if (status === 'SUPERSEDED') return '#64748b';
  if (status === 'INVALID_ROW' || status === 'MISSING_STUDENT' || status === 'MISSING_PARENT_MAPPING') return '#991b1b';
  return navy;
}
function statusLabel(status?: string) { return (status || '-').replace(/_/g, ' '); }
function formatAmount(value?: number) { return typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : '-'; }
function formatDate(value?: string) { return value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'; }
function formatDateTime(value?: string) { return value ? new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'; }
function historyMinuteKey(value?: string) {
  if (!value) return 'sent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setSeconds(0, 0);
  return date.toISOString();
}

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
  const [messageTone, setMessageTone] = useState<'success' | 'error' | 'info'>('info');
  const [previewOpen, setPreviewOpen] = useState(true);
  const [openHistoryGroups, setOpenHistoryGroups] = useState<Record<string, boolean>>({});
  const [openUploadRows, setOpenUploadRows] = useState<Record<number, FeeReminderRow[]>>({});
  const [selectedUploadIds, setSelectedUploadIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const summary = preview?.summary;
  const rows = preview?.rows || [];
  const canSend = Boolean(summary?.uploadId && summary.readyRows > 0 && summary.status !== 'SENT');
  const latestUpload = uploads[0];

  const cards = useMemo(() => [
    ['Total Rows', summary?.totalRows || 0], ['Ready to Send', summary?.readyRows || 0], ['Invalid', summary?.invalidRows || 0],
    ['Missing Student', summary?.missingStudentRows || 0], ['Missing Parent Mapping', summary?.missingParentMappingRows || 0], ['Already Sent', summary?.sentRows || 0],
  ], [summary]);

  const historyGroups = useMemo(() => {
    const grouped = new Map<string, FeeReminderHistory[]>();
    history.forEach((item) => {
      const key = `${item.uploadId}-${historyMinuteKey(item.sentAt)}`;
      grouped.set(key, [...(grouped.get(key) || []), item]);
    });
    return Array.from(grouped.entries()).map(([key, items]) => ({ key, uploadId: items[0]?.uploadId, sentAt: items[0]?.sentAt, items }));
  }, [history]);

  async function loadHistory() {
    const [h, u] = await Promise.all([financeApi.history(schoolId, token), financeApi.uploads(schoolId, token)]);
    setHistory(h); setUploads(u);
  }
  useEffect(() => { loadHistory().catch(() => undefined); }, [schoolId]);

  async function upload() {
    if (!file) { setMessageTone('error'); setMessage('Select a pending fee Excel file first.'); return; }
    setLoading(true); setMessage('');
    try {
      const formData = new FormData(); formData.append('file', file);
      const result = await financeApi.uploadFeeReminders(formData, schoolId, token, user?.displayName || 'Web Admin');
      setPreview(result); setPreviewOpen(true); await loadHistory(); setMessageTone('success');
      setMessage('Validation completed. Previous unsent previews are marked superseded so only the latest validation is actionable.');
    } catch (e) { setMessageTone('error'); setMessage(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setLoading(false); }
  }
  async function send() {
    if (!summary?.uploadId) return;
    setLoading(true); setMessage('');
    try {
      const result = await financeApi.sendFeeReminders(summary.uploadId, schoolId, token, user?.displayName || 'Web Admin');
      setPreview({ summary: result.summary, rows: rows.map((row) => row.status === 'READY' ? { ...row, status: 'SENT', validationMessage: 'Reminder sent to mapped parent account(s).' } : row) });
      await loadHistory(); setMessageTone(result.rowsSent > 0 ? 'success' : 'info'); setMessage(result.message || `${result.notificationsCreated} parent notification(s) created.`);
    } catch (e) { setMessageTone('error'); setMessage(e instanceof Error ? e.message : 'Send failed.'); }
    finally { setLoading(false); }
  }
  async function toggleUploadRows(uploadId: number) {
    if (openUploadRows[uploadId]) { setOpenUploadRows((prev) => { const next = { ...prev }; delete next[uploadId]; return next; }); return; }
    const result = await financeApi.preview(uploadId, schoolId, token);
    setOpenUploadRows((prev) => ({ ...prev, [uploadId]: result.rows || [] }));
  }
  async function deleteSelectedUploads() {
    if (selectedUploadIds.length === 0) { setMessageTone('error'); setMessage('Select one or more upload log records to delete.'); return; }
    setLoading(true); setMessage('');
    try {
      const result = await financeApi.deleteUploads(selectedUploadIds, schoolId, token);
      setSelectedUploadIds([]); setOpenUploadRows({}); await loadHistory(); setMessageTone('success');
      setMessage(`${result.deleted} upload log record(s) deleted. Parent app notifications already sent are not deleted.`);
    } catch (e) { setMessageTone('error'); setMessage(e instanceof Error ? e.message : 'Delete failed.'); }
    finally { setLoading(false); }
  }

  return <div style={{ display: 'grid', gap: 18 }}>
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div><h2 style={{ margin: 0, color: navy }}>Fee Reminder Upload</h2><p style={{ margin: '6px 0 0', color: muted }}>Validate creates a preview only. Send creates parent notifications only for READY rows. Re-sending the same upload will not duplicate notifications.</p></div>
        <div style={{ color: '#92400e', fontWeight: 800 }}>Tenant: {schoolId}</div>
      </div>
      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div style={{ color: navy, fontWeight: 900 }}>Fee Reminder Excel</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(event) => setFile(event.target.files?.[0] || null)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{ ...smallButton, padding: '10px 18px' }}>Choose File</button>
          <span style={{ color: file ? '#166534' : muted, fontWeight: 800 }}>Selected File: {file?.name || 'No file selected'}</span>
          <button onClick={upload} disabled={loading || !file} style={{ border: 0, borderRadius: 999, padding: '10px 18px', background: file ? navy : '#cbd5e1', color: 'white', fontWeight: 800 }}>{loading ? 'Processing...' : 'Validate / Refresh Preview'}</button>
          <button onClick={send} disabled={loading || !canSend} style={{ border: 0, borderRadius: 999, padding: '10px 18px', background: canSend ? '#b45309' : '#cbd5e1', color: 'white', fontWeight: 800 }}>{summary?.status === 'SENT' ? 'Already Sent' : 'Send Reminders'}</button>
        </div>
      </div>
      {message && <p style={{ margin: '12px 0 0', color: messageTone === 'error' ? '#991b1b' : messageTone === 'success' ? '#166534' : muted, fontWeight: 800 }}>{message}</p>}
      {latestUpload && <p style={{ margin: '10px 0 0', color: muted, fontSize: 13 }}>Latest upload: <strong>{latestUpload.originalFilename || `Upload ${latestUpload.uploadId}`}</strong> · {statusLabel(latestUpload.status)} · {formatDateTime(latestUpload.createdAt)}</p>}
    </section>

    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>{cards.map(([label, value]) => <div key={label} style={stat}><div style={{ color: muted, fontSize: 12, fontWeight: 800 }}>{label}</div><div style={{ color: navy, fontSize: 28, fontWeight: 900 }}>{value}</div></div>)}</section>

    <section style={card}>
      <CollapsibleHeader title="Validation Preview" subtitle="Tap dropdown to show or hide validation records." open={previewOpen} onClick={() => setPreviewOpen(!previewOpen)} />
      {previewOpen && <DataTable rows={rows} />}
    </section>

    <section style={card}>
      <h3 style={{ marginTop: 0, color: navy }}>Parent Notification History</h3>
      <p style={{ marginTop: -4, color: muted, fontSize: 13, fontWeight: 700 }}>Sent reminder batches are grouped by send time. Tap each dropdown to see its records.</p>
      {historyGroups.length === 0 ? <p style={{ color: muted }}>No reminders sent yet.</p> : <div style={{ display: 'grid', gap: 10 }}>{historyGroups.map((group) => {
        const open = Boolean(openHistoryGroups[group.key]);
        return <div key={group.key} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 12, background: '#fff' }}>
          <CollapsibleHeader title={`${formatDateTime(group.sentAt)} · Sent ${group.items.length}`} subtitle={`Upload ${group.uploadId}`} open={open} onClick={() => setOpenHistoryGroups((prev) => ({ ...prev, [group.key]: !open }))} />
          {open && <HistoryTable rows={group.items} />}
        </div>;
      })}</div>}
    </section>

    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div><h3 style={{ margin: 0, color: navy }}>Validation / Send Upload Log</h3><p style={{ margin: '6px 0 0', color: muted, fontSize: 13, fontWeight: 700 }}>Select unwanted upload log records, or tap dropdown to inspect rows.</p></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" style={smallButton} onClick={() => setSelectedUploadIds(selectedUploadIds.length === uploads.length ? [] : uploads.map((item) => item.uploadId))}>{selectedUploadIds.length === uploads.length && uploads.length > 0 ? 'Clear All' : 'Select All'}</button>
          <button type="button" disabled={loading || selectedUploadIds.length === 0} style={{ ...smallButton, opacity: selectedUploadIds.length === 0 ? 0.55 : 1 }} onClick={deleteSelectedUploads}>Delete Selected</button>
        </div>
      </div>
      {uploads.length === 0 ? <p style={{ color: muted }}>No upload history yet.</p> : <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>{uploads.slice(0, 20).map((item) => {
        const checked = selectedUploadIds.includes(item.uploadId);
        const openRows = openUploadRows[item.uploadId];
        return <div key={item.uploadId} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 14, background: item.status === 'SUPERSEDED' ? '#f8fafc' : '#fff', color: navy }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, color: navy }}><input type="checkbox" checked={checked} onChange={() => setSelectedUploadIds((prev) => checked ? prev.filter((id) => id !== item.uploadId) : [...prev, item.uploadId])} />{item.originalFilename || `Upload ${item.uploadId}`}</label>
            <button type="button" style={smallButton} onClick={() => toggleUploadRows(item.uploadId)}>{openRows ? 'Hide Records ▲' : 'Show Records ▼'}</button>
          </div>
          <div style={{ color: statusColor(item.status), fontSize: 13, fontWeight: 900, marginTop: 6 }}>{statusLabel(item.status)}</div>
          <div style={{ color: muted, fontSize: 13, fontWeight: 700 }}>Ready {item.readyRows} · Sent {item.sentRows} · Invalid {item.invalidRows} · Missing Student {item.missingStudentRows} · Missing Parent {item.missingParentMappingRows}</div>
          <div style={{ color: muted, fontSize: 12 }}>{formatDateTime(item.createdAt)}{item.sentAt ? ` · Sent ${formatDateTime(item.sentAt)}` : ''}</div>
          {openRows && <DataTable rows={openRows} />}
        </div>;
      })}</div>}
    </section>
  </div>;
}

function CollapsibleHeader({ title, subtitle, open, onClick }: { title: string; subtitle?: string; open: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} style={{ width: '100%', border: 0, background: 'transparent', padding: 0, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}>
    <span><strong style={{ display: 'block', color: navy, fontSize: 16 }}>{title}</strong>{subtitle && <span style={{ color: muted, fontSize: 13, fontWeight: 700 }}>{subtitle}</span>}</span>
    <span style={{ color: navy, fontWeight: 900 }}>{open ? 'Hide ▲' : 'Show ▼'}</span>
  </button>;
}

function DataTable({ rows }: { rows: FeeReminderRow[] }) {
  if (!rows.length) return <p style={{ color: muted, fontWeight: 700 }}>Upload an Excel file to see validation preview.</p>;
  return <div style={{ overflowX: 'auto', marginTop: 12 }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={th}>Row</th><th style={th}>Student</th><th style={th}>Class</th><th style={th}>Amount</th><th style={th}>Due</th><th style={th}>Parents</th><th style={th}>Status</th><th style={th}>Message</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id}><td style={td}>{index + 1}</td><td style={td}>{row.studentName || row.studentId || '-'}</td><td style={td}>{[row.className, row.section].filter(Boolean).join(' - ') || '-'}</td><td style={td}>{formatAmount(row.pendingAmount)}</td><td style={td}>{formatDate(row.dueDate)}</td><td style={td}>{row.mappedParentNames || '-'}</td><td style={{ ...td, color: statusColor(row.status), fontWeight: 900 }}>{statusLabel(row.status)}</td><td style={td}>{row.validationMessage || '-'}</td></tr>)}</tbody></table></div>;
}

function HistoryTable({ rows }: { rows: FeeReminderHistory[] }) {
  return <div style={{ overflowX: 'auto', marginTop: 12 }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr><th style={th}>Row</th><th style={th}>Sent</th><th style={th}>Student</th><th style={th}>Class</th><th style={th}>Parent</th><th style={th}>Amount</th><th style={th}>Due</th><th style={th}>Status</th></tr></thead><tbody>{rows.map((item, index) => <tr key={item.id}><td style={td}>{index + 1}</td><td style={td}>{formatDateTime(item.sentAt)}</td><td style={td}>{item.studentName || item.studentId}</td><td style={td}>{[item.className, item.section].filter(Boolean).join(' - ') || '-'}</td><td style={td}>{item.parentName}</td><td style={td}>{formatAmount(item.pendingAmount)}</td><td style={td}>{formatDate(item.dueDate)}</td><td style={{ ...td, color: statusColor(item.status), fontWeight: 900 }}>{statusLabel(item.status)}</td></tr>)}</tbody></table></div>;
}
