'use client';

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
      <div className="brand-block">
        <div className="brand-mark">VS</div>
        <div>
          <strong>VidyaSetu</strong>
          <span>portal.vidyasetu.co</span>
        </div>
      </div>

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
    </aside>
  );
}
