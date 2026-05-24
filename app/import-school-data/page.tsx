import ImportValidationDashboard from '@/components/erp/ImportValidationDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell
            role="ADMIN"
            title="Import School Data"
            subtitle="Excel-first school onboarding engine with tenant-safe preview, validation, and error reporting."
           
            variant="gold"
        >
            <ShellStyles />
            <ImportValidationDashboard />
        </PortalShell>
    );
}
