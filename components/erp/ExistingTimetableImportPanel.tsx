'use client';

import { useMemo, useState } from 'react';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';

type ImportIssue = { rowNumber: number; severity: 'ERROR' | 'WARNING'; fieldName: string; message: string };
type TimetableEntry = { id: string; className: string; section: string; dayOfWeek: string; periodNumber: number; subjectName: string; teacherName: string; startTime: string; endTime: string };
type ImportResponse = {
  importBatchId?: string;
  publishedBatchId?: string;
  schoolId?: string;
  status: string;
  valid: boolean;
  canPublish: boolean;
  totalRows: number;
  acceptedRows: number;
  errorCount: number;
  warningCount: number;
  conflictsDetected: number;
  message: string;
  issues: ImportIssue[];
  previewEntries: TimetableEntry[];
};

const sampleRows = [
  ['Class', 'Section', 'Day', 'Period', 'Subject', 'Teacher'],
  ['10', 'A', 'Monday', '1', 'Mathematics', 'Ravi Kumar'],
  ['10', 'A', 'Monday', '2', 'English', 'Anitha Reddy'],
  ['10', 'A', 'Tuesday', '1', 'Science', 'John Paul'],
];


function issueSummary(issues: ImportIssue[]) {
  return issues.reduce<Record<string, { label: string; count: number; rows: number[] }>>((acc, issue) => {
    const label = issue.fieldName || issue.severity || 'Timetable';
    const current = acc[label] || { label, count: 0, rows: [] };
    current.count += 1;
    if (issue.rowNumber && !current.rows.includes(issue.rowNumber)) current.rows.push(issue.rowNumber);
    acc[label] = current;
    return acc;
  }, {});
}

function rowRange(rows: number[]) {
  const visibleRows = rows.slice(0, 6).join(', ');
  return rows.length > 6 ? `${visibleRows} +${rows.length - 6} more` : visibleRows || 'See workbook';
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

export default function ExistingTimetableImportPanel() {
  const user = getStoredUser();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [response, setResponse] = useState<ImportResponse | null>(null);
  const [error, setError] = useState('');

  const groupedPreview = useMemo(() => {
    const entries = response?.previewEntries || [];
    return entries.slice(0, 60).reduce<Record<string, TimetableEntry[]>>((acc, entry) => {
      const key = `${entry.className}-${entry.section} • ${entry.dayOfWeek}`;
      acc[key] = [...(acc[key] || []), entry];
      return acc;
    }, {});
  }, [response]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to validate existing timetable.');
    } finally {
      setLoading(false);
    }
  }

  async function publishImported() {
    if (!response?.importBatchId) return;
    setPublishing(true);
    setError('');
    try {
      const result = await webApi.publishImportedTimetable<ImportResponse>(response.importBatchId, user?.role || 'ADMIN', user?.displayName || user?.username || 'Admin', user?.token, user?.schoolId);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish imported timetable.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="page-card gold-panel">
        <div className="section-heading-row items-start">
          <div className="max-w-3xl">
            <p className="eyebrow">Existing timetable</p>
            <h2>Import Existing Timetable</h2>
            <p className="page-subtitle mt-2">Upload the school’s active academic-year timetable, review issues in one place, and publish only when it is ready.</p>
            <p className="mt-4 text-sm font-black text-amber-100">Excel columns: Class, Section, Day, Period, Subject, Teacher</p>
          </div>
          <span className="status-pill status-pill--pending">Published timetable only</span>
        </div>

        <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/25 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="min-h-[46px] w-full rounded-2xl border border-amber-200/40 bg-white/95 px-4 py-3 text-sm font-bold text-slate-900 shadow-sm lg:w-auto"
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <button className="primary-button min-h-[46px] px-6" type="button" onClick={uploadAndValidate} disabled={loading}>{loading ? 'Validating…' : 'Validate Excel'}</button>
            <button className="secondary-button min-h-[46px] px-5" type="button" onClick={csvTemplate}>Download Excel Template</button>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-200/80">Upload one row per period. Resolve errors and teacher conflicts before publishing.</p>
          {file ? <p className="mt-3 text-sm font-bold text-amber-100">Selected: {file.name}</p> : null}
          {error ? <p className="mt-3 rounded-2xl border border-red-300/40 bg-red-950/40 p-3 text-sm font-bold text-red-100">{error}</p> : null}
        </div>
      </section>

      {response ? (
        <section className="page-card gold-panel">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Import result</p>
              <h2>{response.status}</h2>
              <p className="page-subtitle mt-2">{response.message}</p>
              {response.publishedBatchId ? <p className="mt-2 text-sm font-black text-emerald-200">Published Batch: {response.publishedBatchId}</p> : null}
            </div>
            <button className="primary-button min-h-[46px] px-5" type="button" onClick={publishImported} disabled={!response.canPublish || publishing}>{publishing ? 'Publishing…' : response.publishedBatchId ? 'Published' : 'Publish Timetable'}</button>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="metric-card"><p className="metric-label">Rows</p><p className="metric-value">{response.totalRows || 0}</p></div>
            <div className="metric-card"><p className="metric-label">Accepted</p><p className="metric-value">{response.acceptedRows || 0}</p></div>
            <div className="metric-card"><p className="metric-label">Errors</p><p className="metric-value">{response.errorCount || 0}</p></div>
            <div className="metric-card"><p className="metric-label">Conflicts</p><p className="metric-value">{response.conflictsDetected || 0}</p></div>
            <div className="metric-card"><p className="metric-label">Publish Status</p><p className="metric-value">{response.canPublish ? 'Ready' : 'Blocked'}</p></div>
          </div>
          {response.issues?.length ? (
            <div className="mt-5 status-list">
              <div className="status-row"><strong>Issues to fix</strong><span>Grouped by field so the school can correct the Excel file faster.</span></div>
              {Object.values(issueSummary(response.issues)).slice(0, 8).map((group) => (
                <div className="status-row" key={group.label}>
                  <strong>{group.label} • {group.count} issue{group.count === 1 ? '' : 's'}</strong>
                  <span>Rows: {rowRange(group.rows)}</span>
                </div>
              ))}
            </div>
          ) : null}
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
