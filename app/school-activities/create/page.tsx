import ActivityCreatePanel from '@/components/erp/ActivityCreatePanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell
      role="ADMIN"
      title="Create School Activity"
      subtitle="Create memories, achievements and event posts for the school feed."
      variant="gold"
    >
      <ShellStyles />
      <ActivityCreatePanel role="ADMIN" schoolId="TST2" />
    </PortalShell>
  );
}
