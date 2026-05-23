import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function StudentPage() {
  return (
    <PortalShell role="STUDENT" title="Student Web Portal" subtitle="Student academic overview foundation for attendance, timetable, notices, and results visibility." eyebrow="DAY 31 WEB ERP DEVELOPMENT">
      <ShellStyles />
      <DashboardHome role="STUDENT" />
    </PortalShell>
  );
}
