import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const periods = [
  ['Period 1', '10-A Mathematics'],
  ['Period 2', '9-A Mathematics'],
  ['Period 3', 'Free period'],
  ['Period 4', '8-B Mathematics'],
];

export default function Page() {
  return (
    <PortalShell role="TEACHER" title="My Timetable" subtitle="View today’s teaching schedule and replacement periods.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Published timetable</p>
            <h2>Today’s Schedule</h2>
          </div>
        </div>

        <div className="status-list">
          {periods.map(([period, detail]) => (
            <div className="status-row" key={period}>
              <strong>{period}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
