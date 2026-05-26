import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const classes = [
  ['10-A', 'Mathematics', '42 students'],
  ['9-A', 'Mathematics', '40 students'],
  ['8-B', 'Mathematics', '38 students'],
];

export default function Page() {
  return (
    <PortalShell role="TEACHER" title="My Classes" subtitle="Assigned classes and subject responsibility.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Assigned classes</p>
            <h2>Teaching Assignments</h2>
          </div>
        </div>

        <div className="status-list">
          {classes.map(([className, subject, strength]) => (
            <div className="status-row" key={className}>
              <strong>{className} • {subject}</strong>
              <span>{strength}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
