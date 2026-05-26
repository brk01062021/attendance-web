import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const rows = [
  ['10-A', 'Mathematics', 'Unit Test 1', 'Draft'],
  ['9-A', 'Mathematics', 'Unit Test 1', 'Pending'],
];

export default function Page() {
  return (
    <PortalShell role="TEACHER" title="Results Submission" subtitle="Enter and review exam marks for assigned classes.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Exam marks</p>
            <h2>Result Entry Queue</h2>
          </div>
        </div>

        <div className="status-list">
          {rows.map(([className, subject, exam, status]) => (
            <div className="status-row" key={`${className}-${exam}`}>
              <strong>{className} • {subject} • {exam}</strong>
              <span>{status}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
