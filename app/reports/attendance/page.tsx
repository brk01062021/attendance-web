import WorkflowPage from '@/components/erp/WorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function Page() {
    return (
        <PortalShell role="ADMIN" title="Attendance Reports" subtitle="Web ERP attendance reporting foundation for admin and principal workflows.">
            <ShellStyles />
            <WorkflowPage
                eyebrow="REPORTS"
                title="Attendance report center"
                description="Prepared for school summary, class reports, student search, daily/weekly/monthly range filters, and export actions."
                metrics={[
                    { label: 'School Summary', value: 'Ready', helper: 'UI shell prepared', tone: 'success' },
                    { label: 'Class Reports', value: 'Ready', helper: 'Section compare placeholder' },
                    { label: 'Student Search', value: 'Next', helper: 'Connect search API' },
                    { label: 'Exports', value: 'Next', helper: 'PDF/Excel actions' },
                ]}
                primaryItems={[
                    { icon: '🏫', title: 'School attendance', body: 'Whole-school totals, present, absent, late, covered, pending, and attendance percentage.' },
                    { icon: '👥', title: 'Class and section reports', body: 'Class-wise and section-wise web reporting with simple filters for non-technical users.' },
                    { icon: '🔎', title: 'Student drilldown', body: 'Single student weekly/monthly attendance report foundation.' },
                ]}
                checklist={[
                    { label: 'Report route', status: 'Done' },
                    { label: 'Premium gold workflow theme', status: 'Done' },
                    { label: 'Backend API connection', status: 'Next' },
                    { label: 'Export buttons', status: 'Next' },
                ]}
            />
        </PortalShell>
    );
}
