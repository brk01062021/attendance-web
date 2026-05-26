import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const summary = [
  ['This month', '92% attendance'],
  ['Present days', '23 days'],
  ['Absent days', '2 days'],
];

export default function Page() {
  return (
    <PortalShell role="STUDENT" title="My Attendance" subtitle="View attendance summary and recent attendance status.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Attendance overview</p>
            <h2>Attendance Summary</h2>
          </div>
        </div>

        <div className="status-list">
          {summary.map(([label, value]) => (
            <div className="status-row" key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
