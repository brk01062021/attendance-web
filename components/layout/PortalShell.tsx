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

export default function PortalShell({ role, title, subtitle, eyebrow = 'DAY 22 WEB ERP FOUNDATION', children, variant = 'dark' }: PortalShellProps) {
  const router = useRouter();
  const [user] = useState<WebPortalUser | null>(() => getStoredUser());
  const effectiveRole = user?.role || role;

  useEffect(() => {
    if (!getStoredUser()) router.replace('/login');
  }, [router]);

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
              <button className="logout-button" type="button" onClick={logout}>Logout</button>
            </div>
          </header>
          {children}
        </section>
      </main>
  );
}
