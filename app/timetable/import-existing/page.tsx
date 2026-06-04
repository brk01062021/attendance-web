import ExistingTimetableImportPanel from '@/components/erp/ExistingTimetableImportPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
  return (
    <PortalShell
      role="ADMIN"
      title="Import Existing Timetable"
      subtitle="Upload, validate, review, and publish the school’s active timetable without forcing timetable regeneration."
      variant="gold"
    >
      <ShellStyles />
      <ExistingTimetableImportPanel />
    </PortalShell>
  );
}
