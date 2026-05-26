import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const results = [
  ['Mathematics', '88 / 100'],
  ['Science', '91 / 100'],
  ['English', '84 / 100'],
];

export default function Page() {
  return (
    <PortalShell role="STUDENT" title="Exam Results" subtitle="View published academic results.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Academic results</p>
            <h2>Latest Exam Results</h2>
          </div>
        </div>

        <div className="status-list">
          {results.map(([subject, score]) => (
            <div className="status-row" key={subject}>
              <strong>{subject}</strong>
              <span>{score}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
