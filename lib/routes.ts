export type PortalRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT';

export type PortalRoute = {
  label: string;
  href: string;
  icon: string;
  description: string;
  roles: PortalRole[];
};

export const portalRoutes: PortalRoute[] = [
  { icon: '🏠', label: 'Home', href: '/admin', description: 'Admin command center', roles: ['ADMIN'] },
  { icon: '🏠', label: 'Home', href: '/principal', description: 'Principal command center', roles: ['PRINCIPAL'] },
  { icon: '🏠', label: 'Home', href: '/teacher', description: 'Teacher web workspace', roles: ['TEACHER'] },
  { icon: '🏠', label: 'Home', href: '/student', description: 'Student academic portal', roles: ['STUDENT'] },
  { icon: '📝', label: 'Request Leave Enquiry', href: '/teacher/leave-enquiry', description: 'Teacher leave enquiry request', roles: ['TEACHER'] },
  { icon: '✅', label: 'Bulk Attendance Import', href: '/teacher/attendance-bulk', description: '7-working-days missed attendance recovery', roles: ['TEACHER'] },
  { icon: '🧠', label: 'School Intelligence', href: '/school-intelligence', description: 'Executive insights', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '📈', label: 'Operational Analytics', href: '/analytics', description: 'Trends, comparisons, risk and workload', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '📊', label: 'Attendance Reports', href: '/reports/attendance', description: 'School attendance reports', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '👨‍🏫', label: 'Teacher Reports', href: '/reports/teachers', description: 'Teacher workload and records', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🗓️', label: 'Leave Approvals', href: '/teacher-leave', description: 'Approve teacher leave enquiries', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🧩', label: 'Teacher Assignments', href: '/teacher-assignments', description: 'Subject and class mapping', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🕒', label: 'Generate Timetable', href: '/timetable/generate', description: 'Auto timetable engine', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🗂️', label: 'Timetable Operations', href: '/timetable/operations', description: 'Batch center, publish, export', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '📥', label: 'Import School Data', href: '/import-school-data', description: 'Excel onboarding engine', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🎌', label: 'Holiday Calendar', href: '/holiday-calendar', description: 'Academic calendar overrides', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '📣', label: 'Create School Notice', href: '/school-notices', description: 'Announcements and alerts', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🛡️', label: 'Production Hardening', href: '/production-hardening', description: 'RBAC, tenant, deployment gates', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🚀', label: 'Pilot Readiness', href: '/pilot-readiness', description: '14-day school pilot launch board', roles: ['ADMIN', 'PRINCIPAL'] },
];
