import ActivePublishedTimetableViewer from '@/components/erp/ActivePublishedTimetableViewer';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell
      role="ADMIN"
      title="Active Published Timetable"
      subtitle="View the latest active published timetable by class, section, day, and period."
      variant="gold"
    >
      <ShellStyles />
      <ActivePublishedTimetableViewer />
    </PortalShell>
  );
}
