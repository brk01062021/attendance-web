import ProductionHardeningDashboard from '@/components/erp/ProductionHardeningDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function ProductionHardeningPage() {
    return (
        <PortalShell
            role="ADMIN"
            title="System Operations"
            subtitle="School-facing operational status for authentication, tenant isolation, imports, timetable, notifications, attendance, backup, and workspace health."
           
            variant="gold"
        >
            <ShellStyles />
            <ProductionHardeningDashboard />
        </PortalShell>
    );
}
