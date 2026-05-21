import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Teacher Assignments" subtitle="Teacher-subject-class-section mapping and class-wise teacher pool setup." eyebrow="DAY 24 WEB ERP DEVELOPMENT" variant="gold">
            <ShellStyles />
            <Day24ModulePage config={day24Modules.teacherAssignments} />
        </PortalShell>
    );
}
