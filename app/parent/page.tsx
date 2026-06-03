import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell role="PARENT" title="Parent Workspace" subtitle="Child timetable, attendance, notices, and school updates.">
      <ShellStyles />
      <DashboardHome role="PARENT" />
    </PortalShell>
  );
}
