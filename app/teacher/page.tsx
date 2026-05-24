import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function TeacherPage() {
  return (
    <PortalShell role="TEACHER" title="Teacher Daily Workspace" subtitle="Attendance, timetable, leave enquiry, notifications, replacements, and missed attendance recovery.">
      <ShellStyles />
      <DashboardHome role="TEACHER" />
    </PortalShell>
  );
}
