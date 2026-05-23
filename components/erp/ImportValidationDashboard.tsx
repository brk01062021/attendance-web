"use client";

import { useMemo, useState } from 'react';
import { day28SampleSheets, validateImportPreview, type ImportPreviewResponse } from '@/lib/importValidation';

export default function ImportValidationDashboard() {
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const issues = preview?.issues || [];
    return {
      sheets: Object.keys(preview?.rowCounts || {}).length,
      rows: Object.values(preview?.rowCounts || {}).reduce((sum, value) => sum + value, 0),
      errors: issues.filter((issue) => issue.severity === 'ERROR').length,
      warnings: issues.filter((issue) => issue.severity === 'WARNING').length,
    };
  }, [preview]);

  async function runPreview() {
    setLoading(true);
    setError(null);
    try {
      const result = await validateImportPreview(day28SampleSheets);
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to validate import preview');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-amber-200/80 bg-white/85 p-6 shadow-xl shadow-amber-900/10">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Day 28 Import Engine</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Excel Preview + Error Reporting</h2>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-700">
          This validates the pilot school workbook structure before final processing: required tabs, role permission, school_id tenant isolation, row counts, and import readiness.
        </p>
        <button
          type="button"
          onClick={runPreview}
          disabled={loading}
          className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/20 disabled:opacity-60"
        >
          {loading ? 'Validating...' : 'Run Preview Validation'}
        </button>
        {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
      </div>

      {preview ? (
        <div className="rounded-[2rem] border border-amber-200/80 bg-white/90 p-6 shadow-xl shadow-amber-900/10">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">{preview.status}</p>
              <h3 className="mt-2 text-xl font-black text-slate-950">{preview.schoolId} · {preview.fileName}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-700">{preview.summary}</p>
            </div>
            <span className={`rounded-full px-4 py-2 text-xs font-black ${preview.valid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {preview.valid ? 'READY' : 'BLOCKED'}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Sheets" value={totals.sheets} />
            <Metric label="Rows" value={totals.rows} />
            <Metric label="Errors" value={totals.errors} />
            <Metric label="Warnings" value={totals.warnings} />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-800">Sheet Preview</h4>
              <div className="mt-3 space-y-2">
                {preview.previewSheets?.map((sheet) => (
                  <div key={sheet.sheetName} className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                    <p className="font-black text-slate-950">{sheet.sheetName}</p>
                    <p className="mt-1 text-xs font-bold text-slate-600">{sheet.totalRows} rows · {(sheet.headers || []).join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-800">Import Issues</h4>
              <div className="mt-3 space-y-2">
                {preview.issues?.length ? preview.issues.map((issue, index) => (
                  <div key={`${issue.sheetName}-${index}`} className="rounded-2xl border border-amber-100 bg-white p-4">
                    <p className={`text-xs font-black ${issue.severity === 'ERROR' ? 'text-red-700' : 'text-amber-700'}`}>{issue.severity}</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">{issue.sheetName}: {issue.message}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
                    No blocking errors found. Ready for final import confirmation flow.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
    </div>
  );
}
