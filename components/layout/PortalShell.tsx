'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearStoredUser, getStoredUser } from '@/lib/auth';
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
                                        eyebrow = 'DAY 24 WEB ERP DEVELOPMENT',
                                        children,
                                        variant = 'dark',
                                    }: PortalShellProps) {
    const router = useRouter();
    const [user, setUser] = useState<WebPortalUser | null>(null);

    useEffect(() => {
        const storedUser = getStoredUser();
        if (!storedUser) {
            router.replace('/login');
            return;
        }
        setUser(storedUser);
    }, [router]);

    const effectiveRole = user?.role || role;

    function logout() {
        clearStoredUser();
        router.push('/login');
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
                        <div className="user-chip">{user?.displayName || effectiveRole}</div>
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
