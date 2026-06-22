'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { getStoredUser } from '@/lib/auth';
import {
  type StudentRow,
  type TeacherAssignmentOption,
  fetchStudentsForAssignment,
  fetchTeacherPeriods,
  groupTeacherAssignments,
  parseStudentLookup,
  studentDisplayId,
} from '@/lib/teacherData';

type ResultIssueType = 'ERROR' | 'WARNING';

type ResultIssue = {
  type: ResultIssueType;
  row?: number;
  studentId?: string;
  message: string;
};

type ResultPreviewRow = {
  rowNumber: number;
  studentKey: string;
  student?: StudentRow;
  marksText: string;
  marks?: number;
  issues: ResultIssue[];
};

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function readCell(row: Record<string, unknown>, names: string[]) {
  const lookup = new Map(Object.keys(row).map((key) => [normalizeHeader(key), key]));
  for (const name of names) {
    const actual = lookup.get(normalizeHeader(name));
    if (actual) return row[actual];
  }
  return '';
}

function toNumberOrNull(value: unknown) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function escapeCell(value: unknown) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function Page() {
  const user = useMemo(() => getStoredUser(), []);
  const [assignments, setAssignments] = useState<TeacherAssignmentOption[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [examName, setExamName] = useState('Unit Test 1');
  const [maxMarks, setMaxMarks] = useState('100');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [previewRows, setPreviewRows] = useState<ResultPreviewRow[]>([]);
  const [issues, setIssues] = useState<ResultIssue[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
  const errorCount = issues.filter((issue) => issue.type === 'ERROR').length;
  const warningCount = issues.filter((issue) => issue.type === 'WARNING').length;
  const validCount = previewRows.filter((row) => row.issues.every((issue) => issue.type !== 'ERROR')).length;
  const missingCount = issues.filter((issue) => issue.message.toLowerCase().includes('missing')).length;
  const canSubmitFinal = previewRows.length > 0 && errorCount === 0 && !submitted;

  async function loadAssignedStudents() {
    if (!selected) return [] as StudentRow[];
    const loaded = await fetchStudentsForAssignment(user, selected);
    setStudents(loaded);
    return loaded;
  }

  async function downloadTemplate() {
    if (!selected) return;
    setLoading(true);
    setMessage('');
    try {
      const assignedStudents = students.length ? students : await loadAssignedStudents();
      if (!assignedStudents.length) throw new Error('No students found for this assigned class and section.');
      const XLSX = await import('xlsx');
      const rows = assignedStudents.map((student) => ({
        StudentID: studentDisplayId(student),
        RollNo: student.rollNumber || '',
        StudentName: student.name,
        Class: student.className || selected.className,
        Section: student.section || selected.section,
        Subject: selected.subjectName,
        ExamName: examName,
        MaxMarks: maxMarks,
        Marks: '',
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
      XLSX.writeFile(workbook, `${selected.className}-${selected.section}-${selected.subjectName}-${examName || 'exam'}-results.xlsx`);
      setMessage('Excel template downloaded. Fill the Marks column, then upload the Excel sheet for validation.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to download Excel template.');
    } finally {
      setLoading(false);
    }
  }

  async function uploadExcel(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selected) return;
    setLoading(true);
    setMessage('');
    setDraftSaved(false);
    setSubmitted(false);
    try {
      const assignedStudents = students.length ? students : await loadAssignedStudents();
      if (!assignedStudents.length) throw new Error('No students found for this assigned class and section.');
      const max = Number(maxMarks);
      if (!Number.isFinite(max) || max <= 0) throw new Error('Enter a valid Max Marks value before uploading Excel.');

      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
      const lookup = parseStudentLookup(assignedStudents);
      const seen = new Set<number>();
      const nextIssues: ResultIssue[] = [];

      const parsed = rawRows.map((row, index): ResultPreviewRow => {
        const rowNumber = index + 2;
        const studentKey = String(readCell(row, ['StudentID', 'Student Id', 'Admission Number', 'AdmissionNumber', 'RollNo', 'Roll Number'])).trim();
        const marksValue = readCell(row, ['Marks', 'Score', 'Obtained Marks', 'ObtainedMarks']);
        const marksText = String(marksValue ?? '').trim();
        const marks = toNumberOrNull(marksValue);
        const student = lookup.get(studentKey.toUpperCase());
        const rowIssues: ResultIssue[] = [];

        if (!studentKey) rowIssues.push({ type: 'ERROR', row: rowNumber, message: 'Student ID is missing.' });
        else if (!student) rowIssues.push({ type: 'ERROR', row: rowNumber, studentId: studentKey, message: 'Student is not assigned to this class/section.' });
        if (student && seen.has(student.id)) rowIssues.push({ type: 'ERROR', row: rowNumber, studentId: studentKey, message: 'Duplicate student row found.' });
        if (student) seen.add(student.id);
        if (marksText === '') rowIssues.push({ type: 'ERROR', row: rowNumber, studentId: studentKey, message: 'Marks are missing.' });
        else if (marks === null) rowIssues.push({ type: 'ERROR', row: rowNumber, studentId: studentKey, message: 'Marks must be a number.' });
        else if (marks < 0) rowIssues.push({ type: 'ERROR', row: rowNumber, studentId: studentKey, message: 'Marks cannot be negative.' });
        else if (marks > max) rowIssues.push({ type: 'ERROR', row: rowNumber, studentId: studentKey, message: `Marks cannot exceed max marks (${max}).` });

        nextIssues.push(...rowIssues);
        return { rowNumber, studentKey, student, marksText, marks: marks ?? undefined, issues: rowIssues };
      });

      assignedStudents.forEach((student) => {
        if (!seen.has(student.id)) {
          nextIssues.push({ type: 'WARNING', studentId: studentDisplayId(student), message: `${studentDisplayId(student)} - ${student.name} is missing from uploaded Excel.` });
        }
      });

      setPreviewRows(parsed);
      setIssues(nextIssues);
      if (nextIssues.some((issue) => issue.type === 'ERROR')) {
        setMessage('Excel validated with errors. Fix the Excel sheet and upload again before final submission.');
      } else if (nextIssues.length) {
        setMessage('Excel validated with warnings. Review missing students before final submission.');
      } else {
        setMessage(`Validation successful. ${parsed.length}/${assignedStudents.length} records are ready for final submission.`);
      }
    } catch (error) {
      setPreviewRows([]);
      setIssues([]);
      setMessage(error instanceof Error ? error.message : 'Unable to validate Excel file.');
    } finally {
      setLoading(false);
    }
  }

  function saveDraft() {
    if (!previewRows.length) {
      setMessage('Upload and validate an Excel sheet before saving draft.');
      return;
    }
    setDraftSaved(true);
    setMessage('Draft saved for review. Final submission remains disabled until validation has no errors.');
  }

  function submitFinal() {
    if (!canSubmitFinal) {
      setMessage('Cannot submit final results. Fix validation errors and re-upload the Excel sheet.');
      return;
    }
    setSubmitted(true);
    setMessage(`Final result submission ready for ${selected?.className}-${selected?.section} ${selected?.subjectName}. ${validCount} student result record(s) passed validation.`);
  }

  return (
    <PortalShell role="TEACHER" title="Results Submission" subtitle="Whole-class Excel marks upload for assigned classes and subjects only.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <p className="eyebrow">Exam marks</p>
        <h2>Class Excel Result Upload</h2>
        <p>Download the class template, upload the completed Excel sheet, review validation, then save draft or submit final.</p>
        <div className="form-grid">
          <label>Assigned Class / Section / Subject
            <select value={selectedKey} onChange={(event) => { setSelectedKey(event.target.value); setStudents([]); setPreviewRows([]); setIssues([]); setMessage(''); }} required>
              {assignments.map((item) => <option key={item.key} value={item.key}>{item.className}-{item.section} • {item.subjectName}</option>)}
            </select>
          </label>
          <label>Exam Name<input value={examName} onChange={(event) => setExamName(event.target.value)} /></label>
          <label>Max Marks<input type="number" min="1" value={maxMarks} onChange={(event) => setMaxMarks(event.target.value)} /></label>
          <div className="form-grid--full button-row">
            <button className="secondary-button" type="button" disabled={loading || !selected} onClick={downloadTemplate}>{loading ? 'Preparing...' : 'Download Excel Template'}</button>
            <label className="secondary-button cursor-pointer">Upload Excel Sheet
              <input className="hidden" type="file" accept=".xlsx,.xls" onChange={uploadExcel} />
            </label>
          </div>
        </div>
      </section>

      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Preview and validation</p>
            <h2>{selected ? `${selected.className}-${selected.section} • ${selected.subjectName}` : 'Result Preview'}</h2>
          </div>
          <div className="button-row">
            <button className="secondary-button" type="button" disabled={!previewRows.length} onClick={saveDraft}>Save Draft</button>
            <button className="primary-button" type="button" disabled={!canSubmitFinal} onClick={submitFinal}>Submit Final</button>
          </div>
        </div>

        <div
          className="result-validation-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            margin: '14px 0',
          }}
        >
          {[
            ['Total Students', students.length || '-'],
            ['Excel Rows', previewRows.length],
            ['Valid', validCount],
            ['Errors', errorCount],
            ['Warnings', warningCount],
            ['Missing', missingCount],
          ].map(([label, value]) => (
            <div
              key={label}
              className="result-validation-card"
              style={{
                minHeight: 62,
                padding: '10px 14px',
                borderRadius: 14,
                border: '1px solid rgba(251, 191, 36, 0.22)',
                background: 'linear-gradient(135deg, rgba(253, 230, 138, 0.95), rgba(245, 158, 11, 0.72))',
                color: '#1f2937',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', opacity: .78 }}>{label}</span>
              <strong style={{ fontSize: 20, lineHeight: 1.1, marginTop: 4 }}>{value}</strong>
            </div>
          ))}
        </div>

        {message ? <div className="notice-card">{message}</div> : null}

        {issues.length ? (
          <div className="form-grid">
            {errorCount ? (
              <div className="notice-card form-grid--full" style={{ borderColor: 'rgba(248,113,113,.55)' }}>
                <strong>Validation Errors ({errorCount})</strong>
                <ul>
                  {issues.filter((issue: ResultIssue) => issue.type === 'ERROR').slice(0, 12).map((issue: ResultIssue, index: number) => <li key={`error-${index}`}>{issue.row ? `Row ${issue.row}: ` : ''}{issue.studentId ? `${issue.studentId} - ` : ''}{issue.message}</li>)}
                </ul>
              </div>
            ) : null}
            {warningCount ? (
              <div className="notice-card form-grid--full" style={{ borderColor: 'rgba(251,191,36,.65)' }}>
                <strong>Warnings ({warningCount})</strong>
                <ul>
                  {issues.filter((issue: ResultIssue) => issue.type === 'WARNING').slice(0, 12).map((issue: ResultIssue, index: number) => <li key={`warning-${index}`}>{issue.studentId ? `${issue.studentId} - ` : ''}{issue.message}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {previewRows.length ? (
          <div className="overflow-auto rounded-2xl border border-amber-300/20">
            <table className="w-full text-left text-sm text-amber-50">
              <thead className="bg-slate-950/40 text-xs uppercase text-amber-200">
                <tr><th className="p-3">Row</th><th className="p-3">Student ID</th><th className="p-3">Student</th><th className="p-3">Marks</th><th className="p-3">Validation</th></tr>
              </thead>
              <tbody>
                {previewRows.slice(0, 120).map((row, index) => {
                  const hasError = row.issues.some((issue) => issue.type === 'ERROR');
                  return (
                    <tr key={`${row.studentKey}-${index}`} className="border-t border-amber-300/10">
                      <td className="p-3">{row.rowNumber}</td>
                      <td className="p-3 font-black">{escapeCell(row.studentKey)}</td>
                      <td className="p-3">{row.student?.name || '--'}</td>
                      <td className="p-3">{escapeCell(row.marksText)}</td>
                      <td className={`p-3 font-black ${hasError ? 'text-red-200' : 'text-emerald-200'}`}>{hasError ? row.issues.map((issue) => issue.message).join(' | ') : 'Valid'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="notice-card">Upload an Excel sheet to see preview and validation results.</div>}

        {draftSaved ? <div className="notice-card">Draft saved. You can still upload a corrected Excel sheet before final submission.</div> : null}
        {submitted ? <div className="notice-card">Final submission completed for validation. Results are locked from this teacher screen.</div> : null}
      </section>
    </PortalShell>
  );
}
