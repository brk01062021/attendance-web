'use client';

import { FormEvent, useMemo, useState } from 'react';
import { getStoredUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';

type Row = { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' };

function todayIso() { return new Date().toISOString().slice(0, 10); }

export default function TeacherBulkAttendancePanel() {
  const user = useMemo(() => getStoredUser(), []);
  const [className, setClassName] = useState('10');
  const [section, setSection] = useState('A');
  const [subjectName, setSubjectName] = useState('Mathematics');
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rowsText, setRowsText] = useState('1,PRESENT\n2,PRESENT\n3,ABSENT');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function parseRows(): Row[] {
    return rowsText.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
      const [studentId, status = 'PRESENT'] = line.split(',').map((x) => x.trim());
      return { studentId, status: status.toUpperCase() as Row['status'] };
    }).filter((row) => row.studentId && ['PRESENT', 'ABSENT', 'LATE'].includes(row.status));
  }

  function workingDates() {
    const dates: string[] = [];
    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T00:00:00`);
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) dates.push(d.toISOString().slice(0, 10));
    }
    return dates.slice(0, 7);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const teacherId = user?.teacherId || user?.userId || 101;
      const teacherName = user?.displayName || 'Teacher';
      const rows = parseRows();
      const dates = workingDates();
      if (!rows.length) throw new Error('Add at least one row as studentId,status. Example: 1,PRESENT');
      if (!dates.length) throw new Error('Select a valid working-day date range.');
      const attendanceList = dates.flatMap((attendanceDate) => rows.map((row) => ({
        studentId: Number(row.studentId),
        teacherId,
        teacherName,
        subjectName,
        className,
        section,
        attendanceDate,
        status: row.status,
      })));
      const saved = await webApi.submitBulkAttendance<unknown[]>({ attendanceList }, user?.token, user?.schoolId);
      setMessage(`Bulk attendance submitted for ${dates.length} working day(s), ${rows.length} student row(s), ${Array.isArray(saved) ? saved.length : attendanceList.length} records processed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Bulk attendance submission failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="work-panel gold-panel">
      <p className="eyebrow">7-WORKING-DAYS RECOVERY</p>
      <h2>Missed Attendance Bulk Submission</h2>
      <p>Use this web-only teacher workflow when attendance was missed for up to 7 working days. Weekends are skipped automatically; future holiday/timetable locks can be added to backend validation.</p>
      <form className="form-grid" onSubmit={submit}>
        <label>Class<input value={className} onChange={(e) => setClassName(e.target.value)} required /></label>
        <label>Section<input value={section} onChange={(e) => setSection(e.target.value)} required /></label>
        <label>Subject<input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required /></label>
        <label>From Date<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required /></label>
        <label>To Date<input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} required /></label>
        <label className="form-grid--full">Paste Excel/CSV rows: studentId,status<textarea rows={8} value={rowsText} onChange={(e) => setRowsText(e.target.value)} /></label>
        <div className="form-grid--full notice-card">Preview: {workingDates().length} working day(s) × {parseRows().length} valid student row(s). Maximum date batch used: 7 working days.</div>
        <div className="form-grid--full button-row"><button className="primary-button" disabled={loading} type="submit">{loading ? 'Submitting...' : 'Submit Missed Attendance'}</button></div>
      </form>
      {message ? <div className="notice-card">{message}</div> : null}
    </section>
  );
}
