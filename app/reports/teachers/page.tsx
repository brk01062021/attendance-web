"use client";

import { useEffect, useMemo, useState } from "react";
import PortalShell from "@/components/layout/PortalShell";
import ShellStyles from "@/components/layout/ShellStyles";
import { getStoredUser } from "@/lib/auth";

type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T } | T;
type TeacherOption = { teacherId: number; teacherName: string };
type TeacherInsight = {
  teacherId: number;
  teacherName: string;
  classesHandled?: string[];
  sectionsHandled?: string[];
  subjectsHandled?: string[];
  plannedLeaves?: number;
  unplannedLeaves?: number;
  totalLeaves?: number;
  replacementAssignments?: number;
  attendanceSubmissions?: number;
  examResultSubmissions?: number;
};
type LeaveRow = { scheduleId: number; leaveDate: string; startTime?: string; endTime?: string; className?: string; section?: string; subjectName?: string; leaveType?: string; status?: string; replacementTeacherName?: string };
type ReplacementRow = { scheduleId: number; replacementDate: string; className?: string; section?: string; subjectName?: string; startTime?: string; endTime?: string; replacedTeacherName?: string; status?: string };
type AttendanceAuditRow = { scheduleId: number; attendanceDate: string; className?: string; section?: string; subjectName?: string; submittedTime?: string; status?: string; totalStudents?: number; presentStudents?: number; absentStudents?: number };
type ReportType = "Full Teacher Profile" | "Workload" | "Leaves" | "Replacement Load" | "Attendance Audit";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const reportTypes: ReportType[] = ["Full Teacher Profile", "Workload", "Leaves", "Replacement Load", "Attendance Audit"];

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  const fromDate = `${month}-01`;
  const toDate = new Date(year, m, 0).toISOString().slice(0, 10);
  return { fromDate, toDate };
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
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [reportType, setReportType] = useState<ReportType>("Full Teacher Profile");
  const [insight, setInsight] = useState<TeacherInsight | null>(null);
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [replacements, setReplacements] = useState<ReplacementRow[]>([]);
  const [auditRows, setAuditRows] = useState<AttendanceAuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedTeacher = useMemo(() => teachers.find((t) => String(t.teacherId) === teacherId), [teachers, teacherId]);
  const { fromDate, toDate } = useMemo(() => monthRange(month), [month]);

  useEffect(() => {
    const user = getStoredUser();
    setToken(user?.token);
    setSchoolId(user?.schoolId || "TST2");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchTenantData<TeacherOption[]>(`/api/operational-lookups/teachers/search?schoolId=${encodeURIComponent(schoolId)}&query=${encodeURIComponent(teacherSearch)}`, token, schoolId)
        .then(setTeachers)
        .catch((e) => setError(e.message));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [teacherSearch, schoolId, token]);

  async function loadReport() {
    if (!teacherId) return;
    setLoading(true);
    setError("");
    setInsight(null);
    setLeaves([]);
    setReplacements([]);
    setAuditRows([]);
    try {
      const base = `fromDate=${fromDate}&toDate=${toDate}&rangeType=Monthly`;
      const [summary, leaveRows, replacementRows, audit] = await Promise.all([
        fetchTenantData<TeacherInsight>(`/admin/reports/teacher-insight/${teacherId}?${base}`, token, schoolId),
        reportType === "Leaves" || reportType === "Full Teacher Profile" ? fetchTenantData<LeaveRow[]>(`/admin/reports/teacher/${teacherId}/leave-history?${base}`, token, schoolId) : Promise.resolve([]),
        reportType === "Replacement Load" || reportType === "Full Teacher Profile" ? fetchTenantData<ReplacementRow[]>(`/admin/reports/teacher/${teacherId}/replacement-history?${base}`, token, schoolId) : Promise.resolve([]),
        reportType === "Attendance Audit" || reportType === "Full Teacher Profile" ? fetchTenantData<AttendanceAuditRow[]>(`/admin/reports/teacher/${teacherId}/attendance-history?${base}`, token, schoolId) : Promise.resolve([]),
      ]);
      setInsight(summary);
      setLeaves(leaveRows);
      setReplacements(replacementRows);
      setAuditRows(audit);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load teacher report");
    } finally {
      setLoading(false);
    }
  }

  const csvRows = useMemo(() => {
    if (!insight) return [];
    if (reportType === "Leaves") return leaves.map((r) => ({ Date: r.leaveDate, Type: r.leaveType, Class: r.className, Section: r.section, Subject: r.subjectName, Status: r.status, Replacement: r.replacementTeacherName }));
    if (reportType === "Replacement Load") return replacements.map((r) => ({ Date: r.replacementDate, Class: r.className, Section: r.section, Subject: r.subjectName, ReplacedTeacher: r.replacedTeacherName, Status: r.status }));
    if (reportType === "Attendance Audit") return auditRows.map((r) => ({ Date: r.attendanceDate, Class: r.className, Section: r.section, Subject: r.subjectName, Time: r.submittedTime, Status: r.status, Present: r.presentStudents, Absent: r.absentStudents }));
    return [{ Teacher: insight.teacherName, Classes: (insight.classesHandled || []).join(" | "), Sections: (insight.sectionsHandled || []).join(" | "), Subjects: (insight.subjectsHandled || []).join(" | "), Leaves: insight.totalLeaves, Replacements: insight.replacementAssignments, AttendanceSubmissions: insight.attendanceSubmissions }];
  }, [insight, reportType, leaves, replacements, auditRows]);

  return (
    <PortalShell role="ADMIN" title="Teacher Reports" subtitle="Teacher workload, leave management, replacements, and academic activity operations." variant="gold">
      <ShellStyles />
      <main className="report-page">
        <section className="report-hero">
          <div>
            <p className="eyebrow">Teacher Reports Center</p>
            <h1>Selection-driven teacher reports</h1>
            <p>Search a real tenant teacher, select month and report type, then generate the report. Mock teacher rows are removed.</p>
          </div>
          <div className="tenant-pill">{schoolId}</div>
        </section>

        <section className="filter-card">
          <label className="teacher-search">
            Teacher Search
            <input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} placeholder="Search teacher name or ID" />
          </label>
          <label>
            Teacher
            <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
              <option value="">Select teacher</option>
              {teachers.map((teacher) => <option key={teacher.teacherId} value={teacher.teacherId}>{teacher.teacherName} • T{String(teacher.teacherId).padStart(3, "0")}</option>)}
            </select>
          </label>
          <label>
            Month
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
          <label>
            Report Type
            <select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
              {reportTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <button className="primary-button" disabled={!teacherId || loading} onClick={loadReport}>{loading ? "Loading..." : "Generate report"}</button>
        </section>

        {error && <div className="error-card">{error}</div>}
        {!teacherId && <section className="empty-card">Select a teacher to load production reports from real tenant teacher assignments and schedules.</section>}
        {teacherId && !insight && !loading && !error && <section className="empty-card">Click Generate report to view {selectedTeacher?.teacherName || "selected teacher"} for {month}.</section>}

        {insight && (
          <>
            <section className="metric-grid">
              <article><span>Teacher</span><strong>{insight.teacherName}</strong><small>{fromDate} to {toDate}</small></article>
              <article><span>Classes</span><strong>{insight.classesHandled?.length || 0}</strong><small>{(insight.classesHandled || []).join(", ") || "No classes assigned"}</small></article>
              <article><span>Subjects</span><strong>{insight.subjectsHandled?.length || 0}</strong><small>{(insight.subjectsHandled || []).join(", ") || "No subjects assigned"}</small></article>
              <article><span>Attendance Audit</span><strong>{insight.attendanceSubmissions || 0}</strong><small>Schedule/submission audit rows</small></article>
              <article><span>Leaves</span><strong>{insight.totalLeaves || 0}</strong><small>{insight.plannedLeaves || 0} planned, {insight.unplannedLeaves || 0} unplanned</small></article>
              <article><span>Replacement Load</span><strong>{insight.replacementAssignments || 0}</strong><small>Replacement assignments in selected month</small></article>
            </section>

            <section className="records-card">
              <div className="records-header">
                <div>
                  <p className="eyebrow">Records</p>
                  <h2>{reportType}</h2>
                </div>
                <div className="action-row">
                  <button onClick={() => exportCsv("teacher-report.csv", csvRows)}>Export Excel/CSV</button>
                  <button onClick={() => window.print()}>Export PDF</button>
                </div>
              </div>

              {(reportType === "Full Teacher Profile" || reportType === "Workload") && (
                <div className="profile-grid">
                  <div><b>Classes handled</b><p>{(insight.classesHandled || []).join(", ") || "-"}</p></div>
                  <div><b>Sections handled</b><p>{(insight.sectionsHandled || []).join(", ") || "-"}</p></div>
                  <div><b>Subjects handled</b><p>{(insight.subjectsHandled || []).join(", ") || "-"}</p></div>
                  <div><b>Exam/result actions</b><p>{insight.examResultSubmissions || 0}</p></div>
                </div>
              )}

              {(reportType === "Full Teacher Profile" || reportType === "Leaves") && (
                <ReportTable title="Leave History" headers={["Date", "Type", "Class", "Section", "Subject", "Status", "Replacement"]} empty="No leaves found for selected month." rows={leaves.map((r) => [r.leaveDate, r.leaveType, r.className, r.section, r.subjectName, r.status, r.replacementTeacherName])} />
              )}
              {(reportType === "Full Teacher Profile" || reportType === "Replacement Load") && (
                <ReportTable title="Replacement Load" headers={["Date", "Class", "Section", "Subject", "Replaced Teacher", "Status"]} empty="No replacement assignments found for selected month." rows={replacements.map((r) => [r.replacementDate, r.className, r.section, r.subjectName, r.replacedTeacherName, r.status])} />
              )}
              {(reportType === "Full Teacher Profile" || reportType === "Attendance Audit") && (
                <ReportTable title="Attendance Submission Audit" headers={["Date", "Class", "Section", "Subject", "Time", "Status", "Present", "Absent"]} empty="No attendance audit rows found for selected month." rows={auditRows.map((r) => [r.attendanceDate, r.className, r.section, r.subjectName, r.submittedTime, r.status, r.presentStudents, r.absentStudents])} />
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
        .report-hero p, .empty-card, .error-card, small, .profile-grid p { color: rgba(255,255,255,.72); }
        .eyebrow { margin:0; text-transform: uppercase; letter-spacing:.14em; color:#f4d58d; font-size:12px; font-weight:700; }
        .tenant-pill { border:1px solid rgba(244,213,141,.4); color:#ffe7a3; border-radius:999px; padding:8px 14px; font-weight:700; }
        .filter-card { display:grid; grid-template-columns: 2fr 2fr 1fr 1.3fr auto; gap:16px; align-items:end; }
        label { display:grid; gap:8px; color:#f4d58d; font-size:12px; font-weight:700; letter-spacing:.04em; }
        input, select { width:100%; border:1px solid rgba(244,213,141,.22); border-radius:12px; padding:12px 13px; color:white; background:rgba(4,12,20,.82); outline:none; }
        button { border:1px solid rgba(244,213,141,.28); border-radius:12px; padding:12px 14px; background:rgba(255,255,255,.06); color:#ffe7a3; font-weight:800; cursor:pointer; }
        button:disabled { opacity:.45; cursor:not-allowed; }
        .primary-button { background: linear-gradient(135deg, rgba(244,213,141,.28), rgba(244,213,141,.08)); }
        .metric-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; }
        .metric-grid article, .profile-grid div { border:1px solid rgba(244,213,141,.15); background:rgba(8,18,28,.78); border-radius:16px; padding:18px; display:grid; gap:8px; }
        .metric-grid span { color:#f4d58d; font-size:12px; text-transform:uppercase; letter-spacing:.08em; }
        .metric-grid strong { color:#fff; font-size:26px; }
        .records-header { display:flex; justify-content:space-between; gap:16px; align-items:center; margin-bottom:14px; }
        .action-row { display:flex; gap:10px; flex-wrap:wrap; }
        .profile-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap:14px; margin-bottom:18px; }
        .profile-grid b { color:#f4d58d; }
        table { width:100%; border-collapse:collapse; color:white; margin-bottom:20px; }
        th { color:#f4d58d; font-size:12px; text-align:left; letter-spacing:.08em; text-transform:uppercase; }
        td, th { border-bottom:1px solid rgba(244,213,141,.1); padding:13px 10px; }
        .subheading { color:#ffe7a3; margin:18px 0 10px; }
        .error-card { border-color: rgba(255, 99, 99, .4); color:#ffb4b4; }
        @media (max-width: 1100px) { .filter-card, .metric-grid, .profile-grid { grid-template-columns:1fr; } .records-header, .report-hero { align-items:flex-start; flex-direction:column; } }
      `}</style>
    </PortalShell>
  );
}

function ReportTable({ title, headers, rows, empty }: { title: string; headers: string[]; rows: (string | number | undefined | null)[][]; empty: string }) {
  return (
    <div>
      <h3 className="subheading">{title}</h3>
      {!rows.length ? <p>{empty}</p> : (
        <table>
          <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((row, idx) => <tr key={idx}>{row.map((cell, cellIdx) => <td key={cellIdx}>{cell ?? "-"}</td>)}</tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
