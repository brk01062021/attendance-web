import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Teacher Reports" subtitle="Teacher workload, assigned classes, leave history, replacement load, attendance submission, and exam result workflow shell.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="TEACHER INTELLIGENCE"
                title="Teacher report center"
                description="Prepared for single-teacher lookup and teacher history views: classes, sections, subjects, leaves, replacement count, attendance submissions, and exams."
                metrics={[
                    { label: 'Teacher Lookup', value: 'Next', helper: 'Search/select teacher' },
                    { label: 'Workload', value: 'Ready', helper: 'Dashboard shell' },
                    { label: 'Leave History', value: 'Next', helper: 'Planned/unplanned' },
                    { label: 'Replacement Load', value: 'Watch', helper: 'Fairness analytics', tone: 'warning' },
                ]}
                primaryItems={[
                    { icon: '👨‍🏫', title: 'Teacher profile', body: 'Classes, sections, subjects, and academic assignment history.' },
                    { icon: '🗓️', title: 'Leave and replacement', body: 'Planned/unplanned leave and total replacement assignment count.' },
                    { icon: '📚', title: 'Submissions', body: 'Buttons for previous exam results and last attendance submissions.' },
                ]}
                checklist={[
                    { label: 'Route available', status: 'Done' },
                    { label: 'Teacher report spec represented', status: 'Done' },
                    { label: 'Search API wiring', status: 'Next' },
                    { label: 'Detail pages', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
