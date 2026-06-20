import TimetableGeneratePanel from '@/components/erp/TimetableGeneratePanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Generate Timetable" subtitle="Auto timetable generation using real tenant classes, sections, teacher pool, rules validation, and workload balance." variant="gold">
            <ShellStyles />
            <TimetableGeneratePanel />
        </PortalShell>
    );
}
