import PilotOnboardingDashboard from '@/components/erp/PilotOnboardingDashboard';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function PilotReadinessPage() {
    return (
        <PortalShell role="ADMIN" title="Pilot School Onboarding" subtitle="Real API readiness board for one realistic school pilot." eyebrow="DAY 26 PILOT ONBOARDING" variant="gold">
            <ShellStyles />
            <PilotOnboardingDashboard />
        </PortalShell>
    );
}
