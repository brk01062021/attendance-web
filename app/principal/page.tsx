import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function PrincipalPage() {
  return (
    <PortalShell role="PRINCIPAL" title="Principal Web ERP Portal" subtitle="Executive school operations shell for portal.vidyasetu.co">
      <ShellStyles />
      <DashboardHome role="PRINCIPAL" />
    </PortalShell>
  );
}
