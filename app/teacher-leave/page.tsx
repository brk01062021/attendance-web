import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Teacher Leave Planning" subtitle="Leave planning, replacement preview, approval decisions, and workload protection workflow." eyebrow="DAY 24 WEB ERP DEVELOPMENT" variant="gold">
            <ShellStyles />
            <Day24ModulePage config={day24Modules.teacherLeave} />
        </PortalShell>
    );
}
