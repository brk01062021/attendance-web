import MetricCard from '@/components/ui/MetricCard';
import type { PortalRole } from '@/lib/routes';

const roleCopy = {
  ADMIN: {
    title: 'Admin Web ERP Home',
    subtitle: 'School setup, imports, timetable operations, reports, and admin-controlled workflows.',
    metrics: [
      ['School Setup', 'Ready', 'Import and onboarding shell'],
      ['Timetable Ops', 'Live', 'Batch center foundation'],
      ['Reports', 'Next', 'Attendance and teacher pages'],
      ['RBAC', 'Phase-1', 'Admin/principal separation'],
    ],
  },
  PRINCIPAL: {
    title: 'Principal Web ERP Home',
    subtitle: 'Executive school intelligence, operational reports, timetable visibility, and approvals.',
    metrics: [
      ['Executive View', 'Ready', 'Principal command shell'],
      ['Attendance Pulse', 'Live', 'Summary API-ready'],
      ['Teacher Load', 'Watch', 'Workload and replacement focus'],
      ['Rollout', 'Day 21', 'Web onboarding started'],
    ],
  },
} satisfies Record<PortalRole, { title: string; subtitle: string; metrics: string[][] }>;

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
        <p className="eyebrow">PORTAL FOUNDATION</p>
        <h2>{copy.title}</h2>
        <p>{copy.subtitle}</p>
        <div className="action-grid">
          <div className="action-card"><span>📥</span><strong>Import School Data</strong><span>Excel onboarding workflow placeholder for school profile, users, classes, subjects, holidays, and timetables.</span></div>
          <div className="action-card"><span>🕒</span><strong>Timetable Operations</strong><span>Connects to backend timetable APIs for batch review, readiness, publish, export, and live views.</span></div>
          <div className="action-card"><span>📊</span><strong>Reports & Intelligence</strong><span>Admin/principal shell prepared for attendance, teacher reports, workload, and executive dashboards.</span></div>
        </div>
      </section>
    </>
  );
}
