import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Timetable Operations" subtitle="Batch center, review, conflict center, workload intelligence, publish, export, archive, and rollout readiness foundation.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="TIMETABLE OPERATIONS"
                title="Operational batch center"
                description="Prepared for latest-batch workflow, batch ID visibility, publish locking, PDF/Excel export, live timetable views, and principal readiness review."
                metrics={[
                    { label: 'Latest Batch', value: 'API', helper: 'Connect batches endpoint', tone: 'success' },
                    { label: 'Conflicts', value: '0', helper: 'Target before publish' },
                    { label: 'Publish', value: 'Ready', helper: 'Workflow shell' },
                    { label: 'Exports', value: 'Next', helper: 'PDF/Excel web actions' },
                ]}
                primaryItems={[
                    { icon: '🗂️', title: 'Batch center', body: 'Show latest generated/published timetable batch and metadata.' },
                    { icon: '🛠️', title: 'Review and repair', body: 'Open review, conflict repair, workload, manual edit, and publish workflow.' },
                    { icon: '📤', title: 'Exports and rollout', body: 'PDF/Excel timetable export, rollout readiness, archive, and live views.' },
                ]}
                checklist={[
                    { label: 'Operations route', status: 'Done' },
                    { label: 'Latest batch requirement', status: 'Captured' },
                    { label: 'Batch API integration', status: 'Next' },
                    { label: 'Export integration', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
