'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getStoredUser } from '@/lib/auth';
import { webApi } from '@/lib/apiClient';
import {
  type AttendanceStatus,
  type StudentRow,
  type TeacherAssignmentOption,
  fetchStudentsForAssignment,
  fetchTeacherPeriods,
  groupTeacherAssignments,
  parseStudentLookup,
  studentDisplayId,
  todayIso,
  workingDates,
} from '@/lib/teacherData';

type ParsedRow = { studentKey: string; status: AttendanceStatus; student?: StudentRow; issue?: string };

const allowedStatuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE'];

function safeStatus(value: unknown): AttendanceStatus | null {
  const normalized = String(value || '').trim().toUpperCase();
  return allowedStatuses.includes(normalized as AttendanceStatus) ? normalized as AttendanceStatus : null;
}

function escapeCell(value: unknown) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function TeacherBulkAttendancePanel() {
  const user = useMemo(() => getStoredUser(), []);
  const [assignments, setAssignments] = useState<TeacherAssignmentOption[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [templateReady, setTemplateReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetchTeacherPeriods(user)
      .then((periods) => {
        if (!active) return;
        const grouped = groupTeacherAssignments(periods);
        setAssignments(grouped);
        setSelectedKey(grouped[0]?.key || '');
      })
      .catch((error) => active && setMessage(error instanceof Error ? error.message : 'Unable to load teacher assignments.'));
    return () => { active = false; };
  }, [user]);

  const selected = assignments.find((item) => item.key === selectedKey) || assignments[0];
  const dates = workingDates(fromDate, toDate, 7);
  const validRows = parsedRows.filter((row) => row.student && !row.issue);
  const issueRows = parsedRows.filter((row) => row.issue);

  async function loadAssignedStudents() {
    if (!selected) return [] as StudentRow[];
    const loaded = await fetchStudentsForAssignment(user, selected);
    setStudents(loaded);
    setTemplateReady(true);
    return loaded;
  }

  async function downloadTemplate() {
    setLoading(true);
    setMessage('');
    try {
      const assignedStudents = students.length ? students : await loadAssignedStudents();
      if (!assignedStudents.length) throw new Error('No students found for this assigned class and section.');
      const XLSX = await import('xlsx');
      const sheetRows = assignedStudents.map((student) => ({
        StudentID: studentDisplayId(student),
        RollNo: student.rollNumber || '',
        StudentName: student.name,
        Class: student.className || selected.className,
        Section: student.section || selected.section,
        Status: 'PRESENT',
      }));
      const worksheet = XLSX.utils.json_to_sheet(sheetRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      XLSX.writeFile(workbook, `${selected.className}-${selected.section}-${selected.subjectName}-attendance.xlsx`);
      setMessage('Excel template downloaded. Update the Status column, then import the Excel file for validation.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to download Excel template.');
    } finally {
      setLoading(false);
    }
  }

  async function importExcel(file: File | null) {
    if (!file || !selected) return;
    setLoading(true);
    setMessage('');
    try {
      const assignedStudents = students.length ? students : await loadAssignedStudents();
      if (!assignedStudents.length) throw new Error('No students found for this assigned class and section.');
      const lookup = parseStudentLookup(assignedStudents);
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
      const seen = new Set<string>();
      const parsed = rawRows.map((row): ParsedRow => {
        const studentKey = String(row.StudentID || row.studentId || row['Student Id'] || row['Admission Number'] || row.RollNo || '').trim();
        const status = safeStatus(row.Status || row.status);
        const student = lookup.get(studentKey.toUpperCase());
        let issue = '';
        if (!studentKey) issue = 'Missing student identifier';
        else if (!student) issue = 'Student is not assigned to this class/section';
        else if (!status) issue = 'Status must be PRESENT, ABSENT, or LATE';
        else if (seen.has(String(student.id))) issue = 'Duplicate student row';
        if (student) seen.add(String(student.id));
        return { studentKey, status: status || 'PRESENT', student, issue };
      });
      const missing = assignedStudents.filter((student) => !parsed.some((row) => row.student?.id === student.id));
      const withMissing = parsed.concat(missing.map((student) => ({ studentKey: studentDisplayId(student), status: 'PRESENT' as AttendanceStatus, student, issue: 'Missing from imported Excel' })));
      setParsedRows(withMissing);
      setMessage(withMissing.some((row) => row.issue) ? 'Excel validated with issues. Fix the highlighted rows before final submission.' : `Excel validated successfully for ${assignedStudents.length} students.`);
    } catch (error) {
      setParsedRows([]);
      setMessage(error instanceof Error ? error.message : 'Unable to validate Excel file.');
    } finally {
      setLoading(false);
    }
  }

  async function submitFinal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (!dates.length) { setMessage('Select a valid working-day date range.'); return; }
    if (!validRows.length || issueRows.length) { setMessage('Validate a clean Excel file before final submission.'); return; }
    setFinalSubmitting(true);
    setMessage('');
    try {
      const teacherId = Number(user?.teacherId || user?.userId || selected.periods[0]?.teacherId || 0);
      const teacherName = user?.teacherName || user?.displayName || selected.periods[0]?.teacherName || 'Teacher';
      const attendanceList = dates.flatMap((attendanceDate) => validRows.map((row) => ({
        studentId: row.student?.id,
        teacherId,
        teacherName,
        subjectName: selected.subjectName,
        className: selected.className,
        section: selected.section,
        attendanceDate,
        status: row.status,
      })));
      const saved = await webApi.submitBulkAttendance<unknown[]>({ attendanceList }, user?.token, user?.schoolId);
      setMessage(`Final attendance submitted for ${dates.length} working day(s), ${validRows.length} students, ${Array.isArray(saved) ? saved.length : attendanceList.length} records processed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Final attendance submission failed.');
    } finally {
      setFinalSubmitting(false);
    }
  }

  return (
    <section className="work-panel gold-panel">
      <p className="eyebrow">7-working-days recovery</p>
      <h2>Missed Attendance Excel Submission</h2>
      <p>Only assigned teacher class/section/subject combinations are available. Download the Excel template, import the completed sheet, validate, then submit final attendance.</p>
      <form className="form-grid" onSubmit={submitFinal}>
        <label className="form-grid--full">Assigned Class / Section / Subject
          <select value={selectedKey} onChange={(e) => { setSelectedKey(e.target.value); setStudents([]); setParsedRows([]); setTemplateReady(false); }} required>
            {assignments.map((item) => <option key={item.key} value={item.key}>{item.className}-{item.section} • {item.subjectName}</option>)}
          </select>
        </label>
        <label>From Date<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required /></label>
        <label>To Date<input type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} required /></label>
        <div className="form-grid--full button-row">
          <button className="secondary-button" disabled={loading || !selected} type="button" onClick={downloadTemplate}>{loading ? 'Preparing...' : 'Download Excel Template'}</button>
          <label className="secondary-button cursor-pointer">Import Excel
            <input className="hidden" type="file" accept=".xlsx,.xls" onChange={(e) => importExcel(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="form-grid--full notice-card">Preview: {dates.length} working day(s) × {validRows.length} valid student row(s). Issues: {issueRows.length}. Assigned students loaded: {students.length}{templateReady ? '' : ' — download template first.'}</div>

        {parsedRows.length ? (
          <div className="form-grid--full overflow-auto rounded-2xl border border-amber-300/20">
            <table className="w-full text-left text-sm text-amber-50">
              <thead className="bg-slate-950/40 text-xs uppercase text-amber-200"><tr><th className="p-3">Student ID</th><th className="p-3">Student</th><th className="p-3">Status</th><th className="p-3">Validation</th></tr></thead>
              <tbody>
                {parsedRows.slice(0, 80).map((row, index) => (
                  <tr key={`${row.studentKey}-${index}`} className="border-t border-amber-300/10"><td className="p-3 font-black">{escapeCell(row.studentKey)}</td><td className="p-3">{row.student?.name || '--'}</td><td className="p-3">{row.status}</td><td className={`p-3 font-black ${row.issue ? 'text-red-200' : 'text-emerald-200'}`}>{row.issue || 'OK'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="form-grid--full button-row"><button className="primary-button" disabled={finalSubmitting || !validRows.length || issueRows.length > 0} type="submit">{finalSubmitting ? 'Submitting...' : 'Submit Final Attendance'}</button></div>
      </form>
      {message ? <div className="notice-card">{message}</div> : null}
    </section>
  );
}
