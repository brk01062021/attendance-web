'use client';

import { useRouter } from 'next/navigation';
import { clearStoredUser } from '@/lib/auth';
import type { PortalRole } from '@/lib/routes';
import Sidebar from './Sidebar';

type PortalShellProps = {
  role: PortalRole;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function PortalShell({ role, title, subtitle, children }: PortalShellProps) {
  const router = useRouter();

  function logout() {
    clearStoredUser();
    router.push('/login');
  }

  return (
    <main className="portal-shell page-dark">
      <Sidebar role={role} />
      <section className="portal-content">
        <header className="portal-header">
          <div>
            <p className="eyebrow">DAY 21 WEB ERP FOUNDATION</p>
            <h1>{title}</h1>
            <span>{subtitle}</span>
          </div>
          <button className="logout-button" type="button" onClick={logout}>Logout</button>
        </header>
        {children}
      </section>
    </main>
  );
}
