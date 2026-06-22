import { apiClient } from '@/lib/apiClient';
import type { WebPortalUser } from '@/types/auth';

export type TeacherPeriod = {
  id?: string;
  className?: string;
  section?: string;
  subjectName?: string;
  teacherId?: number;
  teacherName?: string;
  dayOfWeek?: string;
  periodNumber?: number;
  roomNumber?: string | null;
  startTime?: string;
  endTime?: string;
};

export type TeacherAssignmentOption = {
  key: string;
  className: string;
  section: string;
  subjectName: string;
  periods: TeacherPeriod[];
};

export type StudentRow = {
  id: number;
  name: string;
  admissionNumber?: string | null;
  rollNumber?: string | null;
  className?: string;
  section?: string;
};

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function teacherIdentityQuery(user: WebPortalUser | null) {
  const teacherName = user?.teacherName || user?.displayName || undefined;
  return {
    teacherId: teacherName ? null : Number(user?.teacherId || user?.userId || 0) || null,
    teacherName,
  };
}

export async function fetchTeacherPeriods(user: WebPortalUser | null): Promise<TeacherPeriod[]> {
  const identity = teacherIdentityQuery(user);
  const rows = await apiClient<TeacherPeriod[]>('/attendance/active-periods', {
    token: user?.token,
    schoolId: user?.schoolId,
    query: {
      schoolId: user?.schoolId,
      role: 'TEACHER',
      teacherId: identity.teacherId || undefined,
      teacherName: identity.teacherName || undefined,
    },
  });
  return Array.isArray(rows) ? rows.filter((row) => row.className && row.section && row.subjectName) : [];
}

export function groupTeacherAssignments(periods: TeacherPeriod[]): TeacherAssignmentOption[] {
  const map = new Map<string, TeacherAssignmentOption>();
  periods.forEach((period) => {
    const className = String(period.className || '').trim();
    const section = String(period.section || '').trim();
    const subjectName = String(period.subjectName || '').trim();
    if (!className || !section || !subjectName) return;
    const key = `${className}||${section}||${subjectName}`;
    if (!map.has(key)) map.set(key, { key, className, section, subjectName, periods: [] });
    map.get(key)?.periods.push(period);
  });
  return Array.from(map.values()).sort((a, b) => `${a.className}-${a.section}-${a.subjectName}`.localeCompare(`${b.className}-${b.section}-${b.subjectName}`));
}

function classLookupVariants(className: string) {
  const raw = String(className || '').trim();
  const withoutPrefix = raw.replace(/^class\s+/i, '').trim();
  const variants = [raw, withoutPrefix, `Class ${withoutPrefix}`].filter(Boolean);
  return Array.from(new Set(variants));
}

function numericValue(value?: string | null) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

export function sortStudentsForTeacherView(rows: StudentRow[]): StudentRow[] {
  return [...rows].sort((a, b) => {
    const rollDiff = numericValue(a.rollNumber) - numericValue(b.rollNumber);
    if (rollDiff !== 0) return rollDiff;
    const admissionDiff = numericValue(a.admissionNumber) - numericValue(b.admissionNumber);
    if (admissionDiff !== 0) return admissionDiff;
    return a.name.localeCompare(b.name);
  });
}

export async function fetchStudentsForAssignment(user: WebPortalUser | null, assignment: Pick<TeacherAssignmentOption, 'className' | 'section'>): Promise<StudentRow[]> {
  let lastRows: StudentRow[] = [];
  for (const className of classLookupVariants(assignment.className)) {
    const rows = await apiClient<StudentRow[]>('/students', {
      token: user?.token,
      schoolId: user?.schoolId,
      query: { className, section: assignment.section },
    });
    if (Array.isArray(rows) && rows.length > 0) return sortStudentsForTeacherView(rows);
    if (Array.isArray(rows)) lastRows = rows;
  }
  return sortStudentsForTeacherView(lastRows);
}

export function studentDisplayId(student: StudentRow) {
  return student.admissionNumber || student.rollNumber || String(student.id);
}

export function parseStudentLookup(students: StudentRow[]) {
  const lookup = new Map<string, StudentRow>();
  students.forEach((student) => {
    [String(student.id), student.admissionNumber, student.rollNumber].filter(Boolean).forEach((value) => lookup.set(String(value).trim().toUpperCase(), student));
  });
  return lookup;
}

export function downloadTextFile(filename: string, text: string, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadExcelTable(filename: string, tableHtml: string) {
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body>${tableHtml}</body></html>`;
  downloadTextFile(filename, html, 'application/vnd.ms-excel');
}

export function workingDates(fromDate: string, toDate: string, limit = 7) {
  const dates: string[] = [];
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return dates;
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) dates.push(d.toISOString().slice(0, 10));
  }
  return dates.slice(0, limit);
}
