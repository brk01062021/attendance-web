import { portalRoutes, type PortalRole } from '@/lib/routes';
import type { LoginApiResponse, LoginRequest, WebPortalUser, WebUserRole } from '@/types/auth';

const STORAGE_KEY = 'vidyasetu-web-user';
const SESSION_COOKIE = 'vidyasetu_session';

function normalizeRole(role?: string, fallback: WebUserRole = 'ADMIN'): WebUserRole {
  const normalized = role?.toUpperCase();
  if (normalized === 'PRINCIPAL' || normalized === 'TEACHER' || normalized === 'STUDENT' || normalized === 'PARENT') return normalized;
  return fallback;
}

export function homeRouteForRole(role: WebUserRole) {
  if (role === 'PRINCIPAL') return '/principal';
  if (role === 'TEACHER') return '/teacher';
  if (role === 'STUDENT') return '/student';
  if (role === 'PARENT') return '/parent';
  return '/admin';
}

function normalizeSchoolId(value?: string | number | null) {
  const schoolId = String(value || '').trim().toUpperCase();
  if (schoolId === 'DEMO') return 'BRK1';
  return /^[A-Z0-9]{4}$/.test(schoolId) ? schoolId : 'BRK1';
}

function defaultDisplayName(role: WebUserRole, username?: string) {
  const cleanName = username?.trim();
  if (cleanName && cleanName.toLowerCase() !== 'admin') return cleanName;
  if (role === 'ADMIN') return 'School Admin';
  if (role === 'PRINCIPAL') return 'School Principal';
  if (role === 'TEACHER') return 'Teacher';
  if (role === 'PARENT') return 'Parent';
  return 'Student';
}

function resolveSchoolNameForTenant(schoolId: string, suppliedName?: string | null) {
  const cleanName = String(suppliedName || '').trim();

  if (schoolId === 'BRK1') {
    return 'BRK International School';
  }

  if (
    cleanName &&
    !/demo/i.test(cleanName) &&
    !new RegExp(`^${schoolId}\\s+School$`, 'i').test(cleanName)
  ) {
    return cleanName;
  }

  return `${schoolId} School`;
}

function normalizeUser(user: WebPortalUser): WebPortalUser {
  const role = normalizeRole(user.role, 'ADMIN');
  const schoolId = normalizeSchoolId(user.schoolId);
  const schoolName = resolveSchoolNameForTenant(schoolId, user.schoolName);
  const displayName = user.displayName && !((role === 'TEACHER' || role === 'STUDENT') && /admin/i.test(user.displayName))
    ? user.displayName
    : defaultDisplayName(role);

  return {
    ...user,
    role,
    schoolId,
    schoolName,
    displayName,
    teacherId: role === 'TEACHER' ? Number(user.teacherId || user.userId || 1) : null,
    teacherName: user.teacherName || (role === 'TEACHER' ? displayName : null),
    studentId: role === 'STUDENT' || role === 'PARENT' ? Number(user.studentId || user.userId || 201) : null,
    studentName: user.studentName || (role === 'STUDENT' || role === 'PARENT' ? displayName : null),
    className: user.className || null,
    section: user.section || null,
    forcePasswordChange: Boolean(user.forcePasswordChange),
  };
}

export function getStoredUser(): WebPortalUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const normalized = normalizeUser(JSON.parse(raw) as WebPortalUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function storeUser(user: WebPortalUser) {
  const normalized = normalizeUser(user);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify({ role: normalized.role, schoolId: normalized.schoolId, userId: normalized.userId }))}; path=/; max-age=28800; SameSite=Lax`;
}

export function clearStoredUser() {
  window.localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function isValidTenantUser(user: WebPortalUser | null): user is WebPortalUser {
  return Boolean(user?.userId && user?.schoolId && user.schoolId !== 'DEMO' && /^[A-Z0-9]{4}$/.test(user.schoolId) && user?.role && ['ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'].includes(user.role));
}

const hiddenRoleRoutes: Record<string, PortalRole[]> = {
  '/teacher/notifications': ['TEACHER'],
};

export function isRouteAllowedForRole(pathname: string, role: PortalRole) {
  const hiddenRoute = Object.entries(hiddenRoleRoutes).find(([href]) => pathname === href || pathname.startsWith(`${href}/`));
  if (hiddenRoute) return hiddenRoute[1].includes(role);

  const exactRoute = portalRoutes.find((item) => pathname === item.href);
  if (exactRoute) return exactRoute.roles.includes(role);
  const nestedRoute = [...portalRoutes].sort((a, b) => b.href.length - a.href.length).find((item) => pathname.startsWith(`${item.href}/`));
  if (!nestedRoute) return true;
  return nestedRoute.roles.includes(role);
}

export function createDevUser(login: LoginRequest): WebPortalUser {
  const role = login.role;
  const schoolId = normalizeSchoolId(login.schoolId);
  return normalizeUser({
    userId: role === 'ADMIN' ? 1 : role === 'PRINCIPAL' ? 2 : role === 'TEACHER' ? 1 : role === 'PARENT' ? 101 : 201,
    schoolId,
    internalSchoolId: 1,
    role,
    displayName: defaultDisplayName(role, login.username),
    schoolName: `${schoolId} School`,
    token: 'dev-web-token',
    teacherId: role === 'TEACHER' ? 1 : null,
    teacherName: role === 'TEACHER' ? defaultDisplayName(role, login.username) : null,
    studentId: role === 'STUDENT' || role === 'PARENT' ? 201 : null,
    studentName: role === 'STUDENT' || role === 'PARENT' ? defaultDisplayName(role, login.username) : null,
    className: null,
    section: null,
    forcePasswordChange: false,
  });
}

export function mapLoginResponseToUser(response: LoginApiResponse, requestedRole: WebUserRole): WebPortalUser {
  const role = normalizeRole(String(response?.role || requestedRole), requestedRole);
  const schoolId = normalizeSchoolId(response?.externalSchoolId || response?.schoolCode || response?.schoolId);
  return normalizeUser({
    userId: Number(response?.userId || (role === 'TEACHER' ? 1 : role === 'STUDENT' ? 201 : role === 'PARENT' ? 101 : 1)),
    internalSchoolId: typeof response?.schoolId === 'number' ? response.schoolId : 1,
    schoolId,
    role,
    displayName: response?.displayName || response?.teacherName || response?.studentName || defaultDisplayName(role),
    schoolName: response?.schoolName || `${schoolId} School`,
    token: response?.token || 'demo-token',
    teacherId: response?.teacherId ?? (role === 'TEACHER' ? Number(response?.userId || 1) : null),
    teacherName: response?.teacherName || (role === 'TEACHER' ? (response?.displayName || defaultDisplayName(role)) : null),
    studentId: response?.studentId ?? (role === 'STUDENT' || role === 'PARENT' ? Number(response?.userId || 201) : null),
    studentName: response?.studentName || (role === 'STUDENT' || role === 'PARENT' ? (response?.displayName || defaultDisplayName(role)) : null),
    className: role === 'STUDENT' || role === 'PARENT' ? (response?.className || null) : null,
    section: role === 'STUDENT' || role === 'PARENT' ? (response?.section || null) : null,
    forcePasswordChange: Boolean(response?.forcePasswordChange),
  });
}
