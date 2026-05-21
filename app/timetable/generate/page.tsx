import Day23ModulePage from '@/components/erp/Day23ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day23Modules } from '@/lib/day23MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Generate Timetable" subtitle="Auto timetable generation flow with class checklist, sections, teacher pools, academic rules, and workload balance." eyebrow="DAY 23 WEB ERP DEVELOPMENT" variant="gold">
            <ShellStyles />
            <Day23ModulePage config={day23Modules.timetableGenerate} />
        </PortalShell>
    );
}
