'use client';

import { useEffect, useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { getStoredUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';
import {
  type AttendanceStatus,
  type StudentRow,
  type TeacherAssignmentOption,
  fetchStudentsForAssignment,
  fetchTeacherPeriods,
  groupTeacherAssignments,
  studentDisplayId,
  todayIso,
} from '@/lib/teacherData';

type UiStatus = AttendanceStatus | 'PENDING';

export default function Page() {
  const user = useMemo(() => getStoredUser(), []);
  const [assignments, setAssignments] = useState<TeacherAssignmentOption[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [statuses, setStatuses] = useState<Record<number, UiStatus>>({});
  const [attendanceDate, setAttendanceDate] = useState(todayIso());
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTeacherPeriods(user)
      .then((periods) => {
        if (!active) return;
        const grouped = groupTeacherAssignments(periods);
        setAssignments(grouped);
        setSelectedKey(grouped[0]?.key || '');
      })
      .catch((error) => active && setMessage(error instanceof Error ? error.message : 'Unable to load teacher timetable assignments.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user]);

  const selected = assignments.find((item) => item.key === selectedKey) || assignments[0];
  const today = todayIso();
  const sevenDaysAgo = (() => { const d = new Date(`${today}T00:00:00`); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10); })();

  function validateAttendanceDate() {
    if (!attendanceDate) return 'Select attendance date before submitting.';
    if (attendanceDate > today) return 'Invalid Date: future attendance dates are not allowed.';
    if (attendanceDate < sevenDaysAgo) return 'Invalid Date: only last 7 days are allowed.';
    return '';
  }
  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => [student.name, student.admissionNumber, student.rollNumber, String(student.id)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)));
  }, [studentSearch, students]);
  const presentCount = Object.values(statuses).filter((status) => status === 'PRESENT').length;
  const absentCount = Object.values(statuses).filter((status) => status === 'ABSENT').length;
  const lateCount = Object.values(statuses).filter((status) => status === 'LATE').length;
  const pendingCount = students.length - presentCount - absentCount - lateCount;

  async function loadStudents() {
    if (!selected) return;
    setStudentsLoading(true);
    setMessage('');
    try {
      const loaded = await fetchStudentsForAssignment(user, selected);
      setStudents(loaded);
      setStudentSearch('');
      setStatuses(Object.fromEntries(loaded.map((student) => [student.id, 'PENDING'])));
      setMessage(loaded.length ? `Loaded ${loaded.length} students for ${selected.className}-${selected.section} ${selected.subjectName}.` : 'No students found for this assigned class and section.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load students.');
    } finally {
      setStudentsLoading(false);
    }
  }

  function markStudent(studentId: number, status: UiStatus) {
    setStatuses((current) => ({ ...current, [studentId]: status }));
  }

  function markAll(status: AttendanceStatus) {
    setStatuses(Object.fromEntries(students.map((student) => [student.id, status])));
  }

  async function submitAttendance() {
    if (!selected || !students.length) {
      setMessage('Load students before submitting attendance.');
      return;
    }
    const dateError = validateAttendanceDate();
    if (dateError) {
      setMessage(dateError);
      return;
    }
    const pending = students.filter((student) => !statuses[student.id] || statuses[student.id] === 'PENDING');
    if (pending.length) {
      setMessage(`Mark all students before submit. Pending: ${pending.length}.`);
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const teacherId = Number(user?.teacherId || user?.userId || selected.periods[0]?.teacherId || 0);
      const teacherName = user?.teacherName || user?.displayName || selected.periods[0]?.teacherName || 'Teacher';
      const attendanceList = students.map((student) => ({
        studentId: student.id,
        teacherId,
        teacherName,
        subjectName: selected.subjectName,
        className: selected.className,
        section: selected.section,
        attendanceDate,
        status: statuses[student.id],
      }));
      await webApi.submitBulkAttendance({ attendanceList }, user?.token, user?.schoolId);
      setMessage(`Attendance submitted for ${students.length} students in ${selected.className}-${selected.section} ${selected.subjectName}. Duplicate records update the same date instead of creating extra rows.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Attendance submission failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PortalShell role="TEACHER" title="Take Attendance" subtitle="Only classes, sections, and subjects assigned to the logged-in teacher are available.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Daily attendance</p>
            <h2>Teacher-bound Attendance</h2>
            <p>Selections are loaded from the active published timetable for {user?.teacherName || user?.displayName || 'this teacher'}.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-black text-amber-100 md:col-span-2">
            Assigned Class / Section / Subject
            <select value={selectedKey} onChange={(event) => { setSelectedKey(event.target.value); setStudents([]); setStatuses({}); setStudentSearch(''); }} className="rounded-2xl border border-amber-300/20 bg-white/95 px-4 py-3 text-slate-900" disabled={loading || assignments.length === 0}>
              {assignments.map((item) => <option key={item.key} value={item.key}>{item.className}-{item.section} • {item.subjectName}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-amber-100">
            Attendance Date
            <input type="date" value={attendanceDate} min={sevenDaysAgo} max={today} onChange={(event) => setAttendanceDate(event.target.value)} className="rounded-2xl border border-amber-300/20 bg-white/95 px-4 py-3 text-slate-900" />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={loadStudents} disabled={!selected || studentsLoading} className="rounded-2xl border border-amber-300/30 bg-amber-300/20 px-5 py-3 text-sm font-black text-amber-50 transition hover:bg-amber-300/30 disabled:opacity-60">{studentsLoading ? 'Loading...' : 'Load Students'}</button>
          {assignments.length === 0 && !loading ? <span className="notice-card">No active published timetable assignment found for this teacher.</span> : null}
        </div>
      </section>

      {students.length ? (
        <section className="page-card gold-panel mt-5">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Class attendance register</p>
              <h2>{selected.className}-{selected.section} • {selected.subjectName}</h2>
              <p>{attendanceDate} • {students.length} students</p>
            </div>
            <div className="button-row">
              <button className="secondary-button" type="button" onClick={() => markAll('PRESENT')}>Mark All Present</button>
              <button className="secondary-button" type="button" onClick={() => markAll('ABSENT')}>Mark All Absent</button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm font-black text-amber-100">
            Search Student
            <input
              type="search"
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder="Search by name, admission number, or roll number"
              className="rounded-2xl border border-amber-300/20 bg-white/95 px-4 py-3 text-slate-900"
            />
            {studentSearch ? <span className="text-xs text-amber-100/80">Showing {filteredStudents.length} of {students.length} students.</span> : null}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="status-row"><strong>Present</strong><span>{presentCount}</span></div>
            <div className="status-row"><strong>Absent</strong><span>{absentCount}</span></div>
            <div className="status-row"><strong>Late</strong><span>{lateCount}</span></div>
            <div className="status-row"><strong>Pending</strong><span>{pendingCount}</span></div>
          </div>

          <div className="status-list mt-5">
            {filteredStudents.map((student) => (
              <div className="status-row flex-wrap" key={student.id}>
                <strong>{studentDisplayId(student)} • {student.name}</strong>
                <span className="flex flex-wrap gap-2">
                  {(['PRESENT', 'ABSENT', 'LATE'] as AttendanceStatus[]).map((status) => {
                    const selectedStatus = statuses[student.id] === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => markStudent(student.id, status)}
                        className={`rounded-full border px-3 py-1 text-xs font-black transition ${selectedStatus ? 'border-amber-200 bg-amber-300 text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.45)]' : 'border-amber-300/30 bg-amber-300/10 text-amber-50 hover:bg-amber-300/20'}`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </span>
              </div>
            ))}
            {filteredStudents.length === 0 ? <div className="notice-card">No matching student found.</div> : null}
          </div>

          <button type="button" onClick={submitAttendance} disabled={saving || pendingCount > 0} className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/20 px-5 py-3 text-sm font-black text-amber-50 transition hover:bg-amber-300/30 disabled:opacity-60">{saving ? 'Submitting...' : 'Submit Attendance'}</button>
        </section>
      ) : null}
      {message ? <div className="notice-card mt-4">{message}</div> : null}
    </PortalShell>
  );
}
