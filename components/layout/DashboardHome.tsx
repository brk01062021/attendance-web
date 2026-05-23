import Link from 'next/link';
import MetricCard from '@/components/ui/MetricCard';
import type { PortalRole } from '@/lib/routes';

type Metric = { label: string; value: string; helper: string; tone?: 'success' | 'warning' | 'danger' | 'gold' };
type Action = [string, string, string, string];

const roleCopy = {
  ADMIN: {
    title: 'Admin Web ERP Home',
    subtitle: 'School setup, imports, timetable operations, reports, notices, and admin-controlled workflows.',
    metrics: [
      { label: 'School Setup', value: 'Ready', helper: 'Import and onboarding shell', tone: 'success' },
      { label: 'Timetable Ops', value: 'Live', helper: 'Batch center foundation', tone: 'success' },
      { label: 'Reports', value: 'Ready', helper: 'Attendance and teacher pages', tone: 'gold' },
      { label: 'SaaS Guard', value: 'P0', helper: 'RBAC + school_id isolation', tone: 'warning' },
    ],
    actions: [
      ['/import-school-data', '📥', 'Import School Data', 'Excel onboarding workflow for school profile, users, classes, sections, subjects, holidays, and teacher pools.'],
      ['/teacher-leave', '🗓️', 'Leave Approvals', 'Approve teacher leave enquiries and start replacement workflow.'],
      ['/reports/attendance', '📊', 'Reports & Intelligence', 'Attendance, teacher reports, workload, and executive dashboards with role-aware navigation.'],
      ['/analytics', '📈', 'Operational Analytics', 'Attendance trends, class/section comparisons, teacher load, and risk signals for demos.'],
      ['/timetable/operations', '🕒', 'Timetable Operations', 'Batch review, rollout readiness, publish readiness, export foundation, and live timetable visibility.'],
      ['/production-hardening', '🛡️', 'Production Hardening', 'RBAC, school_id isolation, route planning, pilot gates, and deployment readiness.'],
    ],
  },
  PRINCIPAL: {
    title: 'Principal Web ERP Home',
    subtitle: 'Executive school intelligence, operational reports, timetable visibility, and approvals.',
    metrics: [
      { label: 'Executive View', value: 'Ready', helper: 'Principal command shell', tone: 'success' },
      { label: 'Attendance Pulse', value: 'Live', helper: 'Summary API-ready', tone: 'success' },
      { label: 'Teacher Load', value: 'Watch', helper: 'Workload and replacement focus', tone: 'warning' },
      { label: 'Pilot', value: '14 days', helper: 'First-school readiness', tone: 'gold' },
    ],
    actions: [
      ['/school-intelligence', '🧠', 'School Intelligence', 'Executive insights and operational visibility.'],
      ['/teacher-leave', '🗓️', 'Leave Approvals', 'Review teacher leave enquiries and approve/reject.'],
      ['/reports/attendance', '📊', 'Attendance Reports', 'Whole-school attendance views.'],
      ['/reports/teachers', '👨‍🏫', 'Teacher Reports', 'Teacher workload and records.'],
      ['/analytics', '📈', 'Operational Analytics', 'Class/section comparisons and risk signals.'],
      ['/school-notices', '📣', 'Create School Notice', 'Announcements and alerts.'],
    ],
  },
  TEACHER: {
    title: 'Teacher Web Portal',
    subtitle: 'Premium teacher workspace matching mobile flow: attendance, timetable, leave enquiry, notifications, results, and 7-day missed attendance recovery.',
    metrics: [
      { label: 'Leave Enquiry', value: 'Track', helper: 'History, remarks and timeline', tone: 'success' },
      { label: 'Notifications', value: 'Live', helper: 'Approval/rejection updates', tone: 'gold' },
      { label: 'Bulk Import', value: '7 days', helper: 'Working-day recovery', tone: 'warning' },
      { label: 'RBAC', value: 'Teacher', helper: 'Role-restricted pages only', tone: 'success' },
    ],
    actions: [
      ['/teacher/leave-enquiry', '📝', 'Request Leave Enquiry', 'Submit leave enquiry and track Pending/Approved/Rejected status with Admin/Principal remarks.'],
      ['/teacher/attendance-bulk', '✅', 'Missed Attendance Bulk Submission', 'Recover attendance for up to 7 working days from web.'],
      ['/teacher', '📅', 'My Timetable', 'View today schedule, assigned classes, periods, and replacement responsibilities.'],
      ['/teacher', '👩‍🏫', 'My Classes & Subjects', 'Class-section-subject assignments in a teacher-friendly mobile-parity card flow.'],
      ['/teacher', '🧾', 'Results Submission', 'Placeholder for marks entry and exam result submission workflow.'],
      ['/teacher/leave-enquiry#notifications', '🔔', 'Teacher Notifications', 'See leave approval/rejection updates from Admin/Principal.'],
    ],
  },
  STUDENT: {
    title: 'Student Web Portal',
    subtitle: 'Student web expansion for attendance, timetable, results, notices, homework/assignments, and academic progress visibility.',
    metrics: [
      { label: 'Attendance', value: 'View', helper: 'Monthly and weekly overview', tone: 'success' },
      { label: 'Timetable', value: 'Live', helper: 'Published schedule visibility', tone: 'gold' },
      { label: 'Results', value: 'Track', helper: 'Academic overview', tone: 'warning' },
      { label: 'Notices', value: 'Alerts', helper: 'School updates', tone: 'success' },
    ],
    actions: [
      ['/student', '📊', 'My Attendance', 'Attendance percentage, absent days, late marks, and monthly trend cards.'],
      ['/student', '🕒', 'My Timetable', 'Published class timetable with holiday and replacement visibility.'],
      ['/student', '📘', 'Exam Results', 'Subject-wise marks, grades, and improvement areas.'],
      ['/student', '📣', 'School Notices', 'Announcements, holiday notices, and academic calendar alerts.'],
      ['/student', '📝', 'Assignments', 'Homework and assignment summary placeholder for pilot expansion.'],
      ['/student', '🏆', 'Achievements', 'Academic and school achievement visibility.'],
    ],
  },
} satisfies Record<PortalRole, { title: string; subtitle: string; metrics: Metric[]; actions: Action[] }>;

export default function DashboardHome({ role }: { role: PortalRole }) {
  const copy = roleCopy[role];

  return (
    <>
      <div className="dashboard-grid">
        {copy.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <section className="work-panel glass-panel premium-panel">
        <p className="eyebrow">DAY 31 PRODUCTION POLISH</p>
        <h2>{copy.title}</h2>
        <p>{copy.subtitle}</p>
        <div className="action-grid">
          {copy.actions.map(([href, icon, title, description], index) => (
            <Link className="action-card action-card--glass" href={href} key={`${role}-${href}-${title}-${index}`}>
              <span className="action-card-icon">{icon}</span>
              <strong>{title}</strong>
              <span>{description}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
