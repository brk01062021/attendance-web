"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  clearInactiveImportHistory,
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
  type WorkbookErrorGroup,
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

function isCommitReadyStatus(status?: string | null) {
  return status === 'READY_TO_IMPORT' || status === 'READY_WITH_WARNINGS';
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
  const [activeIssueCard, setActiveIssueCard] = useState<string | null>(null);

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
      setHistoryError(toSafeImportMessage(error, 'Upload history is unavailable. Please try again.'));
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

  const intelligence = preview?.errorIntelligence;
  const issueGroups = intelligence?.groups || [];
  const activationBlockers = intelligence?.activationBlockers || [];
  const validationCards = useMemo(() => buildValidationCards(preview), [preview]);
  const activeValidationCard = activeIssueCard ? validationCards.find((card) => card.key === activeIssueCard) : null;

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
        setMessage(result.duplicateFile ? 'Workbook validation completed. Duplicate file warning found; review import history before committing.' : 'Workbook uploaded and validated successfully.');
        await loadHistory();
        return;
      }

      const result = await validateImportPreview(day28SampleSheets);
      setPreview(result);
      setUpload(null);
      setActiveReportId(null);
      setMessage('No workbook selected. Workbook structure validation completed against the standard onboarding template.');
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
      setMessage('Validation report loaded from import history.');
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
      setMessage(result.message || 'Workbook commit executed successfully. Staged rows are ready for School Activation.');
      await loadHistory();
      if (activeReportId === uploadId) await openHistoryReport(uploadId);
    } catch (error) {
      setMessage(toSafeImportMessage(error, 'Workbook import could not be committed.'));
    } finally {
      setLoading(false);
    }
  }

  async function recommitUpload(uploadId: number) {
    setLoading(true);
    setMessage(null);
    try {
      const result = await commitImportWorkbook(uploadId);
      setUploadHistory((current) => current.map((item) => item.uploadId === uploadId ? { ...item, status: result.status, committed: result.committed, rolledBack: result.rolledBack, stagedRowCount: result.stagedRowCount ?? item.stagedRowCount, lifecycleMessage: result.lifecycleMessage || item.lifecycleMessage, importBatchId: result.importBatchId || item.importBatchId } : item));
      setMessage(result.message || 'Workbook recommit completed. Existing staged workbook data was reprocessed into operational tables.');
      await loadHistory();
      if (activeReportId === uploadId) await openHistoryReport(uploadId);
    } catch (error) {
      setMessage(toSafeImportMessage(error, 'Workbook recommit could not be completed.'));
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
      setMessage(result.message || 'Workbook rollback completed. Staged rows were removed and audit history is preserved.');
      await loadHistory();
    } catch (error) {
      setMessage(toSafeImportMessage(error, 'Workbook import could not be rolled back.'));
    } finally {
      setLoading(false);
    }
  }

  async function clearOldImports() {
    const committedCount = uploadHistory.filter((item) => item.committed).length;
    const inactiveCount = uploadHistory.filter((item) => !item.committed).length;
    if (inactiveCount === 0) {
      setMessage('No old blocked, rolled back, or uncommitted imports are available to clear.');
      return;
    }
    if (committedCount === 0) {
      setMessage('Commit one clean workbook before clearing old import history.');
      return;
    }
    setHistoryLoading(true);
    setMessage(null);
    try {
      const result = await clearInactiveImportHistory();
      setMessage(result.message || `Cleared ${result.clearedCount} old import record(s).`);
      await loadHistory();
    } catch (error) {
      setMessage(toSafeImportMessage(error, 'Old import history could not be cleared.'));
    } finally {
      setHistoryLoading(false);
    }
  }

  const activeHistoryRow = upload?.uploadId ? uploadHistory.find((item) => item.uploadId === upload.uploadId) : null;
  const activeStatus = activeHistoryRow?.status || upload?.status || preview?.status;
  const canCommitActiveUpload = Boolean(
    upload?.uploadId
    && preview?.valid
    && isCommitReadyStatus(activeStatus)
    && !activeHistoryRow?.committed
    && !activeHistoryRow?.rolledBack
  );

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-amber-100/60 bg-white/80 p-6 shadow-lg shadow-amber-900/5">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Real School Onboarding</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">School Data Import Engine</h2>
        <p className="mt-3 max-w-4xl text-sm font-semibold leading-6 text-slate-700">
          Upload and validate Excel workbooks for students, parents, teachers, class sections, subjects, teacher pools, timetable structure, and tenant-safe school activation.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Badge label={`School ID/Code isolation: ${schoolId}`} />
          <Badge label={`Role access: ${role}`} />
          <Badge label="Workbook Review" />
          <Badge label="Workbook Commit" />
          <Badge label="Import History" />
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


      {uploadHistory.some((item) => item.committed && !item.rolledBack) ? (
        <section className="rounded-[2rem] border border-emerald-100/70 bg-emerald-50/80 p-6 shadow-lg shadow-emerald-900/5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Commit Success Dashboard</p>
          <h3 className="mt-2 text-xl font-black text-slate-950">Workbook Commit Execution Completed</h3>
          <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-700">
            A validated workbook has been committed into tenant-safe staging. Open Workspace Health Center to complete School Activation when all readiness gates are passing.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {uploadHistory.filter((item) => item.committed && !item.rolledBack).slice(0, 3).map((item) => (
              <div key={item.uploadId} className="rounded-2xl border border-emerald-200/70 bg-white/80 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{item.status}</p>
                <h4 className="mt-2 font-black text-slate-950">{item.importBatchId || `Upload #${item.uploadId}`}</h4>
                <p className="mt-1 text-sm font-semibold text-slate-600">{item.stagedRowCount || 0} staged rows • {item.totalSheets} sheets</p>
                <button type="button" onClick={() => recommitUpload(item.uploadId)} disabled={loading} className="mt-3 rounded-full bg-emerald-700 px-3 py-1 text-xs font-black text-white disabled:opacity-60">Recommit</button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

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

          {intelligence ? (
            <section className="rounded-[2rem] border border-red-100/70 bg-white/85 p-6 shadow-lg shadow-red-900/5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-700">Workbook Validation Summary</p>
              <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <h3 className="text-xl font-black text-slate-950">{intelligence.headline}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                    Errors and warnings are grouped by category first. Open a category card to view affected records and correction guidance.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-red-50 px-4 py-2 text-xs font-black text-red-700">{intelligence.totalErrors} errors</span>
                  <span className="rounded-full bg-amber-50 px-4 py-2 text-xs font-black text-amber-700">{intelligence.totalWarnings} warnings</span>
                  <span className={`rounded-full px-4 py-2 text-xs font-black ${intelligence.activationBlocked ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{intelligence.activationBlocked ? 'Activation Blocked' : 'Activation Clear'}</span>
                </div>
              </div>

              {activationBlockers.length ? (
                <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/70 p-4">
                  <p className="text-sm font-black text-red-800">Activation Requirements</p>
                  <ul className="mt-2 space-y-1 text-sm font-semibold text-red-700">
                    {activationBlockers.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}
                  </ul>
                </div>
              ) : null}

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {validationCards.map((card) => (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => setActiveIssueCard((current) => current === card.key ? null : card.key)}
                    className={`rounded-2xl border p-4 text-left shadow-sm transition ${activeIssueCard === card.key ? 'border-amber-400 bg-amber-50/90' : 'border-slate-200/70 bg-white/75 hover:border-amber-300'}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${card.tone === 'error' ? 'bg-red-50 text-red-700' : card.tone === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{card.count}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{card.label}</span>
                    </div>
                    <h4 className="mt-3 font-black text-slate-950">{card.title}</h4>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{card.summary}</p>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-amber-800">{activeIssueCard === card.key ? 'Hide categories' : 'View categories'}</p>
                  </button>
                ))}
              </div>

              {activeValidationCard ? (
                <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-sm font-black text-amber-900">{activeValidationCard.title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{activeValidationCard.action}</p>
                  <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-2">
                    {activeValidationCard.details.length === 0 ? (
                      <p className="rounded-xl bg-white/80 p-3 text-sm font-semibold text-slate-600">No affected records for this category.</p>
                    ) : activeValidationCard.details.map((detail, index) => (
                      <div key={`${activeValidationCard.key}-${index}`} className="rounded-xl bg-white/85 p-3 text-sm font-semibold leading-6 text-slate-700">
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Import Review</p>
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
                <StatusRow title="Validation Summary" body={`${totals.errors} error(s) and ${totals.warnings} warning(s) mapped from workbook inspection.`} />
                <StatusRow title="Parent/student linking" body="Parent rows are checked against student admission numbers before commit." />
                <StatusRow title="Teacher assignment validation" body="Teacher, subject, class, and section mappings are reviewed before save activation." />
              </div>
            </section>
          </div>

          <section className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Detailed Validation Records</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">Open a Summary Card Above</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Row-level workbook records are hidden by default. Select Errors, Warnings, Missing Sheets, School ID Mismatch, Teacher Assignment Issues, Schedule Issues, or Other Workbook Issues to review the related details.</p>
          </section>
        </>
      ) : null}

      <section className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Upload History</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">Workbook Import History</h3>
            <p className="mt-2 text-sm font-semibold text-slate-600">Committed workbook audit records are preserved. Old blocked, rolled back, and uncommitted imports can be cleared after a clean commit.</p>
          </div>
          <button type="button" onClick={clearOldImports} disabled={historyLoading || uploadHistory.filter((item) => item.committed).length === 0 || uploadHistory.filter((item) => !item.committed).length === 0} className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-rose-700 disabled:cursor-not-allowed disabled:opacity-50">
            Clear Old Imports
          </button>
        </div>
        {historyError && uploadHistory.length === 0 ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">{historyError}</p> : null}
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
                      {isCommitReadyStatus(item.status) && !item.committed && !item.rolledBack && item.errorCount === 0 ? <button type="button" onClick={() => commitUpload(item.uploadId)} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Commit</button> : null}
                      {item.committed && !item.rolledBack ? <button type="button" onClick={() => recommitUpload(item.uploadId)} className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-black text-white">Recommit</button> : null}
                      {!item.rolledBack && !item.committed ? <button type="button" onClick={() => rollbackUpload(item.uploadId)} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">Rollback</button> : null}
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

type ValidationCard = {
  key: string;
  label: string;
  title: string;
  summary: string;
  action: string;
  count: number;
  tone: 'error' | 'warning' | 'ok';
  details: string[];
};

function issueLine(issue: { sheetName?: string; rowNumber?: number; fieldName?: string; message?: string; severity?: string }) {
  const location = [issue.sheetName, issue.rowNumber ? `Record ${issue.rowNumber}` : '', issue.fieldName].filter(Boolean).join(' • ');
  return `${location || 'Workbook'}: ${issue.message || 'Review this workbook record.'}`;
}

function groupedIssueLines(issues: Array<{ sheetName?: string; rowNumber?: number; fieldName?: string; message?: string; severity?: string }>) {
  const grouped = issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = issue.sheetName || 'Workbook';
    acc[key] = acc[key] || [];
    acc[key].push(issueLine(issue));
    return acc;
  }, {});

  return Object.entries(grouped).flatMap(([category, rows]) => [
    `${category}: ${rows.length} affected record${rows.length === 1 ? '' : 's'}`,
    ...rows,
  ]);
}

function findGroup(groups: WorkbookErrorGroup[], names: string[]) {
  return groups.find((group) => names.some((name) => group.category.toUpperCase().includes(name)));
}

function buildValidationCards(preview: ImportPreviewResponse | null): ValidationCard[] {
  const issues = preview?.issues || [];
  const intelligence = preview?.errorIntelligence;
  const groups = intelligence?.groups || [];
  const errors = issues.filter((issue) => issue.severity === 'ERROR');
  const warnings = issues.filter((issue) => issue.severity === 'WARNING');
  const missingGroup = findGroup(groups, ['MISSING']);
  const schoolGroup = findGroup(groups, ['SCHOOL_ID']);
  const teacherGroup = findGroup(groups, ['TEACHER_ASSIGNMENT', 'TEACHER']);
  const scheduleGroup = findGroup(groups, ['SCHEDULE']);
  const known = new Set([missingGroup?.category, schoolGroup?.category, teacherGroup?.category, scheduleGroup?.category].filter(Boolean));
  const otherGroups = groups.filter((group) => !known.has(group.category));
  const missingSheets = intelligence?.missingSheets || missingGroup?.issues.map((issue) => issue.sheetName).filter(Boolean) || [];
  const schoolMismatch = intelligence?.schoolIdMismatchExplanations || schoolGroup?.issues.map(issueLine) || [];

  return [
    { key: 'errors', label: 'Errors', title: 'Errors', count: errors.length, tone: errors.length ? 'error' : 'ok', summary: errors.length ? `${errors.length} blocking records need correction before commit.` : 'No blocking workbook errors found.', action: 'Correct these records in the workbook and upload again.', details: groupedIssueLines(errors) },
    { key: 'warnings', label: 'Warnings', title: 'Warnings', count: warnings.length, tone: warnings.length ? 'warning' : 'ok', summary: warnings.length ? `${warnings.length} warning records should be reviewed.` : 'No workbook warnings found.', action: 'Review warnings before commit. Warnings may not always block activation, but they should be confirmed.', details: groupedIssueLines(warnings) },
    { key: 'missingSheets', label: 'Missing Sheets', title: 'Missing Sheets', count: missingSheets.length, tone: missingSheets.length ? 'error' : 'ok', summary: missingSheets.length ? `${missingSheets.length} required workbook sheet(s) are missing.` : 'All required sheets are present.', action: 'Add the missing sheet tabs using the VidyaSetu master workbook template.', details: missingSheets.map((sheet) => `${sheet} sheet is required before workbook commit.`) },
    { key: 'schoolId', label: 'School ID Mismatch', title: 'School ID Mismatch', count: schoolMismatch.length, tone: schoolMismatch.length ? 'error' : 'ok', summary: schoolMismatch.length ? 'Workbook School ID does not match this workspace.' : 'Workbook School ID matches this workspace.', action: 'Use the same 4-character School ID in the SchoolProfile sheet as the logged-in workspace.', details: schoolMismatch },
    { key: 'teacher', label: 'Teacher Assignment Issues', title: 'Teacher Assignment Issues', count: (teacherGroup?.errorCount || 0) + (teacherGroup?.warningCount || 0), tone: (teacherGroup?.errorCount || 0) ? 'error' : (teacherGroup?.warningCount || 0) ? 'warning' : 'ok', summary: teacherGroup ? `${(teacherGroup.errorCount || 0) + (teacherGroup.warningCount || 0)} teacher mapping issue(s) found.` : 'No teacher assignment issues found.', action: 'Verify Teachers, TeacherAssignments, TeacherPools, Subjects, and ClassSections together.', details: teacherGroup?.issues.map(issueLine) || [] },
    { key: 'schedule', label: 'Schedule Issues', title: 'Schedule Issues', count: (scheduleGroup?.errorCount || 0) + (scheduleGroup?.warningCount || 0), tone: (scheduleGroup?.errorCount || 0) ? 'error' : (scheduleGroup?.warningCount || 0) ? 'warning' : 'ok', summary: scheduleGroup ? `${(scheduleGroup.errorCount || 0) + (scheduleGroup.warningCount || 0)} schedule issue(s) found.` : 'No schedule issues found.', action: 'Complete Schedules, AcademicRules, Subjects, TeacherPools, and ClassSections before activation.', details: scheduleGroup?.issues.map(issueLine) || [] },
    { key: 'other', label: 'Other Workbook Issues', title: 'Other Workbook Issues', count: otherGroups.reduce((sum, group) => sum + group.errorCount + group.warningCount, 0), tone: otherGroups.some((group) => group.errorCount > 0) ? 'error' : otherGroups.some((group) => group.warningCount > 0) ? 'warning' : 'ok', summary: otherGroups.length ? `${otherGroups.length} additional workbook category/categories need review.` : 'No other workbook issue categories found.', action: 'Review the listed workbook category details and correct the source workbook.', details: otherGroups.flatMap((group) => group.issues.length ? group.issues.map(issueLine) : [`${group.title}: ${group.explanation}`]) },
  ];
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
