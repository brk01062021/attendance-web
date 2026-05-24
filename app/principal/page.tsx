import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function PrincipalPage() {
  return (
    <PortalShell role="PRINCIPAL" title="Principal School Overview" subtitle="School attendance, teacher availability, leave approvals, reports, notices, and academic operations.">
      <ShellStyles />
      <DashboardHome role="PRINCIPAL" />
    </PortalShell>
  );
}
