import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const notifications = [
  ['Leave request update', 'No new leave approval updates.'],
  ['Attendance reminder', 'Submit pending attendance before day close.'],
  ['Replacement duty', 'No replacement periods assigned for today.'],
];

export default function Page() {
  return (
    <PortalShell role="TEACHER" title="Teacher Notifications Center" subtitle="View teacher-specific alerts, reminders, and approvals.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Notifications</p>
            <h2>Teacher Alerts</h2>
          </div>
        </div>

        <div className="status-list">
          {notifications.map(([title, message]) => (
            <div className="status-row" key={title}>
              <strong>{title}</strong>
              <span>{message}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
