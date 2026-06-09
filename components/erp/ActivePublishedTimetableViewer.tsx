'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';
import type { TimetableBinaryExportResponse } from '@/types/timetable';

type LiveEntry = {
  id?: string;
  className?: string;
  section?: string;
  subjectName?: string;
  teacherName?: string;
  dayOfWeek?: string;
  periodNumber?: number;
  roomNumber?: string;
  startTime?: string;
  endTime?: string;
};

type ActiveLiveTimetable = {
  batchId?: string;
  role?: string;
  visibilityScope?: string;
  published?: boolean;
  locked?: boolean;
  message?: string;
  entries?: LiveEntry[];
};

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function normalize(value?: string) {
  return String(value || '').trim();
}

function safeRole(role?: string) {
  return role === 'PRINCIPAL' ? 'PRINCIPAL' : 'ADMIN';
}


function downloadBase64File(file: TimetableBinaryExportResponse) {
  const byteCharacters = atob(file.base64Content);
  const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: file.contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ActivePublishedTimetableViewer() {
  const user = getStoredUser();
  const role = safeRole(user?.role);
  const schoolId = user?.schoolId || '';
  const token = user?.token;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading latest active published timetable...');
  const [data, setData] = useState<ActiveLiveTimetable | null>(null);
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [dayFilter, setDayFilter] = useState('ALL');
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  async function loadActive() {
    setLoading(true);
    try {
      const response = await apiClient<ActiveLiveTimetable>('/timetable/operations/live', {
        token,
        schoolId,
        query: { role },
      });
      setData(response);
      setMessage(response.message || 'Latest active published timetable loaded.');
    } catch (error) {
      setData(null);
      setMessage(error instanceof Error ? error.message : 'Unable to load active published timetable.');
    } finally {
      setLoading(false);
    }
  }


  async function downloadActive(format: 'PDF' | 'EXCEL') {
    const activeBatchId = data?.batchId;
    setDownloadOpen(false);
    if (!activeBatchId) {
      setMessage('No active batch ID is available for download. Publish a timetable first.');
      return;
    }
    setDownloadLoading(true);
    try {
      const file = await apiClient<TimetableBinaryExportResponse>(`/timetable/operations/export/${activeBatchId}`, {
        token,
        schoolId,
        query: { format },
      });
      downloadBase64File(file);
      setMessage(`${file.fileName} downloaded successfully.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${format} download failed.`);
    } finally {
      setDownloadLoading(false);
    }
  }

  useEffect(() => {
    loadActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entries = data?.entries || [];

  const classes = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => normalize(entry.className)).filter(Boolean))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [entries]);

  const sections = useMemo(() => {
    return Array.from(new Set(entries.filter((entry) => classFilter === 'ALL' || normalize(entry.className) === classFilter).map((entry) => normalize(entry.section)).filter(Boolean))).sort();
  }, [entries, classFilter]);

  const days = useMemo(() => {
    const present = new Set(entries.map((entry) => normalize(entry.dayOfWeek).toUpperCase()).filter(Boolean));
    return DAY_ORDER.filter((day) => present.has(day));
  }, [entries]);

  const visibleEntries = useMemo(() => {
    return entries
      .filter((entry) => classFilter === 'ALL' || normalize(entry.className) === classFilter)
      .filter((entry) => sectionFilter === 'ALL' || normalize(entry.section) === sectionFilter)
      .filter((entry) => dayFilter === 'ALL' || normalize(entry.dayOfWeek).toUpperCase() === dayFilter)
      .sort((a, b) => {
        const dayA = DAY_ORDER.indexOf(normalize(a.dayOfWeek).toUpperCase());
        const dayB = DAY_ORDER.indexOf(normalize(b.dayOfWeek).toUpperCase());
        if (dayA !== dayB) return dayA - dayB;
        if (normalize(a.className) !== normalize(b.className)) return normalize(a.className).localeCompare(normalize(b.className), undefined, { numeric: true });
        if (normalize(a.section) !== normalize(b.section)) return normalize(a.section).localeCompare(normalize(b.section));
        return Number(a.periodNumber || 0) - Number(b.periodNumber || 0);
      });
  }, [classFilter, dayFilter, entries, sectionFilter]);

  const groupedByDay = useMemo(() => {
    return visibleEntries.reduce<Record<string, LiveEntry[]>>((acc, entry) => {
      const day = normalize(entry.dayOfWeek).toUpperCase() || 'UNASSIGNED';
      acc[day] = acc[day] || [];
      acc[day].push(entry);
      return acc;
    }, {});
  }, [visibleEntries]);

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-amber-300/40 bg-slate-950/90 p-6 text-white shadow-xl">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-200">Active Published Timetable</p>
        <h2 className="mt-2 text-2xl font-black">Latest active published timetable viewer</h2>
        <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-white/70">{loading ? 'Loading active published timetable...' : message}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Active Batch ID" value={data?.batchId || 'NONE'} />
        <Metric label="Published" value={data?.published ? 'YES' : 'NO'} />
        <Metric label="Locked" value={data?.locked ? 'YES' : 'NO'} />
        <Metric label="Visible Periods" value={String(visibleEntries.length)} />
      </div>

      <div className="grid gap-4 rounded-[24px] border border-amber-200/70 bg-white/90 p-5 shadow-lg md:grid-cols-[1fr_1fr_auto_auto]">
        <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">
          Class
          <select value={classFilter} onChange={(event) => { setClassFilter(event.target.value); setSectionFilter('ALL'); }} className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-amber-500">
            <option value="ALL">All Classes</option>
            {classes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">
          Section
          <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-amber-500">
            <option value="ALL">All Sections</option>
            {sections.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <div className="relative self-end">
          <button type="button" onClick={() => setDownloadOpen((value) => !value)} disabled={downloadLoading || !data?.batchId} className="w-full rounded-2xl bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 shadow-lg disabled:opacity-60">
            {downloadLoading ? 'Downloading...' : 'Download ▾'}
          </button>
          {downloadOpen ? (
            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-amber-200 bg-white text-sm font-black text-slate-900 shadow-xl">
              <button type="button" onClick={() => downloadActive('PDF')} className="block w-full px-4 py-3 text-left hover:bg-amber-50">Download PDF</button>
              <button type="button" onClick={() => downloadActive('EXCEL')} className="block w-full px-4 py-3 text-left hover:bg-amber-50">Download Excel</button>
            </div>
          ) : null}
        </div>
        <button type="button" onClick={loadActive} disabled={loading} className="self-end rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white disabled:opacity-60">
          {loading ? 'Refreshing...' : 'Refresh Active Timetable'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setDayFilter('ALL')} className={`rounded-full border px-4 py-2 text-xs font-black ${dayFilter === 'ALL' ? 'border-slate-950 bg-slate-950 text-white' : 'border-amber-200 bg-white/90 text-slate-700'}`}>All Days</button>
        {days.map((day) => <button key={day} type="button" onClick={() => setDayFilter(day)} className={`rounded-full border px-4 py-2 text-xs font-black ${dayFilter === day ? 'border-slate-950 bg-slate-950 text-white' : 'border-amber-200 bg-white/90 text-slate-700'}`}>{day}</button>)}
      </div>

      <article className="overflow-hidden rounded-[24px] border border-amber-200 bg-white/95 shadow-lg">
        <div className="border-b border-amber-100 px-5 py-4">
          <p className="text-sm font-black text-slate-950">Day-wise Timetable</p>
          <p className="mt-1 text-xs font-bold text-slate-500">Source: latest active published imported timetable.</p>
        </div>
        {visibleEntries.length ? (
          <div className="overflow-x-auto">
            {Object.entries(groupedByDay).map(([day, dayEntries]) => (
              <div key={day} className="min-w-[900px] border-b border-amber-100 last:border-b-0">
                <div className="bg-amber-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-800">{day}</div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950 text-[11px] uppercase tracking-[0.18em] text-white">
                    <tr>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Section</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Room</th>
                      <th className="px-4 py-3">Start</th>
                      <th className="px-4 py-3">End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayEntries.map((entry, index) => (
                      <tr key={entry.id || `${day}-${index}`} className="border-b border-amber-50 last:border-b-0">
                        <td className="px-4 py-3 font-black text-slate-950">{entry.periodNumber || '-'}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{entry.className || '-'}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{entry.section || '-'}</td>
                        <td className="px-4 py-3 font-black text-slate-900">{entry.subjectName || '-'}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{entry.teacherName || '-'}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{entry.roomNumber || '-'}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{entry.startTime || '-'}</td>
                        <td className="px-4 py-3 font-bold text-slate-700">{entry.endTime || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-8 text-sm font-bold leading-6 text-slate-600">
            No active published timetable periods found for the selected filters. If this school has not published an imported timetable yet, publish it from Import Existing Timetable first.
          </div>
        )}
      </article>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[22px] border border-amber-200 bg-white/90 p-4 shadow-lg">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
    </article>
  );
}
