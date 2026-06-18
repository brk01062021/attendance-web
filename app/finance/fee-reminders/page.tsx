import FeeReminderPanel from '@/components/erp/FeeReminderPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell role="ADMIN" title="Finance / Fee Reminder Upload" subtitle="Upload pending fee Excel, validate student-parent mapping and send reminders." variant="gold">
      <ShellStyles />
      <FeeReminderPanel />
    </PortalShell>
  );
}
