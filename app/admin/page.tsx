import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function AdminPage() {
  return (
    <PortalShell role="ADMIN" title="Admin School Operations" subtitle="Daily school setup, attendance, approvals, reports, timetable, and notices.">
      <ShellStyles />
      <DashboardHome role="ADMIN" />
    </PortalShell>
  );
}
