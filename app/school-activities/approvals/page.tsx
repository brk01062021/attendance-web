import ActivityApprovalPanel from '@/components/erp/ActivityApprovalPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell
      role="ADMIN"
      title="Activity Approvals"
      subtitle="Review teacher-submitted activity media, approve, reject, and publish."
      variant="gold"
    >
      <ShellStyles />
      <ActivityApprovalPanel role="ADMIN" schoolId="TST2" />
    </PortalShell>
  );
}
