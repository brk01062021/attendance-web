import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedPrefixes = [
  '/admin',
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
  '/school-intelligence'
];

const adminOnlyPrefixes = [
  '/admin',
  '/teacher-assignments'
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedPrefixes.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const rawSession =
    request.cookies.get('vidyasetu_session')?.value;

  if (!rawSession) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  try {
    const session = JSON.parse(
      decodeURIComponent(rawSession)
    ) as {
      role?: string;
      schoolId?: string;
    };

    const role = session.role?.toUpperCase();
    const schoolId = session.schoolId?.toUpperCase();

    if (
      !role ||
      !schoolId ||
      !/^[A-Z0-9]{4}$/.test(schoolId)
    ) {
      return NextResponse.redirect(
        new URL('/login', request.url)
      );
    }

    const isAdminOnly =
      adminOnlyPrefixes.some(
        (prefix) =>
          pathname === prefix ||
          pathname.startsWith(`${prefix}/`)
      );

    if (isAdminOnly && role !== 'ADMIN') {
      return NextResponse.redirect(
        new URL('/principal', request.url)
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};