'use client';

import { useEffect, useMemo, useState } from 'react';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';

type ImportIssue = { rowNumber: number; severity: 'ERROR' | 'WARNING'; fieldName: string; category?: string; message: string };
type ValidationCard = { label: string; count: number; severity: 'ERROR' | 'WARNING'; guidance: string };
type TimetableEntry = { id: string; className: string; section: string; dayOfWeek: string; periodNumber: number; subjectName: string; teacherName: string; startTime: string; endTime: string };
type ImportStatus = { status: string; label: string; message: string; importBatchId?: string; publishedBatchId?: string; totalClasses: number; totalSections: number; totalTeachers: number; totalPeriodAllocations: number };
type ImportResponse = {
  importBatchId?: string;
  publishedBatchId?: string;
  schoolId?: string;
  status: string;
  valid: boolean;
  canPublish: boolean;
  totalRows: number;
  acceptedRows: number;
  totalClasses: number;
  totalSections: number;
  totalTeachers: number;
  totalPeriodAllocations: number;
  errorCount: number;
  warningCount: number;
  conflictsDetected: number;
  message: string;
  fileStorageKey?: string;
  originalFilename?: string;
  contentType?: string;
  fileSizeBytes?: number;
  issues: ImportIssue[];
  validationCards: ValidationCard[];
  previewEntries: TimetableEntry[];
};

const sampleRows = [
  ['Class', 'Section', 'Day', 'Period', 'Subject', 'Teacher'],
  ['10', 'A', 'Monday', '1', 'Mathematics', 'Ravi Kumar'],
  ['10', 'A', 'Monday', '2', 'English', 'Anitha Reddy'],
  ['9', 'B', 'Tuesday', '1', 'Science', 'John Paul'],
];

function issueSummary(issues: ImportIssue[]) {
  return issues.reduce<Record<string, { label: string; count: number; rows: number[]; severity: string }>>((acc, issue) => {
    const label = issue.category || issue.fieldName || issue.severity || 'Timetable';
    const current = acc[label] || { label, count: 0, rows: [], severity: issue.severity };
    current.count += 1;
    if (issue.rowNumber && !current.rows.includes(issue.rowNumber)) current.rows.push(issue.rowNumber);
    if (issue.severity === 'ERROR') current.severity = 'ERROR';
    acc[label] = current;
    return acc;
  }, {});
}

function rowRange(rows: number[]) {
  const visibleRows = rows.slice(0, 6).join(', ');
  return rows.length > 6 ? `${visibleRows} +${rows.length - 6} more` : visibleRows || 'Review workbook';
}

function csvTemplate() {
  const csv = sampleRows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vidyasetu-existing-timetable-template.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function friendlyStatus(status?: string) {
  return String(status || 'Validation Pending').replaceAll('_', ' ');
}

function friendlyImportOutcome(response?: ImportResponse | null) {
  if (!response) return 'Validation Pending';
  if (response.publishedBatchId || String(response.status || '').toUpperCase() === 'PUBLISHED') return 'Published';
  if (response.canPublish) return 'Ready to Publish';
  const raw = String(response.status || '').toUpperCase();
  if (raw.includes('VALIDATION_FAILED') || response.errorCount > 0 || response.conflictsDetected > 0) return 'Needs Correction';
  if (raw.includes('FAILED')) return 'Needs Correction';
  return friendlyStatus(response.status);
}


function compactFilename(filename?: string | null) {
  if (!filename) return 'Not Available';
  if (filename.length <= 24) return filename;

  const lastDot = filename.lastIndexOf('.');
  const extension = lastDot > 0 ? filename.slice(lastDot) : '';
  const baseName = lastDot > 0 ? filename.slice(0, lastDot) : filename;

  return `${baseName.slice(0, 18)}...${extension}`;
}

function displayImportStatus(status?: ImportStatus | null) {
  const raw = String(status?.label || status?.status || 'No Timetable Imported').trim().toUpperCase();
  if (!raw || raw === 'NO TIMETABLE IMPORTED' || raw === 'NOT_IMPORTED') return 'No Timetable Imported';
  if (raw === 'VALIDATION_PENDING' || raw === 'IMPORTED – VALIDATION PENDING' || raw === 'IMPORTED - VALIDATION PENDING') return 'Validation Pending';
  if (raw === 'VALIDATION_FAILED' || raw === 'IMPORTED – VALIDATION FAILED' || raw === 'IMPORTED - VALIDATION FAILED') return 'Needs Correction';
  if (raw === 'READY_TO_PUBLISH' || raw === 'IMPORTED – READY TO PUBLISH' || raw === 'IMPORTED - READY TO PUBLISH') return 'Ready to Publish';
  if (raw === 'PUBLISHED') return 'Published';
  return friendlyStatus(status?.label || status?.status);
}

export default function ExistingTimetableImportPanel() {
  const user = getStoredUser();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [response, setResponse] = useState<ImportResponse | null>(null);
  const [error, setError] = useState('');

  const groupedPreview = useMemo(() => {
    const entries = response?.previewEntries || [];
    return entries.slice(0, 90).reduce<Record<string, TimetableEntry[]>>((acc, entry) => {
      const key = `${entry.className}-${entry.section} • ${entry.dayOfWeek}`;
      acc[key] = [...(acc[key] || []), entry];
      return acc;
    }, {});
  }, [response]);

  async function loadImportStatus() {
    try {
      const result = await webApi.existingTimetableImportStatus<ImportStatus>(user?.token, user?.schoolId);
      setStatus(result);
    } catch {
      setStatus(null);
    }
  }

  useEffect(() => {
    loadImportStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadAndValidate() {
    if (!file) {
      setError('Please choose an Excel .xlsx timetable file first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const result = await webApi.importExistingTimetable<ImportResponse>(form, user?.token, user?.schoolId, user?.displayName || user?.username || 'Admin');
      setResponse(result);
      await loadImportStatus();
    } catch {
      setError('Existing timetable could not be validated. Please confirm the file format and required columns, then try again.');
    } finally {
      setLoading(false);
    }
  }

  const hasBlockingErrors = Boolean(response && ((response.errorCount || 0) > 0 || (response.conflictsDetected || 0) > 0 || !response.canPublish));

  async function publishImported() {
    if (!response?.importBatchId || hasBlockingErrors || response.publishedBatchId) return;
    setPublishing(true);
    setError('');
    try {
      const result = await webApi.publishImportedTimetable<ImportResponse>(response.importBatchId, user?.role || 'ADMIN', user?.displayName || user?.username || 'Admin', user?.token, user?.schoolId);
      setResponse(result);
      await loadImportStatus();
    } catch {
      setError('Imported timetable could not be published. Resolve validation issues and try again.');
    } finally {
      setPublishing(false);
    }
  }

  const validationCards = response?.validationCards?.length ? response.validationCards : Object.values(issueSummary(response?.issues || [])).map((group) => ({ label: group.label, count: group.count, severity: group.severity as 'ERROR' | 'WARNING', guidance: `Rows: ${rowRange(group.rows)}` }));

  return (
    <div className="space-y-5">
      <section className="page-card gold-panel">
        <div className="section-heading-row items-start">
          <div className="max-w-3xl">
            <p className="eyebrow">Existing timetable</p>
            <h2>Import Existing Timetable</h2>
            <p className="page-subtitle mt-2">Upload the school’s active academic-year timetable, validate teacher and class conflicts, review the preview, and publish without regenerating timetable.</p>
            <p className="mt-4 text-sm font-black text-amber-100">Required Excel columns: Class, Section, Day, Period, Subject, Teacher</p>
          </div>
          <span className="status-pill status-pill--pending">Pilot school ready</span>
        </div>

        {status ? (
          <div className="mt-5 grid gap-3 md:grid-cols-[1.1fr_repeat(4,minmax(0,1fr))]">
            <div className="metric-card import-kpi-card"><p className="metric-label">Timetable Import Status</p><p className="metric-value import-kpi-value import-kpi-status">{displayImportStatus(status)}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Classes</p><p className="metric-value import-kpi-value">{status.totalClasses || 0}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Sections</p><p className="metric-value import-kpi-value">{status.totalSections || 0}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Teachers</p><p className="metric-value import-kpi-value">{status.totalTeachers || 0}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Periods</p><p className="metric-value import-kpi-value">{status.totalPeriodAllocations || 0}</p></div>
          </div>
        ) : null}

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/25 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input className="min-h-[46px] w-full rounded-2xl border border-amber-200/40 bg-white/95 px-4 py-3 text-sm font-bold text-slate-900 shadow-sm lg:w-auto" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <button className="primary-button min-h-[46px] px-6" type="button" onClick={uploadAndValidate} disabled={loading}>{loading ? 'Validating…' : 'Validate Timetable'}</button>
            <button className="secondary-button min-h-[46px] px-5" type="button" onClick={csvTemplate}>Download Template</button>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-200/80">Publish is available only after validation passes with no blocking errors. If errors are found, correct the workbook and upload again.</p>
          {file ? <p className="mt-3 text-sm font-bold text-amber-100">Selected: {file.name}</p> : null}
          {error ? <p className="mt-3 rounded-2xl border border-red-300/40 bg-red-950/40 p-3 text-sm font-bold text-red-100">{error}</p> : null}
        </div>
      </section>

      {response ? (
        <section className="page-card gold-panel">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Preview before publish</p>
              <h2>{friendlyImportOutcome(response)}</h2>
              <p className="page-subtitle mt-2">{response.message}</p>
              {response.publishedBatchId ? <p className="mt-2 text-sm font-black text-emerald-200">Published Batch: {response.publishedBatchId}</p> : null}
            </div>
            <button className="primary-button min-h-[46px] px-5" type="button" onClick={publishImported} disabled={hasBlockingErrors || publishing || Boolean(response.publishedBatchId)}>{publishing ? 'Publishing…' : response.publishedBatchId ? 'Published' : hasBlockingErrors ? 'Publish Disabled' : 'Publish Timetable'}</button>
          </div>

          {hasBlockingErrors ? (
            <div className="mb-4 rounded-3xl border border-red-300/40 bg-red-950/30 p-4">
              <p className="eyebrow">Publish unavailable</p>
              <h3 className="text-lg font-black text-red-100">Correct and Re-upload Timetable</h3>
              <p className="mt-2 text-sm font-semibold text-red-50/90">This timetable has blocking errors, so it cannot become the active timetable. Correct the Excel workbook and upload the corrected file again.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="status-list"><div className="status-row"><strong>Errors</strong><span>{response.errorCount || 0}</span></div></div>
                <div className="status-list"><div className="status-row"><strong>Conflicts</strong><span>{response.conflictsDetected || 0}</span></div></div>
                <div className="status-list"><div className="status-row"><strong>Next Step</strong><span>Re-upload corrected sheet</span></div></div>
              </div>
            </div>
          ) : null}
          <div className="mb-4 rounded-3xl border border-amber-200/30 bg-slate-950/25 p-4">
            <div className="mb-3">
              <p className="eyebrow">Imported Timetable</p>
              <h3 className="text-lg font-black text-amber-100">Uploaded file details</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="status-list">
                <div className="status-row">
                  <strong>Filename</strong>
                  <span
                    title={response.originalFilename || file?.name || 'Not Available'}
                    style={{
                      display: 'inline-block',
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textAlign: 'right',
                    }}
                  >
                    {compactFilename(response.originalFilename || file?.name)}
                  </span>
                </div>
              </div>
              <div className="status-list">
                <div className="status-row"><strong>Status</strong><span>{friendlyImportOutcome(response)}</span></div>
              </div>
              <div className="status-list">
                <div className="status-row"><strong>File Size</strong><span>{response.fileSizeBytes ? `${Math.round(response.fileSizeBytes / 1024)} KB` : 'Not Available'}</span></div>
              </div>
              <div className="status-list">
                <div className="status-row"><strong>Upload</strong><span>{response.fileStorageKey ? 'Stored' : 'Pending'}</span></div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-6 mb-4">
            <div className="metric-card import-kpi-card"><p className="metric-label">Total Classes</p><p className="metric-value import-kpi-value">{response.totalClasses || 0}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Total Sections</p><p className="metric-value import-kpi-value">{response.totalSections || 0}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Total Teachers</p><p className="metric-value import-kpi-value">{response.totalTeachers || 0}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Period Allocations</p><p className="metric-value import-kpi-value">{response.totalPeriodAllocations || response.acceptedRows || 0}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Warnings</p><p className="metric-value import-kpi-value">{response.warningCount || 0}</p></div>
            <div className="metric-card import-kpi-card"><p className="metric-label">Errors</p><p className="metric-value import-kpi-value">{response.errorCount || 0}</p></div>
          </div>
          {validationCards.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {validationCards.map((card) => (
                <div className="status-list" key={card.label}>
                  <div className="status-row"><strong>{card.label}</strong><span>{card.count} {card.severity === 'ERROR' ? 'error' : 'warning'}{card.count === 1 ? '' : 's'}</span></div>
                  <div className="status-row"><strong>Action</strong><span>{card.guidance}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-emerald-200/40 bg-emerald-950/20 p-3">
              <div className="text-sm font-bold text-emerald-200">Validation Complete</div>
              <div className="mt-1 text-xs font-medium text-emerald-100">Ready to Publish</div>
            </div>
          )}
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {Object.entries(groupedPreview).map(([key, entries]) => (
              <div className="status-list" key={key}>
                <div className="status-row"><strong>{key}</strong><span>{entries.length} periods</span></div>
                {entries.map((entry) => (
                  <div className="status-row" key={entry.id}><strong>P{entry.periodNumber} • {entry.subjectName}</strong><span>{entry.teacherName} • {entry.startTime}-{entry.endTime}</span></div>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
