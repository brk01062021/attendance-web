import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Operational Analytics Hub" subtitle="Attendance trends, class comparisons, teacher workload, risk alerts, and pilot-school executive reporting." variant="gold">
            <ShellStyles />
            <Day24ModulePage config={day24Modules.analyticsHub} />
        </PortalShell>
    );
}
