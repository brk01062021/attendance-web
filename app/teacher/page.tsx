import DashboardHome from '@/components/layout/DashboardHome';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function TeacherPage() {
  return (
    <PortalShell role="TEACHER" title="Teacher Web Portal" subtitle="Teacher web workspace for leave enquiry and missed attendance recovery." eyebrow="DAY 32 EXECUTIVE VISUAL SYSTEM">
      <ShellStyles />
      <DashboardHome role="TEACHER" />
    </PortalShell>
  );
}
