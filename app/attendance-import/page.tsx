import PilotWorkflowPage from '@/components/erp/PilotWorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function AttendanceImportPage() {
    return (
        <PortalShell role="ADMIN" title="Bulk Attendance Import" subtitle="Web-first recovery workflow for missed teacher attendance days." variant="gold">
            <ShellStyles />
            <PilotWorkflowPage
                eyebrow="MISSED-DAY ATTENDANCE IMPORT"
                title="Backfill attendance safely without disturbing mobile-first daily usage."
                description="Teachers should normally submit attendance from mobile. If attendance was missed for several working days, web ERP provides controlled Excel/manual import with holiday, timetable, and tenant checks."
                primary={[
                    'Select class, section, subject/period, teacher, and date range',
                    'Block future dates, holidays, and already locked periods',
                    'Support Excel import for up to missed working-day batches',
                    'Show inserted, skipped, duplicate, and failed row summary',
                    'Keep audit trail with uploaded by, reviewed by, schoolId, and timestamp',
                ]}
                validations={[
                    'school_id filter is enforced on import preview and save',
                    'Teacher can only import assigned class/section/subject unless admin overrides',
                    'Attendance dates follow the active published timetable',
                    'Holiday override dates are locked from import',
                ]}
            />
        </PortalShell>
    );
}
