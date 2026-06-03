'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portalRoutes, type PortalRole } from '@/lib/routes';

type SidebarProps = {
  role: PortalRole;
};

const groupOrder = ['Home', 'Daily Work', 'Reports', 'Setup'] as const;

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = portalRoutes.filter((item) => item.roles.includes(role));
  const homeHref = role === 'ADMIN' ? '/admin' : role === 'PRINCIPAL' ? '/principal' : role === 'TEACHER' ? '/teacher' : role === 'PARENT' ? '/parent' : '/student';

  return (
    <aside className="sidebar">
      <Link className="brand-block" href={homeHref}>
        <Image className="brand-mark" src="/branding/app-icon.png" alt="VidyaSetu" width={52} height={52} priority />
        <div>
          <strong>VidyaSetu ERP</strong>
          <span>portal.vidyasetu.co</span>
        </div>
      </Link>

      <nav className="nav-list" aria-label={`${role} navigation`}>
        {groupOrder.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (!groupItems.length) {
            return null;
          }
          return (
            <div className="nav-group" key={`${role}-${group}`}>
              {group !== 'Home' && <p className="nav-group-label">{group}</p>}
              {groupItems.map((item, index) => {
                const isHomeItem = item.label === 'Home';
                const active = pathname === item.href && (isHomeItem || item.href !== homeHref);
                return (
                  <Link key={`${role}-${item.href}-${item.label}-${index}`} className={active ? 'nav-item nav-item--active' : 'nav-item'} href={item.href}>
                    <span className="nav-icon">{item.icon}</span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
