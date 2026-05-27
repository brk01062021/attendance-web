import type { PortalRole } from '@/lib/routes';

export type ReadinessTone = 'success' | 'warning' | 'danger' | 'gold';

export type ReadinessMetric = {
    label: string;
    value: string;
    helper: string;
    tone?: ReadinessTone;
};

export type ReadinessGate = {
    area: string;
    owner: 'Mobile-first' | 'Web-first' | 'Backend/API' | 'Deployment';
    status: 'Ready' | 'In progress' | 'Needs validation';
    priority: '' | '';
    checks: string[];
};

export const pilotMetrics: ReadinessMetric[] = [
    { label: 'Pilot School', value: '1', helper: '~700 students, 30–40 teachers, 1 admin, 1 principal', tone: 'success' },
    { label: 'Launch Window', value: '14 days', helper: 'Stability + onboarding before expansion', tone: 'warning' },
    { label: 'Daily Workflows', value: 'Mobile', helper: 'Teachers, parents, students, principal/admin', tone: 'success' },
    { label: 'Bulk Workflows', value: 'Web ERP', helper: 'Imports, missed attendance, timetable, notices', tone: 'gold' },
];

export const day25ReadinessGates: ReadinessGate[] = [
    {
        area: 'Route protection + Role Access Control',
        owner: 'Backend/API',
        status: 'Needs validation',
        priority: '',
        checks: ['Only logged-in users can open ERP routes', 'Admin/principal route access is role-aware', 'Teacher/student/parent daily workflows remain mobile-first'],
    },
    {
        area: 'School Access ID School Data Isolation',
        owner: 'Backend/API',
        status: 'Needs validation',
        priority: '',
        checks: ['Every API request carries schoolId from token/session', 'Cross-school IDs are rejected', 'Reports/imports/timetable queries filter by schoolId'],
    },
    {
        area: 'Import School Data validation',
        owner: 'Web-first',
        status: 'In progress',
        priority: '',
        checks: ['SchoolProfile, Holidays, Students, Parents, Teachers, TeacherAssignments, Subjects, ClassSections, TeacherPools', 'Duplicate admission numbers blocked', 'Parent-student links validated before go-live'],
    },
    {
        area: 'Bulk attendance import for missed days',
        owner: 'Web-first',
        status: 'In progress',
        priority: '',
        checks: ['Teacher can backfill 7 missed working days from web', 'Date range cannot include holidays/future dates', 'Import summary shows inserted, skipped, failed rows'],
    },
    {
        area: 'Timetable Active Academic Dates + Timetable Activation Flow',
        owner: 'Web-first',
        status: 'In progress',
        priority: '',
        checks: ['Draft → Review → Conflict Repair → Publish → Active', 'Effective from/to dates required', 'Published timetable locks attendance schedule'],
    },
    {
        area: 'Holiday notice as academic calendar override',
        owner: 'Web-first',
        status: 'In progress',
        priority: '',
        checks: ['Full-day and half-day overrides do not edit original timetable', 'Attendance locked for affected periods', 'Teacher/student/parent views show holiday banner'],
    },
    {
        area: 'Auto timetable notice after publish',
        owner: 'Web-first',
        status: 'In progress',
        priority: '',
        checks: ['Publish creates editable notice draft', 'Admin/principal can review before publishing notice', 'Dashboard alert links to active timetable'],
    },
    {
        area: 'Dashboard alerts and in-app notices',
        owner: 'Mobile-first',
        status: 'In progress',
        priority: '',
        checks: ['Missed attendance alerts', 'Holiday/timetable publish alerts', 'Role-specific notice visibility'],
    },
    {
        area: 'Domain and deployment route planning',
        owner: 'Deployment',
        status: 'Ready',
        priority: '',
        checks: ['vidyasetu.co public site', 'portal.vidyasetu.co/login ERP login', 'app.vidyasetu.co mobile/deep links', 'api.vidyasetu.co backend APIs'],
    },
];

export const mobileFirstWorkflows = [
    'Teacher daily attendance and timetable alerts',
    'Teacher leave request and replacement visibility',
    'Parent child attendance, timetable, notices, and holiday alerts',
    'Student timetable, attendance overview, notices, and academic summary',
    'Principal/admin quick mobile approvals and live dashboard alerts',
];

export const webFirstWorkflows = [
    'Full school onboarding and Excel validation',
    'Bulk attendance import for missed working days',
    'Advanced timetable review, conflict repair, Timetable Activation Flow, exports',
    'Holiday override creation and notice preview',
    'RBAC/tenant validation checklist and pilot readiness gates',
];

export function canOpenRoute(userRole: PortalRole, allowedRoles: PortalRole[]) {
    return allowedRoles.includes(userRole);
}
