import Day23ModulePage from '@/components/erp/Day23ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day23Modules } from '@/lib/day23MockData';

export default function Page() {
    return (
        <PortalShell
            role="ADMIN"
            title="Attendance Reports"
            subtitle="School attendance analytics, class comparisons, student drilldowns, and reporting foundation."
            eyebrow="DAY 23 REPORTING"
            variant="gold"
        >
            <ShellStyles />
            <Day23ModulePage config={day23Modules.attendanceReports} />
        </PortalShell>
    );
}
