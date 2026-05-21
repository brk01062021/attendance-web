import { portalRoutes, type PortalRole } from '@/lib/routes';
import type { LoginRequest, WebPortalUser } from '@/types/auth';

const STORAGE_KEY = 'vidyasetu-web-user';

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
}

export function clearStoredUser() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isValidTenantUser(user: WebPortalUser | null): user is WebPortalUser {
  return Boolean(user?.userId && user?.schoolId && user?.role && ['ADMIN', 'PRINCIPAL'].includes(user.role));
}

export function isRouteAllowedForRole(pathname: string, role: PortalRole) {
  const route = portalRoutes.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  if (!route) return true;
  return route.roles.includes(role);
}

export function createDevUser(login: LoginRequest): WebPortalUser {
  return {
    userId: login.role === 'ADMIN' ? 1 : 2,
    schoolId: 1,
    role: login.role,
    displayName: login.role === 'ADMIN' ? 'VidyaSetu Admin' : 'School Principal',
    schoolName: 'VidyaSetu Demo School',
    token: 'dev-web-token',
  };
}
