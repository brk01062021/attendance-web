import PilotOnboardingDashboard from '@/components/erp/PilotOnboardingDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function PilotReadinessPage() {
    return (
        <PortalShell role="ADMIN" title="School Rollout Readiness" subtitle="Operational onboarding readiness for school activation." variant="gold">
            <ShellStyles />
            <PilotOnboardingDashboard />
        </PortalShell>
    );
}
