import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Generate Timetable" subtitle="Auto timetable generation web shell for class checklist, sections, teacher pools, rules validation, and workload balancing.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="AUTO TIMETABLE"
                title="Generation command center"
                description="Prepared for class checklist selection, auto-loaded sections, default teacher pool, academic rules validation, and smart generation controls."
                metrics={[
                    { label: 'Class Selector', value: 'Next', helper: 'Checklist UI' },
                    { label: 'Teacher Pool', value: 'Auto', helper: 'Default pool source', tone: 'success' },
                    { label: 'Rules Engine', value: 'Ready', helper: 'Backend available' },
                    { label: 'Conflict Check', value: 'Ready', helper: 'Generation review' },
                ]}
                primaryItems={[
                    { icon: '☑️', title: 'Classes and sections', body: 'Production-friendly class checklist with auto-loaded sections.' },
                    { icon: '👥', title: 'Default teacher pool', body: 'Uses class-wise teacher pools from onboarding imports.' },
                    { icon: '🧠', title: 'Smart generation', body: 'Equal theory distribution, fixed labs/sports, and conflict detection.' },
                ]}
                checklist={[
                    { label: 'Generation route', status: 'Done' },
                    { label: 'Auto timetable requirements', status: 'Represented' },
                    { label: 'Generate form', status: 'Next' },
                    { label: 'Backend POST wiring', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
