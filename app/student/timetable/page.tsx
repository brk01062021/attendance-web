import RoleTimetableVisibilityPanel from '@/components/erp/RoleTimetableVisibilityPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell role="STUDENT" title="My Timetable" subtitle="Daily and weekly class schedule from the latest published timetable only.">
      <ShellStyles />
      <RoleTimetableVisibilityPanel role="STUDENT" />
    </PortalShell>
  );
}
