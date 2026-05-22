import { portalRoutes, type PortalRole } from '@/lib/routes';
import type { LoginApiResponse, LoginRequest, WebPortalUser, WebUserRole } from '@/types/auth';

const STORAGE_KEY = 'vidyasetu-web-user';
const SESSION_COOKIE = 'vidyasetu_session';

function normalizeRole(role?: string, fallback: WebUserRole = 'ADMIN'): WebUserRole {
  return role?.toUpperCase() === 'PRINCIPAL' ? 'PRINCIPAL' : fallback;
}

function normalizeSchoolId(value?: string | number | null) {
  const schoolId = String(value || 'DEMO').trim().toUpperCase();
  return /^[A-Z0-9]{4}$/.test(schoolId) ? schoolId : 'DEMO';
}

export function getStoredUser(): WebPortalUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WebPortalUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function storeUser(user: WebPortalUser) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify({ role: user.role, schoolId: user.schoolId, userId: user.userId }))}; path=/; max-age=28800; SameSite=Lax`;
}

export function clearStoredUser() {
  window.localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function isValidTenantUser(user: WebPortalUser | null): user is WebPortalUser {
  return Boolean(user?.userId && user?.schoolId && /^[A-Z0-9]{4}$/.test(user.schoolId) && user?.role && ['ADMIN', 'PRINCIPAL'].includes(user.role));
}

export function isRouteAllowedForRole(pathname: string, role: PortalRole) {
  const exactRoute = portalRoutes.find((item) => pathname === item.href);
  if (exactRoute) return exactRoute.roles.includes(role);
  const nestedRoute = [...portalRoutes].sort((a, b) => b.href.length - a.href.length).find((item) => pathname.startsWith(`${item.href}/`));
  if (!nestedRoute) return true;
  return nestedRoute.roles.includes(role);
}

export function createDevUser(login: LoginRequest): WebPortalUser {
  return {
    userId: login.role === 'ADMIN' ? 1 : 2,
    schoolId: normalizeSchoolId(login.schoolId),
    internalSchoolId: 1,
    role: login.role,
    displayName: login.role === 'ADMIN' ? 'VidyaSetu Admin' : 'School Principal',
    schoolName: 'VidyaSetu Demo School',
    token: 'dev-web-token',
  };
}

export function mapLoginResponseToUser(response: LoginApiResponse, requestedRole: WebUserRole): WebPortalUser {
  const role = normalizeRole(String(response?.role || requestedRole), requestedRole);
  return {
    userId: Number(response?.userId || 1),
    internalSchoolId: typeof response?.schoolId === 'number' ? response.schoolId : 1,
    schoolId: normalizeSchoolId(response?.externalSchoolId || response?.schoolCode || response?.schoolId),
    role,
    displayName: response?.displayName || response?.teacherName || (role === 'ADMIN' ? 'VidyaSetu Admin' : 'School Principal'),
    schoolName: response?.schoolName || 'VidyaSetu Demo School',
    token: response?.token || 'demo-token',
  };
}
