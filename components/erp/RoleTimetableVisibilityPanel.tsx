'use client';

import { useEffect, useMemo, useState } from 'react';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';

type Role = 'TEACHER' | 'STUDENT' | 'PARENT';
type TimetableEntry = { id: string; className: string; section: string; dayOfWeek: string; periodNumber: number; subjectName: string; teacherName: string; startTime: string; endTime: string; roomNumber?: string };
type LiveResponse = { batchId: string; role: string; visibilityScope: string; published: boolean; locked: boolean; message: string; entries: TimetableEntry[] };
type Notification = { notificationId: string; audience: string; title: string; message: string; createdAt: string };

const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const todayName = dayOrder[Math.min(new Date().getDay() - 1 < 0 ? 0 : new Date().getDay() - 1, dayOrder.length - 1)] || 'MONDAY';

function titleForRole(role: Role) {
  if (role === 'TEACHER') return 'My Timetable';
  if (role === 'PARENT') return 'Child Timetable';
  return 'Student Timetable';
}

function subtitleForRole(role: Role) {
  if (role === 'TEACHER') return 'Published periods assigned to this teacher only.';
  if (role === 'PARENT') return "Your child's published class schedule.";
  return 'Published class schedule.';
}

function uniq(values: string[]) { return Array.from(new Set(values.filter(Boolean))); }

export default function RoleTimetableVisibilityPanel({ role }: { role: Role }) {
  const user = getStoredUser();
  const [live, setLive] = useState<LiveResponse | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');
        const className = role === 'TEACHER' ? undefined : (user?.className || '10');
        const section = role === 'TEACHER' ? undefined : (user?.section || 'A');
        const teacherName = role === 'TEACHER' ? (user?.teacherName || user?.displayName || undefined) : undefined;
        const [liveResult, notificationResult] = await Promise.all([
          webApi.liveTimetable<LiveResponse>(role, user?.token, user?.schoolId, role === 'TEACHER' ? user?.teacherId || user?.userId || 1 : undefined, className, section, teacherName),
          webApi.timetableRoleNotifications<Notification[]>(role, user?.token, user?.schoolId),
        ]);
        setLive(liveResult);
        setNotifications(notificationResult || []);
        setSelectedEntry((liveResult.entries || [])[0] || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load published timetable.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [role, user?.schoolId, user?.teacherId, user?.teacherName, user?.displayName, user?.token, user?.userId, user?.className, user?.section]);

  const entries = useMemo(() => live?.entries || [], [live]);
  const daily = entries.filter((entry) => entry.dayOfWeek === selectedDay).sort((a, b) => a.periodNumber - b.periodNumber);
  const weekly = dayOrder.map((day) => ({ day, entries: entries.filter((entry) => entry.dayOfWeek === day).sort((a, b) => a.periodNumber - b.periodNumber) }));
  const classes = uniq(entries.map((entry) => `${entry.className}-${entry.section}`));
  const subjects = uniq(entries.map((entry) => entry.subjectName));
  const sections = uniq(entries.map((entry) => entry.section));

  return (
    <div className="space-y-4">
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Published timetable</p>
            <h2>{titleForRole(role)}</h2>
            <p className="page-subtitle mt-2">{live?.message || subtitleForRole(role)}</p>
          </div>
          <span className="status-pill">{live?.published ? 'Live' : loading ? 'Loading' : 'Hidden'}</span>
        </div>
        {error ? <p className="rounded-2xl border border-red-300/40 bg-red-950/40 p-3 text-sm font-bold text-red-100">{error}</p> : null}
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-amber-300/20 bg-slate-950/25 p-4"><p className="metric-label">Classes</p><p className="text-2xl font-black text-amber-100">{classes.length}</p></div>
          <div className="rounded-2xl border border-amber-300/20 bg-slate-950/25 p-4"><p className="metric-label">Subjects</p><p className="text-2xl font-black text-amber-100">{subjects.length}</p></div>
          <div className="rounded-2xl border border-amber-300/20 bg-slate-950/25 p-4"><p className="metric-label">Periods/week</p><p className="text-2xl font-black text-amber-100">{entries.length}</p></div>
          <div className="rounded-2xl border border-amber-300/20 bg-slate-950/25 p-4"><p className="metric-label">Sections</p><p className="text-2xl font-black text-amber-100">{sections.length}</p></div>
        </div>
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div><p className="eyebrow">Daily schedule</p><h2>{selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}</h2></div>
          <select className="rounded-2xl border border-amber-200/50 bg-white px-4 py-2 text-sm font-black text-slate-900" value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)}>
            {dayOrder.map((day) => <option key={day} value={day}>{day}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          {daily.length ? daily.map((entry) => (
            <button className={`rounded-2xl border px-4 py-3 text-left transition ${selectedEntry?.id === entry.id ? 'border-amber-300 bg-amber-300/20' : 'border-white/10 bg-slate-950/20 hover:bg-amber-300/10'}`} key={entry.id} onClick={() => setSelectedEntry(entry)}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-black text-amber-50">
                <span>P{entry.periodNumber} • {entry.subjectName}</span>
                <span>{entry.className}-{entry.section} • {entry.startTime || '--'}-{entry.endTime || '--'}</span>
              </div>
            </button>
          )) : <div className="notice-card">No periods visible for this day.</div>}
        </div>
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row"><div><p className="eyebrow">Weekly summary</p><h2>Published Weekly Timetable</h2></div></div>
        <div className="grid gap-3 md:grid-cols-6">
          {weekly.map((item) => <button type="button" onClick={() => setSelectedDay(item.day)} className={`rounded-2xl border p-3 text-left ${selectedDay === item.day ? 'border-amber-300 bg-amber-300/20' : 'border-amber-300/20 bg-slate-950/20'}`} key={item.day}><p className="text-xs font-black uppercase text-amber-200">{item.day.slice(0, 3)}</p><p className="text-2xl font-black text-amber-50">{item.entries.length}</p><p className="text-xs font-bold text-amber-100/70">periods</p></button>)}
        </div>
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row"><div><p className="eyebrow">Period details</p><h2>{selectedEntry ? `Period ${selectedEntry.periodNumber}` : 'Select a period'}</h2><p className="page-subtitle mt-1">Click any daily period above to view details here.</p></div></div>
        {selectedEntry ? (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-amber-300/20 bg-slate-950/20 p-4"><p className="metric-label">Subject</p><p className="font-black text-amber-50">{selectedEntry.subjectName}</p></div>
            <div className="rounded-2xl border border-amber-300/20 bg-slate-950/20 p-4"><p className="metric-label">Class</p><p className="font-black text-amber-50">{selectedEntry.className}-{selectedEntry.section}</p></div>
            <div className="rounded-2xl border border-amber-300/20 bg-slate-950/20 p-4"><p className="metric-label">Teacher</p><p className="font-black text-amber-50">{selectedEntry.teacherName}</p></div>
            <div className="rounded-2xl border border-amber-300/20 bg-slate-950/20 p-4"><p className="metric-label">Time</p><p className="font-black text-amber-50">{selectedEntry.startTime || '--'} - {selectedEntry.endTime || '--'}</p></div>
          </div>
        ) : <div className="notice-card">Open any visible period from the daily schedule.</div>}
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row"><div><p className="eyebrow">Alerts</p><h2>Schedule Alerts</h2></div></div>
        <div className="grid gap-2">
          {notifications.length ? notifications.slice(0, 4).map((notice) => (
            <div className="rounded-2xl border border-amber-300/20 bg-slate-950/20 px-4 py-3" key={notice.notificationId}><strong className="text-amber-50">{notice.title}</strong><span className="ml-2 text-amber-100/80">{notice.message}</span></div>
          )) : <div className="notice-card">No timetable alerts.</div>}
        </div>
      </section>
    </div>
  );
}
