export type PortalRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT';

export type PortalRoute = {
  label: string;
  href: string;
  icon: string;
  description: string;
  roles: PortalRole[];
  group: 'Home' | 'Daily Work' | 'Reports' | 'Setup' | 'Pilot';
};

export const portalRoutes: PortalRoute[] = [
  { icon: '🏠', label: 'Home', href: '/admin', description: 'Admin operations', roles: ['ADMIN'], group: 'Home' },
  { icon: '🏠', label: 'Home', href: '/principal', description: 'Principal operations', roles: ['PRINCIPAL'], group: 'Home' },
  { icon: '🏠', label: 'Home', href: '/teacher', description: 'Teacher workspace', roles: ['TEACHER'], group: 'Home' },
  { icon: '🏠', label: 'Home', href: '/student', description: 'Student portal', roles: ['STUDENT'], group: 'Home' },

  { icon: '📝', label: 'Leave Enquiry', href: '/teacher/leave-enquiry', description: 'Request and track status', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '✅', label: 'Take Attendance', href: '/teacher', description: 'Daily attendance shortcut', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '📅', label: 'My Timetable', href: '/teacher', description: 'Schedule and replacements', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '📚', label: 'My Classes', href: '/teacher', description: 'Assigned classes', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '✅', label: 'Bulk Attendance', href: '/teacher/attendance-bulk', description: 'Missed attendance recovery', roles: ['TEACHER'], group: 'Daily Work' },
  { icon: '🧾', label: 'Results Submission', href: '/teacher', description: 'Exam entry', roles: ['TEACHER'], group: 'Reports' },
  { icon: '🔔', label: 'Notifications', href: '/teacher/leave-enquiry#notifications', description: 'Leave and workflow updates', roles: ['TEACHER'], group: 'Reports' },

  { icon: '📊', label: 'My Attendance', href: '/student', description: 'Attendance overview', roles: ['STUDENT'], group: 'Daily Work' },
  { icon: '🕒', label: 'My Timetable', href: '/student', description: 'Published timetable', roles: ['STUDENT'], group: 'Daily Work' },
  { icon: '📘', label: 'Exam Results', href: '/student', description: 'Academic results', roles: ['STUDENT'], group: 'Reports' },
  { icon: '📣', label: 'School Notices', href: '/student', description: 'Notices and holidays', roles: ['STUDENT'], group: 'Daily Work' },

  { icon: '🧠', label: 'School Intelligence', href: '/school-intelligence', description: 'Executive insights', roles: ['ADMIN', 'PRINCIPAL'], group: 'Daily Work' },
  { icon: '📊', label: 'Attendance Reports', href: '/reports/attendance', description: 'Attendance records', roles: ['ADMIN', 'PRINCIPAL'], group: 'Reports' },
  { icon: '👨‍🏫', label: 'Teacher Reports', href: '/reports/teachers', description: 'Teacher records', roles: ['ADMIN', 'PRINCIPAL'], group: 'Reports' },
  { icon: '📈', label: 'Operational Analytics', href: '/analytics', description: 'Trends and risk', roles: ['ADMIN', 'PRINCIPAL'], group: 'Reports' },
  { icon: '🗓️', label: 'Leave Approvals', href: '/teacher-leave', description: 'Approve enquiries', roles: ['ADMIN', 'PRINCIPAL'], group: 'Daily Work' },
  { icon: '🕒', label: 'Generate Timetable', href: '/timetable/generate', description: 'Auto timetable', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🗂️', label: 'Timetable Operations', href: '/timetable/operations', description: 'Publish and export', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '📥', label: 'Import School Data', href: '/import-school-data', description: 'Excel onboarding', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🧩', label: 'Teacher Assignments', href: '/teacher-assignments', description: 'Class mapping', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '🎌', label: 'Holiday Calendar', href: '/holiday-calendar', description: 'Calendar overrides', roles: ['ADMIN', 'PRINCIPAL'], group: 'Setup' },
  { icon: '📣', label: 'Create Notice', href: '/school-notices', description: 'Announcements', roles: ['ADMIN', 'PRINCIPAL'], group: 'Daily Work' },
  { icon: '🛡️', label: 'Production Hardening', href: '/production-hardening', description: 'RBAC and release gates', roles: ['ADMIN', 'PRINCIPAL'], group: 'Pilot' },
  { icon: '🚀', label: 'Pilot Readiness', href: '/pilot-readiness', description: 'Testing board', roles: ['ADMIN', 'PRINCIPAL'], group: 'Pilot' },
];
