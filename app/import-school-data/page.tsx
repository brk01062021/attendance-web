import ImportValidationDashboard from '@/components/erp/ImportValidationDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell
      role="ADMIN"
      title="Import School Data"
      subtitle="Excel-first onboarding workspace for real school activation, validation, and tenant-safe import review."
      variant="gold"
    >
      <ShellStyles />
      <ImportValidationDashboard />
    </PortalShell>
  );
}
