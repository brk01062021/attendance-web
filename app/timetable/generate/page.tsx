import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Generate Timetable" subtitle="Auto timetable generation flow with class checklist, sections, teacher pools, academic rules, and workload balance." variant="gold">
            <ShellStyles />
            <Day24ModulePage config={day24Modules.timetableGenerate} />
        </PortalShell>
    );
}
