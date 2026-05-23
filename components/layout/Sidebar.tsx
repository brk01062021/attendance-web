'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portalRoutes, type PortalRole } from '@/lib/routes';

type SidebarProps = {
    role: PortalRole;
};

export default function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const items = portalRoutes.filter((item) => item.roles.includes(role));

    return (
        <aside className="sidebar">
            <Link className="brand-block" href={role === 'ADMIN' ? '/admin' : role === 'PRINCIPAL' ? '/principal' : role === 'TEACHER' ? '/teacher' : '/student'}>
                <Image className="brand-mark" src="/branding/app-icon.png" alt="VidyaSetu" width={52} height={52} priority />
                <div>
                    <strong>VidyaSetu</strong>
                    <span>portal.vidyasetu.co</span>
                </div>
            </Link>

            <nav className="nav-list" aria-label={`${role} navigation`}>
                {items.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link key={`${role}-${item.href}`} className={active ? 'nav-item nav-item--active' : 'nav-item'} href={item.href}>
                            <span className="nav-icon">{item.icon}</span>
                            <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                Day 30 prepares the first realistic school pilot with mobile-first daily workflows, web-first bulk administration, RBAC, tenant checks, imports, timetable lifecycle, holiday overrides, notices, and deployment readiness.
            </div>
        </aside>
    );
}
