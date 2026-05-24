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
    title: 'Admin School Operations',
    subtitle: 'Manage school setup, attendance, leave approvals, reports, notices, timetable, and teacher assignments from one workspace.',
    focus: 'Use this dashboard to complete daily school operations and prepare real pilot-school data validation.',
    metrics: [
      { label: 'Today Attendance', value: 'Open', helper: 'Review class-wise attendance status', tone: 'info', trend: 'Today' },
      { label: 'Leave Approvals', value: 'Pending', helper: 'Approve or reject teacher leave enquiries', tone: 'warning', trend: 'Action' },
      { label: 'Teacher Workload', value: 'Review', helper: 'Check timetable and replacement load', tone: 'gold', trend: 'Daily' },
      { label: 'School Setup', value: 'Active', helper: 'Imports, subjects, sections, and assignments', tone: 'success', trend: 'Setup' },
    ],
    actions: [
      ['/import-school-data', '📥', 'Import School Data', 'Upload and validate school profile, users, classes, sections, subjects, holidays, and teacher pools.'],
      ['/teacher-leave', '🗓️', 'Leave Approvals', 'Review teacher leave enquiries and start replacement workflow after approval.'],
      ['/reports/attendance', '📊', 'Attendance Reports', 'View school, class, section, and student attendance reports.'],
      ['/reports/teachers', '👨‍🏫', 'Teacher Reports', 'Review teacher workload, attendance submission, leave, and replacement records.'],
      ['/timetable/operations', '🕒', 'Timetable Operations', 'Review, repair, publish, and manage school timetable batches.'],
      ['/school-notices', '📣', 'School Notices', 'Create holiday, academic, and operational notices.'],
    ],
    insights: [
      { label: 'Attendance Coverage', value: 'Needs Review', helper: 'Check pending classes before day close', tone: 'warning' },
      { label: 'Replacement Coverage', value: 'Available', helper: 'Assign replacements for approved leave', tone: 'info' },
      { label: 'Data Readiness', value: 'In Progress', helper: 'Validate school import data before rollout', tone: 'gold' },
    ],
    notifications: [
      { title: 'Pending approvals', message: 'Review teacher leave enquiries and replacement requirements.', tone: 'warning' },
      { title: 'School data validation', message: 'Confirm school_id, classes, sections, teachers, and timetable before pilot use.', tone: 'info' },
      { title: 'Notice control', message: 'Holiday and academic notices remain controlled by Admin and Principal.', tone: 'success' },
    ],
  },
  PRINCIPAL: {
    title: 'Principal School Overview',
    subtitle: 'Monitor attendance, teacher availability, leave approvals, replacement coverage, notices, and academic operations.',
    focus: 'Use this dashboard for school-level decisions and daily operational visibility.',
    metrics: [
      { label: 'School Attendance', value: 'Review', helper: 'Whole-school attendance overview', tone: 'info', trend: 'Today' },
      { label: 'Teacher Availability', value: 'Check', helper: 'Leave, workload, and replacement coverage', tone: 'warning', trend: 'Daily' },
      { label: 'Leave Approvals', value: 'Open', helper: 'Approve or reject teacher requests', tone: 'gold', trend: 'Action' },
      { label: 'School Notices', value: 'Manage', helper: 'Publish academic and holiday updates', tone: 'success', trend: 'Notice' },
    ],
    actions: [
      ['/principal/intelligence', '🧠', 'School Intelligence', 'View school-level attendance, workload, and operational insights.'],
      ['/teacher-leave', '🗓️', 'Leave Approvals', 'Review teacher leave enquiries and approve or reject requests.'],
      ['/reports/attendance', '📊', 'Attendance Reports', 'Open class, section, and student attendance views.'],
      ['/reports/teachers', '👨‍🏫', 'Teacher Reports', 'Review teacher workload, classes, leaves, and replacement load.'],
      ['/analytics', '📈', 'Operational Analytics', 'Compare attendance trends, class sections, and school risk signals.'],
      ['/school-notices', '📣', 'Create School Notice', 'Publish announcements, holiday notices, and academic alerts.'],
    ],
    insights: [
      { label: 'Daily Attendance', value: 'Monitor', helper: 'Check pending and completed classes', tone: 'info' },
      { label: 'Teacher Coverage', value: 'Review', helper: 'Confirm replacements for approved leave', tone: 'warning' },
      { label: 'Parent Rollout', value: 'Controlled', helper: 'Enable only after pilot data signoff', tone: 'gold' },
    ],
    notifications: [
      { title: 'Morning review', message: 'Check attendance, teacher leave, and replacement coverage before school day starts.', tone: 'info' },
      { title: 'Workload check', message: 'Use teacher workload and timetable data before approving extended leave.', tone: 'warning' },
      { title: 'Notice publishing', message: 'Publish holiday and academic notices after Admin/Principal validation.', tone: 'success' },
    ],
  },
  TEACHER: {
    title: 'Teacher Daily Workspace',
    subtitle: 'Take attendance, view timetable, request leave enquiry, track approvals, manage replacements, and recover missed attendance.',
    focus: 'Use this dashboard for daily teacher work. Attendance, timetable, leave enquiry, and notifications are kept role-safe.',
    metrics: [
      { label: 'Take Attendance', value: 'Start', helper: 'Open today class attendance flow', tone: 'success', trend: 'Today' },
      { label: 'My Timetable', value: 'View', helper: 'Today schedule and assigned classes', tone: 'info', trend: 'Schedule' },
      { label: 'Leave Enquiry', value: 'Request', helper: 'Submit and track leave request status', tone: 'gold', trend: 'Action' },
      { label: 'Missed Attendance', value: 'Recover', helper: 'Bulk submit up to 7 working days', tone: 'warning', trend: 'Web' },
    ],
    actions: [
      ['/teacher/leave-enquiry', '📝', 'Request Leave Enquiry', 'Submit leave enquiry and track Pending, Approved, or Rejected status.'],
      ['/teacher/attendance-bulk', '✅', 'Recover Missed Attendance', 'Submit missed attendance records for recent working days from web.'],
      ['/teacher', '📅', 'My Timetable', 'View today schedule, assigned periods, and replacement responsibilities.'],
      ['/teacher', '🏫', 'My Classes', 'View assigned classes, sections, and subjects.'],
      ['/teacher', '🧾', 'Results Submission', 'Enter and review student exam results when enabled.'],
      ['/teacher/leave-enquiry#notifications', '🔔', 'Notifications', 'See leave approval, rejection, and school workflow updates.'],
    ],
    insights: [
      { label: 'Next Class', value: 'Check Timetable', helper: 'Open today schedule before attendance', tone: 'info' },
      { label: 'Leave History', value: 'Request Status', helper: 'View submitted requests and remarks', tone: 'success' },
      { label: 'Pending Attendance', value: 'Recover', helper: 'Use bulk entry for missed working days', tone: 'warning' },
    ],
    notifications: [
      { title: 'Leave status', message: 'Approved or rejected leave enquiries appear in the teacher leave page.', tone: 'info' },
      { title: 'Attendance reminder', message: 'Use missed attendance recovery when previous working-day submissions are pending.', tone: 'warning' },
      { title: 'Teacher profile', message: 'Teacher ID and school ID are bound from the login session.', tone: 'success' },
    ],
  },
  STUDENT: {
    title: 'Student Academic Workspace',
    subtitle: 'View attendance, timetable, exam results, notices, assignments, and academic progress in one simple portal.',
    focus: 'Use this dashboard to check daily timetable, attendance status, results, and school notices.',
    metrics: [
      { label: 'My Attendance', value: '94%', helper: 'Current attendance percentage', tone: 'success', trend: '+2%' },
      { label: 'Today Timetable', value: 'View', helper: 'Published class schedule', tone: 'info', trend: 'Today' },
      { label: 'Exam Results', value: 'Open', helper: 'Subject-wise academic record', tone: 'gold', trend: 'Term' },
      { label: 'School Notices', value: 'Alerts', helper: 'Holiday and academic updates', tone: 'warning', trend: 'New' },
    ],
    actions: [
      ['/student', '📊', 'My Attendance', 'Check attendance percentage, absent days, late marks, and monthly trend.'],
      ['/student', '🕒', 'My Timetable', 'View published class timetable and holiday changes.'],
      ['/student', '📘', 'Exam Results', 'Review subject marks, grades, and academic progress.'],
      ['/student', '📣', 'School Notices', 'Read announcements, holidays, and academic calendar updates.'],
      ['/student', '📝', 'Assignments', 'View homework and assignment summary when enabled.'],
      ['/student', '🏆', 'Achievements', 'View academic and school achievements.'],
    ],
    insights: [
      { label: 'Attendance Goal', value: '95%', helper: 'Monthly attendance goal', tone: 'success' },
      { label: 'Result Trend', value: 'Improving', helper: 'Review subject performance after exams', tone: 'info' },
      { label: 'Focus Subject', value: 'Maths', helper: 'Needs more practice based on latest results', tone: 'warning' },
    ],
    notifications: [
      { title: 'Attendance update', message: 'Attendance percentage updates after teacher submission.', tone: 'info' },
      { title: 'School notice', message: 'Holiday and academic notices appear here after publishing.', tone: 'gold' },
      { title: 'Academic progress', message: 'Use results and timetable together to plan daily study.', tone: 'success' },
    ],
  },
} satisfies Record<PortalRole, { title: string; subtitle: string; focus: string; metrics: Metric[]; actions: Action[]; insights: InsightItem[]; notifications: NotificationItem[] }>; 

export default function DashboardHome({ role }: { role: PortalRole }) {
  const copy = roleCopy[role];
  const focusTitle = role === 'ADMIN' ? 'Admin operations' : role === 'PRINCIPAL' ? 'Principal overview' : role === 'TEACHER' ? 'Teacher workflow' : 'Student progress';

  return (
    <>
      <section className="executive-hero glass-panel premium-panel">
        <div>
          <p className="eyebrow">{vidyaSetuTokens.copy.dashboardEyebrow}</p>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
          <div className="hero-chip-row">
            <span className="hero-chip">Today</span>
            <span className="hero-chip">My workflow</span>
            <span className="hero-chip">Notifications</span>
          </div>
        </div>
        <aside className="executive-focus-card">
          <span>Workspace</span>
          <strong>{focusTitle}</strong>
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
          <p className="eyebrow">WORKFLOW CENTER</p>
          <h2>{role === 'STUDENT' ? 'Student Actions' : role === 'TEACHER' ? 'Teacher Actions' : 'School Actions'}</h2>
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
          <p className="eyebrow">NOTIFICATIONS</p>
          <h2>{role === 'TEACHER' ? 'Teacher Notifications' : role === 'STUDENT' ? 'Student Alerts' : 'School Alerts'}</h2>
          <p>Role-specific updates and alerts appear here as backend notifications become available.</p>
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
