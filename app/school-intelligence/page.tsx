import SchoolIntelligenceCommandCenter from '@/components/erp/SchoolIntelligenceCommandCenter';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function SchoolIntelligencePage() {
  return (
    <PortalShell
      role="ADMIN"
      title="School Intelligence"
      subtitle="Executive intelligence for attendance pulse, risk alerts, teacher workload, timetable readiness, and rollout decisions."
      variant="gold"
    >
      <ShellStyles />
      <SchoolIntelligenceCommandCenter />
    </PortalShell>
  );
}
