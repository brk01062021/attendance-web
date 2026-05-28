"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  commitImportWorkbook,
  day28SampleSheets,
  getImportHistory,
  getImportPreview,
  rollbackImportWorkbook,
  toSafeImportMessage,
  uploadImportWorkbook,
  uploadToHistoryRow,
  validateImportPreview,
  type ImportPreviewResponse,
  type ImportUploadHistoryRow,
  type ImportUploadResponse,
} from '@/lib/importValidation';
import { getStoredUser } from '@/lib/auth';

type SelectFieldProps = { label: string; value: string; options: string[]; onChange: (value: string) => void };
type DateFieldProps = { label: string; type: 'date' | 'month'; value: string; onChange: (value: string) => void };

const classOptions = ['All Classes', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const sectionOptions = ['All Sections', 'A', 'B'];
const academicYears = ['2026-2027', '2027-2028'];
const importTypes = ['Master School Workbook', 'Students + Parents', 'Teachers + Assignments', 'Timetable Structure'];

function normalizeImportType(value: string) {
  return value.toUpperCase().replaceAll(' ', '_').replaceAll('+', 'AND');
}

export default function ImportValidationDashboard() {
  const storedUser = typeof window !== 'undefined' ? getStoredUser() : null;
  const schoolId = storedUser?.schoolId || 'BRK1';
  const role = storedUser?.role || 'ADMIN';

  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [className, setClassName] = useState('All Classes');
  const [section, setSection] = useState('All Sections');
  const [importType, setImportType] = useState('Master School Workbook');
  const [importMonth, setImportMonth] = useState('2026-05');
  const [effectiveDate, setEffectiveDate] = useState('2026-06-01');
  const [selectedFileName, setSelectedFileName] = useState<string>('No workbook selected');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [upload, setUpload] = useState<ImportUploadResponse | null>(null);
  const [uploadHistory, setUploadHistory] = useState<ImportUploadHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const rows = await getImportHistory();
      setUploadHistory(rows);
      setHistoryError(null);
    } catch (error) {
      setHistoryError(toSafeImportMessage(error, 'Upload history is unavailable. Backend may not be running.'));
    } finally {
      setHistoryLoading(false);
    }
  }

  const totals = useMemo(() => {
    const issues = preview?.issues || [];
    return {
      sheets: Object.keys(preview?.rowCounts || {}).length,
      rows: Object.values(preview?.rowCounts || {}).reduce((sum, value) => sum + value, 0),
      errors: issues.filter((issue) => issue.severity === 'ERROR').length,
      warnings: issues.filter((issue) => issue.severity === 'WARNING').length,
      parentLinks: preview ? Math.max((preview.rowCounts.Parents || 0) - issues.filter((issue) => issue.sheetName === 'Parents' && issue.severity === 'ERROR').length, 0) : 0,
      teachers: preview?.rowCounts.Teachers || 0,
    };
  }, [preview]);

  async function runPreview() {
    setLoading(true);
    setMessage(null);
    try {
      if (selectedFile) {
        const result = await uploadImportWorkbook(selectedFile, academicYear, normalizeImportType(importType));
        setUpload(result);
        setPreview(result.preview);
        setActiveReportId(result.uploadId);
        setUploadHistory((current) => {
          const optimistic = uploadToHistoryRow(result);
          const withoutDuplicate = current.filter((item) => item.uploadId !== optimistic.uploadId);
          return [optimistic, ...withoutDuplicate].slice(0, 20);
        });
        setMessage(result.duplicateFile ? 'Workbook validated by backend. Duplicate file warning found; review history before committing.' : 'Workbook uploaded and validated through backend multipart XLSX parsing.');
        await loadHistory();
        return;
      }

      const result = await validateImportPreview(day28SampleSheets);
      setPreview(result);
      setUpload(null);
      setActiveReportId(null);
      setMessage('No workbook selected. Backend schema validation completed against the standard onboarding workbook structure.');
    } catch (error) {
      setMessage(toSafeImportMessage(error));
      if (selectedFile) return;
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function openHistoryReport(uploadId: number) {
    setLoading(true);
    setMessage(null);
    try {
      const result = await getImportPreview(uploadId);
      setPreview(result);
      setActiveReportId(uploadId);
      setMessage('Validation report loaded from backend upload history.');
    } catch (error) {
      setMessage(toSafeImportMessage(error, 'Validation report could not be loaded from upload history.'));
    } finally {
      setLoading(false);
    }
  }

  async function commitUpload(uploadId = upload?.uploadId) {
    if (!uploadId) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await commitImportWorkbook(uploadId);
      setUploadHistory((current) => current.map((item) => item.uploadId === uploadId ? { ...item, status: result.status, committed: result.committed, rolledBack: result.rolledBack, stagedRowCount: result.stagedRowCount ?? item.stagedRowCount, lifecycleMessage: result.lifecycleMessage || item.lifecycleMessage, importBatchId: result.importBatchId || item.importBatchId } : item));
      setMessage(result.message || 'Workbook import committed for onboarding approval.');
      await loadHistory();
      if (activeReportId === uploadId) await openHistoryReport(uploadId);
    } catch (error) {
      setMessage(toSafeImportMessage(error, 'Workbook import could not be committed.'));
    } finally {
      setLoading(false);
    }
  }

  async function rollbackUpload(uploadId: number) {
    setLoading(true);
    setMessage(null);
    try {
      const result = await rollbackImportWorkbook(uploadId);
      setUploadHistory((current) => current.map((item) => item.uploadId === uploadId ? { ...item, status: result.status, committed: result.committed, rolledBack: result.rolledBack, stagedRowCount: result.stagedRowCount ?? item.stagedRowCount, lifecycleMessage: result.lifecycleMessage || item.lifecycleMessage, importBatchId: result.importBatchId || item.importBatchId } : item));
      setMessage(result.message || 'Workbook import rolled back.');
      await loadHistory();
    } catch (error) {
      setMessage(toSafeImportMessage(error, 'Workbook import could not be rolled back.'));
    } finally {
      setLoading(false);
    }
  }

  const activeHistoryRow = upload?.uploadId ? uploadHistory.find((item) => item.uploadId === upload.uploadId) : null;
  const canCommitActiveUpload = Boolean(upload?.uploadId && preview?.valid && !activeHistoryRow?.committed && !activeHistoryRow?.rolledBack);

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-amber-100/60 bg-white/80 p-6 shadow-lg shadow-amber-900/5">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Real School Onboarding</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">School Data Import Engine</h2>
        <p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-slate-700">
          Upload and validate Excel workbooks for students, parents, teachers, class sections, subjects, teacher pools, timetable structure, and tenant-safe school activation.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge label={`school_id isolation: ${schoolId}`} />
          <Badge label={`Role access: ${role}`} />
          <Badge label="Backend XLSX preview" />
          <Badge label="Real commit staging" />
          <Badge label="Rollback-safe lifecycle" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField label="Academic Year" value={academicYear} options={academicYears} onChange={setAcademicYear} />
          <SelectField label="Import Type" value={importType} options={importTypes} onChange={setImportType} />
          <SelectField label="Class" value={className} options={classOptions} onChange={setClassName} />
          <SelectField label="Section" value={section} options={sectionOptions} onChange={setSection} />
          <DateField label="Import Month" type="month" value={importMonth} onChange={setImportMonth} />
          <DateField label="Effective From" type="date" value={effectiveDate} onChange={setEffectiveDate} />

          <div className="md:col-span-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Excel Workbook</label>
            <div className="mt-2 rounded-2xl border border-dashed border-amber-300/80 bg-amber-50/60 p-4">
              <input
                type="file"
                accept=".xlsx"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedFile(file);
                  setSelectedFileName(file?.name || 'No workbook selected');
                  setUpload(null);
                  setActiveReportId(null);
                }}
                className="w-full text-sm font-bold text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
              />
              <p className="mt-3 text-xs font-bold text-slate-600">{selectedFileName}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={runPreview} disabled={loading} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 disabled:opacity-60">
            {loading ? 'Checking Workbook...' : selectedFile ? 'Upload & Validate Workbook' : 'Validate Workbook Schema'}
          </button>

          {upload?.uploadId ? (
            <button type="button" onClick={() => commitUpload()} disabled={loading || !canCommitActiveUpload} className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/10 disabled:opacity-50">
              Commit Import
            </button>
          ) : null}

          <button type="button" onClick={loadHistory} disabled={historyLoading} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 disabled:opacity-60">
            Refresh History
          </button>
        </div>

        {upload?.uploadId && !canCommitActiveUpload ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">Commit is gated until the workbook is valid, not rolled back, and not already committed.</p> : null}
        {message ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{message}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Sheets" value={totals.sheets || day28SampleSheets.length} />
        <Metric label="Rows" value={totals.rows || 0} />
        <Metric label="Students" value={preview?.rowCounts.Students || 0} />
        <Metric label="Parents Linked" value={totals.parentLinks || 0} />
        <Metric label="Teachers" value={totals.teachers || 0} />
        <Metric label="Issues" value={totals.errors + totals.warnings} />
      </div>

      {preview ? (
        <>
          <div className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">{preview.status}</p>
                <h3 className="mt-2 text-xl font-black text-slate-950">{preview.schoolId} · {preview.fileName}</h3>
                <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-700">{preview.summary}</p>
                {upload?.importBatchId ? <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-amber-700">Batch: {upload.importBatchId}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-4 py-2 text-xs font-black ${preview.valid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{preview.valid ? 'Ready to Import' : 'Needs Attention'}</span>
                <span className={`rounded-full px-4 py-2 text-xs font-black ${preview.tenantSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{preview.tenantSafe ? 'Tenant Safe' : 'Tenant Blocked'}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Import Preview</p>
              <h3 className="mt-2 text-xl font-black text-slate-950">Workbook Sheets</h3>
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/70">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-xs uppercase tracking-[0.16em] text-amber-100"><tr><th className="px-4 py-3">Sheet</th><th className="px-4 py-3">Rows</th><th className="px-4 py-3">Headers</th></tr></thead>
                  <tbody className="divide-y divide-slate-200/70 bg-white/70">
                    {preview.previewSheets.map((sheet) => <tr key={sheet.sheetName}><td className="px-4 py-3 font-black text-slate-950">{sheet.sheetName}</td><td className="px-4 py-3 font-bold text-slate-700">{sheet.totalRows}</td><td className="px-4 py-3 font-semibold text-slate-600">{sheet.headers.join(', ')}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Tenant Validation</p>
              <h3 className="mt-2 text-xl font-black text-slate-950">Onboarding Checks</h3>
              <div className="mt-5 space-y-3">
                <StatusRow title="school_id isolation" body={`${preview.schoolId} validation applied before import activation.`} />
                <StatusRow title="Validation hydration" body={`${totals.errors} error(s) and ${totals.warnings} warning(s) mapped from backend workbook inspection.`} />
                <StatusRow title="Parent/student linking" body="Parent rows are checked against student admission numbers before commit." />
                <StatusRow title="Teacher assignment validation" body="Teacher, subject, class, and section mappings are reviewed before save activation." />
              </div>
            </section>
          </div>

          <section className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Validation Report</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">Workbook Issues</h3>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/70">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs uppercase tracking-[0.16em] text-amber-100"><tr><th className="px-4 py-3">Sheet</th><th className="px-4 py-3">Row</th><th className="px-4 py-3">Field</th><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Message</th></tr></thead>
                <tbody className="divide-y divide-slate-200/70 bg-white/70">
                  {preview.issues.length === 0 ? <tr><td className="px-4 py-5 font-semibold text-slate-600" colSpan={5}>No validation issues returned by backend.</td></tr> : preview.issues.map((issue, index) => (
                    <tr key={`${issue.sheetName}-${issue.rowNumber}-${issue.fieldName}-${index}`}><td className="px-4 py-3 font-black text-slate-950">{issue.sheetName}</td><td className="px-4 py-3 font-bold text-slate-700">{issue.rowNumber}</td><td className="px-4 py-3 font-bold text-slate-700">{issue.fieldName}</td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-black ${issue.severity === 'ERROR' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{issue.severity}</span></td><td className="px-4 py-3 font-semibold text-slate-600">{issue.message}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <section className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Upload History</p>
        <h3 className="mt-2 text-xl font-black text-slate-950">Pilot School Workbook Activity</h3>
        {historyError ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{historyError}</p> : null}
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-[0.16em] text-amber-100"><tr><th className="px-4 py-3">Workbook</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Rows</th><th className="px-4 py-3">Issues</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Staged</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-200/70 bg-white/70">
              {uploadHistory.length === 0 ? <tr><td className="px-4 py-5 font-semibold text-slate-600" colSpan={7}>{historyLoading ? 'Loading workbook history...' : 'No real workbook uploads yet. Upload an Excel workbook to start onboarding history.'}</td></tr> : uploadHistory.map((item) => (
                <tr key={item.uploadId}>
                  <td className="px-4 py-3"><p className="font-black text-slate-950">{item.fileName}</p>{item.importBatchId ? <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-amber-700">{item.importBatchId}</p> : null}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{new Date(item.uploadedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{item.totalRows}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{item.errorCount} error · {item.warningCount} warning</td>
                  <td className="px-4 py-3"><p className="font-semibold text-slate-600">{item.status}</p>{item.lifecycleMessage ? <p className="mt-1 max-w-xs text-xs font-semibold leading-5 text-slate-500">{item.lifecycleMessage}</p> : null}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{item.stagedRowCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => openHistoryReport(item.uploadId)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">View Report</button>
                      {!item.committed && !item.rolledBack && item.errorCount === 0 ? <button type="button" onClick={() => commitUpload(item.uploadId)} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Commit</button> : null}
                      {!item.rolledBack ? <button type="button" onClick={() => rollbackUpload(item.uploadId)} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">Rollback</button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return <div><label className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">{label}</label><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-amber-200/80 bg-white/85 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-amber-500">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
}

function DateField({ label, type, value, onChange }: DateFieldProps) {
  return <div><label className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-2xl border border-amber-200/80 bg-white/85 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-amber-500" /></div>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-amber-100/70 bg-white/82 p-4 shadow-lg shadow-amber-900/5"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p><h4 className="mt-2 text-2xl font-black text-slate-950">{value}</h4></div>;
}

function StatusRow({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4"><p className="text-sm font-black text-slate-950">{title}</p><p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{body}</p></div>;
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-amber-800">{label}</span>;
}
