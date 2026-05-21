import PilotWorkflowPage from '@/components/erp/PilotWorkflowPage';
import PortalShell from '@/components/layout/PortalShell';
import ShellStyles from '@/components/layout/ShellStyles';

export default function HolidayCalendarPage() {
    return (
        <PortalShell role="ADMIN" title="Academic Calendar & Holiday Overrides" subtitle="Holiday notices should work as academic calendar overrides, not manual timetable edits." eyebrow="DAY 25 HOLIDAY HANDLING" variant="gold">
            <ShellStyles />
            <PilotWorkflowPage
                eyebrow="ACADEMIC CALENDAR OVERRIDE"
                title="Create full-day or half-day holiday notices without changing the original timetable."
                description="Admin/principal can define holidays by date, type, reason, scope, and publish flag. VidyaSetu keeps the timetable intact and overlays the holiday rule for attendance, timetable visibility, and notices."
                primary={[
                    'Create full-day or half-day holiday override',
                    'Scope holiday to whole school, selected classes, or selected sections',
                    'Auto-create editable holiday notice before publishing',
                    'Show holiday banner in teacher, student, parent, and principal/admin views',
                    'Lock attendance for affected dates or periods',
                ]}
                validations={[
                    'Original timetable entries remain unchanged',
                    'Override is filtered by schoolId and class/section scope',
                    'Half-day override disables only affected periods',
                    'Dashboard alerts and in-app notices reflect publish state',
                ]}
            />
        </PortalShell>
    );
}
