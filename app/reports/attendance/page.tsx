"use client";

import { useEffect, useMemo, useState } from "react";
import PortalShell from "@/components/layout/PortalShell";
import ShellStyles from "@/components/layout/ShellStyles";
import { getStoredUser } from "@/lib/auth";

type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T } | T;
type StudentOption = {
  studentId: number;
  studentName: string;
  admissionNumber?: string;
  rollNumber?: string;
  className: string;
  section: string;
};
type AttendanceSummaryRow = {
  studentId: number;
  studentName: string;
  className: string;
  section: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
};
type DailyRecord = {
  date?: string;
  attendanceDate?: string;
  status: string;
  subjectName?: string;
  teacherName?: string;
};
type StudentReport = {
  studentId: number;
  studentName: string;
  admissionNumber?: string;
  rollNumber?: string;
  className: string;
  section: string;
  fromDate: string;
  toDate: string;
  rangeType: string;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  dailyRecords: DailyRecord[];
};

type ReportRange = "Daily" | "Weekly" | "Monthly";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function monthStart(date: string) {
  return `${date.slice(0, 7)}-01`;
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function rangeFor(date: string, range: ReportRange) {
  if (range === "Daily") return { fromDate: date, toDate: date };
  if (range === "Weekly") return { fromDate: addDays(date, -6), toDate: date };
  const start = monthStart(date);
  const end = new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0).toISOString().slice(0, 10);
  return { fromDate: start, toDate: end };
}

function unwrap<T>(json: ApiEnvelope<T>): T {
  if (json && typeof json === "object" && "data" in json) return (json as { data: T }).data;
  return json as T;
}

async function fetchTenantData<T>(path: string, token?: string, schoolId?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(schoolId ? { "X-School-Id": schoolId } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${res.status}`);
  return unwrap<T>((await res.json()) as ApiEnvelope<T>);
}

function exportCsv(filename: string, rows: Record<string, string | number | undefined | null>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const [token, setToken] = useState<string>();
  const [schoolId, setSchoolId] = useState("TST2");
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [reportDate, setReportDate] = useState(todayIso());
  const [rangeType, setRangeType] = useState<ReportRange>("Daily");
  const [classRows, setClassRows] = useState<AttendanceSummaryRow[]>([]);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedStudent = useMemo(
    () => students.find((s) => String(s.studentId) === studentId),
    [studentId, students]
  );

  const hasRequiredSelection = className && section;
  const { fromDate, toDate } = useMemo(() => rangeFor(reportDate, rangeType), [reportDate, rangeType]);

  useEffect(() => {
    const user = getStoredUser();
    setToken(user?.token);
    setSchoolId(user?.schoolId || "TST2");
  }, []);

  useEffect(() => {
    fetchTenantData<string[]>(`/api/operational-lookups/classes?schoolId=${encodeURIComponent(schoolId)}`, token, schoolId)
      .then(setClasses)
      .catch((e) => setError(e.message));
  }, [schoolId, token]);

  useEffect(() => {
    setSection("");
    setStudentId("");
    setClassRows([]);
    setStudentReport(null);
    if (!className) {
      setSections([]);
      return;
    }
    fetchTenantData<string[]>(`/api/operational-lookups/sections?schoolId=${encodeURIComponent(schoolId)}&className=${encodeURIComponent(className)}`, token, schoolId)
      .then(setSections)
      .catch((e) => setError(e.message));
  }, [className, schoolId, token]);

  useEffect(() => {
    setStudentId("");
    setStudentReport(null);
    if (!className || !section) {
      setStudents([]);
      return;
    }
    const timer = window.setTimeout(() => {
      fetchTenantData<StudentOption[]>(
        `/api/operational-lookups/students/search?schoolId=${encodeURIComponent(schoolId)}&className=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&query=${encodeURIComponent(studentSearch)}`,
        token,
        schoolId
      )
        .then(setStudents)
        .catch((e) => setError(e.message));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [className, section, studentSearch, schoolId, token]);

  async function loadReport() {
    if (!hasRequiredSelection) return;
    setLoading(true);
    setError("");
    setStudentReport(null);
    try {
      const summaryPath = rangeType === "Monthly"
        ? `/attendance/report/monthly?className=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}&year=${Number(reportDate.slice(0, 4))}&month=${Number(reportDate.slice(5, 7))}`
        : `/attendance/report?className=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}`;
      const rows = await fetchTenantData<AttendanceSummaryRow[]>(summaryPath, token, schoolId);
      setClassRows(rows);
      if (studentId) {
        const report = await fetchTenantData<StudentReport>(
          `/attendance/student-report?studentId=${encodeURIComponent(studentId)}&fromDate=${fromDate}&toDate=${toDate}&rangeType=${rangeType}`,
          token,
          schoolId
        );
        setStudentReport(report);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load attendance report");
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    const source = studentReport ? [studentReport] : classRows;
    const total = source.reduce((sum, row: any) => sum + Number(row.totalWorkingDays ?? row.totalDays ?? 0), 0);
    const present = source.reduce((sum, row: any) => sum + Number(row.presentDays ?? 0), 0);
    const absent = source.reduce((sum, row: any) => sum + Number(row.absentDays ?? 0), 0);
    const late = source.reduce((sum, row: any) => sum + Number(row.lateDays ?? 0), 0);
    const percent = total ? Math.round(((present + late) * 1000) / total) / 10 : 0;
    return { total, present, absent, late, percent };
  }, [classRows, studentReport]);

  const dailyRows = studentReport?.dailyRecords || [];

  return (
    <PortalShell role="ADMIN" title="Attendance Reports" subtitle="Daily, weekly, monthly, class/section, and student attendance operations." variant="gold">
      <ShellStyles />
      <main className="report-page">
        <section className="report-hero">
          <div>
            <p className="eyebrow">Attendance Reports Center</p>
            <h1>Selection-driven attendance reports</h1>
            <p>Choose a real tenant class, section, and optionally a student. Reports remain hidden until the required selections are made.</p>
          </div>
          <div className="tenant-pill">{schoolId}</div>
        </section>

        <section className="filter-card">
          <label>
            Report Date
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
          </label>
          <label>
            Range
            <select value={rangeType} onChange={(e) => setRangeType(e.target.value as ReportRange)}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </label>
          <label>
            Class
            <select value={className} onChange={(e) => setClassName(e.target.value)}>
              <option value="">Select class</option>
              {classes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            Section
            <select value={section} onChange={(e) => setSection(e.target.value)} disabled={!className}>
              <option value="">Select section</option>
              {sections.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="student-search">
            Student Search
            <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search student name / admission no" disabled={!className || !section} />
          </label>
          <label>
            Student
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!students.length}>
              <option value="">Whole section summary</option>
              {students.map((s) => (
                <option key={s.studentId} value={s.studentId}>{s.studentName} {s.admissionNumber ? `• ${s.admissionNumber}` : ""}</option>
              ))}
            </select>
          </label>
          <button className="primary-button" disabled={!hasRequiredSelection || loading} onClick={loadReport}>{loading ? "Loading..." : "Generate report"}</button>
        </section>

        {error && <div className="error-card">{error}</div>}

        {!hasRequiredSelection && (
          <section className="empty-card">
            Select a class and section to load real attendance reports. Mock records are removed from this production page.
          </section>
        )}

        {hasRequiredSelection && !classRows.length && !studentReport && !loading && !error && (
          <section className="empty-card">Click Generate report to view attendance data for {className}-{section}.</section>
        )}

        {(classRows.length > 0 || studentReport) && (
          <>
            <section className="metric-grid">
              <article><span>Scope</span><strong>{studentReport ? selectedStudent?.studentName || studentReport.studentName : `${className}-${section}`}</strong><small>{rangeType}: {fromDate} to {toDate}</small></article>
              <article><span>Present</span><strong>{totals.present}</strong><small>Late counted in coverage separately</small></article>
              <article><span>Absent</span><strong>{totals.absent}</strong><small>From marked attendance records</small></article>
              <article><span>Coverage</span><strong>{totals.percent}%</strong><small>{totals.total} total working/marked days</small></article>
            </section>

            <section className="records-card">
              <div className="records-header">
                <div>
                  <p className="eyebrow">Records</p>
                  <h2>{studentReport ? "Student attendance drilldown" : "Class-section attendance summary"}</h2>
                </div>
                <div className="action-row">
                  <button onClick={() => exportCsv("attendance-report.csv", studentReport ? dailyRows.map((r) => ({ Date: r.date || r.attendanceDate, Status: r.status, Subject: r.subjectName, Teacher: r.teacherName })) : classRows.map((r) => ({ Student: r.studentName, Class: r.className, Section: r.section, Total: r.totalDays, Present: r.presentDays, Absent: r.absentDays, Percentage: r.attendancePercentage })))}>Export Excel/CSV</button>
                  <button onClick={() => window.print()}>Export PDF</button>
                </div>
              </div>

              {!studentReport && (
                <table>
                  <thead><tr><th>Student</th><th>Class</th><th>Section</th><th>Total</th><th>Present</th><th>Absent</th><th>%</th></tr></thead>
                  <tbody>
                    {classRows.map((row) => <tr key={row.studentId}><td>{row.studentName}</td><td>{row.className}</td><td>{row.section}</td><td>{row.totalDays}</td><td>{row.presentDays}</td><td>{row.absentDays}</td><td>{Math.round(row.attendancePercentage)}%</td></tr>)}
                  </tbody>
                </table>
              )}

              {studentReport && (
                <table>
                  <thead><tr><th>Date</th><th>Status</th><th>Subject</th><th>Teacher</th></tr></thead>
                  <tbody>
                    {dailyRows.map((row, idx) => <tr key={`${row.date || row.attendanceDate}-${idx}`}><td>{row.date || row.attendanceDate}</td><td>{row.status}</td><td>{row.subjectName || "-"}</td><td>{row.teacherName || "-"}</td></tr>)}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </main>
      <style jsx>{`
        .report-page { display: grid; gap: 18px; }
        .report-hero, .filter-card, .records-card, .empty-card, .error-card { border: 1px solid rgba(244, 213, 141, .18); background: rgba(8, 18, 28, .82); border-radius: 18px; padding: 20px; box-shadow: 0 20px 60px rgba(0,0,0,.25); }
        .report-hero { display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .report-hero h1, .records-card h2 { margin: 4px 0 8px; color: #ffe7a3; }
        .report-hero p, .empty-card, .error-card, small { color: rgba(255,255,255,.72); }
        .eyebrow { margin:0; text-transform: uppercase; letter-spacing:.14em; color:#f4d58d; font-size:12px; font-weight:700; }
        .tenant-pill { border:1px solid rgba(244,213,141,.4); color:#ffe7a3; border-radius:999px; padding:8px 14px; font-weight:700; }
        .filter-card { display:grid; grid-template-columns: repeat(3, minmax(180px, 1fr)); gap:16px; align-items:end; }
        label { display:grid; gap:8px; color:#f4d58d; font-size:12px; font-weight:700; letter-spacing:.04em; }
        input, select { width:100%; border:1px solid rgba(244,213,141,.22); border-radius:12px; padding:12px 13px; color:white; background:rgba(4,12,20,.82); outline:none; }
        .student-search { grid-column: span 2; }
        button { border:1px solid rgba(244,213,141,.28); border-radius:12px; padding:12px 14px; background:rgba(255,255,255,.06); color:#ffe7a3; font-weight:800; cursor:pointer; }
        button:disabled { opacity:.45; cursor:not-allowed; }
        .primary-button { background: linear-gradient(135deg, rgba(244,213,141,.28), rgba(244,213,141,.08)); }
        .metric-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:14px; }
        .metric-grid article { border:1px solid rgba(244,213,141,.15); background:rgba(8,18,28,.78); border-radius:16px; padding:18px; display:grid; gap:8px; }
        .metric-grid span { color:#f4d58d; font-size:12px; text-transform:uppercase; letter-spacing:.08em; }
        .metric-grid strong { color:#fff; font-size:26px; }
        .records-header { display:flex; justify-content:space-between; gap:16px; align-items:center; margin-bottom:14px; }
        .action-row { display:flex; gap:10px; flex-wrap:wrap; }
        table { width:100%; border-collapse:collapse; color:white; }
        th { color:#f4d58d; font-size:12px; text-align:left; letter-spacing:.08em; text-transform:uppercase; }
        td, th { border-bottom:1px solid rgba(244,213,141,.1); padding:13px 10px; }
        .error-card { border-color: rgba(255, 99, 99, .4); color:#ffb4b4; }
        @media (max-width: 980px) { .filter-card, .metric-grid { grid-template-columns:1fr; } .student-search { grid-column:auto; } .records-header, .report-hero { align-items:flex-start; flex-direction:column; } }
      `}</style>
    </PortalShell>
  );
}
