import ActivityFeedPanel from '@/components/erp/ActivityFeedPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell
      role="ADMIN"
      title="School Activities & Memories"
      subtitle="Private school activity feed, approvals, gallery and timeline."
      variant="gold"
    >
      <ShellStyles />
      <ActivityFeedPanel role="ADMIN" schoolId="TST2" />
    </PortalShell>
  );
}
