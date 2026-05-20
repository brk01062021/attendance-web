import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function AdminPage() {
  return (
    <PortalShell role="ADMIN" title="Admin Web ERP Portal" subtitle="Production web foundation for portal.vidyasetu.co">
      <ShellStyles />
      <DashboardHome role="ADMIN" />
    </PortalShell>
  );
}
