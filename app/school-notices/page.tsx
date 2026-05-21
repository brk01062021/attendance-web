import Day23ModulePage from '@/components/erp/Day23ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day23Modules } from '@/lib/day23MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Create School Notice" subtitle="Holiday alerts, announcements, achievements, and parent/student notification foundation." eyebrow="DAY 23 WEB ERP DEVELOPMENT" variant="gold">
            <ShellStyles />
            <Day23ModulePage config={day23Modules.notices} />
        </PortalShell>
    );
}
