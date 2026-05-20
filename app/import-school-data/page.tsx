import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Import School Data" subtitle="Excel onboarding engine foundation for tenant/school setup, users, academic calendar, teacher pools, and timetable inputs.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="SCHOOL ONBOARDING"
                title="Excel import engine"
                description="Prepared for non-technical school onboarding using workbook tabs for SchoolProfile, Holidays, Students, Parents, Teachers, TeacherPools, TeacherAssignments, Subjects, and ClassSections."
                metrics={[
                    { label: 'Workbook', value: 'One', helper: 'Per school' },
                    { label: 'Holidays', value: 'First', helper: 'Mandatory prerequisite', tone: 'warning' },
                    { label: 'Teacher Pools', value: 'Ready', helper: 'Class-wise pools' },
                    { label: 'Review', value: 'Next', helper: 'Validation flow' },
                ]}
                primaryItems={[
                    { icon: '📅', title: 'Academic calendar first', body: 'Working days, holidays, timings, period rules, and academic year setup.' },
                    { icon: '👨‍👩‍👧', title: 'Users and linking', body: 'Students, parents, teachers, and verified parent-student linking.' },
                    { icon: '📚', title: 'Timetable inputs', body: 'Subjects, class sections, teacher pools, and assignments for auto generation.' },
                ]}
                checklist={[
                    { label: 'Route available', status: 'Done' },
                    { label: 'Workbook tabs represented', status: 'Done' },
                    { label: 'Upload UI', status: 'Next' },
                    { label: 'Validation summary', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
