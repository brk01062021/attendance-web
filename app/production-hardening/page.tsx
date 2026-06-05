import ProductionHardeningDashboard from '@/components/erp/ProductionHardeningDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function ProductionHardeningPage() {
    return (
        <PortalShell
            role="ADMIN"
            title="System Operations"
            subtitle="Operational controls, tenant validation, import health, and publish readiness for active school workspaces."
           
            variant="gold"
        >
            <ShellStyles />
            <ProductionHardeningDashboard />
        </PortalShell>
    );
}
