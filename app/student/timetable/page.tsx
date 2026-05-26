import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const schedule = [
  ['Period 1', 'English'],
  ['Period 2', 'Mathematics'],
  ['Period 3', 'Science'],
  ['Period 4', 'Social'],
];

export default function Page() {
  return (
    <PortalShell role="STUDENT" title="My Timetable" subtitle="View published class timetable.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Published timetable</p>
            <h2>Today’s Class Schedule</h2>
          </div>
        </div>

        <div className="status-list">
          {schedule.map(([period, subject]) => (
            <div className="status-row" key={period}>
              <strong>{period}</strong>
              <span>{subject}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
