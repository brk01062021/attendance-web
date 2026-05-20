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
            <Link className="brand-block" href={role === 'ADMIN' ? '/admin' : '/principal'}>
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
                Day 22 Web ERP foundation uses the same mobile branding, splash-dark dashboard pattern, and splash-gold workflow identity.
            </div>
        </aside>
    );
}
