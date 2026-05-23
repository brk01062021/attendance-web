import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedPrefixes = [
  '/admin',
  '/principal',
  '/teacher',
  '/student',
  '/analytics',
  '/attendance-import',
  '/holiday-calendar',
  '/import-school-data',
  '/pilot-readiness',
  '/production-hardening',
  '/school-notices',
  '/teacher-assignments',
  '/teacher-leave',
  '/timetable',
  '/reports',
  '/rollout-readiness',
  '/school-intelligence'
];

const roleHome: Record<string, string> = {
  ADMIN: '/admin',
  PRINCIPAL: '/principal',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

const roleAllowedPrefixes: Record<string, string[]> = {
  ADMIN: ['/admin', '/analytics', '/attendance-import', '/holiday-calendar', '/import-school-data', '/pilot-readiness', '/production-hardening', '/school-notices', '/teacher-assignments', '/teacher-leave', '/timetable', '/reports', '/rollout-readiness', '/school-intelligence'],
  PRINCIPAL: ['/principal', '/analytics', '/attendance-import', '/holiday-calendar', '/import-school-data', '/pilot-readiness', '/production-hardening', '/school-notices', '/teacher-assignments', '/teacher-leave', '/timetable', '/reports', '/rollout-readiness', '/school-intelligence'],
  TEACHER: ['/teacher'],
  STUDENT: ['/student'],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtectedRoute) return NextResponse.next();

  const rawSession = request.cookies.get('vidyasetu_session')?.value;
  if (!rawSession) return NextResponse.redirect(new URL('/login', request.url));

  try {
    const session = JSON.parse(decodeURIComponent(rawSession)) as { role?: string; schoolId?: string };
    const role = session.role?.toUpperCase();
    const schoolId = session.schoolId?.toUpperCase();

    if (!role || !schoolId || !/^[A-Z0-9]{4}$/.test(schoolId) || !roleAllowedPrefixes[role]) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const allowed = roleAllowedPrefixes[role].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
    if (!allowed) return NextResponse.redirect(new URL(roleHome[role], request.url));

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
