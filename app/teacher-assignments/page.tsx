import TeacherAssignmentPanel from '@/components/erp/TeacherAssignmentPanel';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Teacher Assignments" subtitle="Teacher-subject-class-section mapping and class-wise teacher pool setup." variant="gold">
            <ShellStyles />
            <TeacherAssignmentPanel />
        </PortalShell>
    );
}
