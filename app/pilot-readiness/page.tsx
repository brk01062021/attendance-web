import ProductionHardeningDashboard from '@/components/erp/ProductionHardeningDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function PilotReadinessPage() {
    return (
        <PortalShell role="ADMIN" title="Pilot Readiness Board" subtitle="Single-school rollout gate for first realistic pilot." eyebrow="DAY 25 PILOT BOARD" variant="gold">
            <ShellStyles />
            <ProductionHardeningDashboard />
        </PortalShell>
    );
}
