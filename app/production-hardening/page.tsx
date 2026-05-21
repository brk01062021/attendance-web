import ProductionHardeningDashboard from '@/components/erp/ProductionHardeningDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function ProductionHardeningPage() {
    return (
        <PortalShell
            role="ADMIN"
            title="Production Hardening & SaaS Preparation"
            subtitle="Day 25 pilot readiness for one realistic school: 700 students, 30–40 teachers, one admin, and one principal."
            eyebrow="DAY 25 PILOT READINESS"
            variant="gold"
        >
            <ShellStyles />
            <ProductionHardeningDashboard />
        </PortalShell>
    );
}
