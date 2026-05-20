import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Create School Notice" subtitle="Announcements, holiday alerts, school achievements, student achievements, and parent notification foundation.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="COMMUNICATIONS"
                title="School notice center"
                description="Prepared for admin/principal notice creation with audience targeting, holiday alerts, achievements, and parent/student notification visibility."
                metrics={[
                    { label: 'Notice Type', value: 'Multi', helper: 'Holiday, alert, achievement' },
                    { label: 'Audience', value: 'Role', helper: 'Parents/students/teachers' },
                    { label: 'Media', value: 'Next', helper: 'Images optional' },
                    { label: 'Notifications', value: 'Next', helper: 'Push center' },
                ]}
                primaryItems={[
                    { icon: '📣', title: 'Announcements', body: 'General school notices and important operational alerts.' },
                    { icon: '🏆', title: 'Achievements', body: 'School and student achievements for parent/student visibility.' },
                    { icon: '🔔', title: 'Parent notifications', body: 'Future push notification workflow for holidays, reports, and updates.' },
                ]}
                checklist={[
                    { label: 'Route available', status: 'Done' },
                    { label: 'Notice categories', status: 'Done' },
                    { label: 'Create form', status: 'Next' },
                    { label: 'Notification backend', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
