import TeacherLeaveEnquiryPanel from '@/components/erp/TeacherLeaveEnquiryPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function TeacherLeaveEnquiryPage() {
  return (
    <PortalShell role="TEACHER" title="Request Leave Enquiry" subtitle="Teacher-facing leave enquiry request flow. Admin/Principal approval happens separately." eyebrow="DAY 30 TEACHER WEB FLOW" variant="gold">
      <ShellStyles />
      <TeacherLeaveEnquiryPanel />
    </PortalShell>
  );
}
