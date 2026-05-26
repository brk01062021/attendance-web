import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const notices = [
  ['Holiday Notice', 'No active holiday notice today.'],
  ['Academic Notice', 'No new academic notice published.'],
  ['School Notice', 'Check this page for school announcements.'],
];

export default function Page() {
  return (
    <PortalShell role="STUDENT" title="School Notices" subtitle="View school announcements and holiday notices.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Notices</p>
            <h2>School Notice Board</h2>
          </div>
        </div>

        <div className="status-list">
          {notices.map(([title, message]) => (
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
