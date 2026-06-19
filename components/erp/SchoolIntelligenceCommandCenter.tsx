'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { activityApi } from '@/lib/activityApi';
import { webApi } from '@/lib/apiClient';
import { getStoredUser, isValidTenantUser } from '@/lib/auth';

type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T } | T;

type ActivationSummary = {
  schoolId: string;
  schoolName?: string;
  academicYear?: string;
  activationStatus?: string;
  readinessPercent?: number;
  importCommitted?: boolean;
  tenantActive?: boolean;
  goLiveStatus?: string;
};

type TimetableImportStatus = {
  status?: string;
  label?: string;
  message?: string;
  importBatchId?: string;
  publishedBatchId?: string;
  activeBatchId?: string;
  totalClasses?: number;
  totalSections?: number;
  totalTeachers?: number;
  totalPeriodAllocations?: number;
};

type AdminAttendanceSummary = {
  totalStudents?: number;
  presentCount?: number;
  absentCount?: number;
  attendancePercentage?: number;
  percentage?: number;
};

type PrincipalSummary = {
  totalStudents?: number;
  totalTeachers?: number;
  presentStudents?: number;
  absentStudents?: number;
  attendancePercentage?: number;
  pendingLeaveRequests?: number;
};

type ImportWorkbookHistoryItem = {
  status?: string;
  totalRows?: number;
  rows?: number;
};

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload && (payload as { data?: T }).data) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function numeric(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function percent(value: unknown) {
  const parsed = numeric(value, 0);
  if (parsed <= 0) return '0%';
  return `${Math.round(parsed)}%`;
}

function isPublishedTimetable(status?: TimetableImportStatus | null) {
  const state = String(status?.status || status?.label || '').toUpperCase();
  return state.includes('PUBLISHED') || state.includes('AVAILABLE') || numeric(status?.totalPeriodAllocations) > 0;
}

export default function SchoolIntelligenceCommandCenter() {
  const [activation, setActivation] = useState<ActivationSummary | null>(null);
  const [timetable, setTimetable] = useState<TimetableImportStatus | null>(null);
  const [adminAttendance, setAdminAttendance] = useState<AdminAttendanceSummary | null>(null);
  const [principalSummary, setPrincipalSummary] = useState<PrincipalSummary | null>(null);
  const [workbookHistory, setWorkbookHistory] = useState<ImportWorkbookHistoryItem[]>([]);
  const [publishedActivities, setPublishedActivities] = useState(0);
  const [pendingActivities, setPendingActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const stored = getStoredUser();
    if (!isValidTenantUser(stored) || !['ADMIN', 'PRINCIPAL'].includes(stored.role)) {
      setError('School Intelligence is available only for Admin and Principal users.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const date = todayIso();

    const [activationResult, timetableResult, adminAttendanceResult, principalResult, historyResult, feedResult, pendingResult] = await Promise.allSettled([
      webApi.workspaceActivationSummary<ApiEnvelope<ActivationSummary>>(stored.schoolId, stored.token),
      webApi.existingTimetableImportStatus<TimetableImportStatus>(stored.token, stored.schoolId),
      webApi.adminSummary<AdminAttendanceSummary>(date, stored.token, stored.schoolId),
      webApi.principalSummary<PrincipalSummary>(date, stored.token, stored.schoolId),
      webApi.importWorkbookHistory<ImportWorkbookHistoryItem[]>(stored.schoolId, stored.token),
      activityApi.feed(stored.schoolId, 0, 20),
      activityApi.pending(stored.schoolId),
    ]);

    if (activationResult.status === 'fulfilled') setActivation(unwrap(activationResult.value));
    if (timetableResult.status === 'fulfilled') setTimetable(timetableResult.value);
    if (adminAttendanceResult.status === 'fulfilled') setAdminAttendance(adminAttendanceResult.value);
    if (principalResult.status === 'fulfilled') setPrincipalSummary(principalResult.value);
    if (historyResult.status === 'fulfilled' && Array.isArray(historyResult.value)) setWorkbookHistory(historyResult.value);
    if (feedResult.status === 'fulfilled') setPublishedActivities(feedResult.value.length);
    if (pendingResult.status === 'fulfilled') setPendingActivities(pendingResult.value.length);

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const attendanceTotal = numeric(adminAttendance?.totalStudents || principalSummary?.totalStudents);
  const attendancePresent = numeric(adminAttendance?.presentCount || principalSummary?.presentStudents);
  const attendanceAbsent = numeric(adminAttendance?.absentCount || principalSummary?.absentStudents);
  const attendanceRate = adminAttendance?.attendancePercentage ?? adminAttendance?.percentage ?? principalSummary?.attendancePercentage;
  const totalTeachers = numeric(principalSummary?.totalTeachers || timetable?.totalTeachers);
  const totalClasses = numeric(timetable?.totalClasses);
  const totalSections = numeric(timetable?.totalSections);
  const totalPeriods = numeric(timetable?.totalPeriodAllocations);
  const timetablePublished = isPublishedTimetable(timetable);
  const latestCommittedWorkbook = workbookHistory.find((item) => String(item.status || '').toUpperCase().includes('COMMITTED'));

  const alerts = useMemo(() => {
    const items: Array<{ tone: 'success' | 'warning' | 'danger'; title: string; message: string }> = [];

    if (timetablePublished) {
      items.push({ tone: 'success', title: 'Timetable ready', message: `${totalPeriods || 0} active period allocations are available for school operations.` });
    } else {
      items.push({ tone: 'danger', title: 'Timetable not visible', message: 'Publish or refresh the active timetable before attendance rollout.' });
    }

    if (pendingActivities > 0) {
      items.push({ tone: 'warning', title: 'Activity approvals pending', message: `${pendingActivities} teacher-submitted activity request(s) need review.` });
    } else {
      items.push({ tone: 'success', title: 'Activity approvals clear', message: 'No activity approval backlog is currently visible.' });
    }

    if (numeric(activation?.readinessPercent) >= 100) {
      items.push({ tone: 'success', title: 'Workspace ready', message: 'Workspace setup and workbook commit readiness are complete.' });
    } else {
      items.push({ tone: 'warning', title: 'Workspace readiness review', message: 'Complete remaining workspace readiness gates before production onboarding.' });
    }

    if (attendanceRate && numeric(attendanceRate) > 0 && numeric(attendanceRate) < 85) {
      items.push({ tone: 'danger', title: 'Attendance risk', message: `Current attendance is ${percent(attendanceRate)}. Principal review is recommended.` });
    }

    return items;
  }, [activation?.readinessPercent, attendanceRate, pendingActivities, timetablePublished, totalPeriods]);

  return (
    <div className="space-y-6">
      <style jsx>{`
        .panel { border: 1px solid rgba(212,175,55,.2); background: #0d1724; border-radius: 28px; padding: 24px; }
        .grid { display: grid; gap: 16px; }
        .kpi-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .two-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .card { border: 1px solid rgba(212,175,55,.12); background: #08131f; border-radius: 22px; padding: 18px; }
        .label { color: rgba(212,175,55,.72); font-size: 11px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; }
        .value { color: #f8f3df; font-size: 30px; font-weight: 900; line-height: 1.1; margin-top: 10px; }
        .helper { color: rgba(248,243,223,.66); font-size: 13px; line-height: 1.5; margin-top: 8px; }
        .pill { display: inline-flex; border-radius: 999px; padding: 7px 10px; font-size: 11px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
        .success { background: rgba(24,128,74,.18); color: #bff3d4; border: 1px solid rgba(24,128,74,.28); }
        .warning { background: rgba(178,122,28,.18); color: #ffe5a3; border: 1px solid rgba(178,122,28,.3); }
        .danger { background: rgba(170,55,45,.2); color: #ffd6ce; border: 1px solid rgba(170,55,45,.32); }
        .table { width: 100%; border-collapse: collapse; }
        .table th { color: rgba(212,175,55,.74); font-size: 11px; letter-spacing: .18em; text-transform: uppercase; text-align: left; padding: 12px; border-bottom: 1px solid rgba(212,175,55,.12); }
        .table td { color: #f8f3df; font-size: 14px; padding: 14px 12px; border-bottom: 1px solid rgba(212,175,55,.06); }
        .actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .button { border: 0; border-radius: 999px; padding: 11px 16px; background: linear-gradient(135deg,#8a5a13,#d49b28); color: #fff8db; font-weight: 900; cursor: pointer; }
        .button:disabled { opacity: .58; cursor: not-allowed; }
        @media (max-width: 900px) { .kpi-grid, .two-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="panel">
        <div className="actions" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="label">School Intelligence</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#f8f3df]">Principal/Admin Command Center</h2>
            <p className="helper max-w-4xl">
              Daily school health snapshot for attendance pulse, timetable readiness, teacher workload, communication activity, and operational alerts.
            </p>
          </div>
          <button className="button" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh Intelligence'}</button>
        </div>
        {error ? <p className="helper danger mt-4 rounded-2xl p-3">{error}</p> : null}
      </section>

      <section className="grid kpi-grid">
        <div className="card"><p className="label">Workspace</p><p className="value">{activation?.activationStatus || 'ACTIVE'}</p><p className="helper">Readiness {numeric(activation?.readinessPercent)}%</p></div>
        <div className="card"><p className="label">Students</p><p className="value">{attendanceTotal || '—'}</p><p className="helper">Present {attendancePresent || 0} • Absent {attendanceAbsent || 0}</p></div>
        <div className="card"><p className="label">Teachers</p><p className="value">{totalTeachers || '—'}</p><p className="helper">From principal summary or active timetable</p></div>
        <div className="card"><p className="label">Timetable</p><p className="value">{timetablePublished ? 'LIVE' : 'NO'}</p><p className="helper">{totalPeriods || 0} period allocations</p></div>
      </section>

      <section className="grid two-grid">
        <div className="panel">
          <p className="label">Attendance Pulse</p>
          <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">Today&apos;s attendance health</h3>
          <div className="grid two-grid mt-4">
            <div className="card"><p className="label">Attendance Rate</p><p className="value">{percent(attendanceRate)}</p><p className="helper">Whole-school current day signal</p></div>
            <div className="card"><p className="label">Absent Students</p><p className="value">{attendanceAbsent || 0}</p><p className="helper">Use Attendance Reports for drilldown</p></div>
          </div>
        </div>

        <div className="panel">
          <p className="label">Timetable Health</p>
          <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">Active published timetable</h3>
          <div className="grid two-grid mt-4">
            <div className="card"><p className="label">Batch</p><p className="value" style={{ fontSize: 18 }}>{timetable?.publishedBatchId || timetable?.activeBatchId || timetable?.importBatchId || '—'}</p><p className="helper">Published/import batch used by live timetable</p></div>
            <div className="card"><p className="label">Structure</p><p className="value" style={{ fontSize: 22 }}>{totalClasses || 0} / {totalSections || 0}</p><p className="helper">Classes / sections detected</p></div>
          </div>
        </div>
      </section>

      <section className="grid two-grid">
        <div className="panel">
          <p className="label">Communication Pulse</p>
          <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">School activity and approvals</h3>
          <div className="grid two-grid mt-4">
            <div className="card"><p className="label">Published Activities</p><p className="value">{publishedActivities}</p><p className="helper">Visible in activity feed</p></div>
            <div className="card"><p className="label">Pending Approvals</p><p className="value">{pendingActivities}</p><p className="helper">Principal/Admin review queue</p></div>
          </div>
        </div>

        <div className="panel">
          <p className="label">Workbook Pulse</p>
          <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">Latest committed import</h3>
          <div className="grid two-grid mt-4">
            <div className="card"><p className="label">Commit Status</p><p className="value">{activation?.importCommitted || latestCommittedWorkbook ? 'OK' : 'WAIT'}</p><p className="helper">Workbook commit gate</p></div>
            <div className="card"><p className="label">Rows</p><p className="value">{numeric(latestCommittedWorkbook?.totalRows || latestCommittedWorkbook?.rows) || '—'}</p><p className="helper">Latest committed workbook rows</p></div>
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="label">Operational Alerts</p>
        <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">What needs attention now</h3>
        <div className="grid two-grid mt-4">
          {alerts.map((alert) => (
            <div className="card" key={alert.title}>
              <span className={`pill ${alert.tone}`}>{alert.tone === 'success' ? 'Healthy' : alert.tone === 'warning' ? 'Review' : 'Action'}</span>
              <h4 className="mt-3 text-lg font-semibold text-[#f8f3df]">{alert.title}</h4>
              <p className="helper">{alert.message}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="label">Decision Table</p>
        <h3 className="mt-2 text-xl font-semibold text-[#f8f3df]">Principal/Admin daily review</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead><tr><th>Area</th><th>Signal</th><th>Owner</th><th>Decision</th></tr></thead>
            <tbody>
              <tr><td>Attendance</td><td>{attendanceRate ? `${percent(attendanceRate)} current pulse` : 'Awaiting attendance records'}</td><td>Principal</td><td>Open Attendance Reports</td></tr>
              <tr><td>Timetable</td><td>{timetablePublished ? `${totalPeriods} active periods` : 'Publish required'}</td><td>Admin</td><td>Open Active Published Timetable</td></tr>
              <tr><td>Activities</td><td>{pendingActivities} pending approvals</td><td>Principal/Admin</td><td>Review Activity Approvals</td></tr>
              <tr><td>Workspace</td><td>{numeric(activation?.readinessPercent)}% readiness</td><td>Admin</td><td>Open Workspace Health</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
