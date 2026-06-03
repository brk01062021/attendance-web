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
  if (role === 'TEACHER') return 'Daily and weekly teaching schedule from the latest published timetable only.';
  if (role === 'PARENT') return "Your child's daily and weekly class schedule from the latest published timetable only.";
  return 'Daily and weekly class schedule from the latest published timetable only.';
}

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

  return (
    <div className="space-y-5">
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Published timetable only</p>
            <h2>{titleForRole(role)}</h2>
            <p className="page-subtitle mt-2">{live?.message || subtitleForRole(role)}</p>
          </div>
          <span className="status-pill">{live?.published ? 'Live published timetable' : loading ? 'Loading' : 'Hidden until publish'}</span>
        </div>
        {error ? <p className="rounded-2xl border border-red-300/40 bg-red-950/40 p-3 text-sm font-bold text-red-100">{error}</p> : null}
        <div className="grid gap-3 md:grid-cols-4">
          <div className="metric-card"><p className="metric-label">Visibility</p><p className="metric-value text-base">{live?.published ? 'Visible' : 'Hidden'}</p></div>
          <div className="metric-card"><p className="metric-label">Schedule</p><p className="metric-value text-base">Latest published</p></div>
          <div className="metric-card"><p className="metric-label">Periods</p><p className="metric-value">{entries.length}</p></div>
          <div className="metric-card"><p className="metric-label">Scope</p><p className="metric-value text-base">{live?.visibilityScope || role}</p></div>
        </div>
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div><p className="eyebrow">Daily timetable</p><h2>{selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()} Schedule</h2></div>
          <select className="rounded-2xl border border-amber-200/50 bg-white px-4 py-2 text-sm font-black text-slate-900" value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)}>
            {dayOrder.map((day) => <option key={day} value={day}>{day}</option>)}
          </select>
        </div>
        <div className="status-list">
          {daily.length ? daily.map((entry) => (
            <button className="status-row text-left" key={entry.id} onClick={() => setSelectedEntry(entry)}>
              <strong>P{entry.periodNumber} • {entry.subjectName}</strong>
              <span>{entry.className}-{entry.section} • {entry.teacherName} • {entry.startTime || '--'}-{entry.endTime || '--'}</span>
            </button>
          )) : <div className="status-row"><strong>No periods visible</strong><span>Draft timetables are hidden. Only published timetable entries appear here.</span></div>}
        </div>
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row"><div><p className="eyebrow">Weekly timetable</p><h2>Published Weekly Timetable</h2></div></div>
        <div className="grid gap-3 md:grid-cols-3">
          {weekly.map((item) => <div className="metric-card" key={item.day}><p className="metric-label">{item.day}</p><p className="metric-value">{item.entries.length}</p><p className="metric-helper">visible periods</p></div>)}
        </div>
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row"><div><p className="eyebrow">Period details</p><h2>{selectedEntry ? `Period ${selectedEntry.periodNumber}` : 'Select a period'}</h2></div></div>
        {selectedEntry ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="metric-card"><p className="metric-label">Subject</p><p className="metric-value text-base">{selectedEntry.subjectName}</p></div>
            <div className="metric-card"><p className="metric-label">Class</p><p className="metric-value text-base">{selectedEntry.className}-{selectedEntry.section}</p></div>
            <div className="metric-card"><p className="metric-label">Teacher</p><p className="metric-value text-base">{selectedEntry.teacherName}</p></div>
            <div className="metric-card"><p className="metric-label">Time</p><p className="metric-value text-base">{selectedEntry.startTime || '--'} - {selectedEntry.endTime || '--'}</p></div>
          </div>
        ) : <div className="status-row"><strong>No period selected</strong><span>Open any visible period from the daily timetable.</span></div>}
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row"><div><p className="eyebrow">Timetable notification center</p><h2>Schedule Alerts</h2></div></div>
        <div className="status-list">
          {notifications.length ? notifications.slice(0, 6).map((notice) => (
            <div className="status-row" key={notice.notificationId}><strong>{notice.title}</strong><span>{notice.message}</span></div>
          )) : <div className="status-row"><strong>No timetable alerts</strong><span>Published timetable alerts will appear here.</span></div>}
        </div>
      </section>
    </div>
  );
}
