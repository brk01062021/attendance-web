import Day23ModulePage from '@/components/erp/Day23ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day23Modules } from '@/lib/day23MockData';

export default function Page() {
    return (
        <PortalShell
            role="ADMIN"
            title="Timetable Operations"
            subtitle="Latest batch review, conflict center, workload intelligence, publish readiness, and export foundation."
            eyebrow="DAY 23 TIMETABLE"
            variant="gold"
        >
            <ShellStyles />
            <Day23ModulePage config={day23Modules.timetableOperations} />
        </PortalShell>
    );
}
