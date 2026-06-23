import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell role="STUDENT" title="Exam Results" subtitle="Published academic results will appear here after Admin or Teacher releases marks.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Academic results</p>
            <h2>Exam Result History</h2>
            <p>Demo marks have been removed. Student results will stay hidden until real published exam data is available.</p>
          </div>
        </div>
        <div className="notice-card">No published exam results available yet for this student.</div>
      </section>
    </PortalShell>
  );
}
