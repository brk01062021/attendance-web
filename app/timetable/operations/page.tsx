import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Timetable Operations" subtitle="Latest batch center, review, conflicts, workload, publish, export, archive, and rollout readiness." variant="gold">
            <ShellStyles />
            <Day24ModulePage config={day24Modules.timetableOperations} />
        </PortalShell>
    );
}
