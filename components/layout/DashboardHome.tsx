import Link from 'next/link';
import MetricCard from '@/components/ui/MetricCard';
import type { PortalRole } from '@/lib/routes';
import { vidyaSetuTokens } from '@/lib/designTokens';

type Metric = {
  label: string;
  value: string;
  helper: string;
  tone?: 'success' | 'warning' | 'danger' | 'gold' | 'info' | 'neutral';
  trend?: string;
};
type Action = [string, string, string, string];
type NotificationItem = { title: string; message: string; tone: 'success' | 'warning' | 'danger' | 'gold' | 'info' };
type InsightItem = { label: string; value: string; helper: string; tone: 'success' | 'warning' | 'danger' | 'gold' | 'info' };

const roleCopy = {
  ADMIN: {
    title: 'Admin Executive Command Center',
    subtitle: 'Premium SaaS operations view for tenant setup, school readiness, attendance intelligence, approvals, and pilot hardening.',
    focus: 'Admin and Principal now share executive-grade visual hierarchy while preserving role permissions.',
    metrics: [
      { label: 'Tenant Readiness', value: '92%', helper: 'school_id, RBAC, onboarding gates', tone: 'success', trend: '+8%' },
      { label: 'Attendance Pulse', value: 'Live', helper: 'Whole-school operational view', tone: 'info', trend: 'Today' },
      { label: 'Approvals Queue', value: 'Watch', helper: 'Leave enquiries and replacements', tone: 'warning', trend: 'Action' },
      { label: 'Production Guard', value: 'P0', helper: 'Pilot readiness and hardening', tone: 'gold', trend: 'Core' },
    ],
    actions: [
      ['/import-school-data', '📥', 'Import School Data', 'Excel onboarding workflow for school profile, users, classes, sections, subjects, holidays, and teacher pools.'],
      ['/teacher-leave', '🗓️', 'Leave Approvals', 'Approve teacher leave enquiries and start replacement workflow.'],
      ['/reports/attendance', '📊', 'Reports & Intelligence', 'Attendance, teacher reports, workload, and executive dashboards with role-aware navigation.'],
      ['/analytics', '📈', 'Operational Analytics', 'Attendance trends, class/section comparisons, teacher load, and risk signals for demos.'],
      ['/timetable/operations', '🕒', 'Timetable Operations', 'Batch review, rollout readiness, publish readiness, export foundation, and live timetable visibility.'],
      ['/production-hardening', '🛡️', 'Production Hardening', 'RBAC, school_id isolation, route planning, pilot gates, and deployment readiness.'],
    ],
    insights: [
      { label: 'School Ops', value: 'Stable', helper: 'Imports, timetable, notices, reports aligned', tone: 'success' },
      { label: 'Risk Watch', value: 'Medium', helper: 'Validate real school data before parent rollout', tone: 'warning' },
      { label: 'Pilot Gate', value: 'Next', helper: 'One real school activation after Day 32 polish', tone: 'gold' },
    ],
    notifications: [
      { title: 'Leave approval workflow', message: 'Admin/Principal approval actions should trigger teacher status visibility and notifications.', tone: 'info' },
      { title: 'Pilot readiness', message: 'Keep parent access controlled until school data, timetable, and attendance flows are validated.', tone: 'warning' },
      { title: 'Design audit', message: 'Dark-glass cards and gold typography are now the default executive dashboard standard.', tone: 'success' },
    ],
  },
  PRINCIPAL: {
    title: 'Principal Executive Intelligence',
    subtitle: 'Principal-ready command center for daily school pulse, attendance, teacher load, approvals, and notices.',
    focus: 'Principal dashboard keeps Admin-level operational depth but with executive-first decision cards.',
    metrics: [
      { label: 'Executive View', value: 'Ready', helper: 'School intelligence and reports', tone: 'success', trend: 'Live' },
      { label: 'Attendance Pulse', value: 'Track', helper: 'Daily attendance action view', tone: 'info', trend: 'Daily' },
      { label: 'Teacher Load', value: 'Watch', helper: 'Workload and replacement load', tone: 'warning', trend: 'Ops' },
      { label: 'Pilot Window', value: '15d', helper: 'Real-school readiness target', tone: 'gold', trend: 'Target' },
    ],
    actions: [
      ['/school-intelligence', '🧠', 'School Intelligence', 'Executive insights and operational visibility.'],
      ['/teacher-leave', '🗓️', 'Leave Approvals', 'Review teacher leave enquiries and approve/reject.'],
      ['/reports/attendance', '📊', 'Attendance Reports', 'Whole-school attendance views.'],
      ['/reports/teachers', '👨‍🏫', 'Teacher Reports', 'Teacher workload and records.'],
      ['/analytics', '📈', 'Operational Analytics', 'Class/section comparisons and risk signals.'],
      ['/school-notices', '📣', 'Create School Notice', 'Announcements and alerts.'],
    ],
    insights: [
      { label: 'Decision Support', value: 'Ready', helper: 'Approvals, attendance, and workload in one flow', tone: 'success' },
      { label: 'Teacher Coverage', value: 'Monitor', helper: 'Replacement and leave visibility', tone: 'warning' },
      { label: 'Parent Rollout', value: 'Hold', helper: 'Enable only after pilot data signoff', tone: 'gold' },
    ],
    notifications: [
      { title: 'Morning operating pulse', message: 'Review attendance, teacher leave, and replacement status before school day starts.', tone: 'info' },
      { title: 'Teacher workload watch', message: 'Use replacement load and timetable data before approving extended leave.', tone: 'warning' },
      { title: 'Notice center ready', message: 'Holiday and academic notices remain admin/principal controlled.', tone: 'success' },
    ],
  },
  TEACHER: {
    title: 'Teacher Web Portal',
    subtitle: 'Premium teacher workspace matching mobile flow: attendance, timetable, leave enquiry, notifications, results, and 7-day missed attendance recovery.',
    focus: 'Teacher web now mirrors the mobile-first workflow with role-safe cards and notification visibility.',
    metrics: [
      { label: 'Leave Enquiry', value: 'Track', helper: 'History, remarks and timeline', tone: 'success', trend: 'Status' },
      { label: 'Notifications', value: 'Center', helper: 'Approval/rejection updates', tone: 'info', trend: 'Live' },
      { label: 'Bulk Import', value: '7 days', helper: 'Working-day recovery', tone: 'warning', trend: 'Web' },
      { label: 'RBAC', value: 'Teacher', helper: 'Role-restricted pages only', tone: 'gold', trend: 'Safe' },
    ],
    actions: [
      ['/teacher/leave-enquiry', '📝', 'Request Leave Enquiry', 'Submit leave enquiry and track Pending/Approved/Rejected status with Admin/Principal remarks.'],
      ['/teacher/attendance-bulk', '✅', 'Missed Attendance Bulk Submission', 'Recover attendance for up to 7 working days from web.'],
      ['/teacher', '📅', 'My Timetable', 'View today schedule, assigned classes, periods, and replacement responsibilities.'],
      ['/teacher', '👩‍🏫', 'My Classes & Subjects', 'Class-section-subject assignments in a teacher-friendly mobile-parity card flow.'],
      ['/teacher', '🧾', 'Results Submission', 'Placeholder for marks entry and exam result submission workflow.'],
      ['/teacher/leave-enquiry#notifications', '🔔', 'Teacher Notifications', 'See leave approval/rejection updates from Admin/Principal.'],
    ],
    insights: [
      { label: 'Next Period', value: 'Class 10A', helper: 'Timetable placeholder card', tone: 'info' },
      { label: 'Leave History', value: 'Visible', helper: 'Pending/Approved/Rejected timeline', tone: 'success' },
      { label: 'Missed Attendance', value: 'Recover', helper: 'Bulk upload flow remains web-first', tone: 'warning' },
    ],
    notifications: [
      { title: 'Leave status updates', message: 'Approved or rejected leave enquiries appear in the teacher leave page notification area.', tone: 'info' },
      { title: 'Attendance reminder', message: 'Use missed attendance bulk submission when working-day submissions are pending.', tone: 'warning' },
      { title: 'Mobile parity', message: 'Teacher web cards are aligned with the mobile dashboard flow.', tone: 'success' },
    ],
  },
  STUDENT: {
    title: 'Student Academic Progress Center',
    subtitle: 'Student web expansion for attendance, timetable, results, notices, assignments, and academic progress analytics cards.',
    focus: 'Student web now gets progress-oriented analytics cards while staying simple and mobile-friendly.',
    metrics: [
      { label: 'Attendance', value: '94%', helper: 'Monthly attendance health', tone: 'success', trend: '+2%' },
      { label: 'Timetable', value: 'Live', helper: 'Published schedule visibility', tone: 'info', trend: 'Today' },
      { label: 'Results', value: 'Track', helper: 'Academic overview', tone: 'gold', trend: 'Term' },
      { label: 'Notices', value: 'Alerts', helper: 'School updates', tone: 'warning', trend: 'New' },
    ],
    actions: [
      ['/student', '📊', 'My Attendance', 'Attendance percentage, absent days, late marks, and monthly trend cards.'],
      ['/student', '🕒', 'My Timetable', 'Published class timetable with holiday and replacement visibility.'],
      ['/student', '📘', 'Exam Results', 'Subject-wise marks, grades, and improvement areas.'],
      ['/student', '📣', 'School Notices', 'Announcements, holiday notices, and academic calendar alerts.'],
      ['/student', '📝', 'Assignments', 'Homework and assignment summary placeholder for pilot expansion.'],
      ['/student', '🏆', 'Achievements', 'Academic and school achievement visibility.'],
    ],
    insights: [
      { label: 'Attendance Goal', value: '95%', helper: 'One more strong week reaches target', tone: 'success' },
      { label: 'Result Trend', value: 'Improving', helper: 'Subject-wise analytics placeholder', tone: 'info' },
      { label: 'Focus Area', value: 'Maths', helper: 'Weak subject detection placeholder', tone: 'warning' },
    ],
    notifications: [
      { title: 'Academic progress', message: 'Attendance and result progress cards are ready for future backend hookup.', tone: 'info' },
      { title: 'School notice', message: 'Holiday and academic notices will appear here after publishing.', tone: 'gold' },
      { title: 'Student-safe UX', message: 'Cards keep simple language and strong contrast for student readability.', tone: 'success' },
    ],
  },
} satisfies Record<PortalRole, { title: string; subtitle: string; focus: string; metrics: Metric[]; actions: Action[]; insights: InsightItem[]; notifications: NotificationItem[] }>;

export default function DashboardHome({ role }: { role: PortalRole }) {
  const copy = roleCopy[role];
  const isExecutive = role === 'ADMIN' || role === 'PRINCIPAL';

  return (
    <>
      <section className="executive-hero glass-panel premium-panel">
        <div>
          <p className="eyebrow">{vidyaSetuTokens.copy.dashboardEyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
          <div className="hero-chip-row">
            <span className="hero-chip">Dark glass UI</span>
            <span className="hero-chip">Gold hierarchy</span>
            <span className="hero-chip">Role-safe navigation</span>
          </div>
        </div>
        <aside className="executive-focus-card">
          <span>{isExecutive ? 'Executive audit' : 'Role workspace'}</span>
          <strong>{isExecutive ? 'Production polish pass' : 'Portal parity pass'}</strong>
          <p>{copy.focus}</p>
        </aside>
      </section>

      <div className="dashboard-grid dashboard-grid--premium">
        {copy.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <section className="insight-grid">
        {copy.insights.map((item) => (
          <article className={`insight-card insight-card--${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.helper}</p>
          </article>
        ))}
      </section>

      <div className="two-column two-column--dashboard">
        <section className="work-panel glass-panel premium-panel">
          <p className="eyebrow">ROLE WORKFLOW CENTER</p>
          <h2>{role === 'STUDENT' ? 'Academic Actions' : role === 'TEACHER' ? 'Teacher Actions' : 'Executive Actions'}</h2>
          <p>{vidyaSetuTokens.copy.designNote}</p>
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

        <section className="work-panel glass-panel premium-panel notification-center-card" id="notifications">
          <p className="eyebrow">NOTIFICATION CENTER</p>
          <h2>{role === 'TEACHER' ? 'Teacher Notifications' : role === 'STUDENT' ? 'Student Alerts' : 'Executive Alerts'}</h2>
          <p>Day 32 UI architecture for consistent notification cards before full unread/read backend expansion.</p>
          <div className="notification-list">
            {copy.notifications.map((item) => (
              <article className={`notification-item notification-item--${item.tone}`} key={item.title}>
                <div className="notification-dot" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
