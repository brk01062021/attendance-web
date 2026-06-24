'use client';

import { useEffect, useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { webApi } from '@/lib/apiClient';
import { getStoredUser } from '@/lib/auth';

type AttendanceMonth = { value: string; label: string };
type RecentRecord = { date: string; status: string; subjectName: string; teacherName: string };
type StudentAttendanceSummary = {
  studentId: number;
  selectedMonth: string | null;
  selectedMonthLabel: string;
  months: AttendanceMonth[];
  attendancePercentage: number;
  presentDays: number;
  absentDays: number;
  lateMarks: number;
  totalRecords: number;
  message: string;
  recentRecords: RecentRecord[];
};

export default function Page() {
  const user = getStoredUser();
  const studentId = Number(user?.studentId || user?.userId || 0);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!studentId) {
        setError('Unable to resolve logged-in student. Please log out and log in again.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const result = await webApi.studentAttendanceSummary<StudentAttendanceSummary>(studentId, selectedMonth, user?.token, user?.schoolId);
        setSummary(result);
        if (!selectedMonth && result.selectedMonth) {
          setSelectedMonth(result.selectedMonth);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load attendance from database.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedMonth, studentId, user?.schoolId, user?.token]);

  const months = useMemo(() => summary?.months || [], [summary]);

  return (
    <PortalShell role="STUDENT" title="My Attendance" subtitle="Database attendance summary for the logged-in student.">
      <ShellStyles />

      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Attendance overview</p>
            <h2>Monthly Attendance</h2>
            <p>Select a month to review present days, absent days, late marks, and attendance percentage from database records.</p>
          </div>
          <span className="status-pill">{loading ? 'Loading' : 'Live data'}</span>
        </div>

        {error ? <p className="rounded-2xl border border-red-300/40 bg-red-950/40 p-3 text-sm font-bold text-red-100">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          {months.map((month) => (
            <button
              type="button"
              key={month.value}
              onClick={() => setSelectedMonth(month.value)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                (selectedMonth || summary?.selectedMonth) === month.value
                  ? 'border-amber-300/40 bg-amber-300/25 text-amber-50'
                  : 'border-white/15 bg-white/10 text-white/75 hover:bg-white/15'
              }`}
            >
              {month.label}
            </button>
          ))}
        </div>

        {!loading && !months.length ? <div className="notice-card mt-5">No attendance records found for this student yet.</div> : null}

        {summary ? (
          <div className="status-list mt-5">
            <div className="status-row">
              <strong>{summary.selectedMonthLabel}</strong>
              <span>{summary.message}</span>
            </div>
            <div className="status-row">
              <strong>Attendance %</strong>
              <span>{summary.attendancePercentage}%</span>
            </div>
            <div className="status-row">
              <strong>Present days</strong>
              <span>{summary.presentDays} days</span>
            </div>
            <div className="status-row">
              <strong>Absent days</strong>
              <span>{summary.absentDays} days</span>
            </div>
            <div className="status-row">
              <strong>Late marks</strong>
              <span>{summary.lateMarks} days</span>
            </div>
          </div>
        ) : null}
      </section>

      {summary?.recentRecords?.length ? (
        <section className="page-card gold-panel">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Recent records</p>
              <h2>Attendance Entries</h2>
            </div>
          </div>
          <div className="status-list">
            {summary.recentRecords.map((record) => (
              <div className="status-row" key={`${record.date}-${record.subjectName}-${record.teacherName}`}>
                <strong>{record.date}</strong>
                <span>{record.status}{record.subjectName ? ` • ${record.subjectName}` : ''}{record.teacherName ? ` • ${record.teacherName}` : ''}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </PortalShell>
  );
}
