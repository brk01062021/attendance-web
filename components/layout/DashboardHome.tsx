import Link from 'next/link';
import type { PortalRole } from '@/lib/routes';

type Action = [string, string, string, string];
type UpdateItem = { title: string; message: string; tone: 'success' | 'warning' | 'danger' | 'gold' | 'info' };

const roleCopy = {
  ADMIN: {
    overviewTitle: 'Admin Operations',
    focus: 'Run daily school operations, monitor approvals, and manage school workflows from one calm workspace.',
    primaryActions: [
      ['/workspace-setup', '🧭', 'Workspace Setup', 'Complete setup progress and unlock Import School Data.'],
      ['/import-school-data', '📥', 'Import School Data', 'Locked until workspace setup is completed.'],
      ['/teacher-leave', '🗓️', 'Leave Approvals', 'Review teacher leave enquiries and begin replacement coverage after approval.'],
      ['/reports/attendance', '📊', 'Attendance Reports', 'Open school, class, section, and student attendance reports.'],
      ['/attendance-recovery', '🩹', 'Recover Missed Attendance', 'Validate and submit missed attendance records.'],
      ['/reports/teachers', '👨‍🏫', 'Teacher Reports', 'Review teacher workload, leave, submissions, and replacement records.'],
      ['/timetable/operations', '🕒', 'Timetable Operations', 'Review, repair, publish, and manage timetable batches.'],
      ['/school-notices', '📣', 'School Notices', 'Create academic, holiday, and operational notices.'],
      ['/school-activities', '🎉', 'School Activities', 'Publish school events, achievements, gallery posts and memories.'],
      ['/school-activities/approvals', '📝', 'Activity Approvals', 'Review teacher-submitted media and publish activities.'],
    ],
    secondaryActions: [
      ['/school-intelligence', '🧠', 'School Intelligence', 'Executive operational insights.'],
      ['/analytics', '📈', 'Operational Analytics', 'Trends, comparisons, and risk signals.'],
      ['/teacher-assignments', '🧩', 'Teacher Assignments', 'Subject, class, and teacher mapping.'],
      ['/holiday-calendar', '🎌', 'Holiday Calendar', 'Academic calendar overrides.'],
    ],
    updates: [
      { title: 'Daily close check', message: 'Review pending attendance, leave approvals, and replacement coverage before day close.', tone: 'warning' },
      { title: 'Notice control', message: 'Holiday and academic notices stay controlled after school-level validation.', tone: 'success' },
    ],
  },
  PRINCIPAL: {
    overviewTitle: 'Principal Operations',
    focus: 'Monitor school-wide attendance, teacher availability, leave approvals, replacement coverage, and notices.',
    primaryActions: [
      ['/workspace-setup', '🧭', 'Workspace Setup', 'Complete setup progress and unlock Import School Data.'],
      ['/principal/intelligence', '🧠', 'School Intelligence', 'View school-level attendance, workload, and operational insights.'],
      ['/teacher-leave', '🗓️', 'Leave Approvals', 'Approve or reject teacher leave enquiries.'],
      ['/reports/attendance', '📊', 'Attendance Reports', 'Open class, section, and student attendance views.'],
      ['/attendance-recovery', '🩹', 'Recover Missed Attendance', 'Validate and submit missed attendance records.'],
      ['/reports/teachers', '👨‍🏫', 'Teacher Reports', 'Review teacher workload, leaves, and replacement load.'],
      ['/analytics', '📈', 'Operational Analytics', 'Compare attendance trends, sections, and risk signals.'],
      ['/school-notices', '📣', 'Create School Notice', 'Publish announcements, holidays, and academic alerts.'],
      ['/school-activities', '🎉', 'School Activities', 'Approve, publish and review activity feed posts.'],
      ['/school-activities/approvals', '📝', 'Activity Approvals', 'Review media, approve, reject, and publish teacher submissions.'],
    ],
    secondaryActions: [
      ['/timetable/operations', '🕒', 'Timetable Operations', 'Review and publish timetable batches.'],
      ['/teacher-assignments', '🧩', 'Teacher Assignments', 'Review class and subject mappings.'],
      ['/holiday-calendar', '🎌', 'Holiday Calendar', 'Manage academic calendar overrides.'],
    ],
    updates: [
      { title: 'Morning review', message: 'Check attendance, teacher leave, and replacement coverage before school day starts.', tone: 'info' },
      { title: 'Workload decision', message: 'Use teacher reports before approving extended leave.', tone: 'warning' },
      { title: 'Publish control', message: 'Publish notices only after school-level validation.', tone: 'success' },
    ],
  },
  TEACHER: {
    overviewTitle: 'Teacher Workspace',
    focus: 'Complete daily teacher work: attendance, timetable, leave enquiry, missed attendance recovery, and notifications.',
    primaryActions: [
      ['/teacher/leave-enquiry', '📝', 'Request Leave Enquiry', 'Submit leave enquiry and track Pending, Approved, or Rejected status.'],
      ['/teacher/attendance-bulk', '✅', 'Recover Missed Attendance', 'Submit missed attendance records for recent working days from web.'],
      ['/teacher/timetable', '📅', 'My Timetable', 'View today schedule, periods, and replacement responsibilities.'],
      ['/teacher/classes', '🏫', 'My Classes', 'View assigned classes, sections, and subjects.'],
      ['/school-activities/create', '🖼️', 'Create Activity', 'Create classroom events and submit memories for approval.'],
    ],
    secondaryActions: [
      ['/teacher/results', '🧾', 'Results Submission', 'Enter exam results when enabled.'],
    ],
    updates: [
      { title: 'Attendance reminder', message: 'Use bulk recovery when previous working-day submissions are pending.', tone: 'warning' },
      { title: 'Leave status', message: 'Approval or rejection remarks appear in the leave enquiry workflow.', tone: 'info' },
      { title: 'Session identity', message: 'Teacher ID and school ID are bound from login.', tone: 'success' },
    ],
  },
  STUDENT: {
    overviewTitle: 'Student Portal',
    focus: 'View attendance, timetable, results, notices, assignments, and school updates in one simple portal.',
    primaryActions: [
      ['/student/attendance', '📊', 'My Attendance', 'Check attendance percentage, absent days, late marks, and monthly trend.'],
      ['/student/timetable', '🕒', 'My Timetable', 'View published class timetable and holiday changes.'],
      ['/student/results', '📘', 'Exam Results', 'Review subject marks, grades, and academic progress.'],
      ['/student/notices', '📣', 'School Notices', 'Read announcements, holidays, and academic calendar updates.'],
      ['/school-activities', '🎉', 'School Activities', 'View school activities, gallery posts and memories.'],
    ],
    secondaryActions: [
      ['/student', '📝', 'Assignments', 'View homework summary when enabled.'],
      ['/student', '🏆', 'Achievements', 'View academic and school achievements.'],
    ],
    updates: [
      { title: 'Attendance update', message: 'Attendance percentage updates after teacher submission.', tone: 'info' },
      { title: 'School notice', message: 'Holiday and academic notices appear after publishing.', tone: 'gold' },
      { title: 'Academic progress', message: 'Use results and timetable together for daily study planning.', tone: 'success' },
    ],
  },
  PARENT: {
    overviewTitle: 'Parent Workspace',
    focus: 'View child timetable, attendance, results, notices, and school updates in one simple portal.',
    primaryActions: [
      ['/parent/timetable', '🕒', 'Child Timetable', 'View today schedule and weekly timetable from the latest published timetable.'],
      ['/student/attendance', '📊', 'Child Attendance', 'Check attendance percentage and recent attendance updates.'],
      ['/student/results', '📘', 'Exam Results', 'Review subject marks, grades, and academic progress.'],
      ['/student/notices', '📣', 'School Notices', 'Read announcements, holidays, and academic calendar updates.'],
      ['/school-activities', '🎉', 'School Activities', 'View school activities, gallery posts and memories.'],
    ],
    secondaryActions: [
      ['/parent', '📅', 'Today Schedule', "Open the child timetable and check today's periods."],
      ['/parent', '🏫', 'School Updates', 'View school updates when enabled.'],
    ],
    updates: [
      { title: 'Published timetable only', message: 'Draft timetables are hidden until Admin or Principal publishes the final schedule.', tone: 'success' },
      { title: 'Child schedule', message: 'Today and weekly timetable views use the active school timetable.', tone: 'info' },
      { title: 'School notice', message: 'Holiday and academic notices appear after publishing.', tone: 'gold' },
    ],
  },
} satisfies Record<PortalRole, { overviewTitle: string; focus: string; primaryActions: Action[]; secondaryActions: Action[]; updates: UpdateItem[] }>;

function ActionCard({ href, icon, title, description, compact = false }: { href: string; icon: string; title: string; description: string; compact?: boolean }) {
  return (
    <Link className={compact ? 'action-card action-card--compact' : 'action-card'} href={href}>
      <span className="action-card-icon">{icon}</span>
      <strong>{title}</strong>
      <span>{description}</span>
    </Link>
  );
}

export default function DashboardHome({ role }: { role: PortalRole }) {
  const copy = roleCopy[role];

  return (
    <>
      <section className="executive-hero glass-panel premium-panel erp-section">
        <div>
          <p className="eyebrow">Operational overview</p>
          <h2>{copy.overviewTitle}</h2>
          <p>{copy.focus}</p>
        </div>
      </section>

      <section className="work-panel glass-panel premium-panel erp-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Primary workflows</p>
            <h2>{role === 'STUDENT' ? 'Student actions' : role === 'TEACHER' ? 'Teacher actions' : role === 'PARENT' ? 'Parent actions' : 'School operations'}</h2>
          </div>
          <span className="section-count">{copy.primaryActions.length} workflows</span>
        </div>
        <div className="action-grid action-grid--primary">
          {copy.primaryActions.map(([href, icon, title, description], index) => (
            <ActionCard href={href} icon={icon} title={title} description={description} key={`${role}-primary-${href}-${title}-${index}`} />
          ))}
        </div>
      </section>

      <div className="two-column two-column--dashboard erp-section">
        <section className="work-panel glass-panel premium-panel">
          <div className="section-heading-row section-heading-row--compact">
            <div>
              <p className="eyebrow">Supporting tools</p>
              <h2>More actions</h2>
            </div>
          </div>
          <div className="action-list">
            {copy.secondaryActions.map(([href, icon, title, description], index) => (
              <ActionCard compact href={href} icon={icon} title={title} description={description} key={`${role}-secondary-${href}-${title}-${index}`} />
            ))}
          </div>
        </section>

        <section className="work-panel glass-panel premium-panel notification-center-card" id="notifications">
          <div className="section-heading-row section-heading-row--compact">
            <div>
              <p className="eyebrow">Updates</p>
              <h2>{role === 'TEACHER' ? 'Teacher updates' : role === 'STUDENT' ? 'Student alerts' : role === 'PARENT' ? 'Parent alerts' : 'School alerts'}</h2>
            </div>
          </div>
          <div className="notification-list">
            {copy.updates.map((item) => (
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
