import MissedAttendanceRecoveryPanel from '@/components/erp/MissedAttendanceRecoveryPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell
      role="ADMIN"
      title="Recover Missed Attendance"
      subtitle="Download template, upload missed attendance, validate, preview, submit recovery, and update attendance history."
      variant="gold"
    >
      <ShellStyles />
      <MissedAttendanceRecoveryPanel />
    </PortalShell>
  );
}
