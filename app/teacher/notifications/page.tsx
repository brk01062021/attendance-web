import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell role="TEACHER" title="Teacher Notifications Center" subtitle="Connected operational ERP workflow.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Operational workspace</p>
            <h2>Teacher Notifications Center</h2>
          </div>
        </div>

        <div className="status-list">
          <div className="status-row">
            <strong>Workflow status</strong>
            <span>This module is now connected to the ERP navigation flow.</span>
          </div>
          <div className="status-row">
            <strong>School identity</strong>
            <span>BRK International School remains the primary workspace identity while BRK1 stays as tenant chip.</span>
          </div>
        </div>
      </section>
    </PortalShell>
  );
}
