import Day23ModulePage from '@/components/erp/Day23ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day23Modules } from '@/lib/day23MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Teacher Assignments" subtitle="Teacher-subject-class-section mapping and class-wise teacher pool setup." eyebrow="DAY 23 WEB ERP DEVELOPMENT" variant="gold">
            <ShellStyles />
            <Day23ModulePage config={day23Modules.teacherAssignments} />
        </PortalShell>
    );
}
