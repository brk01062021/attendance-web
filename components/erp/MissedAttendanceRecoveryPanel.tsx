'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';

type RecoveryIssue = {
  rowNumber: number;
  category: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
};

type RecoveryCard = {
  label: string;
  count: number;
  severity: 'ERROR' | 'WARNING';
  guidance: string;
};

type RecoveryRow = {
  rowNumber: number;
  studentId: string;
  studentName?: string;
  className: string;
  section: string;
  attendanceDate: string;
  status: string;
  reason: string;
  valid: boolean;
};

type RecoveryResponse = {
  recoveryBatchId?: string;
  schoolId: string;
  status: string;
  message: string;
  valid: boolean;
  canSubmit: boolean;
  totalRows: number;
  acceptedRows: number;
  submittedRows: number;
  errorCount: number;
  warningCount: number;
  rows: RecoveryRow[];
  issues: RecoveryIssue[];
  validationCards: RecoveryCard[];
};

type RecoveryStatus = {
  status: string;
  label: string;
  message: string;
  latestRecoveryBatchId?: string;
  submittedRows: number;
  auditTrail: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

function label(value?: string) {
  return String(value || 'Pending')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function issueRows(issues: RecoveryIssue[], category: string) {
  const rows = issues
    .filter((issue) => issue.category === category && issue.rowNumber > 0)
    .map((issue) => issue.rowNumber);
  const unique = Array.from(new Set(rows)).slice(0, 6).join(', ');
  return unique || 'Review workbook';
}

function auditParts(item: string) {
  const dateMatch = item.match(/^(\d{4}-\d{2}-\d{2})/);
  const batchMatch = item.match(/(ATT-REC-[A-Z0-9-]+)/i);
  const byMatch = item.match(/ by (.+)$/i);
  const rowsMatch = item.match(/(\d+)\s+(row|rows|record|records)/i);

  return {
    batch: batchMatch?.[1] || 'Recovery batch',
    date: dateMatch?.[1] || 'Latest',
    submittedBy: byMatch?.[1] || 'School Admin',
    records: rowsMatch?.[1] || '—',
    detail: item,
  };
}

export default function MissedAttendanceRecoveryPanel() {
  const user = getStoredUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);
  const auditRef = useRef<HTMLElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [templateDownloaded, setTemplateDownloaded] = useState(false);
  const [response, setResponse] = useState<RecoveryResponse | null>(null);
  const [status, setStatus] = useState<RecoveryStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadStatus() {
    try {
      setStatus(await webApi.missedAttendanceRecoveryStatus<RecoveryStatus>(user?.token, user?.schoolId));
    } catch {
      setStatus(null);
    }
  }

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function downloadTemplate() {
    const res = await fetch(`${API_BASE_URL}/attendance/recovery/template`, {
      headers: {
        ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        ...(user?.schoolId ? { 'X-School-Id': user.schoolId } : {}),
      },
    });

    if (!res.ok) {
      setError('Template could not be downloaded. Try again.');
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vidyasetu-missed-attendance-template.xlsx';
    a.click();
    setTemplateDownloaded(true);
    URL.revokeObjectURL(url);
  }

  async function validateFile() {
    if (!file) {
      setError('Please choose the missed attendance Excel file first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('file', file);

      const result = await webApi.validateMissedAttendanceRecovery<RecoveryResponse>(
        form,
        user?.token,
        user?.schoolId,
        user?.displayName || user?.username || 'Admin',
      );

      setResponse(result);
      await loadStatus();

      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch {
      setError('Missed attendance file could not be validated. Check the template columns and upload again.');
    } finally {
      setLoading(false);
    }
  }

  async function submitRecovery() {
    if (!response?.recoveryBatchId || !response.canSubmit) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const result = await webApi.submitMissedAttendanceRecovery<RecoveryResponse>(
        response.recoveryBatchId,
        user?.token,
        user?.schoolId,
        user?.displayName || user?.username || 'Admin',
      );

      setResponse(result);
      await loadStatus();

      setTimeout(() => {
        auditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch {
      setError('Recovery could not be submitted. Resolve validation issues and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const previewRows = useMemo(() => response?.rows?.slice(0, 60) || [], [response]);

  const canSubmit = Boolean(response?.canSubmit && response?.acceptedRows > 0 && response?.errorCount === 0);
  const recoverySubmitted = response?.status === 'SUBMITTED' || status?.status === 'SUBMITTED';
  const hasAuditTrail = Boolean(status?.auditTrail?.length);

  function workflowStepClass(completed: boolean, disabled = false) {
    const base = 'rounded-2xl px-3 py-2 transition border text-center';
    if (completed) {
      return `${base} border-amber-300/70 bg-gradient-to-br from-amber-400 to-amber-200 text-slate-950 shadow-[0_10px_24px_rgba(214,168,79,0.18)]`;
    }
    if (disabled) {
      return `${base} border-white/10 text-amber-100/45 cursor-not-allowed`;
    }
    return `${base} border-transparent text-amber-100 hover:border-amber-200/35 hover:bg-white/10`;
  }

  return (
    <div className="space-y-5">
      <section className="page-card gold-panel">
        <div className="section-heading-row items-start">
          <div className="max-w-3xl">
            <p className="eyebrow">Attendance recovery</p>
            <h2>Recover Missed Attendance</h2>
            <p className="page-subtitle mt-2">
              Use this workflow when approved attendance entries were missed. Web ERP handles template download,
              upload, validation, preview, submit recovery, audit trail, and attendance history update.
            </p>
            <p className="mt-4 text-sm font-black text-amber-100">
              Required columns: Student ID, Class, Section, Attendance Date, Status, Reason
            </p>
          </div>
          <span className="status-pill status-pill--pending">Admin / Principal</span>
        </div>

        <div className="mt-5 grid gap-3 rounded-3xl border border-amber-200/20 bg-slate-950/20 p-3 text-xs font-black uppercase tracking-[0.18em] md:grid-cols-6">
          <button className={workflowStepClass(templateDownloaded)} type="button" onClick={downloadTemplate}>
            Download Template
          </button>
          <button className={workflowStepClass(Boolean(file))} type="button" onClick={() => fileInputRef.current?.click()}>
            Upload File
          </button>
          <button className={workflowStepClass(Boolean(response), !file || loading)} type="button" onClick={validateFile} disabled={!file || loading}>
            Validate
          </button>
          <button className={workflowStepClass(Boolean(response), !response)} type="button" disabled={!response} onClick={() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            Preview
          </button>
          <button className={workflowStepClass(Boolean(recoverySubmitted), !canSubmit || submitting)} type="button" disabled={!canSubmit || submitting} onClick={submitRecovery}>
            Submit Recovery
          </button>
          <button className={workflowStepClass(hasAuditTrail, !hasAuditTrail)} type="button" disabled={!hasAuditTrail} onClick={() => auditRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            Audit Trail
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="metric-card import-kpi-card select-none">
            <p className="metric-label">RECOVERY STATUS</p>
            <p className="import-kpi-value import-kpi-status">
              {status ? label(status.status) : 'No Recovery'}
            </p>
          </div>

          <div className="metric-card import-kpi-card select-none">
            <p className="metric-label">RECOVERED RECORDS</p>
            <p className="import-kpi-value">{status?.submittedRows || 0}</p>
          </div>

          <div className="metric-card import-kpi-card select-none">
            <p className="metric-label">VALIDATION ISSUES</p>
            <p className="import-kpi-value">{response?.errorCount || 0}</p>
          </div>

          <div className="metric-card import-kpi-card select-none">
            <p className="metric-label">ACCEPTED RECORDS</p>
            <p className="import-kpi-value">{response?.acceptedRows || 0}</p>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/25 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="secondary-button min-h-[46px] px-5" type="button" onClick={downloadTemplate}>
              Download Template
            </button>

            <input
              ref={fileInputRef}
              className="min-h-[46px] w-full rounded-2xl border border-amber-200/40 bg-white/95 px-4 py-3 text-sm font-bold text-slate-900 shadow-sm lg:w-auto"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <button className="primary-button min-h-[46px] px-6" type="button" onClick={validateFile} disabled={loading}>
              {loading ? 'Validating…' : 'Validate'}
            </button>
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-200/80">
            Submit Recovery is available after validation succeeds.
          </p>

          {file ? <p className="mt-3 text-sm font-bold text-amber-100">Selected: {file.name}</p> : null}

          {error ? (
            <p className="mt-3 rounded-2xl border border-red-300/40 bg-red-950/40 p-3 text-sm font-bold text-red-100">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      {response ? (
        <section ref={previewRef} id="preview-section" className="page-card gold-panel scroll-mt-6">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Validate → Preview → Submit</p>
              <h2>{label(response.status)}</h2>
              <p className="page-subtitle mt-2">{response.message}</p>
            </div>

            <button
              className="primary-button min-h-[46px] px-5 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={!canSubmit || submitting}
              onClick={submitRecovery}
            >
              {submitting
                ? 'Submitting…'
                : response.status === 'SUBMITTED'
                  ? 'Submitted'
                  : canSubmit
                    ? 'Submit Recovery'
                    : 'Submit Disabled'}
            </button>
          </div>

          {response.validationCards?.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {response.validationCards.map((card) => (
                <div className="status-list" key={card.label}>
                  <div className="status-row">
                    <strong>Issue</strong>
                    <span>{card.label}</span>
                  </div>
                  <div className="status-row">
                    <strong>Affected Records</strong>
                    <span>
                      {card.count} issue{card.count === 1 ? '' : 's'} · Rows {issueRows(response.issues, card.label)}
                    </span>
                  </div>
                  <div className="status-row">
                    <strong>Action Required</strong>
                    <span>{card.guidance}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-200/40 bg-emerald-950/20 p-3">
              <div className="text-sm font-bold text-emerald-200">Validation Complete</div>
              <div className="mt-1 text-xs font-medium text-emerald-100">Ready for Submit</div>
            </div>
          )}

          <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950/50 text-amber-100">
                <tr>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Section</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white/95 text-slate-900">
                {previewRows.map((row) => (
                  <tr key={`${row.rowNumber}-${row.studentId}`} className="border-t border-slate-200">
                    <td className="p-3 font-bold">{row.studentId}</td>
                    <td className="p-3">{row.studentName || 'Pending validation'}</td>
                    <td className="p-3">{row.className}</td>
                    <td className="p-3">{row.section}</td>
                    <td className="p-3">{row.attendanceDate}</td>
                    <td className="p-3 font-bold">{row.status}</td>
                    <td className="p-3">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section ref={auditRef} id="audit-trail-section" className="page-card gold-panel scroll-mt-6">
        <p className="eyebrow">Audit Trail</p>
        <h2>Recovery History</h2>

        {status?.auditTrail?.length ? (
          <div className="mt-4 overflow-hidden rounded-3xl border border-white/10">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950/50 text-amber-100">
                <tr>
                  <th className="p-3">Recovery Batch</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Submitted By</th>
                  <th className="p-3">Records</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white/95 text-slate-900">
                {status.auditTrail.slice(0, 8).map((item) => {
                  const audit = auditParts(item);
                  return (
                    <tr key={item} className="border-t border-slate-200" title={audit.detail}>
                      <td className="p-3 font-bold">{audit.batch}</td>
                      <td className="p-3">{audit.date}</td>
                      <td className="p-3">{audit.submittedBy}</td>
                      <td className="p-3">{audit.records}</td>
                      <td className="p-3 font-bold">Recorded</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-amber-200/20 bg-slate-950/25 p-4 text-sm font-bold text-amber-100">
            Recovery history will appear after validation or submission.
          </p>
        )}
      </section>
    </div>
  );
}
