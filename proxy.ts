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
  '/school-intelligence',
];

const roleHome: Record<string, string> = {
  ADMIN: '/admin',
  PRINCIPAL: '/principal',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

const roleAllowedPrefixes: Record<string, string[]> = {
  ADMIN: [
    '/admin',
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
    '/school-intelligence',
  ],
  PRINCIPAL: [
    '/principal',
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
    '/school-intelligence',
  ],
  TEACHER: ['/teacher', '/attendance-import'],
  STUDENT: ['/student'],
};

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedPrefixes.some((prefix) => matchesPrefix(pathname, prefix));

  if (!isProtectedRoute) return NextResponse.next();

  const rawSession = request.cookies.get('vidyasetu_session')?.value;
  if (!rawSession) return redirectToLogin(request, pathname);

  try {
    const session = JSON.parse(decodeURIComponent(rawSession)) as { role?: string; schoolId?: string };
    const role = String(session.role || '').toUpperCase();
    const schoolId = String(session.schoolId || '').toUpperCase();

    if (!roleAllowedPrefixes[role] || !/^[A-Z0-9]{4}$/.test(schoolId)) {
      return redirectToLogin(request, pathname);
    }

    const allowed = roleAllowedPrefixes[role].some((prefix) => matchesPrefix(pathname, prefix));
    if (!allowed) {
      return NextResponse.redirect(new URL(roleHome[role] || '/login', request.url));
    }

    const response = NextResponse.next();
    response.headers.set('x-vidyasetu-school-id', schoolId);
    response.headers.set('x-vidyasetu-role', role);
    return response;
  } catch {
    return redirectToLogin(request, pathname);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
