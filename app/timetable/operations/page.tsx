import TimetableOperationsPanel from '@/components/erp/TimetableOperationsPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell
      role="ADMIN"
      title="Timetable Operations"
      subtitle="Auto repair, manual review foundation, publish lock, export, history, and principal timetable intelligence."
      variant="gold"
    >
      <ShellStyles />
      <TimetableOperationsPanel />
    </PortalShell>
  );
}
