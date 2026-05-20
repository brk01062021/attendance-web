import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="PRINCIPAL" title="School Intelligence" subtitle="Executive intelligence shell for attendance pulse, risk alerts, teacher workload, timetable readiness, and rollout decisions.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="EXECUTIVE INTELLIGENCE"
                title="Principal intelligence center"
                description="This page prepares the web ERP executive view. In the next wiring step, cards can connect to principal dashboard, risk, workload, attendance, and timetable APIs."
                metrics={[
                    { label: 'Attendance Pulse', value: 'API', helper: 'Principal summary ready', tone: 'success' },
                    { label: 'Risk Alerts', value: 'Next', helper: 'Student/teacher alerts' },
                    { label: 'Timetable', value: 'Live', helper: 'Batch intelligence link', tone: 'success' },
                    { label: 'Rollout', value: 'Day 22', helper: 'Web shell ready' },
                ]}
                primaryItems={[
                    { icon: '📈', title: 'Attendance intelligence', body: 'Daily, weekly, and monthly school attendance pulse for principal review.' },
                    { icon: '⚠️', title: 'Risk alerts', body: 'Student absenteeism, teacher workload, and replacement coverage visibility.' },
                    { icon: '🧭', title: 'Decision center', body: 'Executive actions for timetable, leave, reports, and school notices.' },
                ]}
                checklist={[
                    { label: 'Dark dashboard theme', status: 'Done' },
                    { label: 'Role-aware sidebar', status: 'Done' },
                    { label: 'API wiring', status: 'Next' },
                    { label: 'Charts', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
