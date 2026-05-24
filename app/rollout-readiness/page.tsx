import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Pilot Rollout Readiness" subtitle="First-school SaaS pilot checklist for tenant setup, imports, timetable publish, role access, and production validation." variant="gold">
            <ShellStyles />
            <Day24ModulePage config={day24Modules.rolloutReadiness} />
        </PortalShell>
    );
}
