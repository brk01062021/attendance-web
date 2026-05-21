import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const protectedPrefixes = [
    '/admin',
    '/principal',
    '/analytics',
    '/attendance-import',
    '/attendance-reports',
    '/holiday-calendar',
    '/import-school-data',
    '/pilot-readiness',
    '/production-hardening',
    '/school-notices',
    '/teacher-reports',
    '/timetable-operations',
];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
