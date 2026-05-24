import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell
            role="ADMIN"
            title="Timetable Operations"
            subtitle="Latest batch review, conflict center, workload intelligence, publish readiness, and export foundation."
           
            variant="gold"
        >
            <ShellStyles />
            <Day24ModulePage config={day24Modules.timetableOperations} />
        </PortalShell>
    );
}
