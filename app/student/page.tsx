import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function StudentPage() {
  return (
    <PortalShell role="STUDENT" title="Student Academic Workspace" subtitle="Attendance, timetable, exam results, school notices, assignments, and progress.">
      <ShellStyles />
      <DashboardHome role="STUDENT" />
    </PortalShell>
  );
}
