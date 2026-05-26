
"use client";

import { useMemo, useState } from 'react';
import { day28SampleSheets, validateImportPreview, type ImportPreviewResponse } from '@/lib/importValidation';

export default function ImportValidationDashboard() {
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
    setMessage(null);

    try {
      const result = await validateImportPreview(day28SampleSheets);
      setPreview(result);
    } catch {
      setMessage('Import validation service is temporarily unavailable. Please retry after backend synchronization.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-amber-100/60 bg-white/80 p-6 shadow-lg shadow-amber-900/5">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-700">Import Operations</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">School Data Validation Center</h2>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-700">
          Review workbook structure, student/parent linking integrity, tenant alignment, and onboarding readiness before activating school operations.
        </p>

        <button
          type="button"
          onClick={runPreview}
          disabled={loading}
          className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10 disabled:opacity-60"
        >
          {loading ? 'Checking Workbook...' : 'Validate Workbook'}
        </button>

        {message ? (
          <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
            {message}
          </p>
        ) : null}
      </div>

      {preview ? (
        <div className="rounded-[2rem] border border-amber-100/60 bg-white/82 p-6 shadow-lg shadow-amber-900/5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">{preview.status}</p>
              <h3 className="mt-2 text-xl font-black text-slate-950">{preview.schoolId} · {preview.fileName}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-700">{preview.summary}</p>
            </div>

            <span className={`rounded-full px-4 py-2 text-xs font-black ${preview.valid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {preview.valid ? 'Connected' : 'Needs Attention'}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Sheets" value={totals.sheets} />
            <Metric label="Rows" value={totals.rows} />
            <Metric label="Errors" value={totals.errors} />
            <Metric label="Warnings" value={totals.warnings} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <h4 className="mt-2 text-2xl font-black text-slate-950">{value}</h4>
    </div>
  );
}
