import SchoolNoticeCenter from '@/components/erp/SchoolNoticeCenter';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Create School Notice" subtitle="Holiday alerts, announcements, achievements, and parent/student notification foundation." variant="gold">
            <ShellStyles />
            <SchoolNoticeCenter />
        </PortalShell>
    );
}
