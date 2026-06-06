import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Operational Analytics Hub" subtitle="Attendance trend, teacher attendance, student attendance, leave overview, notices published, and timetable health." variant="gold">
            <ShellStyles />
            <Day24ModulePage config={day24Modules.analyticsHub} />
        </PortalShell>
    );
}
