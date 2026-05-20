import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Teacher Assignments" subtitle="Teacher-subject-class-section mapping foundation for imports and auto timetable generation.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="ACADEMIC SETUP"
                title="Teacher assignment center"
                description="Prepared for subject mapping, teacher pools by class, class/section assignments, workload balancing, and timetable input validation."
                metrics={[
                    { label: 'Teacher Pools', value: 'Excel', helper: 'Class-wise pools' },
                    { label: 'Mappings', value: 'Ready', helper: 'UI shell' },
                    { label: 'Validation', value: 'Next', helper: 'Conflict checks' },
                    { label: 'Timetable Input', value: 'Ready', helper: 'Generation dependency' },
                ]}
                primaryItems={[
                    { icon: '🧑‍🏫', title: 'Teacher pool setup', body: 'One pool per class, aligned with VidyaSetu auto timetable generation rules.' },
                    { icon: '📘', title: 'Subject mapping', body: 'Teacher, subject, class, section, and weekly period mapping.' },
                    { icon: '⚖️', title: 'Workload balancing', body: 'Foundation for preventing overload before timetable generation.' },
                ]}
                checklist={[
                    { label: 'Route available', status: 'Done' },
                    { label: 'Teacher pool concept', status: 'Done' },
                    { label: 'Excel import connection', status: 'Next' },
                    { label: 'Validation service connection', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
