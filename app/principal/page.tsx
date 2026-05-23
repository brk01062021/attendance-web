import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function PrincipalPage() {
    return (
        <PortalShell role="PRINCIPAL" title="Principal Web ERP Portal" subtitle="Executive command center for school intelligence, reports, timetable visibility, notices, and pilot readiness." eyebrow="DAY 32 EXECUTIVE VISUAL SYSTEM">
            <ShellStyles />
            <DashboardHome role="PRINCIPAL" />
        </PortalShell>
    );
}
