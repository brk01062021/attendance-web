'use client';

import Link from 'next/link';
import type { PortalRole } from '@/lib/routes';

type NotificationBellProps = {
  role: PortalRole;
};

function notificationHref(role: string) {
  if (role === 'TEACHER') return '/teacher/notifications';
  if (role === 'STUDENT') return '/student/notices';
  if (role === 'PARENT') return '/parent/timetable';
  return '/school-notices';
}

function notificationLabel(role: string) {
  if (role === 'ADMIN') return 'Admin notifications';
  if (role === 'PRINCIPAL') return 'Principal notifications';
  if (role === 'TEACHER') return 'Teacher notifications';
  if (role === 'STUDENT') return 'Student notifications';
  if (role === 'PARENT') return 'Parent notifications';
  return 'School notifications';
}

export default function NotificationBell({ role }: NotificationBellProps) {
  const effectiveRole = String(role || '').toUpperCase();

  return (
    <Link
      href={notificationHref(effectiveRole)}
      aria-label={notificationLabel(effectiveRole)}
      title={notificationLabel(effectiveRole)}
      className="relative grid h-10 w-10 place-items-center rounded-full border border-amber-300/25 bg-amber-300/10 text-lg text-amber-100 shadow-lg shadow-black/20 transition hover:bg-amber-300/20"
    >
      <span aria-hidden="true">🔔</span>
      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border border-slate-950 bg-rose-400" />
    </Link>
  );
}
