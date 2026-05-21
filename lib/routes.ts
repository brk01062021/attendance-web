export type PortalRole = 'ADMIN' | 'PRINCIPAL';

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
  { icon: '🧠', label: 'School Intelligence', href: '/principal/intelligence', description: 'Executive insights', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '📈', label: 'Operational Analytics', href: '/analytics', description: 'Trends, comparisons, risk and workload', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '📊', label: 'Attendance Reports', href: '/reports/attendance', description: 'School attendance reports', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '👨‍🏫', label: 'Teacher Reports', href: '/reports/teachers', description: 'Teacher workload and records', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🗓️', label: 'Teacher Leave Planning', href: '/teacher-leave', description: 'Leave and replacements', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🧩', label: 'Teacher Assignments', href: '/teacher-assignments', description: 'Subject and class mapping', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🕒', label: 'Generate Timetable', href: '/timetable/generate', description: 'Auto timetable engine', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🗂️', label: 'Timetable Operations', href: '/timetable/operations', description: 'Batch center, publish, export', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '📥', label: 'Import School Data', href: '/import-school-data', description: 'Excel onboarding engine', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '📣', label: 'Create School Notice', href: '/school-notices', description: 'Announcements and alerts', roles: ['ADMIN', 'PRINCIPAL'] },
  { icon: '🚀', label: 'Rollout Readiness', href: '/rollout-readiness', description: 'Pilot launch and production QA gates', roles: ['ADMIN', 'PRINCIPAL'] },
];
