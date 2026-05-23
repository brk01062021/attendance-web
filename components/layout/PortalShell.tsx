'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearStoredUser, getStoredUser, homeRouteForRole, isRouteAllowedForRole, isValidTenantUser } from '@/lib/auth';
import type { WebPortalUser } from '@/types/auth';
import type { PortalRole } from '@/lib/routes';
import Sidebar from './Sidebar';

type PortalShellProps = {
    role: PortalRole;
    title: string;
    subtitle: string;
    eyebrow?: string;
    children: React.ReactNode;
    variant?: 'dark' | 'gold';
};

export default function PortalShell({
                                        role,
                                        title,
                                        subtitle,
                                        eyebrow = 'DAY 25 WEB ERP DEVELOPMENT',
                                        children,
                                        variant = 'dark',
                                    }: PortalShellProps) {
    const router = useRouter();
    const pathname = usePathname();
    const isClient = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    );

    const user = useMemo<WebPortalUser | null>(() => {
        if (!isClient) {
            return null;
        }
        return getStoredUser();
    }, [isClient]);

    const accessState = useMemo(() => {
        if (!user) {
            return {
                allowed: false,
                redirectTo: '/login',
                message: 'Checking secure portal access...',
            };
        }
        if (!isValidTenantUser(user)) {
            return {
                allowed: false,
                redirectTo: '/login',
                message: 'Portal session is missing role or school_id. Redirecting to login.',
            };
        }
        if (!isRouteAllowedForRole(pathname, user.role)) {
            return {
                allowed: false,
                redirectTo: user.role === 'ADMIN' ? '/admin' : '/principal',
                message: 'This role cannot access the requested ERP page. Redirecting to the correct dashboard.',
            };
        }
        return {
            allowed: true,
            redirectTo: '',
            message: '',
        };
    }, [pathname, user]);

    useEffect(() => {
        if (user && !isValidTenantUser(user)) {
            clearStoredUser();
        }
        if (!accessState.allowed && accessState.redirectTo) {
            router.replace(accessState.redirectTo);
        }
    }, [accessState.allowed, accessState.redirectTo, router, user]);

    const effectiveRole = user?.role || role;

    function logout() {
        clearStoredUser();
        router.push('/login');
    }

    if (!user || !accessState.allowed) {
        return (
            <main className={`portal-shell portal-shell--loading ${variant === 'gold' ? 'page-gold' : 'page-dark'}`}>
                <section className="guard-card gold-panel">{accessState.message}</section>
            </main>
        );
    }

    return (
        <main className={`portal-shell ${variant === 'gold' ? 'page-gold' : 'page-dark'}`}>
            <Sidebar role={effectiveRole} />
            <section className="portal-content">
                <header className="portal-header">
                    <div>
                        <p className="eyebrow">{eyebrow}</p>
                        <h1>{title}</h1>
                        <span>{subtitle}</span>
                    </div>
                    <div className="header-actions">
                        <div className="user-chip">{user.displayName}</div>
                        <div className="user-chip">school_id: {user.schoolId}</div>
                        <button className="logout-button" type="button" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </header>
                {children}
            </section>
        </main>
    );
}
