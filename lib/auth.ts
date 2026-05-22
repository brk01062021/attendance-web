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
  const exactRoute = portalRoutes.find((item) => pathname === item.href);
  if (exactRoute) {
    return exactRoute.roles.includes(role);
  }

  const nestedRoute = [...portalRoutes]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname.startsWith(`${item.href}/`));

  if (!nestedRoute) return true;
  return nestedRoute.roles.includes(role);
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

export function mapLoginResponseToUser(response: any) {
  return {
    id: response?.userId || "1",
    name: response?.name || "Admin User",
    email: response?.email || "admin@vidyasetu.co",
    role: response?.role || "ADMIN",
    schoolId: response?.schoolId || "DEMO_SCHOOL",
    schoolName: response?.schoolName || "VidyaSetu Demo School",
    token: response?.token || "demo-token",
  };
}