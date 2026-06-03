import RoleTimetableVisibilityPanel from '@/components/erp/RoleTimetableVisibilityPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell role="PARENT" title="Child Timetable" subtitle="Today and weekly child schedule from the latest published timetable only.">
      <ShellStyles />
      <RoleTimetableVisibilityPanel role="PARENT" />
    </PortalShell>
  );
}
