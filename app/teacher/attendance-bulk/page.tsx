import TeacherBulkAttendancePanel from '@/components/erp/TeacherBulkAttendancePanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function TeacherAttendanceBulkPage() {
  return (
    <PortalShell role="TEACHER" title="Missed Attendance Bulk Submission" subtitle="Teacher web recovery flow for up to 7 working days of missed attendance." eyebrow="DAY 30 TEACHER WEB FLOW" variant="gold">
      <ShellStyles />
      <TeacherBulkAttendancePanel />
    </PortalShell>
  );
}
