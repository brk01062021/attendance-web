import LeaveApprovalsPanel from '@/components/erp/LeaveApprovalsPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Leave Approvals" subtitle="Admin/Principal approval workflow for teacher leave enquiries, followed by replacement planning." eyebrow="LEAVE APPROVAL WORKFLOW" variant="gold">
            <ShellStyles />
            <LeaveApprovalsPanel />
        </PortalShell>
    );
}
