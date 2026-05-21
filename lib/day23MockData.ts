import type { Day23ModuleConfig } from '@/types/erp';

const attendanceColumns = [
    { key: 'scope', label: 'Scope' },
    { key: 'present', label: 'Present' },
    { key: 'absent', label: 'Absent' },
    { key: 'coverage', label: 'Coverage' },
    { key: 'action', label: 'Action' },
];

export const day23Modules: Record<string, Day23ModuleConfig> = {
    intelligence: {
        eyebrow: 'DAY 23 EXECUTIVE INTELLIGENCE',
        title: 'School Intelligence Command Center',
        description:
            'Principal/Admin executive web view for attendance pulse, timetable readiness, teacher load, risk alerts, and rollout decisions before pilot school onboarding.',
        metrics: [
            { label: 'Attendance Pulse', value: '94.2%', helper: 'Demo operational average', tone: 'success' },
            { label: 'Risk Alerts', value: '12', helper: 'Students/teachers needing review', tone: 'warning' },
            { label: 'Timetable Batch', value: 'Latest', helper: 'Use latest generated/published batch' },
            { label: 'Rollout', value: 'Day 23', helper: 'Web ERP intelligence layer' },
        ],
        filters: [
            { label: 'Academic Year', value: '2026-2027' },
            { label: 'View', value: 'Whole School' },
            { label: 'Role', value: 'Principal/Admin' },
        ],
        actions: [
            { icon: '📊', title: 'Review attendance pulse', body: 'Open daily, weekly, and monthly school-level attendance summaries.', status: 'Ready' },
            { icon: '⚠️', title: 'Check risk alerts', body: 'Track absenteeism, workload, replacement gaps, and operational exceptions.', status: 'Next API wiring' },
            { icon: '🕒', title: 'Validate timetable readiness', body: 'Confirm latest batch, conflicts, publish status, and export readiness.', status: 'Ready' },
        ],
        tableTitle: 'Executive operations snapshot',
        tableDescription: 'Day 23 web ERP gives principals a clean decision table before live API cards are wired.',
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
        validationTitle: 'Executive validation checklist',
        validations: [
            { label: 'Dark dashboard theme aligned', status: 'Done', tone: 'success' },
            { label: 'Role-aware navigation kept', status: 'Done', tone: 'success' },
            { label: 'Live chart wiring', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Connect principal summary API', 'Add risk alert drilldowns', 'Add timetable readiness chart'],
    },
    attendanceReports: {
        eyebrow: 'DAY 23 REPORTING WORKFLOW',
        title: 'Attendance Reports Center',
        description:
            'Premium gold workflow for whole-school attendance summary, class/section reports, student drilldown, date filters, and future PDF/Excel export.',
        metrics: [
            { label: 'School Summary', value: 'Ready', helper: 'Cards and table prepared', tone: 'success' },
            { label: 'Class Reports', value: 'Ready', helper: 'Class/section view shell', tone: 'success' },
            { label: 'Student Drilldown', value: 'Next', helper: 'Search API connection' },
            { label: 'Exports', value: 'Next', helper: 'PDF/Excel actions' },
        ],
        filters: [
            { label: 'Report Date', value: 'Today' },
            { label: 'Range', value: 'Daily / Weekly / Monthly' },
            { label: 'Class/Section', value: 'All' },
        ],
        actions: [
            { icon: '🏫', title: 'Load school summary', body: 'Show total, present, absent, late, coverage, pending, and attendance percentage.', status: 'UI ready' },
            { icon: '👥', title: 'Compare classes', body: 'Prepared for class-wise and section-wise comparison analytics.', status: 'UI ready' },
            { icon: '🔎', title: 'Find student record', body: 'Search by student name, admission number, or roll number.', status: 'Next API' },
        ],
        tableTitle: 'Attendance report preview',
        tableDescription: 'Static preview matching the backend report model already available in mobile/backend work.',
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
            { label: 'Real API table data', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Wire /analytics and /attendance report APIs', 'Add export buttons', 'Add student search result panel'],
    },
    teacherReports: {
        eyebrow: 'DAY 23 TEACHER INTELLIGENCE',
        title: 'Teacher Reports Center',
        description:
            'Single-teacher lookup foundation for classes, sections, subjects, leave history, replacement load, exam result actions, and attendance submission audit.',
        metrics: [
            { label: 'Teacher Lookup', value: 'Ready', helper: 'Search panel prepared', tone: 'success' },
            { label: 'Workload', value: 'Watch', helper: 'Replacement fairness focus', tone: 'warning' },
            { label: 'Leave History', value: 'Next', helper: 'API drilldown' },
            { label: 'Submissions', value: 'Next', helper: 'Attendance/exam actions' },
        ],
        filters: [
            { label: 'Teacher', value: 'Search/select' },
            { label: 'Month', value: 'Current month' },
            { label: 'Report Type', value: 'Workload + Leaves' },
        ],
        actions: [
            { icon: '👨‍🏫', title: 'Open teacher profile', body: 'Show classes, sections, subjects, and academic assignment history.', status: 'UI ready' },
            { icon: '🔁', title: 'Review replacement load', body: 'Track assigned replacement count and fatigue risk.', status: 'UI ready' },
            { icon: '📚', title: 'Open submissions', body: 'Buttons for previous exams and last attendance submission.', status: 'Next API' },
        ],
        tableTitle: 'Teacher report preview',
        tableDescription: 'Day 23 layout prepares teacher reports before live backend hookup.',
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
            { label: 'Detail pages', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Wire teacher search API', 'Add teacher detail route', 'Add leave/replacement drilldowns'],
    },
    teacherLeave: {
        eyebrow: 'DAY 23 LEAVE OPERATIONS',
        title: 'Teacher Leave Planning',
        description:
            'Web workflow foundation for one-day/multi-day leave, replacement preview, approval decisions, smart assignment, and workload protection.',
        metrics: [
            { label: 'Pending Leaves', value: 'API', helper: 'Backend-ready flow' },
            { label: 'Smart Match', value: 'Ready', helper: 'Best Match / Same Class / Others', tone: 'success' },
            { label: 'Workload Guard', value: 'Next', helper: 'Fatigue protection' },
            { label: 'Audit', value: 'Next', helper: 'Approval history' },
        ],
        filters: [
            { label: 'Leave Date', value: 'Today / date range' },
            { label: 'Teacher', value: 'All teachers' },
            { label: 'Status', value: 'Pending approval' },
        ],
        actions: [
            { icon: '📝', title: 'Submit leave', body: 'Capture leave date range, teacher, periods affected, and reason.', status: 'Next form' },
            { icon: '🔁', title: 'Preview replacements', body: 'Show grouped options by Best Match, Same Class, and Others.', status: 'Ready concept' },
            { icon: '✅', title: 'Approve and assign', body: 'Admin/principal approves and assigns replacement with audit trail.', status: 'Next API' },
        ],
        tableTitle: 'Leave planning preview',
        tableDescription: 'Prepared for pending leave, affected periods, and replacement decisions.',
        columns: [
            { key: 'teacher', label: 'Teacher' },
            { key: 'date', label: 'Date' },
            { key: 'periods', label: 'Affected Periods' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { teacher: 'Anita Sharma', date: 'Today', periods: 'P2, P4', status: 'Needs replacement' },
            { teacher: 'Meena Rao', date: 'Tomorrow', periods: 'P1', status: 'Preview ready' },
            { teacher: 'Ravi Kumar', date: 'This week', periods: 'P5', status: 'Pending approval' },
        ],
        validationTitle: 'Leave workflow validation',
        validations: [
            { label: 'Multi-day workflow represented', status: 'Done', tone: 'success' },
            { label: 'Replacement grouping captured', status: 'Done', tone: 'success' },
            { label: 'Approval API wiring', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Add leave form', 'Wire preview replacements API', 'Add approval + audit log'],
    },
    teacherAssignments: {
        eyebrow: 'DAY 23 ACADEMIC SETUP',
        title: 'Teacher Assignment Center',
        description:
            'Teacher-subject-class-section mapping workflow for import validation, class-wise teacher pools, timetable generation, and workload balancing.',
        metrics: [
            { label: 'Teacher Pools', value: 'Excel', helper: 'Class-wise pools', tone: 'success' },
            { label: 'Mappings', value: 'Ready', helper: 'Subject + section shell' },
            { label: 'Validation', value: 'Next', helper: 'Conflict checks' },
            { label: 'Timetable Input', value: 'Ready', helper: 'Generation dependency', tone: 'success' },
        ],
        filters: [
            { label: 'Class', value: '1 to 10' },
            { label: 'Section', value: 'Auto-load' },
            { label: 'Teacher Pool', value: 'Default class pool' },
        ],
        actions: [
            { icon: '🧑‍🏫', title: 'Manage teacher pool', body: 'One pool per class from Excel import or manual setup.', status: 'Ready concept' },
            { icon: '📘', title: 'Map subjects', body: 'Assign teachers to subject, class, section, and weekly period rules.', status: 'Next form' },
            { icon: '⚖️', title: 'Balance workload', body: 'Prevent overload before timetable generation starts.', status: 'Next API' },
        ],
        tableTitle: 'Assignment preview',
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
            { label: 'Real validation service', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Add teacher pool CRUD', 'Connect Excel import review', 'Add mapping validation'],
    },
    timetableGenerate: {
        eyebrow: 'DAY 23 AUTO TIMETABLE',
        title: 'Generate Timetable',
        description:
            'Production-friendly web generation flow using class checklist, auto-loaded sections, default teacher pool, rules validation, and smart timetable generation.',
        metrics: [
            { label: 'Class Selector', value: 'Ready', helper: 'Checklist model', tone: 'success' },
            { label: 'Teacher Pool', value: 'Auto', helper: 'Default pool source', tone: 'success' },
            { label: 'Rules Engine', value: 'Ready', helper: 'Backend available' },
            { label: 'Conflict Check', value: 'Ready', helper: 'Review after generate' },
        ],
        filters: [
            { label: 'Classes', value: 'Checklist' },
            { label: 'Sections', value: 'Auto-load from classes' },
            { label: 'Generation Mode', value: 'Annual / Monthly / Custom' },
        ],
        actions: [
            { icon: '☑️', title: 'Select classes', body: 'Dropdown checklist with automatic sections based on selected classes.', status: 'Ready concept' },
            { icon: '👥', title: 'Use default teacher pool', body: 'Avoid manual teacher IDs; use school onboarding teacher pools.', status: 'Ready concept' },
            { icon: '🧠', title: 'Generate smart timetable', body: 'Equal theory distribution, labs/sports rules, conflict detection, and workload balance.', status: 'Next API' },
        ],
        tableTitle: 'Generation plan preview',
        tableDescription: 'Day 23 prepares the web generation command center before enabling POST generation.',
        columns: [
            { key: 'input', label: 'Input' },
            { key: 'source', label: 'Source' },
            { key: 'rule', label: 'Rule' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { input: 'Classes', source: 'Admin checklist', rule: 'Multi-select', status: 'Ready' },
            { input: 'Sections', source: 'ClassSections tab/API', rule: 'Auto-load', status: 'Ready' },
            { input: 'Teacher Pools', source: 'TeacherPools tab/API', rule: 'Default pool', status: 'Ready' },
        ],
        validationTitle: 'Generation validation',
        validations: [
            { label: 'No manual teacher ID dependency', status: 'Done', tone: 'success' },
            { label: 'Class checklist represented', status: 'Done', tone: 'success' },
            { label: 'POST generation wiring', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Add generation form controls', 'Wire smart generation API', 'Redirect to operations latest batch'],
    },
    timetableOperations: {
        eyebrow: 'DAY 23 TIMETABLE OPERATIONS',
        title: 'Timetable Operations Center',
        description:
            'Web batch center for latest timetable batch, review, conflict center, workload intelligence, repair, publish, export, archive, and rollout readiness.',
        metrics: [
            { label: 'Latest Batch', value: 'API', helper: 'Use latest generated/published batch', tone: 'success' },
            { label: 'Conflicts', value: '0', helper: 'Target before publish', tone: 'success' },
            { label: 'Publish Lock', value: 'Next', helper: 'Protect approved timetable', tone: 'warning' },
            { label: 'Exports', value: 'Next', helper: 'PDF/Excel actions' },
        ],
        filters: [
            { label: 'Batch ID', value: 'Latest generated batch' },
            { label: 'View', value: 'Review / Conflicts / Workload' },
            { label: 'Status', value: 'Draft / Published' },
        ],
        actions: [
            { icon: '🗂️', title: 'Load latest batch', body: 'Principal/Admin should not manually guess batch IDs in production.', status: 'Next API' },
            { icon: '🛠️', title: 'Repair conflicts', body: 'Open conflict center and auto repair until hard conflicts reach zero.', status: 'Ready concept' },
            { icon: '📤', title: 'Publish and export', body: 'Publish timetable, lock changes, then export PDF/Excel for school use.', status: 'Next API' },
        ],
        tableTitle: 'Batch operations preview',
        tableDescription: 'Latest-batch workflow prevents confusion between old and newly generated timetable batches.',
        columns: [
            { key: 'batch', label: 'Batch' },
            { key: 'entries', label: 'Entries' },
            { key: 'conflicts', label: 'Conflicts' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { batch: 'Latest generated', entries: '144', conflicts: '0 target', status: 'Ready for review' },
            { batch: 'Published batch', entries: '144', conflicts: '0', status: 'Visible after publish' },
            { batch: 'Archived batch', entries: 'History', conflicts: 'Audit', status: 'Future' },
        ],
        validationTitle: 'Operations validation',
        validations: [
            { label: 'Latest batch requirement captured', status: 'Done', tone: 'success' },
            { label: 'Publish/export workflow represented', status: 'Done', tone: 'success' },
            { label: 'Live operations API wiring', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Add latest-batch API call', 'Add publish locking', 'Add PDF/Excel export buttons'],
    },
    importSchoolData: {
        eyebrow: 'DAY 23 SCHOOL ONBOARDING',
        title: 'Import School Data',
        description:
            'Excel-first onboarding engine for pilot schools with mandatory holidays first, users, parents, teachers, class sections, subjects, teacher pools, and timetable-ready validation.',
        metrics: [
            { label: 'Workbook', value: 'One', helper: 'Per school', tone: 'success' },
            { label: 'Holidays', value: 'First', helper: 'Mandatory prerequisite', tone: 'warning' },
            { label: 'Teacher Pools', value: 'Ready', helper: 'Class-wise pool model', tone: 'success' },
            { label: 'Validation', value: 'Next', helper: 'Preview before save' },
        ],
        filters: [
            { label: 'Tenant', value: 'One school' },
            { label: 'Workbook Stage', value: 'Upload → Review → Generate' },
            { label: 'Required First', value: 'Annual holidays' },
        ],
        actions: [
            { icon: '📅', title: 'Import holidays first', body: 'Academic year dates, working days, school timings, periods, holidays, and half days.', status: 'Required' },
            { icon: '👨‍👩‍👧', title: 'Import users', body: 'Students, parents, teachers, and verified parent-student links.', status: 'Next API' },
            { icon: '🕒', title: 'Prepare timetable inputs', body: 'Teacher pools, assignments, subjects, class sections, and academic rules.', status: 'Ready concept' },
        ],
        tableTitle: 'Workbook tab checklist',
        tableDescription: 'Day 23 web onboarding keeps the Excel workflow simple for non-technical school staff.',
        columns: [
            { key: 'tab', label: 'Workbook Tab' },
            { key: 'purpose', label: 'Purpose' },
            { key: 'required', label: 'Required' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { tab: 'SchoolProfile', purpose: 'Tenant setup', required: 'Yes', status: 'Planned' },
            { tab: 'AnnualHolidays', purpose: 'Academic calendar', required: 'First', status: 'Mandatory' },
            { tab: 'TeacherPools', purpose: 'Auto timetable input', required: 'Yes', status: 'Ready concept' },
        ],
        validationTitle: 'Onboarding validation',
        validations: [
            { label: 'Holidays-first flow enforced in plan', status: 'Done', tone: 'success' },
            { label: 'Teacher pool tabs represented', status: 'Done', tone: 'success' },
            { label: 'Upload parser', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Add workbook upload UI', 'Add validation summary screen', 'Add tenant creation workflow'],
    },
    notices: {
        eyebrow: 'DAY 23 COMMUNICATIONS',
        title: 'School Notice Center',
        description:
            'Admin/Principal web notice workflow for holiday alerts, school achievements, student achievements, parent notifications, and role-targeted announcements.',
        metrics: [
            { label: 'Notice Types', value: 'Multi', helper: 'Holiday/alert/achievement', tone: 'success' },
            { label: 'Audience', value: 'Role', helper: 'Parents/students/teachers' },
            { label: 'Media', value: 'Next', helper: 'Images optional' },
            { label: 'Push', value: 'Next', helper: 'Notification center' },
        ],
        filters: [
            { label: 'Notice Type', value: 'Holiday / Alert / Achievement' },
            { label: 'Audience', value: 'All / Parents / Teachers / Students' },
            { label: 'Publish Date', value: 'Immediate / Scheduled' },
        ],
        actions: [
            { icon: '📣', title: 'Create announcement', body: 'School-wide notices and operational alerts.', status: 'Next form' },
            { icon: '🏆', title: 'Share achievements', body: 'School and student excellence updates for families.', status: 'Ready concept' },
            { icon: '🔔', title: 'Notify parents', body: 'Future push notification workflow for holidays, reports, and updates.', status: 'Next API' },
        ],
        tableTitle: 'Notice preview',
        tableDescription: 'Prepared communication categories for MVP pilot launch.',
        columns: [
            { key: 'type', label: 'Type' },
            { key: 'audience', label: 'Audience' },
            { key: 'delivery', label: 'Delivery' },
            { key: 'status', label: 'Status' },
        ],
        rows: [
            { type: 'Holiday Alert', audience: 'Parents + Students', delivery: 'App notification', status: 'Next API' },
            { type: 'School Achievement', audience: 'All', delivery: 'Notice center', status: 'Ready concept' },
            { type: 'Academic Alert', audience: 'Parents', delivery: 'Push + portal', status: 'Future' },
        ],
        validationTitle: 'Notice validation',
        validations: [
            { label: 'Achievement categories captured', status: 'Done', tone: 'success' },
            { label: 'Parent notification plan captured', status: 'Done', tone: 'success' },
            { label: 'Create/publish API', status: 'Next', tone: 'warning' },
        ],
        nextSteps: ['Add notice create form', 'Add image upload option', 'Wire notification backend'],
    },
};
