'use client';

import { useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const attendanceByMonth = {
  'May 2026': {
    percentage: '92%',
    presentDays: '23 days',
    absentDays: '2 days',
    lateDays: '1 day',
    trend: 'Strong attendance this month',
  },
  'April 2026': {
    percentage: '89%',
    presentDays: '21 days',
    absentDays: '3 days',
    lateDays: '2 days',
    trend: 'Attendance improved after mid-month',
  },
  'March 2026': {
    percentage: '95%',
    presentDays: '24 days',
    absentDays: '1 day',
    lateDays: '0 days',
    trend: 'Excellent monthly attendance',
  },
};

type AttendanceMonth = keyof typeof attendanceByMonth;

export default function Page() {
  const months = Object.keys(attendanceByMonth) as AttendanceMonth[];
  const [selectedMonth, setSelectedMonth] = useState<AttendanceMonth>(months[0]);

  const summary = useMemo(() => attendanceByMonth[selectedMonth], [selectedMonth]);

  return (
    <PortalShell role="STUDENT" title="My Attendance" subtitle="Select a month to view attendance summary and recent attendance status.">
      <ShellStyles />

      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Attendance overview</p>
            <h2>Monthly Attendance</h2>
            <p>Tap a month to review present days, absent days, late marks, and attendance percentage.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {months.map((month) => (
            <button
              type="button"
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                selectedMonth === month
                  ? 'border-amber-300/40 bg-amber-300/25 text-amber-50'
                  : 'border-white/15 bg-white/10 text-white/75 hover:bg-white/15'
              }`}
            >
              {month}
            </button>
          ))}
        </div>

        <div className="status-list mt-5">
          <div className="status-row">
            <strong>{selectedMonth}</strong>
            <span>{summary.trend}</span>
          </div>
          <div className="status-row">
            <strong>Attendance %</strong>
            <span>{summary.percentage}</span>
          </div>
          <div className="status-row">
            <strong>Present days</strong>
            <span>{summary.presentDays}</span>
          </div>
          <div className="status-row">
            <strong>Absent days</strong>
            <span>{summary.absentDays}</span>
          </div>
          <div className="status-row">
            <strong>Late marks</strong>
            <span>{summary.lateDays}</span>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
