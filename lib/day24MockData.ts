import type { Day23ModuleConfig } from '@/types/erp';

const attendanceColumns = [
    { key: 'scope', label: 'Scope' },
    { key: 'present', label: 'Present' },
    { key: 'absent', label: 'Absent' },
    { key: 'coverage', label: 'Coverage' },
    { key: 'action', label: 'Action' },
];

export const day24Modules: Record<string, Day23ModuleConfig> = {
    intelligence: {
        eyebrow: 'SCHOOL INTELLIGENCE',
        title: 'School Intelligence Command Center',
        description:
            'Principal/Admin executive web view for attendance pulse, timetable readiness, teacher load, risk alerts, and rollout decisions before pilot school onboarding.',
        metrics: [
            { label: 'Attendance Pulse', value: '94.2%', helper: 'Current operational average', tone: 'success' },
            { label: 'Risk Alerts', value: '12', helper: 'Students/teachers needing review', tone: 'warning' },
            { label: 'Timetable Batch', value: 'Latest', helper: 'Use latest generated/published batch' },
            { label: 'Rollout', value: 'Operational', helper: 'Pilot readiness layer' },
        ],
        filters: [
            { label: 'Academic Year', value: '2026-2027' },
            { label: 'View', value: 'Whole School' },
            { label: 'Role', value: 'Principal/Admin' },
        ],
        actions: [
            { icon: '📊', title: 'Review attendance pulse', body: 'Open daily, weekly, and monthly school-level attendance summaries.', status: 'Ready' },
            { icon: '⚠️', title: 'Check risk alerts', body: 'Track absenteeism, workload, replacement gaps, and operational exceptions.', status: 'Connected' },
            { icon: '🕒', title: 'Validate timetable readiness', body: 'Confirm latest batch, conflicts, publish status, and export readiness.', status: 'Ready' },
        ],
        tableTitle: 'Operations snapshot',
        tableDescription: 'Operational web ERP gives principals a clean decision table before live data is available.',
        columns: [
            { key: 'area', label: 'Area' },
            { key: 'signal', label: 'Signal' },
            { key: 'owner', label: 'Owner' },
            { key: 'decision', label: 'Decision' },
        ],
        rows: [
            { area: 'Attendance', signal: 'Stable but needs class drilldown', owner: 'Principal', decision: 'Review reports' },
            { area: 'Timetable', signal: 'Latest batch required before publish', owner: 'Admin', decision: 'Open operations' },
            { area: 'Teachers', signal: 'Replacement load must stay balanced', owner: 'Principal/Admin', decision: 'Review workload' },
        ],
        validationTitle: 'Leadership validation checklist',
        validations: [
            { label: 'Dark dashboard theme aligned', status: 'Done', tone: 'success' },
            { label: 'Role-aware navigation kept', status: 'Done', tone: 'success' },
            { label: 'Chart integration', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Connect principal summary service', 'Add risk alert drilldowns', 'Add timetable readiness chart'],
    },
    attendanceReports: {
        eyebrow: 'Reporting workflow',
        title: 'Attendance Reports Center',
        description:
            'Premium gold workflow for whole-school attendance summary, class/section reports, student drilldown, date filters, and PDF/Workbook export support.',
        metrics: [
            { label: 'School Summary', value: 'Ready', helper: 'Cards and table prepared', tone: 'success' },
            { label: 'Class Reports', value: 'Ready', helper: 'Class/section view shell', tone: 'success' },
            { label: 'Student Drilldown', value: 'Pending', helper: 'Selector connection' },
            { label: 'Exports', value: 'Pending', helper: 'PDF/Workbook actions' },
        ],
        filters: [
            { label: 'Report Date', value: 'Today' },
            { label: 'Range', value: 'Daily / Weekly / Monthly' },
            { label: 'Class/Section', value: 'All' },
        ],
        actions: [
            { icon: '🏫', title: 'Load school summary', body: 'Show total, present, absent, late, coverage, pending, and attendance percentage.', status: 'Available' },
            { icon: '👥', title: 'Compare classes', body: 'Available for class-wise and section-wise comparison analytics.', status: 'Available' },
            { icon: '🔎', title: 'Find student record', body: 'Search by student name, admission number, or roll number.', status: 'Connected' },
        ],
        tableTitle: 'Attendance report summary',
        tableDescription: 'Static summary matching the attendance operations already available in current operational workflows.',
        columns: attendanceColumns,
        rows: [
            { scope: 'Whole School', present: '1,118', absent: '64', coverage: '96%', action: 'Review summary' },
            { scope: 'Class 10-A', present: '42', absent: '3', coverage: '100%', action: 'Open class report' },
            { scope: 'Class 9-B', present: '38', absent: '5', coverage: '92%', action: 'Check absentees' },
        ],
        validationTitle: 'Reports validation checklist',
        validations: [
            { label: 'Gold workflow theme', status: 'Done', tone: 'success' },
            { label: 'Filters represented clearly', status: 'Done', tone: 'success' },
            { label: 'Live table data', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Connect analytics and attendance report services', 'Add export buttons', 'Add student search result panel'],
    },
    teacherReports: {
        eyebrow: 'TEACHER REPORTS',
        title: 'Teacher Reports Center',
        description:
            'Single-teacher lookup foundation for classes, sections, subjects, leave history, replacement load, exam result actions, and attendance submission audit.',
        metrics: [
            { label: 'Teacher Lookup', value: 'Ready', helper: 'Search panel prepared', tone: 'success' },
            { label: 'Workload', value: 'Watch', helper: 'Replacement fairness focus', tone: 'warning' },
            { label: 'Leave History', value: 'Pending', helper: 'Operational drilldown' },
            { label: 'Submissions', value: 'Pending', helper: 'Attendance/exam actions' },
        ],
        filters: [
            { label: 'Teacher', value: 'Search/select' },
            { label: 'Month', value: 'Current month' },
            { label: 'Report Type', value: 'Workload + Leaves' },
        ],
        actions: [
            { icon: '👨‍🏫', title: 'Open teacher profile', body: 'Show classes, sections, subjects, and academic assignment history.', status: 'Available' },
            { icon: '🔁', title: 'Review replacement load', body: 'Track assigned replacement count and fatigue risk.', status: 'Available' },
            { icon: '📚', title: 'Open submissions', body: 'Review recent academic submissions and attendance activity.', status: 'Connected' },
        ],
        tableTitle: 'Teacher report summary',
        tableDescription: 'Operational layout prepares teacher reports for current school operations.',
        columns: [
            { key: 'teacher', label: 'Teacher' },
            { key: 'classes', label: 'Classes' },
            { key: 'leave', label: 'Leaves' },
            { key: 'replacement', label: 'Replacement Load' },
        ],
        rows: [
            { teacher: 'Anita Sharma', classes: '10-A, 10-B', leave: '1 planned', replacement: '3 assignments' },
            { teacher: 'Ravi Kumar', classes: '9-A', leave: '0', replacement: '1 assignment' },
            { teacher: 'Meena Rao', classes: '8-A, 8-B', leave: '2 planned', replacement: '4 assignments' },
        ],
        validationTitle: 'Teacher report validation',
        validations: [
            { label: 'Teacher report spec represented', status: 'Done', tone: 'success' },
            { label: 'Replacement-load visibility', status: 'Done', tone: 'success' },
            { label: 'Detail workflow', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Connect teacher search service', 'Add teacher detail route', 'Add leave/replacement drilldowns'],
    },
    teacherLeave: {
        eyebrow: 'LEAVE OPERATIONS',
        title: 'Teacher Leave Planning',
        description:
            'Web workflow foundation for one-day/multi-day leave, replacement summary, approval decisions, smart assignment, and workload protection.',
        metrics: [
            { label: 'Pending Leaves', value: 'Service', helper: 'Operational flow' },
            { label: 'Smart Match', value: 'Ready', helper: 'Best Match / Same Class / Others', tone: 'success' },
            { label: 'Workload Guard', value: 'Pending', helper: 'Fatigue protection' },
            { label: 'Audit', value: 'Pending', helper: 'Approval history' },
        ],
        filters: [
            { label: 'Leave Date', value: 'Today / date range' },
            { label: 'Teacher', value: 'All teachers' },
            { label: 'Status', value: 'Pending approval' },
        ],
        actions: [
            { icon: '📝', title: 'Submit leave', body: 'Capture leave date range, teacher, periods affected, and reason.', status: 'Ready' },
            { icon: '🔁', title: 'Summary replacements', body: 'Show grouped options by Best Match, Same Class, and Others.', status: 'Operational' },
            { icon: '✅', title: 'Approve and assign', body: 'Admin/principal approves and assigns replacement with audit trail.', status: 'Connected' },
        ],
        tableTitle: 'Leave planning summary',
        tableDescription: 'Available for pending leave, affected periods, and replacement decisions.',
        columns: [
            { key: 'teacher', label: 'Teacher' },
            { key: 'date', label: 'Date' },
            { key: 'periods', label: 'Affected Periods' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { teacher: 'Anita Sharma', date: 'Today', periods: 'P2, P4', status: 'Needs replacement' },
            { teacher: 'Meena Rao', date: 'Tomorrow', periods: '', status: 'Summary ready' },
            { teacher: 'Ravi Kumar', date: 'This week', periods: 'P5', status: 'Pending approval' },
        ],
        validationTitle: 'Leave workflow validation',
        validations: [
            { label: 'Multi-day workflow represented', status: 'Done', tone: 'success' },
            { label: 'Replacement grouping captured', status: 'Done', tone: 'success' },
            { label: 'Approval workflow', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Add leave form', 'Connect replacement summary service', 'Add approval + audit log'],
    },
    teacherAssignments: {
        eyebrow: 'ACADEMIC SETUP',
        title: 'Teacher Assignment Center',
        description:
            'Teacher-subject-class-section mapping workflow for import validation, class-wise teacher pools, timetable generation, and workload balancing.',
        metrics: [
            { label: 'Teacher Pools', value: 'Workbook', helper: 'Class-wise pools', tone: 'success' },
            { label: 'Mappings', value: 'Ready', helper: 'Subject + section shell' },
            { label: 'Validation', value: 'Pending', helper: 'Conflict checks' },
            { label: 'Timetable Input', value: 'Ready', helper: 'Generation dependency', tone: 'success' },
        ],
        filters: [
            { label: 'Class', value: '1 to 10' },
            { label: 'Section', value: 'Auto-load' },
            { label: 'Teacher Pool', value: 'Default class pool' },
        ],
        actions: [
            { icon: '🧑‍🏫', title: 'Manage teacher pool', body: 'One pool per class from Workbook import or manual setup.', status: 'Operational' },
            { icon: '📘', title: 'Map subjects', body: 'Assign teachers to subject, class, section, and weekly period rules.', status: 'Ready' },
            { icon: '⚖️', title: 'Balance workload', body: 'Prevent overload before timetable generation starts.', status: 'Connected' },
        ],
        tableTitle: 'Assignment summary',
        tableDescription: 'Foundation for the TeacherPools, TeacherAssignments, Subjects, and ClassSections import tabs.',
        columns: [
            { key: 'class', label: 'Class' },
            { key: 'section', label: 'Section' },
            { key: 'subject', label: 'Subject' },
            { key: 'teacher', label: 'Teacher Pool' },
        ],
        rows: [
            { class: 'Class 1', section: 'A/B', subject: 'Core subjects', teacher: 'Pool 1' },
            { class: 'Class 2', section: 'A/B', subject: 'Core subjects', teacher: 'Pool 2' },
            { class: 'Class 10', section: 'A/B', subject: 'Math/Science', teacher: 'Senior pool' },
        ],
        validationTitle: 'Assignment validation',
        validations: [
            { label: 'Class-wise pool model', status: 'Done', tone: 'success' },
            { label: 'Auto timetable dependency captured', status: 'Done', tone: 'success' },
            { label: 'Validation service', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Add teacher pool CRUD', 'Connect Workbook import review', 'Add mapping validation'],
    },
    timetableGenerate: {
        eyebrow: 'AUTO TIMETABLE',
        title: 'Generate Timetable',
        description:
            'Production-friendly web generation flow using class checklist, auto-loaded sections, default teacher pool, rules validation, and smart timetable generation.',
        metrics: [
            { label: 'Class Selector', value: 'Ready', helper: 'Checklist model', tone: 'success' },
            { label: 'Teacher Pool', value: 'Auto', helper: 'Default pool source', tone: 'success' },
            { label: 'Rules Engine', value: 'Ready', helper: 'Validation service ready' },
            { label: 'Conflict Check', value: 'Ready', helper: 'Review after generate' },
        ],
        filters: [
            { label: 'Classes', value: 'Checklist' },
            { label: 'Sections', value: 'Auto-load from classes' },
            { label: 'Generation Mode', value: 'Annual / Monthly / Custom' },
        ],
        actions: [
            { icon: '☑️', title: 'Select classes', body: 'Dropdown checklist with automatic sections based on selected classes.', status: 'Operational' },
            { icon: '👥', title: 'Use default teacher pool', body: 'Avoid manual teacher IDs; use school onboarding teacher pools.', status: 'Operational' },
            { icon: '🧠', title: 'Generate smart timetable', body: 'Equal theory distribution, labs/sports rules, conflict detection, and workload balance.', status: 'Connected' },
        ],
        tableTitle: 'Generation plan summary',
        tableDescription: 'Operational prepares the web generation command center before starting timetable generation.',
        columns: [
            { key: 'input', label: 'Input' },
            { key: 'source', label: 'Source' },
            { key: 'rule', label: 'Rule' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { input: 'Classes', source: 'Admin checklist', rule: 'Multi-select', status: 'Ready' },
            { input: 'Sections', source: 'ClassSections workbook tab', rule: 'Auto-load', status: 'Ready' },
            { input: 'Teacher Pools', source: 'TeacherPools workbook tab', rule: 'Default pool', status: 'Ready' },
        ],
        validationTitle: 'Generation validation',
        validations: [
            { label: 'No manual teacher ID dependency', status: 'Done', tone: 'success' },
            { label: 'Class checklist represented', status: 'Done', tone: 'success' },
            { label: 'Generation service', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Add generation form controls', 'Connect smart generation service', 'Redirect to operations latest batch'],
    },
    timetableOperations: {
        eyebrow: 'TIMETABLE OPERATIONS',
        title: 'Timetable Operations Center',
        description:
            'Web batch center for latest timetable batch, review, conflict center, workload intelligence, repair, publish, export, archive, and rollout readiness.',
        metrics: [
            { label: 'Latest Batch', value: 'Service', helper: 'Use latest generated/published batch', tone: 'success' },
            { label: 'Conflicts', value: '0', helper: 'Target before publish', tone: 'success' },
            { label: 'Publish Lock', value: 'Pending', helper: 'Protect approved timetable', tone: 'warning' },
            { label: 'Exports', value: 'Pending', helper: 'PDF/Workbook actions' },
        ],
        filters: [
            { label: 'Batch ID', value: 'Latest generated batch' },
            { label: 'View', value: 'Review / Conflicts / Workload' },
            { label: 'Status', value: 'Draft / Published' },
        ],
        actions: [
            { icon: '🗂️', title: 'Load latest batch', body: 'Principal/Admin should not manually guess batch IDs in production.', status: 'Connected' },
            { icon: '🛠️', title: 'Repair conflicts', body: 'Open conflict center and auto repair until hard conflicts reach zero.', status: 'Operational' },
            { icon: '📤', title: 'Publish and export', body: 'Publish timetable, lock changes, then export PDF/Workbook for school use.', status: 'Connected' },
        ],
        tableTitle: 'Batch operations summary',
        tableDescription: 'Latest-batch workflow prevents confusion between old and newly generated timetable batches.',
        columns: [
            { key: 'batch', label: 'Batch' },
            { key: 'entries', label: 'Entries' },
            { key: 'conflicts', label: 'Conflicts' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { batch: 'Latest generated', entries: '144', conflicts: '0 target', status: 'Review' },
            { batch: 'Published batch', entries: '144', conflicts: '0', status: 'Visible after publish' },
            { batch: 'Archived batch', entries: 'History', conflicts: 'Audit', status: 'Future' },
        ],
        validationTitle: 'Operations validation',
        validations: [
            { label: 'Latest batch requirement captured', status: 'Done', tone: 'success' },
            { label: 'Publish/export workflow represented', status: 'Done', tone: 'success' },
            { label: 'Operations service', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Connect latest-batch service', 'Add publish locking', 'Add PDF/Workbook export buttons'],
    },
    importSchoolData: {
        eyebrow: 'SCHOOL ONBOARDING',
        title: 'Import School Data',
        description:
            'Workbook-first onboarding engine for pilot schools with mandatory holidays first, users, parents, teachers, class sections, subjects, teacher pools, and timetable-ready validation.',
        metrics: [
            { label: 'Workbook', value: 'One', helper: 'Per school', tone: 'success' },
            { label: 'Holidays', value: 'First', helper: 'Mandatory prerequisite', tone: 'warning' },
            { label: 'Teacher Pools', value: 'Ready', helper: 'Class-wise pool model', tone: 'success' },
            { label: 'Validation', value: 'Pending', helper: 'Summary before save' },
        ],
        filters: [
            { label: 'Tenant', value: 'One school' },
            { label: 'Workbook Stage', value: 'Upload → Review → Generate' },
            { label: 'Required First', value: 'Annual holidays' },
        ],
        actions: [
            { icon: '📅', title: 'Import holidays first', body: 'Academic year dates, working days, school timings, periods, holidays, and half days.', status: 'Required' },
            { icon: '👨‍👩‍👧', title: 'Import users', body: 'Students, parents, teachers, and verified parent-student links.', status: 'Connected' },
            { icon: '🕒', title: 'Prepare timetable inputs', body: 'Teacher pools, assignments, subjects, class sections, and academic rules.', status: 'Operational' },
        ],
        tableTitle: 'Workbook tab checklist',
        tableDescription: 'Operational web onboarding keeps the Workbook workflow simple for non-technical school staff.',
        columns: [
            { key: 'tab', label: 'Workbook Tab' },
            { key: 'purpose', label: 'Purpose' },
            { key: 'required', label: 'Required' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { tab: 'SchoolProfile', purpose: 'Tenant setup', required: 'Yes', status: 'Operational' },
            { tab: 'AnnualHolidays', purpose: 'Academic calendar', required: 'First', status: 'Mandatory' },
            { tab: 'TeacherPools', purpose: 'Auto timetable input', required: 'Yes', status: 'Operational' },
        ],
        validationTitle: 'Onboarding validation',
        validations: [
            { label: 'Holidays-first flow enforced in plan', status: 'Done', tone: 'success' },
            { label: 'Teacher pool tabs represented', status: 'Done', tone: 'success' },
            { label: 'Workbook parser', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Add workbook upload UI', 'Add validation summary screen', 'Add tenant creation workflow'],
    },
    notices: {
        eyebrow: 'COMMUNICATIONS',
        title: 'School Notice Center',
        description:
            'Admin/Principal web notice workflow for holiday alerts, school achievements, student achievements, parent notifications, and role-targeted announcements.',
        metrics: [
            { label: 'Notice Types', value: 'Multi', helper: 'Holiday/alert/achievement', tone: 'success' },
            { label: 'Audience', value: 'Role', helper: 'Parents/students/teachers' },
            { label: 'Media', value: 'Pending', helper: 'Images optional' },
            { label: 'Push', value: 'Pending', helper: 'Notification center' },
        ],
        filters: [
            { label: 'Notice Type', value: 'Holiday / Alert / Achievement' },
            { label: 'Audience', value: 'All / Parents / Teachers / Students' },
            { label: 'Publish Date', value: 'Immediate / Scheduled' },
        ],
        actions: [
            { icon: '📣', title: 'Create announcement', body: 'School-wide notices and operational alerts.', status: 'Ready' },
            { icon: '🏆', title: 'Share achievements', body: 'School and student excellence updates for families.', status: 'Operational' },
            { icon: '🔔', title: 'Notify parents', body: 'Future push notification workflow for holidays, reports, and updates.', status: 'Connected' },
        ],
        tableTitle: 'Notice summary',
        tableDescription: 'Available communication categories for MVP pilot launch.',
        columns: [
            { key: 'type', label: 'Type' },
            { key: 'audience', label: 'Audience' },
            { key: 'delivery', label: 'Delivery' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { type: 'Holiday Alert', audience: 'Parents + Students', delivery: 'App notification', status: 'Connected' },
            { type: 'School Achievement', audience: 'All', delivery: 'Notice center', status: 'Operational' },
            { type: 'Academic Alert', audience: 'Parents', delivery: 'Push + portal', status: 'Future' },
        ],
        validationTitle: 'Notice validation',
        validations: [
            { label: 'Achievement categories captured', status: 'Done', tone: 'success' },
            { label: 'Parent notification plan captured', status: 'Done', tone: 'success' },
            { label: 'Notice publishing service', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Add notice create form', 'Add image upload option', 'Connect notification service'],
    },
    analyticsHub: {
        eyebrow: 'OPERATIONAL ANALYTICS',
        title: 'Operational Analytics Hub',
        description:
            'Admin/Principal web analytics command center for attendance trends, class-section comparison, teacher load, replacement pressure, and executive attendance and workload insights.',
        metrics: [
            { label: 'Attendance Trend', value: 'Connected', helper: 'Daily/weekly/monthly toggle', tone: 'success' },
            { label: 'Class Compare', value: 'Ready', helper: 'Class vs section view', tone: 'success' },
            { label: 'Teacher Load', value: 'Watch', helper: 'Fatigue and replacement risk', tone: 'warning' },
            { label: 'Exports', value: 'Available', helper: 'PDF/Workbook snapshot actions' },
        ],
        filters: [
            { label: 'Period', value: 'Daily / Weekly / Monthly' },
            { label: 'Scope', value: 'School / Class / Section' },
            { label: 'Audience', value: 'Admin + Principal' },
        ],
        actions: [
            { icon: '📈', title: 'Review attendance trends', body: 'Track attendance movement across days, weeks, months, classes, and sections.', status: 'Available' },
            { icon: '⚖️', title: 'Compare operational load', body: 'Compare teacher workload, replacement counts, and risk signals before pilot rollout.', status: 'Available' },
            { icon: '📤', title: 'Prepare executive exports', body: 'Create shareable analytics snapshot for principal review and school review.', status: 'Available' },
        ],
        tableTitle: 'Analytics readiness summary',
        tableDescription: 'Operational adds a web analytics hub aligned with the mobile analytics and principal intelligence operations.',
        columns: [
            { key: 'area', label: 'Analytics Area' },
            { key: 'signal', label: 'Current Signal' },
            { key: 'owner', label: 'Owner' },
            { key: 'purpose', label: 'Operational Purpose' },
        ],
        rows: [
            { area: 'Attendance trend', signal: '94.2% monthly attendance movement', owner: 'Principal', purpose: 'School health snapshot' },
            { area: 'Class comparison', signal: '10-A vs 10-B ready', owner: 'Admin', purpose: 'Class-wise review' },
            { area: 'Teacher workload', signal: 'Replacement pressure watch', owner: 'Principal', purpose: 'Operational fairness' },
            { area: 'Risk alerts', signal: 'Absenteeism + overload candidates', owner: 'Principal/Admin', purpose: 'Action list' },
        ],
        validationTitle: 'Analytics validation checklist',
        validations: [
            { label: 'Web analytics module route added', status: 'Done', tone: 'success' },
            { label: 'Principal/Admin navigation added', status: 'Done', tone: 'success' },
            { label: 'Chart service', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Connect analytics services', 'Add chart components', 'Add export/share snapshot'],
    },
    rolloutReadiness: {
        eyebrow: 'Pilot rollout readiness',
        title: 'School Rollout Readiness Center',
        description:
            'School rollout readiness workspace for first-school pilot validation: tenant setup, Workbook imports, timetable publish, reports, notices, role access, and rollout checks.',
        metrics: [
            { label: 'Tenant Setup', value: 'Ready', helper: 'Single-school pilot model', tone: 'success' },
            { label: 'Imports', value: 'Review', helper: 'Workbook validation gate', tone: 'warning' },
            { label: 'Timetable', value: 'Publish-ready', helper: 'Latest batch workflow', tone: 'success' },
            { label: 'Pilot Pack', value: 'Operational', helper: 'School rollout checklist' },
        ],
        filters: [
            { label: 'Pilot Scope', value: 'One school first' },
            { label: 'Access Order', value: 'Principal/Admin first' },
            { label: 'Go-live Gate', value: 'Validate before parents' },
        ],
        actions: [
            { icon: '🏫', title: 'Create school tenant', body: 'Confirm School Access ID isolation, admin/principal accounts, and safe review data before real imports.', status: 'Ready' },
            { icon: '📥', title: 'Validate workbook import', body: 'School profile, holidays, students, parents, teachers, pools, subjects, and schedules.', status: 'Ready' },
            { icon: '✅', title: 'Approve pilot launch', body: 'Confirm timetable, reports, notices, RBAC, exports, and rollout flow before school access.', status: 'Approval Gate' },
        ],
        tableTitle: 'Pilot readiness gate',
        tableDescription: 'A simple non-technical checklist for the first institutional pilot before enabling broad access.',
        columns: [
            { key: 'gate', label: 'Gate' },
            { key: 'check', label: 'Validation Check' },
            { key: 'owner', label: 'Owner' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { gate: 'Tenant', check: 'School Access ID created and isolated', owner: 'Admin', status: 'Ready' },
            { gate: 'Import', check: 'Workbook summary reviewed', owner: 'Admin', status: 'Review needed' },
            { gate: 'Timetable', check: 'Latest batch published and locked', owner: 'Principal', status: 'Publish-ready' },
            { gate: 'Reports', check: 'Attendance and teacher reports visible', owner: 'Principal', status: 'Ready' },
            { gate: 'Access', check: 'Principal/Admin first, teachers next, parents later', owner: 'School', status: 'Operational' },
        ],
        validationTitle: 'Pilot launch validation',
        validations: [
            { label: 'One-school-first SaaS rollout captured', status: 'Done', tone: 'success' },
            { label: 'Principal/Admin first access captured', status: 'Done', tone: 'success' },
            { label: 'Access validation hardening', status: 'Pending configuration', tone: 'warning' },
        ],
        nextSteps: ['Add tenant creation flow', 'Connect workbook upload parser', 'Add final production QA checklist'],
    },

};
