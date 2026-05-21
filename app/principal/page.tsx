import Day23ModulePage from '@/components/erp/Day23ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day23Modules } from '@/lib/day23MockData';

export default function Page() {
    return (
        <PortalShell role="PRINCIPAL" title="School Intelligence" subtitle="Executive intelligence for attendance pulse, risk alerts, teacher workload, timetable readiness, and rollout decisions." eyebrow="DAY 23 WEB ERP DEVELOPMENT" variant="gold">
            <ShellStyles />
            <Day23ModulePage config={day23Modules.intelligence} />
        </PortalShell>
    );
}
