import Link from 'next/link';
import MetricCard from '@/components/ui/MetricCard';
import type { PortalRole } from '@/lib/routes';

const roleCopy = {
  ADMIN: {
    title: 'Admin Web ERP Home',
    subtitle: 'School setup, imports, timetable operations, reports, notices, and admin-controlled workflows.',
    metrics: [['School Setup', 'Ready', 'Import and onboarding shell'], ['Timetable Ops', 'Live', 'Batch center foundation'], ['Reports', 'Ready', 'Attendance and teacher pages'], ['SaaS Guard', 'P0', 'RBAC + school_id isolation']],
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
    metrics: [['Executive View', 'Ready', 'Principal command shell'], ['Attendance Pulse', 'Live', 'Summary API-ready'], ['Teacher Load', 'Watch', 'Workload and replacement focus'], ['Pilot', '14 days', 'First-school readiness']],
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
    title: 'Teacher Web Home',
    subtitle: 'Web support for teacher leave enquiry and controlled missed attendance recovery. Daily attendance remains mobile-first.',
    metrics: [['Leave Enquiry', 'Ready', 'Request-only teacher flow'], ['Bulk Import', '7 days', 'Working-day recovery'], ['RBAC', 'Teacher', 'Role-restricted pages'], ['Mobile First', 'Daily', 'Normal attendance path']],
    actions: [
      ['/teacher/leave-enquiry', '📝', 'Request Leave Enquiry', 'Submit leave enquiry for Admin/Principal approval.'],
      ['/teacher/attendance-bulk', '✅', 'Missed Attendance Bulk Submission', 'Recover attendance for up to 7 working days from web.'],
    ],
  },
  STUDENT: {
    title: 'Student Web Home',
    subtitle: 'Student web access foundation. Parent login remains intentionally ignored for this Day 30 scope.',
    metrics: [['Attendance', 'Soon', 'Student view foundation'], ['Timetable', 'Soon', 'Published schedule visibility'], ['Results', 'Soon', 'Academic overview'], ['Notices', 'Soon', 'School alerts']],
    actions: [
      ['/student', '🎓', 'Student Overview', 'Foundation page for future student attendance, results, timetable, and notices.'],
    ],
  },
} satisfies Record<PortalRole, { title: string; subtitle: string; metrics: string[][]; actions: string[][] }>;

export default function DashboardHome({ role }: { role: PortalRole }) {
  const copy = roleCopy[role];

  return (
    <>
      <div className="dashboard-grid">
        {copy.metrics.map(([label, value, helper], index) => (
          <MetricCard key={label} label={label} value={value} helper={helper} tone={index === 1 ? 'success' : 'gold'} />
        ))}
      </div>
      <section className="work-panel gold-panel">
        <p className="eyebrow">DAY 30 WEB PORTAL</p>
        <h2>{copy.title}</h2>
        <p>{copy.subtitle}</p>
        <div className="action-grid">
          {copy.actions.map(([href, icon, title, description]) => (
            <Link className="action-card" href={href} key={href}><span>{icon}</span><strong>{title}</strong><span>{description}</span></Link>
          ))}
        </div>
      </section>
    </>
  );
}
