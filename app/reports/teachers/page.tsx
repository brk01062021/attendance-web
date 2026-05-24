import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Teacher Reports" subtitle="Teacher workload, leaves, replacement load, submissions, and academic responsibility reporting foundation." variant="gold">
            <ShellStyles />
            <Day24ModulePage config={day24Modules.teacherReports} />
        </PortalShell>
    );
}
