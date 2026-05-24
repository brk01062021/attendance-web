import Day24ModulePage from '@/components/erp/Day24ModulePage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';
import { day24Modules } from '@/lib/day24MockData';

export default function SchoolIntelligencePage() {
  return (
    <PortalShell
      role="ADMIN"
      title="School Intelligence"
      subtitle="Executive intelligence for attendance pulse, risk alerts, teacher workload, timetable readiness, and rollout decisions."
     
      variant="gold"
    >
      <ShellStyles />
      <Day24ModulePage config={day24Modules.intelligence} />
    </PortalShell>
  );
}
