export type PortalRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT';

export type PortalRoute = {
  label: string;
  href: string;
  icon: string;
  description: string;
  roles: PortalRole[];
  group: 'Home' | 'Daily Work' | 'Reports' | 'Setup';
};

export const portalRoutes: PortalRoute[] = [
  { icon: '🏠', label: 'Home', href: '/admin', description: 'Admin operations', roles: ['ADMIN'], group: 'Home' },
  { icon: '🏠', label: 'Home', href: '/principal', description: 'Principal operations', roles: ['PRINCIPAL'], group: 'Home' },
  { icon: '🏠', label: 'Home', href: '/teacher', description: 'Teacher workspace', roles: ['TEACHER'], group: 'Home' },
  { icon: '🏠', label: 'Home', href: '/student', description: 'Student portal', roles: ['STUDENT'], group: 'Home' },

  { icon: '📝', label: 'Leave Enquiry', href: '/teacher/leave-enquiry', description: 'Request and track status', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '✅', label: 'Take Attendance', href: '/teacher/attendance', description: 'Daily attendance shortcut', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '📅', label: 'My Timetable', href: '/teacher/timetable', description: 'Schedule and replacements', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '📚', label: 'My Classes', href: '/teacher/classes', description: 'Assigned classes', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '✅', label: 'Bulk Attendance', href: '/teacher/attendance-bulk', description: 'Missed attendance recovery', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '🧾', label: 'Results Submission', href: '/teacher/results', description: 'Exam entry', roles: ['TEACHER'], group: 'Reports' },
  { icon: '📊', label: 'My Attendance', href: '/student/attendance', description: 'Attendance overview', roles: ['STUDENT'], group: 'Daily Work' },
  { icon: '🕒', label: 'My Timetable', href: '/student/timetable', description: 'Published timetable', roles: ['STUDENT'], group: 'Daily Work' },
  { icon: '📘', label: 'Exam Results', href: '/student/results', description: 'Academic results', roles: ['STUDENT'], group: 'Reports' },
  { icon: '📣', label: 'School Notices', href: '/student/notices', description: 'Notices and holidays', roles: ['STUDENT'], group: 'Daily Work' },

  { icon: '🧠', label: 'School Intelligence', href: '/school-intelligence', description: 'Executive insights', roles: ['ADMIN', 'PRINCIPAL'], group: 'Daily Work' },
  { icon: '📊', label: 'Attendance Reports', href: '/reports/attendance', description: 'Attendance records', roles: ['ADMIN', 'PRINCIPAL'], group: 'Reports' },
  { icon: '🩹', label: 'Recover Missed Attendance', href: '/attendance-recovery', description: 'Validate and submit missed attendance', roles: ['ADMIN', 'PRINCIPAL'], group: 'Daily Work' },
  { icon: '👨‍🏫', label: 'Teacher Reports', href: '/reports/teachers', description: 'Teacher records', roles: ['ADMIN', 'PRINCIPAL'], group: 'Reports' },
  { icon: '📈', label: 'Operational Analytics', href: '/analytics', description: 'Trends and risk', roles: ['ADMIN', 'PRINCIPAL'], group: 'Reports' },
  { icon: '🗓️', label: 'Leave Approvals', href: '/teacher-leave', description: 'Approve enquiries', roles: ['ADMIN', 'PRINCIPAL'], group: 'Daily Work' },
  { icon: '🕒', label: 'Generate Timetable', href: '/timetable/generate', description: 'Auto timetable', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🗂️', label: 'Timetable Operations', href: '/timetable/operations', description: 'Publish and export', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🕒', label: 'Active Published Timetable', href: '/timetable/active-published', description: 'Latest published timetable viewer', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '📥', label: 'Import Existing Timetable', href: '/timetable/import-existing', description: 'Upload and publish active school timetable', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🎯', label: 'Workspace Setup', href: '/workspace-setup', description: 'School profile and setup unlock', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🏥', label: 'Workspace Health', href: '/workspace-health', description: 'Activation and Go-Live readiness', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '📥', label: 'Import School Data', href: '/import-school-data', description: 'Excel onboarding and workbook commit', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🧩', label: 'Teacher Assignments', href: '/teacher-assignments', description: 'Class mapping', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🎌', label: 'Holiday Calendar', href: '/holiday-calendar', description: 'Calendar overrides', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🎉', label: 'School Activities', href: '/school-activities', description: 'Feed, gallery and memories', roles: ['ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'], group: 'Daily Work' },
  { icon: '📝', label: 'Activity Approvals', href: '/school-activities/approvals', description: 'Review media and approve activities', roles: ['ADMIN', 'PRINCIPAL'], group: 'Daily Work' },
  { icon: '📣', label: 'Create Notice', href: '/school-notices', description: 'Announcements', roles: ['ADMIN', 'PRINCIPAL'], group: 'Daily Work' },
  { icon: '🛡️', label: 'System Operations', href: '/production-hardening', description: 'Role Access Control', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
];
