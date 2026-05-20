import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Teacher Leave Planning" subtitle="Leave planning and smart replacement workflow shell for admin/principal web ERP.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="LEAVE OPERATIONS"
                title="Leave and replacement planning"
                description="Prepared for teacher leave requests, replacement preview, approval workflow, smart assignment, and workload protection."
                metrics={[
                    { label: 'Pending Leaves', value: 'API', helper: 'Existing backend-ready' },
                    { label: 'Replacements', value: 'Smart', helper: 'Best-match flow' },
                    { label: 'Workload Guard', value: 'Next', helper: 'Fatigue protection' },
                    { label: 'Audit', value: 'Next', helper: 'Approval history' },
                ]}
                primaryItems={[
                    { icon: '📝', title: 'Leave submission', body: 'One-day and multi-day teacher leave planning web foundation.' },
                    { icon: '🔁', title: 'Replacement preview', body: 'Best Match / Same Class / Others grouping planned for web.' },
                    { icon: '✅', title: 'Approval workflow', body: 'Admin/principal approve, assign replacement, and track audit history.' },
                ]}
                checklist={[
                    { label: 'Page route', status: 'Done' },
                    { label: 'Workflow model', status: 'Done' },
                    { label: 'Form integration', status: 'Next' },
                    { label: 'Approval API integration', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
