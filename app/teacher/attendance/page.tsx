import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

const students = [
  { rollNo: '01', name: 'Aarav Reddy', status: 'Pending' },
  { rollNo: '02', name: 'Diya Sharma', status: 'Pending' },
  { rollNo: '03', name: 'Rohan Kumar', status: 'Pending' },
];

export default function Page() {
  return (
    <PortalShell role="TEACHER" title="Take Attendance" subtitle="Mark today’s attendance for assigned classes.">
      <ShellStyles />
      <section className="page-card gold-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Daily attendance</p>
            <h2>Class Attendance Register</h2>
          </div>
        </div>

        <div className="dashboard-grid dashboard-grid--three">
          <div className="mini-card">
            <span>Class</span>
            <strong>10 - A</strong>
          </div>
          <div className="mini-card">
            <span>Subject</span>
            <strong>Mathematics</strong>
          </div>
          <div className="mini-card">
            <span>Status</span>
            <strong>Not submitted</strong>
          </div>
        </div>

        <div className="status-list">
          {students.map((student) => (
            <div className="status-row" key={student.rollNo}>
              <strong>{student.rollNo}. {student.name}</strong>
              <span>{student.status}</span>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
